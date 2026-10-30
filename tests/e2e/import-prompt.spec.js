const { test, expect } = require('@playwright/test')

for (const [locale, width, dark] of [['zh', 1440, false], ['en', 390, true], ['zhtw', 390, false], ['vi', 1440, true]]) {
  test(`AI import guidance: ${locale}, ${width}px, dark=${dark}`, async ({ page, context }, testInfo) => {
    await page.setViewportSize({ width, height: 844 })
    await page.addInitScript(({ locale, dark }) => {
      localStorage.setItem('SIMPLE_MIND_MAP_LANG', locale)
      localStorage.setItem('SIMPLE_MIND_MAP_LOCAL_CONFIG', JSON.stringify({ isDark: dark }))
    }, { locale, dark })
    const errors = []
    page.on('pageerror', error => errors.push(error.message))
    await page.goto('/')
    await expect(page).toHaveTitle(/Mappop/)
    await expect(page.locator('.smm-node').first()).toBeVisible()
    await page.waitForFunction(() => !document.querySelector('.el-loading-mask'))
    const labels = { zh: '导入', en: 'Import', zhtw: '匯入', vi: 'Nhập' }
    await page.locator('.toolbarBtn').filter({ hasText: new RegExp(`^${labels[locale]}$`) }).click()
    const dialog = page.locator('.nodeImportDialog .el-dialog')
    const help = dialog.locator('.aiImportHelp')
    await expect(help).toBeVisible()
    await expect(help).toHaveClass(dark ? /isDark/ : /^(?!.*isDark)/)
    const prompt = await help.locator('textarea').inputValue()
    expect(prompt).toContain('mindmap.md')
    expect(prompt).toContain('500')
    expect(prompt).toContain('64 KiB')
    await context.grantPermissions(['clipboard-read', 'clipboard-write'])
    await help.getByRole('button').click()
    await expect(help.getByRole('status')).toBeVisible()
    // Windows clipboard text uses CRLF; textarea values use LF.
    expect((await page.evaluate(() => navigator.clipboard.readText())).replace(/\r\n/g, '\n')).toBe(prompt)
    await page.screenshot({ path: testInfo.outputPath('import-guidance.png') })

    // Permission failure must offer a usable manual copy instead of reporting success.
    await page.evaluate(() => {
      Object.defineProperty(navigator.clipboard, 'writeText', {
        configurable: true,
        value: () => Promise.reject(new DOMException('Denied', 'NotAllowedError'))
      })
    })
    await help.getByRole('button').click()
    await expect(help.locator('details')).toHaveAttribute('open', '')
    await expect(help.locator('textarea')).toBeFocused()
    expect(await help.locator('textarea').evaluate(el => el.selectionEnd - el.selectionStart)).toBe(prompt.length)
    const box = await dialog.boundingBox()
    expect(box.x).toBeGreaterThanOrEqual(0)
    expect(box.x + box.width).toBeLessThanOrEqual(width)
    expect(await dialog.evaluate(el => el.scrollWidth <= el.clientWidth)).toBe(true)

    // The template example must survive the real file-import path with its hierarchy intact.
    const sample = prompt.match(/^# [^\n]+\n##[\s\S]*?(?=\n\n)/m)[0]
    const { validateMarkdown } = await import('../../worker/markdown.mjs')
    expect(validateMarkdown(sample).nodeCount).toBe(6)
    await dialog.locator('input[type=file]').setInputFiles({ name: 'mindmap.md', mimeType: 'text/markdown', buffer: Buffer.from(sample) })
    await dialog.locator('.dialog-footer .el-button--primary').click()
    await expect(dialog).not.toBeVisible()
    await expect(page.locator('.smm-node')).toHaveCount(6)
    const data = await page.evaluate(() => document.querySelector('.editContainer').__vue__.mindMap.getData())
    expect(data.children).toHaveLength(2)
    expect(data.children[0].children[0].children).toHaveLength(1)
    expect(errors).toEqual([])
  })
}
