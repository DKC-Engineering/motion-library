# Hosted Hero Backgrounds

Original, permitted video hero loops hosted in the `cave-motion-assets` Cloudflare R2 bucket. These assets are optimized for looping web hero backgrounds and pair directly with the `video-background-hero` recipe in `cave-motion`.

## Catalog of Backgrounds

| ID | Preview | Specs | Recommended Theme |
| :--- | :--- | :--- | :--- |
| **`sakura-garden`** | [Video](https://pub-9cd00a06634147dfaf578df671f68d21.r2.dev/backgrounds/sakura-garden.mp4)<br>[Poster](https://pub-9cd00a06634147dfaf578df671f68d21.r2.dev/backgrounds/sakura-garden.jpg) | 1280x720<br>24fps · 8.04s<br>H.264 · 7.3 MB | Serenity, craftsmanship, architectural design, travel, Japanese aesthetic. |
| **`bat-flight`** | [Video](https://pub-9cd00a06634147dfaf578df671f68d21.r2.dev/backgrounds/bat-flight.mp4)<br>[Poster](https://pub-9cd00a06634147dfaf578df671f68d21.r2.dev/backgrounds/bat-flight.jpg) | 1280x720<br>24fps · 8.04s<br>H.264 · 6.4 MB | Cyberpunk, dark mode, AI/stealth tech, dev tools, LED display aesthetic. |
| **`rose-bloom`** | [Video](https://pub-9cd00a06634147dfaf578df671f68d21.r2.dev/backgrounds/rose-bloom.mp4)<br>[Poster](https://pub-9cd00a06634147dfaf578df671f68d21.r2.dev/backgrounds/rose-bloom.jpg) | 1280x720<br>24fps · 8.00s<br>H.264 · 1.5 MB | Haute couture, luxury editorial, dark romance, beauty, chic aesthetics. |

---

### 1. Sakura Garden (`sakura-garden`)

* **Video URL:** `https://pub-9cd00a06634147dfaf578df671f68d21.r2.dev/backgrounds/sakura-garden.mp4`
* **Poster URL:** `https://pub-9cd00a06634147dfaf578df671f68d21.r2.dev/backgrounds/sakura-garden.jpg`
* **Description:** A tranquil Japanese garden with a blooming cherry blossom tree swaying in the breeze on the left, drifting pink petals, subtle ripples on a stone pond, and a stationary man in traditional clothing facing a classic wooden estate under a clear daylight sky.
* **Palette:** Sage and moss greens, soft cherry pinks, natural timber, azure daylight.

---

### 2. Fruit Bat Matrix (`bat-flight`)

* **Video URL:** `https://pub-9cd00a06634147dfaf578df671f68d21.r2.dev/backgrounds/bat-flight.mp4`
* **Poster URL:** `https://pub-9cd00a06634147dfaf578df671f68d21.r2.dev/backgrounds/bat-flight.jpg`
* **Description:** A fruit bat flying in strict lateral side profile across void black (`#000000`). Rendered as a retro-futuristic LED cross-grid (`+`) matrix with four-point starburst specular glints along the wing ridges and falling glowing dust motes.
* **Palette:** Pitch black (`#000000`), warm amber/gold mantle, platinum/silver wing ribbing, dark charcoal membrane.

---

### 3. Floating Ruby Rose (`rose-bloom`)

* **Video URL:** `https://pub-9cd00a06634147dfaf578df671f68d21.r2.dev/backgrounds/rose-bloom.mp4`
* **Poster URL:** `https://pub-9cd00a06634147dfaf578df671f68d21.r2.dev/backgrounds/rose-bloom.jpg`
* **Description:** A delicate, glowing deep ruby-red rose on a slender, curved downward stem floating in an absolute pitch-black void (`#000000`). Petals peel away asynchronously in an organic, weightless 3D drift before cleanly returning to the flower for a seamless loop.
* **Palette:** Solid void black (`#000000`), rich crimson and carmine, glowing ruby core, dark olive stem.

---

## How to Use with `cave-motion` MCP

Call the `prepare_motion` tool from any MCP-connected agent (Claude, Cursor, Codex):

```json
{
  "id": "video-background-hero",
  "brief": "Build a hero section using our hosted sakura garden background video (https://pub-9cd00a06634147dfaf578df671f68d21.r2.dev/backgrounds/sakura-garden.mp4) with poster fallback (https://pub-9cd00a06634147dfaf578df671f68d21.r2.dev/backgrounds/sakura-garden.jpg), headline 'Timeless Architecture, Modern Code', and an emerald accent #10b981.",
  "customization": {
    "accent": "#10b981"
  }
}
```

The recipe ensures:
1. Native `<video autoPlay loop muted playsInline>` with `object-fit: cover`.
2. Immediate poster display before video starts.
3. Accessible fallback that disables video autoplay when `@media (prefers-reduced-motion: reduce)` is set.
4. Pausing playback when scrolled offscreen via `IntersectionObserver`.
5. Subtle dark overlay gradient for text contrast.
