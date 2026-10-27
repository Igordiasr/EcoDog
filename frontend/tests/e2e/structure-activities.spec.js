import { test, expect } from '@playwright/test';
for (const width of [1440, 410]) {
    test(`Estrutura mantém atividade, título e foto sincronizados (${width}px)`, async ({ page }) => {
        await page.setViewportSize({ width, height: 1000 });
        await page.goto('/prototipo/TL09');
        const section = page.locator(width === 1440 ? '[data-design-id="dxjWO"]' : '[data-design-id="yqTjv"]');
        await expect(section.getByText('Rotina dos nossos Aulunos', { exact: true })).toBeVisible();
        const activities = ['Brincadeira com Bexiga', 'Brincadeira com Bolinha', 'Brincadeira com Boliche'];
        for (let index = 0; index < activities.length; index++) {
            if (index)
                await section.getByRole('button', { name: 'Próxima atividade', exact: true }).click();
            await expect(section.getByText(`Atividade ${index + 1}`, { exact: true })).toBeVisible();
            await expect(section.getByText(activities[index], { exact: true })).toBeVisible();
            await expect(section.getByText('Brincadeiras', { exact: true })).toBeVisible();
            const image = section.getByRole('img', { name: activities[index], exact: true });
            await expect(image).toBeVisible();
            await expect.poll(() => image.evaluate(node => node.naturalWidth)).toBeGreaterThan(0);
            expect(decodeURIComponent(await image.getAttribute('src') || '')).toContain(index === 2 ? 'Atividade - Brincadeira Boliche.jpeg' : `Atividade - ${activities[index]}.jpeg`);
        }
        await expect(section.getByRole('button', { name: 'Próxima atividade', exact: true })).toBeDisabled();
        for (let index = 1; index >= 0; index--) {
            await section.getByRole('button', { name: 'Atividade anterior', exact: true }).click();
            await expect(section.getByText(`Atividade ${index + 1}`, { exact: true })).toBeVisible();
            await expect(section.getByRole('img', { name: activities[index], exact: true })).toBeVisible();
        }
        await expect(section.getByRole('button', { name: 'Atividade anterior', exact: true })).toBeDisabled();
    });
}
