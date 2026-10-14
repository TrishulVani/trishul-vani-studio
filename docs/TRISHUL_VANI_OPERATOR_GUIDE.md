# TRISHUL VANI Operator Guide

**Release:** 1.0 | **Audience:** college research teams and engineering reviewers | **Updated:** 2026-10-14

## Official workspace

- Main site: https://trishul-vani-frontend.onrender.com/
- Mission Control and audio workspace: https://trishul-vani-frontend.onrender.com/lab.html?design=2
- Virtual hardware: https://trishul-vani-frontend.onrender.com/hardware.html
- Spectral Studio: https://trishul-vani-frontend.onrender.com/studio.html
- API reference: https://trishul-vani-studio.onrender.com/docs
- Source and change history: https://github.com/TrishulVani/trishul-vani-studio

The Render address is the public site. GitHub is source control and CI. If the backend has been idle, its first request may take longer while the service wakes. The static introduction and interface load separately from audio processing.

## 1. Mission Control

The trident introduction moves to the main workspace. Enter Site or a scroll gesture advances immediately. The overview dashboard is the starting point: use the navigation rail and workspace cards to open Audio Laboratory, Spectral Studio, Hardware Workbench, datasets, results, and diagnostics. The dashboard follows the supplied Instagram reel's clear status cards, direct task entry points, and responsive layout while keeping the site's dark forest and gold visual system.

Dashboard design reference: [Instagram reel supplied for this project](https://www.instagram.com/p/DeRlstZTj3Q/). The implementation adapts its compact status cards, task-first navigation, and responsive layout to TRISHUL VANI's visual language.

Use the overview to pick a task. The lower page contains the detailed workspace sections for users who prefer one continuous page. The top navigation takes users directly to each section.

## 2. Run an audio experiment

1. Open Audio Laboratory and choose Factory, Engine, Wind, Impulse, or Crowd.
2. Set the input signal-to-noise ratio, duration, and random seed. Keep the seed fixed when comparing a code or parameter change.
3. Select **Run signal analysis** and wait for a completed experiment ID. The API generates a synthetic two-channel test and runs the available RAW, NLMS, Spectral DSP, and Hybrid paths.
4. Choose an output channel and press Play. Playback is always user initiated. Compare the same time interval across tracks.
5. Review waveforms, method metrics, experiment history, and downloadable CSV/WAV outputs. SNR is meaningful only with a valid clean reference; speech intelligibility scores need suitable real speech. Unsupported measurements remain blank.

The built-in synthetic voice is a formant-like test tone, not human speech. Use appropriately licensed recordings for intelligibility evaluation. Do not present synthetic test results as field performance.

## 3. Work with an audio library

The laboratory accepts clean reference speech and environmental noise files for controlled comparisons, plus synchronized dual-microphone WAV captures when available. Use uncompressed WAV where possible, note the sample rate/channel layout, and keep source files and experiment parameters with your lab record. The server workspace is temporary; export results you need to retain. Review dataset licenses before using or redistributing external recordings.

The public Dataset Vault lists research sources and provenance. It does not silently download or republish external audio. For reproducible college evaluations, record the dataset name, license, speaker/noise split, sample rate, channel alignment, and random seed outside the web session.

## 4. Inspect and edit in Spectral Studio

1. Open Spectral Studio and load a permitted audio file.
2. Inspect the generated time-frequency display. Use the selection controls to choose a region, audition the result, and apply attenuation or isolation.
3. Compare against the immutable source layer and use undo/redo to review changes.
4. Export the edited WAV and JSON recipe. The recipe records the edit choices so a reviewer can reproduce them.

The story-page spectrum says **Illustrative Preview** before any sample is generated. That preview is artwork and is not measured audio. After a successful generated run, the panel changes to the measured STFT from its PCM output.

## 5. Inspect the virtual hardware

Open Hardware Workbench from the dashboard. In the 3D assembly, drag to orbit, use the wheel to zoom, and select component hotspots to inspect the conceptual signal path. The enclosure is a research concept, not dimensioned CAD or a manufacturing drawing.

In Virtual Circuit, select a source port and a compatible destination port to add a logical wire. Inspect a net for source, destination, and signal type. Select a listed wire to remove it. **Load reference circuit** restores the example. Add Raspberry Pi Pico W, ESP32-S3, or Raspberry Pi 4 Model B boards and export the netlist plus scripts as JSON.

The connection checker verifies logical port compatibility and required signal routes. It does not calculate voltage, current, timing, thermal load, electrical safety, radio behavior, or microphone synchronization. Do not build physical wiring from this simulator.

## 6. Write and test controller scripts

Choose a virtual controller, click **Example**, edit the bounded script, then click **Deploy & run virtual rig**. The interpreter accepts only documented commands; it does not execute or flash Python, C, MicroPython, shell, or arbitrary firmware.

```text
MODE HYBRID
STREAM ON
SET GPIO17 HIGH
READ GPIO27
SEND UART READY
WAIT 100
LOG signal path ready
```

Supported operations are `MODE`, `STREAM`, `SET`, `READ`, `SEND UART`, `WAIT`, and `LOG`. A script may contain at most 40 lines per controller. The serial monitor reports line-specific errors and virtual pin state. Task checks show whether the selected control script and logical netlist satisfy expected software conditions.

Change one line at a time, rerun, and compare the task report. For example, `STREAM OFF` should block the receiver route; restoring `STREAM ON` should make the route eligible again. This verifies the virtual rule engine, not a physical microcontroller.

## 7. Connect a virtual configuration to real DSP

After the virtual rig reports ready, configure Factory, Engine, Wind, Impulse, or Crowd in **Connected Software Test**. Set SNR, duration, and seed, then select **Run connected DSP test**. This calls the existing Python API and returns measured software outputs. Choose RAW, NLMS, Spectral DSP, or Hybrid for playback; open the same run in the audio lab for detailed charts and exports.

The virtual controller selection does not replace the Python algorithms or execute a hardware-specific build. The backend test uses synthetic audio. Its processing time is host-side runtime, not microphone-to-ear latency or Raspberry Pi performance.

## 8. Repeatable evaluation plan

For a college demonstration, keep one experiment sheet per test: objective, app release, browser/device, input files and licenses, scenario, SNR, duration, seed, selected algorithm, run ID, output files, result, error, and operator notes. Repeat each synthetic condition with the same seed before changing one parameter. Then vary seed and scenario to assess sensitivity. For real speech, use an aligned clean reference and report which metrics are valid.

Suggested matrix:

| Test | Change | Evidence to save |
| --- | --- | --- |
| Baseline | Factory, fixed seed, default controls | Run ID, parameters, all output WAVs and CSV |
| Noise shift | Factory to Wind, same seed and SNR | Output comparison and any controller status change |
| SNR sweep | -10 dB, 0 dB, +10 dB | Per-method results; note missing references |
| Script gate | `STREAM ON` to `STREAM OFF` | Serial log and task report |
| Wiring gate | Remove and restore one required net | Connection diagnostics and task report |
| Repeatability | Repeat unchanged configuration | Matching parameters and comparable output files |
| Real speech | Licensed speech plus aligned clean reference | Dataset provenance and valid SNR/STOI/PESQ only |

## 9. Errors and recovery

- **Processor unavailable:** use Retry connection, allow the API service to wake, then run again. The site interface is static and can open even when the processor is unavailable.
- **CORS or failed request:** reload the Render site address and confirm the processor badge reconnects. Do not use the old GitHub Pages address as the current application.
- **Invalid experiment:** verify scenario, SNR range, duration, and seed; retry with the same seed after fixing the setting.
- **No audio playback:** complete an experiment first, choose a track, and press Play. Audio never autoplays.
- **No 3D model:** enable WebGL2 or use the section controls and virtual wiring bench. The interface provides a non-WebGL fallback.
- **Script error:** read the line-specific serial message and use only the documented command set.
- **Empty spectral panel:** before audio generation it is labeled as an illustrative preview. A measured spectrogram appears after a successful run.

## 10. Engineering limits and next gates

This is a software research prototype for college demonstrations and engineering review. It is not yet qualified for DRDO testing, military deployment, safety-critical communication, or operational use. The virtual board and wire system are logical software checks; no real hardware connection, firmware execution, electrical simulation, or device performance is established by them.

Before any laboratory hardware evaluation, engineers must select exact components, design and review power and signal interfaces, verify a synchronized two-channel audio converter, implement and inspect firmware, measure electrical and thermal behavior, test real devices, and assess acoustic performance with licensed representative speech/noise data. Independent engineering and safety review is required before operational claims.

The Render free service may sleep between uses and server-side experiment storage is temporary. If a scheduled presentation requires guaranteed availability or persistent records, arrange an appropriate hosting plan and external database/storage with the project owner. Export evidence after each run.

## Quick links

- [Main website](https://trishul-vani-frontend.onrender.com/)
- [Mission Control](https://trishul-vani-frontend.onrender.com/lab.html?design=2)
- [Audio Laboratory](https://trishul-vani-frontend.onrender.com/lab.html?design=2#audio-lab)
- [Hardware Workbench](https://trishul-vani-frontend.onrender.com/hardware.html)
- [Spectral Studio](https://trishul-vani-frontend.onrender.com/studio.html)
- [API documentation](https://trishul-vani-studio.onrender.com/docs)
- [GitHub project](https://github.com/TrishulVani/trishul-vani-studio)
