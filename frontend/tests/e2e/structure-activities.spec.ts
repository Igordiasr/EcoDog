import { test, expect } from '@playwright/test';

const row = { idAtividadeDoDia: null, idAtividade: 7, nome: 'Catálogo confirmado', descricao: 'Descrição do catálogo', categoria: 'Recreação', horaInicio: null, horaFim: null, situacao: null };
const base = 'http://catalog.test';
const openCatalog = async (page: import('@playwright/test').Page, configured = base) => {
  await page.goto(`/tests/fixtures/activity-catalog-flow.html?base=${encodeURIComponent(configured)}`);
  await page.getByRole('button', { name: 'Consultar catálogo de atividades', exact: true }).click();
};

test('consulta pública carrega DTO, informa fotos institucionais e não associa imagens', async ({ page }) => {
  let release!: () => void;
  const pending = new Promise<void>(resolve => { release = resolve; });
  let calls = 0;
  await page.route(`${base}/**`, async route => {
    calls++;
    expect(route.request().method()).toBe('GET');
    expect(route.request().headers().authorization).toBeUndefined();
    expect(route.request().headers().cookie).toBeUndefined();
    await pending;
    await route.fulfill({ json: [row] });
  });
  await openCatalog(page);
  await expect(page.getByRole('status')).toHaveText('Carregando atividades…');
  release();
  const dialog = page.getByRole('dialog');
  await expect(dialog.getByRole('heading', { name: row.nome })).toBeVisible();
  await expect(dialog.getByText(/fotografias da página são institucionais/)).toBeVisible();
  await expect(dialog.getByRole('img')).toHaveCount(0);
  expect(calls).toBe(1);
});

test('vazio válido, erro seguro e retry apenas manual', async ({ page }) => {
  let calls = 0;
  await page.route(`${base}/**`, route => {
    calls++;
    return calls === 1 ? route.fulfill({ status: 403, json: { message: 'SQL privado de outro usuário' } }) : route.fulfill({ json: [] });
  });
  await openCatalog(page);
  await expect(page.getByRole('alert')).toContainText('Acesso negado');
  await expect(page.getByText(/SQL privado/)).toHaveCount(0);
  expect(calls).toBe(1);
  await page.getByRole('button', { name: 'Tentar novamente' }).click();
  await expect(page.getByRole('status')).toHaveText('Nenhuma atividade cadastrada.');
  expect(calls).toBe(2);
});

for (const [label, body, status] of [['programação', [{ ...row, idAtividadeDoDia: 9 }], 200], ['ID inválido', [{ ...row, idAtividade: 0 }], 200], ['DTO inválido', {}, 200], ['204', null, 204]] as const) {
  test(`não transforma ${label} em catálogo vazio`, async ({ page }) => {
    await page.route(`${base}/**`, route => route.fulfill({ status, ...(status === 204 ? {} : { json: body }) }));
    await openCatalog(page);
    await expect(page.getByRole('alert')).toContainText('Resposta inesperada');
    await expect(page.getByText('Nenhuma atividade cadastrada.')).toHaveCount(0);
  });
}

test('offline não exibe exemplos como fallback', async ({ page }) => {
  await page.route(`${base}/**`, route => route.abort('failed'));
  await openCatalog(page);
  await expect(page.getByRole('alert')).toContainText('conexão e a configuração de CORS');
  await expect(page.getByRole('list')).toHaveCount(0);
});

test('sem configuração não consulta; URL inválida mostra erro', async ({ page }) => {
  let calls = 0;
  page.on('request', request => { if (request.url().includes('/calendario/')) calls++; });
  await openCatalog(page, '');
  await expect(page.getByRole('status')).toContainText('Consulta não configurada');
  await page.getByRole('textbox', { name: 'Base da API' }).fill('ftp://catalog.test');
  await expect(page.getByRole('alert')).toContainText('URL da API inválida');
  expect(calls).toBe(0);
});

test('troca de base limpa resultados e descarta consulta atrasada', async ({ page }) => {
  let release!: () => void;
  const pending = new Promise<void>(resolve => { release = resolve; });
  await page.route(`${base}/**`, async route => { await pending; await route.fulfill({ json: [row] }); });
  await page.route('http://catalog-b.test/**', route => route.fulfill({ json: [{ ...row, nome: 'Catálogo B' }] }));
  await openCatalog(page);
  await expect(page.getByRole('status')).toHaveText('Carregando atividades…');
  await page.getByRole('textbox', { name: 'Base da API' }).fill('http://catalog-b.test');
  await expect(page.getByRole('heading', { name: 'Catálogo B' })).toBeVisible();
  release();
  await expect(page.getByRole('heading', { name: row.nome })).toHaveCount(0);
});

test('fechar durante consulta cancela requisição e não publica dados', async ({ page }) => {
  let release!: () => void;
  const pending = new Promise<void>(resolve => { release = resolve; });
  await page.route(`${base}/**`, async route => { await pending; await route.fulfill({ json: [row] }); });
  const cancelled = page.waitForEvent('requestfailed', request => request.url().includes('/catalogo-atividades'));
  await openCatalog(page);
  await expect(page.getByRole('status')).toHaveText('Carregando atividades…');
  await page.getByRole('button', { name: 'Voltar', exact: true }).click();
  await cancelled;
  release();
  await expect(page.getByRole('dialog')).toHaveCount(0);
});

test('prévia informa exemplos e não consulta API', async ({ page }) => {
  const calls: string[] = [];
  page.on('request', request => { if (request.url().includes('/calendario/')) calls.push(request.url()); });
  await page.goto('/prototipo/TL09');
  await expect(page.getByText(/Atividades ilustrativas da prévia DEV/)).toBeVisible();
  await expect(page.getByRole('button', { name: 'Consultar catálogo de atividades' })).toHaveCount(0);
  expect(calls).toEqual([]);
});

for (const width of [1440, 410]) {
  test(`Estrutura mantém atividade, título e foto sincronizados (${width}px)`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto('/prototipo/TL09');
    const section = page.locator(width === 1440 ? '[data-design-id="dxjWO"]' : '[data-design-id="yqTjv"]');
    await expect(section.getByText('Rotina dos nossos Aulunos', { exact: true })).toBeVisible();
    const activities = ['Brincadeira com Bexiga', 'Brincadeira com Bolinha', 'Brincadeira com Boliche'];
    for (let index = 0; index < activities.length; index++) {
      if (index) await section.getByRole('button', { name: 'Próxima atividade', exact: true }).click();
      await expect(section.getByText(`Atividade ${index + 1}`, { exact: true })).toBeVisible();
      await expect(section.getByText(activities[index], { exact: true })).toBeVisible();
      await expect(section.getByText('Brincadeiras', { exact: true })).toBeVisible();
      const image = section.getByRole('img', { name: activities[index], exact: true });
      await expect(image).toBeVisible();
      await expect.poll(() => image.evaluate(node => (node as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
      expect(decodeURIComponent(await image.getAttribute('src') || '')).toContain(index === 2 ? 'Atividade - Brincadeira Boliche.jpeg' : `Atividade - ${activities[index]}.jpeg`);
    }
    await expect(section.getByRole('button', { name: 'Próxima atividade', exact: true })).toBeDisabled();
    for (let index = 1; index >= 0; index--) {
      await section.getByRole('button', { name: 'Atividade anterior', exact: true }).click();
      await expect(section.getByText(`Atividade ${index + 1}`, { exact: true })).toBeVisible();
      await expect(section.getByRole('img', { name: activities[index], exact: true })).toBeVisible();
    }
    await expect(section.getByRole('button', { name: 'Atividade anterior', exact: true })).toBeDisabled();
  });
}
