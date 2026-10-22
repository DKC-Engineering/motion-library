# Motion Library agent guidance

- Never commit, push, merge, or open pull requests. Leave changes for human review.
- Discuss changes that alter the agreed product or architecture before implementing them.
- Read the available no-ai-slop skill before writing public copy. Keep feature and verification claims tied to evidence.
- Keep the catalog and browser-safe search/preparation core shared by the MCP and website package consumers.
- Require dated human review and entry-level rights evidence before publishing imported prompts or media.
- Keep `review/`, `.wrangler/`, `node_modules/`, environment files and credentials out of Git and release packages.
- Run `npm test` after catalog or server changes. Re-run demo verification when demo code changes.
- Use `npm run verify:site -- --site-out /absolute/path/to/site/out` only for an explicit website integration check. The standalone build must not require the consulting website.
- Cloudflare deploys target the account pinned in wrangler.jsonc. Do not change accounts, DNS or billing as a routine release step.
