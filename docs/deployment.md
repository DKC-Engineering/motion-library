# Deployment and publication

## Current status

The production Worker is live at https://cave-motion.darkknightcave.workers.dev/mcp
in the DarkKnight Cave account. Analytics Engine is activated. Staging is live at
https://cave-motion-staging.darkknightcave.workers.dev/mcp. The configuration pins
account `e2e259539144a183b4a9d5111a421825`, with the ANALYTICS_ENGINE binding
targeting analytic_events. The npm package and MCP Registry listing remain
unpublished. Do not paste credentials into chat or source files.

The current catalog snapshot is `2026-10-22.a82e12098f76` (package 0.1.2). Staging Worker version
`c22ebce7-1c82-469d-bb6e-974fce2e9fbe` and production Worker version
`4dc1e556-d865-4e83-b26b-8d314bef5180` serve it. The separate DKC site export uses
the same snapshot and awaits review and a Netlify release.
See [account migration](account-migration.md) for the previous deployment and
rollback path.

The desired branded endpoint is https://motion.darkknightcave.co/mcp. The
account move uses workers.dev and leaves the existing website's DNS in place.
Connecting the branded domain requires separate domain/hosting configuration;
do not migrate DNS as a routine deploy.

## Stage and verify

From `motion-library/`:

```sh
npm ci
npm test
npx wrangler login
npm run deploy:staging
```

For self-hosting in another account, replace `account_id` in wrangler.jsonc,
set its PUBLIC_HOST values, and update catalog/deployment.json and server.json
before building. Authentication alone does not change the pinned destination.

The CLI prints the staging workers.dev URL. Pass its `/mcp` endpoint to
`node scripts/test-http.mjs URL`. This test is intended for a quiet staging
service: it deliberately reaches the IP rate limit. Check `/health` and confirm
the snapshot matches the site build. Also connect each native editor to staging
and complete discovery, search, preparation, a missing-ID request, and restart.
Record versions and results in docs/verification.md.

## Production

The configuration uses the account's workers.dev endpoint, an approximate
120-request/60-second IP limiter per Cloudflare location, a 24KB request cap, the account plan's CPU limit per
request, and anonymous tool/outcome counters. No database, LLM billing, media
rendering service, private GitHub token, or user account system is needed.

```sh
npm run deploy
```

Verify `/health`, perform a small search/prepare smoke check, and check the
website's catalog snapshot. Static previews deploy with the Worker and do not
need the main site to be published first. Publish the DKC static site
through its existing Netlify process after reviewing the website changes.

```sh
node scripts/test-http.mjs https://cave-motion.darkknightcave.workers.dev/mcp --smoke
```

Cloudflare's [rate limiter](https://developers.cloudflare.com/workers/runtime-apis/bindings/rate-limit/)
uses eventually consistent counters at each location. It can admit requests
above the configured threshold. The previous account's staging returned 429
during its burst test; two bounded production probes there did not observe 429. Migration smoke checks do not repeat that burst or mark rate-limit
enforcement verified.

The authenticated account was on Workers Free during setup. Custom CPU limits
are rejected on Free, so the configuration uses the plan's built-in limit.
Upgrade only if observed CPU or traffic limits require it; on Paid, an explicit
`limits.cpu_ms` setting such as 50 can be added to wrangler.jsonc.
The Workers paid base is $5/month; usage can add charges. Aim for less
than $25 incremental monthly infrastructure. Review request count, CPU usage,
error rate, and cost projections at $15 and $20; the CPU ceiling and IP limiter
are not a guaranteed spending cap. Set `ENABLED=false` and redeploy to stop
hosted tool access during a cost or incident review. Local packages still work.

Cloudflare configuration and pricing:
[handlers](https://developers.cloudflare.com/agents/model-context-protocol/apis/handler-api/),
[pricing](https://developers.cloudflare.com/workers/platform/pricing/).

## Publish the isolated package

This standalone repository contains the library package. The consulting website
is maintained separately.
Review the licenses, dependency lock, notices, catalog, and pack file list.

```sh
npm pack --dry-run
```

A human maintainer must establish control of the `@darkknightcave` npm scope,
confirm the package name is available, review the GitHub repository, and publish
the reviewed version. No agent commit, push, PR, or npm publication is part of
this implementation. Add `mcpName: co.darkknightcave/motion` to npm metadata
(already prepared) and retain server.json in the package.

Verify the installed tarball offline before release. After both the remote and
npm distributions work, validate server.json against its linked schema, prove
control of the co.darkknightcave namespace, and publish through the official
[MCP Registry](https://modelcontextprotocol.io/registry/remote-servers).
The registry manifest is a publication artifact, not evidence of registration.

The gallery installation page includes the verified HTTP connection and marks
npm publication as pending. Add an npm install command only after publication.

## Rollback and removals

Record the Worker deployment version, Netlify deploy ID, npm version, and catalog
snapshot for each release. Roll back website and Worker to the same previous
snapshot. npm downloads are versioned; publish a corrected version rather than
silently changing an existing package. A removal request also needs online
content and future release updates; earlier downloads may persist.

## Analytics and privacy

Worker metrics include tool name, outcome, count, and catalog snapshot only.
Raw search terms, briefs, user IDs, and IP addresses are not sent to the metrics
dataset. The IP is used by the rate limiter. Worker request logging is disabled.
Website events use the existing analytics integration and include
recipe ID, category, and result counts. Preparing a prompt does not make a
network request. The optional contact form explicitly submits the visitor's
email, project description, team size, website, and recipe ID via the existing
contact service. Email delivery is mocked in local tests.
