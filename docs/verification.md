# Verification record

Run the checks from the package directory. Machine-readable evidence is kept
under `evidence/` and `catalog/evidence.json`.

For snapshot `2026-10-22.a82e12098f76` (package 0.1.2), all sixteen library
tests and six website package/contact tests pass. All thirty benchmark queries
return a relevant recipe in the top three. The separate website export builds
102 pages, including 51 recipes. Chromium checks cover the gallery, mobile
layout, previews, local preparation, mocked contact attribution and the imported
recipe’s MIT license. The installed tarball completes discovery, all three
tools, the MCP prompt and recipe resources over local stdio.

Production HTTP smoke checks passed with warm-search p95 of 114.51 ms across
sixty samples from this machine; staging passed at 104.53 ms. These sequential
smoke checks do not establish multi-region latency under load. Reports are in
`http-production-report.json`, `http-staging-report.json`, `package-report.json`,
`site-report.json`, `approved-import-report.json` and `security-release.json`
under `evidence/`. The preceding package report is retained under
`evidence/prior-releases/`.

The Claude Animation Base adaptation was explicitly approved by the DKC
maintainer before import. It retains John Heibel’s MIT notice and is labeled
not reproduced. No new character animation or video was rendered in this
release. The original twelve reference-build claims are unchanged.

Historical reports from the personal-account deployment are preserved under
`evidence/prior-account/`. See [account migration](account-migration.md).

The personal production and staging Workers were deleted at the user's request.
`personal-worker-retirement.json` records their empty account inventory, both
old URLs returning 404, and successful checks of all three tools on the active
DarkKnight Cave endpoint.

| Check                                  | Method                                                                                                         |
| -------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| Catalog, rights, customization, errors | `npm test`                                                                                                     |
| Search relevance                       | Thirty queries in test/search-benchmark.json; minimum 80% top-three                                            |
| Local stdio protocol                   | Official TypeScript client against the built child process                                                     |
| Hosted protocol                        | `npm run test:http` against local workerd or quiet staging                                                     |
| Reference builds                       | `npm run verify:demos`; Chromium desktop/mobile, seek, keyboard and reduced motion                             |
| Gallery and brief                      | Website production export, then `npm run verify:site -- --site-out /path/to/site/out`; contact delivery mocked |
| Worker bundle                          | `npx wrangler deploy --env '' --dry-run`                                                                       |
| Package boundary                       | `npm pack --dry-run`                                                                                           |

The initial twelve demos are reference implementations authored during the
Codex session. Their evidence explicitly records that the underlying model
identifier is unavailable. They are not benchmark claims about Claude, Codex,
or any other model reproducing a creator video from a prompt.

The latency report describes the runtime and endpoint actually exercised.
Local warm latency is not a production geographic latency measurement. A
single-machine production probe does not establish global latency under load.

The previous account's staging returned 429 during its burst check. Two bounded
production probes there did not observe 429. The new account's checks omit the
burst, so production rate-limit enforcement remains unverified.
Cloudflare documents approximate counters per location; see deployment.md.
Use `node scripts/test-http.mjs URL --smoke` for protocol, latency, origin,
request size, and malformed-request checks without a deliberate rate-limit
burst. Smoke reports identify the omitted burst explicitly.

Native editor checks remain separate from SDK protocol checks:

| Client      | Configuration source                                 | Native installation       |
| ----------- | ---------------------------------------------------- | ------------------------- |
| Claude Code | Documentation and installed 2.1.308 CLI help checked | Native connection pending |
| Codex       | Documentation and installed 0.163.0 CLI help checked | Native connection pending |
| Cursor      | Official MCP documentation linked in README          | Pending                   |

Before launch, record each client version and date, connect it to staging, list
tools, run search → prepare, inspect an error, and restart the connection. Do not
mark these checks passed based only on the SDK tests or documentation review.

Existing site lint warnings may be unrelated to the motion library; preserve
them in the handoff. Test runs must not send real contact emails.
