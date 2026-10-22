# DarkKnight Cave Motion Library

Search motion recipes and prepare a prompt for your coding agent. The initial
catalog has 50 original DKC recipes, one approved MIT adaptation, 12
browser-checked reference builds, and five links to external source repositories. It covers interface motion, product
films, explainers, and procedural scenes.

The server returns instructions and requirements. Your coding agent implements
the result in your project. It does not call a model API or render video.

## Connect over HTTP

Live endpoint: https://cave-motion.darkknightcave.workers.dev/mcp

```sh
claude mcp add --transport http cave-motion https://cave-motion.darkknightcave.workers.dev/mcp
```

For Codex, configure `url = "https://cave-motion.darkknightcave.workers.dev/mcp"`
inside `[mcp_servers.cave_motion]`. For Cursor, use
`{"mcpServers":{"cave-motion":{"url":"https://cave-motion.darkknightcave.workers.dev/mcp"}}}`.
No local process or account is needed for hosted access.

## Run locally

Node.js 22 or newer:

```sh
git clone https://github.com/DKC-Engineering/motion-library.git
cd motion-library
npm ci
npm run build
npm start
```

`npm start` waits for MCP messages on standard input. Startup is silent because
stdout is reserved for the protocol. No API key or network access is required
after installation. The packaged server carries a fixed catalog snapshot.

In Claude Code, from this directory:

```sh
claude mcp add cave-motion -- node "$PWD/dist/src/stdio.js"
```

For Codex, add the absolute path to its config.toml:

```toml
[mcp_servers.cave_motion]
command = "node"
args = ["/absolute/path/to/motion-library/dist/src/stdio.js"]
```

For Cursor, use project `.cursor/mcp.json` or your user MCP settings:

```json
{
  "mcpServers": {
    "cave-motion": {
      "command": "node",
      "args": ["/absolute/path/to/motion-library/dist/src/stdio.js"]
    }
  }
}
```

Setup references: [Claude Code](https://code.claude.com/docs/en/mcp),
[OpenAI](https://developers.openai.com/codex/mcp),
[Cursor](https://cursor.com/docs/mcp).
These configuration formats follow the vendors' documentation. Protocol checks
do not establish that a native editor installation was tested; see
[verification](docs/verification.md).

## Two calls

```text
search_motion({"query":"SaaS product launch"})
prepare_motion({"id":"feature-launch","brief":"Show our scheduling product using the three screenshots I supplied.","customization":{"accent":"#35745e","duration":12,"aspectRatio":"16:9"}})
```

Exact IDs can go straight to `prepare_motion`. `get_motion` returns the full
recipe, requirements, attribution, version, and verification status. Search
accepts category, stack, verifiedOnly, includeReferences, and a limit from one
to ten (default five). Categories: ui, film, explainer, 3d. Stacks: css, svg,
canvas, threejs. Unknown IDs and unsupported customization return clear errors.
Preparation is deterministic and only supports accent, duration, and aspectRatio.

The `use-motion` prompt accepts `id` and `brief`. Resources:

- `motion://catalog`
- `motion://recipes/{id}`
- `motion://originals/{id}` for separately cleared imported originals, if any.

Source-only references are opt-in search results. They cannot be prepared and
include no copied prompt or media. First-party original recipes are not
presented as the original creator prompts from those collections.

## Gallery and deployment

The separate DarkKnight Cave Next.js site consumes a pinned package version
for its gallery at `/labs/motion-library`. Its build copies the package's demo assets and posters;
iframes only load after interaction. Prompt preparation runs in the browser.
An optional project brief explicitly submits contact details and recipe ID
through the existing contact endpoint.

The public endpoint is `https://cave-motion.darkknightcave.workers.dev/mcp`.
The branded `motion.darkknightcave.co` domain still needs separate DNS/hosting
configuration. The npm package and
MCP Registry listing remain unpublished. See [deployment](docs/deployment.md).
Reference previews are served alongside the Worker as static assets.

The optional skill is in `skills/motion-library/SKILL.md`. Copy that folder to
your agent's skill location if you want workflow guidance in addition to tools.

## Verify

```sh
npm test
npx playwright install chromium
npm run verify:demos
npm run dev
```

With the local Worker running, use another terminal:

```sh
npm run test:http
```

The HTTP check deliberately reaches the local rate limit. Wait for the
60-second window to reset before repeating it. The optional gallery integration
check accepts a website export explicitly:

```sh
npm run verify:site -- --site-out /absolute/path/to/darkknight/out
```

Browser checks can use an
existing Chromium with `-- --browser-executable /absolute/path/to/browser`.
Use `node scripts/test-http.mjs URL --smoke` against production to omit the
deliberate burst. Cloudflare's limits are approximate and apply per location;
see [verification](docs/verification.md) for the observed results.

See [repository layout](docs/repository-layout.md) for the website package
boundary and release workflow. Cloudflare hosting is independent of the Git
checkout location; moving this repository does not change the live MCP URL.

## Catalog maintenance and licensing

Read [CONTRIBUTING.md](CONTRIBUTING.md) for source discovery, entry-level rights,
approval records, and reproducibility. Discovery reports never publish entries.

New code: [MIT](LICENSE). Original DKC recipe text: [CC BY 4.0](LICENSE-CONTENT).
Imported content retains its own license and notices. See [NOTICE](NOTICE).
For corrections or removal, email hello@darkknightcave.co with the recipe ID,
source link, and the affected material. Prior downloads may persist.
