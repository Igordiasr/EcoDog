import { test, expect, type Page, type Locator } from '@playwright/test';

async function openDashboard(page: Page, width = 1440, params = '') {
  await page.clock.setFixedTime(new Date(2026, 9, 25, 12));
  await page.setViewportSize({ width, height: 1000 });
  await page.goto(`/tests/fixtures/dashboard-flow.html?${params}`);
  await expect(page).toHaveURL('/admin');
  await expect(page.locator('.dashboard-chart').first()).toBeVisible();
}
const indicator = (page: Page, title: string) => page.locator('[data-design-name="Indicador"]').filter({ hasText: title });
async function paste(field: Locator, text: string) {
  await field.evaluate((node, text) => {
    const input = node as HTMLInputElement;
    input.focus(); input.setSelectionRange(0, input.value.length);
    const clipboardData = new DataTransfer(); clipboardData.setData('text', text);
    input.dispatchEvent(new ClipboardEvent('paste', { clipboardData, bubbles: true, cancelable: true }));
  }, text);
}
async function calls(page: Page) { return page.evaluate(() => JSON.parse(sessionStorage.getItem('fixture:dashboard-calls') || '[]')); }

for (const width of [1440, 410]) {
  test(`TL13: gráficos dinâmicos, KPIs e organização visual (${width}px)`, async ({ page }) => {
    await openDashboard(page, width);
    await expect(indicator(page, 'Receita mensal (Creche)')).toContainText('90% ▼');
    await expect(indicator(page, 'Receita mensal (Hotel)')).toContainText('105% ▲');
    await expect(indicator(page, 'Contratos ativos').locator('[data-design-name="Valor"]')).toHaveText('32');
    await expect(indicator(page, 'Pets previstos para hoje')).toContainText('Creche: 6/10');
    await expect(page.getByRole('img', { name: 'Distribuição de pets' })).toBeVisible();
    await expect(page.locator('.dashboard-donut-total')).toHaveText('44 pets');
    await expect(page.locator('svg[aria-label="Receita dos últimos 12 meses"] g[role="button"]')).toHaveCount(12);
    await expect(page.locator('svg[aria-label="Novos contratos dos últimos 6 meses"] g[role="button"]')).toHaveCount(6);
    await expect(page.locator('.dashboard-axis').first()).toHaveCSS('font-size', '20px');
    await expect(page.locator('.dashboard-axis').first()).toHaveCSS('fill', 'rgb(0, 0, 0)');
    await expect(page.locator('.kpi-meta-line').first()).toHaveCSS('font-size', '18px');
    const forecast = page.locator('.dashboard-revenue-panel [data-design-name="Legenda"] [data-design-name="Série"]').first().locator('[data-design-name="Símbolo"]');
    await expect(forecast).toHaveCSS('background-color', 'rgb(222, 143, 59)');
    await expect(page.locator('.dashboard-revenue-panel svg path').first()).toHaveCSS('stroke', 'rgb(222, 143, 59)');
    for (const marker of await page.locator('.dashboard-page [data-design-name="Legenda"] [data-design-name="Símbolo"]').all()) await expect(marker).toHaveCSS('border-radius', '50%');
    expect(await page.locator('.dashboard-distribution-legend').allTextContents()).toEqual(expect.arrayContaining([expect.stringMatching(/^Cães ativos/)]));
    await expect(page.getByText(/^Total: /)).toHaveCount(0);
    const kpiBox = (await page.locator('[data-design-name="Resumo administrativo"]').boundingBox())!;
    const revenue = page.locator('.dashboard-revenue-panel');
    const revenueBox = (await revenue.boundingBox())!;
    expect(Math.abs(revenueBox.width - kpiBox.width)).toBeLessThan(2);
    expect(revenueBox.y).toBeGreaterThanOrEqual(kpiBox.y + kpiBox.height);
    const panels = page.locator('.dashboard-secondary-charts > *');
    const left = (await panels.nth(0).boundingBox())!, right = (await panels.nth(1).boundingBox())!;
    expect(left.y).toBeGreaterThanOrEqual(revenueBox.y + revenueBox.height);
    if (width === 1440) { expect(Math.abs(left.y - right.y)).toBeLessThan(2); expect(right.x).toBeGreaterThan(left.x); }
    else expect(right.y).toBeGreaterThan(left.y);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBe(0);
    await expect(page.locator('[data-design-name="Movimentação"]')).toHaveCount(3);
  });

  test(`TL13: edição de meta existente atualiza valor e KPI (${width}px)`, async ({ page }) => {
    await openDashboard(page, width);
    await page.getByRole('button', { name: 'Editar meta', exact: true }).click();
    const dialog = page.getByRole('dialog');
    await expect(dialog.getByLabel('Valor', { exact: true })).toBeDisabled();
    await dialog.getByLabel('Mês cadastrado', { exact: true }).selectOption('2026-10');
    await dialog.getByLabel('Serviço', { exact: true }).selectOption('Creche');
    await expect(dialog.getByLabel('Valor', { exact: true })).toHaveValue(/2\.000,00/);
    await dialog.getByLabel('Mês cadastrado', { exact: true }).selectOption('2026-09');
    await expect(dialog.getByLabel('Valor', { exact: true })).toHaveValue(/1\.500,00/);
    await dialog.getByLabel('Mês cadastrado', { exact: true }).selectOption('2026-10');
    await dialog.getByLabel('Valor', { exact: true }).fill('1800,00');
    if (width === 410) {
      await dialog.getByRole('button', { name: 'Avançar', exact: true }).click();
      await expect(dialog.getByText('Não preenchido', { exact: true })).toHaveCount(0);
    }
    await dialog.getByRole('button', { name: 'Salvar alterações', exact: true }).click();
    await expect(dialog).toHaveCount(0);
    await expect(indicator(page, 'Receita mensal (Creche)')).toContainText('100%');
    await expect(indicator(page, 'Receita mensal (Creche)')).not.toContainText('▲');
    await expect(indicator(page, 'Receita mensal (Creche)')).not.toContainText('▼');
    expect((await calls(page))[0].payload.target).toBe('example-goal-Creche-2026-10');
  });

  test(`TL13: receita valida campos, revisão e atualiza movimentações (${width}px)`, async ({ page }) => {
    await openDashboard(page, width);
    await page.getByRole('button', { name: 'Adicionar receita', exact: true }).click();
    const dialog = page.getByRole('dialog');
    await dialog.getByLabel('Cliente', { exact: true }).selectOption('example-viviane');
    await dialog.getByLabel('Pet', { exact: true }).selectOption('example-pet-0');
    await dialog.getByLabel('Cliente', { exact: true }).selectOption('example-client');
    await expect(dialog.getByLabel('Pet', { exact: true })).toHaveValue('');
    await expect(dialog.getByLabel('Pet', { exact: true }).locator('option[value="example-pet-0"]')).toHaveCount(0);
    await dialog.getByLabel('Cliente', { exact: true }).selectOption('example-viviane');
    await dialog.getByLabel('Pet', { exact: true }).selectOption('example-pet-0');
    if (width === 410) await dialog.getByRole('button', { name: 'Avançar', exact: true }).click();
    await dialog.getByLabel('Serviço', { exact: true }).selectOption('Hotel');
    const date = dialog.getByLabel('Data', { exact: true });
    await date.pressSequentially('251020265555');
    await expect(date).toHaveValue('25/10/2026');
    await paste(date, '202655-10-25');
    await expect(date).toHaveValue('25/10/2026');
    await date.fill('31022026');
    const value = dialog.getByLabel('Valor', { exact: true });
    await value.fill('-1');
    const next = dialog.getByRole('button', { name: width === 410 ? 'Avançar' : 'Salvar', exact: true });
    await next.click();
    await expect(date).toHaveAttribute('aria-invalid', 'true');
    await expect(value).toHaveAttribute('aria-invalid', 'true');
    expect(await calls(page)).toHaveLength(0);
    await date.fill('25102026');
    await value.fill('1e5');
    await next.click();
    await expect(value).toHaveAttribute('aria-invalid', 'true');
    await value.fill('350,00');
    await value.focus();
    expect(await value.evaluate(node => getComputedStyle(node).outlineStyle)).toBe('none');
    if (width === 410) {
      await next.click();
      await expect(dialog.getByText('Não preenchido', { exact: true })).toHaveCount(0);
      await expect(dialog.getByText('Viviane', { exact: true })).toBeVisible();
      await expect(dialog.getByText('Thor', { exact: true })).toBeVisible();
    }
    await dialog.getByRole('button', { name: 'Salvar', exact: true }).click();
    await expect(dialog).toHaveCount(0);
    await expect(page.locator('[data-design-name="Movimentação"]')).toHaveCount(3);
    await expect(indicator(page, 'Receita mensal (Hotel)')).toContainText(/6\.650,00/);
    await expect(page.locator('[data-design-name="Movimentação"]').first()).toContainText(/350,00/);
  });

  test(`TL13: apenas um X por popup e fechamento preservado (${width}px)`, async ({ page }) => {
    await openDashboard(page, width);
    for (const name of ['Criar meta', 'Editar meta', 'Adicionar receita']) {
      await page.getByRole('button', { name, exact: true }).first().click();
      const dialog = page.getByRole('dialog');
      await dialog.locator('input,select').first().waitFor();
      expect(await dialog.getByRole('button').evaluateAll(nodes => nodes.filter(node => node.textContent?.trim() === '×').length)).toBe(1);
      await expect(dialog.locator('[data-design-id="MvB0T"], [data-design-id="lhqsl"], [data-design-id="ekNt5"]')).toHaveCount(0);
      const header = dialog.getByRole('button', { name: 'Dashboard geral', exact: true });
      if (await header.count()) {
        expect(await header.evaluate(node => getComputedStyle(node).borderTopWidth)).toBe('0px');
        expect(await header.evaluate(node => getComputedStyle(node).backgroundColor)).toBe('rgba(0, 0, 0, 0)');
      }
      await page.keyboard.press('Escape');
      await expect(dialog).toHaveCount(0);
    }
  });
}

test('TL13: dados variáveis alteram a seta, não são valores fixos do protótipo', async ({ page }) => {
  await openDashboard(page, 1440, 'received=210000');
  await expect(indicator(page, 'Receita mensal (Creche)')).toContainText('105% ▲');
});

test('TL13: falha preserva formulário e não anuncia persistência; envios não duplicam', async ({ page }) => {
  await openDashboard(page, 1440, 'failure&delay');
  await page.getByRole('button', { name: 'Editar meta', exact: true }).click();
  const dialog = page.getByRole('dialog');
  await dialog.getByLabel('Mês cadastrado', { exact: true }).selectOption('2026-10');
  await dialog.getByLabel('Serviço', { exact: true }).selectOption('Creche');
  await dialog.getByLabel('Valor', { exact: true }).fill('1800');
  const save = dialog.getByRole('button', { name: 'Salvar alterações', exact: true });
  await save.evaluate(node => { (node as HTMLButtonElement).click(); (node as HTMLButtonElement).click(); });
  await expect(page.getByRole('alert')).toContainText('Falha de teste na gravação.');
  await expect(dialog).toBeVisible();
  await expect(dialog.getByLabel('Valor', { exact: true })).toHaveValue(/1\.800,00|1800/);
  await expect(indicator(page, 'Receita mensal (Creche)')).toContainText('90% ▼');
  expect(await calls(page)).toHaveLength(1);
});

test('TL13: exibe somente as três movimentações mais recentes sem reduzir os dados dos cálculos', async ({ page }) => {
  await openDashboard(page, 1440, 'many');
  await expect(page.locator('[data-design-name="Movimentação"]')).toHaveCount(3);
  await expect(indicator(page, 'Receita mensal (Creche)')).toContainText(/1\.825,00/);
  const dates = await page.locator('[data-design-name="Movimentação"] > :first-child').allTextContents();
  const isoDates = dates.map(date => date.split('/').reverse().join('-'));
  expect(isoDates).toEqual([...isoDates].sort().reverse());
});

test('TL13: ausência e falha de dados não retornam aos números do wireframe', async ({ page }) => {
  await openDashboard(page, 1440, 'empty');
  await expect(indicator(page, 'Contratos ativos').locator('[data-design-name="Valor"]')).toHaveText('0');
  await expect(page.getByText('Nenhuma movimentação registrada.', { exact: true })).toBeVisible();
  await expect(page.locator('.dashboard-donut-total')).toHaveText('0 pets');
  await page.goto('/tests/fixtures/dashboard-flow.html?loadFailure');
  await expect(page.getByRole('alert')).toContainText('Falha de teste no carregamento.');
  await expect(indicator(page, 'Contratos ativos').locator('[data-design-name="Valor"]')).toHaveText('—');
});

test('TL13: pets com vários serviços têm pendência explícita e total não duplicado', async ({ page }) => {
  await openDashboard(page, 1440, 'ambiguous');
  await expect(page.locator('.dashboard-donut-total')).toHaveText('43 pets');
  await expect(page.getByText(/1 pet\(s\) precisam de classificação de serviço/)).toBeVisible();
});
