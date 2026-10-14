# TRISHUL VANI product walkthrough

The [captioned 1:19 product walkthrough](https://trishul-vani-studio.onrender.com/guides/TRISHUL_VANI_Walkthrough.webm) was recorded from the deployed public site. It opens directly on the working Mission Control dashboard, has on-screen captions and no narration, and demonstrates actual browser interactions and completed API results. The hardware section is labelled as a bounded virtual software test, not a physical Raspberry Pi emulator.

| Time | Recorded screen / action | On-screen caption |
|---|---|---|
| 00:00–00:11 | Mission Control overview and application destinations | Start from the overview and choose a workspace. |
| 00:11–00:25 | Configure Engine noise, -4 dB SNR, duration and seed; run processor | Set a repeatable audio condition. |
| 00:25–00:38 | Inspect generated waveforms and compare processing paths | Run the real processor. |
| 00:38–00:47 | Open spectral studio and generate a test tone / inspect spectrum | Inspect audio in time and frequency. |
| 00:47–00:58 | Open virtual hardware, deploy bounded sample script, review task readiness | Run a bounded controller script. |
| 00:58–01:10 | Run connected software audio test and view measured backend results | Connect the virtual setup to measured DSP. |
| 01:10–01:19 | Return to spectral workspace and show help/guide destination | Continue with the full operator guide. |

The Mission Control dashboard also adapts the supplied [Instagram dashboard reference](https://www.instagram.com/p/DeRlstZTj3Q/): its task-first organization, status cards, and responsive navigation are applied within TRISHUL VANI's existing visual system. See the [indexed operator guide](https://trishul-vani-studio.onrender.com/guides/TRISHUL_VANI_Operator_Guide.pdf) for detailed workflows and limitations.

All live audio numbers shown are outputs returned by the deployed Python API for synthetic test signals. Synthetic signals do not establish real-world speech intelligibility. Hardware scripting checks a limited command vocabulary and connection/task logic; it does not compile firmware or emulate electrical timing, peripherals, or physical boards. See [`HARDWARE_WORKBENCH.md`](HARDWARE_WORKBENCH.md) and [`VALIDATION.md`](VALIDATION.md).
