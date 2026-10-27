import { test, expect } from '@playwright/test';

const activity = { idAtividadeDoDia: 12, nome: 'Busca de bolinha', descricao: 'Buscar e devolver a bola.', categoria: 'Recreação', horaInicio: '09:00:00', horaFim: '09:30:00', situacao: 'PENDENTE', grupos: [{ grupo: 2, petsDoGrupo: [{ idPet: 9, nome: 'Bolinha', idParticipacaoDoPet: 31, idAgendamento: 6 }] }] };

for (const viewport of [{ width: 1440, height: 1000 }, { width: 390, height: 844 }]) {
    test(`consulta, expande, mostra pet e conclui em ${viewport.width}px`, async ({ page }) => {
        await page.setViewportSize(viewport);
        await page.addInitScript(() => {
            const token = `header.${btoa(JSON.stringify({ roles: 'MONITOR', sub: '2', exp: Math.floor(Date.now() / 1000) + 3600 }))}.signature`;
            sessionStorage.setItem('ecodog.auth.token', token);
        });
        let current = [{ ...activity }, { ...activity, idAtividadeDoDia: 13, nome: 'Circuito' }];
        const writes = [];
        await page.route('http://localhost:8080/**', async route => {
            const request = route.request();
            const path = new URL(request.url()).pathname;
            if (request.method() === 'OPTIONS') return route.fulfill({ status: 204 });
            if (path === '/atividades') {
                expect(request.headers().authorization).toContain('Bearer ');
                if (request.method() === 'PUT') {
                    const body = request.postDataJSON();
                    writes.push(body);
                    current = current.map(a => a.idAtividadeDoDia === body.idAtividadeDoDia ? { ...a, situacao: body.situacao } : a);
                    return route.fulfill({ status: 204 });
                }
                return route.fulfill({ json: { data: '2026-10-27', atividadesDoDia: current } });
            }
            if (path === '/feed-monitor/pet/9') return route.fulfill({ json: { nome: 'Bolinha', raca: 'SRD', nomeTutor: 'Ana', observacao: 'Gosta de carinho.' } });
            return route.fulfill({ status: 404, json: {} });
        });
        await page.goto('/monitor/atividades');
        const main = page.locator('main');
        await expect(main.getByText('Busca de bolinha', { exact: true })).toBeVisible();
        await expect(main.getByText('Grupo Pet2 - Duração 30 Min')).toBeVisible();
        const summary = main.locator('[data-design-name="Atividade resumida"]');
        await summary.getByRole('button', { name: 'Detalhes' }).click();
        await expect(main.locator('[data-design-name="Atividade expandida"]')).toContainText('Circuito');
        await main.locator('[data-design-name="Card de pet"]').getByRole('button', { name: 'Detalhes' }).click();
        const dialog = page.getByRole('dialog');
        await expect(dialog).toContainText('Tutor: Ana');
        await dialog.getByRole('button', { name: 'Voltar' }).click();
        await main.getByRole('button', { name: 'Concluído', exact: true }).click();
        await expect(main.getByText('Circuito', { exact: true })).toHaveCount(0);
        expect(writes).toEqual([{ situacao: 'CONCLUIDA', idAtividadeDoDia: 13 }]);
        await main.getByRole('button', { name: 'CONCLUÍDOS', exact: true }).click();
        await expect(main.getByText('Circuito', { exact: true })).toBeVisible();
        await expect(main.getByRole('button', { name: 'Concluído', exact: true })).toBeDisabled();
        await expect(main).not.toContainText('Dados ilustrativos');
        await main.getByRole('button', { name: 'Voltar', exact: true }).click();
        await expect(page).toHaveURL(/\/monitor\/check-in$/);
    });
}

test('trata falhas de consulta e atualização sem manter cartões desatualizados', async ({ page }) => {
    await page.addInitScript(() => sessionStorage.setItem('ecodog.auth.token', `h.${btoa(JSON.stringify({ roles: 'MONITOR', sub: '2', exp: Math.floor(Date.now() / 1000) + 3600 }))}.s`));
    let failRead = true;
    let writes = 0;
    await page.route('http://localhost:8080/**', async route => {
        const request = route.request();
        if (new URL(request.url()).pathname !== '/atividades') return route.fulfill({ status: 404, json: {} });
        if (request.method() === 'PUT') {
            writes++;
            failRead = true;
            return route.fulfill({ status: 204 });
        }
        if (failRead) return route.fulfill({ status: 503, json: {} });
        return route.fulfill({ json: { data: '2026-10-27', atividadesDoDia: writes ? [{ ...activity, situacao: 'CONCLUIDA' }] : [activity] } });
    });
    await page.goto('/monitor/atividades');
    const main = page.locator('main');
    await expect(main.getByRole('button', { name: 'Tentar novamente' })).toBeVisible();
    await expect(main.locator('[data-design-name="Atividade expandida"]')).toHaveCount(0);
    failRead = false;
    await main.getByRole('button', { name: 'Tentar novamente' }).click();
    await main.getByRole('button', { name: 'Concluído', exact: true }).click();
    await expect(main.getByRole('button', { name: 'Tentar novamente' })).toBeVisible();
    await expect(main.getByRole('button', { name: 'Concluído', exact: true })).toHaveCount(0);
    expect(writes).toBe(1);
    failRead = false;
    await main.getByRole('button', { name: 'Tentar novamente' }).click();
    await main.getByRole('button', { name: 'CONCLUÍDOS', exact: true }).click();
    await expect(main.getByRole('button', { name: 'Concluído', exact: true })).toBeDisabled();
});
