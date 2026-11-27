import { expect, test } from '@playwright/test';

const id = '550e8400-e29b-41d4-a716-446655440000';
if (process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH) test.use({ launchOptions: { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH } });

test.beforeEach(async ({ page }) => {
    const payload = Buffer.from(JSON.stringify({ sub: id, roles: 'ADMINISTRADOR', exp: Math.floor(Date.now() / 1000) + 3600 })).toString('base64url');
    await page.addInitScript(token => sessionStorage.setItem('ecodog.auth.token', token), `header.${payload}.signature`);
    await page.route('**/calendario/**', route => {
        const url = new URL(route.request().url());
        const headers = { 'access-control-allow-origin': '*', 'access-control-allow-methods': 'GET, OPTIONS', 'access-control-allow-headers': '*' };
        if (route.request().method() === 'OPTIONS') return route.fulfill({ status: 204, headers });
        if (url.pathname.endsWith('/dias')) return route.fulfill({ status: 200, headers, json: [] });
        return route.fulfill({ status: 200, headers, json: { idCalendario: null, data: url.searchParams.get('data'), vagasCreche: 0, vagasHotel: 0, atividades: [], alunosAgendados: [{ idAgendamento: 1, idPet: id, nome: 'Mel', raca: 'Labrador', idade: 1, tutor: 'Ana', situacao: 'CONFIRMADO' }] } });
    });
});

for (const [device, width, height] of [['desktop', 1440, 900], ['mobile', 390, 844]]) {
    test(`exibe cartões de aulunos no ${device}`, async ({ page }) => {
        await page.setViewportSize({ width, height });
        await page.goto('/admin/calendario');
        const card = page.getByRole('article', { name: 'Agendamento de Mel' });
        await expect(card).toBeVisible();
        await expect(card.getByText('Labrador • 1 ano')).toBeVisible();
        await expect(card.getByText('Tutor: Ana')).toBeVisible();
        await expect(card.getByText('Horários não informados')).toBeVisible();
        await expect(card.getByRole('button', { name: /Cancelamento.*indisponível/ })).toBeDisabled();
        await card.getByText('Ver detalhes').click();
        await expect(card.getByText('Situação: Entrada registrada')).toBeVisible();
        expect(await card.evaluate(element => element.scrollWidth <= element.clientWidth)).toBe(true);
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    });
}

for (const [width, columns] of [[1440, 3], [1280, 3], [1024, 2], [390, 1]]) {
    test(`distribui o calendário em ${columns} coluna(s) na largura ${width}`, async ({ page }) => {
        await page.setViewportSize({ width, height: 900 });
        await page.goto('/admin/calendario');
        const layout = page.locator('[data-design-name="Calendário e rotina do dia"]');
        await expect(page.getByRole('article', { name: 'Agendamento de Mel' })).toBeVisible();
        const boxes = await layout.locator('[data-design-name="Calendário e configuração"], [data-design-name="Atividades do dia"], [data-design-name="Aulunos agendados"]').evaluateAll(elements => elements.map(element => {
            const box = element.getBoundingClientRect();
            return { x: box.x, y: box.y, width: box.width, right: box.right };
        }));
        expect(boxes).toHaveLength(3);
        expect(boxes.every(box => box.x >= 0 && box.right <= width)).toBe(true);
        expect(Math.max(...boxes.map(box => box.width)) - Math.min(...boxes.map(box => box.width))).toBeLessThan(2);
        if (columns === 3) expect(boxes[0].y).toBeCloseTo(boxes[2].y, 0);
        else if (columns === 2) {
            expect(boxes[0].y).toBeCloseTo(boxes[1].y, 0);
            expect(boxes[2].y).toBeGreaterThan(boxes[1].y);
            const activities = await layout.locator('[data-design-name="Atividades do dia"]').boundingBox();
            expect(boxes[2].y - (activities.y + activities.height)).toBeCloseTo(24, 0);
        } else expect(boxes[2].y).toBeGreaterThan(boxes[1].y);
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    });
}
