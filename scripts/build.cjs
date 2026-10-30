// Vue CLI 4 uses Webpack 4. Keep its OpenSSL compatibility scoped to the build.
const { spawnSync } = require('node:child_process')
const path = require('node:path')
const fs = require('node:fs')
const result = spawnSync(process.execPath, [
  '--openssl-legacy-provider',
  path.resolve(__dirname, '../web/node_modules/@vue/cli-service/bin/vue-cli-service.js'),
  'build'
], {
  cwd: path.resolve(__dirname, '../web'),
  env: process.env,
  stdio: 'inherit'
})
if (result.status === 0) {
  const git = spawnSync('git', ['rev-parse', 'HEAD'], { cwd: path.resolve(__dirname, '..'), encoding: 'utf8' })
  fs.writeFileSync(path.resolve(__dirname, '../.output/public/build-info.json'), JSON.stringify({
    version: require('../package.json').version,
    commit: git.status === 0 ? git.stdout.trim() : 'unknown'
  }) + '\n')
}
process.exit(result.status === null ? 1 : result.status)
