import { expect, it } from 'vitest';
import { loadCurrentUserName } from '../src/models/current-user';
const token = `header.${btoa(JSON.stringify({ sub: '4', roles: 'TUTOR', exp: 4102444800 }))}.signature`;
it('consulta o nome do usuário autenticado sem usar nomes do protótipo', async () => {
    await expect(loadCurrentUserName('http://localhost:8080', { token, id: '4' }, undefined, async (url, options) => {
        expect(url).toBe('http://localhost:8080/usuarios/4');
        expect(options.headers.Authorization).toBe(`Bearer ${token}`);
        return new Response(JSON.stringify({ id: 4, nome: ' Victor ' }));
    })).resolves.toBe('Victor');
});
it('não aceita dados de outro usuário', async () => {
    await expect(loadCurrentUserName('http://localhost:8080', { token, id: '4' }, undefined, async () => new Response(JSON.stringify({ id: 9, nome: 'Outro' })))).rejects.toThrow(/inválidos/);
});
