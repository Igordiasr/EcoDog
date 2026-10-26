import { test, expect } from '@playwright/test';
import { screens } from '../../src/screens/catalog';

for (const width of [410, 1440]) {
  test(`telas reutilizam a textura corrigida sem mudar a disposição (${width}px)`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    let texturedScreens = 0;
    for (const screen of screens) {
      await page.goto(`/prototipo/${screen.id}`);
      await expect(page.locator('[data-design-id]').first()).toBeVisible();
      const backgrounds = page.locator('.paw-background');
      if (await backgrounds.count()) texturedScreens++;
      for (const background of await backgrounds.all()) {
        await expect(background).toHaveCSS('background-image', /scheduling-paws-spaced\.svg/);
        await expect(background).toHaveCSS('background-size', width === 410 ? '410px 61.5px' : '1440px 216px');
        await expect(background).toHaveCSS('background-repeat', 'repeat');
        await expect(background).toHaveCSS('pointer-events', 'none');
        await expect(background).toHaveAttribute('aria-hidden', 'true');
        expect(await background.locator(':scope > *').count()).toBe(0);
      }
      expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth), screen.id).toBeLessThanOrEqual(1);
    }
    expect(texturedScreens).toBeGreaterThanOrEqual(10);
  });
}

test('formulários de apoio reutilizam o mesmo fundo', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/prototipo/TL15');
  await page.getByRole('button', { name: 'Criar usuário', exact: true }).click();
  const background = page.getByRole('dialog').locator('.paw-background');
  await expect(background).toHaveCount(1);
  await expect(background).toHaveCSS('background-image', /scheduling-paws-spaced\.svg/);
});
