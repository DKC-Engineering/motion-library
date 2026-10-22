# Repository layout and website releases

The standalone project is at `../motion-library` beside the DKC website's
`darkknight` checkout. Its GitHub repository is
[DKC-Engineering/motion-library](https://github.com/DKC-Engineering/motion-library).
The working folders can live anywhere; neither project's production build
imports source from the other checkout.

The library owns the catalog, search/preparation core, MCP transports, demos,
licenses, import review tooling and discovery workflow. The website owns its
gallery, navigation, SEO, analytics, project briefs and contact service.

## Package boundary

`@darkknightcave/motion-mcp` exports browser-safe core functions from its main
entry, types from `/types`, catalog JSON from `/catalog`, valid contact recipe
IDs from `/recipe-ids`, and metadata from `/package.json`. The MCP server has
its own `/server` entry. Prebuilt demo assets are under
`public/motion-library/` in the installed package.

The website currently pins `file:vendor/darkknightcave-motion-mcp-0.1.2.tgz`.
Its lockfile records the package integrity. This reviewed release artifact
allows a clean Netlify checkout to build before npm publication. The website
copies its assets and consumes its catalog without rebuilding library sources.
Private discovery caches and local deployment state are excluded from the
package and from Git.

## Update the website

In this standalone checkout:

```sh
npm ci
npm test
npm pack --pack-destination /absolute/path/to/darkknight/vendor
```

For each published release, increment the package version and registry manifest
together. Copy the new tarball into the website's vendor directory, update its
exact file dependency, then run its package manager to refresh the locks.
Run `npm run test:motion` and `npm run build` in the website checkout. Match
the website's catalog snapshot to the intended Worker release before deploying.

After npm publication, the website can replace the file dependency with an
exact npm version using the same exports. Do not use a floating version range.

To check the website with this project's Chromium verifier:

```sh
npm run verify:site -- --site-out /absolute/path/to/darkknight/out
```

## Rollback and review

Keep the previous reviewed tarball and lockfile available when updating the
website. Roll back that dependency and rebuild if an integration fails. Worker
deployments and URLs do not depend on checkout paths. This extraction does not
redeploy or modify the live Worker.

Humans handle commits, pushes and publication. The initial extraction leaves
both projects' changes available for review and makes no Git commits.
