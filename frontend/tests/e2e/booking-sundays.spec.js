import { test, expect } from '@playwright/test';
for (const width of [410, 1440]) {
    test(`domingos são bloqueados somente na Creche (${width}px)`, async ({ page }) => {
        await page.setViewportSize({ width, height: 900 });
        await page.goto('/prototipo/TL03');
        if (width === 410)
            await page.getByRole('button', { name: 'Avançar', exact: true }).click();
        const changeService = async (service) => {
            if (width === 410)
                await page.getByRole('button', { name: 'Voltar', exact: true }).click();
            await page.getByRole('button', { name: service, exact: true }).click();
            if (width === 410)
                await page.getByRole('button', { name: 'Avançar', exact: true }).click();
        };
        await page.getByRole('button', { name: '9, disponível', exact: true }).click();
        await expect(page.getByRole('button', { name: '9, selecionado', exact: true })).toBeEnabled();
        await changeService('DayUse');
        await expect(page.getByRole('button', { name: '9, selecionado', exact: true })).toBeEnabled();
        await changeService('Creche');
        await expect(page.getByRole('button', { name: 'Selecionar Domingo', exact: true })).toBeDisabled();
        for (const day of [2, 9, 16, 23, 30]) {
            const sunday = page.getByRole('button', { name: `${day}, indisponível`, exact: true });
            await expect(sunday).toBeDisabled();
            await expect(sunday).toHaveAttribute('aria-pressed', 'false');
            await sunday.dispatchEvent('click');
            await expect(sunday).toHaveAttribute('aria-pressed', 'false');
        }
        await expect(page.locator('.calendar-weekday[aria-pressed="true"]')).toHaveCount(1);
        if (width === 1440) {
            const card = page.locator('[data-design-id="IjVwX"]');
            await expect(card.locator('[data-booking-subtotal]')).toContainText('R$ 360,00');
            await expect(card).not.toContainText('9 de agosto');
        }
        await changeService('Hotel');
        await expect(page.getByRole('button', { name: '9, disponível', exact: true })).toBeEnabled();
        await page.getByRole('button', { name: '9, disponível', exact: true }).click();
        await expect(page.getByRole('button', { name: '9, selecionado', exact: true })).toBeEnabled();
    });
}
test('card de valores preserva hierarquia legível e rolagem horizontal', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/prototipo/TL03');
    const card = page.locator('[data-design-id="IjVwX"]');
    await expect(card.locator('[data-design-name="Montante"]')).toHaveCSS('font-size', '28px');
    await expect(card.locator('[data-booking-subtotal]')).toHaveCSS('font-size', '20px');
    await expect(card.locator('[data-booking-total]')).toHaveCSS('font-size', '28px');
    await expect(card.locator('[data-design-name="Descrição"]')).toHaveCSS('font-size', '18px');
    await expect(card.getByRole('region', { name: 'Datas do agendamento' })).toHaveCSS('font-size', '20px');
    await expect(card.getByRole('region', { name: 'Datas do agendamento' })).toHaveCSS('overflow-x', 'auto');
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBe(0);
});
