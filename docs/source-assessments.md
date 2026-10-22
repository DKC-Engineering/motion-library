# Additional source assessments

Checked on 2026-10-22. All four repositories are now discovery sources. These
notes record candidate material and published license boundaries. They do not
approve any prompt, character, asset or media for redistribution. The callable
catalog contains 50 original DKC recipes and one maintainer-approved MIT
adaptation from Claude Animation Base. A source-only reference remains
available through opt-in MCP search.

| Source                                                                     | Useful material                                                         | Published rights and review boundary                                                                                 | Import priority                                          |
| -------------------------------------------------------------------------- | ----------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| [Lemo-Opuscar](https://github.com/lemomo-ai/lemo-opuscar)                  | 59 style guides, plus a separate 98-film style catalog                  | Code and docs are MIT. Demo films/stills are CC BY 4.0, with voice-track exclusions and separate asset licenses.     | High: select style guides and check their dependencies.  |
| [15 Motion Design Styles](https://github.com/Vincentwei1021/mg-styles-15)  | 15 complete prompt files with implementation source and review material | README explicitly includes project prompts, docs, code and films under MIT; third-party material keeps its licenses. | Highest: the prompt files map directly to recipes.       |
| [P(doom) Video](https://github.com/mexicat/pdoom-video)                    | Deterministic scenes, timeline, rendering and motion-blur techniques    | Code is MIT. Song, lyrics and lyric timings are excluded; fonts have separate licenses.                              | Later: assess code techniques using replacement content. |
| [Claude Animation Base](https://github.com/JohnHeibel/ClaudeAnimationBase) | p5.js/p5.brush character kit, guide and render workflow                 | Repository has an MIT license. Review character/asset use and external dependency licenses before adaptation.        | High for a hand-drawn character recipe.                  |

## Lemo-Opuscar

Revision: `3961ddb3d24d8876e0e2754f7790d66908acee51`.

Discovery inventories `styles/*/STYLE.md`, excludes the template, and records
`styleboard/opuscar98_styles.json` as one separate catalog requiring content
review. It does not expand that catalog into 98 approved recipes.

The [README license section](https://github.com/lemomo-ai/lemo-opuscar/blob/3961ddb3d24d8876e0e2754f7790d66908acee51/README.md#licence)
excludes the voice tracks in Game Show Flat, Paper-cut Lightbox and Broadcast
News Package from its demo license. Check each demo's credits before using any
media. Style adaptations must preserve the applicable attribution and notices.

## 15 Motion Design Styles

Revision: `49052d80bfaf9fa8412cc9710530e5e95a3b8d8c`.

Discovery inventories the 15 `prompts/*.md` files. Begin with a small selection
covering flat vector, line boil, shape morph and isometric motion. Review every
prompt's technical route: some use browser rendering, while the 3D example also
offers Blender. Render dependencies, fonts and assets must be explicit in an
adapted recipe.

The [README license section](https://github.com/Vincentwei1021/mg-styles-15/blob/49052d80bfaf9fa8412cc9710530e5e95a3b8d8c/README.md#license)
includes project prompts under MIT. Preserve the Vincentwei1021 copyright and
MIT notice with imports. Font-derived glyphs and other third-party files retain
their own licenses. Keep the complete original separate from DKC's shorter
adaptation; do not relabel an edit as the full original prompt.

## P(doom) Video

Revision: `fa164b74fd0b26a99375715b619c55b4a0fb3d05`.

Discovery inventories `docs/ENGINE.md` and `docs/TREATMENT.md` as implementation
references. Exclude the song, lyrics, lyric timings and bundled fonts from
imports. A technique recipe should use supplied or original content, state its
Bun/TypeScript/Three.js and render requirements, and credit Giacomo Magnanini
where MIT code is used. Read the treatment separately for song-specific content.

Evidence: [README license section](https://github.com/mexicat/pdoom-video/blob/fa164b74fd0b26a99375715b619c55b4a0fb3d05/README.md#license)
and [MIT license](https://github.com/mexicat/pdoom-video/blob/fa164b74fd0b26a99375715b619c55b4a0fb3d05/LICENSE).

## Claude Animation Base

Revision: `0ac8bf2b31942376cb6b8c4074715595d512acd2`.

Discovery inventories `ANIMATION_GUIDE.md`. The follow-up review also read
`README.md`, `LICENSE`, `package.json`, `studio.html` and `render.mjs` at this
revision. The latest upstream commit still matches the pinned revision.

Review and adapt a complete workflow
around supplied characters. State Node.js, Chrome, ffmpeg, p5.js and p5.brush
requirements. The README warns that watercolor rendering can be slow without
a dedicated GPU; record that limitation and test the adapted recipe locally.
Preserve John Heibel's MIT notice with any imported material.

The renderer launches Chrome with `--no-sandbox` on Linux and allows local-file
access. Its crop expressions are evaluated inside the browser page. Do not pass
untrusted expressions or render repositories with access to secrets. Prefer a
sandboxed browser; if the upstream Linux route is required, isolate it in a
disposable environment. `studio.html` also loads a Google font remotely; replace
or vendor it for an offline build after reviewing its license. No renderer code,
characters, model sheets, fonts, media or original guide text is redistributed
in the MCP.

The public entry is `reference-claude-animation-base`. Use
`search_motion` with `includeReferences: true` and a query such as
`p5 brush hand-drawn character`, then `get_motion` to follow the source.
The source link is unavailable to `prepare_motion`. The maintainer explicitly
approved the supplied-mascot candidate on 2026-10-22. Its callable adaptation is
`hand-painted-character-film`, with the source revision, MIT notice and review
record in `catalog/approved-imports.json`. It has not been reproduced. No full
original guide is distributed. The local review artifact remains under ignored
`review/`; the approved entry and notice ship with the package.

Evidence: [README](https://github.com/JohnHeibel/ClaudeAnimationBase/blob/0ac8bf2b31942376cb6b8c4074715595d512acd2/README.md)
and [MIT license](https://github.com/JohnHeibel/ClaudeAnimationBase/blob/0ac8bf2b31942376cb6b8c4074715595d512acd2/LICENSE).

## Publication gate

A curator must review the exact source file, complete requirements, asset
rights, attribution, private-environment instructions and duplicate content.
Use the existing licensed-import approval format after that review. Source
inventory entries remain outside the hosted MCP and gallery until approved.
