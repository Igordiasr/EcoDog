import { test, expect } from '@playwright/test';
for (const height of [720, 768, 900]) {
    for (const width of [1440, 1920]) {
        test(`cadastro centralizado, sem scroll ou sobras (${width}×${height})`, async ({ page }) => {
            await page.setViewportSize({ width, height });
            await page.goto('/cadastro');
            const card = page.locator('[data-design-id="bhGjW"]');
            await expect(card).toBeVisible();
            await page.evaluate(() => document.fonts.ready);
            const box = (await card.boundingBox());
            expect(Math.abs(box.x + box.width / 2 - width / 2)).toBeLessThanOrEqual(1);
            expect(Math.abs(box.y + box.height / 2 - (88 + (height - 88) / 2))).toBeLessThanOrEqual(1);
            expect(await page.evaluate(() => document.documentElement.scrollHeight)).toBe(height);
            for (const label of ['Nome', 'E-mail', 'Telefone', 'Endereço', 'Senha', 'Confirmação de senha']) {
                await expect(page.getByLabel(label, { exact: true })).toBeInViewport();
            }
            await expect(page.getByRole('button', { name: 'Cadastrar', exact: true })).toBeInViewport();
            const photo = page.locator('[data-design-name="foto-aumigo"]');
            const photoBox = (await photo.boundingBox());
            expect(photoBox.height).toBe(box.height);
            await expect(photo).toHaveCSS('border-top-width', '0px');
            await expect(photo).toHaveCSS('overflow', 'hidden');
            await expect(photo.locator(':scope > div')).toHaveCSS('top', '-20px');
            await expect(photo.locator('[class*="image-import-26.jpg"]')).toHaveCSS('transform', 'none');
            await expect(photo.locator('[class*="image-import-26.jpg"]')).toHaveCSS('background-size', 'cover');
        });
    }
}
