import { test, expect } from '@playwright/test';

for (const width of [1440, 410]) {
  test(`institucional: footer mobile, foto Sobre e calendário atual (${width}px)`, async ({ page }) => {
    await page.clock.setFixedTime(new Date(2027, 0, 10, 12));
    await page.setViewportSize({ width, height: 1000 });
    for (const route of ['TL01', 'TL08', 'TL09']) {
      await page.goto(`/prototipo/${route}`);
      await page.locator('.institutional-page [data-footer-text]').first().waitFor({ state: 'attached' });
      expect(await page.locator('.institutional-page [data-footer-text]').evaluateAll(nodes => nodes.every(node => getComputedStyle(node).display === 'none'))).toBe(width === 410);
    }
    await expect(page.locator('.booking-calendar [data-design-name="Mês"]')).toHaveText('Janeiro de 2027');
    const activity = page.getByRole('img', { name: 'Brincadeira com Bexiga', exact: true });
    await expect(activity).toHaveCSS('object-fit', 'contain');
    const box = (await activity.boundingBox())!;
    expect(box.height).toBe(width === 1440 ? 330 : 300);
    if (width === 1440) expect(box.width).toBe(480);
    await page.goto('/prototipo/TL08');
    await expect(page.locator(width === 1440 ? '[data-design-id="Nqmkv"]' : '[data-design-id="QDETf"]')).toHaveCSS('background-size', 'cover');
  });

  test(`diário e check-in: alinhamento, SVG e acesso ao feed (${width}px)`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto('/prototipo/TL07');
    const back = page.locator('.diary-actions').getByRole('button', { name: 'Voltar', exact: true });
    const book = page.locator('.diary-actions').getByRole('button', { name: 'Agendar', exact: true });
    await expect(book).toBeVisible();
    const a = (await back.boundingBox())!, b = (await book.boundingBox())!;
    expect(Math.abs(a.y + a.height / 2 - b.y - b.height / 2)).toBeLessThan(2);
    const icon = page.locator('[data-design-name="Registro de refeição"] img');
    const svg = await (await page.request.get(await icon.getAttribute('src') || '')).text();
    expect(svg).toContain('viewBox="-1.5 -1.5 21 23"');
    await page.goto('/prototipo/TL11');
    await expect(page.getByRole('button', { name: 'Feed do Monitor', exact: true })).toHaveCount(4);
    await page.getByRole('button', { name: 'Feed do Monitor', exact: true }).first().click();
    await expect(page).toHaveURL('/prototipo/TL10');
    await expect(page.getByText(/Contexto recebido: Thor/)).toBeVisible();
  });

  test(`pet: catálogo, convênio, validade e alergias múltiplas (${width}px)`, async ({ page }) => {
    await page.clock.setFixedTime(new Date(2027, 0, 10, 12));
    await page.setViewportSize({ width, height: 1000 });
    await page.goto('/tests/fixtures/pet-catalog-flow.html');
    await expect(page.getByLabel('Convênio', { exact: true })).toBeVisible();
    await page.getByLabel('Convênio', { exact: true }).fill('Plano de exemplo');
    if (width === 410) {
      await page.getByLabel('Nome', { exact: true }).fill('Bob');
      await page.getByLabel('Nascimento', { exact: true }).fill('01012020');
      await page.getByLabel('Raça', { exact: true }).fill('SRD');
      await page.getByRole('button', { name: 'Avançar', exact: true }).click();
      await page.getByRole('button', { name: 'Avançar', exact: true }).click();
    }
    const vaccine = page.getByRole('combobox', { name: 'Vacina', exact: true }).first();
    await vaccine.selectOption('__add__');
    const dialog = page.getByRole('dialog', { name: 'Adicionar vacina' });
    await dialog.getByLabel('Nome do item').fill('V10');
    await dialog.getByRole('button', { name: 'Salvar item' }).click();
    await expect(dialog.getByText('Este item já está cadastrado.', { exact: true })).toBeVisible();
    await dialog.getByLabel('Nome do item').fill('Vacina nova');
    await dialog.getByRole('button', { name: 'Salvar item' }).click();
    await expect(dialog).toHaveCount(0);
    await expect(vaccine).toHaveValue('Vacina nova');
    await page.getByLabel('Data', { exact: true }).first().fill('01012026');
    const validity = page.getByLabel('Validade', { exact: true }).first();
    await validity.pressSequentially('010120285555');
    await expect(validity).toHaveValue('01/01/2028');
    await validity.fill('31022028');
    await expect(validity).toHaveAttribute('aria-invalid', 'true');
    await validity.fill('01012028');
    if (width === 410) await page.getByRole('button', { name: 'Avançar', exact: true }).click();
    const allergies = page.getByRole('combobox', { name: 'Selecionar alergia', exact: true });
    await allergies.selectOption('Alergia a frango');
    await allergies.selectOption('__add__');
    const allergy = page.getByRole('dialog', { name: 'Adicionar alergia' });
    await allergy.getByLabel('Nome do item').fill('Poeira');
    await allergy.getByRole('button', { name: 'Salvar item' }).click();
    await expect(page.getByRole('list', { name: 'Alergias selecionadas' }).locator('li')).toHaveCount(2);
    await page.getByRole('button', { name: 'Remover alergia Poeira' }).click();
    await expect(allergies.locator('option[value="Poeira"]')).toHaveCount(1);
  });

  test(`Meus Pets: dias agendados refletem reservas fornecidas e não duplicam (${width}px)`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto('/tests/fixtures/pet-catalog-flow.html?pets');
    const section = page.locator('.scheduled-pet-days');
    await expect(section.locator('.scheduled-day-card')).toHaveCount(2);
    const first = section.getByRole('group', { name: 'Agendamentos de 05/01/2027', exact: true });
    await expect(first.locator('time')).toHaveText('05/01/2027');
    await expect(first.locator('time')).toHaveAttribute('datetime', '2027-01-05');
    await expect(first).toHaveText('05/01/2027');
    const second = section.getByRole('group', { name: 'Agendamentos de 15/01/2027', exact: true });
    await expect(second).toHaveText('15/01/2027');
    await expect(section.getByText('25/01/2027')).toHaveCount(0);
    await expect(section.locator('button, .scheduled-days-grid, .scheduled-days-navigation')).toHaveCount(0);
    await expect(section.locator('li, p, .scheduled-day-count, .scheduled-day-bookings')).toHaveCount(0);
    await expect(first).toHaveCSS('border-left-width', '1px');
    await expect(first).toHaveCSS('border-radius', '10px');
    await expect(section.locator('.scheduled-days-list')).toHaveCSS('flex-wrap', 'wrap');
    const firstBox = (await first.boundingBox())!, secondBox = (await second.boundingBox())!;
    expect(secondBox.y).toBe(firstBox.y);
    expect(secondBox.x - firstBox.x - firstBox.width).toBe(8);
    await section.locator('.scheduled-days-list').evaluate(node => { (node as HTMLElement).style.width = '140px'; });
    const wrappedFirst = (await first.boundingBox())!, wrappedSecond = (await second.boundingBox())!;
    expect(wrappedSecond.y).toBeGreaterThanOrEqual(wrappedFirst.y + wrappedFirst.height + 8);
    expect(wrappedSecond.x).toBe(wrappedFirst.x);
    const colors = await first.evaluate(node => ({ card: getComputedStyle(node).backgroundColor, section: getComputedStyle(node.closest('.scheduled-pet-days')!.parentElement!).backgroundColor }));
    expect(colors.card).not.toBe(colors.section);
  });
}

test('agendamento desktop mantém resumo abaixo do calendário e alturas alinhadas', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/prototipo/TL03');
  const row = page.locator('[data-design-id="CKErY"]');
  const summary = page.locator('[data-design-id="IjVwX"]');
  await expect(summary).toBeVisible();
  const rowBox = (await row.boundingBox())!, summaryBox = (await summary.boundingBox())!;
  expect(summaryBox.y).toBeGreaterThanOrEqual(rowBox.y + rowBox.height);
  const calendar = (await page.locator('[data-design-id="bwBUh"]').boundingBox())!;
  const pets = (await page.locator('[data-design-id="D87LCS"]').boundingBox())!;
  expect(Math.abs(calendar.height - pets.height)).toBeLessThan(2);
});

test('falha no cadastro de catálogo preserva o popup e não simula persistência', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/tests/fixtures/pet-catalog-flow.html?failure');
  await page.getByRole('combobox', { name: 'Remédio', exact: true }).first().selectOption('__add__');
  const dialog = page.getByRole('dialog', { name: 'Adicionar medicamento' });
  await dialog.getByLabel('Nome do item').fill('Medicamento novo');
  await dialog.getByRole('button', { name: 'Salvar item' }).click();
  await expect(dialog.getByText('Falha de teste ao cadastrar item.', { exact: true })).toBeVisible();
  await expect(dialog.getByLabel('Nome do item')).toHaveValue('Medicamento novo');
});
