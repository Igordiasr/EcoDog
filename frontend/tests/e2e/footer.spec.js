import { test, expect } from '@playwright/test';
import { screens } from '../../src/views/screens/catalog';
for (const width of [320, 410, 1024, 1440, 1920]) {
    test(`rodapés ocupam a largura e encerram a página (${width}px)`, async ({ page }) => {
        await page.setViewportSize({ width, height: 900 });
        for (const screen of screens.filter(s => !['TL02', 'TL04'].includes(s.id))) {
            await page.goto(`/prototipo/${screen.id}`);
            const footer = page.locator('.page-footer').last();
            await expect(footer).toBeVisible();
            await page.evaluate(() => document.fonts.ready);
            const bounds = await footer.evaluate(element => {
                const rect = element.getBoundingClientRect();
                const previous = element.previousElementSibling?.getBoundingClientRect();
                const background = element.querySelector('[data-design-name="Rectangle 6"]');
                return {
                    left: rect.left, width: rect.width, bottom: rect.bottom + scrollY,
                    top: rect.top, previousBottom: previous?.bottom,
                    documentHeight: document.documentElement.scrollHeight,
                    overflow: document.documentElement.scrollWidth - innerWidth,
                    backgroundWidth: background?.getBoundingClientRect().width,
                    position: getComputedStyle(element).position,
                };
            });
            expect(bounds.left, screen.id).toBe(0);
            expect(bounds.width, screen.id).toBe(width);
            expect(Math.abs(bounds.bottom - bounds.documentHeight), screen.id).toBeLessThanOrEqual(1);
            expect(bounds.top, screen.id).toBeGreaterThanOrEqual((bounds.previousBottom || 0) - 1);
            expect(bounds.overflow, screen.id).toBeLessThanOrEqual(1);
            expect(['static', 'relative'], screen.id).toContain(bounds.position);
            if (bounds.backgroundWidth !== undefined)
                expect(bounds.backgroundWidth, screen.id).toBe(width);
        }
    });
}
for (const viewport of [{ width: 410, height: 900 }, { width: 1440, height: 2000 }]) {
    test(`rodapé permanece no final da janela com pouco conteúdo (${viewport.width}px)`, async ({ page }) => {
        await page.setViewportSize(viewport);
        await page.goto(`/prototipo/${viewport.width === 410 ? 'TL03' : 'TL17'}`);
        const footer = page.locator('.page-footer');
        await expect(footer).toBeVisible();
        await page.evaluate(() => document.fonts.ready);
        const box = await footer.boundingBox();
        expect(box.y + box.height).toBe(viewport.height);
        expect(await page.evaluate(() => document.documentElement.scrollHeight)).toBe(viewport.height);
    });
}
for (const width of [1440, 1920]) {
    test(`colunas institucionais à direita e textos de contato alinhados (${width}px)`, async ({ page }) => {
        await page.setViewportSize({ width, height: 900 });
        for (const id of ['TL01', 'TL08', 'TL09']) {
            await page.goto(`/prototipo/${id}`);
            const footer = page.locator('.page-footer[data-design-name="Footer"]');
            await expect(footer).toBeVisible();
            await page.evaluate(() => document.fonts.ready);
            const boxes = await footer.evaluate(element => {
                const box = (selector) => element.querySelector(selector).getBoundingClientRect().toJSON();
                return {
                    location: box(':scope > [data-design-name="Localização"]'),
                    contacts: box(':scope > [data-design-name="Contatos"]'),
                    networks: box(':scope > [data-design-name="Redes"]'),
                    title: box(':scope > [data-design-name="Contatos"] > [data-design-name="Contatos"]'),
                    row: box('[data-design-name="WhatsApp • Contato"]'),
                    phone: box('[data-design-name="(11) 93961-6496"]'),
                    email: box('[data-design-name="ecodogpark@gmail.com"]'),
                    icon: box('[data-design-name="Ícone WhatsApp"]'),
                };
            });
            expect(boxes.location.x, id).toBe(width - 1062);
            expect(boxes.contacts.x - boxes.location.right, id).toBe(96);
            expect(boxes.networks.x - boxes.contacts.right, id).toBe(64);
            expect(width - boxes.networks.right, id).toBe(80);
            expect(boxes.title.x, id).toBe(boxes.icon.x);
            expect(boxes.title.x, id).toBe(boxes.email.x);
            expect(boxes.phone.x - boxes.icon.right, id).toBe(12);
            expect(boxes.row.top - boxes.title.bottom, id).toBe(12);
            expect(boxes.email.top - boxes.row.bottom, id).toBe(12);
            await expect(footer.locator(':scope > [data-design-name="Contatos"] > [data-design-name="Contatos"]')).toHaveCSS('text-align', 'left');
        }
    });
}
