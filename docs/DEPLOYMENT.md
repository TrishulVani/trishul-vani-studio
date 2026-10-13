# Deployment

Main website (improved Version 1): https://trishulvani.github.io

Version 2 / Original Edition: https://trishulvani.github.io/design-v2/

Backend: https://trishul-vani-studio.onrender.com — Render free Docker web service from this repository. No ChatGPT hosting is used. The responsive frontend is deployed from `web/` to GitHub Pages in [TrishulVani/trishulvani.github.io](https://github.com/TrishulVani/trishulvani.github.io).

## Publish flow

1. Push application changes to a feature branch. GitHub Actions verifies Python 3.11/3.12 tests, frontend checks and the Docker build.
2. Merge validated changes into `main`. Render is connected to this repository and set to **Auto-Deploy: On Commit**, so it builds the new Docker image automatically. GitHub Actions also runs on `main`; that run reports validation but does not gate the deployment. Check feature-branch CI before merging.
3. Copy the verified `web/` release to the Pages repository, publish `experience.html` as the root `index.html`, and preserve the dashboard as `lab.html`. Keep `design-v2/` at its matching subdirectory. Push the Pages `main` branch.
4. Verify `/api/health` and `/docs` on Render, then visit the public URL, let the intro finish, and run a synthetic experiment or import an audio file.

No frontend API key is required. `web/api-client.js` selects the Render backend on the Pages hostname, starts a health request during the intro, and scopes requests with a random browser-local workspace capability. If the backend URL changes, update that file and release the Pages copy.

Set `TRISHUL_PUBLIC_HOSTING=1` for visitor-isolated temporary workspaces. Direct Render visits use an HttpOnly Secure cookie; the GitHub Pages frontend uses the equivalent 256-bit capability in a request header. Only the exact Pages origin and local preview origins may write across origins. Dataset registry uploads remain local-only. Storage cap: 250 MiB. The service runs one worker.

Free Render storage is ephemeral and services sleep when idle. Export WAV/JSON to keep results. This is a research prototype, not a durable archive or production SLA. GitHub Pages serves the interface independently, so a sleeping processor cannot delay first paint.

Local: install requirements-dev.txt, run pytest, then uvicorn app.main:app --port 8000. Docker: docker compose up --build. Optional browser-only edition: python scripts/build_public.py.
