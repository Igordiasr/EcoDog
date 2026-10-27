import { test, expect } from '@playwright/test';
import { screens } from '../../src/views/screens/catalog';
for (const width of [410, 1440]) {
    test(`setas compartilham geometria, tamanho e espessura (${width}px)`, async ({ page }) => {
        await page.setViewportSize({ width, height: 900 });
        let count = 0;
        for (const screen of screens) {
            await page.goto(`/prototipo/${screen.id}`);
            await expect(page.locator('[data-design-id]').first()).toBeVisible();
            const arrows = await page.locator('.project-arrow').evaluateAll(elements => elements.map(element => {
                const rect = element.getBoundingClientRect();
                const slot = element.parentElement.getBoundingClientRect();
                return {
                    width: rect.width, height: rect.height,
                    geometry: element.querySelector('path').getAttribute('d'),
                    stroke: element.querySelector('path').getAttribute('stroke-width'),
                    cap: element.querySelector('path').getAttribute('stroke-linecap'),
                    slot: element.parentElement.classList.contains('arrow-icon-slot'),
                    centerX: rect.x + rect.width / 2 - slot.x - slot.width / 2,
                    centerY: rect.y + rect.height / 2 - slot.y - slot.height / 2,
                };
            }));
            count += arrows.length;
            for (const arrow of arrows) {
                expect(arrow.width, screen.id).toBe(18);
                expect(arrow.height, screen.id).toBe(18);
                expect(arrow.geometry, screen.id).toBe('M7 14l-7-7 7-7m7 7l-14 0');
                expect(arrow.stroke, screen.id).toBe('2');
                expect(arrow.cap, screen.id).toBe('round');
                if (arrow.slot) {
                    expect(Math.abs(arrow.centerX), screen.id).toBeLessThanOrEqual(1);
                    expect(Math.abs(arrow.centerY), screen.id).toBeLessThanOrEqual(1);
                }
            }
        }
        expect(count).toBeGreaterThan(20);
    });
}
test('setas preservam ações de calendário e seleção de serviço', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/prototipo/TL03');
    await page.getByRole('button', { name: '→', exact: true }).click();
    await expect(page.locator('[data-design-name="Navegação do mês"]')).toContainText('Setembro');
    await page.getByRole('button', { name: '←', exact: true }).click();
    await expect(page.locator('[data-design-name="Navegação do mês"]')).toContainText('Agosto');
    await page.goto('/prototipo/TL17');
    await page.getByRole('button', { name: 'Criar Plano', exact: true }).click();
    const select = page.getByRole('dialog').getByLabel('Serviço', { exact: true });
    await select.selectOption('Hotel');
    await expect(select).toHaveValue('Hotel');
    await expect(page.getByRole('dialog').locator('.select-arrow-slot > .project-arrow')).toBeVisible();
});
