import { requestJson } from '../api/http';
import { sessionFromToken } from './auth';

export async function loadCurrentUserName(baseUrl, session, signal, request) {
    const auth = sessionFromToken(session?.token);
    if (!auth || auth.id !== String(session.id)) throw new Error('Sessão inválida.');
    const prefix = { tutor: '/usuarios', monitor: '/usuarios/monitores', admin: '/usuarios/administradores' }[auth.profile];
    const user = await requestJson(baseUrl, `${prefix}/${encodeURIComponent(auth.id)}`, { headers: { Authorization: `Bearer ${auth.token}` } }, signal, request);
    if (!user || String(user.id) !== auth.id || typeof user.nome !== 'string' || !user.nome.trim()) throw new Error('Dados do usuário inválidos.');
    return user.nome.trim();
}
