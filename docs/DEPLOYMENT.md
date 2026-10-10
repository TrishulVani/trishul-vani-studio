# Deployment

Public address requested: https://trishulvani.github.io

Backend: Render free Docker web service from this repository. No ChatGPT hosting is used. Exact live URLs are recorded after verification.

Set TRISHUL_PUBLIC_HOSTING=1 for visitor-isolated temporary workspaces. Visitors receive unguessable HttpOnly Secure cookies. These are browser sessions, not verified accounts. Cross-origin writes are rejected. Dataset registry uploads remain local-only. Storage cap: 250 MiB. The service runs one worker.

Free Render storage is ephemeral and services sleep when idle. Export WAV/JSON to keep results. This is a research prototype, not a durable archive or production SLA. GitHub Pages embeds the Python app; browsers blocking third-party cookies can open the backend directly.

Local: install requirements-dev.txt, run pytest, then uvicorn app.main:app --port 8000. Docker: docker compose up --build. Optional browser-only edition: python scripts/build_public.py.
