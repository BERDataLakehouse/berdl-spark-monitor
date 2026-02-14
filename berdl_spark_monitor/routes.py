"""
Tornado proxy handlers for the Spark Monitor server extension.

Proxies requests to the Spark Cluster Manager API and Spark Master REST API,
neither of which are browser-reachable from within K8s.
"""

import json
import logging
import re
import time
from typing import Optional

import httpx
from jupyter_server.base.handlers import APIHandler
from jupyter_server.utils import url_path_join
import tornado.web

logger = logging.getLogger(__name__)

# In-memory caches
_username_cache: dict[str, tuple[str, float]] = {}  # token -> (username, expiry)
_app_id_cache: dict[str, tuple[str, float]] = {}  # master_url -> (app_id, expiry)

USERNAME_CACHE_TTL = 300  # 5 minutes
APP_ID_CACHE_TTL = 60  # 1 minute

HTTPX_CLIENT_KEY = "spark_monitor_httpx_client"


def sanitize_k8s_name(name: str) -> str:
    """
    Sanitize a string to be Kubernetes DNS-1123 subdomain compliant.

    Replicated from spark_cluster_manager/src/spark_manager.py:21-47.
    """
    sanitized = re.sub(r"[^a-z0-9.-]", "-", name.lower())
    sanitized = re.sub(r"^[^a-z0-9]+", "", sanitized)
    sanitized = re.sub(r"[^a-z0-9]+$", "", sanitized)
    sanitized = re.sub(r"-+", "-", sanitized)
    return sanitized[:253]


class SparkMonitorBaseHandler(APIHandler):
    """Base handler with shared auth, URL resolution, and proxy utilities."""

    @property
    def cluster_manager_url(self) -> Optional[str]:
        return self.settings.get("spark_monitor_cluster_manager_url")

    @property
    def namespace(self) -> Optional[str]:
        return self.settings.get("spark_monitor_namespace")

    @property
    def kbase_auth_url(self) -> str:
        return self.settings.get(
            "spark_monitor_kbase_auth_url", "https://ci.kbase.us/services/auth/"
        )

    @property
    def spark_master_port(self) -> str:
        return self.settings.get("spark_monitor_spark_master_port", "8090")

    @property
    def kbase_token(self) -> Optional[str]:
        """Extract KBase token from session cookies."""
        token = self.get_cookie("kbase_session")
        if not token:
            token = self.get_cookie("kbase_session_backup")
        return token

    @property
    def http_client(self) -> httpx.AsyncClient:
        return self.settings[HTTPX_CLIENT_KEY]

    def _require_token(self) -> Optional[str]:
        """Extract token or write 401 and return None."""
        token = self.kbase_token
        if not token:
            self.write_error_json("No KBase session token", 401)
        return token

    def _require_namespace(self) -> bool:
        """Check namespace config or write 503. Returns True if present."""
        if not self.namespace:
            self.write_error_json("Namespace not configured", 503)
            return False
        return True

    async def resolve_username(self, token: str) -> str:
        """Validate token against KBase Auth2 and return username. Cached 5min."""
        now = time.time()
        cached = _username_cache.get(token)
        if cached and cached[1] > now:
            return cached[0]

        resp = await self.http_client.get(
            f"{self.kbase_auth_url}api/V2/me",
            headers={"Authorization": token},
            timeout=10.0,
        )
        resp.raise_for_status()
        username = resp.json()["user"]

        _username_cache[token] = (username, now + USERNAME_CACHE_TTL)
        return username

    def spark_master_base_url(self, username: str) -> str:
        """Construct internal Spark Master URL from username and namespace."""
        sanitized = sanitize_k8s_name(username)
        return f"http://spark-master-{sanitized}.{self.namespace}:{self.spark_master_port}"

    async def resolve_app_id(self, master_base_url: str) -> Optional[str]:
        """Get the active Spark application ID from master /json/. Cached 60s."""
        now = time.time()
        cached = _app_id_cache.get(master_base_url)
        if cached and cached[1] > now:
            return cached[0]

        resp = await self.http_client.get(
            f"{master_base_url}/json/",
            timeout=10.0,
        )
        resp.raise_for_status()
        data = resp.json()

        active_apps = data.get("activeapps", [])
        if not active_apps:
            return None

        app_id = active_apps[0]["id"]
        _app_id_cache[master_base_url] = (app_id, now + APP_ID_CACHE_TTL)
        return app_id

    def write_json(self, data: dict, status: int = 200) -> None:
        self.set_status(status)
        self.set_header("Content-Type", "application/json")
        self.finish(json.dumps(data))

    def write_error_json(self, message: str, status: int = 500) -> None:
        self.set_status(status)
        self.set_header("Content-Type", "application/json")
        self.finish(json.dumps({"error": message}))

    async def _proxy_app_endpoint(self, path_suffix: str, empty_key: str) -> None:
        """Shared flow for executor/stage proxying: auth → username → app_id → GET → respond."""
        if not self._require_namespace():
            return
        token = self._require_token()
        if not token:
            return

        try:
            username = await self.resolve_username(token)
            master_url = self.spark_master_base_url(username)
            app_id = await self.resolve_app_id(master_url)

            if not app_id:
                self.write_json({empty_key: [], "message": "No active Spark session"})
                return

            resp = await self.http_client.get(
                f"{master_url}/api/v1/applications/{app_id}/{path_suffix}",
                timeout=10.0,
            )
            resp.raise_for_status()
            self.set_status(resp.status_code)
            self.set_header("Content-Type", "application/json")
            self.finish(resp.content)
        except httpx.HTTPStatusError as e:
            if e.response.status_code == 404:
                self.write_json({empty_key: [], "message": "No active Spark session"})
            else:
                self.write_error_json(str(e), e.response.status_code)
        except Exception as e:
            logger.exception("Error proxying %s", path_suffix)
            self.write_error_json(str(e))


class ClusterStatusHandler(SparkMonitorBaseHandler):
    """Proxies to Spark Cluster Manager /clusters for status bar data."""

    @tornado.web.authenticated
    async def get(self):
        if not self.cluster_manager_url:
            self.write_error_json("Cluster manager not configured", 503)
            return

        token = self._require_token()
        if not token:
            return

        try:
            resp = await self.http_client.get(
                f"{self.cluster_manager_url}/clusters",
                headers={"Authorization": f"Bearer {token}"},
                timeout=10.0,
            )
            resp.raise_for_status()
            self.set_status(resp.status_code)
            self.set_header("Content-Type", "application/json")
            self.finish(resp.content)
        except httpx.HTTPStatusError as e:
            self.write_error_json(str(e), e.response.status_code)
        except Exception as e:
            logger.exception("Error proxying cluster status")
            self.write_error_json(str(e))


class SparkClusterSummaryHandler(SparkMonitorBaseHandler):
    """Proxies to Spark Master /json/ for sidebar cluster overview."""

    @tornado.web.authenticated
    async def get(self):
        if not self._require_namespace():
            return
        token = self._require_token()
        if not token:
            return

        try:
            username = await self.resolve_username(token)
            master_url = self.spark_master_base_url(username)

            resp = await self.http_client.get(
                f"{master_url}/json/",
                timeout=10.0,
            )
            resp.raise_for_status()
            self.set_status(resp.status_code)
            self.set_header("Content-Type", "application/json")
            self.finish(resp.content)
        except httpx.HTTPStatusError as e:
            self.write_error_json(str(e), e.response.status_code)
        except Exception as e:
            logger.exception("Error proxying cluster summary")
            self.write_error_json(str(e))


class SparkExecutorsHandler(SparkMonitorBaseHandler):
    """Proxies to Spark Master /api/v1/applications/{appId}/executors."""

    @tornado.web.authenticated
    async def get(self):
        await self._proxy_app_endpoint("executors", "executors")


class SparkStagesHandler(SparkMonitorBaseHandler):
    """Proxies to Spark Master /api/v1/applications/{appId}/stages."""

    @tornado.web.authenticated
    async def get(self):
        await self._proxy_app_endpoint("stages", "stages")


def setup_handlers(
    web_app,
    cluster_manager_url: Optional[str] = None,
    namespace: Optional[str] = None,
    kbase_auth_url: str = "https://ci.kbase.us/services/auth/",
    spark_master_port: str = "8090",
) -> None:
    """Register proxy handlers with the Jupyter server."""
    host_pattern = ".*$"
    base_url = web_app.settings["base_url"]

    # Store config in settings for handler access
    web_app.settings["spark_monitor_cluster_manager_url"] = cluster_manager_url
    web_app.settings["spark_monitor_namespace"] = namespace
    web_app.settings["spark_monitor_kbase_auth_url"] = kbase_auth_url
    web_app.settings["spark_monitor_spark_master_port"] = spark_master_port

    # Shared httpx client — reused across requests, cleaned up on server shutdown
    if HTTPX_CLIENT_KEY not in web_app.settings:
        web_app.settings[HTTPX_CLIENT_KEY] = httpx.AsyncClient()

    handlers = []

    # Cluster manager route (status bar data)
    if cluster_manager_url:
        handlers.append((
            url_path_join(base_url, "berdl", "api", "spark-monitor", "status"),
            ClusterStatusHandler,
        ))

    # Spark Master routes (sidebar data)
    if namespace:
        handlers.extend([
            (
                url_path_join(base_url, "berdl", "api", "spark-monitor", "cluster"),
                SparkClusterSummaryHandler,
            ),
            (
                url_path_join(base_url, "berdl", "api", "spark-monitor", "app", "executors"),
                SparkExecutorsHandler,
            ),
            (
                url_path_join(base_url, "berdl", "api", "spark-monitor", "app", "stages"),
                SparkStagesHandler,
            ),
        ])

    if handlers:
        web_app.add_handlers(host_pattern, handlers)
        logger.info(
            "Spark monitor handlers registered: %s",
            [h[0] for h in handlers],
        )
