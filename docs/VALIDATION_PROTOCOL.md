# Validation test plan — defend all project claims

**Scientific rule: measured evidence or N/A.** A status checkbox does not make a physical claim true.

## A. Static correctness / repository health

- CI must pass on 3.11 and 3.12: `python -m pytest -q`; JavaScript syntax; Docker build; no committed third-party audio or model; known critical CVEs tracked.
- Endpoint contract test: all happy and negative validation paths; 422 on unsupported source/rate, truncated audio, zero-duration, huge file, malformed model; no path traversal; correct WAV sampling and length.
- Frontend: mobile 375px + 768px + desktop 1440px, keyboard navigation, contrast, reduced-motion, offline font fallback, no failed network requests, all buttons useful. Use Playwright screenshots/interaction assertions once tests can run in a browser runner.
- All methods process the *same* test input; seed repeated twice produces identical mix; changed seeds differ.

## B. DSP correctness

1. **Identity/noise-only:** silence/reference match; NLMS remains stable, no NaN/Inf, predictable warmup.
2. **Reference-correlated baseline:** desired suppression after convergence; per-sample cost monitored. Compare with independent implementation for drift.
3. **No reference:** hybrid skips invalid reference and uses available single-channel residual method; no hang/divide-by-zero.
4. **Speech leakage:** add desired speech into ambient reference; measure whether NLMS suppresses speech (bad). Implement double-talk detection before claiming reliable operation.
5. **Impulse freeze:** inject impulses during running convergence, assert adaptive weights unchanged at frozen frames and no explosive output.
6. **Mode transitions:** inspect gain jump, crossfade, clicks, output duration and null/drop packets. Verify no >1.0 WAV clipping beyond recorded metadata.
7. **RNNoise:** actual model present, known model checksum, check 48k/10ms native semantics, output length/phase alignment, no hidden spectral substitute.
8. **Controller:** stationary, changing, impulsive, uncorrelated and no-reference samples logged with control trace; measure false switching rate.

## C. Objective comparisons

Use LibriSpeech human voices (never train/evaluate on same speakers if training), several DEMAND noise classes, and an independent CC0 transient set. Mix at target SNR grid: -10, -5, 0, +5, +10 dB. Include at least three independent random seeds/speakers for exploratory results. Report all rows with N, median/mean, standard deviation and clipped-sample count. No successful cherry-picking. Processing modes: RAW, NLMS, actual RNNoise (when installed), TRISHUL Hybrid; display spectral-DSP fallback separately if used.

**Quality columns:** input SNR, output SNR and ∆SNR, STOI / ∆STOI, PESQ if properly licensed / installed, samples with clipping, evidence WAV link, method availability. Be aware a good output SNR can coincide with distorted speech; add listening evaluation.

## D. Hardware and streaming acceptance (future, not validated)

- Record true synchronized two-channel microphone signals and document microphone distances, level, gain, hardware sample rates, delays and sample clock.
- Compare native C implementation to Python with waveform difference/quality tolerances set *before* inspecting results.
- Native callback: duration 10 ms / frame (architecture design); target p95 compute < 7 ms, worst-case <= 10 ms **as a proposed requirement**, not a measured fact. Report underruns, callback allocations, memory and CPU on Raspberry Pi.
- Physical end-to-end microphone → Node A → link → Node B → earphone latency: report measured median/p95/max, buffering, packet loss and stress, temperature and battery if applicable. Choose end-to-end target after hardware constraints are agreed (do **not** conflate RTF with latency).
- Link dropout and return; degrade/bypass modes under sustained CPU overload, reference failure, clipping and model unavailable.
- Use live demonstrations with actual speakers, no exaggeration of hearing protection or secure-communication capability.

## E. Presentation evidence packet

1. Architecture figure mapping code commits to each stage.
2. `git log --oneline --decorate`, review PRs and CI run URLs, with explanatory commit notes.
3. Signed-off research dataset manifest and sample audio hashes.
4. Side-by-side listening demo, matched input conditions and on-screen *actual* plots.
5. CSV (raw values), summary chart, p95 compute (only after instrumented), explanations of poor cases, and honest limitations.
6. Node A / Node B live demo recordings only if physically achieved.
