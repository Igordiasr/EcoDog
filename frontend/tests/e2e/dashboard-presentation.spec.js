import { expect, test } from '@playwright/test';

if (process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH) test.use({ launchOptions: { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH } });

test.beforeEach(async ({ page }) => {
    const payload = Buffer.from(JSON.stringify({ sub: '550e8400-e29b-41d4-a716-446655440000', roles: 'ADMINISTRADOR', exp: Math.floor(Date.now() / 1000) + 3600 })).toString('base64url');
    await page.addInitScript(token => sessionStorage.setItem('ecodog.auth.token', token), `header.${payload}.signature`);
    await page.route(/^http:\/\/localhost:8080\/dashboard(?:\/.*)?(?:\?.*)?$/, route => {
        const headers = { 'access-control-allow-origin': '*', 'access-control-allow-methods': 'GET, OPTIONS', 'access-control-allow-headers': '*' };
        if (route.request().method() === 'OPTIONS') return route.fulfill({ status: 204, headers });
        if (new URL(route.request().url()).pathname.endsWith('/servicos')) return route.fulfill({ status: 200, headers, json: [] });
        return route.fulfill({ status: 200, headers, json: {
            kpiReceitas: ['Creche', 'Hotel', 'DayUse'].map(categoria => ({ categoria, acumuladoMes: 0, meta: 0, percentualMeta: 0 })),
            planosAtivos: { planosAtivos: 44 },
            agendamentosPorServico: [{ servico: 'Creche', quantidadeAgendada: 4 }, { servico: 'DayUse', quantidadeAgendada: 3 }, { servico: 'Hotel', quantidadeAgendada: 3 }],
            graficoReceita: [], graficoNovosServicos: [], graficoContratosPorServico: [{ categoria: 'Creche', quantidade: 44 }], ultimasMovimentacoes: [],
        } });
    });
    await page.route(/^http:\/\/localhost:8080\/calendario\/dia\?.*$/, route => {
        const headers = { 'access-control-allow-origin': '*', 'access-control-allow-methods': 'GET, OPTIONS', 'access-control-allow-headers': '*' };
        if (route.request().method() === 'OPTIONS') return route.fulfill({ status: 204, headers });
        return route.fulfill({ status: 200, headers, json: { idCalendario: 1, data: new URL(route.request().url()).searchParams.get('data'), vagasCreche: 10, vagasHotel: 8 } });
    });
});

for (const width of [390, 1440]) {
    test(`apresenta ocupação e total do gráfico sem sobreposição em ${width}px`, async ({ page }) => {
        await page.setViewportSize({ width, height: 900 });
        await page.goto('/admin');
        await expect(page.getByText('Creche + Day Use: 7/10')).toBeVisible();
        await expect(page.getByText('Hotel: 3/8')).toBeVisible();
        await expect(page.getByText('Distribuição de pets por serviço')).toBeVisible();
        const donut = page.locator('.dashboard-donut svg');
        await expect(donut).toBeVisible();
        const bounds = await donut.evaluate(svg => {
            const svgBox = svg.getBoundingClientRect();
            const labels = [...svg.querySelectorAll('tspan')].map(label => label.getBoundingClientRect());
            return { labels: labels.map(({ x, y, right, bottom }) => ({ x, y, right, bottom })), x: svgBox.x, y: svgBox.y, size: svgBox.width };
        });
        const centerX = bounds.x + bounds.size / 2, centerY = bounds.y + bounds.size / 2;
        for (const label of bounds.labels) {
            for (const x of [label.x, label.right]) for (const y of [label.y, label.bottom])
                expect(Math.hypot(x - centerX, y - centerY)).toBeLessThan(55);
        }
        expect(bounds.labels[0].bottom).toBeLessThan(bounds.labels[1].y);
    });
}
