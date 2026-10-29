// Vue CLI 4 uses Webpack 4. Keep its OpenSSL compatibility scoped to the build.
const { spawnSync } = require('node:child_process')
const path = require('node:path')
const result = spawnSync(process.execPath, [
  '--openssl-legacy-provider',
  path.resolve(__dirname, '../web/node_modules/@vue/cli-service/bin/vue-cli-service.js'),
  'build'
], {
  cwd: path.resolve(__dirname, '../web'),
  env: process.env,
  stdio: 'inherit'
})
process.exit(result.status === null ? 1 : result.status)
