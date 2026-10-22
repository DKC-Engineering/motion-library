# Security controls

The hosted server returns a versioned catalog and prepared text. It does not
execute recipe commands, render user projects or fetch upstream repositories at
request time. Tool arguments have strict schemas. Project briefs and search
text are excluded from application analytics.

Host and browser-origin checks run before the MCP handler. The IP quota is
checked before obtaining a request body reader; missing or failed quota
bindings return 503. POST requests require application/json and are limited to
24 KiB, including streamed bodies without Content-Length. Oversized streams are
canceled. Rejected requests have no-store responses, and quota rejections include
Retry-After. Unit tests cover early rejection and byte limits; protocol checks
cover the integrated Worker.

Cloudflare’s limiter is approximate and local to each Cloudflare location.
It does not provide a worldwide quota or guaranteed spending cap. No new paid
services, Durable Objects or billing changes are introduced by this patch.
Use the existing ENABLED switch to suspend hosted tools during an incident,
and review request volume, CPU, errors and account usage regularly.

Discovery only queues allowlisted source metadata. Imports require a dated
human review, entry-level rights evidence and complete requirements. Secret
patterns are a screening aid; they cannot establish that a prompt is safe.
Review instructions and dependencies before distribution. Treat imported text
as untrusted content and keep coding-agent permissions under user control.

The Claude Animation Base entry is a pinned source link. The upstream renderer
runs Chrome without its sandbox on Linux and allows local-file access. It is
not executed or bundled by this service. The DKC maintainer approved the supplied-mascot adaptation on 2026-10-22. It
is callable as hand-painted-character-film, retains John Heibel’s MIT notice,
and is labeled not reproduced. The full guide, code and media are not bundled.

Run npm test and npm audit --omit=dev before release. Dependency scans report
known advisories and do not establish exploitability. Keep lockfiles and the
website’s exact package pin in sync. No credentials belong in source, artifacts
or GitHub Actions output.

References: [Cloudflare rate limits](https://developers.cloudflare.com/workers/runtime-apis/bindings/rate-limit/)
and [contribution approval](../CONTRIBUTING.md#approve-a-licensed-import).
