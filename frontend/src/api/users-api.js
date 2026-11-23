import { requestJson } from './http';
import { list, object, uuid } from '../models/integration-contracts';

export function createUsersApi(baseUrl, token, request) {
    const call = (kind, suffix = '', options = {}, signal) => {
        if (!['monitores', 'administradores'].includes(kind)) throw new Error('Tipo de usuário inválido.');
        return requestJson(baseUrl, `/usuarios/${kind}${suffix}`, { ...options, headers: token ? { Authorization: `Bearer ${token}` } : {} }, signal, request);
    };
    const record = raw => { const user = object(raw, 'usuário'); uuid(user.id, 'usuário'); return user; };
    return {
        async list(kind, signal) { return list(await call(kind, '', {}, signal) ?? [], 'usuários').map(record); },
        async get(kind, id, signal) { return record(await call(kind, `/${uuid(id, 'usuário')}`, {}, signal)); },
        async save(kind, fields, id) {
            const body = Object.fromEntries(['nome', 'sobrenome', 'email', 'cpf', 'telefone', 'senha'].map(key => [key, key === 'senha' ? fields[key] : (fields[key] || '').trim()]));
            body.cpf = body.cpf.replace(/\D/g, '');
            body.telefone = body.telefone.replace(/\D/g, '');
            return record(await call(kind, id ? `/${uuid(id, 'usuário')}` : '', { method: id ? 'PUT' : 'POST', body }));
        },
        remove(kind, id) { return call(kind, `/${uuid(id, 'usuário')}`, { method: 'DELETE' }); },
    };
}
