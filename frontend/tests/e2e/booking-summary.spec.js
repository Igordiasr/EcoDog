import { test, expect } from '@playwright/test';
test('resumo destaca o total no topo e organiza informações em pares por linha', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/prototipo/TL03');
    const card = page.locator('[data-design-id="IjVwX"]');
    await expect(card).toBeVisible();
    await page.evaluate(() => document.fonts.ready);
    const fields = card.locator('.booking-summary-field');
    await expect(fields).toHaveCount(4);
    for (const field of await fields.all()) {
        const title = (await field.locator('dt').boundingBox());
        const value = (await field.locator('dd').boundingBox());
        expect(Math.abs(value.y + value.height / 2 - title.y - title.height / 2)).toBeLessThanOrEqual(1);
        expect(Math.abs(value.x - title.x - title.width - 12)).toBeLessThanOrEqual(1);
        await expect(field.locator('dt')).toHaveCSS('font-family', '"Lilita One", sans-serif');
        await expect(field.locator('dt')).toHaveCSS('font-weight', '400');
        await expect(field.locator('dt')).toHaveCSS('font-style', 'normal');
        await expect(field.locator('dt')).toHaveCSS('text-align', 'left');
        await expect(field.locator('dd')).toHaveCSS('text-align', 'right');
        await expect(field).toHaveCSS('border-bottom-width', '1px');
        await expect(field).toHaveCSS('border-bottom-style', 'solid');
    }
    await expect(card.locator('[data-booking-total]')).toHaveCount(1);
    await expect(card.locator('.booking-summary-total dt')).toHaveText('Valor Total');
    await expect(card.locator('.booking-summary-total dt')).toHaveCSS('font-size', '22px');
    await expect(card.locator('[data-booking-total]')).toHaveCSS('font-size', '28px');
    await expect(card.locator('.booking-summary-total')).toHaveCSS('border-bottom-width', '1px');
    const info = card.locator('.booking-summary-information > .booking-summary-field');
    for (const field of await info.all()) {
        await expect(field.locator('dt')).toHaveCSS('font-size', '18px');
        await expect(field.locator('dd')).toHaveCSS('font-size', '20px');
    }
    const boxes = await Promise.all((await info.all()).map(field => field.boundingBox()));
    expect(boxes[1].y).toBeGreaterThanOrEqual(boxes[0].y + boxes[0].height + 16);
    expect(boxes[2].y).toBeGreaterThanOrEqual(boxes[1].y + boxes[1].height + 16);
    expect(Math.abs(boxes[0].width - boxes[2].width)).toBeLessThanOrEqual(1);
    expect(boxes[1].x).toBe(boxes[0].x);
    await expect(card.locator('[data-booking-total]')).toContainText('R$ 360,00');
    await expect(card.locator('.booking-cart-prices span')).toHaveCount(0);
    await expect(card.locator('[aria-label="Itens do carrinho"]')).toHaveCount(0);
    await expect(card.locator('.booking-cart-summary > :first-child')).toHaveClass(/booking-summary-total/);
    const totalBox = (await card.locator('.booking-summary-total').boundingBox());
    const detailsBox = (await card.locator('[data-design-name="Descrição"]').boundingBox());
    expect(totalBox.y).toBeLessThan(detailsBox.y);
    await expect(card.getByRole('region', { name: 'Datas do agendamento' })).toHaveCount(1);
    await expect(card.getByRole('region', { name: 'Datas do agendamento' })).toContainText('13 de agosto');
    for (const title of await page.locator('.scheduling-page h1, .booking-section-title').all()) {
        await expect(title).toHaveCSS('font-family', '"Lilita One", sans-serif');
        await expect(title).toHaveCSS('font-weight', '400');
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBe(0);
});
for (const width of [320, 410]) {
    test(`pares informativos e datas permanecem acessíveis no mobile (${width}px)`, async ({ page }) => {
        await page.setViewportSize({ width, height: 900 });
        await page.goto('/prototipo/TL03');
        await page.getByRole('button', { name: 'Avançar', exact: true }).click();
        await page.getByRole('button', { name: '14, disponível', exact: true }).click();
        await page.getByRole('button', { name: '15, disponível', exact: true }).click();
        for (let step = 0; step < 2; step++)
            await page.getByRole('button', { name: 'Avançar', exact: true }).click();
        const summary = page.locator('.booking-cart-summary');
        const info = summary.getByRole('region', { name: 'Informações do agendamento', exact: true });
        expect(await info.evaluate(element => element.scrollWidth <= element.clientWidth)).toBe(true);
        const dates = summary.getByRole('region', { name: 'Datas do agendamento', exact: true });
        expect(await dates.evaluate(element => element.scrollWidth > element.clientWidth)).toBe(true);
        await dates.scrollIntoViewIfNeeded();
        const totalBefore = (await summary.locator('.booking-summary-total').boundingBox());
        await dates.focus();
        await dates.press('End');
        expect(await dates.evaluate(element => element.scrollLeft)).toBeGreaterThan(0);
        const totalAfter = (await summary.locator('.booking-summary-total').boundingBox());
        expect(totalAfter.x).toBe(totalBefore.x);
        expect(totalAfter.width).toBe(totalBefore.width);
        await expect(summary.locator('[data-booking-total]')).toContainText('R$ 1.080,00');
        expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBe(0);
    });
}
