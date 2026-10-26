import { test, expect, type Locator } from '@playwright/test';

async function paste(field: Locator, text: string) {
  await field.evaluate((input, text) => {
    const element = input as HTMLInputElement;
    element.focus();
    element.setSelectionRange(0, element.value.length);
    const clipboardData = new DataTransfer();
    clipboardData.setData('text', text);
    element.dispatchEvent(new ClipboardEvent('paste', { clipboardData, bubbles: true, cancelable: true }));
  }, text);
}

test('desktop: bounded dates, phones, allergies and independent removable records', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/prototipo/TL06');
  const birth = page.getByRole('textbox', { name: 'Nascimento', exact: true });
  await birth.pressSequentially('010120205555');
  await expect(birth).toHaveValue('01/01/2020');
  await paste(birth, '20255-02-01');
  await expect(birth).toHaveValue('01/02/2025');
  await birth.fill('31022024');
  await expect(birth).toHaveAttribute('aria-invalid', 'true');
  await birth.fill('01012020');
  await expect(birth).toHaveAttribute('aria-invalid', 'false');
  const contact = page.getByRole('textbox', { name: 'Contato', exact: true });
  await paste(contact, '(11) 99999-88887777');
  await expect(contact).toHaveValue('(11) 99999-8888');
  await page.getByRole('radio', { name: 'M', exact: true }).check();
  await page.getByRole('radio', { name: 'F', exact: true }).check();
  await expect(page.getByRole('radio', { name: 'F', exact: true })).toBeChecked();
  await page.getByRole('radio', { name: 'Sim', exact: true }).check();
  await page.getByRole('radio', { name: 'Não', exact: true }).check();
  await expect(page.getByRole('radio', { name: 'Não', exact: true })).toBeChecked();

  const vaccinePanel = page.locator('[data-design-id="rGbzh"]');
  await vaccinePanel.getByRole('combobox', { name: 'Vacina', exact: true }).selectOption('V10');
  await vaccinePanel.getByRole('button', { name: 'Adicionar', exact: true }).click();
  const dates = vaccinePanel.getByRole('textbox', { name: 'Data', exact: true });
  await expect(dates).toHaveCount(2);
  for (const date of await dates.all()) {
    await date.pressSequentially('290220245555');
    await expect(date).toHaveValue('29/02/2024');
    await paste(date, '01/03/20245555');
    await expect(date).toHaveValue('01/03/2024');
  }
  await vaccinePanel.getByRole('combobox', { name: 'Vacina', exact: true }).nth(1).selectOption('Antirrábica');
  await vaccinePanel.getByRole('button', { name: 'Remover vacina' }).nth(0).click();
  await expect(vaccinePanel.getByRole('combobox', { name: 'Vacina', exact: true })).toHaveValue('Antirrábica');

  const medicinePanel = page.locator('[data-design-id="mGsMd"]');
  await medicinePanel.getByRole('combobox', { name: 'Remédio', exact: true }).selectOption('Medicação 1');
  await medicinePanel.getByRole('button', { name: 'Adicionar', exact: true }).click();
  await medicinePanel.getByRole('combobox', { name: 'Remédio', exact: true }).nth(1).selectOption('Medicação 2');
  await medicinePanel.getByRole('button', { name: 'Remover remédio' }).nth(0).click();
  await expect(medicinePanel.getByRole('combobox', { name: 'Remédio', exact: true })).toHaveValue('Medicação 2');

  await page.getByRole('combobox', { name: 'Selecionar alergia', exact: true }).selectOption('Alergia a frango');
  await page.getByRole('combobox', { name: 'Selecionar alergia', exact: true }).selectOption('__add__');
  const catalog = page.getByRole('dialog', { name: 'Adicionar alergia' });
  await catalog.getByRole('button', { name: 'Salvar item' }).click();
  await expect(catalog.getByText('Informe um nome válido.', { exact: true })).toBeVisible();
  await catalog.getByRole('textbox', { name: 'Nome do item' }).fill('Poeira');
  await catalog.getByRole('button', { name: 'Salvar item' }).click();
  await expect(page.getByRole('list', { name: 'Alergias selecionadas' }).getByText('Poeira', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Remover alergia Poeira' }).click();
  await expect(page.getByRole('list', { name: 'Alergias selecionadas' }).getByText('Alergia a frango', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Salvar', exact: true }).click();
  await expect(page.getByRole('textbox', { name: 'Nome', exact: true })).toHaveAttribute('aria-invalid', 'true');
  await expect(medicinePanel.getByRole('textbox', { name: 'Dosagem', exact: true })).toHaveAttribute('aria-invalid', 'true');
});

test('mobile: all date fields and added vaccine dates use the same bounded mask', async ({ page }) => {
  await page.setViewportSize({ width: 410, height: 900 });
  await page.goto('/prototipo/TL06');
  await page.getByRole('textbox', { name: 'Nome', exact: true }).fill('Bob');
  const birth = page.getByRole('textbox', { name: 'Nascimento', exact: true });
  await paste(birth, '010120205555');
  await expect(birth).toHaveValue('01/01/2020');
  await page.getByRole('textbox', { name: 'Raça', exact: true }).fill('SRD');
  await page.getByRole('button', { name: 'Avançar', exact: true }).click();
  await page.getByRole('button', { name: 'Avançar', exact: true }).click();
  await page.getByRole('button', { name: '+ Adicionar', exact: true }).click();
  const dates = page.getByRole('textbox', { name: 'Data', exact: true });
  await expect(dates).toHaveCount(2);
  for (const date of await dates.all()) {
    await date.pressSequentially('010120205555');
    await expect(date).toHaveValue('01/01/2020');
    await paste(date, '202455-02-29');
    await expect(date).toHaveValue('29/02/2024');
  }
});

test('validation blocks invalid submissions and preserves corrected values without claiming server success', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/prototipo/TL06');
  const name = page.getByRole('textbox', { name: 'Nome', exact: true });
  await name.fill('123');
  await expect(name).toHaveAttribute('aria-invalid', 'true');
  await name.fill('Bob');
  await expect(name).toHaveAttribute('aria-invalid', 'false');
  const birth = page.getByRole('textbox', { name: 'Nascimento', exact: true });
  await birth.fill('01012099');
  await expect(birth).toHaveAttribute('aria-invalid', 'true');
  await birth.fill('01012020');
  await page.getByRole('textbox', { name: 'Raça', exact: true }).fill('SRD');
  await page.getByRole('combobox', { name: 'Selecionar alergia', exact: true }).selectOption('__add__');
  const catalog = page.getByRole('dialog', { name: 'Adicionar alergia' });
  await catalog.getByRole('textbox', { name: 'Nome do item' }).fill('   ');
  await catalog.getByRole('button', { name: 'Salvar item' }).click();
  await expect(catalog.getByText('Informe um nome válido.', { exact: true })).toBeVisible();
  await catalog.getByRole('button', { name: 'Cancelar', exact: true }).click();
  await expect(name).toHaveValue('Bob');
  await expect(birth).toHaveValue('01/01/2020');
  await page.getByRole('button', { name: 'Salvar', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('integração com o sistema ainda não está disponível');
  await page.locator('input[type="file"]').setInputFiles({ name: 'invalid.txt', mimeType: 'text/plain', buffer: Buffer.from('not a photo') });
  await expect(page.getByRole('alert')).toContainText('JPG, PNG ou WebP');
});
