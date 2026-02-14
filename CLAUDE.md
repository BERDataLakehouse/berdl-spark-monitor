# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

All JS commands use `jlpm` (JupyterLab's yarn wrapper). Prefix with `uv run` when running outside an activated venv.

```bash
# Install
jlpm install                    # JS dependencies
uv sync                         # Python dependencies (creates venv)

# Type-check (no emit)
jlpm tsc --noEmit

# Build
jlpm build:lib                  # TypeScript → lib/
jlpm build                      # Full labextension (requires jupyterlab)

# Lint (auto-fix)
jlpm lint                       # Runs stylelint + prettier + eslint with fixes

# Lint (check only, CI-style)
jlpm lint:check                 # Runs stylelint:check + prettier:check + eslint:check

# Dev install
pip install -e ".[dev]"
jupyter labextension develop . --overwrite
jupyter server extension enable berdl_spark_monitor

# Watch mode (two terminals)
jlpm watch                      # auto-rebuild on change
jupyter lab                     # run JupyterLab
```

## Architecture

JupyterLab extension with a Python server extension backend (Tornado handlers) and TypeScript frontend (React + React Query). Generated via `copier` from `jupyterlab/extension-template` with the `kbase-jlab-overlay` applied (hatch-vcs versioning, KBase CI workflows).

### Data Flow

```
Browser (JupyterLab)
  └─ React components poll via fetch()
       └─ Tornado proxy handlers (server extension)
            ├─ /berdl/api/spark-monitor/status       → Spark Cluster Manager API /clusters
            ├─ /berdl/api/spark-monitor/cluster       → Spark Master REST /json/
            ├─ /berdl/api/spark-monitor/app/executors → Spark Master /api/v1/applications/{appId}/executors
            └─ /berdl/api/spark-monitor/app/stages    → Spark Master /api/v1/applications/{appId}/stages
```

Neither upstream API is browser-reachable (internal K8s services). The server extension proxies all requests, resolving the user's Spark Master URL from their KBase token via Auth2.

### Server Extension (`berdl_spark_monitor/`)

- `__init__.py` — Reads env vars, sets `page_config["sparkMonitorEnabled"]`, registers handlers. Extension disables itself if neither `SPARK_CLUSTER_MANAGER_API_URL` nor `BERDL_JUPYTERHUB_NAMESPACE` is set. Mock mode (`SPARK_MONITOR_MOCK_MODE=true`) skips handler registration and enables frontend MSW.
- `routes.py` — Tornado handlers extending `APIHandler`. `SparkMonitorBaseHandler` provides shared auth (cookie → KBase Auth2 → username → Spark Master URL), username caching (5min TTL), app ID caching (60s TTL), guard helpers (`_require_token`, `_require_namespace`), and `_proxy_app_endpoint` for the executors/stages proxy pattern. A shared `httpx.AsyncClient` is stored in `web_app.settings`.

### Frontend (`src/`)

- **Plugin** (`index.ts`) — Gates on `sparkMonitorEnabled` PageConfig. Creates `QueryClient`, registers sidebar panel + command. Dynamically imports MSW startup in mock mode.
- **Lumino bridge** (`SparkMonitorLuminoPanel.ts`) — `Panel` subclass that tracks visibility via `onAfterShow`/`onAfterHide` and exposes `getVisibility()` + `setVisibilityCallback()` for the React tree.
- **Visibility context** (`contexts/SparkVisibilityContext.ts`) — React context + `useSparkVisibility()` hook. Sidebar hooks read this to pause/resume polling when hidden.
- **API** (`api/sparkApi.ts`) — Thin fetch wrappers using `URLExt.join(PageConfig.getBaseUrl(), ...)`. No auth headers needed (same-origin cookie).
- **Hooks** (`hooks/`) — React Query hooks with visibility-aware and adaptive polling:
  - `useClusterStatus` — always-on 30s (drives status dot, not visibility-gated)
  - `useClusterSummary` — visibility-aware 30s
  - `useExecutors` — 10s when tasks active, 30s idle
  - `useStages` — 5s when stages active, 30s idle; splits into `active`/`recent` arrays
- **Components** — `SparkMonitorPanel` (root, provides visibility context), `ExecutorSection` (fetches executor data once, renders `SpillWarning` + `ExecutorTable` as pure presentational), `ClusterOverview` + `ResourceBar`, `ActiveStages`, `QueryHistory`, `StatusDot` + `TabBadge`, `CollapsibleSection`.
- **Mocks** (`mocks/`) — MSW handlers with realistic mock data. `start.ts` handles worker setup + warm-up fetch. Enabled via `SPARK_MONITOR_MOCK_MODE=true` env var.

### Key Patterns

- **Visibility-aware polling**: Sidebar hooks receive `isVisible` from `SparkVisibilityContext`. Polling pauses when sidebar is hidden. `useClusterStatus` is always active (drives the status dot).
- **Adaptive polling**: Hooks increase poll frequency when work is happening (active tasks/stages) and slow down when idle.
- **Feature gating**: Server extension sets PageConfig flag; frontend checks it and early-returns if disabled.
- **Theme compatibility**: All CSS uses `var(--jp-*)` variables. BEM-style class names with `spark-monitor-` prefix.
- **Interface naming**: ESLint enforces `I`-prefix on interfaces (e.g., `IProps`, `IExecutorSummary`).

## Environment Variables

| Variable                        | Required     | Default                              | Purpose                              |
| ------------------------------- | ------------ | ------------------------------------ | ------------------------------------ |
| `SPARK_CLUSTER_MANAGER_API_URL` | One of these | —                                    | Cluster manager for status bar       |
| `BERDL_JUPYTERHUB_NAMESPACE`    | required     | —                                    | K8s namespace for Spark Master proxy |
| `KBASE_AUTH_URL`                | No           | `https://ci.kbase.us/services/auth/` | Auth2 validation                     |
| `SPARK_MASTER_PORT`             | No           | `8090`                               | Spark Master Web UI port             |
| `SPARK_MONITOR_MOCK_MODE`       | No           | —                                    | `true` enables MSW mock mode         |

## Commit Guidelines

Do not include references to claude, anthropic, or include claude as a coauthor.
