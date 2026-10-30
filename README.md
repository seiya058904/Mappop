<p align="center">
  <a href="https://mappop.seiya-api.workers.dev" title="Open the Mappop editor">
    <img src="docs/assets/banner.svg" alt="Mappop — Make room for ideas. One canvas, eight ways to see the world." width="100%" />
  </a>
</p>

<div align="center">

**A little idea studio for big, beautifully tangled thoughts.**<br />
A free, open-source mind map editor with expressive themes, intuitive editing, and an optional Markdown-to-map API.

<p>
  <a href="https://mappop.seiya-api.workers.dev"><img src="https://img.shields.io/badge/OPEN%20MAPPOP-LIVE%20EDITOR-f4b7ce?style=for-the-badge&amp;labelColor=372c40" alt="Open the live editor" /></a>
</p>

<a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-69ae98" alt="MIT license" /></a>
<a href="https://github.com/seiya058904/Mappop/actions/workflows/deploy.yml"><img src="https://img.shields.io/github/actions/workflow/status/seiya058904/Mappop/deploy.yml?label=build%20%26%20deploy" alt="Build and deploy status" /></a>

<p>
  <a href="#eight-visual-worlds">🎨 Explore the themes</a> &nbsp;·&nbsp;
  <a href="#make-your-first-map">✨ Get started</a> &nbsp;·&nbsp;
  <a href="#markdown-to-mind-map">🔗 Map API</a> &nbsp;·&nbsp;
  <a href="#run-locally">🛠 Run locally</a>
</p>

<sub>Browser-based · No account required for the editor · No in-app AI subscription</sub>

</div>

---

## ✨ Ideas look better when they can grow

Mappop is a reimagined home for the open-source [Simple mind map](https://github.com/wanglin2/mind-map) editor. It keeps the practical editing tools you expect and gives your ideas eight distinctive visual worlds to live in.

<p align="center">
  <a href="docs/assets/editor-desktop.png"><img src="docs/assets/editor-desktop.png" alt="Real Mappop editor with a connected example mind map and editing toolbar" width="100%" /></a>
  <sub>Actual desktop browser capture · Click to see the full-size image</sub>
</p>

<table>
  <tr>
    <td width="50%" valign="top"><strong>🧠 Think without friction</strong><br />Edit with double-click, branch with <code>Tab</code>, add siblings with <code>Enter</code>, and rearrange ideas by dragging. Rich text, links, notes, images, outlines, and undo/redo are inherited from the editor.</td>
    <td width="50%" valign="top"><strong>🎨 Make it feel like yours</strong><br />Switch between eight original Mappop art styles and the upstream theme collection. The editor keeps the map content and layout while you change its appearance.</td>
  </tr>
  <tr>
    <td valign="top"><strong>📦 Take your ideas anywhere</strong><br />Import supported formats and export editable <code>.smm</code> / JSON, or create PNG, SVG, PDF, XMind, Markdown, and TXT copies.</td>
    <td valign="top"><strong>🔗 Connect your own tools</strong><br />An optional, authenticated Markdown API turns a structured outline into a shareable map link—useful for your scripts and external AI agents without adding an in-app model provider.</td>
  </tr>
</table>

## 🎨 Eight visual worlds

Not just a different color palette. Each style brings its own shapes, lines, typography, spacing, and subtle background treatment. **Your ideas stay the same; the atmosphere changes.**

<p align="center"><sub>Click a theme preview to open an actual screenshot of the editor using that style.</sub></p>

<table>
  <tr>
    <td align="center" width="50%">
      <a href="docs/assets/styles/pixel-arcade.png"><img src="web/public/mappop/theme-pixel-arcade-preview.svg" alt="Pixel Arcade: electric 8-bit node shapes on a midnight-blue canvas" width="100%" /></a><br />
      <strong>🕹️ Pixel Arcade</strong><br /><sub>8-bit energy · stepped panels · sharp edges</sub>
    </td>
    <td align="center" width="50%">
      <a href="docs/assets/styles/anime-pop.png"><img src="web/public/mappop/theme-anime-pop-preview.svg" alt="Anime Pop: soft pink, warm cream and sakura-inspired shapes" width="100%" /></a><br />
      <strong>🌸 Anime Pop</strong><br /><sub>Sakura details · rounded nodes · manga charm</sub>
    </td>
  </tr>
  <tr>
    <td align="center">
      <a href="docs/assets/styles/toon-motion.png"><img src="web/public/mappop/theme-toon-motion-preview.svg" alt="Toon Motion: comic-book branches and lively yellow background" width="100%" /></a><br />
      <strong>💥 Toon Motion</strong><br /><sub>Comic balloons · bold lettering · lively color</sub>
    </td>
    <td align="center">
      <a href="docs/assets/styles/zen-japan.png"><img src="web/public/mappop/theme-zen-japan-preview.svg" alt="Zen Japan: washi-paper warmth and minimal traditional Japanese shapes" width="100%" /></a><br />
      <strong>🍵 Zen Japan</strong><br /><sub>Washi textures · quiet geometry · vermilion accents</sub>
    </td>
  </tr>
  <tr>
    <td align="center">
      <a href="docs/assets/styles/ink-wash.png"><img src="web/public/mappop/theme-ink-wash-preview.svg" alt="Ink Wash: restrained charcoal and rice-paper composition" width="100%" /></a><br />
      <strong>🖌️ Ink Wash</strong><br /><sub>Soft ink contours · rice-paper calm</sub>
    </td>
    <td align="center">
      <a href="docs/assets/styles/sketchbook.png"><img src="web/public/mappop/theme-sketchbook-preview.svg" alt="Sketchbook: pencil-like borders and a hand-drawn notebook style" width="100%" /></a><br />
      <strong>✏️ Sketchbook</strong><br /><sub>Pencil lines · ruled paper · handwritten character</sub>
    </td>
  </tr>
  <tr>
    <td align="center">
      <a href="docs/assets/styles/marker-notes.png"><img src="web/public/mappop/theme-marker-notes-preview.svg" alt="Marker Notes: cheerful taped-note treatment" width="100%" /></a><br />
      <strong>📝 Marker Notes</strong><br /><sub>Sticky-note feeling · expressive marker type</sub>
    </td>
    <td align="center">
      <a href="docs/assets/styles/cyber-neon.png"><img src="web/public/mappop/theme-cyber-neon-preview.svg" alt="Cyber Neon: luminous cyan nodes on a deep digital canvas" width="100%" /></a><br />
      <strong>🌃 Cyber Neon</strong><br /><sub>Luminous links · circuit details · midnight contrast</sub>
    </td>
  </tr>
</table>

<p align="center">
  <a href="docs/assets/styles/theme-selector.png">See the complete theme selector</a>
  &nbsp;·&nbsp;
  <a href="docs/assets/complex-map.png">View a larger example map</a>
</p>

<details>
<summary><strong>📱 What about smaller screens?</strong> — See the mobile editor</summary>

<p align="center"><a href="docs/assets/editor-mobile.png"><img src="docs/assets/editor-mobile.png" alt="Mappop vertical mind map on a narrow mobile viewport" width="310" /></a></p>

On narrow viewports, the starter map uses a compact vertical layout. Tap a branch's numbered control to expand its children. This preview comes from an emulated mobile viewport; physical phones were not part of the v1.0.0 test matrix.

</details>

## 🚀 Make your first map

1. **[Open Mappop](https://mappop.seiya-api.workers.dev).** The example map is already editable; there is no sign-up step.
2. **Follow a thought.** Double-click any node to type, press `Tab` to grow a child branch, or use `Enter` to add a sibling. Drag nodes to reorganize.
3. **Choose a visual world.** Open **Themes** for the eight Mappop styles, or **Structure** to try another layout.
4. **Keep a copy.** Export an editable `.smm` file or another supported format before you close the browser or clear its data.

> [!IMPORTANT]
> Browser storage is convenient for continuing a draft, **not a durable backup**. Export important maps. Mappop does not include user accounts, cloud collaboration, or automatic cross-device sync.

## 🔗 Markdown to mind map

Have an outline already? Mappop can turn structured Markdown into a map that opens in the editor. This is a **small sharing API**, not an LLM: your script or agent produces the outline; Mappop displays it.

```sh
curl -X POST https://mappop.seiya-api.workers.dev/api/maps \
  -H "Authorization: Bearer $MAPPOP_API_TOKEN" \
  -H "Content-Type: application/json" \
  --data '{"markdown":"# A new project\n## Discover\n- Find the problem\n- Collect ideas\n## Create\n- Make a prototype\n- Share the result"}'
```

The API responds with an editor `url` and a public `markdownUrl`. **Creating a draft requires the deployment owner's write token.** The public demo does not provide a token to visitors; self-host Mappop to configure one for your own automation. Never expose that secret in frontend code or a public repo.

| Write | Read | Important limits |
| :--- | :--- | :--- |
| Authenticated `POST /api/maps` | Public `GET /api/maps/:id.md` | One root heading, supported nested headings/lists, up to **500 nodes** and **12 levels** |

> [!WARNING]
> **Anyone with the generated URL can read the stored draft.** Links do not automatically expire. That original draft is immutable; changes you make later in the editor stay in your browser and do not update the stored copy. Do not use public draft links for sensitive material.

The [API guide](docs/API.md) covers syntax, request limits, quotas, retention, error responses, and a PowerShell example. The machine-readable contract is in [`docs/openapi.json`](docs/openapi.json).

## 🛠 Run locally

Mappop includes the Vue editor, mind-map engine, and a Cloudflare Worker that serves the site and API together. You'll need **Node.js 22 or 24**, npm, and the project's locked dependencies.

```sh
git clone https://github.com/seiya058904/Mappop.git
cd Mappop
npm ci
npm run setup
npm run build
npm run db:local
npm run dev
```

Open **http://localhost:8787**. The editor works without an API token; creating drafts through the API requires your own local `.dev.vars` secret (see [deployment instructions](docs/DEPLOYMENT.md)). The build uses an OpenSSL compatibility flag only for the inherited Vue 2 / webpack 4 toolchain.

<details>
<summary><strong>🧪 Tests, deployment, and repository layout</strong></summary>

Run the existing checks:

```sh
npm test
npx playwright install chromium
npm run test:e2e
```

The v1.0.0 release recorded **12 API tests** and **12 Chromium browser tests**, including the production editor, styles, map links, import/export, and a mobile-sized viewport. See the [verification report](docs/QA.md) and [publishing workflow](.github/workflows/deploy.yml). These results do not certify physical mobile devices or Safari/Firefox.

For your own public deployment, configure a **Cloudflare Workers + D1** project, a database, rate-limit bindings, and a write token. Do not reuse the maintainer's account/database IDs. Start with [deployment instructions](docs/DEPLOYMENT.md).

```text
web/                 Browser editor and Mappop themes
simple-mind-map/      Upstream mind-map engine
worker/              Markdown draft API
migrations/          D1 schema
scripts/             Build helpers
docs/                Guides, screenshots, verification
.github/workflows/   CI and deployment
```

</details>

## 💜 Made possible by open source

Mappop is an independent derivative of [**wanglin2 / Simple mind map**](https://github.com/wanglin2/mind-map), built from upstream commit [`e8e5ef9`](https://github.com/wanglin2/mind-map/commit/e8e5ef9c41bc13ca7b13084e078123adff002242). Original history and copyright notices are retained. Mappop is **not** an official upstream release.

The source is under the [MIT license](LICENSE). The separately installed open-source theme plugin declares ISC, and bundled fonts retain their own terms. Please see [NOTICE](NOTICE), [upstream provenance](docs/UPSTREAM.md), and [asset licenses](web/public/mappop/ASSETS.md) for the details. Mappop does not include upstream's separate closed-source desktop products or their assets.

<p align="center">
  <sub>Made for the ideas that don't fit inside a straight line. ✦</sub><br />
  <a href="https://mappop.seiya-api.workers.dev">Open Mappop</a> · <a href="https://github.com/seiya058904/Mappop/issues">Feedback &amp; issues</a> · <a href="docs/QA.md">Release verification</a>
</p>
