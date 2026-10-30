const { createHash } = require('node:crypto')

// Keep exact-byte provenance and a second digest comparable across Git
// checkouts with core.autocrlf. Only line endings are normalized.
function sourceHashes(bytes) {
  const sha256 = value => createHash('sha256').update(value).digest('hex')
  return {
    rawSha256: sha256(bytes),
    lfSha256: sha256(bytes.toString('utf8').replace(/\r\n/g, '\n'))
  }
}

module.exports = { sourceHashes }
