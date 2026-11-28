import { expect, test } from '@playwright/test';

const monitor = { id: '550e8400-e29b-41d4-a716-446655440000', nome: 'Ana', sobrenome: 'Silva', email: 'ana@example.com', telefone: '11999999999', statusUsuario: true };
const admin = { id: '550e8400-e29b-41d4-a716-446655440001', nome: 'Bruno', sobrenome: 'Souza', email: 'bruno@example.com', telefone: '11888888888', statusUsuario: false };

test.beforeEach(async ({ page }) => {
    const payload = Buffer.from(JSON.stringify({ sub: monitor.id, roles: 'ADMINISTRADOR', exp: Math.floor(Date.now() / 1000) + 3600 })).toString('base64url');
    await page.addInitScript(token => sessionStorage.setItem('ecodog.auth.token', token), `header.${payload}.signature`);
});

test('mantém as listas, buscas e ações independentes', async ({ page }) => {
    let monitorRequests = 0;
    let adminRequests = 0;
    await page.route('**/usuarios/**', async route => {
        const request = route.request();
        const isMonitor = request.url().includes('/monitores');
        if (request.method() === 'OPTIONS') return route.fulfill({ status: 204, headers: { 'access-control-allow-origin': '*', 'access-control-allow-methods': 'GET, POST, PUT, DELETE, OPTIONS', 'access-control-allow-headers': '*' } });
        if (request.method() === 'GET') isMonitor ? monitorRequests++ : adminRequests++;
        return route.fulfill({ status: 200, headers: { 'access-control-allow-origin': '*' }, json: request.method() === 'POST' ? monitor : isMonitor ? [monitor] : [admin] });
    });
    await page.goto('/admin/usuarios');
    const monitors = page.getByRole('region', { name: 'Monitores' });
    const admins = page.getByRole('region', { name: 'Administradores' });
    await expect(monitors.getByText('Ana Silva')).toBeVisible();
    await expect(admins.getByText('Bruno Souza')).toBeVisible();
    await monitors.getByRole('searchbox').fill('inexistente');
    await expect(monitors.getByText('Nenhum usuário encontrado para esta busca.')).toBeVisible();
    await expect(admins.getByText('Bruno Souza')).toBeVisible();
    await monitors.getByRole('searchbox').clear();
    const adminCount = adminRequests;
    const monitorCount = monitorRequests;
    await monitors.getByRole('button', { name: 'Criar Monitor' }).click();
    const dialog = page.getByRole('dialog', { name: 'Criar Monitor' });
    for (const [label, value] of Object.entries({ Nome: 'Ana', Sobrenome: 'Silva', 'E-mail': 'ana@example.com', CPF: '52998224725', Telefone: '11999999999', Senha: 'senha123', 'Confirmação de senha': 'senha123' })) await dialog.getByLabel(label, { exact: true }).fill(value);
    await dialog.getByRole('button', { name: 'Salvar' }).click();
    await expect(monitors.getByRole('status').filter({ hasText: 'Usuário salvo com sucesso.' })).toBeVisible();
    await expect.poll(() => monitorRequests).toBeGreaterThan(monitorCount);
    expect(adminRequests).toBe(adminCount);
});

test('mostra erro isolado e cartões sem transbordamento no celular', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.route('**/usuarios/**', route => route.fulfill({ status: route.request().url().includes('/monitores') ? 500 : 200, headers: { 'access-control-allow-origin': '*' }, json: route.request().url().includes('/monitores') ? {} : [admin] }));
    await page.goto('/admin/usuarios');
    await expect(page.getByRole('region', { name: 'Monitores' }).getByRole('alert')).toBeVisible();
    await expect(page.getByRole('region', { name: 'Administradores' }).getByText('Bruno Souza')).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});
