import { expect, test } from '@playwright/test';

const calls = async (page: import('@playwright/test').Page) => page.evaluate(() => JSON.parse(sessionStorage.getItem('fixture:critical-calls') || '[]'));

for (const screen of ['TL13', 'TL14', 'TL06', 'TL05']) {
  test(`prévia ${screen} ignora fontes reais injetadas`, async ({ page }) => {
    await page.goto(`/tests/fixtures/critical-safety-flow.html?screen=${screen}&preview`);
    await expect(page.locator('main')).toBeVisible();
    await expect(page.getByText('Fonte real não deve ser chamada na prévia.')).toHaveCount(0);
    expect(await page.evaluate(() => sessionStorage.getItem('fixture:real-source-called'))).toBeNull();
    expect(await calls(page)).toEqual([]);
  });
}

for (const width of [1440, 410]) {
  for (const [screen, rowName, name] of [['TL05', 'Pet cadastrado', 'Mel'], ['TL17', 'Plano', 'Creche'], ['TL16', 'Vínculo de cliente', 'Bob']] as const) {
    test(`sem identidade: edição ${screen} não abre outro registro (${width}px)`, async ({ page }) => {
      await page.setViewportSize({ width, height: 1000 });
      await page.goto(`/tests/fixtures/critical-safety-flow.html?screen=${screen}`);
      const row = page.locator(`[data-design-name="${rowName}"]`).filter({ hasText: name }).first();
      await expect(row.getByRole('button', { name: 'Editar', exact: true })).toBeVisible();
      const before = await row.innerText();
      await row.getByRole('button', { name: 'Editar', exact: true }).click();
      await expect(page.getByRole('alert')).toContainText('sem identidade de domínio');
      await expect(page.getByRole('dialog')).toHaveCount(0);
      expect(await row.innerText()).toBe(before);
      await page.getByRole('button', { name: 'Fechar mensagem', exact: true }).click();
      expect(await row.innerText()).toBe(before);
      expect(await calls(page)).toEqual([]);
    });
  }
  test(`check-out não usa estado ilustrativo como check-in válido (${width}px)`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto('/tests/fixtures/critical-safety-flow.html?screen=TL11');
    const exits = page.getByRole('button', { name: 'Registrar saída', exact: true });
    await expect(exits.first()).toBeDisabled();
    for (const exit of await exits.all()) await expect(exit).toBeDisabled();
    const before = await page.locator('main').innerText();
    await page.getByRole('button', { name: 'Registrar entrada', exact: true }).first().click();
    await expect(page.getByRole('alert')).toContainText('check-in válido');
    // Removing the native attribute must not turn an example into an operation.
    await exits.first().evaluate(button => { (button as HTMLButtonElement).disabled = false; });
    await exits.first().click();
    await expect(page.getByRole('alert')).toContainText('check-in válido');
    expect(await page.locator('main').innerText()).toBe(before);
    expect(await calls(page)).toEqual([]);
    await expect(page.getByText('SUCESSO DO ADAPTADOR DE TESTE')).toHaveCount(0);
  });
  test(`calendário ilustrativo não confirma reserva (${width}px)`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto('/tests/fixtures/critical-safety-flow.html?screen=TL03');
    await expect(page.getByText(/Calendário ilustrativo: vagas reais não foram consultadas/)).toBeVisible();
    if (width === 410) {
      for (let step = 0; step < 3; step++) await page.getByRole('button', { name: 'Avançar', exact: true }).click();
    }
    // Even recolouring every day cannot supply operational availability.
    await page.locator('.calendar-day').evaluateAll(days => days.forEach(day => { (day as HTMLElement).style.backgroundColor = 'green'; }));
    await page.getByRole('button', { name: 'Agendar', exact: true }).click();
    await expect(page.getByRole('alert')).toContainText('Nenhuma reserva foi criada');
    await expect(page.getByRole('dialog')).toHaveCount(0);
    expect(await calls(page)).toEqual([]);
    await expect(page.getByText('SUCESSO DO ADAPTADOR DE TESTE')).toHaveCount(0);
  });
}

test('feed operacional sem IDs não envia exemplo ao adaptador, mesmo em cenário de falha', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/tests/fixtures/critical-safety-flow.html?screen=TL10&failure');
  const record = page.locator('[data-design-name="Registro de alimentação"]').nth(1);
  await record.locator('textarea').fill('Rascunho ainda não salvo');
  await record.getByRole('button', { name: 'Salvar', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('Nenhum registro foi enviado ou salvo no servidor');
  await expect(record.locator('textarea')).toHaveValue('Rascunho ainda não salvo');
  await expect(record.locator('textarea')).toBeEnabled();
  expect(await calls(page)).toEqual([]);
  await expect(page.getByText('SUCESSO DO ADAPTADOR DE TESTE')).toHaveCount(0);
});

test('Estrutura não anuncia vagas reais a partir do calendário do protótipo', async ({ page }) => {
  await page.goto('/estrutura');
  await expect(page.getByText(/Calendário ilustrativo: vagas reais não foram consultadas/)).toBeVisible();
  await expect(page.getByText('Calendário ilustrativo', { exact: true })).toBeVisible();
  await expect(page.locator('.calendar-day').first()).toHaveAttribute('aria-description', /Vagas reais não foram consultadas/);
  await expect(page.getByText('Veja nossas vagas', { exact: true })).toHaveCount(0);
});

test('vínculo ilustrativo não envia nomes como identidade de tutor/pet', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/tests/fixtures/critical-safety-flow.html?screen=TL16');
  await page.getByRole('button', { name: 'Vincular Plano', exact: true }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog.getByRole('status')).toContainText('sem identidade de domínio');
  await dialog.getByRole('button', { name: 'Salvar', exact: true }).click();
  await expect(page.locator('.status-message')).toContainText('Nenhum registro foi alterado');
  expect(await calls(page)).toEqual([]);
  await expect(dialog).toBeVisible();
});
