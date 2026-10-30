import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import vm from 'node:vm'
import crypto from 'node:crypto'

const themes = vm.runInNewContext(fs.readFileSync('web/src/mappop/theme-tokens.js', 'utf8').replace('export const definitions =', 'globalThis.definitions ='))
const luminance = hex => {
  const channels = hex.slice(1).match(/../g).map(x => parseInt(x, 16) / 255).map(x => x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4)
  return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722
}
test('sixteen stable theme IDs and title/body contrast meet the release floor', () => {
  assert.equal(themes.length, 16)
  assert.equal(new Set(themes.map(t => t.slug)).size, 16)
  const original = ['pixel-arcade', 'anime-pop', 'toon-motion', 'zen-japan', 'ink-wash', 'sketchbook', 'marker-notes', 'cyber-neon']
  original.forEach(slug => assert(themes.some(t => t.slug === slug)))
  for (const theme of themes) {
    for (const level of ['root', 'second', 'node']) {
      const color = theme.levels[level]?.color || (level === 'root' ? theme.rootInk : theme.ink)
      let bg = theme[`${level}Fill`]
      if (bg === 'transparent') bg = theme.background
      const a = luminance(color), b = luminance(bg)
      const contrast = (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)
      assert(contrast >= (level === 'root' ? 3 : 4.5), `${theme.slug}/${level}: ${contrast}`)
    }
  }
})
test('shipped font bytes match provenance and local fallback covers GB2312', () => {
  const manifest = JSON.parse(fs.readFileSync('web/public/mappop/fonts/art-font-manifest.json'))
  for (const font of manifest) {
    const bytes = fs.readFileSync(`web/public/mappop/fonts/${font.file}`)
    assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'), font.sha256)
    assert.equal(bytes.subarray(0, 4).toString(), 'wOF2')
    assert.equal(bytes.length, font.bytes)
  }
  assert.equal(manifest.find(font => font.family === 'Mappop Sans').gb2312Missing, '')
  assert.equal(manifest.find(font => font.family === 'Mappop Hand').gb2312Missing, '')
})
test('every theme preview is a local WebP from the reproducible editor capture', () => {
  for (const theme of themes) {
    const bytes = fs.readFileSync(`web/public/mappop/previews/${theme.slug}.webp`)
    assert.equal(bytes.subarray(8, 12).toString(), 'WEBP')
    assert(bytes.length > 2000)
  }
})
