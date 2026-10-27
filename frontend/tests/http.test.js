import { describe, expect, it, vi } from 'vitest';
import { getJson, HttpError, requestJson, validateApiBaseUrl } from '../src/api/http';
describe('HTTP público', () => {
    it('serializa parâmetros e omite credenciais', async () => {
        const fetcher = vi.fn(async () => new Response(JSON.stringify({ ok: true }), { status: 200 }));
        expect(await requestJson('http://localhost:8080', '/calendario/servicos', { query: { categoria: 'DAYUSE' } }, undefined, fetcher)).toEqual({ ok: true });
        expect(fetcher.mock.calls[0][0]).toContain('categoria=DAYUSE');
        expect(fetcher.mock.calls[0][1].credentials).toBe('omit');
    });
    it('não interpreta JSON em 204', async () => {
        const fetcher = vi.fn(async () => new Response(null, { status: 204 }));
        expect(await requestJson('http://localhost:8080', '/teste', { method: 'DELETE' }, undefined, fetcher)).toBeNull();
    });
    it('não transforma erro em lista vazia', async () => {
        const fetcher = vi.fn(async () => new Response(JSON.stringify({ message: 'segredo' }), { status: 403 }));
        await expect(getJson('http://localhost:8080', '/teste', undefined, fetcher)).rejects.toBeInstanceOf(HttpError);
    });
    it('rejeita URL com credenciais', () => { expect(() => validateApiBaseUrl('http://user:pass@localhost:8080')).toThrow(); });
});
