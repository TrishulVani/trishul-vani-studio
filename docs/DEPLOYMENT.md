# Deployment

The one public application address is **https://trishul-vani-studio.onrender.com/**. It serves the intro and frontend from `web/`, the FastAPI application, and `/api/*` from the same origin. Use `/design-v2/` for the preserved original edition and `/studio.html` for the spectral editor. The browser can navigate between these pages while keeping frontend and processing on the studio host.

## Publish flow

1. Push application changes to a feature branch. GitHub Actions verifies Python tests, frontend checks and the Docker build.
2. Merge validated changes into `main`; Render deploys the FastAPI service from this repository.
3. Verify `/`, `/lab.html?design=2#overview`, `/design-v2/`, `/studio.html`, `/api/health`, and one synthetic audio experiment on the studio host.

The browser uses same-origin API requests at the studio address. `web/api-client.js` adds a random browser-local workspace capability to keep experiment records isolated. No frontend API key, cross-origin cookie, or separate frontend hostname is required for the canonical site.

Set `TRISHUL_PUBLIC_HOSTING=1` for visitor-isolated temporary workspaces. Direct API visits use an HttpOnly Secure cookie; browser requests also send the equivalent 256-bit capability in a request header. Same-origin writes are allowed; cross-origin writes are rejected. Dataset registry uploads remain local-only. Storage cap: 250 MiB. The service runs one worker.

Free Render web-service storage is ephemeral and the service may sleep when idle. Because the frontend and API use one service, the first page request waits for the service to wake. Once it is running, the intro loads before metadata and experiment history finish in the background. Export WAV/JSON to keep results. This is a research prototype, not a durable archive or production SLA.

Local: install `requirements-dev.txt`, run `python -m pytest -q`, then `uvicorn app.main:app --port 8000`. Docker: `docker compose up --build`. Optional browser-only edition: `python scripts/build_public.py`.
