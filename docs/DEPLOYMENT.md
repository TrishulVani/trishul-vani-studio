# Deployment

Public address: https://trishulvani.github.io

Backend: https://trishul-vani-studio.onrender.com — Render free Docker web service from this repository. No ChatGPT hosting is used. The public shell is hosted by GitHub Pages in [TrishulVani/trishulvani.github.io](https://github.com/TrishulVani/trishulvani.github.io), with matching source in `deploy/pages/`.

## Publish flow

1. Push application changes to a feature branch. GitHub Actions verifies Python 3.11/3.12 tests, frontend checks and the Docker build.
2. Merge validated changes into `main`. Render is connected to this repository and set to **Auto-Deploy: After CI Checks Pass**, so its Docker deployment follows successful checks.
3. Copy the public shell files from `deploy/pages/` to the Pages repository root and push its `main` branch. GitHub Pages deploys that branch at the public address. The shell embeds the Render dashboard and keeps the visible website address on GitHub Pages.
4. Verify `/api/health` and `/docs` on Render, then visit the public URL, let the intro finish, and run a synthetic experiment or import an audio file.

No frontend API key is required. The Pages shell needs only the deployed backend URL in its iframe `src`. If that URL changes, update `deploy/pages/index.html` and the Pages repository copy together.

Set TRISHUL_PUBLIC_HOSTING=1 for visitor-isolated temporary workspaces. Visitors receive unguessable HttpOnly Secure cookies. These are browser sessions, not verified accounts. Cross-origin writes are rejected. Dataset registry uploads remain local-only. Storage cap: 250 MiB. The service runs one worker.

Free Render storage is ephemeral and services sleep when idle. Export WAV/JSON to keep results. This is a research prototype, not a durable archive or production SLA. GitHub Pages embeds the Python app; browsers blocking third-party cookies can open the backend directly.

Local: install requirements-dev.txt, run pytest, then uvicorn app.main:app --port 8000. Docker: docker compose up --build. Optional browser-only edition: python scripts/build_public.py.
