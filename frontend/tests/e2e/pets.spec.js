import { test, expect } from '@playwright/test';
for (const width of [410, 1440]) {
    test(`Meus Planos reúne título, dados e agendamento no card branco (${width}px)`, async ({ page }) => {
        await page.setViewportSize({ width, height: 900 });
        await page.goto('/prototipo/TL05');
        const card = page.locator('[data-design-name="Meus Planos • Card"]');
        await expect(card).toBeVisible();
        await expect(card.getByRole('heading', { name: 'Meus Planos', exact: true })).toBeVisible();
        await expect(page.getByRole('heading', { name: 'Meus Planos', exact: true })).toHaveCount(1);
        await expect(card).toContainText('Creche');
        await expect(card).toContainText('Segunda / Quarta');
        await expect(card).toHaveCSS('background-color', 'rgb(254, 254, 254)');
        expect((await card.boundingBox()).height).toBeGreaterThanOrEqual(240);
        const schedule = card.getByRole('button', { name: 'Agendar', exact: true });
        await expect(schedule).toHaveCount(1);
        await schedule.click();
        await expect(page).toHaveURL('/prototipo/TL03');
    });
}
