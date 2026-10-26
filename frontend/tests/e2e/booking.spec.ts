import { test, expect } from '@playwright/test';
test.beforeEach(async ({ page }) => { await page.clock.setFixedTime(new Date(2026, 7, 1, 12)); });

test('leituras públicas são informativas, não enviam orçamento/reserva e não incluem planos', async ({ page }) => {
  const calls: string[] = [];
  await page.route('http://booking.test/**', route => {
    const request = route.request(); calls.push(request.url());
    expect(request.method()).toBe('GET');
    const url = new URL(request.url());
    if (url.pathname === '/calendario/servicos') return route.fulfill({ json: [
      { id: 91, nome: 'Hotel do servidor', categoria: 'HOTEL', modalidade: 'MODALIDADE_TESTE', frequencia: null, valor: 123.45 },
      { id: 92, nome: 'Plano excluído', categoria: 'HOTEL', modalidade: 'PLANO', frequencia: 'MENSAL', valor: 999 },
    ] });
    expect(url.pathname).toBe('/calendario/disponibilidade');
    expect(url.searchParams.get('ano')).toBe('2026');
    expect(url.searchParams.get('mes')).toBe('8');
    return route.fulfill({ json: [{ data: '2026-08-14', categoriaServico: 'HOTEL', capacidadeTotal: 2, vagasDisponiveis: 1 }] });
  });
  await page.goto('/tests/fixtures/booking-public-flow.html?base=http://booking.test');
  await page.getByRole('button', { name: 'Consultar serviços e disponibilidade' }).click();
  await expect(page.getByText(/Hotel do servidor/)).toBeVisible();
  await expect(page.getByText('Plano excluído')).toHaveCount(0);
  await expect(page.getByText(/1 vagas informadas de 2/)).toBeVisible();
  await expect(page.getByText(/Não constitui garantia de vaga/)).toBeVisible();
  expect(calls).toHaveLength(2);
});

test('falha pública mostra desconhecido sem preços/pets locais como fallback', async ({ page }) => {
  await page.route('http://booking.test/**', route => route.fulfill({ status: 409, json: { message: 'SQL privado' } }));
  await page.goto('/tests/fixtures/booking-public-flow.html?base=http://booking.test');
  await page.getByRole('button', { name: 'Consultar serviços e disponibilidade' }).click();
  await expect(page.getByRole('alert')).toContainText('Disponibilidade desconhecida');
  await expect(page.getByText(/SQL privado|Thor|Mel|Luke/)).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Atualizar consulta pública' })).toBeVisible();
});

test('agenda autorizada de leitura exibe dias sem fabricar alvo para cancelamento', async ({ page }) => {
  await page.goto('/tests/fixtures/booking-public-flow.html?agenda');
  await expect(page.getByRole('group', { name: 'Agendamentos de 14/08/2026', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: /cancelar/i })).toHaveCount(0);
  await expect(page.getByText(/Cancelamento indisponível/)).toBeVisible();
});

test('troca de mês cancela consulta anterior e não apresenta contagem atrasada', async ({ page }) => {
  let release!: () => void;
  const pending = new Promise<void>(resolve => { release = resolve; });
  await page.route('http://booking.test/**', async route => {
    const url = new URL(route.request().url());
    if (url.pathname.endsWith('/servicos')) return route.fulfill({ json: [] });
    const month = url.searchParams.get('mes');
    if (month === '8') await pending;
    return route.fulfill({ json: [{ data: month === '8' ? '2026-08-14' : '2026-09-14', categoriaServico: 'HOTEL', capacidadeTotal: 3, vagasDisponiveis: month === '8' ? 3 : 1 }] });
  });
  await page.goto('/tests/fixtures/booking-public-flow.html?base=http://booking.test');
  await page.getByRole('button', { name: 'Consultar serviços e disponibilidade' }).click();
  await expect(page.getByRole('status')).toContainText('Consultando serviços');
  await page.getByLabel('Mês', { exact: true }).fill('2026-09');
  await expect(page.getByText(/14\/09\/2026: 1 vagas informadas/)).toBeVisible();
  release();
  await expect(page.getByText(/14\/08\/2026/)).toHaveCount(0);
});

test('prévia de agendamento não acessa fontes públicas reais', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  const calls: string[] = [];
  page.on('request', request => { if (request.url().includes('/calendario/')) calls.push(request.url()); });
  await page.goto('/prototipo/TL03');
  await expect(page.getByRole('button', { name: 'Consultar serviços e disponibilidade' })).toHaveCount(0);
  await page.getByRole('button', { name: 'Agendar', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('Nenhuma reserva foi criada');
  expect(calls).toEqual([]);
});

for (const service of ['Hotel', 'DayUse']) {
  test(`${service} mantém múltiplas datas e sincroniza os preços do carrinho`, async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/prototipo/TL03');
    await page.getByRole('button', { name: service, exact: true }).click();
    await page.getByRole('button', { name: '14, disponível', exact: true }).click();
    await page.getByRole('button', { name: '15, disponível', exact: true }).click();
    await expect(page.locator('.calendar-day[aria-pressed="true"]')).toHaveCount(3);
    const summary = page.locator('[data-design-id="IjVwX"]');
    await expect(summary.locator('[data-design-name="Montante"]')).toContainText(service === 'Hotel' ? 'R$ 1.080,00' : 'R$ 810,00');
    await expect(summary.locator('.booking-date-label')).toHaveCount(3);
    await summary.getByRole('button', { name: 'Remover 2026-08-14 do carrinho', exact: true }).click();
    await expect(page.locator('.calendar-day[aria-pressed="true"]')).toHaveCount(2);
    await expect(summary.locator('[data-design-name="Montante"]')).toContainText(service === 'Hotel' ? 'R$ 720,00' : 'R$ 540,00');
    await page.getByRole('button', { name: '1, indisponível', exact: true }).dispatchEvent('click');
    await expect(page.locator('.calendar-day[aria-pressed="true"]')).toHaveCount(2);
    await page.getByRole('button', { name: service === 'Hotel' ? 'DayUse' : 'Hotel', exact: true }).click();
    await expect(page.locator('.calendar-day[aria-pressed="true"]')).toHaveCount(2);
    await expect(page.getByRole('button', { name: '15, selecionado', exact: true })).toBeVisible();
    await page.getByRole('button', { name: '16, disponível', exact: true }).click();
    await expect(page.locator('.calendar-day[aria-pressed="true"]')).toHaveCount(3);
    await expect(page.getByRole('button', { name: '16, selecionado', exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'Hotel', exact: true }).click();
    await page.getByRole('button', { name: '18, disponível', exact: true }).click();
    await expect(summary.locator('.booking-date-label')).toHaveText(['13 de agosto', '15 de agosto', '16 de agosto', '18 de agosto']);
    await expect(summary.locator('[data-design-name="Montante"]')).toContainText('R$ 1.440,00');
    await summary.getByRole('button', { name: 'Remover 2026-08-15 do carrinho', exact: true }).click();
    await expect(summary.locator('.booking-date-label')).toHaveCount(3);
    await expect(summary.locator('[data-design-name="Montante"]')).toContainText('R$ 1.080,00');
    await expect(page.getByRole('button', { name: '15, disponível', exact: true })).toBeVisible();
  });
}

test('mobile impede avançar sem data e mantém múltiplos dias na revisão', async ({ page }) => {
  await page.setViewportSize({ width: 410, height: 900 });
  await page.goto('/prototipo/TL03');
  await page.getByRole('button', { name: 'Avançar', exact: true }).click();
  await page.getByRole('button', { name: '13, selecionado', exact: true }).click();
  await page.getByRole('button', { name: 'Avançar', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('Selecione uma data disponível');
  await expect(page.locator('[data-design-name="Calendário de agosto"]')).toBeVisible();
  await page.getByRole('button', { name: '14, disponível', exact: true }).click();
  await page.getByRole('button', { name: '15, disponível', exact: true }).click();
  await page.getByRole('button', { name: 'Avançar', exact: true }).click();
  await page.getByRole('button', { name: 'Avançar', exact: true }).click();
  await expect(page.locator('[data-design-name="Card · Revisão final"]')).toContainText('14 de agosto · 15 de agosto');
});

test('muitas datas rolam somente dentro da área de datas sem ampliar o card', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/prototipo/TL03');
  const card = page.locator('[data-design-id="IjVwX"]');
  await expect(card).toBeVisible();
  await page.evaluate(() => document.fonts.ready);
  const initial = (await card.boundingBox())!;
  for (const day of [4, 7, 9, 10, 11, 12, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31]) {
    await page.getByRole('button', { name: `${day}, disponível`, exact: true }).click();
  }
  const box = (await card.boundingBox())!;
  expect(box.width).toBe(initial.width);
  expect(box.height).toBe(initial.height);
  const dates = card.getByRole('region', { name: 'Datas do agendamento', exact: true });
  await expect(dates).toHaveCSS('overflow-x', 'auto');
  await expect(dates).toHaveCSS('overflow-y', 'hidden');
  await expect(card).toHaveCSS('overflow', 'hidden');
  expect(await dates.evaluate(element => element.scrollWidth > element.clientWidth)).toBe(true);
  const dateBox = (await dates.boundingBox())!;
  expect(dateBox.x + dateBox.width).toBeLessThanOrEqual(box.x + box.width);
  expect(dateBox.y + dateBox.height).toBeLessThanOrEqual(box.y + box.height);
  await dates.scrollIntoViewIfNeeded();
  const pageScroll = await page.evaluate(() => scrollY);
  await dates.focus();
  await dates.press('End');
  await expect.poll(() => dates.evaluate(element => element.scrollLeft)).toBeGreaterThan(0);
  expect(await page.evaluate(() => scrollY)).toBe(pageScroll);
  await expect(dates.getByText('31 de agosto', { exact: true })).toBeInViewport();
  await expect(card.locator('[data-design-name="Montante"]')).toContainText('R$ 9.000,00');
  await expect(card.getByRole('button', { name: 'Agendar', exact: true })).toBeVisible();
});
