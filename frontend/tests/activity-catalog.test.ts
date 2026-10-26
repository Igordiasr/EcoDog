import { describe, expect, it, vi } from 'vitest';
import { createActivityCatalogSource } from '../src/services/activity-catalog';
import { getJson, HttpError } from '../src/services/http';

const row = { idAtividadeDoDia: null, idAtividade: 7, nome: 'Boliche', descricao: 'Brincadeira', categoria: 'Recreação', horaInicio: null, horaFim: null, situacao: null };
const respond = (body: unknown, status = 200) => vi.fn<typeof fetch>().mockResolvedValue(new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } }));

describe('catálogo real de atividades', () => {
  it('consulta somente o endpoint confirmado e mapeia o DTO sem fabricar dados', async () => {
    const request = respond([row]);
    const signal = new AbortController().signal;
    expect(await createActivityCatalogSource('http://localhost:8080/', request).load(signal)).toEqual([{ id: 7, name: 'Boliche', description: 'Brincadeira', category: 'Recreação' }]);
    expect(request).toHaveBeenCalledWith('http://localhost:8080/calendario/catalogo-atividades', { method: 'GET', headers: { Accept: 'application/json' }, credentials: 'omit', signal });
  });
  it('preserva catálogo vazio e campos opcionais nulos', async () => {
    expect(await createActivityCatalogSource('http://localhost:8080', respond([])).load()).toEqual([]);
    expect(await createActivityCatalogSource('http://localhost:8080', respond([{ ...row, descricao: null, categoria: null }])).load()).toEqual([{ id: 7, name: 'Boliche', description: null, category: null }]);
  });
  it.each([{}, [null], [{ ...row, idAtividade: '7' }], [{ ...row, nome: '' }], [row, row]])('rejeita resposta incompatível: %j', async body => {
    await expect(createActivityCatalogSource('http://localhost:8080', respond(body)).load()).rejects.toThrow('Resposta inesperada');
  });
  it('não interpreta 204 como catálogo vazio', async () => {
    const request = vi.fn<typeof fetch>().mockResolvedValue(new Response(null, { status: 204 }));
    expect(await getJson('http://localhost:8080', '/consulta', undefined, request)).toBeNull();
    await expect(createActivityCatalogSource('http://localhost:8080', request).load()).rejects.toThrow('Resposta inesperada');
  });
  it.each([{ ...row, idAtividadeDoDia: 1 }, { ...row, horaInicio: '09:00:00' }, { ...row, situacao: 'PENDENTE' }])('não confunde atividade programada com catálogo: %j', async item => {
    await expect(createActivityCatalogSource('http://localhost:8080', respond([item])).load()).rejects.toThrow('Resposta inesperada');
  });
  it('mantém status e validações por campo sem exibir diagnóstico arbitrário', async () => {
    try {
      await getJson('http://localhost:8080', '/consulta', undefined, respond({ nome: 'Campo obrigatório' }, 400));
      throw new Error('Deveria rejeitar');
    } catch (error) {
      expect(error).toBeInstanceOf(HttpError);
      expect(error).toMatchObject({ status: 400, fields: { nome: 'Campo obrigatório' } });
    }
    await expect(getJson('http://localhost:8080', '/consulta', undefined, respond({ message: 'diagnóstico privado' }, 403))).rejects.toThrow('Consulta não autorizada');
  });
  it('rejeita HTML inesperado, falha de rede e cancelamento sem fallback mock', async () => {
    const html = vi.fn<typeof fetch>().mockResolvedValue(new Response('<html>erro</html>'));
    await expect(createActivityCatalogSource('http://localhost:8080', html).load()).rejects.toThrow('Resposta inesperada');
    const network = vi.fn<typeof fetch>().mockRejectedValue(new TypeError('Failed to fetch'));
    await expect(createActivityCatalogSource('http://localhost:8080', network).load()).rejects.toBeInstanceOf(TypeError);
    const aborted = vi.fn<typeof fetch>().mockRejectedValue(new DOMException('Aborted', 'AbortError'));
    await expect(createActivityCatalogSource('http://localhost:8080', aborted).load()).rejects.toMatchObject({ name: 'AbortError' });
  });
  it('não aceita credenciais ou protocolos inadequados na configuração', () => {
    for (const url of ['ftp://localhost', 'http://user:password@localhost', 'http://localhost?token=secret']) expect(() => createActivityCatalogSource(url)).toThrow('URL da API inválida');
  });
});
