# Cloudflare account migration

The MCP moved from the personal account to the DarkKnight Cave account on
2026-10-22. Worker code, 50 recipes, twelve demos and the stateless protocol
stay the same. The endpoint and preview URLs change, producing catalog
snapshot `2026-10-22.105bd97e16a9`.

| Setting                   | Previous account                                       | DarkKnight Cave account                                      |
| ------------------------- | ------------------------------------------------------ | ------------------------------------------------------------ |
| Account ID                | `e8ea528333563250f68d6aab6bb09c8e`                     | `e2e259539144a183b4a9d5111a421825`                           |
| Production endpoint       | `https://cave-motion.srshah19.workers.dev/mcp`         | `https://cave-motion.darkknightcave.workers.dev/mcp`         |
| Staging endpoint          | `https://cave-motion-staging.srshah19.workers.dev/mcp` | `https://cave-motion-staging.darkknightcave.workers.dev/mcp` |
| Catalog                   | `2026-10-22.1b9ced102c7a`                              | `2026-10-22.105bd97e16a9`                                    |
| Production Worker version | `8070bb22-d498-48a0-b7a5-00170e424657`                 | `b7d770c5-0cb6-404e-bd3d-c76a02c848d6`                       |
| Staging Worker version    | See prior-account evidence                             | `27846e46-3694-4126-9746-ba973b181644`                       |

The new account's `darkknightcave.workers.dev` subdomain was registered during
setup. wrangler.jsonc pins its account ID, so a later login to a different
account cannot silently redirect deployment. No paid plan was activated.

## Cutover

Staging was deployed and checked before production. Analytics Engine was
activated in the new account, and production was deployed with its dataset
binding. The rebuilt installation page and registry manifest use the new URL.
Change existing client configurations to the new production URL. The main
site's Netlify publication remains a separate human-reviewed release.

## Compatibility and rollback

At the user's explicit request, the personal account's `cave-motion` and
`cave-motion-staging` Workers were deleted on 2026-10-22. Its Worker list is
empty, and both old MCP URLs return 404. Existing clients must use the
DarkKnight Cave endpoint. All three tools still pass checks there.

Historical HTTP and package evidence is preserved under
`evidence/prior-account/`. The retirement checks are recorded in
`evidence/personal-worker-retirement.json`. The account-wide workers.dev
subdomain and historical analytics data were left in place. New analytics
events belong to the DarkKnight Cave account's analytic_events dataset.

The retired personal URLs are no longer rollback targets. To recover from a
future bad release, restore a reviewed Worker version or redeploy a known-good
build in the DarkKnight Cave account. Roll the website back to a compatible
catalog that still uses the active DarkKnight Cave endpoint.
