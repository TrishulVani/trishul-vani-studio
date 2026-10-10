# START HERE — TRISHUL VANI v0.2 Codex Handoff

**Package is the tested v0.1 code with a v0.2 implementation plan**, not a finished Spectral Studio. The original UI colors and working application have deliberately been preserved. The audio engineer's Steinberg SpectraLayers suggestion is included as an external benchmark and inspiration for our own spectral tools.

## Read first
1. `CODEX_MASTER_PROMPT.md` — standing engineering contract (updated v0.2).
2. `docs/CODEX_TASK_PROMPTS.md` — copy one microtask prompt into Codex per session.
3. `docs/SPECTRAL_STUDIO_SPEC.md` — scientific viewer/editor/reference benchmark acceptance tests.
4. `docs/PORTAL_UI_UX.md` — interactive research portal design/motion system.
5. `docs/PORTAL_REEL_INTAKE.md` — **user reel NOT received**, what to do when sent.
6. `AGENTS.md` — short Codex in-repo rules.

## Use it

Extract ZIP; open `trishul-vani-studio/` in Codex. Start with the `0 / Start audit` task in `docs/CODEX_TASK_PROMPTS.md`. Work sequentially on S1, viewer, editor, reference import, UI, algorithms and CI. Do not ask a light/medium-reasoning model to ship everything in one go.

Run baseline (Windows Powershell):

```powershell
python -m venv .venv
.\\.venv\\Scripts\\Activate.ps1
pip install -r requirements.txt -r requirements-dev.txt
python -m pytest -q
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Visit http://127.0.0.1:8000/ and /docs. For GitHub push provide the **exact authorized owner/repo URL**; no GitHub origin is assumed. If restoring from earlier git bundle see original start document/repository instructions. Verify remote content before creating commits or pushes. Never commit or redistribute unlicensed recordings or the user reel without rights.

## Claim boundaries
- `v0.2` here is **design handoff/spec version**, while audio software functionality remains as in v0.1.
- No standalone SpectraLayers application, Steinberg module, SDK or proprietary model is bundled. Later import **only user-exported WAV files** to compare offline.
- Specific reel-derived UI animation cannot be implemented until actual reel/video/screenshots provided.
- 90% completion requires passed software gates and evidence; the specs do not themselves fulfill them.
