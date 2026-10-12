## 2026-10-10 v0.2 preparation — LOCAL DESIGN/DOCS, not runtime implementation
- Based on prior working v0.1 source and user request, wrote Spectral Studio and UI/UX contracts, updated Codex master and task prompts, preserved original code.
- Portal reel has not been supplied; `PORTAL_REEL_INTAKE.md` is awaiting reference media.
- Verify tests after packaging. No remote push was attempted for this local generated ZIP.

# Build log (verified changes only)

## 2026-10-12 — Design 02 virtual hardware workbench

Feature commit `f21b39dc45740bc0116c8051e37e55561f18f1c5` on `feat/immersive-story` (draft PR #11). Adapted the supplied MK-IV geometry into a 261-mesh WebGL2 viewer, added a logical multi-controller wiring and script simulator, and connected software tests to the existing FastAPI audio endpoint. Sharpened and enlarged the V2 Hindi `त्रि` mark. Version 1 and the DSP implementation were not modified.

Verified locally: `.\\.venv\\Scripts\\python.exe -m pytest -q --basetemp=.pytest-ci-hardware` → **17 passed**; `pnpm exec playwright test --reporter=line` → **48 passed** across desktop, tablet and mobile (including the new workbench-to-audio-lab path); `node --check` for `web/app.js`, `web/hardware-v2.js`, and `web/hardware-model-v2.js`; Python `compileall`; model JSON parsed with 261 meshes; `git diff --cached --check` clean. The first unrestricted Python test invocation hit a Windows temp-directory permission error; a repository-local basetemp resolved it. The first 6-worker browser run had one tablet navigation timeout; the isolated retry passed, and the full 3-worker rerun passed 48/48. No physical device, electrical fit, embedded timing or firmware execution has been validated. Public Design 02 release remains pending visual approval.

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

- Replaced the candidate dashboard's static hero with a floating dual-microphone rig and interactive acoustic canvas; enlarged and recomposed all story chapters with sticky editorial text, scroll-responsive media/cards, portal rings, and an original flying-wing silhouette for the illustrative air condition. Story-to-lab entry now animates a trident before navigating to the same-origin working application. Cache-versioned CSS/JS references avoid stale deployed assets. JavaScript syntax and `git diff --check` passed; Playwright 21/21 passed locally across 1440/768/390 px, including the new story-to-lab route. Remote CI must be verified after push.

- Revised the candidate's hero with an original canvas sound field that eases toward the pointer and produces local wave ripples; it pauses when offscreen and renders a static frame for reduced-motion visitors. Added depth-responsive acoustic cards and microphone poster, with ground/sea/air context labelled as illustrative. Browser suite passed 18/18 locally after this revision. Branch push and remote CI are separate checks.

- Visual revision after user feedback: the earlier graphite/jade/metal mix was rejected. The candidate now uses a single midnight/ion-blue palette, a clearly visible trident above the entrance title, a centered spatial intro, original floating microphone illustrations, a parallax chapter backdrop, and matching lab/tutorial controls. Playwright browser suite: 18/18 passed on desktop, tablet, and mobile after the visual change, including scroll-driven microphone motion. This is still a review candidate, not a public release.

- Built `/experience.html` with six connected chapters, original trident hero, visible lab navigation, real user-triggered synthetic engine playback, processor-derived RNNoise/spectral label and real visitor-history empty state. Educational policy and spectral artwork are explicitly labelled illustrations.
- Adopted a coherent dark graphite/jade/warm-metal Design 02 palette. Preserved the root Version 1 theme and intro. The Version 2 Pages alias now points to the same-origin Render experience in the candidate, avoiding third-party cookie dependence.
- Integrated the guided-tour commit into this combined branch. Browser tests: 9/9 Playwright cases passed across 1440, 768 and 390 px; all three measured without horizontal overflow. Chrome manual test generated a three-second WAV using the local FastAPI engine. Desktop/tablet/mobile screenshots saved in `outputs/` outside the Git repository for visual review.
- Production routes have not been replaced from this preview branch. The tutorial video is not produced. MySQL remains separately gated by production provider and credentials; metadata persistence does not make media durable.
- Refined the story flow with an accessible six-chapter rail, actual experiment RMS envelope and measured STFT from the existing spectral API. Expanded browser QA to 15 cases, including lab CSV/WAV export and source-preserving spectral edit with undo; all 15 passed locally across desktop, tablet and mobile.
## 2026-10-12 — user-supplied flyover integration

- Used the supplied HTML as a design and motion reference, and extracted its embedded WebP for the V2 landing. Implemented a repository-native sticky flyover with a one-to-one forward/reverse scroll path, readout and reduced-motion handling; the existing signal-field figure follows in the chamber narrative.
- Carried its charcoal, steel and copper colors through the V2 intro, dashboard and spectral editor. The flyover is labelled a visual study, not an Indian service aircraft or validated field recording. Version 1 and DSP algorithms were not changed.
- Final local Playwright: 33/33 desktop, tablet and mobile checks passed, including forward/reverse flyover, intro entry, connected processing, export and spectral editing. JavaScript syntax and diff checks passed. Remote CI is verified after the branch push.

## 2026-10-12 — trident intro and continuous flight story

- The supplied `preview.html` provided the trident asset and motion reference. The V2 intro now idles in axial rotation, then responds to wheel/touch/keyboard input with a reversible turn, rush and impact; completion or Skip/Escape leads to the same connected landing.
- Replaced the three environmental panels with a single sticky narrative. Its new rear-view cockpit image was generated using the existing operator image as reference; this is illustrative concept art. The final chapter links and scrolls directly into the real audio lab.
- Updated CI asset and syntax checks. The final full local browser run passed 36/36 across desktop, tablet and mobile, including actual wheel-driven intro entry, lab processing, exports and spectral edits. No backend or V1 source behavior was altered.

## 2026-10-12 — recording-guided signal corridor and V4 atmosphere

- Reviewed the supplied screen recording, animatic, HTML theme preview and V4 color brief as references. Built native canvas interference waves, pointer-reactive moving blocks, perspective notation ribbons and original corridor artwork around the existing operator. The action now runs woman → interstellar passage → glass break → rear-view cockpit → fly-off → audio lab.
- Added the supplied gold glyph to V2 navigation/branding and a layered scroll-interpolated atmosphere across intro, landing, laboratory and editor. V1 and backend/DSP source are unchanged; reduced-motion behavior remains available.
- Browser verification passed 42/42 across desktop, tablet and mobile. JavaScript syntax and diff checks passed. Public V2 remains on the old version until visual approval and release.

## 2026-10-12 — animatic-directed intro and independent operator passage

- Reviewed the supplied `Trishul_Vani_Fusion_Concept_Animatic.mp4` frame by frame as a motion reference. Rebuilt the V2 intro with an idle axial turn and reversible awakening, horizontal throw, rush and impact; it now uses the original trident asset in a faster, smoother native animation instead of embedding the supplied video.
- Generated an empty corridor plate and a transparent flying operator from the established character artwork. The independent layers allow the woman to grow and travel through the passage before the glass fracture and cockpit handoff, while keeping the page responsive to scrolling in both directions.
- Applied **त्रिSHUL VANI** as the V2 wordmark throughout the intro, landing and editor. Updated browser and CI checks for the new assets. The final local browser suite passed 42/42 across desktop, tablet and mobile; JavaScript syntax and diff checks passed. V1 and backend/DSP code remain unchanged; public release still awaits review.
