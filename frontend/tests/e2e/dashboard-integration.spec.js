import { expect, test } from '@playwright/test';

if (process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH) test.use({ launchOptions: { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH } });

test.beforeEach(async ({ page }) => {
    const payload = Buffer.from(JSON.stringify({ sub: '550e8400-e29b-41d4-a716-446655440000', roles: 'ADMINISTRADOR', exp: Math.floor(Date.now() / 1000) + 3600 })).toString('base64url');
    await page.addInitScript(token => sessionStorage.setItem('ecodog.auth.token', token), `header.${payload}.signature`);
    await page.route(/^http:\/\/localhost:8080\/(dashboard|calendario\/dia)(?:\/.*|\?.*)?$/, route => {
        const url = new URL(route.request().url());
        const headers = { 'access-control-allow-origin': '*', 'access-control-allow-methods': 'GET, POST, PUT, OPTIONS', 'access-control-allow-headers': '*' };
        if (route.request().method() === 'OPTIONS') return route.fulfill({ status: 204, headers });
        let json;
        if (url.pathname === '/calendario/dia') json = { idCalendario: null, data: url.searchParams.get('data'), vagasCreche: 0, vagasHotel: 0 };
        else if (url.pathname === '/dashboard/servicos') json = [{ idServico: 2, nome: 'Plano semanal', categoria: 'CRECHE', frequencia: 2 }];
        else if (url.pathname === '/dashboard/metas') json = [];
        else if (url.pathname === '/dashboard/movimentacoes') json = [{ id: 4, idContrato: 9, dataRegistro: '2026-03-01', usuario: 'Ana', pet: 'Mel', servico: 'Creche', valor: 120 }];
        else if (url.pathname === '/dashboard/movimentacoes/4') json = {};
        else json = { kpiReceitas: ['CRECHE', 'HOTEL', 'DAYUSE'].map(categoria => ({ categoria, acumuladoMes: 0, meta: 0, percentualMeta: 0 })), planosAtivos: { planosAtivos: 0 }, agendamentosPorServico: [], graficoReceita: [], graficoNovosServicos: [], graficoContratosPorServico: [], ultimasMovimentacoes: [] };
        return route.fulfill({ status: route.request().method() === 'POST' ? 201 : 200, headers, json });
    });
});

test('cadastra meta usando data escolhida', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/admin');
    await page.getByText('Criar meta', { exact: true }).first().click();
    const dialog = page.getByRole('dialog');
    await dialog.getByLabel('Serviço', { exact: true }).selectOption('2');
    await dialog.getByLabel('Mês', { exact: true }).selectOption('03');
    await dialog.getByLabel('Ano', { exact: true }).fill('2026');
    const lookup = page.waitForResponse(response => response.url().includes('/dashboard/metas?') && response.request().method() === 'GET');
    await dialog.getByLabel('Data de referência da meta').fill('2026-03-17');
    await lookup;
    await dialog.getByLabel('Valor', { exact: true }).fill('125,00');
    const saved = page.waitForRequest(request => request.url().endsWith('/dashboard/metas') && request.method() === 'POST');
    await dialog.getByRole('button', { name: 'Criar meta' }).click();
    expect((await saved).postDataJSON()).toEqual({ mesReferencia: '2026-03-17', valor: 125, servico: { idServico: 2 } });
    await expect(dialog).not.toBeVisible();
});

test('registra pagamento de uma movimentação pendente', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/admin');
    await page.getByRole('button', { name: 'Registrar pagamento' }).click();
    const dialog = page.getByRole('dialog');
    await dialog.getByLabel('Movimentação pendente').selectOption('4');
    await dialog.getByLabel('Data do pagamento').fill('2026-03-17');
    await dialog.getByLabel('Forma de pagamento').fill('PIX');
    const saved = page.waitForRequest(request => request.url().endsWith('/dashboard/movimentacoes/4') && request.method() === 'PUT');
    await dialog.getByRole('button', { name: 'Registrar pagamento' }).click();
    expect((await saved).postDataJSON()).toEqual({ formaPagamento: 'PIX', dataPagamento: '2026-03-17', contrato: { idContrato: 9 } });
    await expect(dialog).not.toBeVisible();
});

test('consulta e edita meta por data exata', async ({ page }) => {
    await page.route(/^http:\/\/localhost:8080\/dashboard\/metas(?:\/8|\?.*)$/, route => {
        const headers = { 'access-control-allow-origin': '*', 'access-control-allow-methods': 'GET, PUT, OPTIONS', 'access-control-allow-headers': '*' };
        if (route.request().method() === 'OPTIONS') return route.fulfill({ status: 204, headers });
        return route.fulfill({ status: route.request().method() === 'PUT' ? 201 : 200, headers, json: route.request().method() === 'GET' ? [{ idMeta: 8, mesReferencia: '2026-03-17', valor: 125, servico: { idServico: 2 } }] : {} });
    });
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/admin');
    await page.getByRole('button', { name: 'Editar meta' }).click();
    const dialog = page.getByRole('dialog');
    await dialog.getByLabel('Serviço', { exact: true }).selectOption('2');
    await dialog.getByLabel('Mês cadastrado', { exact: true }).fill('2026-03-17');
    await expect(dialog.getByLabel('Valor', { exact: true })).toHaveValue('R$ 125,00');
    await dialog.getByLabel('Valor', { exact: true }).fill('150,00');
    const saved = page.waitForRequest(request => request.url().endsWith('/dashboard/metas/8') && request.method() === 'PUT');
    await dialog.getByRole('button', { name: 'Salvar alterações' }).click();
    expect((await saved).postDataJSON()).toEqual({ mesReferencia: '2026-03-17', valor: 150, servico: { idServico: 2 } });
    await expect(dialog).not.toBeVisible();
});
