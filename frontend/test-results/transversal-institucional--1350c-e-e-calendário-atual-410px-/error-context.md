# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: transversal.spec.ts >> institucional: footer mobile, foto Sobre e calendário atual (410px)
- Location: tests/e2e/transversal.spec.ts:4:3

# Error details

```
Error: expect(locator).toHaveCSS(expected) failed

Locator:  getByRole('img', { name: 'Brincadeira com Bexiga', exact: true })
Expected: "contain"
Received: "cover"
Timeout:  5000ms

Call log:
  - Expect "toHaveCSS" getByRole('img', { name: 'Brincadeira com Bexiga', exact: true }) with timeout 5000ms
  - waiting for getByRole('img', { name: 'Brincadeira com Bexiga', exact: true })
    14 × locator resolved to <img loading="lazy" draggable="false" alt="Brincadeira com Bexiga" src="/images/Atividade%20-%20Brincadeira%20com%20Bexiga.jpeg" class="box-border w-full h-[220px] shrink-0 flex flex-row gap-0 justify-center items-center bg-[#e6f3efff] [border:2px_solid_var(--brand)] rounded-[16px] overflow-hidden object-cover"/>
       - unexpected value "cover"

```

```yaml
- img "Brincadeira com Bexiga"
```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | 
  3   | for (const width of [1440, 410]) {
  4   |   test(`institucional: footer mobile, foto Sobre e calendário atual (${width}px)`, async ({ page }) => {
  5   |     await page.clock.setFixedTime(new Date(2027, 0, 10, 12));
  6   |     await page.setViewportSize({ width, height: 1000 });
  7   |     for (const route of ['TL01', 'TL08', 'TL09']) {
  8   |       await page.goto(`/prototipo/${route}`);
  9   |       await page.locator('.institutional-page [data-footer-text]').first().waitFor({ state: 'attached' });
  10  |       expect(await page.locator('.institutional-page [data-footer-text]').evaluateAll(nodes => nodes.every(node => getComputedStyle(node).display === 'none'))).toBe(width === 410);
  11  |     }
  12  |     await expect(page.locator('.booking-calendar [data-design-name="Mês"]')).toHaveText('Janeiro de 2027');
  13  |     const activity = page.getByRole('img', { name: 'Brincadeira com Bexiga', exact: true });
> 14  |     await expect(activity).toHaveCSS('object-fit', 'contain');
      |                            ^ Error: expect(locator).toHaveCSS(expected) failed
  15  |     const box = (await activity.boundingBox())!;
  16  |     expect(box.height).toBe(width === 1440 ? 330 : 300);
  17  |     if (width === 1440) expect(box.width).toBe(480);
  18  |     await page.goto('/prototipo/TL08');
  19  |     await expect(page.locator(width === 1440 ? '[data-design-id="Nqmkv"]' : '[data-design-id="QDETf"]')).toHaveCSS('background-size', 'contain');
  20  |   });
  21  | 
  22  |   test(`diário e check-in: alinhamento, SVG e acesso ao feed (${width}px)`, async ({ page }) => {
  23  |     await page.setViewportSize({ width, height: 1000 });
  24  |     await page.goto('/prototipo/TL07');
  25  |     const back = page.locator('.diary-actions').getByRole('button', { name: 'Voltar', exact: true });
  26  |     const book = page.locator('.diary-actions').getByRole('button', { name: 'Agendar', exact: true });
  27  |     await expect(book).toBeVisible();
  28  |     const a = (await back.boundingBox())!, b = (await book.boundingBox())!;
  29  |     expect(Math.abs(a.y + a.height / 2 - b.y - b.height / 2)).toBeLessThan(2);
  30  |     const icon = page.locator('[data-design-name="Registro de refeição"] img');
  31  |     const svg = await (await page.request.get(await icon.getAttribute('src') || '')).text();
  32  |     expect(svg).toContain('viewBox="-1.5 -1.5 21 23"');
  33  |     await page.goto('/prototipo/TL11');
  34  |     await expect(page.getByRole('button', { name: 'Feed do Monitor', exact: true })).toHaveCount(4);
  35  |     await page.getByRole('button', { name: 'Feed do Monitor', exact: true }).first().click();
  36  |     await expect(page).toHaveURL('/prototipo/TL10');
  37  |     await expect(page.getByText(/Contexto recebido: Thor/)).toBeVisible();
  38  |   });
  39  | 
  40  |   test(`pet: catálogo, convênio, validade e alergias múltiplas (${width}px)`, async ({ page }) => {
  41  |     await page.clock.setFixedTime(new Date(2027, 0, 10, 12));
  42  |     await page.setViewportSize({ width, height: 1000 });
  43  |     await page.goto('/tests/fixtures/pet-catalog-flow.html');
  44  |     await expect(page.getByLabel('Convênio', { exact: true })).toBeVisible();
  45  |     await page.getByLabel('Convênio', { exact: true }).fill('Plano de exemplo');
  46  |     if (width === 410) {
  47  |       await page.getByLabel('Nome', { exact: true }).fill('Bob');
  48  |       await page.getByLabel('Nascimento', { exact: true }).fill('01012020');
  49  |       await page.getByLabel('Raça', { exact: true }).fill('SRD');
  50  |       await page.getByRole('button', { name: 'Avançar', exact: true }).click();
  51  |       await page.getByRole('button', { name: 'Avançar', exact: true }).click();
  52  |     }
  53  |     const vaccine = page.getByRole('combobox', { name: 'Vacina', exact: true }).first();
  54  |     await vaccine.selectOption('__add__');
  55  |     const dialog = page.getByRole('dialog', { name: 'Adicionar vacina' });
  56  |     await dialog.getByLabel('Nome do item').fill('V10');
  57  |     await dialog.getByRole('button', { name: 'Salvar item' }).click();
  58  |     await expect(dialog.getByText('Este item já está cadastrado.', { exact: true })).toBeVisible();
  59  |     await dialog.getByLabel('Nome do item').fill('Vacina nova');
  60  |     await dialog.getByRole('button', { name: 'Salvar item' }).click();
  61  |     await expect(dialog).toHaveCount(0);
  62  |     await expect(vaccine).toHaveValue('Vacina nova');
  63  |     await page.getByLabel('Data', { exact: true }).first().fill('01012026');
  64  |     const validity = page.getByLabel('Validade', { exact: true }).first();
  65  |     await validity.pressSequentially('010120285555');
  66  |     await expect(validity).toHaveValue('01/01/2028');
  67  |     await validity.fill('31022028');
  68  |     await expect(validity).toHaveAttribute('aria-invalid', 'true');
  69  |     await validity.fill('01012028');
  70  |     if (width === 410) await page.getByRole('button', { name: 'Avançar', exact: true }).click();
  71  |     const allergies = page.getByRole('combobox', { name: 'Selecionar alergia', exact: true });
  72  |     await allergies.selectOption('Alergia a frango');
  73  |     await allergies.selectOption('__add__');
  74  |     const allergy = page.getByRole('dialog', { name: 'Adicionar alergia' });
  75  |     await allergy.getByLabel('Nome do item').fill('Poeira');
  76  |     await allergy.getByRole('button', { name: 'Salvar item' }).click();
  77  |     await expect(page.getByRole('list', { name: 'Alergias selecionadas' }).locator('li')).toHaveCount(2);
  78  |     await page.getByRole('button', { name: 'Remover alergia Poeira' }).click();
  79  |     await expect(allergies.locator('option[value="Poeira"]')).toHaveCount(1);
  80  |   });
  81  | 
  82  |   test(`Meus Pets: dias agendados refletem reservas fornecidas e não duplicam (${width}px)`, async ({ page }) => {
  83  |     await page.setViewportSize({ width, height: 1000 });
  84  |     await page.goto('/tests/fixtures/pet-catalog-flow.html?pets');
  85  |     await expect(page.locator('.scheduled-day-booked')).toHaveCount(2);
  86  |     const date = page.getByRole('button', { name: '15/01/2027, agendado', exact: true });
  87  |     await date.click(); await expect(date).toHaveAttribute('aria-pressed', 'true');
  88  |     await expect(page.getByRole('button', { name: '25/01/2027, sem agendamento', exact: true })).toBeVisible();
  89  |   });
  90  | }
  91  | 
  92  | test('agendamento desktop mantém resumo abaixo do calendário e alturas alinhadas', async ({ page }) => {
  93  |   await page.setViewportSize({ width: 1440, height: 1000 });
  94  |   await page.goto('/prototipo/TL03');
  95  |   const row = page.locator('[data-design-id="CKErY"]');
  96  |   const summary = page.locator('[data-design-id="IjVwX"]');
  97  |   await expect(summary).toBeVisible();
  98  |   const rowBox = (await row.boundingBox())!, summaryBox = (await summary.boundingBox())!;
  99  |   expect(summaryBox.y).toBeGreaterThanOrEqual(rowBox.y + rowBox.height);
  100 |   const calendar = (await page.locator('[data-design-id="bwBUh"]').boundingBox())!;
  101 |   const pets = (await page.locator('[data-design-id="D87LCS"]').boundingBox())!;
  102 |   expect(Math.abs(calendar.height - pets.height)).toBeLessThan(2);
  103 | });
  104 | 
  105 | test('falha no cadastro de catálogo preserva o popup e não simula persistência', async ({ page }) => {
  106 |   await page.setViewportSize({ width: 1440, height: 1000 });
  107 |   await page.goto('/tests/fixtures/pet-catalog-flow.html?failure');
  108 |   await page.getByRole('combobox', { name: 'Remédio', exact: true }).first().selectOption('__add__');
  109 |   const dialog = page.getByRole('dialog', { name: 'Adicionar medicamento' });
  110 |   await dialog.getByLabel('Nome do item').fill('Medicamento novo');
  111 |   await dialog.getByRole('button', { name: 'Salvar item' }).click();
  112 |   await expect(dialog.getByText('Falha de teste ao cadastrar item.', { exact: true })).toBeVisible();
  113 |   await expect(dialog.getByLabel('Nome do item')).toHaveValue('Medicamento novo');
  114 | });
```