import { test, expect } from '@playwright/test';
// Intercepted UI regression; never evidence of a running Spring server.
const item = { idAtividade: 7, idAtividadeDoDia: null, nome: 'Boliche da API', descricao: 'Atividade real', categoria: 'Recreação', horaInicio: null, horaFim: null, situacao: null };
test('TL09 loads only public catalog data and preserves error/vazio states', async ({ page }) => {
    let result = [item];
    let status = 200;
    await page.route('http://localhost:8080/calendario/catalogo-atividades', async (route) => {
        await route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(result) });
    });
    await page.goto('/estrutura');
    await page.getByRole('button', { name: 'Consultar catálogo de atividades' }).click();
    await expect(page.getByText('Boliche da API')).toBeVisible();
    await expect(page.getByText('Atividade real')).toBeVisible();
    await page.getByRole('button', { name: 'Voltar', exact: true }).click();
    result = [];
    await page.getByRole('button', { name: 'Consultar catálogo de atividades' }).click();
    await expect(page.getByText('Nenhuma atividade cadastrada.')).toBeVisible();
    await page.getByRole('button', { name: 'Voltar', exact: true }).click();
    status = 403;
    await page.getByRole('button', { name: 'Consultar catálogo de atividades' }).click();
    await expect(page.getByRole('alert')).toContainText('Acesso negado.');
    status = 200;
    result = [item];
    await page.getByRole('button', { name: 'Tentar novamente' }).click();
    await expect(page.getByText('Boliche da API')).toBeVisible();
});
