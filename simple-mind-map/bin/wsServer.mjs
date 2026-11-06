#!/usr/bin/env node

// Keep the historical entry point without loading networking packages.
// Mappop does not enable the upstream collaboration plugin.
console.error(
  'Mappop: the legacy collaboration signaling server is retired and will not start. The editor supports local drafts and immutable sharing links. See docs/DEPLOYMENT.md.'
)
process.exitCode = 1
