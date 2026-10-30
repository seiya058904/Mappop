const { test, expect } = require('@playwright/test')
const { definitions: themes } = require('../../scripts/art-registry.cjs')

for (const [width, height, locale = 'zh'] of [[844, 390], [667, 375], [390, 844], [1440, 640], [1440, 641], [844, 390, 'en'], [390, 641, 'en']]) {
  test(`theme browsing, filters and keyboard remain usable at ${width}x${height} (${locale})`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height })
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.addInitScript(locale => localStorage.setItem('SIMPLE_MIND_MAP_LANG', locale), locale)
    const errors = []
    page.on('pageerror', error => errors.push(error.message))
    page.on('console', message => { if (message.type() === 'error') errors.push(message.text()) })
    await page.goto('/')
    await expect(page).toHaveTitle(/Mappop/)
    await expect(page.locator('.smm-node').first()).toBeVisible()
    await page.waitForFunction(() => !document.querySelector('.el-loading-mask'))
    const trigger = page.locator('.sidebarTriggerContainer').getByRole('button', { name: locale === 'zh' ? '主题' : 'Themes', exact: true })
    await trigger.click()
    const panel = page.locator('.artThemeSidebar.show')
    const cards = panel.locator('.artThemeItem')
    const search = panel.getByRole('searchbox', { name: locale === 'zh' ? '搜索画风' : 'Search themes' })
    // Check the actual clipped rectangle, not just DOM visibility. A card in
    // the old 18px scrollport was still "visible" to the standard matcher.
    const expectReadable = async locator => {
      await expect.poll(() => locator.evaluate(el => {
        const box = el.getBoundingClientRect()
        let top = 0, bottom = innerHeight
        for (let parent = el.parentElement; parent; parent = parent.parentElement) {
          if (/(auto|scroll|hidden|clip)/.test(getComputedStyle(parent).overflowY)) {
            const rect = parent.getBoundingClientRect()
            top = Math.max(top, rect.top)
            bottom = Math.min(bottom, rect.bottom)
          }
        }
        return box.height > 0 && box.top >= top - 1 && box.bottom <= bottom + 1 && box.left >= 0 && box.right <= innerWidth
      })).toBe(true)
    }
    const expectHeader = async () => {
      await expectReadable(panel.locator('.sidebarHeader'))
      await expectReadable(panel.getByRole('button', { name: 'Close sidebar' }))
    }
    await expect(cards).toHaveCount(themes.length)
    await cards.first().scrollIntoViewIfNeeded()
    await expectReadable(cards.first())
    await cards.last().scrollIntoViewIfNeeded()
    await expectReadable(cards.last())
    await expectHeader()
    await panel.locator('.themeStatus').scrollIntoViewIfNeeded()
    await expectReadable(panel.locator('.themeStatus'))
    await search.fill('terminal tree')
    await expect(cards).toHaveCount(1)
    await cards.first().scrollIntoViewIfNeeded()
    await expectReadable(cards.first())
    await expect(cards.locator('.name')).toHaveText(locale === 'zh' ? '终端目录' : 'Terminal Tree')
    await search.fill('不存在的画风')
    const clear = panel.getByRole('button', { name: locale === 'zh' ? '清除筛选' : 'Clear filters' })
    await clear.click()
    await expect(cards).toHaveCount(themes.length)
    // Native Tab navigation must scroll each complete card into view.
    await panel.getByRole('button', { name: locale === 'zh' ? '夜色' : 'After dark', exact: true }).focus()
    for (let index = 0; index < themes.length; index++) {
      await page.keyboard.press('Tab')
      await expect(cards.nth(index)).toBeFocused()
      await expectReadable(cards.nth(index))
    }
    await expectHeader()
    await page.keyboard.press('Enter')
    await expect(cards.last()).toHaveAttribute('aria-pressed', 'true')
    await expect(panel.locator('.themeListTheme')).toHaveAttribute('aria-busy', 'false')
    // Resizing while the panel is open must preserve the usable scroll path.
    await page.setViewportSize({ width: height, height: width })
    await cards.last().scrollIntoViewIfNeeded()
    await expectReadable(cards.last())
    await expectHeader()
    await page.setViewportSize({ width, height })
    await cards.last().scrollIntoViewIfNeeded()
    await expectReadable(cards.last())
    await page.screenshot({ path: testInfo.outputPath(`theme-${width}x${height}.png`) })
    // Applying a theme temporarily disables cards and releases their focus.
    // Explicitly enter the close control to verify keyboard closing/restoration.
    await panel.getByRole('button', { name: 'Close sidebar' }).focus()
    await page.keyboard.press('Enter')
    await expect(panel).toHaveCount(0)
    await expect(trigger).toBeFocused()
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
    expect(errors).toEqual([])
  })
}

for (const width of [1440, 768, 390]) {
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
      await page.getByRole('button', { name: 'All ' + themes.length, exact: true }).click()
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
    await expect(page.locator('.artThemeItem')).toHaveCount(themes.filter(t => t.dark).length)
    await page.getByRole('button', { name: 'Any light', exact: true }).click()
    await page.getByRole('button', { name: 'All ' + themes.length, exact: true }).click()
    await expect(page.locator('.artThemeItem')).toHaveCount(themes.length)
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
