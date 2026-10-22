# Verification record

Run the checks from the package directory. Machine-readable evidence is kept
under `evidence/` and `catalog/evidence.json`.

For snapshot `2026-10-22.105bd97e16a9`, the package and contact tests pass,
all thirty benchmark queries return a relevant recipe in the top three, and
the separate website production export succeeds. Chromium checks cover the gallery,
mobile layout, previews, local preparation, and a mocked contact submission.
The installed npm tarball completes discovery, all three tools, the MCP prompt,
and resource retrieval after an offline installation.

The DarkKnight Cave account's production HTTP smoke check passed with a
warm-search p95 of 99.8 ms across sixty samples from this machine. Staging
passed at 102.36 ms. This is a smoke measurement, not a
multi-region load test. Reports are in `http-production-report.json`,
`package-report.json`, and `site-report.json` under `evidence/`.
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
