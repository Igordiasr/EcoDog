import { expect, it, vi } from 'vitest';
import { createUsersApi } from '../src/api/users-api';

const id = '550e8400-e29b-41d4-a716-446655440000';
const user = { id, nome: 'Ana', sobrenome: 'Silva', email: 'ana@example.com', telefone: '11912345678', statusUsuario: true };
const fields = { ...user, cpf: '529.982.247-25', senha: 'Senha123', confirmation: 'Senha123' };
const response = () => new Response(JSON.stringify(user), { status: 200, headers: { 'Content-Type': 'application/json' } });

it.each(['monitores', 'administradores'])('integra todo o CRUD de %s no endpoint próprio', async kind => {
    const request = vi.fn()
        .mockResolvedValueOnce(new Response(JSON.stringify([user]), { status: 200 }))
        .mockResolvedValueOnce(response())
        .mockResolvedValueOnce(response())
        .mockResolvedValueOnce(response())
        .mockResolvedValueOnce(new Response(null, { status: 204 }));
    const api = createUsersApi('http://localhost:8080', 'token', request);
    expect(await api.list(kind)).toEqual([user]);
    expect(await api.get(kind, id)).toEqual(user);
    await api.save(kind, fields);
    await api.save(kind, fields, id);
    await api.remove(kind, id);
    expect(request.mock.calls.map(([url]) => url)).toEqual([
        `http://localhost:8080/usuarios/${kind}`,
        `http://localhost:8080/usuarios/${kind}/${id}`,
        `http://localhost:8080/usuarios/${kind}`,
        `http://localhost:8080/usuarios/${kind}/${id}`,
        `http://localhost:8080/usuarios/${kind}/${id}`,
    ]);
    expect(request.mock.calls.map(([, options]) => options.method)).toEqual(['GET', 'GET', 'POST', 'PUT', 'DELETE']);
    for (const [, options] of request.mock.calls) expect(options.headers.Authorization).toBe('Bearer token');
    expect(JSON.parse(request.mock.calls[2][1].body)).toEqual({ nome: 'Ana', sobrenome: 'Silva', email: 'ana@example.com', telefone: '11912345678', cpf: '52998224725', senha: 'Senha123' });
});

it.each(['monitores', 'administradores'])('trata lista vazia de %s', async kind => {
    const api = createUsersApi('http://localhost:8080', 'token', vi.fn().mockResolvedValue(new Response(null, { status: 204 })));
    expect(await api.list(kind)).toEqual([]);
});
