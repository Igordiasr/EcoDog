import { expect, it, vi } from 'vitest';
import { createDailyActivitiesApi } from '../src/api/daily-activities-api';
import { createUsersApi } from '../src/api/users-api';

const id = '550e8400-e29b-41d4-a716-446655440000';
const response = body => new Response(JSON.stringify(body), { status: 200, headers: { 'Content-Type': 'application/json' } });
it('carrega pets UUID e conclui com IDs de participação, não IDs de pets', async () => {
    const request = vi.fn().mockResolvedValueOnce(response({ data: '2026-11-19', atividadesDoDia: [{ idAtividadeDoDia: 1, nome: 'Brincadeira', situacao: 'PENDENTE', grupos: [{ grupo: 1, petsDoGrupo: [{ idPet: id, nome: 'Thor', idParticipacaoDoPet: 12, idAgendamento: 3 }] }] }] })).mockResolvedValueOnce(new Response(null, { status: 204 }));
    const api = createDailyActivitiesApi('http://localhost:8080', request, 'token');
    expect((await api.today()).atividadesDoDia[0].grupos[0].petsDoGrupo[0].idPet).toBe(id);
    await api.complete(1, [12, 12]);
    expect(JSON.parse(request.mock.calls[1][1].body)).toEqual({ situacao: 'CONCLUIDA', idAtividadeDoDia: 1, listaPets: [12] });
});
it('trata listagem vazia 204 e envia somente campos do contrato ao editar', async () => {
    const request = vi.fn().mockResolvedValueOnce(new Response(null, { status: 204 })).mockResolvedValueOnce(response({ id, nome: 'Ana' })).mockResolvedValueOnce(new Response(null, { status: 204 }));
    const api = createUsersApi('http://localhost:8080', 'token', request);
    expect(await api.list('monitores')).toEqual([]);
    await api.save('administradores', { nome: ' Ana ', sobrenome: 'Silva', email: 'ana@example.com', cpf: '529.982.247-25', telefone: '(11) 91234-5678', senha: 'Senha123', confirmation: 'Senha123' }, id);
    expect(request.mock.calls[1][0]).toBe(`http://localhost:8080/usuarios/administradores/${id}`);
    expect(JSON.parse(request.mock.calls[1][1].body)).toEqual({ nome: 'Ana', sobrenome: 'Silva', email: 'ana@example.com', cpf: '52998224725', telefone: '11912345678', senha: 'Senha123' });
    await api.remove('monitores', id);
    expect(request.mock.calls[2][1].method).toBe('DELETE');
});
