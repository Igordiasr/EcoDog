// Isolated browser verification: no request reaches a real API or database.
import { createServer } from 'vite';
import { chromium, expect } from '@playwright/test';

process.env.VITE_API_BASE_URL = 'http://integration.invalid';
const server = await createServer({ configLoader: 'runner', server: { host: '127.0.0.1', port: 5189, strictPort: true } });
let browser;
try {
  await server.listen();
  browser = await chromium.launch();
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  let calls = 0;
  let body = [{ idAtividadeDoDia: null, idAtividade: 7, nome: 'Catálogo de teste', descricao: null, categoria: null, horaInicio: null, horaFim: null, situacao: null }];
  let status = 200;
  await page.route('http://integration.invalid/**', async route => {
    calls++;
    expect(route.request().method()).toBe('GET');
    expect(route.request().url()).toBe('http://integration.invalid/calendario/catalogo-atividades');
    await route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) });
  });
  await page.goto('http://127.0.0.1:5189/estrutura');
  await page.getByRole('button', { name: 'Consultar catálogo de atividades', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Catálogo de teste', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Voltar', exact: true }).click();
  body = [];
  await page.getByRole('button', { name: 'Consultar catálogo de atividades', exact: true }).click();
  await expect(page.getByText('Nenhuma atividade cadastrada.', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Voltar', exact: true }).click();
  status = 403;
  await page.getByRole('button', { name: 'Consultar catálogo de atividades', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('Consulta não autorizada pelo sistema.');
  status = 200;
  await page.getByRole('button', { name: 'Tentar novamente', exact: true }).click();
  await expect(page.getByText('Nenhuma atividade cadastrada.', { exact: true })).toBeVisible();
  const beforePreview = calls;
  await page.goto('http://127.0.0.1:5189/prototipo/TL09');
  await expect(page.getByRole('button', { name: 'Consultar catálogo de atividades', exact: true })).toHaveCount(0);
  await page.goto('http://127.0.0.1:5189/admin');
  await expect(page).toHaveURL('http://127.0.0.1:5189/entrar');
  expect(calls).toBe(beforePreview);
  expect(errors).toEqual([]);
  console.log('Aprovado: catálogo, vazio, 403, repetição, isolamento da prévia e proteção de rota; sem erros JavaScript. API interceptada, não validada contra servidor real.');
} finally {
  await browser?.close();
  await server.close();
}
