# Virtual hardware workbench

The Design 02 preview includes [`/hardware.html`](../web/hardware.html). It adapts the 3D geometry from the user-supplied `TRISHUL VANI PROTOTYPE 1.html`, replacing its embedded demonstration audio with a connected software test. The WebGL2 viewer lets a visitor orbit, zoom, open, explode and cut away the conceptual enclosure. It is an assembly visualization, not a dimensioned CAD or manufacturing model.

## Workflow

1. Inspect the enclosure and each signal-path chapter.
2. Wire a close-talk microphone and ambient reference into one logical two-channel capture interface, then route it through a Raspberry Pi 5 concept board to a listener. The reference netlist also contains a Pico W and ESP32-S3 as optional controllers. Add boards, connect compatible ports, remove wires and export the netlist with scripts as JSON. The local browser saves the design.
3. Select a controller and run the bounded virtual command language (`MODE`, `SET`, `READ`, `SEND UART`, `WAIT`, `LOG`). The serial output and pin states are simulated in the browser; no Python, MicroPython, C or shell code is executed or flashed.
4. Run a software experiment. A valid logical netlist gates the request, then the page calls the existing FastAPI `/api/experiments/simulate` endpoint. The metrics and WAV playback are those of the actual Python processor. Open the same run in the V2 audio laboratory with its `run` and `track` URL parameters.

## Boundaries

The virtual wiring enforces port type/direction and checks core signal, power and return connections. It does **not** simulate electrical loading, voltage/current, timing, firmware, Linux, radio transport, I2S/USB compatibility, microphone phase alignment, heat or physical fit. The 3D model has nominal proportions. The software experiment uses synthetic input; its measured audio quality and host processing time do not validate latency or performance on Raspberry Pi hardware. Do not use this design as a wiring or safety guide.

Real implementation requires selection and measurement of a shared-clock dual-channel ADC, board-specific pin and supply design, actual firmware, native streaming DSP, recorded microphone data and bench validation. Raspberry Pi GPIO operates at 3.3 V; the logical `5V` labels in the workbench refer to the board power input, **not** a signal GPIO. Check the [Raspberry Pi hardware documentation](https://www.raspberrypi.com/documentation/computers/raspberry-pi.html), [Pico / MicroPython documentation](https://www.raspberrypi.com/documentation/microcontrollers/micropython.html) and [ESP32-S3 I2S documentation](https://docs.espressif.com/projects/esp-idf/en/stable/esp32s3/api-reference/peripherals/i2s.html) before selecting real parts.

Browser integration tests in `tests/e2e/hardware.spec.cjs` cover the model UI, removing and restoring a logical wire, controller script output, a real FastAPI software run, V2 run handoff, responsive layout and the enlarged Hindi `त्रि` mark. The existing DSP/unit tests remain the source of algorithm validation.
