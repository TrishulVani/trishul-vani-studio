# Contribution & review contract

1. Create a feature branch from current `main`: `feat/<milestone>-<short-name>`.
2. Add code + tests + a concise doc update; use conventional commits (`feat(dsp): ...`, `test(api): ...`, `docs: ...`).
3. Run `python -m pytest`, `python -m compileall -q app scripts`, `node --check web/app.js`. Optional: `docker build -t trishul-vani .`.
4. Push the branch **for each passing milestone**. Open a pull request; prefer review before merging to `main`. CI must pass and the PR must document evidence and limitations.
5. No fabricated objective metrics or placeholder data presented as measured. No raw model, dataset, PII or secrets in Git. No force-push to shared branches. Record source licenses and dataset SHA-256.
6. Keep external ML model/runtime execution out of UI threads; treat microphone/network calls as untrusted inputs. Honor maximum request sizes and audio lengths.
7. Commit the tested change before moving to a different milestone. Keep the previous green state available for rollback.
8. Do not merge untested changes. If a tool/network blocker exists, document it in PR and stop instead of pretending success.
