import { HttpError, requestJson } from '../api/http';
import { unavailableApi } from './api';

const storageKey = 'ecodog.auth.token';

// Claims determine presentation only. Authorization belongs to the backend.
export function sessionFromToken(token, now = Date.now()) {
    try {
        const payload = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
        const claims = JSON.parse(atob(payload));
        const profile = { TUTOR: 'tutor', MONITOR: 'monitor', ADMINISTRADOR: 'admin' }[claims.roles];
        if (!profile || !claims.sub || !Number.isFinite(claims.exp) || claims.exp * 1000 <= now) return null;
        return { token, id: claims.sub, profile, expiresAt: claims.exp * 1000 };
    } catch { return null; }
}

export function createAuthApi(baseUrl, { storage = globalThis.sessionStorage, request } = {}) {
    let token = null;
    const clear = () => { token = null; storage?.removeItem(storageKey); };
    const send = async (path, body) => {
        try { return await requestJson(baseUrl, path, { method: 'POST', body }, undefined, request); }
        catch (error) {
            if (!(error instanceof HttpError)) throw error;
            const messages = { 400: 'Confira os dados informados.', 401: 'E-mail ou senha inválidos.', 403: 'Não foi possível autenticar com estas credenciais.', 409: 'E-mail ou CPF já cadastrado.' };
            throw new HttpError(error.status, messages[error.status] || error.message, error.fields);
        }
    };
    return {
        ...unavailableApi,
        async session() {
            token = token || storage?.getItem(storageKey);
            const session = token ? sessionFromToken(token) : null;
            if (!session) clear();
            return session;
        },
        async login(email, senha) {
            const response = await send('/usuarios/login', { email, senha });
            const session = sessionFromToken(response?.token);
            if (!session) throw new Error('Resposta de autenticação inválida ou expirada.');
            token = response.token;
            storage?.setItem(storageKey, token);
            return session;
        },
        async register(data) {
            const user = await send('/usuarios', data);
            if (!user?.id || typeof user.nome !== 'string' || typeof user.email !== 'string') throw new Error('Resposta de cadastro inesperada.');
            return user;
        },
        async logout() { clear(); },
    };
}

export const authApi = createAuthApi(import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080');
