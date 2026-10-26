import { test, expect } from '@playwright/test';
import { screens } from '../../src/screens/catalog';

for (const width of [320, 410, 1440, 1920]) {
  test(`headers mantêm a logo centralizada e ações sem sobreposição (${width}px)`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    for (const screen of screens) {
      await page.goto(`/prototipo/${screen.id}`);
      const header = page.locator('.design-header').first();
      await expect(header).toBeVisible();
      await page.evaluate(() => document.fonts.ready);
      const brand = await header.locator(':scope > .header-brand').boundingBox();
      expect(Math.abs(brand!.x + brand!.width / 2 - width / 2), screen.id).toBeLessThanOrEqual(1);
      const actions = header.locator(':scope > .header-actions');
      if (await actions.count()) {
        const group = (await actions.boundingBox())!;
        const login = (await actions.locator('[data-design-name="Botão Entrar"]').boundingBox())!;
        const register = (await actions.locator('[data-design-name="Botão Cadastrar"]').boundingBox())!;
        expect(width - group.x - group.width, screen.id).toBe(80);
        expect(group.x, screen.id).toBeGreaterThan(brand!.x + brand!.width);
        expect(login.width, screen.id).toBe(104);
        expect(register.width, screen.id).toBe(120);
        expect(login.height, screen.id).toBe(44);
        expect(register.height, screen.id).toBe(44);
        expect(register.x - login.x - login.width, screen.id).toBe(16);
        await expect(actions.locator('[data-design-name="Botão Cadastrar"]')).toHaveCSS('background-color', 'rgb(203, 131, 53)');
        await expect(actions.locator('[data-design-name="Botão Entrar"]')).toHaveCSS('border-top-color', 'rgb(203, 131, 53)');
      }
    }
  });
}

test('botões do header institucional navegam para entrar e cadastro', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  await page.locator('.header-actions').getByRole('button', { name: 'ENTRAR', exact: true }).click();
  await expect(page).toHaveURL('/entrar');
  await page.goto('/sobre');
  await page.locator('.header-actions').getByRole('button', { name: 'CADASTRAR', exact: true }).click();
  await expect(page).toHaveURL('/cadastro');
});
