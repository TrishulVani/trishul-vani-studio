# Portal reel visual-reference intake — PENDING UPLOAD

**Important:** The user mentioned a *reel showing a portal* but no reel/video link or frames were attached to this request. The existing `docs/references/current-desktop.png` and `current-mobile.png` are **screenshots of our own TRISHUL VANI alpha, NOT the reel**. Do not claim to have reviewed the reel. This document records the procedure to integrate it when the user supplies it.

## When reel is supplied
1. Put the user-authorized reference in `docs/references/portal-reel.mp4` **only if its redistribution is permitted**. Otherwise keep link/private reference OUT of Git. If the media is large or copyrighted, use allowed local screenshots/annotations only and add original URL to review notes without redistributing.
2. Inspect original clip at full resolution, sample frames judiciously, and watch movement between keyframes. Do not rely exclusively on sparse stills if interaction behavior matters.
3. Create `docs/REEL_DESIGN_AUDIT.md`: visual hierarchy, color contrast, nav transitions, hover/click behavior, panel physics, audio visualization, typography, responsiveness, motion timing. Include exact video timestamps for every observation. Separate *observed* vs *proposed* ideas.
4. Produce **feature-to-TRISHUL mapping table** with no more than 8 inspirations: reference timestamp → interaction idea → destination page → useful function → accessibility/performance caveat → implementation task + acceptance screenshot.
5. Match **interaction principles**, not copyrighted artwork, logos, distinctive branded assets or exact screen layouts. Preserve TRISHUL's own established green-black identity.
6. Implement only selected 3–5 highest-value interactions, tested in browser at 375px/768px/1440px. For animations, obey `prefers-reduced-motion` and meaningful state changes.
7. Build `before vs after` screenshot pairs of our own UI and update design tokens if needed. No 'pixel perfect to reel' claim until actual media is reviewed.

## Creative direction meanwhile (ideas, NOT observations from reel)
- **App-shell navigation**: smooth collapsed/expanded sidebar; quick-jump command palette; keyboard shortcuts; clear page state.
- **Signal-as-object motion**: cursor-follow crosshair on spectrogram and synchronized playhead, signal trace glow only while actively playing; trident route highlights when real controller policy changes.
- **Structured journey**: dataset → mix → process → listen → compare → export, with state-driven progress and experiment trace breadcrumb.
- **Spatial layers**: subtle frosted inspector or modal over the existing dark solid panels (avoid expensive backdrop blur everywhere), draggable panel dividers and non-destructive layer rows.
- **Purposeful cards**: expanding evidence panels, hover previews and confident transitions, no synthetic scores or vanity counters.
- **Scientific atmosphere**: grid lines and bounded parallax as an optional light touch; animations must not alter interpretation of audio measurements.

## What to ask user
Please upload the reel here or send its URL and optionally mention 2–3 moments you like. Until then, these are generic motion/design ideas, not video-derived features.
