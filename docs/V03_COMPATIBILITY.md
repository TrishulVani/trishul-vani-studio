# v0.3 onboarding and persistence compatibility notes

The current UI intro is not a tutorial. No tutorial MP4 or approved narration file is in the repository. First release must offer a captioned, skippable in-app tour using real controls. A video entry may show `Video coming soon` with transcript/storyboard, never a fabricated clip.

The app currently writes experiment and spectral-session metadata plus WAV media under its artifact root. Public Render storage is ephemeral and scoped by a visitor capability cookie. Database metadata alone cannot restore expired audio. Database adoption therefore requires stable endpoint JSON, owner-bound queries, idempotent migration of existing IDs/hashes, a clear missing-media state and rollback to file mode. Production MySQL credentials/provider and durable object storage are not configured; do not claim them deployed.

The direct Render app is the reliable fallback when an iframe blocks third-party cookies. A future same-origin deployment can replace that workaround only after end-to-end verification.
