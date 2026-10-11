## 2026-10-10 v0.2 preparation — LOCAL DESIGN/DOCS, not runtime implementation
- Based on prior working v0.1 source and user request, wrote Spectral Studio and UI/UX contracts, updated Codex master and task prompts, preserved original code.
- Portal reel has not been supplied; `PORTAL_REEL_INTAKE.md` is awaiting reference media.
- Verify tests after packaging. No remote push was attempted for this local generated ZIP.

# Build log (verified changes only)

## 2026-10-10 — Initial software workbench creation

**Delivered locally:** DSP engine, hybrid DSP fallback, FastAPI app, responsive dashboard, audio upload and playback, dataset evaluation CLI, Docker + CI configs, tests and reference documentation. Recorded local Git commits are supplied in the accompanying Git bundle. CI on GitHub is **not yet executed**. Actual RNNoise weights/models have **not yet been installed**. External LibriSpeech/DEMAND files have **not yet been downloaded**. Raspberry Pi/native C++/two-node work **not yet performed**.

**Next committed milestone after GitHub repository is selected:** `S1 real dataset registry` per `CODEX_MASTER_PROMPT.md`.

**For Codex:** append one dated section only after source commit and actual test run. Include exact commands/results, SHA, PR/branch and blockers. Never backfill success claims.

## S0 audit - 2026-10-10
Starter baseline: 9 tests passed on Python 3.12.14 / Windows. JavaScript syntax passed. Initial sandbox temporary-directory access failed; rerun outside sandbox passed. No FFmpeg or Docker on PATH. Repository created at https://github.com/TrishulVani/trishul-vani-studio. No original Git history in supplied ZIP.


## S1 registry implementation
11 tests pass; Python compile passes. Added content hashes, provenance, metadata validation, import API/CLI, split-leak prevention. Real 3-speaker / 3-environment corpus gate is pending: no real recordings supplied or installed. S0 pushed: a4d9985.


## Spectral Studio A/B/C implementation
16 tests pass, including identity at odd lengths, selected-band suppression, deterministic recipes, source immutability, audio export and external-reference N/A handling. Browser imported the 4-second original test signal and applied an edit; measured RMS changed from 0.1605 to 0.0680. Health and /docs returned HTTP 200. Added responsive workspace; browser QA continues. No proprietary integration or real RNNoise claimed.


## 2026-10-11 public hosting
17 Python tests and browser DSP identity/band/FFT/WAV tests passed; JS syntax passed. PR #7 merged at de9342b with Python 3.11/3.12 and Docker CI green. User chose GitHub Pages and Render; Sites was abandoned before publication. Release 519be97 pushed. Final deployment/CI verification follows.

Public release 7039244: all six remote checks succeeded (Python 3.11/3.12 and Docker on main/release branch). Browser DSP is now included in CI. Uploaded-audio cross-visitor isolation test passed. GitHub Pages entry pushed at 6afbac3. Render deployment in progress.
## 2026-10-11 — Design 02 candidate and v0.3 intake

- Inspected both repository baselines (`229858c` app, `8514c52` Pages), routes, CI, existing UX specifications and the supplied logo reference.
- Implemented a Design 02-only monochrome candidate with a pointed, curved trident SVG, original microphone image, updated intro, transitions and matching signal visualization. Version 1 files and production Pages repository were not changed.
- JavaScript syntax and browser DSP suite passed locally. Python pytest could not complete locally because Windows denied the default temporary directory; rerun with a workspace base temporary directory stalled, so GitHub CI is the independent check.
- Added `IMMERSIVE_UX_SPEC.md` and `V03_COMPATIBILITY.md` for six-scene narrative and tutorial/MySQL gates. Neither the six-scene narrative, tutorial video nor MySQL is claimed complete.


## 2026-10-11 — Guided tour candidate

- Tested tour flow in Chrome at local `127.0.0.1`: Help opens, steps 1–3 advance, step 4 navigates to Studio, step 5 finishes, and Help remains available. The local static preview correctly reports backend 404; processing was not tested against that preview.
- JavaScript syntax checks passed. Pending GitHub CI/PR review and direct deployed backend QA. No tutorial video exists yet.
- First-visit prompt appears on a fresh browser origin. Escape closes the modal; Help reopens it. A static-server failure correctly changes the badge to PROCESSOR UNAVAILABLE and exposes Retry. Mobile screenshot was attempted but the browser viewport override was inconclusive; responsive QA remains open.

## 2026-10-11 — Immersive story integration

- Visual revision after user feedback: the earlier graphite/jade/metal mix was rejected. The candidate now uses a single midnight/ion-blue palette, a clearly visible trident above the entrance title, a centered spatial intro, original floating microphone illustrations, a parallax chapter backdrop, and matching lab/tutorial controls. Playwright browser suite: 18/18 passed on desktop, tablet, and mobile after the visual change, including scroll-driven microphone motion. This is still a review candidate, not a public release.

- Built `/experience.html` with six connected chapters, original trident hero, visible lab navigation, real user-triggered synthetic engine playback, processor-derived RNNoise/spectral label and real visitor-history empty state. Educational policy and spectral artwork are explicitly labelled illustrations.
- Adopted a coherent dark graphite/jade/warm-metal Design 02 palette. Preserved the root Version 1 theme and intro. The Version 2 Pages alias now points to the same-origin Render experience in the candidate, avoiding third-party cookie dependence.
- Integrated the guided-tour commit into this combined branch. Browser tests: 9/9 Playwright cases passed across 1440, 768 and 390 px; all three measured without horizontal overflow. Chrome manual test generated a three-second WAV using the local FastAPI engine. Desktop/tablet/mobile screenshots saved in `outputs/` outside the Git repository for visual review.
- Production routes have not been replaced from this preview branch. The tutorial video is not produced. MySQL remains separately gated by production provider and credentials; metadata persistence does not make media durable.
- Refined the story flow with an accessible six-chapter rail, actual experiment RMS envelope and measured STFT from the existing spectral API. Expanded browser QA to 15 cases, including lab CSV/WAV export and source-preserving spectral edit with undo; all 15 passed locally across desktop, tablet and mobile.
