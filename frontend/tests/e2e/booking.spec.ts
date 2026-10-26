import { test, expect } from '@playwright/test';

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
