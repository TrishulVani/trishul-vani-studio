# Codex repository rules — TRISHUL VANI v0.2

Read `CODEX_MASTER_PROMPT.md` and `docs/ROADMAP.md` before editing. Respect `docs/SPECTRAL_STUDIO_SPEC.md`, `docs/PORTAL_UI_UX.md`, `docs/PORTAL_REEL_INTAKE.md`. Existing code is working alpha, NOT disposable.

- One coherent, testable microtask at a time (≤1 subsystem), avoid big rewrite; never invent external reel observations or SpectraLayers proprietary integration.
- New spectral analysis must use actual uploaded/generated PCM with tested STFT/iSTFT; never generate fake heatmaps or AI results. Proprietary SpectraLayers is **manual external WAV reference** only.
- A true neural/RNNoise engine must be verified; spectral DSP is NOT AI. Report N/A for SNR/STOI/PESQ without clean ground truth. Never imply headset hearing safety or embedded end-to-end latency.
- Preserve current Obsidian Signal Lab dark/mint design. Animations only where useful and accessible/reduced-motion. Validate touch/keyboard/desktop.
- Source file(s) immutable; use manifest, operation history, licensed sample provenance; never add big datasets/models/secrets to git.
- Each task: inspect → plan ≤5 lines → implement → tests → diff review → docs/BUILD_LOG & CHANGELOG → commit → push to **confirmed correct remote** → check CI. If no authorized remote, record pending push, continue local commits; never substitute unrelated GitHub repository.
- Current default checks: `python -m pytest -q`, `node --check web/app.js`, `python -m compileall -q app scripts`. Add more focused tests as features grow.
- Final status must say what executed, tests results, commit ID and whether push/CI are actually verified; do not assume success.
