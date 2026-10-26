import { test, expect } from '@playwright/test';

for (const [service, subtotal, total] of [['Hotel', '120', '360'], ['DayUse', '90', '270'], ['Creche', '360', '1.080']]) {
  test(`${service} mostra subtotal por pet e recalcula a seleção atual`, async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/prototipo/TL03');
    await page.getByRole('button', { name: service, exact: true }).click();
    const card = page.locator('[data-design-id="IjVwX"]');
    await expect(card.locator('[data-booking-pet-count]')).toHaveText('3');
    await expect(card.locator('[data-booking-subtotal]')).toContainText(`R$ ${subtotal},00`);
    await expect(card.locator('[data-booking-total]')).toContainText(`R$ ${total},00`);
    await page.getByRole('button', { name: 'Todos os pets', exact: true }).click();
    await expect(card.locator('[data-booking-pet-count]')).toHaveText('0');
    await expect(card.locator('[data-booking-total]')).toContainText('R$ 0,00');
    await page.getByRole('button', { name: 'Thor', exact: true }).click();
    await expect(card.locator('[data-booking-pet-count]')).toHaveText('1');
    await expect(card.locator('[data-booking-total]')).toContainText(`R$ ${subtotal},00`);
    await page.getByRole('button', { name: 'Todos os pets', exact: true }).click();
    await expect(card.locator('[data-booking-total]')).toContainText(`R$ ${total},00`);
  });
}

test('datas, pets e frequência atualizam valores sem manter cobranças removidas', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/prototipo/TL03');
  const card = page.locator('[data-design-id="IjVwX"]');
  const total = card.locator('[data-booking-total]');
  await page.getByRole('button', { name: '14, disponível', exact: true }).click();
  await expect(total).toContainText('R$ 720,00');
  await page.getByRole('button', { name: 'Mel', exact: true }).click();
  await expect(total).toContainText('R$ 480,00');
  await card.getByRole('button', { name: 'Remover 2026-08-14 do carrinho', exact: true }).click();
  await expect(total).toContainText('R$ 240,00');
  await page.getByRole('button', { name: 'Creche', exact: true }).click();
  await expect(total).toContainText('R$ 720,00');
  await page.getByRole('button', { name: 'Selecionar Terça-feira', exact: true }).click();
  await expect(total).toContainText('R$ 1.260,00');
  await page.getByRole('button', { name: 'Todos os pets', exact: true }).click();
  await expect(total).toContainText('R$ 1.890,00');
  await page.getByRole('button', { name: 'Selecionar Terça-feira', exact: true }).click();
  await expect(total).toContainText('R$ 1.080,00');
});

test('datas maiores ficam lado a lado e rolam dentro do card', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/prototipo/TL03');
  await page.getByRole('button', { name: '14, disponível', exact: true }).click();
  await page.getByRole('button', { name: '15, disponível', exact: true }).click();
  await page.getByRole('button', { name: '16, disponível', exact: true }).click();
  await page.getByRole('button', { name: '17, disponível', exact: true }).click();
  for (const day of [18, 19, 20, 21, 22, 23]) await page.getByRole('button', { name: `${day}, disponível`, exact: true }).click();
  const card = page.locator('[data-design-id="IjVwX"]');
  const list = card.getByRole('region', { name: 'Datas do agendamento', exact: true });
  await expect(list).toHaveCSS('overflow-x', 'auto');
  await expect(list).toHaveCSS('overflow-y', 'hidden');
  const rows = list.locator('.booking-date');
  const first = (await rows.nth(0).boundingBox())!;
  const second = (await rows.nth(1).boundingBox())!;
  expect(first.y).toBe(second.y);
  await expect(list).toHaveCSS('gap', '12px');
  expect(second.x).toBeGreaterThan(first.x + first.width);
  await expect(list).toHaveCSS('font-size', '20px');
  expect(await list.evaluate(element => element.scrollWidth > element.clientWidth)).toBe(true);
  await list.scrollIntoViewIfNeeded();
  const scrollY = await page.evaluate(() => window.scrollY);
  await list.focus();
  await list.press('End');
  expect(await list.evaluate(element => element.scrollLeft)).toBeGreaterThan(0);
  expect(await page.evaluate(() => window.scrollY)).toBe(scrollY);
  await expect(rows.last().getByRole('button')).toBeInViewport();
});
