import { test, expect } from '@playwright/test';
import { screens } from '../../src/screens/catalog';

for (const width of [1440, 1024, 410, 320]) {
  test(`TL01–TL17 sem erro e sem overflow horizontal (${width}px)`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    for (const screen of screens) {
      await page.goto(`/prototipo/${screen.id}`);
      await expect(page.locator('[data-design-id]').first()).toBeVisible();
      await page.evaluate(() => document.fonts.ready);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      expect(overflow, `${screen.id} em ${width}px`).toBeLessThanOrEqual(1);
      expect(errors, screen.id).toEqual([]);
      await expect(page.getByRole('button', { name: 'Abrir menu', exact: true }).first()).toBeVisible();
    }
  });
}

test('menu público navega entre os frames', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Abrir menu', exact: true }).click();
  await page.getByRole('navigation').getByRole('button', { name: /Sobre/ }).click();
  await expect(page).toHaveURL('/sobre');
  await expect(page.locator('[data-design-id]').first()).toBeVisible();
});

test('restrições não podem ser contornadas sem autenticação', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/admin/planos');
  await expect(page).toHaveURL('/entrar');
  await expect(page.getByRole('textbox', { name: 'E-mail', exact: true })).toBeVisible();
});

test('login valida campos e informa ausência de integração', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/entrar');
  await page.getByRole('textbox', { name: 'E-mail', exact: true }).fill('email@email.com');
  await page.getByLabel('Senha', { exact: true }).fill('senha');
  await page.getByRole('button', { name: 'Entrar', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('integração');
  await expect(page).toHaveURL('/entrar');
});

for (const width of [410, 1440]) {
  test(`entrar usa pets na descrição e preserva o enquadramento (${width}px)`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/entrar');
    await expect(page.getByText('Use seu e-mail e senha para acessar sua conta e acompanhar seus pets.', { exact: true })).toBeVisible();
    await expect(page.getByText('Bem-vindo de volta, aumigo!', { exact: true })).toBeVisible();
    await expect(page.getByText('Use seu e-mail e senha para acessar sua conta e acompanhar seus aumigos.', { exact: true })).toHaveCount(0);
    if (width === 1440) {
      const photo = page.locator('[class*="image-import-25.jpg"]');
      await expect(photo).toHaveCSS('translate', 'none');
      const viewport = page.locator('[data-design-name="painel-imagem"]');
      await expect(viewport).toHaveCSS('height', '560px');
      await expect(viewport).toHaveCSS('overflow', 'hidden');
      await expect(viewport).toHaveCSS('border-top-width', '0px');
      await expect(viewport.locator(':scope > div')).toHaveCSS('height', '660px');
      await expect(viewport.locator(':scope > div')).toHaveCSS('top', '-100px');
      await expect(page.locator('[data-design-name="painel-formulario"]')).toHaveCSS('min-height', '560px');
      await expect(photo).toHaveCSS('transform', 'none');
      const imageBox = (await photo.boundingBox())!;
      expect(imageBox.width / imageBox.height).toBe(3 / 4);
      const clipping = await photo.evaluate(element => {
        const container = element.parentElement!;
        const image = element.getBoundingClientRect();
        const frame = container.getBoundingClientRect();
        return getComputedStyle(container).overflow === 'hidden' && image.top <= frame.top && image.bottom >= frame.bottom;
      });
      expect(clipping).toBe(true);
      expect(await viewport.evaluate(element => {
        const frame = element.getBoundingClientRect();
        const crop = element.firstElementChild!.getBoundingClientRect();
        const photo = element.querySelector('[class*="image-import-25.jpg"]')!.getBoundingClientRect();
        return crop.left <= frame.left && crop.right >= frame.right && crop.top <= frame.top && crop.bottom >= frame.bottom
          && photo.left <= frame.left && photo.right >= frame.right && photo.top <= frame.top && photo.bottom >= frame.bottom;
      })).toBe(true);
    }
  });
}

for (const height of [720, 768, 900]) {
  test(`entrar elimina espaço vazio e cabe na janela (${height}px)`, async ({ page }) => {
    await page.setViewportSize({ width: 1440, height });
    await page.goto('/entrar');
    const card = page.locator('[data-design-id="EIxQ6"]');
    await expect(card).toBeVisible();
    await page.evaluate(() => document.fonts.ready);
    const bounds = (await card.boundingBox())!;
    const image = (await page.locator('[data-design-name="painel-imagem"]').boundingBox())!;
    expect(image.height).toBe(560);
    expect(bounds.height).toBe(image.height);
    expect(bounds.y).toBe(112);
    expect(bounds.y + bounds.height).toBeLessThanOrEqual(height);
    expect(await page.evaluate(() => document.documentElement.scrollHeight)).toBe(height);
    await expect(page.getByRole('button', { name: 'Entrar', exact: true })).toBeInViewport();
    await expect(page.getByRole('button', { name: 'Não tem login? Cadastre-se', exact: true })).toBeInViewport();
  });
}

test('modal de plano contém foco e fecha por Escape', async ({ page }) => {
  await page.goto('/prototipo/TL17');
  await page.getByRole('button', { name: 'Criar Plano', exact: true }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.getByRole('dialog').getByLabel('Nome do plano', { exact: true })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await expect(page.getByRole('button', { name: 'Criar Plano', exact: true })).toBeFocused();
});

test('cadastro desktop contém os seis campos documentados', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/cadastro');
  for (const name of ['Nome', 'E-mail', 'Telefone', 'Endereço', 'Senha', 'Confirmação de senha']) {
    await expect(page.getByLabel(name, { exact: true })).toBeVisible();
  }
});

test('agendamento permite mudar serviço, data e seleção de pets', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/prototipo/TL03');
  await page.getByRole('button', { name: 'Creche', exact: true }).click();
  await expect(page.getByRole('button', { name: /Creche/, pressed: true })).toBeVisible();
  await page.getByRole('button', { name: '14, disponível', exact: true }).click();
  await expect(page.getByRole('button', { name: '14, selecionado', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Todos os pets' }).click();
  await expect(page.getByRole('button', { name: 'Todos os pets' })).toHaveAttribute('aria-pressed', 'false');
});

test('agendamento mobile preserva serviço, data e pets até a revisão', async ({ page }) => {
  await page.setViewportSize({ width: 410, height: 900 });
  await page.goto('/prototipo/TL03');
  await page.getByRole('button', { name: 'Creche', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Creche', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: 'Avançar', exact: true }).click();
  await page.getByRole('button', { name: '14, disponível', exact: true }).click();
  await page.getByRole('button', { name: 'Avançar', exact: true }).click();
  await page.getByRole('button', { name: 'Mel', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Mel', exact: true })).toHaveAttribute('aria-pressed', 'false');
  await page.getByRole('button', { name: 'Avançar', exact: true }).click();
  const review = page.locator('[data-design-name="Card · Revisão final"]');
  await expect(review).toContainText('Creche');
  await expect(review).toContainText('14 de agosto');
  await expect(review).toContainText('Thor · Luke');
  await expect(review).not.toContainText('Thor · Mel · Luke');
});

test('pets desktop podem ser desmarcados e selecionados novamente', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/prototipo/TL03');
  const thor = page.getByRole('button', { name: 'Thor', exact: true });
  await thor.click();
  await expect(thor).toHaveAttribute('aria-pressed', 'false');
  await thor.click();
  await expect(thor).toHaveAttribute('aria-pressed', 'true');
});

test('catálogo de alergias preserva cancelamento e exige nome para novo item', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/prototipo/TL06');
  await page.getByRole('button', { name: 'Adicionar alergia', exact: true }).click();
  let dialog = page.getByRole('dialog');
  await dialog.getByLabel('Nome do item', { exact: true }).fill('Alergia a corante alimentício');
  await dialog.getByRole('button', { name: 'Cancelar', exact: true }).click();
  await page.getByRole('button', { name: 'Adicionar alergia', exact: true }).click();
  dialog = page.getByRole('dialog');
  await expect(dialog.getByLabel('Nome do item', { exact: true })).toHaveValue('');
  await dialog.getByRole('button', { name: 'Salvar item', exact: true }).click();
  await expect(dialog.getByLabel('Nome do item', { exact: true })).toHaveAttribute('aria-invalid', 'true');
  await dialog.getByLabel('Nome do item', { exact: true }).fill('Alergia a corante alimentício');
  await dialog.getByRole('button', { name: 'Salvar item', exact: true }).click();
  await expect(page.getByRole('list', { name: 'Alergias selecionadas' }).getByText('Alergia a corante alimentício', { exact: true })).toBeVisible();
});
