import { test, expect, type Page } from '@playwright/test';

const draftKey = 'ecodog:structure-booking:v1';
async function openStructure(page: Page, mobile = false, authenticated = false) {
  await page.setViewportSize({ width: mobile ? 410 : 1440, height: 900 });
  await page.goto(`/tests/fixtures/booking-flow.html${authenticated ? '?authenticated' : ''}`);
  await expect(page).toHaveURL('/estrutura');
  await expect(page.locator('.booking-calendar')).toBeVisible();
}
async function login(page: Page) {
  await page.getByRole('textbox', { name: /E-?mail/i }).fill('tutor@example.com');
  await page.getByLabel('Senha', { exact: true }).fill('senha-de-teste');
  await page.getByRole('button', { name: 'Entrar', exact: true }).click();
  await expect(page).toHaveURL('/tutor/agendamento');
  await expect(page.locator('.scheduling-page')).toBeVisible();
}
async function showCalendar(page: Page, mobile: boolean) {
  if (mobile) await page.getByRole('button', { name: 'Avançar', exact: true }).click();
  await expect(page.locator('.booking-calendar')).toBeVisible();
}

for (const mobile of [false, true]) {
  test(`blocos da Estrutura têm largura uniforme e botão dentro do calendário (${mobile ? 'mobile' : 'desktop'})`, async ({ page }) => {
    await openStructure(page, mobile);
    const wrapper = page.locator('.structure-booking-calendar');
    const services = wrapper.locator('.booking-controls');
    const calendar = wrapper.locator('.booking-calendar');
    const button = calendar.getByRole('button', { name: 'Quero agendar', exact: true });
    await expect(button).toBeVisible();
    const wrapperBox = (await wrapper.boundingBox())!;
    const servicesBox = (await services.boundingBox())!;
    const calendarBox = (await calendar.boundingBox())!;
    expect(servicesBox.width).toBe(wrapperBox.width);
    expect(calendarBox.width).toBe(wrapperBox.width);
    expect(servicesBox.x).toBe(calendarBox.x);
    expect(calendarBox.y - servicesBox.y - servicesBox.height).toBe(24);
    const buttonBox = (await button.boundingBox())!;
    expect(buttonBox.y + buttonBox.height).toBeLessThanOrEqual(calendarBox.y + calendarBox.height);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBe(0);
    await button.click();
    await expect(page).toHaveURL('/entrar');
    await expect(page.getByRole('alert')).toHaveCount(0);
  });
}

test('Estrutura mobile preserva seleções através do login', async ({ page }) => {
  await openStructure(page, true);
  await page.getByRole('button', { name: 'DayUse', exact: true }).click();
  await page.getByRole('button', { name: '14, disponível', exact: true }).click();
  await page.getByRole('button', { name: 'Quero agendar', exact: true }).click();
  await login(page);
  await expect(page.getByRole('button', { name: 'DayUse', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await showCalendar(page, true);
  await expect(page.getByRole('button', { name: '14, selecionado', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: '13, disponível', exact: true })).toBeVisible();
});

for (const service of ['Hotel', 'DayUse']) {
  test(`Estrutura preserva múltiplas datas e serviço ${service} até o login`, async ({ page }) => {
    await openStructure(page);
    await page.getByRole('button', { name: service, exact: true }).click();
    await page.getByRole('button', { name: '14, disponível', exact: true }).click();
    await page.getByRole('button', { name: '15, disponível', exact: true }).click();
    await expect(page.getByText(/R\$/)).toHaveCount(0);
    await page.getByRole('button', { name: 'Quero agendar', exact: true }).click();
    await expect(page).toHaveURL('/entrar');
    expect(await page.evaluate(key => JSON.parse(sessionStorage.getItem(key)!).phase, draftKey)).toBe('login');
    await login(page);
    await expect(page.getByRole('button', { name: service, exact: true })).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByRole('button', { name: '14, selecionado', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: '15, selecionado', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: '13, disponível', exact: true })).toBeVisible();
    await expect.poll(() => page.evaluate(key => sessionStorage.getItem(key), draftKey)).toBeNull();
  });
}

test('Estrutura permite seguir sem datas e não restaura a data padrão após login', async ({ page }) => {
  await openStructure(page);
  await expect(page.locator('.calendar-day[aria-pressed="true"]')).toHaveCount(0);
  await page.getByRole('button', { name: 'Quero agendar', exact: true }).click();
  await expect(page).toHaveURL('/entrar');
  await expect(page.getByRole('alert')).toHaveCount(0);
  await login(page);
  await expect(page.locator('.calendar-day[aria-pressed="true"]')).toHaveCount(0);
  await expect.poll(() => page.evaluate(key => sessionStorage.getItem(key), draftKey)).toBeNull();
  // A weekday selected directly after an empty handoff must allow booking.
  await page.getByRole('button', { name: 'Creche', exact: true }).click();
  await page.getByRole('button', { name: 'Selecionar Terça-feira', exact: true }).click();
  await page.getByRole('button', { name: 'Agendar', exact: true }).click();
  await expect.poll(() => page.evaluate(() => sessionStorage.getItem('fixture:booking-payload'))).not.toBeNull();
  const payload = await page.evaluate(() => JSON.parse(sessionStorage.getItem('fixture:booking-payload')!));
  expect(payload.dates).toEqual(['2026-08-04', '2026-08-11', '2026-08-18', '2026-08-25']);
});

test('Cadastro seguido de Login mantém a seleção feita na Estrutura', async ({ page }) => {
  await openStructure(page);
  await page.getByRole('button', { name: '14, disponível', exact: true }).click();
  await page.getByRole('button', { name: 'Quero agendar', exact: true }).click();
  await page.getByRole('button', { name: 'Não tem login? Cadastre-se', exact: true }).click();
  await expect(page).toHaveURL('/cadastro');
  for (const [label, value] of [['Nome', 'Tutora de teste'], ['E-mail', 'tutor@example.com'], ['Telefone', '11999999999'], ['Endereço', 'Rua de teste, 10'], ['Senha', 'senha-de-teste'], ['Confirmação de senha', 'senha-de-teste']]) {
    await page.getByLabel(label, { exact: true }).fill(value);
  }
  await page.getByRole('button', { name: 'Cadastrar', exact: true }).click();
  await expect(page).toHaveURL('/entrar');
  expect(await page.evaluate(key => JSON.parse(sessionStorage.getItem(key)!).dates, draftKey)).toEqual(['2026-08-14']);
  await login(page);
  await expect(page.getByRole('button', { name: '14, selecionado', exact: true })).toBeVisible();
});

test('Creche mantém frequência e mês entre Estrutura, Login e Agendamento', async ({ page }) => {
  await openStructure(page);
  await page.getByRole('button', { name: 'Creche', exact: true }).click();
  await page.getByRole('button', { name: 'Selecionar Terça-feira', exact: true }).click();
  for (const day of [4, 11, 18, 25]) await expect(page.getByRole('button', { name: `${day}, selecionado`, exact: true })).toBeVisible();
  await page.getByRole('button', { name: '→', exact: true }).click();
  await page.getByRole('button', { name: 'Quero agendar', exact: true }).click();
  await login(page);
  await expect(page.getByRole('button', { name: 'Creche', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('[data-design-name="Navegação do mês"]')).toContainText('Setembro');
  await expect(page.getByRole('button', { name: 'Selecionar Terça-feira', exact: true })).toHaveAttribute('aria-pressed', 'true');
  for (const day of [15, 22, 29]) await expect(page.getByRole('button', { name: `${day}, selecionado`, exact: true })).toBeVisible();
});

for (const mobile of [false, true]) {
  test(`Estrutura aplica disponibilidade, domingos e limite de Creche (${mobile ? 'mobile' : 'desktop'})`, async ({ page }) => {
    await openStructure(page, mobile);
    const unavailable = page.getByRole('button', { name: '1, indisponível', exact: true });
    await expect(unavailable).toBeDisabled();
    await unavailable.dispatchEvent('click');
    await expect(page.locator('.calendar-day[aria-pressed="true"]')).toHaveCount(0);
    await page.getByRole('button', { name: '9, disponível', exact: true }).click();
    await page.getByRole('button', { name: 'DayUse', exact: true }).click();
    await expect(page.getByRole('button', { name: '9, selecionado', exact: true })).toBeEnabled();
    await page.getByRole('button', { name: 'Creche', exact: true }).click();
    await expect(page.getByRole('button', { name: '9, indisponível', exact: true })).toBeDisabled();
    await expect(page.getByRole('button', { name: 'Selecionar Domingo', exact: true })).toBeDisabled();
    for (const name of ['Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado']) await page.getByRole('button', { name: `Selecionar ${name}`, exact: true }).click();
    await expect(page.locator('.calendar-weekday[aria-pressed="true"]')).toHaveCount(6);
    await page.getByRole('button', { name: 'Selecionar Terça-feira', exact: true }).click();
    for (const day of [4, 11, 18, 25]) await expect(page.getByRole('button', { name: `${day}, disponível`, exact: true })).toBeVisible();
    await expect(page.getByText(/R\$/)).toHaveCount(0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBe(0);
  });
}

test('usuário autenticado segue diretamente e cancelamento não reaplica o fluxo anterior', async ({ page }) => {
  await openStructure(page, true, true);
  await page.getByRole('button', { name: '14, disponível', exact: true }).click();
  await page.getByRole('button', { name: 'Quero agendar', exact: true }).click();
  await expect(page).toHaveURL('/tutor/agendamento');
  await showCalendar(page, true);
  await expect(page.getByRole('button', { name: '14, selecionado', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Cancelar', exact: true }).click();
  await expect(page).toHaveURL('/tutor/pets');
  expect(await page.evaluate(key => sessionStorage.getItem(key), draftKey)).toBeNull();
  await page.getByRole('button', { name: 'Agendar', exact: true }).click();
  await showCalendar(page, true);
  await expect(page.getByRole('button', { name: '14, disponível', exact: true })).toBeVisible();
});
