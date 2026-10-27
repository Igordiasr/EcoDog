import { test, expect } from '@playwright/test';
async function openCalendar(page, width = 1440, params = '') {
    await page.clock.setFixedTime(new Date(2026, 9, 25, 12));
    await page.setViewportSize({ width, height: 1000 });
    await page.goto(`/tests/fixtures/calendar-flow.html?${params}`);
    await expect(page).toHaveURL('/admin/calendario');
    await expect(page.getByText('Dados carregados pelo adaptador do calendário.', { exact: true })).toBeVisible();
}
const capacity = (page, service) => page.locator('.management-capacity').filter({ has: page.getByLabel(`Quantidade de vagas ${service}`, { exact: true }) });
async function calls(page) { return page.evaluate(() => JSON.parse(sessionStorage.getItem('fixture:calendar-calls') || '[]')); }
for (const width of [1440, 410]) {
    test(`TL14: calendário, datas completas e listas sem limite de cinco (${width}px)`, async ({ page }) => {
        await openCalendar(page, width);
        await expect(page.locator('.management-day')).toHaveCount(31);
        await expect(page.getByRole('button', { name: '25/10/2026, disponível, selecionado', exact: true })).toHaveAttribute('aria-pressed', 'true');
        await expect(page.getByRole('article')).toHaveCount(14);
        await page.getByRole('button', { name: '26/10/2026, disponível', exact: true }).click();
        await expect(page.getByText('Vagas para 26/10/2026.', { exact: true })).toBeVisible();
        await expect(page.getByText('Nenhuma atividade cadastrada para esta data.', { exact: true })).toBeVisible();
        await expect(page.getByRole('article')).toHaveCount(1);
        await page.getByRole('button', { name: 'Próximo mês', exact: true }).click();
        await expect(page.getByRole('heading', { name: 'novembro de 2026' })).toBeVisible();
        await expect(page.locator('.management-day')).toHaveCount(30);
        await page.getByRole('button', { name: 'Próximo mês', exact: true }).click();
        await page.getByRole('button', { name: 'Próximo mês', exact: true }).click();
        await expect(page.getByRole('heading', { name: 'janeiro de 2027' })).toBeVisible();
        expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBe(0);
    });
    test(`TL14: vagas independentes, validação e aviso de alterações pendentes (${width}px)`, async ({ page }) => {
        await openCalendar(page, width);
        const creche = capacity(page, 'creche'), hotel = capacity(page, 'hotel');
        await creche.getByRole('button', { name: 'Alterar', exact: true }).click();
        await creche.locator('input').fill('4');
        await expect(creche.locator('input')).toHaveAttribute('aria-invalid', 'true');
        await expect(creche.getByRole('button', { name: 'Salvar', exact: true })).toBeDisabled();
        await creche.locator('input').fill('1.5');
        await expect(creche.locator('input')).toHaveAttribute('aria-invalid', 'true');
        await creche.locator('input').fill('8');
        await hotel.getByRole('button', { name: 'Alterar', exact: true }).click();
        await hotel.locator('input').fill('9');
        await creche.getByRole('button', { name: 'Salvar', exact: true }).click();
        await expect(creche.getByText('Atual: 8 • Ocupadas: 5')).toBeVisible();
        await expect(hotel.locator('input')).toHaveValue('9');
        await expect(hotel.locator('input')).toBeEnabled();
        await page.getByRole('button', { name: '26/10/2026, disponível', exact: true }).click();
        await expect(page.getByRole('dialog', { name: 'Alterações não salvas' })).toBeVisible();
        await page.getByRole('dialog').getByRole('button', { name: 'Voltar', exact: true }).click();
        await hotel.getByRole('button', { name: 'Salvar', exact: true }).click();
        await expect(hotel.getByText('Atual: 9 • Ocupadas: 2')).toBeVisible();
    });
    test(`TL14: disponibilidade preserva reservas e exige confirmação (${width}px)`, async ({ page }) => {
        await openCalendar(page, width);
        await page.getByLabel('Disponibilidade do dia').selectOption('false');
        const confirmation = page.getByRole('dialog', { name: 'Confirmar indisponibilidade' });
        await expect(confirmation).toBeVisible();
        await confirmation.getByRole('button', { name: 'Confirmar', exact: true }).click();
        await expect(confirmation).toHaveCount(0);
        await expect(page.getByLabel('Disponibilidade do dia')).toHaveValue('false');
        await expect(page.getByRole('article')).toHaveCount(14);
        await page.getByLabel('Disponibilidade do dia').selectOption('true');
        await expect(page.getByLabel('Disponibilidade do dia')).toHaveValue('true');
    });
    test(`TL14: alteração mensal valida todos os dias e aplica apenas o serviço escolhido (${width}px)`, async ({ page }) => {
        await openCalendar(page, width);
        await page.getByRole('button', { name: 'Todos os dias do mês', exact: true }).click();
        const dialog = page.getByRole('dialog', { name: 'Todos os dias do mês' });
        await dialog.getByLabel('Quantidade', { exact: true }).fill('0');
        await dialog.getByRole('button', { name: 'Aplicar ao mês', exact: true }).click();
        await expect(dialog.getByRole('status')).toContainText('25/10/2026');
        expect(await calls(page)).toHaveLength(0);
        await dialog.getByLabel('Serviço', { exact: true }).selectOption('Hotel');
        await dialog.getByLabel('Quantidade', { exact: true }).fill('3');
        await dialog.getByRole('button', { name: 'Aplicar ao mês', exact: true }).click();
        const confirmation = page.getByRole('dialog', { name: 'Confirmar alteração mensal' });
        await confirmation.getByRole('button', { name: 'Confirmar', exact: true }).click();
        await expect(dialog).toHaveCount(0);
        await expect(capacity(page, 'hotel').getByText('Atual: 3 • Ocupadas: 2')).toBeVisible();
        await expect(capacity(page, 'creche').getByText('Atual: 10 • Ocupadas: 5')).toBeVisible();
        await expect(page.getByRole('article')).toHaveCount(14);
    });
    test(`TL14: criar, editar e remover atividades com validação e confirmação (${width}px)`, async ({ page }) => {
        await openCalendar(page, width);
        await page.getByRole('button', { name: 'Adicionar atividade', exact: true }).click();
        const dialog = page.getByRole('dialog', { name: 'Detalhes da atividade' });
        await dialog.getByRole('button', { name: 'Salvar atividade', exact: true }).click();
        await expect(dialog.getByLabel('Nome da atividade')).toHaveAttribute('aria-invalid', 'true');
        await dialog.getByLabel('Nome da atividade').fill('Atividade nova');
        await dialog.getByLabel('Início', { exact: true }).fill('09:30');
        await dialog.getByLabel('Término', { exact: true }).fill('10:30');
        await dialog.getByRole('button', { name: 'Salvar atividade', exact: true }).click();
        await expect(dialog.getByLabel('Início', { exact: true })).toHaveAttribute('aria-invalid', 'true');
        await dialog.getByLabel('Início', { exact: true }).fill('17:00');
        await dialog.getByLabel('Término', { exact: true }).fill('18:00');
        await dialog.getByRole('button', { name: 'Salvar atividade', exact: true }).click();
        await expect(dialog).toHaveCount(0);
        const record = page.getByRole('article', { name: 'Atividade nova', exact: true });
        await record.getByRole('button', { name: 'Ver detalhes', exact: true }).click();
        await dialog.getByLabel('Nome da atividade').fill('Atividade editada');
        await dialog.getByRole('button', { name: 'Salvar atividade', exact: true }).click();
        await page.getByRole('button', { name: 'Remover Atividade editada', exact: true }).click();
        const confirmation = page.getByRole('dialog', { name: 'Remover atividade' });
        await confirmation.getByRole('button', { name: 'Confirmar', exact: true }).click();
        await expect(page.getByRole('article', { name: 'Atividade editada', exact: true })).toHaveCount(0);
    });
    test(`TL14: detalhes e cancelamento preservam cadastro e liberam ocupação (${width}px)`, async ({ page }) => {
        await openCalendar(page, width);
        const record = page.getByRole('article', { name: 'Agendamento de Pet de exemplo', exact: true });
        await record.getByRole('button', { name: 'Ver detalhes', exact: true }).click();
        const details = page.getByRole('dialog', { name: 'Detalhes do agendamento' });
        await expect(details.getByText('Identificador do pet: mock-pet')).toBeVisible();
        await details.getByRole('button', { name: 'Cancelar agendamento de Pet de exemplo', exact: true }).click();
        await page.getByRole('dialog', { name: 'Cancelar agendamento' }).getByRole('button', { name: 'Confirmar', exact: true }).click();
        await expect(details).toHaveCount(0);
        await expect(capacity(page, 'creche').getByText('Atual: 10 • Ocupadas: 4')).toBeVisible();
        expect((await calls(page)).at(-1).kind).toBe('cancelBooking');
    });
}
test('TL14: falha mantém os valores e não anuncia sucesso', async ({ page }) => {
    await openCalendar(page, 1440, 'failure');
    const creche = capacity(page, 'creche');
    await creche.getByRole('button', { name: 'Alterar', exact: true }).click();
    await creche.locator('input').fill('8');
    await creche.getByRole('button', { name: 'Salvar', exact: true }).click();
    await expect(page.getByText('Falha de teste ao salvar o calendário.', { exact: true })).toBeVisible();
    await expect(creche.locator('input')).toHaveValue('8');
    await expect(creche.getByText('Atual: 10 • Ocupadas: 5')).toBeVisible();
});
test('TL14: estados vazio e erro de carregamento são distintos', async ({ page }) => {
    await openCalendar(page, 1440, 'empty');
    await expect(page.getByText('Nenhuma atividade cadastrada para esta data.', { exact: true })).toBeVisible();
    await expect(page.getByText('Nenhum agendamento para esta data.', { exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Adicionar atividade', exact: true })).toBeEnabled();
    await page.goto('/tests/fixtures/calendar-flow.html?loadFailure');
    await expect(page.getByRole('alert')).toContainText('Falha de teste no carregamento do calendário.');
});
test('TL14: política de cancelamento pode bloquear a ação sem alterar dados', async ({ page }) => {
    await openCalendar(page, 1440, 'denyCancel');
    await page.getByRole('button', { name: 'Cancelar agendamento de Pet de exemplo', exact: true }).click();
    await expect(page.getByText('Cancelamento bloqueado pela política de teste.', { exact: true })).toBeVisible();
    await expect(page.getByRole('dialog')).toHaveCount(0);
    expect(await calls(page)).toHaveLength(0);
});
test('TL14: cliques repetidos não duplicam gravações e o teclado seleciona datas', async ({ page }) => {
    await openCalendar(page);
    const creche = capacity(page, 'creche');
    await creche.getByRole('button', { name: 'Alterar', exact: true }).click();
    await creche.locator('input').fill('8');
    await creche.getByRole('button', { name: 'Salvar', exact: true }).evaluate(node => { node.click(); node.click(); });
    await expect(creche.getByText('Atual: 8 • Ocupadas: 5')).toBeVisible();
    expect(await calls(page)).toHaveLength(1);
    const date = page.getByRole('button', { name: '26/10/2026, disponível', exact: true });
    await date.focus();
    await date.press('Enter');
    await expect(page.getByRole('button', { name: '26/10/2026, disponível, selecionado', exact: true })).toHaveAttribute('aria-pressed', 'true');
});
