# Deployment

Version 1: https://trishulvani.github.io

Design 02: https://trishulvani.github.io/design-v2/

Backend: https://trishul-vani-studio.onrender.com — Render free Docker web service from this repository. No ChatGPT hosting is used. The public shell is hosted by GitHub Pages in [TrishulVani/trishulvani.github.io](https://github.com/TrishulVani/trishulvani.github.io), with matching source in `deploy/pages/`.

## Publish flow

1. Push application changes to a feature branch. GitHub Actions verifies Python 3.11/3.12 tests, frontend checks and the Docker build.
2. Merge validated changes into `main`. Render is connected to this repository and set to **Auto-Deploy: On Commit**, so it builds the new Docker image automatically. GitHub Actions also runs on `main`; that run reports validation but does not gate the deployment. Check feature-branch CI before merging.
3. Copy `deploy/pages/index.html` and `trident.svg` to the Pages repository root, and `deploy/pages/design-v2/` to its matching subdirectory. Push the Pages `main` branch. GitHub Pages serves Version 1 at `/` and Design 02 at `/design-v2/`. The Design 02 shell embeds `index.html?design=2`; Version 1 embeds the default `index.html`.
4. Verify `/api/health` and `/docs` on Render, then visit the public URL, let the intro finish, and run a synthetic experiment or import an audio file.

No frontend API key is required. The Pages shells need only the deployed backend URL in their iframe `src`. If that URL changes, update both entries and the Pages repository copies together.

Set TRISHUL_PUBLIC_HOSTING=1 for visitor-isolated temporary workspaces. Visitors receive unguessable HttpOnly Secure cookies. These are browser sessions, not verified accounts. Cross-origin writes are rejected. Dataset registry uploads remain local-only. Storage cap: 250 MiB. The service runs one worker.

Free Render storage is ephemeral and services sleep when idle. Export WAV/JSON to keep results. This is a research prototype, not a durable archive or production SLA. GitHub Pages embeds the Python app; browsers blocking third-party cookies can open the backend directly.

Local: install requirements-dev.txt, run pytest, then uvicorn app.main:app --port 8000. Docker: docker compose up --build. Optional browser-only edition: python scripts/build_public.py.

## Optional database branch

The public Render service has no configured MySQL provider or production `DATABASE_URL`. The database foundation is staged separately. Do not enable it until migrations, provider TLS, owner isolation, backup/restore and binary-storage limitations are verified; see [`DATABASE.md`](DATABASE.md).
