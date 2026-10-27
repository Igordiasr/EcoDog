import { expect, it } from 'vitest';
import { createAuthApi, sessionFromToken } from '../src/models/auth';
import { registrationData } from '../src/viewmodels/auth';

const jwt = roles => `header.${btoa(JSON.stringify({ sub: '1', roles, exp: Math.floor(Date.now() / 1000) + 600 }))}.signature`;
it('restores valid profiles and rejects expired JWTs', () => {
    expect(sessionFromToken(jwt('TUTOR')).profile).toBe('tutor');
    expect(sessionFromToken(jwt('MONITOR')).profile).toBe('monitor');
    expect(sessionFromToken(jwt('ADMINISTRADOR')).profile).toBe('admin');
    expect(sessionFromToken(jwt('TUTOR'), Date.now() + 700000)).toBeNull();
});
it('maps registration fields to the existing backend contract', () => {
    const fields = { nome: ' Ana ', 'e-mail': 'ana@example.com', cpf: '529.982.247-25', telefone: '(11) 91234-5678', senha: 'secret', 'confirmacao-de-senha': 'secret' };
    expect(registrationData(fields)).toEqual({ nome: 'Ana', email: 'ana@example.com', cpf: '52998224725', telefone: '11912345678', senha: 'secret' });
    expect(() => registrationData({ ...fields, cpf: '11111111111' })).toThrow();
});
it('logs in through Axios and clears the stored session on logout', async () => {
    const values = new Map();
    const storage = { getItem: key => values.get(key), setItem: (key, value) => values.set(key, value), removeItem: key => values.delete(key) };
    const api = createAuthApi('http://localhost:8080', { storage, request: async (url, options) => {
        expect(url).toBe('http://localhost:8080/usuarios/login');
        expect(JSON.parse(options.body)).toEqual({ email: 'ana@example.com', senha: 'secret' });
        return new Response(JSON.stringify({ token: jwt('TUTOR') }));
    } });
    expect((await api.login('ana@example.com', 'secret')).profile).toBe('tutor');
    await api.logout();
    expect(await api.session()).toBeNull();
});
