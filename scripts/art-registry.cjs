// Read the same pure token registry used by Vue, without bundling the editor.
const fs = require('node:fs')
const path = require('node:path')
const vm = require('node:vm')
const source = fs.readFileSync(path.join(__dirname, '../web/src/mappop/theme-tokens.js'), 'utf8')
const definitions = JSON.parse(JSON.stringify(vm.runInNewContext(source.replace('export const definitions =', 'globalThis.definitions ='))))
module.exports = { definitions, slugs: definitions.map(theme => theme.slug) }
