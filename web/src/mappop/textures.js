// Original vector surface patterns. No remote assets or expensive SVG filters.
const tile = (size, content) => `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" fill="none">${content}</svg>`
export const textures = {
  'pixel-arcade': tile(96, '<path d="M0 48h96M48 0v96" stroke="#a4d6d1" stroke-opacity=".035"/><path d="M12 12h3v3h-3zM60 60h3v3h-3z" fill="#9cc7c9" opacity=".16"/>'),
  'anime-pop': tile(96, '<g fill="#b67a97" opacity=".16"><circle cx="8" cy="8" r=".7"/><circle cx="16" cy="8" r=".7"/><circle cx="8" cy="16" r=".7"/><circle cx="56" cy="56" r=".7"/></g>'),
  'toon-motion': tile(96, '<g fill="#be953e" opacity=".18"><circle cx="12" cy="12" r="1.2"/><circle cx="60" cy="60" r="1.2"/></g>'),
  'zen-japan': tile(180, '<path d="M15 32l19-1m75 33l24 1M44 134l15 1m79 29l22-2M80 12l1 9M17 90l1 8" stroke="#8b8e72" stroke-width=".5" stroke-opacity=".14"/>'),
  'ink-wash': tile(320, '<path d="M0 240Q70 207 140 240T320 229V320H0Z" fill="#64756e" opacity=".018"/><path d="M31 41l5 1m74 62l12-1m70 70l2 6m-85 62l10 1M270 39l2 8" stroke="#6c7b72" stroke-opacity=".12" stroke-width=".6"/>'),
  'sketchbook': tile(112, '<path d="M0 27.5h112M0 55.5h112M0 83.5h112M0 111.5h112" stroke="#819db7" stroke-opacity=".16" stroke-width=".7"/>'),
  'marker-notes': tile(80, '<circle cx="10" cy="10" r=".7" fill="#7c7966" opacity=".23"/><circle cx="50" cy="50" r=".7" fill="#7c7966" opacity=".23"/>'),
  'cyber-neon': tile(180, '<path d="M0 90h52l22-22V0M180 90h-32l-42 42v48" fill="none" stroke="#57b4ae" stroke-opacity=".07"/><path d="M49 88h5v4h-5zM146 88h5v4h-5z" fill="#57b4ae" opacity=".13"/>'),
  'watercolor-garden': tile(240, '<path d="M21 32q45-12 68 9t-12 18-61-9Z" fill="#b2c9a0" opacity=".07"/><path d="M153 168q34-15 58 3t-9 17-52-8Z" fill="#c6a18c" opacity=".055"/><path d="M20 110l13-1m90-62l1 8m52 148l15 1" stroke="#76866a" stroke-width=".5" stroke-opacity=".12"/>'),
  'paper-cut': tile(160, '<path d="M8 22l24-1m64 83l16 1M55 63l1 8m80-37v8" stroke="#846e51" stroke-width=".7" stroke-opacity=".12"/>'),
  'ukiyo-e-print': tile(160, '<g fill="none" stroke="#34556a" stroke-width=".65" opacity=".07"><path d="M0 40q40-40 80 0t80 0M0 47q40-40 80 0t80 0M0 54q40-40 80 0t80 0M-80 120q40-40 80 0t80 0 80 0M-80 127q40-40 80 0t80 0 80 0"/></g>'),
  'blueprint-lab': tile(100, '<path d="M0 20h100M0 40h100M0 60h100M0 80h100M20 0v100M40 0v100M60 0v100M80 0v100" stroke="#c2ddee" stroke-width=".5" stroke-opacity=".075"/><path d="M0 0h100v100" stroke="#c2ddee" stroke-width=".8" stroke-opacity=".14"/>'),
  'bauhaus-geometry': tile(400, '<circle cx="200" cy="200" r="1" fill="#766d58" opacity=".16"/>'),
  'glass-aurora': tile(1200, '<defs><radialGradient id="a"><stop stop-color="#b9d7dd" stop-opacity=".5"/><stop offset="1" stop-color="#b9d7dd" stop-opacity="0"/></radialGradient><radialGradient id="b"><stop stop-color="#d8c6df" stop-opacity=".5"/><stop offset="1" stop-color="#d8c6df" stop-opacity="0"/></radialGradient></defs><ellipse cx="350" cy="400" rx="480" ry="480" fill="url(#a)"/><ellipse cx="900" cy="850" rx="460" ry="460" fill="url(#b)"/>'),
  'vintage-editorial': tile(160, '<path d="M13 20h7m58 30h11m41 72h8M21 103h5M69 146h9" stroke="#8c7653" stroke-width=".55" stroke-opacity=".16"/>'),
  'celestial-atlas': tile(320, '<g fill="#c7c9cf" opacity=".35"><circle cx="21" cy="31" r=".7"/><circle cx="117" cy="74" r=".6"/><circle cx="263" cy="28" r=".8"/><circle cx="204" cy="191" r=".7"/><circle cx="51" cy="249" r=".7"/></g><path d="M150 269h6m-3-3v6M283 124h4m-2-2v4" stroke="#d3bc87" stroke-width=".6" opacity=".3"/><path d="M21 31l96 43 87 117" fill="none" stroke="#8b9fbf" stroke-opacity=".07" stroke-width=".6"/>')
}
