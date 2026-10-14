# Deployment

Main website (improved Version 1): https://trishul-vani-frontend.onrender.com

Version 2 / Original Edition: https://trishul-vani-frontend.onrender.com/design-v2/

Backend: https://trishul-vani-studio.onrender.com — Render Docker web service from this repository. The frontend is a separate, live Render Static Site built from `web/` and served from Render's global CDN; the intro and dashboard load independently of API wake-up. GitHub remains the source repository and CI host. After this release merges, the former GitHub Pages entry points forward to the Render site.

## Publish flow

1. Push application changes to a feature branch. GitHub Actions verifies Python 3.11/3.12 tests, frontend checks and the Docker build.
2. Merge validated changes into `main`. The configured Render services auto-deploy; the frontend Static Site is rooted at `web/`, while the Python API remains a separate Docker service.
3. Verify the root intro, `/design-v2/`, dashboard work-area links, `/api/health`, and a synthetic audio experiment. GitHub Pages remains only as a redirect for old bookmarks.

No frontend API key is required. `web/api-client.js` selects the Render backend on the Render Static Site hostname and scopes requests with a random browser-local workspace capability. The intro renders before its optional metadata and saved-experiment requests begin. If the backend URL changes, update that file and release the static frontend.

Set `TRISHUL_PUBLIC_HOSTING=1` for visitor-isolated temporary workspaces. Direct API visits use an HttpOnly Secure cookie; the Render Static Site frontend uses the equivalent 256-bit capability in a request header. Only the exact static-site origin and local preview origins may write across origins. Dataset registry uploads remain local-only. Storage cap: 250 MiB. The service runs one worker.

Free Render web-service storage is ephemeral and the API may sleep when idle. Export WAV/JSON to keep results. This is a research prototype, not a durable archive or production SLA. The Render Static Site is served independently over its CDN, so a sleeping processor cannot delay first paint.

Local: install requirements-dev.txt, run pytest, then uvicorn app.main:app --port 8000. Docker: docker compose up --build. Optional browser-only edition: python scripts/build_public.py.
