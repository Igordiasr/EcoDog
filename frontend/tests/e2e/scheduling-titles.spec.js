import { test, expect } from '@playwright/test';
for (const width of [410, 1440]) {
    test(`agendamento padroniza títulos e usa dias da semana brancos (${width}px)`, async ({ page }) => {
        await page.setViewportSize({ width, height: 900 });
        await page.goto('/prototipo/TL03');
        await expect(page.getByRole('heading', { name: 'Agendamento de aulunos', exact: true })).toHaveCSS('font-size', width === 410 ? '28px' : '40px');
        for (const title of await page.locator('.booking-section-title').all())
            await expect(title).toHaveCSS('font-size', '24px');
        if (width === 410)
            await page.getByRole('button', { name: 'Avançar', exact: true }).click();
        const days = page.locator('[data-design-name="Dia da semana"]');
        for (const day of await days.all())
            await expect(day).toHaveCSS('color', 'rgb(254, 254, 254)');
        if (width === 410)
            await page.getByRole('button', { name: 'Voltar', exact: true }).click();
        await page.getByRole('button', { name: 'Creche', exact: true }).click();
        if (width === 410)
            await page.getByRole('button', { name: 'Avançar', exact: true }).click();
        for (const day of await days.all())
            await expect(day).toHaveCSS('color', 'rgb(254, 254, 254)');
        if (width === 410) {
            await page.getByRole('button', { name: 'Avançar', exact: true }).click();
            await page.getByRole('button', { name: 'Avançar', exact: true }).click();
        }
        await expect(page.getByRole('heading', { name: 'Resumo do Agendamento', exact: true })).toHaveCount(1);
        await expect(page.getByRole('heading', { name: 'Resumo do Agendamento', exact: true })).toHaveCSS('font-size', '24px');
        if (width === 1440) {
            const card = (await page.locator('[data-design-id="IjVwX"]').boundingBox());
            const block = (await page.locator('[data-design-id="CKErY"]').boundingBox());
            const first = (await page.locator('[data-design-id="usnNU"]').boundingBox());
            expect(card.x + card.width / 2).toBe(width / 2);
            expect(card.y - first.y - first.height).toBe(24);
            expect(block.y - card.y - card.height).toBe(24);
            expect(card.width).toBe(first.width);
            await expect(page.locator('[data-design-id="PyCgJ"] > :nth-child(2)')).toHaveAttribute('data-design-id', 'IjVwX');
        }
        expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBe(0);
    });
}
