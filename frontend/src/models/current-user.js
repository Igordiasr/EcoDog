import { requestJson } from '../api/http';
import { sessionFromToken } from './auth';
import { isUuid } from './integration-contracts';

export async function loadCurrentUser(baseUrl, session, signal, request) {
    const auth = sessionFromToken(session?.token);
    if (!auth || auth.id !== String(session.id)) throw new Error('Sessão inválida.');
    const prefix = { tutor: '/tutores/conta', monitor: '/usuarios/monitores', admin: '/usuarios/administradores' }[auth.profile];
    const user = await requestJson(baseUrl, `${prefix}/${encodeURIComponent(auth.id)}`, { headers: { Authorization: `Bearer ${auth.token}` } }, signal, request);
    const userId = auth.profile === 'tutor' ? user?.idTutor : user?.id;
    if (!isUuid(userId) || userId.toLowerCase() !== auth.id || typeof user.nome !== 'string' || !user.nome.trim()) throw new Error('Dados do usuário inválidos.');
    return { nome: user.nome.trim(), email: typeof user.email === 'string' ? user.email : '', telefone: typeof user.telefone === 'string' ? user.telefone : '' };
}
export async function loadCurrentUserName(baseUrl, session, signal, request) {
    return (await loadCurrentUser(baseUrl, session, signal, request)).nome;
}
