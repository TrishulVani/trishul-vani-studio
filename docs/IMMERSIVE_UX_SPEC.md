# Immersive UX specification — Design 02 candidate

Status: the six-chapter route is implemented at `/experience.html` on the immersive-story branch. The public Version 1 remains at `/`; the current Design 02 public release remains unchanged while this branch is reviewed.

## Audit (11 October 2026)

- App baseline: `229858c` on `main`; Pages baseline: `8514c52` on `main`. The app has a FastAPI dashboard, experiment lab, spectral editor, real same-origin `/api` calls, and responsive CSS. The Pages root and `/design-v2/` are iframe shells around the Render app. The iframe depends on third-party browser cookies for visitor isolation, so a direct Render URL must remain available.
- Version 1 currently uses near-black and mint with Oxanium/Space Grotesk. Design 02 deployed at audit time used dark graphite with orange/violet accents. Neither has the six-scene narrative in this document. The logo supplied on 11 October is a visual reference, not code or a license to reproduce exact pixels.
- Route map: Pages `/` → Render `/index.html`; Pages `/design-v2/` → Render `/index.html?design=2`; Render `/studio.html` → spectral editor; `/api/*` → real Python processor. Direct Render access is the cookie fallback.
- Data truth: simulation uses synthetic signals; NLMS, spectral and hybrid outputs are measured by the backend. RNNoise appears only when a genuine model is configured. Spectral Studio uses source PCM and STFT data. Free Render media storage is ephemeral.

## Visual direction

A single restrained midnight and ion-blue system for Design 02. Large Manrope editorial type, compact DM Sans data labels, a lone upright three-prong trident with reference-inspired curved arms and pointed spearheads. The microphone image is original project art; it is an atmospheric backdrop, never a substitute for measured signal data. Version 1 mint styles remain untouched. Motion is limited to transforms and opacity, with reduced-motion support.

| Token | Value | Use |
|---|---|---|
| Graphite | `#080d10` | Story and app background |
| Instrument | `#121d20` | Cards and control surfaces |
| Ink | `#f4f4ee` | Main copy |
| Signal | `#8dd5c2` | Controls, progress and signal emphasis |
| Metal | `#c6aa78` | Restrained trident highlight |
| Muted | `#b7c5c2` | Supporting text |

## Six-chapter storyboard

1. **Enter the signal.** Sculpted trident, microphone environment, immediate `Launch Research Lab` and `Explore` controls. No timed gate to access.
2. **The problem.** User-triggered raw/enhanced playback using permitted, clearly labelled synthetic material from the actual engine. Muted by default, with captions and provenance.
3. **Two microphones.** Primary and ambient reference lines feed NLMS, then the verified neural stage or spectral fallback, then output. All labels reflect `/api/meta`.
4. **Noise policies.** Stationary, changing and impulse behavior shown with data from an actual experiment trace; any illustrative fallback is labelled as such.
5. **Spectral inspection.** Actual STFT preview from a permitted source, plus an explicit link to the working editor. Decorative canvases never impersonate a spectrogram.
6. **Evidence and action.** Actual stored run comparisons, honest N/A metrics, direct experiment, source and technical-document links.

Each chapter must have a meaningful heading and anchor. Progress remains visible; scrolling is native. Scenes may use pinned spatial continuity without trapping focus or input. Reuse native CSS/Canvas before adding heavy libraries. Pause nonessential animation when hidden. Provide touch, keyboard, 1440/768/390 layouts and reduced-motion/data behavior.

## Integration and release gates

- The intro is optional and immediately skippable. Avoid loading a broken video placeholder; the guided tour is the near-term educational path until actual screen capture is available.
- Keep all lab tasks functional from Render directly even if the Pages iframe loses third-party cookies. Expose the direct link visibly, with truthful connection and retry states.
- MySQL is a separate feature branch and deployment gate. Metadata may become durable only when a configured production database passes migrations; WAV/FLAC storage remains explicitly ephemeral until a durable media service is configured.
- Before replacing the root or current Design 02 public page: review candidate screenshots, run Python/JS/E2E tests and check CI. Preserve current public routes for rollback.
