# Upstream provenance

Mappop is based on the open-source [wanglin2/mind-map](https://github.com/wanglin2/mind-map) repository at commit [`e8e5ef9c41bc13ca7b13084e078123adff002242`](https://github.com/wanglin2/mind-map/commit/e8e5ef9c41bc13ca7b13084e078123adff002242). Its upstream history is retained. The engine reports version `0.14.0-fix.3` at this baseline.

## What comes from upstream

The JavaScript mind-map engine in `simple-mind-map/`, Vue 2 / Element UI web editor in `web/`, open-source editor features, and existing open-source themes originate upstream. The original copyright and complete MIT text remain unchanged in [LICENSE](../LICENSE).

Upstream documentation is available at [Simple mind map documentation](https://wanglin2.github.io/mind-map-docs/). Mappop is independently maintained and is not an official upstream release.

## What Mappop changes

- Product branding, English defaults, and an editable first-run example.
- Eight original visual theme families, local font assets, and lightweight SVG textures.
- An external map API and a link-opening workflow for the editor.
- Cloudflare deployment setup, automated checks, documentation, and contribution templates.
- Removal of in-app LLM entry points, upstream analytics, and closed-client promotional UI.

The current working tree also omits upstream's prebuilt distribution, closed-product promotional screenshots, and duplicate product READMEs. Their historical commits remain in the retained Git history; Mappop builds its own distribution from source.

The library identity and upstream notices are retained. Browser drafts and the editable `.smm` data structure remain compatible with the editor.

## License boundaries

The root MIT license covers the upstream open-source repository and Mappop's original contributions. Dependencies and bundled fonts keep their own licenses.

The installed `simple-mind-map-plugin-themes@1.0.0` package declares **ISC** in its distributed `package.json`. That inspected package has no separate LICENSE file and its author field is empty. [NOTICE](../NOTICE) records these facts. This package is distinct from upstream's closed-source desktop theme catalog; do not infer permission to copy assets from a closed client.

Upstream's README distinguishes the open-source JavaScript library/web editor from separately distributed **closed-source desktop clients and plugins**. Mappop does not bundle those products, extract their assets, or claim their functionality. Historical files remain attributable to their original authors; preserving Git history is not a new license grant for separately licensed materials.

Mappop's favicon, README banner, and theme textures are newly authored geometric SVG assets. Font notices are shipped alongside the font files in `web/public/mappop/fonts/`.

## Updating from upstream

Keep upstream changes separate from Mappop-specific changes. Review licensing and asset provenance before importing new files, preserve the original notices, and run the relevant editor/API checks after merging. Retain Mappop's storage behavior, public API contract, and absence of in-app model-provider integration unless a deliberate project decision changes them.
