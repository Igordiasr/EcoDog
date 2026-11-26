import { expect, test } from '@playwright/test';

const id = '550e8400-e29b-41d4-a716-446655440000';
const services = [
    { idServico: 2, nome: 'Creche mensal', categoria: 'CRECHE', modalidade: 'PLANO', frequencia: '2', valor: 500, status: true },
    { idServico: 3, nome: 'Hotel por dia', categoria: 'HOTEL', modalidade: 'DIARIA', frequencia: null, valor: 100, status: false },
];

test.beforeEach(async ({ page }) => {
    const payload = Buffer.from(JSON.stringify({ sub: id, roles: 'ADMINISTRADOR', exp: Math.floor(Date.now() / 1000) + 3600 })).toString('base64url');
    await page.addInitScript(token => sessionStorage.setItem('ecodog.auth.token', token), `header.${payload}.signature`);
});

for (const viewport of [{ width: 1440, height: 900 }, { width: 390, height: 844 }]) {
    test(`lista serviços reais e permite buscar em ${viewport.width}px`, async ({ page }) => {
        await page.setViewportSize(viewport);
        let authorization;
        await page.route('**/dashboard/servicos', route => {
            authorization = route.request().headers().authorization;
            return route.fulfill({ status: 200, headers: { 'access-control-allow-origin': '*' }, json: services });
        });
        await page.goto('/admin/planos');
        const list = page.getByRole('region', { name: 'Serviços cadastrados' });
        await expect(list.getByText('Creche mensal')).toBeVisible();
        await expect(list.getByText('Hotel por dia')).toBeVisible();
        await expect(list.getByText('R$ 500,00')).toBeVisible();
        await expect(list.getByText('Inativo', { exact: true })).toBeVisible();
        await expect(page.getByText('A criação, edição, alteração de situação e exclusão de planos ainda não estão disponíveis no sistema.')).toBeVisible();
        await expect(page.getByRole('button', { name: 'Criar Plano' })).toHaveCount(0);
        await expect(page.getByText('8 diárias')).toHaveCount(0);
        expect(authorization).toMatch(/^Bearer /);
        await list.getByRole('searchbox', { name: 'Buscar serviços' }).fill('creche');
        await expect(list.getByText('Creche mensal')).toBeVisible();
        await expect(list.getByText('Hotel por dia')).toHaveCount(0);
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    });
}

test('permite nova tentativa após erro e apresenta lista vazia', async ({ page }) => {
    let retry = false;
    await page.route('**/dashboard/servicos', route => {
        return route.fulfill({ status: retry ? 200 : 500, headers: { 'access-control-allow-origin': '*' }, json: retry ? [] : {} });
    });
    await page.goto('/admin/planos');
    const list = page.getByRole('region', { name: 'Serviços cadastrados' });
    await expect(list.getByRole('alert')).toBeVisible();
    retry = true;
    await list.getByRole('button', { name: 'Tentar novamente' }).click();
    await expect(list.getByText('Nenhum serviço cadastrado.')).toBeVisible();
});
