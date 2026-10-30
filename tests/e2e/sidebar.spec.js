const { test, expect } = require('@playwright/test')

for (const width of [1440, 390]) {
  test(`theme sidebar keeps every section reachable at ${width}px`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 1000 })
    const errors = []
    page.on('pageerror', error => errors.push(error.message))
    page.on('console', message => { if (message.type() === 'error') errors.push(message.text()) })
    await page.goto('/')
    await expect(page).toHaveTitle(/Mappop/)
    await expect(page.locator('.smm-node').first()).toBeVisible()
    await page.waitForFunction(() => !document.querySelector('.el-loading-mask'))
    const triggers = page.locator('.sidebarTriggerContainer')
    const trigger = name => triggers.getByRole('button', { name, exact: true })
    const panel = page.locator('.sidebarContainer.show')
    const assertGeometry = async expectedWidth => {
      await expect.poll(async () => {
        const bar = await triggers.locator('.trigger').boundingBox()
        const box = await panel.boundingBox()
        return !!bar && !!box && bar.x >= 0 && Math.abs(box.width - expectedWidth) < 1 &&
          Math.abs(box.x - (bar.x + bar.width) - 5) < 1
      }).toBe(true)
    }
    await trigger('Themes').click()
    for (const theme of ['Pixel Arcade', 'Anime Pop']) {
      await page.getByRole('button', { name: 'All 16', exact: true }).click()
      const card = page.getByRole('button', { name: new RegExp(`^${theme}$`) })
      await card.click()
      await expect(card).toHaveAttribute('aria-pressed', 'true')
      await expect(page.locator('.themeGroupList')).toHaveClass(theme === 'Pixel Arcade' ? /isDark/ : /^(?!.*isDark)/)
      for (const section of ['Node', 'Style', 'Structure', 'Outline', 'Settings']) {
        await assertGeometry(Math.min(410, width - 80))
        await trigger(section).click()
        await expect(trigger(section)).toHaveAttribute('aria-expanded', 'true')
        await expect(panel).toHaveCount(1)
        await expect(panel.locator('.themeGroupList')).toHaveCount(0)
        await assertGeometry(300)
        await trigger('Themes').click()
        await expect(panel.locator('.themeGroupList')).toBeVisible()
      }
    }
    await page.getByRole('button', { name: 'After dark', exact: true }).click()
    await expect(page.locator('.artThemeItem')).toHaveCount(3)
    await page.getByRole('button', { name: 'All 16', exact: true }).click()
    await expect(page.locator('.artThemeItem')).toHaveCount(16)
    await page.locator('.artThemeItem').last().scrollIntoViewIfNeeded()
    expect(await page.locator('.themeListTheme').evaluate(el => el.scrollTop)).toBeGreaterThan(0)
    await panel.getByRole('button', { name: 'Close sidebar' }).click()
    await expect(panel).toHaveCount(0)
    await trigger('Themes').click()
    await assertGeometry(Math.min(410, width - 80))
    await page.locator('.artThemeItem').first().scrollIntoViewIfNeeded()
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
    await page.screenshot({ path: testInfo.outputPath(`sidebar-${width}.png`) })
    expect(errors).toEqual([])
  })
}
