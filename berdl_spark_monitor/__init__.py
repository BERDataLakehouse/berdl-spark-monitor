import os

try:
    from ._version import __version__
except ImportError:
    import warnings
    warnings.warn("Importing 'berdl_spark_monitor' outside a proper installation.")
    __version__ = "dev"


def _jupyter_labextension_paths():
    return [{"src": "labextension", "dest": "berdl-spark-monitor"}]


def _jupyter_server_extension_points():
    return [{"module": "berdl_spark_monitor"}]


def _load_jupyter_server_extension(server_app):
    """Register proxy handlers and expose config to the frontend via page_config."""
    from .routes import setup_handlers

    web_app = server_app.web_app
    page_config = web_app.settings.setdefault("page_config_data", {})

    mock_mode = os.environ.get("SPARK_MONITOR_MOCK_MODE", "").lower() in (
        "true",
        "1",
        "yes",
    )
    if mock_mode:
        page_config["sparkMonitorMockMode"] = "true"
        page_config["sparkMonitorEnabled"] = "true"
        server_app.log.info("berdl_spark_monitor: mock mode enabled")
        return

    cluster_manager_url = os.environ.get("SPARK_CLUSTER_MANAGER_API_URL")
    namespace = os.environ.get("BERDL_JUPYTERHUB_NAMESPACE")

    if not cluster_manager_url and not namespace:
        server_app.log.info(
            "berdl_spark_monitor: Neither SPARK_CLUSTER_MANAGER_API_URL nor "
            "BERDL_JUPYTERHUB_NAMESPACE set, extension disabled"
        )
        return

    kbase_auth_url = os.environ.get(
        "KBASE_AUTH_URL", "https://ci.kbase.us/services/auth/"
    )
    spark_master_port = os.environ.get("SPARK_MASTER_PORT", "8090")

    page_config["sparkMonitorEnabled"] = "true"

    setup_handlers(
        web_app,
        cluster_manager_url=cluster_manager_url,
        namespace=namespace,
        kbase_auth_url=kbase_auth_url,
        spark_master_port=spark_master_port,
    )

    server_app.log.info("Registered berdl_spark_monitor server extension")
