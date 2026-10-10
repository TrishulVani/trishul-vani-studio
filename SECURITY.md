# Security & safety notice

This is a research application intended for use by a trusted developer **on localhost**. It accepts audio uploads, stores them locally, and may optionally execute FFmpeg on uploaded audio. It is **not** authenticated or rate-limited for hostile internet use; do not expose directly to the public internet. The prototype is not secure communication, hearing protection, emergency warning or certified military hardware.

Existing controls: same-origin API; constrained scenario inputs; audio duration and 20 MiB per-file limits; strict artifact name whitelist; no user-controlled shell execution; no secrets committed; local-only Compose bind; unprivileged Docker user.

Before any remote deployment: implement auth, TLS, request/rate quotas, retention/delete policy, isolated FFmpeg workers, audit logs, network access controls, dependency scanning, pinned images/actions, and DAST. Human speech may contain personal data; get consent, keep datasets private and define retention.

To report a sensitive issue, contact the repository maintainers privately rather than disclosing a working exploit in a public issue.
