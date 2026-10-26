import { describe, expect, it, vi } from 'vitest';
import { getJson, HttpError, requestJson, validateApiBaseUrl } from '../src/services/http';

const base = 'http://localhost:8080';
const respond = (body: unknown, status = 200) => vi.fn<typeof fetch>().mockResolvedValue(new Response(JSON.stringify(body), { status }));
describe('transporte público seguro', () => {
  it.each(['GET', 'POST', 'PUT', 'PATCH', 'DELETE'] as const)('envia %s com signal e sem credenciais', async method => {
    const request = respond({ ok: true });
    const signal = new AbortController().signal;
    expect(await requestJson(base, '/dados', { method, signal, query: { nome: 'a & b', zero: 0, ativo: false, omitido: null } }, request)).toEqual({ ok: true });
    expect(request).toHaveBeenCalledWith(`${base}/dados?nome=a+%26+b&zero=0&ativo=false`, { method, signal, credentials: 'omit', headers: { Accept: 'application/json' } });
  });
  it('serializa JSON inclusive null; 204 não faz parsing', async () => {
    const response = new Response(null, { status: 204 });
    const json = vi.spyOn(response, 'json');
    const request = vi.fn<typeof fetch>().mockResolvedValue(response);
    expect(await requestJson(base, '/dados', { method: 'POST', body: null }, request)).toBeNull();
    expect(json).not.toHaveBeenCalled();
    expect(request.mock.calls[0][1]).toMatchObject({ body: 'null', headers: { 'Content-Type': 'application/json' } });
  });
  it('não permite corpo em GET', async () => {
    const request = respond([]);
    await expect(requestJson(base, '/dados', { body: {} }, request)).rejects.toThrow('GET');
    expect(request).not.toHaveBeenCalled();
  });
  it.each([400, 401, 403, 404, 409, 500])('preserva HTTP %s sem vazar diagnóstico ou tratar como vazio', async status => {
    await expect(getJson(base, '/dados', undefined, respond({ message: 'SQL privado', nome: 'outro usuário' }, status))).rejects.toMatchObject({ status, fields: {} });
  });
  it('limita campos conhecidos e substitui mensagens remotas por texto seguro', async () => {
    await expect(requestJson(base, '/dados', { knownFields: ['nome', 'idade'] }, respond({ fields: { nome: '<html>SQL privado</html>', idade: 10, stack: 'privado' } }, 400))).rejects.toMatchObject({ status: 400, fields: { nome: 'Confira este campo.' } });
  });
  it('preserva status de erros sem JSON', async () => {
    const request = vi.fn<typeof fetch>().mockResolvedValue(new Response('<html>privado</html>', { status: 403 }));
    await expect(getJson(base, '/dados', undefined, request)).rejects.toMatchObject({ status: 403 });
  });
  it('rejeita parsing inválido e não repete escrita após falha de rede', async () => {
    await expect(getJson(base, '/dados', undefined, vi.fn<typeof fetch>().mockResolvedValue(new Response('inválido')))).rejects.toBeInstanceOf(HttpError);
    const request = vi.fn<typeof fetch>().mockRejectedValue(new TypeError('Failed to fetch'));
    await expect(requestJson(base, '/dados', { method: 'POST', body: {} }, request)).rejects.toBeInstanceOf(TypeError);
    expect(request).toHaveBeenCalledTimes(1);
  });
  it('mantém cancelamento', async () => {
    const request = vi.fn<typeof fetch>().mockRejectedValue(new DOMException('Aborted', 'AbortError'));
    await expect(getJson(base, '/dados', undefined, request)).rejects.toMatchObject({ name: 'AbortError' });
  });
  it('valida URL e impede downgrade HTTPS', () => {
    for (const url of ['inválido', 'ftp://localhost', 'http://user:secret@localhost', `${base}?token=x`, `${base}#x`]) expect(() => validateApiBaseUrl(url)).toThrow('URL da API inválida');
    expect(() => validateApiBaseUrl(base, 'https:')).toThrow();
    expect(validateApiBaseUrl('https://api.example/', 'https:')).toBe('https://api.example');
  });
  it.each(['https://outro.test/dados', '//outro.test/dados', '/\\outro.test', '/../dados'])('rejeita caminho externo: %s', async path => {
    const request = respond([]);
    await expect(requestJson(base, path, {}, request)).rejects.toThrow('Caminho');
    expect(request).not.toHaveBeenCalled();
  });
});
