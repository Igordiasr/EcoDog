import { test, expect } from '@playwright/test';
test('Creche aplica recorrência mensal, remove ocorrências e usa uma mensalidade', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/prototipo/TL03');
    await page.getByRole('button', { name: 'Creche', exact: true }).click();
    const total = page.locator('[data-design-name="Montante"]');
    await expect(total).toContainText('R$ 1.080,00');
    await page.getByRole('button', { name: 'Selecionar Terça-feira', exact: true }).click();
    for (const day of [4, 11, 18, 25])
        await expect(page.getByRole('button', { name: `${day}, selecionado`, exact: true })).toHaveAttribute('aria-pressed', 'true');
    await expect(total).toContainText('R$ 1.890,00');
    await expect(page.locator('.booking-cart-summary')).toHaveCount(1);
    await expect(page.locator('.booking-cart-summary')).toContainText('2 vezes por semana');
    await expect(page.getByRole('button', { name: '6, indisponível', exact: true })).toHaveAttribute('aria-pressed', 'false');
    await page.getByRole('button', { name: '11, selecionado', exact: true }).click();
    for (const day of [4, 11, 18, 25])
        await expect(page.getByRole('button', { name: `${day}, disponível`, exact: true })).toHaveAttribute('aria-pressed', 'false');
    await expect(total).toContainText('R$ 1.080,00');
    await page.getByRole('button', { name: 'Selecionar Terça-feira', exact: true }).click();
    await page.getByRole('button', { name: '→', exact: true }).click();
    for (const day of [15, 22, 29])
        await expect(page.getByRole('button', { name: `${day}, selecionado`, exact: true })).toBeVisible();
    await expect(total).toContainText('R$ 1.890,00');
    await page.getByRole('button', { name: 'DayUse', exact: true }).click();
    await expect(page.locator('.booking-cart-summary .booking-date-label')).toHaveCount(6);
    await expect(total).toContainText('R$ 1.620,00');
});
test('Creche bloqueia uma sétima frequência semanal e atualiza todos os preços mensais', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/prototipo/TL03');
    await page.getByRole('button', { name: 'Creche', exact: true }).click();
    const total = page.locator('[data-design-name="Montante"]');
    for (const [weekday, amount] of [['Terça-feira', '1.890'], ['Sábado', '2.340'], ['Segunda-feira', '2.880'], ['Quarta-feira', '3.270'], ['Sexta-feira', '3.600']]) {
        await page.getByRole('button', { name: `Selecionar ${weekday}`, exact: true }).click();
        await expect(total).toContainText(`R$ ${amount},00`);
    }
    await expect(page.getByRole('button', { name: 'Selecionar Domingo', exact: true })).toBeDisabled();
    await expect(page.locator('.calendar-weekday[aria-pressed="true"]')).toHaveCount(6);
    await page.getByRole('button', { name: 'Selecionar Terça-feira', exact: true }).click();
    await expect(total).toContainText('R$ 3.270,00');
    await page.getByRole('button', { name: 'Selecionar Terça-feira', exact: true }).click();
    await expect(total).toContainText('R$ 3.600,00');
});
test('Creche mobile preserva frequência e mensalidade na revisão', async ({ page }) => {
    await page.setViewportSize({ width: 410, height: 900 });
    await page.goto('/prototipo/TL03');
    await page.getByRole('button', { name: 'Creche', exact: true }).click();
    await page.getByRole('button', { name: 'Avançar', exact: true }).click();
    await page.getByRole('button', { name: '4, disponível', exact: true }).click();
    await page.getByRole('button', { name: 'Avançar', exact: true }).click();
    await page.getByRole('button', { name: 'Avançar', exact: true }).click();
    const review = page.locator('[data-design-name="Card · Revisão final"]');
    await expect(review.locator('[data-booking-total]')).toContainText('R$ 1.890,00');
    await expect(review).toContainText('2 vezes por semana');
    await expect(review.locator('.booking-cart-summary')).toHaveCount(1);
});
