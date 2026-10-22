# Contributing motion recipes

Start with a useful developer outcome, a complete brief, and documented rights.
Do not publish material just because it appears in a public repository.

## Discover sources

Run `npm run discover`. `catalog/sources.json` is the allowlist. The script reads
structured JSON through GitHub's API, records revisions, uses conditional
requests, and flags duplicates, partial prompts, private-environment references,
and possible credentials. It never evaluates repository code or fetches media.

`.github/workflows/motion-discovery.yml` runs weekly and on demand in this repository.
It has read-only repository permissions and uploads metadata reports only.
It does not commit, push, create a PR, approve, or publish an entry.

The `file-inventory` adapter checks allowlisted Markdown and JSON paths in a
revision-pinned GitHub tree. It queues file paths and blob SHAs without fetching
prompt text, media or repository code. Content, dependencies, normalized prompt
deduplication and entry-level rights remain unchecked until a curator reads the
file. Truncated trees and empty matches fail the run. Source configuration
changes also trigger discovery, even when the upstream commit has not changed.

See [source assessments](docs/source-assessments.md) for the four additional
repositories supplied on 2026-10-22. Adding a discovery source does not approve
its prompts for the callable catalog.

`review/http-cache.json` can contain raw source material and must remain local.
Only `report.json` and `report.md` are review artifacts. A source failure is
reported and fails the run without removing existing catalog entries.

## Add an original recipe

Add a row to `catalog/authored.json` with id, title, category, stack, summary,
tags, direction, and a specific limitation. IDs are stable. Keep prompts concrete
about content, timing, accessibility, assets, and verification. Do not paraphrase
an uncleared third-party prompt and call it an original.

## Approve a licensed import

Obtain entry-level permission from the rightsholder. Repository license
detection is a clue, not a substitute for the rights review. Third-party music,
fonts, screenshots, and video each need their own clearance.

Prepare a human-reviewed JSON object containing:

- id, title, category, stack, summary, tags, prompt (the concise adaptation)
- dependencies, assets, limitations (string arrays)
- creator, sourceUrl, sourceRevision, license, permissionUrl
- reviewedBy, reviewedAt (YYYY-MM-DD)
- originalPrompt, optional, only if permission covers its redistribution

Run `node scripts/approve-import.mjs /path/to/reviewed-entry.json`, inspect the
working-tree diff, then rebuild. The script rejects unknown licenses, missing
permission evidence, incomplete requirements, and obvious private-environment
or credential content. A human is responsible for the truth of the review.
Do not fill review fields on someone else's behalf without their review.

Long originals are stored separately and exposed only as an explicit resource.
Keep license notices and attribution with the entry and adaptation. Never
publish raw originals under the DKC content license.

## Reproduction evidence

Add a reference implementation to `demos/` and extend the browser verifier.
Record the model if known, implementation hash, recipe version, tested browser,
limitations, and captured still. Mark reproduction only after it runs and is
visually inspected. Do not claim independent model reproduction from a hand
implemented reference. Existing initial examples disclose that they were built
during this Codex session and the model identifier is unavailable.

`npm run verify:demos` produces checks and posters. Curators must inspect them
before release. Re-run it after changing demo code. `npm run catalog` builds a
deterministic snapshot and search index; the website and server must use the
same snapshot. Keep generated JSON changes in review.

## Corrections and removal

Remove the affected entry or original from the authored/import files, rebuild,
and redeploy both website and Worker. Remove its poster and reference code if
rights require it. Publish a corrected package and update the registry version.
Keep an internal record of the request and the resolution. Do not promise to
erase copies already downloaded, caches you do not control, or Git history.

Human maintainers handle all commits, pushes, and publication. Agents leave
changes in the working tree for review.
