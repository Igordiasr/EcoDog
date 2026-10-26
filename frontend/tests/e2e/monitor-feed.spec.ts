import { test, expect } from '@playwright/test';

for (const width of [1440, 410]) {
  test(`Feed: rascunhos editáveis, registros salvos protegidos e alinhamento (${width}px)`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto('/prototipo/TL10');
    const records = page.locator('[data-design-name="Registro de alimentação"], [data-design-name="Registro de rotina"]');
    await expect(records).toHaveCount(8);
    for (const record of await records.all()) {
      const select = record.locator('select');
      const protectedExample = (await record.locator('[data-design-name="Status"]').textContent() || '').startsWith('Registro salvo');
      const expected = await select.getAttribute('aria-label') === 'Refeição' ? ['Se alimentou', 'Recusou'] : await select.getAttribute('aria-label') === 'Participação' ? ['Participou', 'Não participou'] : ['Tomou', 'Não tomou'];
      expect(await select.locator('option').allTextContents()).toEqual(['Selecione', ...expected]);
      if (protectedExample) {
        await expect(select).toBeDisabled();
        for (const control of await record.locator('input, textarea').all()) await expect(control).toBeDisabled();
        await expect(record.getByRole('button', { name: 'Salvar', exact: true })).toBeDisabled();
      } else {
        await expect(select).toBeEnabled();
        for (const value of expected) {
          await select.selectOption(value);
          await expect(select).toHaveValue(value);
        }
      }
      const button = record.getByRole('button', { name: 'Salvar', exact: true });
      const selectionBox = await select.boundingBox();
      const buttonBox = await button.boundingBox();
      expect(selectionBox && buttonBox).toBeTruthy();
      expect(Math.abs((selectionBox!.y + selectionBox!.height / 2) - (buttonBox!.y + buttonBox!.height / 2))).toBeLessThan(2);
    }
    const morning = records.filter({ has: page.getByText('Refeição da manhã', { exact: true }) });
    const afternoon = records.filter({ has: page.getByText('Refeição da tarde', { exact: true }) });
    const morningStatus = await morning.locator('[data-design-name="Status"]').textContent();
    const morningNotes = morning.locator('textarea');
    await expect(morningNotes).toBeDisabled();
    const notes = afternoon.locator('textarea');
    await notes.fill('Rascunho');
    await notes.fill('Correção antes de salvar');
    await afternoon.getByRole('button', { name: 'Salvar', exact: true }).click();
    await expect(afternoon.locator('[data-design-name="Status"]')).toContainText('Salvo apenas na prévia (memória) • Recusou');
    await expect(morning.locator('[data-design-name="Status"]')).toHaveText(morningStatus || '');
    await expect(notes).toHaveValue('Correção antes de salvar');
    await expect(notes).toBeDisabled();
    await expect(afternoon.locator('select')).toBeDisabled();
    const save = afternoon.getByRole('button', { name: 'Salvar', exact: true });
    await expect(save).toBeDisabled();
    const message = await page.getByRole('alert').textContent();
    await save.evaluate(button => { (button as HTMLButtonElement).disabled = false; });
    await save.click();
    // React also rejects clicks on a disabled control when its DOM attribute is
    // manually removed. Neither a new save nor a new success message may occur.
    await expect(page.getByRole('alert')).toHaveText(message || '');
    await expect(notes).toHaveValue('Correção antes de salvar');
    await expect(afternoon.locator('[data-design-name="Status"]')).toContainText('Recusou');
    await page.reload();
    await expect(page.locator('[data-design-name="Registro de alimentação"]').nth(1).locator('textarea')).toBeEnabled();
    await expect(page.locator('[data-design-name="Registro de alimentação"]').nth(1).locator('textarea')).toHaveValue('');
  });
}
