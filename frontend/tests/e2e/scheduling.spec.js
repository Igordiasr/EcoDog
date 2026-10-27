import { test, expect } from '@playwright/test';
for (const width of [410, 1440]) {
    test(`calendário mantém alinhamento e bloqueia dias indisponíveis (${width}px)`, async ({ page }) => {
        await page.setViewportSize({ width, height: 900 });
        await page.goto('/prototipo/TL03');
        if (width === 410)
            await page.getByRole('button', { name: 'Avançar', exact: true }).click();
        const calendar = page.locator('[data-design-name="Calendário de agosto"]');
        await expect(calendar).toBeVisible();
        const selected = page.getByRole('button', { name: '13, selecionado', exact: true });
        for (const day of [1, 2, 3, 5, 6, 8]) {
            const button = page.getByRole('button', { name: `${day}, indisponível`, exact: true });
            await expect(button).toBeDisabled();
            await expect(button).toHaveAttribute('aria-pressed', 'false');
            await button.dispatchEvent('click');
            await expect(selected).toHaveAttribute('aria-pressed', 'true');
        }
        const alignment = await calendar.evaluate(element => {
            const headers = [...element.querySelector('[data-design-name="Dias da semana"]').children].map(child => child.getBoundingClientRect());
            return [...element.querySelectorAll('[data-design-name="Semana"]')].every(row => row.children.length === 7 && [...row.children].every((cell, index) => {
                const rect = cell.getBoundingClientRect();
                return Math.abs(rect.x - headers[index].x) < 1 && Math.abs(rect.width - headers[index].width) < 1;
            }));
        });
        expect(alignment).toBe(true);
        await page.getByRole('button', { name: '4, disponível', exact: true }).click();
        await expect(page.getByRole('button', { name: '4, selecionado', exact: true })).toBeEnabled();
        if (width === 410) {
            await page.getByRole('button', { name: 'Avançar', exact: true }).click();
            await expect(page.getByRole('button', { name: 'Todos os pets', exact: true })).toBeVisible();
        }
    });
    test(`agendamento capitaliza o calendário e amplia a seleção de pets (${width}px)`, async ({ page }) => {
        await page.setViewportSize({ width, height: 900 });
        await page.goto('/prototipo/TL03');
        if (width === 410)
            await page.getByRole('button', { name: 'Avançar', exact: true }).click();
        const days = page.locator('[data-design-name="Dias da semana"] [data-design-name="Dia da semana"]');
        await expect(days).toHaveText(['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']);
        await page.getByRole('button', { name: '→', exact: true }).click();
        await expect(page.locator('[data-design-name="Navegação do mês"]')).toContainText('Setembro');
        await page.getByRole('button', { name: '←', exact: true }).click();
        await expect(page.locator('[data-design-name="Navegação do mês"]')).toContainText('Agosto');
        if (width === 410) {
            await page.getByRole('button', { name: 'Avançar', exact: true }).click();
            for (const pet of ['Thor', 'Mel', 'Luke']) {
                const button = page.getByRole('button', { name: pet, exact: true });
                expect((await button.boundingBox()).height).toBeGreaterThanOrEqual(72);
            }
        }
        else {
            const panel = page.locator('[data-design-id="D87LCS"]');
            expect((await panel.boundingBox()).height).toBeGreaterThanOrEqual(490);
            await expect(panel).toHaveCSS('gap', '28px');
        }
        await page.getByRole('button', { name: 'Mel', exact: true }).click();
        await expect(page.getByRole('button', { name: 'Mel', exact: true })).toHaveAttribute('aria-pressed', 'false');
        const allPets = page.getByRole('button', { name: 'Todos os pets', exact: true });
        const checkbox = allPets.locator('.pets-all-checkbox');
        await expect(checkbox).toHaveCSS('font-size', '28px');
        const checkboxBox = (await checkbox.boundingBox());
        const buttonBox = (await allPets.boundingBox());
        expect(checkboxBox.width).toBe(28);
        expect(checkboxBox.height).toBe(28);
        expect(Math.abs(checkboxBox.y + checkboxBox.height / 2 - buttonBox.y - buttonBox.height / 2)).toBeLessThanOrEqual(1);
        await allPets.click();
        await expect(allPets).toHaveAttribute('aria-pressed', 'true');
        await allPets.click();
        await expect(allPets).toHaveAttribute('aria-pressed', 'false');
    });
}
for (const viewport of [{ width: 410, height: 900 }, { width: 1440, height: 2400 }, { width: 1920, height: 2400 }]) {
    test(`agendamento preenche a faixa até o rodapé e alinha valores (${viewport.width}px)`, async ({ page }) => {
        await page.setViewportSize(viewport);
        await page.goto('/prototipo/TL03');
        const strip = page.locator('.scheduling-page > [data-design-name="Respiro"]');
        await expect(strip).toBeVisible();
        await page.evaluate(() => document.fonts.ready);
        const texture = strip.locator('[data-design-name^="Textura vetorial"]');
        const footer = page.locator('.page-footer');
        const stripBox = (await strip.boundingBox());
        const textureBox = (await texture.boundingBox());
        const footerBox = (await footer.boundingBox());
        expect(stripBox.y + stripBox.height).toBe(footerBox.y);
        expect(textureBox.width).toBe(viewport.width);
        expect(textureBox.height).toBe(stripBox.height);
        expect(footerBox.y + footerBox.height).toBe(viewport.height);
        await expect(texture).toHaveCSS('background-repeat', 'repeat');
        await expect(texture).toHaveCSS('background-size', viewport.width >= 1440 ? '1440px 216px' : '410px 61.5px');
        await expect(texture).toHaveCSS('background-image', /scheduling-paws-spaced\.svg/);
        if (viewport.width >= 1440) {
            const values = page.locator('[data-design-id="IjVwX"]');
            const box = (await values.boundingBox());
            expect(box.width).toBe(viewport.width - 160);
            expect(Math.abs(box.x + box.width / 2 - viewport.width / 2)).toBeLessThanOrEqual(1);
            await expect(page.locator('[data-design-id="PyCgJ"] > aside[data-design-id="IjVwX"]')).toHaveCount(1);
            const fields = (await page.locator('[data-design-id="CKErY"]').boundingBox());
            const firstBlock = (await page.locator('[data-design-id="usnNU"]').boundingBox());
            expect(box.y - firstBlock.y - firstBlock.height).toBe(24);
            expect(fields.y - box.y - box.height).toBe(24);
            expect(box.x).toBe(firstBlock.x);
            expect(box.width).toBe(firstBlock.width);
            const calendar = (await page.locator('[data-design-id="pR7Qr"]').boundingBox());
            const pets = (await page.locator('[data-design-id="UO9qg"]').boundingBox());
            expect(calendar.y).toBe(pets.y);
            expect(calendar.width).toBe(736);
            expect(pets.x - calendar.x - calendar.width).toBe(24);
            expect(pets.x + pets.width).toBe(viewport.width - 80);
            expect(box.x + box.width / 2).toBe(fields.x + fields.width / 2);
            expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBe(0);
            await expect(values).toContainText('R$ 120,00');
        }
    });
}
