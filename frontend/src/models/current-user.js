import { requestJson } from '../api/http';
import { sessionFromToken } from './auth';
import { isUuid } from './integration-contracts';
import { registrationAddressData } from '../viewmodels/auth';

function currentAuth(session) {
    const auth = sessionFromToken(session?.token);
    if (!auth || auth.id !== String(session?.id).toLowerCase() || auth.profile !== session?.profile) throw new Error('Sessão inválida.');
    return auth;
}

function normalizeUser(user, auth) {
    const userId = auth.profile === 'tutor' ? user?.idTutor : user?.id;
    if (!isUuid(userId) || userId.toLowerCase() !== auth.id || typeof user.nome !== 'string' || !user.nome.trim()) throw new Error('Dados do usuário inválidos.');
    const text = value => typeof value === 'string' ? value : '';
    const endereco = user.endereco && typeof user.endereco === 'object' && !Array.isArray(user.endereco)
        ? Object.fromEntries(['cep', 'rua', 'numero', 'complemento', 'bairro', 'cidade'].map(key => [key, text(user.endereco[key])])) : null;
    return { nome: user.nome.trim(), sobrenome: text(user.sobrenome), cpf: text(user.cpf), email: text(user.email), telefone: text(user.telefone), endereco };
}

export async function loadCurrentUser(baseUrl, session, signal, request) {
    const auth = currentAuth(session);
    const prefix = { tutor: '/tutores/conta', monitor: '/usuarios/monitores', admin: '/usuarios/administradores' }[auth.profile];
    const user = await requestJson(baseUrl, `${prefix}/${encodeURIComponent(auth.id)}`, { headers: { Authorization: `Bearer ${auth.token}` } }, signal, request);
    return normalizeUser(user, auth);
}

export async function updateCurrentTutor(baseUrl, session, fields, signal, request) {
    const auth = currentAuth(session);
    if (auth.profile !== 'tutor') throw new Error('Atualização de perfil indisponível para este acesso.');
    const nome = (fields.nome || '').trim(), sobrenome = (fields.sobrenome || '').trim();
    const cpf = (fields.cpf || '').replace(/\D/g, ''), telefone = (fields.telefone || '').replace(/\D/g, '');
    const email = (fields.email || '').trim();
    if (!nome || !sobrenome || nome.length > 120 || sobrenome.length > 120) throw new Error('Confira seu nome e sobrenome.');
    if (!/^\d{11}$/.test(cpf)) throw new Error('CPF indisponível ou inválido. Não foi possível atualizar seus dados.');
    if (!/^\d{10,11}$/.test(telefone)) throw new Error('Informe um telefone com DDD e 10 ou 11 dígitos.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Informe um e-mail válido.');
    const endereco = registrationAddressData(fields);
    if (endereco.rua.length > 150 || endereco.bairro.length > 100 || endereco.cidade.length > 100 || endereco.complemento.length > 100) throw new Error('Confira o tamanho dos campos de endereço.');
    const user = await requestJson(baseUrl, `/tutores/conta/${encodeURIComponent(auth.id)}`, {
        method: 'PUT', headers: { Authorization: `Bearer ${auth.token}` }, body: { nome, sobrenome, cpf, telefone, email, endereco },
    }, signal, request);
    return normalizeUser(user, auth);
}
export async function updateTutorPassword(baseUrl, session, fields, signal, request) {
    const auth = currentAuth(session);
    if (auth.profile !== 'tutor') throw new Error('Alteração de senha indisponível para este acesso.');
    const { senhaAtual = '', novaSenha = '', confirmacao = '' } = fields;
    if (!senhaAtual.trim()) throw new Error('Informe sua senha atual.');
    if (novaSenha.length < 8 || novaSenha.length > 100 || !/[a-zA-Z]/.test(novaSenha) || !/[0-9]/.test(novaSenha)) throw new Error('Use de 8 a 100 caracteres, com letras e números.');
    if (novaSenha !== confirmacao) throw new Error('Confira a confirmação da nova senha.');
    try {
        await requestJson(baseUrl, `/tutores/conta/${encodeURIComponent(auth.id)}/senha`, {
            method: 'PATCH', headers: { Authorization: `Bearer ${auth.token}` }, body: { senhaAtual, novaSenha },
        }, signal, request);
    } catch (error) {
        if (error.status === 422) error.message = 'Senha atual incorreta.';
        throw error;
    }
}
export async function loadCurrentUserName(baseUrl, session, signal, request) {
    return (await loadCurrentUser(baseUrl, session, signal, request)).nome;
}
