import { describe, expect, it, vi } from 'vitest';
import { loadCurrentUser, updateCurrentTutor, updateTutorPassword } from '../src/models/current-user';

const id = '550e8400-e29b-41d4-a716-446655440000';
const base = 'http://localhost:8080';
const session = role => ({ id, profile: { TUTOR: 'tutor', MONITOR: 'monitor', ADMINISTRADOR: 'admin' }[role], token: `header.${btoa(JSON.stringify({ sub: id, roles: role, exp: Math.floor(Date.now() / 1000) + 600 }))}.signature` });
const endereco = { cep: '01001000', rua: 'Praça da Sé', numero: '10', complemento: '', bairro: 'Sé', cidade: 'São Paulo' };
const tutor = { idTutor: id, nome: 'Ana', sobrenome: 'Silva', cpf: '52998224725', telefone: '11912345678', email: 'ana@example.com', endereco };
const response = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

describe('Meu perfil', () => {
    it.each([
        ['TUTOR', `/tutores/conta/${id}`, tutor],
        ['MONITOR', `/usuarios/monitores/${id}`, { id, nome: 'Ana', sobrenome: 'Silva' }],
        ['ADMINISTRADOR', `/usuarios/administradores/${id}`, { id, nome: 'Ana', sobrenome: 'Silva' }],
    ])('consulta dados do perfil %s com autenticação', async (role, path, result) => {
        const auth = session(role), request = vi.fn().mockResolvedValue(response(result));
        expect(await loadCurrentUser(base, auth, undefined, request)).toMatchObject({ nome: 'Ana', sobrenome: 'Silva' });
        expect(request.mock.calls[0][0]).toBe(base + path);
        expect(request.mock.calls[0][1].headers.Authorization).toBe(`Bearer ${auth.token}`);
    });
    it('preserva endereço do tutor e envia o contrato completo na atualização', async () => {
        const auth = session('TUTOR'), request = vi.fn().mockResolvedValueOnce(response(tutor)).mockResolvedValueOnce(response(tutor));
        const user = await loadCurrentUser(base, auth, undefined, request);
        expect(user.endereco).toEqual(endereco);
        const result = await updateCurrentTutor(base, auth, { ...user, ...endereco, cep: '01001-000', telefone: '(11) 91234-5678' }, undefined, request);
        expect(result.endereco).toEqual(endereco);
        const [url, options] = request.mock.calls[1];
        expect(url).toBe(`${base}/tutores/conta/${id}`);
        expect(options.method).toBe('PUT');
        expect(options.headers.Authorization).toBe(`Bearer ${auth.token}`);
        expect(JSON.parse(options.body)).toEqual({ nome: 'Ana', sobrenome: 'Silva', cpf: '52998224725', telefone: '11912345678', email: 'ana@example.com', endereco });
    });
    it('não envia dados inválidos ou permite atualizar como outro perfil', async () => {
        const request = vi.fn();
        await expect(updateCurrentTutor(base, session('TUTOR'), { ...tutor, ...endereco, cep: '123' }, undefined, request)).rejects.toThrow('CEP');
        await expect(updateCurrentTutor(base, session('MONITOR'), { ...tutor, ...endereco }, undefined, request)).rejects.toThrow('indisponível');
        expect(request).not.toHaveBeenCalled();
    });
    it('recusa identidade divergente e propaga falha de autorização', async () => {
        const auth = session('MONITOR');
        await expect(loadCurrentUser(base, auth, undefined, vi.fn().mockResolvedValue(response({ id: '550e8400-e29b-41d4-a716-446655440001', nome: 'Ana' })))).rejects.toThrow('inválidos');
        await expect(loadCurrentUser(base, auth, undefined, vi.fn().mockResolvedValue(response({}, 403)))).rejects.toMatchObject({ status: 403 });
    });
    it('atualiza senha do tutor sem enviar confirmação e trata senha atual incorreta', async () => {
        const auth = session('TUTOR'), fields = { senhaAtual: 'antiga', novaSenha: 'NovaSenha123', confirmacao: 'NovaSenha123' };
        const request = vi.fn().mockResolvedValueOnce(new Response(null, { status: 204 })).mockResolvedValueOnce(response({}, 422));
        await updateTutorPassword(base, auth, fields, undefined, request);
        expect(request.mock.calls[0][0]).toBe(`${base}/tutores/conta/${id}/senha`);
        expect(request.mock.calls[0][1].method).toBe('PATCH');
        expect(JSON.parse(request.mock.calls[0][1].body)).toEqual({ senhaAtual: 'antiga', novaSenha: 'NovaSenha123' });
        await expect(updateTutorPassword(base, auth, fields, undefined, request)).rejects.toThrow('Senha atual incorreta.');
        await expect(updateTutorPassword(base, session('ADMINISTRADOR'), fields, undefined, request)).rejects.toThrow('indisponível');
        await expect(updateTutorPassword(base, auth, { ...fields, confirmacao: 'outra' }, undefined, request)).rejects.toThrow('confirmação');
        expect(request).toHaveBeenCalledTimes(2);
    });
});
