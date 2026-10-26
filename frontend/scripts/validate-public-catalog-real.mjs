// Read-only browser evidence. No interception, seeds, writes or shared catalog deletion.
import { createServer } from 'vite';
import { chromium, expect } from '@playwright/test';

if (!process.env.VITE_API_BASE_URL) throw new Error('Informe VITE_API_BASE_URL explicitamente.');
const base = process.env.VITE_API_BASE_URL.replace(/\/$/, '');
const server = await createServer({ server: { host: 'localhost', port: 5173, strictPort: true } });
let browser;
try {
  await server.listen();
  browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:5173/estrutura');
  const responsePromise = page.waitForResponse(`${base}/calendario/catalogo-atividades`);
  await page.getByRole('button', { name: 'Consultar catálogo de atividades', exact: true }).click();
  const response = await responsePromise;
  expect(response.status()).toBe(200);
  const body = await response.json();
  expect(Array.isArray(body)).toBe(true);
  expect(body.length).toBeGreaterThan(0);
  const dialog = page.getByRole('dialog');
  for (const item of body) await expect(dialog.getByRole('heading', { name: item.nome, exact: true })).toBeVisible();
  await expect(dialog.getByRole('alert')).toHaveCount(0);
  expect(response.headers()['access-control-allow-origin']).toBe('http://localhost:5173');
  console.log(JSON.stringify({ testedAt: new Date().toISOString(), origin: 'http://localhost:5173', endpoint: '/calendario/catalogo-atividades', status: response.status(), count: body.length, browserCors: 'confirmed', ui: 'valid catalog rendered', intercepted: false }));
} finally {
  await browser?.close();
  await server.close();
}
