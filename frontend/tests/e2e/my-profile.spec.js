import { expect, test } from '@playwright/test';

const id = '550e8400-e29b-41d4-a716-446655440000';
const address = { cep: '01001000', rua: 'Praça da Sé', numero: '10', complemento: '', bairro: 'Sé', cidade: 'São Paulo' };
const tutor = { idTutor: id, nome: 'Ana', sobrenome: 'Silva', cpf: '52998224725', email: 'ana@example.com', telefone: '11912345678', endereco: address };
const cors = { 'access-control-allow-origin': '*', 'access-control-allow-headers': '*', 'access-control-allow-methods': '*' };

async function login(page, role) {
    const payload = Buffer.from(JSON.stringify({ sub: id, roles: role, exp: Math.floor(Date.now() / 1000) + 3600 })).toString('base64url');
    await page.addInitScript(token => sessionStorage.setItem('ecodog.auth.token', token), `header.${payload}.signature`);
}

test('tutor consulta CEP e salva o próprio endereço', async ({ page }) => {
    await login(page, 'TUTOR');
    let saved;
    await page.route(`**/tutores/conta/${id}`, route => {
        if (route.request().method() === 'OPTIONS') return route.fulfill({ status: 204, headers: cors });
        if (route.request().method() === 'PUT') saved = route.request().postDataJSON();
        return route.fulfill({ status: 200, headers: cors, json: saved ? { ...tutor, ...saved } : tutor });
    });
    await page.route('**/viacep.com.br/ws/01310100/json/', route => route.fulfill({ status: 200, headers: cors, json: { logradouro: 'Avenida Paulista', bairro: 'Bela Vista', localidade: 'São Paulo' } }));
    await page.goto('/tutor/pets');
    await page.getByRole('button', { name: 'Meus Dados' }).first().click();
    await page.getByLabel('CEP', { exact: true }).fill('01310100');
    await expect(page.getByLabel('Rua / avenida')).toHaveValue('Avenida Paulista');
    await page.getByLabel('Número', { exact: true }).fill('123');
    await page.getByRole('button', { name: 'Salvar alterações' }).click();
    await expect(page.getByText('Dados atualizados com sucesso.')).toBeVisible();
    expect(saved.endereco).toEqual({ cep: '01310100', rua: 'Avenida Paulista', numero: '123', complemento: '', bairro: 'Bela Vista', cidade: 'São Paulo' });
});

test('informa quando o backend bloqueia a consulta do monitor', async ({ page }) => {
    await login(page, 'MONITOR');
    await page.route(`**/usuarios/monitores/${id}`, route => route.fulfill({ status: 403, headers: cors, json: {} }));
    await page.goto('/monitor/check-in');
    await page.getByRole('button', { name: 'Meus Dados' }).first().click();
    await expect(page.getByText('A consulta de perfil do monitor não está liberada pelo backend.')).toBeVisible();
    await expect(page.getByLabel('Celular com DDD')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Salvar alterações' })).toBeDisabled();
    await expect(page.getByLabel('CEP', { exact: true })).toHaveCount(0);
    await page.getByRole('tab', { name: 'Segurança' }).click();
    await expect(page.getByLabel('Senha atual')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Atualizar senha' })).toBeDisabled();
});

test('permite preencher endereço manualmente quando o CEP não é encontrado', async ({ page }) => {
    await login(page, 'TUTOR');
    let saved;
    await page.route(`**/tutores/conta/${id}`, route => {
        if (route.request().method() === 'OPTIONS') return route.fulfill({ status: 204, headers: cors });
        if (route.request().method() === 'PUT') saved = route.request().postDataJSON();
        return route.fulfill({ status: 200, headers: cors, json: saved ? { ...tutor, ...saved } : tutor });
    });
    await page.route('**/viacep.com.br/ws/99999999/json/', route => route.fulfill({ status: 200, headers: cors, json: { erro: true } }));
    await page.goto('/tutor/pets');
    await page.getByRole('button', { name: 'Meus Dados' }).first().click();
    await page.getByLabel('CEP', { exact: true }).fill('99999999');
    await expect(page.getByText('CEP não encontrado. Confira o CEP ou preencha o endereço manualmente.')).toBeVisible();
    await page.getByLabel('Rua / avenida').fill('Rua manual');
    await page.getByRole('button', { name: 'Salvar alterações' }).click();
    await expect(page.getByText('Dados atualizados com sucesso.')).toBeVisible();
    expect(saved.endereco.rua).toBe('Rua manual');
});

test('administrador consulta dados sem oferecer edição incompatível', async ({ page }) => {
    await login(page, 'ADMINISTRADOR');
    await page.route(`**/usuarios/administradores/${id}`, route => route.fulfill({ status: 200, headers: cors, json: { id, nome: 'Ana', sobrenome: 'Silva', email: 'ana@example.com', telefone: '11912345678' } }));
    await page.goto('/admin/planos');
    await page.getByRole('button', { name: 'Meus Dados' }).first().click();
    await expect(page.getByText('ana@example.com')).toBeVisible();
    await expect(page.getByLabel('Celular com DDD')).toHaveValue('11912345678');
    await expect(page.getByText('A alteração de telefone ainda não está disponível para este acesso no backend. Nenhuma alteração será salva.')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Salvar alterações' })).toBeDisabled();
    await expect(page.getByLabel('CEP', { exact: true })).toHaveCount(0);
    await page.getByRole('tab', { name: 'Segurança' }).click();
    await expect(page.getByLabel('Senha atual')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Atualizar senha' })).toBeDisabled();
});

test('tutor altera senha pela aba Segurança', async ({ page }) => {
    await login(page, 'TUTOR');
    let saved;
    await page.route(`**/tutores/conta/${id}`, route => route.fulfill({ status: 200, headers: cors, json: tutor }));
    await page.route(`**/tutores/conta/${id}/senha`, route => {
        if (route.request().method() === 'OPTIONS') return route.fulfill({ status: 204, headers: cors });
        saved = route.request().postDataJSON();
        return route.fulfill({ status: 204, headers: cors });
    });
    await page.goto('/tutor/pets');
    await page.getByRole('button', { name: 'Meus Dados' }).first().click();
    await page.getByRole('tab', { name: 'Segurança' }).click();
    await page.getByLabel('Senha atual').fill('senhaantiga');
    await page.getByLabel('Nova senha', { exact: true }).fill('NovaSenha123');
    await page.getByLabel('Confirmar nova senha').fill('NovaSenha123');
    await page.getByRole('button', { name: 'Atualizar senha' }).click();
    await expect(page.getByText('Senha atualizada com sucesso.')).toBeVisible();
    await expect(page.getByLabel('Senha atual')).toHaveValue('');
    expect(saved).toEqual({ senhaAtual: 'senhaantiga', novaSenha: 'NovaSenha123' });
});

test('mantém campos roláveis e ações visíveis no celular', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 700 });
    await login(page, 'TUTOR');
    await page.route(`**/tutores/conta/${id}`, route => route.fulfill({ status: 200, headers: cors, json: tutor }));
    await page.goto('/tutor/pets');
    await page.getByRole('button', { name: 'Meus Dados' }).first().click();
    const dialog = page.getByRole('dialog', { name: 'Meu Perfil' });
    await expect(dialog.getByRole('button', { name: 'Salvar alterações' })).toBeInViewport();
    await expect(dialog.getByLabel('Cidade')).toBeVisible();
    expect(await dialog.evaluate(element => element.scrollWidth <= element.clientWidth)).toBe(true);
    await dialog.getByRole('tab', { name: 'Meus dados' }).focus();
    await page.keyboard.press('ArrowRight');
    await expect(dialog.getByRole('tab', { name: 'Segurança' })).toBeFocused();
    await expect(dialog.getByLabel('Senha atual')).toBeVisible();
});
