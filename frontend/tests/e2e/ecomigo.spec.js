import { expect, test } from '@playwright/test';
import { screens } from '../../src/views/screens/catalog';
for (const width of [320, 410, 1024, 1440]) {
    test(`EcoMigo cresce proporcionalmente em TL01–TL17 sem mover o layout (${width}px)`, async ({ page }) => {
        await page.setViewportSize({ width, height: 900 });
        for (const screen of screens) {
            await page.goto(`/prototipo/${screen.id}`);
            const trigger = page.getByRole('button', { name: 'Abrir Assistente EcoMigo', exact: true });
            await expect(trigger).toBeVisible();
            await page.evaluate(() => document.fonts.ready);
            await expect(trigger).toHaveCSS('width', '56px');
            await expect(trigger).toHaveCSS('height', '56px');
            const box = (await trigger.boundingBox());
            const offset = width >= 1440 ? 24 : 16;
            expect(width - box.x - box.width).toBe(offset);
            expect(900 - box.y - box.height).toBe(offset);
            const artwork = trigger.locator('[data-design-name="Cachorro e balão • vetores originais"]');
            await expect(artwork).toHaveCSS('transform', 'matrix(1.22, 0, 0, 1.22, 0, 0)');
            const larger = (await artwork.boundingBox());
            expect(larger.x).toBeGreaterThanOrEqual(box.x);
            expect(larger.y).toBeGreaterThanOrEqual(box.y);
            expect(larger.x + larger.width).toBeLessThanOrEqual(box.x + box.width);
            expect(larger.y + larger.height).toBeLessThanOrEqual(box.y + box.height);
            for (const image of await artwork.locator('img').all()) {
                expect(await image.getAttribute('src')).toMatch(/\.svg$/);
            }
            const layout = () => page.locator('[data-design-id]').evaluateAll(elements => elements.filter(element => !element.closest('.assistant-trigger')).map(element => {
                const bounds = element.getBoundingClientRect();
                return { id: element.getAttribute('data-design-id'), x: bounds.x, y: bounds.y, width: bounds.width, height: bounds.height };
            }));
            const before = await layout();
            const previous = await page.addStyleTag({ content: '.assistant-trigger [data-design-name="Cachorro e balão • vetores originais"] { transform: none !important; }' });
            const smaller = (await artwork.boundingBox());
            expect(larger.width / smaller.width).toBeCloseTo(1.22);
            expect(larger.height / smaller.height).toBeCloseTo(1.22);
            expect(await layout()).toEqual(before);
            await previous.evaluate(element => element.parentNode?.removeChild(element));
            await trigger.click();
            const dialog = page.getByRole('dialog', { name: 'Assistente EcoMigo', exact: true });
            const avatars = dialog.locator('[data-design-name="Avatar do assistente"]');
            await expect(avatars).toHaveCount(2);
            for (const avatar of await avatars.all()) {
                await expect(avatar).toHaveCSS('width', '40px');
                await expect(avatar).toHaveCSS('height', '40px');
                const avatarBox = (await avatar.boundingBox());
                const art = avatar.locator(':scope > [data-design-name="Cachorro e balão • vetores originais"]');
                await expect(art).toHaveCSS('transform', 'matrix(1.22, 0, 0, 1.22, 0, 0)');
                const artBox = (await art.boundingBox());
                expect(artBox.x).toBeGreaterThanOrEqual(avatarBox.x);
                expect(artBox.y).toBeGreaterThanOrEqual(avatarBox.y);
                expect(artBox.x + artBox.width).toBeLessThanOrEqual(avatarBox.x + avatarBox.width);
                expect(artBox.y + artBox.height).toBeLessThanOrEqual(avatarBox.y + avatarBox.height);
            }
            await expect(dialog.locator('[data-design-name="Avatar do usuário"]')).toHaveCSS('width', '40px');
            await page.keyboard.press('Escape');
            await expect(dialog).not.toBeVisible();
            await expect(trigger).toBeFocused();
        }
    });
}
