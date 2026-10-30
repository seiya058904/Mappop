const path = require('node:path')
const arg = name => {
  const index = process.argv.indexOf(name)
  return index < 0 ? undefined : process.argv[index + 1]
}
const version = arg('--version')
if (!version || !/^v\d+\.\d+(?:\.\d+)?$/.test(version)) {
  throw new Error('Pass --version v1.2 (or another explicit evidence version); historical evidence must not be overwritten.')
}
module.exports = {
  version,
  stage: process.argv.includes('--baseline') ? 'before' : 'after',
  raw: path.resolve(`.output/art-${version}`),
  docs: path.resolve(`docs/assets/${version}`),
  url: process.env.MAPPOP_TEST_URL || 'http://127.0.0.1:8787'
}
