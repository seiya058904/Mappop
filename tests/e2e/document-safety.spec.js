const { test, expect } = require('@playwright/test')
const fs = require('node:fs')
const toolbar = (page, text) => page.locator('.toolbarBtn').filter({ hasText: new RegExp(`^${text}$`) }).first()
const liveRoot = page => page.evaluate(() => document.querySelector('.editContainer').__vue__.mindMap.getData().data.text)
const savedRoot = page => page.evaluate(() => JSON.parse(localStorage.getItem('SIMPLE_MIND_MAP_DATA')).root.data.text)
async function ready(page) {
  await page.goto('/')
  await page.waitForFunction(() => document.querySelector('.editContainer')?.__vue__?.editorStarted)
}
async function editRoot(page, text) {
  await page.locator('.smm-node').first().dblclick()
  await page.locator('.ql-editor[contenteditable=true]').fill(text)
  await page.mouse.click(700, 860)
  await expect.poll(() => liveRoot(page)).toContain(text)
}
async function selectFile(page, text, name = 'fixture.md') {
  await toolbar(page, 'Import').click()
  const dialog = page.locator('.nodeImportDialog')
  await dialog.locator('input[type=file]').setInputFiles({ name, mimeType: 'text/plain', buffer: Buffer.from(text) })
  return dialog
}
async function importFile(page, text, name) {
  const dialog = await selectFile(page, text, name)
  await expect(dialog.locator('.importPreview')).toBeVisible()
  await dialog.getByRole('button', { name: 'Confirm', exact: true }).click()
  await expect(dialog.locator('.el-dialog')).not.toBeVisible()
}
async function downloaded(page, action) {
  const event = page.waitForEvent('download')
  await action()
  return fs.readFileSync(await (await event).path(), 'utf8')
}
async function fakeFiles(page) {
  await page.evaluate(() => {
    const data = text => JSON.stringify({ root: { data: { text }, children: [] }, layout: 'mindMap', theme: { template: 'mappop-anime-pop', config: {} } })
    window.fixtureFiles = { A: data('File A'), B: data('File B'), output: '' }
    window.fixtureNextFile = 'A'
    window.fixtureFailWrites = false
    const handle = name => ({ kind: 'file', name: `${name}.smm`,
      getFile: async () => new File([window.fixtureFiles[name]], `${name}.smm`, { type: 'application/json' }),
      createWritable: async () => {
        if (window.fixtureFailWrites) throw new DOMException('Fixture denied', 'NotAllowedError')
        let contents
        return { write: async value => { contents = value }, close: async () => { window.fixtureFiles[name] = contents } }
      }
    })
    window.showOpenFilePicker = async () => [handle(window.fixtureNextFile)]
    window.showSaveFilePicker = async () => handle('output')
  })
}

test('local file saving and the unsaved warning survive entering and leaving Zen mode', async ({ page }) => {
  await ready(page); await fakeFiles(page)
  await toolbar(page, 'Open file').click()
  await expect.poll(() => liveRoot(page)).toContain('File A')
  await expect(page.locator('.el-loading-mask')).toHaveCount(0)
  await page.mouse.click(700, 860, { button: 'right' })
  await page.getByText('Zen mode', { exact: true }).click()
  await expect(page.locator('.toolbarContainer')).toHaveCount(0)
  await editRoot(page, 'Saved from Zen')
  await page.keyboard.press('Control+s')
  await expect.poll(() => page.evaluate(() => JSON.parse(window.fixtureFiles.A).root.data.text)).toContain('Saved from Zen')
  await expect(page.locator('.saveStatus')).toContainText('Saved to A.smm')
  await page.evaluate(() => { window.fixtureFailWrites = true })
  await editRoot(page, 'Unsaved in Zen')
  await page.keyboard.press('Control+s')
  await expect(page.locator('.saveStatus')).toContainText('The file could not be saved')
  const warned = await page.evaluate(() => !window.dispatchEvent(new Event('beforeunload', { cancelable: true })))
  expect(warned).toBe(true)
  await page.evaluate(() => { window.fixtureFailWrites = false })
  await page.getByRole('button', { name: 'Retry saving' }).click()
  await expect.poll(() => page.evaluate(() => JSON.parse(window.fixtureFiles.A).root.data.text)).toContain('Unsaved in Zen')
})

test('quota recovery downloads and Save As both use the live map, not the old cache', async ({ page }) => {
  await ready(page); await fakeFiles(page)
  await editRoot(page, 'Durable original')
  await expect.poll(() => savedRoot(page)).toContain('Durable original')
  await page.evaluate(() => {
    const original = Storage.prototype.setItem
    Storage.prototype.setItem = function(key, value) {
      if (key === 'SIMPLE_MIND_MAP_DATA') throw new DOMException('Fixture quota', 'QuotaExceededError')
      return original.call(this, key, value)
    }
  })
  await editRoot(page, 'Latest precious work')
  await expect(page.locator('.saveStatus')).toContainText('Browser storage is full')
  const copy = await downloaded(page, () => page.getByRole('button', { name: 'Download current SMM' }).click())
  expect(JSON.parse(copy).root.data.text).toContain('Latest precious work')
  await toolbar(page, 'Save as').click()
  await expect(page.locator('.saveStatus')).toContainText('Saved to output.smm')
  expect(await page.evaluate(() => JSON.parse(window.fixtureFiles.output).root.data.text)).toContain('Latest precious work')
  expect(await liveRoot(page)).toContain('Latest precious work')
  expect(await savedRoot(page)).toContain('Durable original')
})

test('Ctrl+S commits the current text while the node editor is still open', async ({ page }) => {
  await ready(page); await fakeFiles(page)
  await toolbar(page, 'Open file').click()
  await expect.poll(() => liveRoot(page)).toContain('File A')
  await expect(page.locator('.el-loading-mask')).toHaveCount(0)
  await page.locator('.smm-node').first().dblclick()
  await page.locator('.ql-editor[contenteditable=true]').fill('Latest keystroke')
  await page.keyboard.press('Control+s')
  await expect.poll(() => page.evaluate(() => JSON.parse(window.fixtureFiles.A).root.data.text)).toContain('Latest keystroke')
  await expect(page.locator('.saveStatus')).toContainText('Saved to A.smm')
  expect(await page.evaluate(() => !window.dispatchEvent(new Event('beforeunload', { cancelable: true })))).toBe(false)
  await page.locator('.smm-node').first().dblclick()
  await page.locator('.ql-editor[contenteditable=true]').fill('Unsaved keystroke before leaving')
  expect(await page.evaluate(() => !window.dispatchEvent(new Event('beforeunload', { cancelable: true })))).toBe(true)
  await expect.poll(() => page.evaluate(() => JSON.parse(window.fixtureFiles.A).root.data.text)).toContain('Unsaved keystroke before leaving')
})

test('leaving commits unfinished browser text without warning after a successful save', async ({ page }) => {
  await ready(page)
  await page.locator('.smm-node').first().dblclick()
  await page.locator('.ql-editor[contenteditable=true]').fill('Keep this unfinished browser text')
  expect(await page.evaluate(() => !window.dispatchEvent(new Event('beforeunload', { cancelable: true })))).toBe(false)
  expect(await savedRoot(page)).toContain('Keep this unfinished browser text')
  await page.reload()
  await expect.poll(() => liveRoot(page)).toContain('Keep this unfinished browser text')
})

test('native browser file handles flush pending edits to the original file before switching', async ({ page }) => {
  await ready(page)
  await page.evaluate(async () => {
    const directory = await navigator.storage.getDirectory()
    window.nativeHandles = {}
    for (const name of ['A', 'B']) {
      const handle = await directory.getFileHandle(`${name}.smm`, { create: true })
      const writable = await handle.createWritable()
      // Root-only SMM is an existing supported file format.
      await writable.write(JSON.stringify({ data: { text: `Native file ${name}` }, children: [] }))
      await writable.close()
      window.nativeHandles[name] = handle
    }
    window.nativeNextFile = 'A'
    window.showOpenFilePicker = async () => [window.nativeHandles[window.nativeNextFile]]
  })
  await toolbar(page, 'Open file').click()
  await expect.poll(() => liveRoot(page)).toContain('Native file A')
  await expect(page.locator('.el-loading-mask')).toHaveCount(0)
  await editRoot(page, 'Latest native A')
  await page.evaluate(() => { window.nativeNextFile = 'B' })
  await toolbar(page, 'Open file').click()
  await expect.poll(() => liveRoot(page)).toContain('Native file B')
  const files = await page.evaluate(async () => Object.fromEntries(await Promise.all(
    Object.entries(window.nativeHandles).map(async ([name, handle]) => [name, JSON.parse(await (await handle.getFile()).text())])
  )))
  expect(files.A.data.text).toContain('Latest native A')
  expect(files.A.root).toBeUndefined()
  expect(files.B.data.text).toBe('Native file B')
})

test('restoring a damaged draft retains a downloadable copy of its original bytes after reload', async ({ page }) => {
  await page.goto('/')
  await page.evaluate(() => {
    localStorage.setItem('SIMPLE_MIND_MAP_DATA', '{damaged draft')
    localStorage.setItem('MAPPOP_PRE_IMPORT_BACKUP', JSON.stringify({ root: { data: { text: 'Recover this map' }, children: [] } }))
  })
  await page.reload()
  await page.waitForFunction(() => document.querySelector('.editContainer')?.__vue__?.editorStarted)
  await expect(page.locator('.saveStatus')).toContainText('original data is preserved')
  await toolbar(page, 'Import').click()
  await page.getByRole('button', { name: 'Restore pre-import backup' }).click()
  await page.getByRole('button', { name: 'Restore', exact: true }).click()
  await expect.poll(() => liveRoot(page)).toContain('Recover this map')
  await expect(page.locator('.saveStatus')).toContainText('Saved in this browser')
  await page.reload()
  await page.waitForFunction(() => document.querySelector('.editContainer')?.__vue__?.editorStarted)
  await toolbar(page, 'Import').click()
  const raw = await downloaded(page, () => page.getByRole('button', { name: 'Download original data' }).click())
  expect(raw).toBe('{damaged draft')
  expect(await liveRoot(page)).toContain('Recover this map')
})

test('cancelling an XMind sheet choice leaves the current document and recovery point intact', async ({ page }) => {
  const JSZip = require('../../web/node_modules/jszip')
  const zip = new JSZip()
  zip.file('content.json', JSON.stringify(['First', 'Second'].map(title => ({ title, rootTopic: { title } }))))
  const buffer = await zip.generateAsync({ type: 'nodebuffer' })
  await ready(page)
  await editRoot(page, 'Keep my map')
  await toolbar(page, 'Import').click()
  const dialog = page.locator('.nodeImportDialog')
  await dialog.locator('input[type=file]').setInputFiles({ name: 'two-sheets.xmind', mimeType: 'application/octet-stream', buffer })
  const sheets = page.locator('.xmindCanvasSelectDialog')
  await sheets.getByRole('button', { name: 'Cancel', exact: true }).click()
  await expect(sheets.locator('.el-dialog')).not.toBeVisible()
  await dialog.getByRole('button', { name: 'Cancel', exact: true }).click()
  expect(await liveRoot(page)).toContain('Keep my map')
  expect(await page.evaluate(() => localStorage.getItem('MAPPOP_PRE_IMPORT_BACKUP'))).toBeNull()
})

for (const failure of ['blocked', 'damaged']) {
  test(`${failure} browser storage opens a temporary editor and preserves recoverable content`, async ({ page }) => {
    await page.addInitScript(failure => {
      if (failure === 'damaged') localStorage.setItem('SIMPLE_MIND_MAP_DATA', '{}')
      else {
        Storage.prototype.getItem = function() { throw new DOMException('Fixture blocked', 'SecurityError') }
        Storage.prototype.setItem = function() { throw new DOMException('Fixture blocked', 'SecurityError') }
      }
    }, failure)
    const errors = []; page.on('pageerror', e => errors.push(e.message))
    await ready(page)
    await expect(page.locator('.el-loading-mask')).toHaveCount(0)
    await editRoot(page, 'Temporary work to keep')
    const copy = await downloaded(page, () => page.getByRole('button', { name: 'Download current SMM' }).click())
    expect(JSON.parse(copy).root.data.text).toContain('Temporary work to keep')
    if (failure === 'damaged') {
      expect(await page.evaluate(() => localStorage.getItem('SIMPLE_MIND_MAP_DATA'))).toBe('{}')
      expect(await downloaded(page, () => page.getByRole('button', { name: 'Download original data' }).click())).toBe('{}')
    }
    expect(errors).toEqual([])
  })
}

test('file import previews, cancels safely, and restores either document through the recovery point', async ({ page }) => {
  await ready(page)
  await editRoot(page, 'Keep original')
  const dialog = await selectFile(page, '# Replacement\n## Child')
  await expect(dialog.locator('.importPreview')).toContainText('2 nodes')
  await dialog.getByRole('button', { name: 'Cancel', exact: true }).click()
  expect(await liveRoot(page)).toContain('Keep original')
  await importFile(page, '# Replacement\n## Child')
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('MAPPOP_PRE_IMPORT_BACKUP')).root.data.text)).toContain('Keep original')
  await toolbar(page, 'Import').click()
  await page.getByRole('button', { name: 'Restore pre-import backup' }).click()
  await page.getByRole('button', { name: 'Restore', exact: true }).click()
  await expect.poll(() => liveRoot(page)).toContain('Keep original')
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('MAPPOP_PRE_IMPORT_BACKUP')).root.data.text)).toContain('Replacement')
})

test('invalid input or failed backup does not detach an open file or replace its content', async ({ page }) => {
  await ready(page); await fakeFiles(page)
  await toolbar(page, 'Open file').click()
  await expect.poll(() => liveRoot(page)).toContain('File A')
  let dialog = await selectFile(page, '{"root":{}}', 'invalid.smm')
  await expect(dialog.locator('.importError')).toBeVisible()
  await expect(dialog.getByRole('button', { name: 'Confirm', exact: true })).toBeDisabled()
  await dialog.getByRole('button', { name: 'Cancel', exact: true }).click()
  await page.evaluate(() => {
    const original = Storage.prototype.setItem
    Storage.prototype.setItem = function(key, value) {
      if (key === 'MAPPOP_PRE_IMPORT_BACKUP') throw new DOMException('Fixture quota', 'QuotaExceededError')
      return original.call(this, key, value)
    }
  })
  dialog = await selectFile(page, '# Must not replace\n## Child')
  await dialog.getByRole('button', { name: 'Confirm', exact: true }).click()
  await expect(dialog.locator('.importError')).toContainText('recovery point')
  await dialog.getByRole('button', { name: 'Cancel', exact: true }).click()
  expect(await liveRoot(page)).toContain('File A')
  await editRoot(page, 'Still bound to A')
  await page.keyboard.press('Control+s')
  await expect.poll(() => page.evaluate(() => JSON.parse(window.fixtureFiles.A).root.data.text)).toContain('Still bound to A')
})

test('Markdown preserves multiple roots and requires acknowledgement of unsupported content', async ({ page }) => {
  await ready(page)
  let dialog = await selectFile(page, '# A\n## A child\n# B\n## B child', 'multiple.md')
  await expect(dialog.locator('.importPreview')).toContainText('5 nodes')
  await expect(dialog.locator('.importPreview')).toContainText('All top-level items')
  await dialog.getByRole('button', { name: 'Confirm', exact: true }).click()
  await expect(page.locator('.smm-node')).toHaveCount(5)
  expect(await liveRoot(page)).toContain('multiple')
  await page.setViewportSize({ width: 390, height: 641 })
  dialog = await selectFile(page, '# Title\nImportant paragraph\n\n## Kept')
  await expect(dialog.locator('.importWarnings')).toContainText('line 2')
  await expect(dialog.getByRole('button', { name: 'Confirm', exact: true })).toBeDisabled()
  const confirmBox = await dialog.getByRole('button', { name: 'Confirm', exact: true }).boundingBox()
  expect(confirmBox.y + confirmBox.height).toBeLessThan(641)
  await dialog.getByText('I understand that the listed content will not be imported.', { exact: true }).click()
  await expect(dialog.getByRole('checkbox')).toBeChecked()
  await dialog.getByRole('button', { name: 'Confirm', exact: true }).click()
  await expect(page.locator('.smm-node')).toHaveCount(2)
})

test('two tabs keep independent edits and never silently overwrite the shared browser draft', async ({ page: a, context }) => {
  await ready(a)
  await editRoot(a, 'Shared baseline')
  await expect.poll(() => savedRoot(a)).toContain('Shared baseline')
  const b = await context.newPage(); await ready(b)
  await expect(b.locator('.saveStatus')).toContainText('Another tab')
  await editRoot(a, 'A latest work')
  await expect.poll(() => savedRoot(a)).toContain('A latest work')
  await editRoot(b, 'B independent work')
  expect(await savedRoot(b)).toContain('A latest work')
  const copy = await downloaded(b, () => b.getByRole('button', { name: 'Download current SMM' }).click())
  expect(JSON.parse(copy).root.data.text).toContain('B independent work')
  await a.close()
  await b.getByRole('button', { name: 'Retry saving' }).click()
  await expect(b.locator('.saveStatus')).toContainText('changed in another tab')
  expect(await savedRoot(b)).toContain('A latest work')
  expect(await liveRoot(b)).toContain('B independent work')
})

test('a waiting tab can save after the owner closes when the stored revision is unchanged', async ({ page: a, context }) => {
  await ready(a)
  await editRoot(a, 'Shared baseline')
  await expect.poll(() => savedRoot(a)).toContain('Shared baseline')
  const b = await context.newPage(); await ready(b)
  await expect(b.locator('.saveStatus')).toContainText('Another tab')
  await editRoot(b, 'Continue here')
  await a.close()
  await b.getByRole('button', { name: 'Retry saving' }).click()
  await expect(b.locator('.saveStatus')).toContainText('Saved in this browser')
  expect(await savedRoot(b)).toContain('Continue here')
})
