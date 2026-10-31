// Original vector surface patterns. No remote assets or expensive SVG filters.
// v1.3: materials are visible up close and read as a calm ground at overview scale.
const tile = (size, content) => `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" fill="none">${content}</svg>`
const glow = (id, color, opacity) => `<radialGradient id="${id}"><stop stop-color="${color}" stop-opacity="${opacity}"/><stop offset="1" stop-color="${color}" stop-opacity="0"/></radialGradient>`
export const textures = {
  'pixel-arcade': tile(96, '<path d="M0 48h96M48 0v96" stroke="#8a7dff" stroke-opacity=".08"/><path d="M12 12h3v3h-3zM60 60h3v3h-3z" fill="#ffd23f" opacity=".2"/><path d="M80 20h2v2h-2zM28 76h2v2h-2z" fill="#3fe0d8" opacity=".2"/>'),
  'anime-pop': tile(48, '<g fill="#e07aa0" opacity=".22"><circle cx="6" cy="6" r="1.1"/><circle cx="30" cy="30" r="1.1"/></g><path d="M40 10l1 2 2 1-2 1-1 2-1-2-2-1 2-1Z" fill="#f2a7c3" opacity=".25"/>'),
  'toon-motion': tile(40, '<g fill="#e3a72a" opacity=".28"><circle cx="10" cy="10" r="2"/><circle cx="30" cy="30" r="2"/></g>'),
  'zen-japan': tile(240, '<path d="M15 32l29-1m95 43l34 1M44 174l25 1m99 29l32-2M110 12l1 14M17 120l1 12" stroke="#7b7f62" stroke-width=".7" stroke-opacity=".2"/>'),
  'ink-wash': tile(480, '<path d="M0 380Q60 330 120 362T240 340T360 368T480 350M0 400Q90 368 170 392T330 380T480 396" stroke="#3e4a48" stroke-width="1.2" stroke-opacity=".08"/><path d="M31 41l9 1m104 62l18-1m90 70l3 9m-115 62l14 1M400 39l3 12" stroke="#3e4a48" stroke-opacity=".16" stroke-width=".8"/>'),
  'sketchbook': tile(112, '<path d="M0 27.5h112M0 55.5h112M0 83.5h112M0 111.5h112" stroke="#6b91c4" stroke-opacity=".22" stroke-width=".8"/>'),
  'marker-notes': tile(64, '<circle cx="8" cy="8" r="1" fill="#6f6a52" opacity=".28"/><circle cx="40" cy="40" r="1" fill="#6f6a52" opacity=".28"/>'),
  'cyber-neon': tile(180, '<path d="M0 0.5h180M0 45.5h180M0 90.5h180M0 135.5h180" stroke="#7c5cff" stroke-opacity=".07"/><path d="M0 90h52l22-22V0M180 90h-32l-42 42v48" stroke="#ff3ea5" stroke-opacity=".1"/><path d="M49 88h5v4h-5zM146 88h5v4h-5z" fill="#00e1ff" opacity=".18"/>'),
  'watercolor-garden': tile(320, '<path d="M21 32q55-16 88 11t-15 24-73-12Z" fill="#9fd0a6" opacity=".16"/><path d="M203 228q44-19 76 4t-11 22-68-10Z" fill="#f2a7b4" opacity=".16"/><path d="M220 60q30-10 48 6t-8 15-44-6Z" fill="#f7d77a" opacity=".16"/><path d="M20 150l17-1m120-82l1 10m70 198l20 1" stroke="#55805f" stroke-width=".7" stroke-opacity=".18"/>'),
  'paper-cut': tile(160, '<path d="M8 22l24-1m64 83l16 1M55 63l1 8m80-37v8" stroke="#73503d" stroke-width=".8" stroke-opacity=".18"/><circle cx="120" cy="130" r="1.2" fill="#73503d" opacity=".18"/>'),
  'ukiyo-e-print': tile(160, '<g fill="none" stroke="#2c4a5e" stroke-width=".8" opacity=".12"><path d="M0 40q40-40 80 0t80 0M0 47q40-40 80 0t80 0M0 54q40-40 80 0t80 0M-80 120q40-40 80 0t80 0 80 0M-80 127q40-40 80 0t80 0 80 0"/></g>'),
  'blueprint-lab': tile(100, '<path d="M0 20h100M0 40h100M0 60h100M0 80h100M20 0v100M40 0v100M60 0v100M80 0v100" stroke="#d3e6ff" stroke-width=".5" stroke-opacity=".12"/><path d="M0 0h100v100" stroke="#d3e6ff" stroke-width="1" stroke-opacity=".22"/>'),
  'bauhaus-geometry': tile(240, '<circle cx="120" cy="120" r="1.6" fill="#17191b" opacity=".18"/><circle cx="0" cy="0" r="1.6" fill="#17191b" opacity=".18"/>'),
  'glass-aurora': tile(1200, `<defs>${glow('a', '#2fd3b0', 0.34)}${glow('b', '#8b5cf6', 0.34)}${glow('c', '#ec4899', 0.2)}</defs><ellipse cx="320" cy="360" rx="520" ry="420" fill="url(#a)"/><ellipse cx="900" cy="820" rx="520" ry="460" fill="url(#b)"/><ellipse cx="1000" cy="220" rx="360" ry="300" fill="url(#c)"/><g fill="#ffffff" opacity=".35"><circle cx="140" cy="900" r=".9"/><circle cx="640" cy="120" r=".8"/><circle cx="1100" cy="560" r=".9"/></g>`),
  'vintage-editorial': tile(160, '<path d="M13 20h9m58 30h13m41 72h10M21 103h7M69 146h11" stroke="#7d6346" stroke-width=".7" stroke-opacity=".2"/>'),
  'celestial-atlas': tile(320, '<g fill="#e8e4ff" opacity=".45"><circle cx="21" cy="31" r=".9"/><circle cx="117" cy="74" r=".7"/><circle cx="263" cy="28" r="1"/><circle cx="204" cy="191" r=".8"/><circle cx="51" cy="249" r=".9"/><circle cx="300" cy="300" r=".7"/><circle cx="160" cy="140" r=".6"/></g><path d="M150 269h8m-4-4v8M283 124h6m-3-3v6" stroke="#f5d488" stroke-width=".8" opacity=".5"/><path d="M21 31l96 43 87 117" stroke="#a6b5d8" stroke-opacity=".12" stroke-width=".7"/>'),
  'swiss-type': tile(80, '<path d="M79.5 0v80M0 79.5h80" stroke="#111416" stroke-opacity=".035"/>'),
  'metro-transit': tile(48, '<circle cx="24" cy="24" r="1" fill="#1a2a35" opacity=".1"/>'),
  'chalk-classroom': tile(500, '<path d="M30 74q76-4 102 1m178 291q71 3 118-1" stroke="#c4d8c8" stroke-width="14" stroke-opacity=".04"/><path d="M29 85l76-2m208 274l63 2M200 200l40-1" stroke="#f0f0dc" stroke-width=".8" stroke-opacity=".08"/>'),
  'terminal-tree': tile(4, '<path d="M0 3.5h4" stroke="#3ddc84" stroke-opacity=".035"/>'),
  'circuit-board': tile(240, '<path d="M0 32h42v54h35M240 192h-48v-42h-35M120 0v20h30" stroke="#d6b25e" stroke-width="1" stroke-opacity=".12"/><g stroke="#d6b25e" stroke-opacity=".16"><circle cx="79" cy="86" r="3.5"/><circle cx="154" cy="150" r="3.5"/><circle cx="150" cy="20" r="3"/></g>'),
  'art-deco': tile(240, '<path d="M120 0L240 120 120 240 0 120Z" stroke="#d8b46a" stroke-width=".7" stroke-opacity=".08"/><path d="M108 120h12v-12m0 24v-12h12" stroke="#d8b46a" stroke-width=".7" stroke-opacity=".12"/>'),
  'risograph': tile(24, '<circle cx="6" cy="6" r=".9" fill="#2b54c8" opacity=".14"/><circle cx="18" cy="18" r=".9" fill="#ff4f8b" opacity=".16"/>'),
  'memphis-play': tile(300, '<path d="M24 32l7-7 7 7 7-7 7 7m181 190a12 12 0 0 1 20 14" stroke="#6b4fd6" stroke-width="2" stroke-opacity=".16"/><g fill="#ff6b5b" opacity=".2"><circle cx="211" cy="74" r="2"/><circle cx="221" cy="74" r="2"/><circle cx="211" cy="84" r="2"/><circle cx="221" cy="84" r="2"/></g><path d="M80 220l14 0-7 12Z" fill="#35c2b5" opacity=".2"/>'),
  'neo-brutalist': tile(40, '<path d="M19 19h2v2h-2z" fill="#111111" opacity=".1"/>'),
  'retro-desktop': tile(4, '<path d="M0 0h1v1H0zm2 2h1v1H2z" fill="#000000" opacity=".05"/>'),
  'stitched-linen': tile(12, '<path d="M0 3h12M0 9h12M3 0v12M9 0v12" stroke="#8c7558" stroke-width=".5" stroke-opacity=".09"/>'),
  'clay-studio': tile(160, '<circle cx="31" cy="42" r="1" fill="#8a6a50" opacity=".16"/><circle cx="123" cy="119" r=".9" fill="#8a6a50" opacity=".14"/>'),
  'stained-glass': tile(120, '<path d="M60 0L120 60 60 120 0 60Z" stroke="#1d2326" stroke-width=".7" stroke-opacity=".06"/><path d="M60 52l8 8-8 8-8-8Z" fill="#8e1f2f" opacity=".07"/>'),
  'topographic': tile(480, '<g stroke="#556845" stroke-width=".8" opacity=".14"><path d="M-30 103Q38 13 110 71T290 94T510 24M-25 121Q42 33 113 88T293 111T510 43M-20 139Q46 53 116 105T296 128T510 62M189 383q61-72 147-22t164-15M184 402q64-74 152-23t169-14M179 421q67-76 157-24t174-13"/></g>'),
  'film-storyboard': tile(6, '<circle cx="3" cy="3" r=".5" fill="#222426" opacity=".08"/>'),
  'travel-tickets': tile(180, '<path d="M20 31h13m72 79h9m-47 43h12" stroke="#8a6e4c" stroke-width=".8" stroke-opacity=".2"/><circle cx="150" cy="40" r="22" stroke="#d94c32" stroke-opacity=".07" stroke-width="2"/>')
}
