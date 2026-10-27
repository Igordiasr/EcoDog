import { requestJson } from '../api/http';
import { sessionFromToken } from './auth';

export async function loadTutorPets(baseUrl, session, signal, request) {
    const authenticated = sessionFromToken(session?.token);
    if (!authenticated || authenticated.profile !== 'tutor' || authenticated.id !== String(session.id)) throw new Error('Sua sessão expirou. Entre novamente para consultar seus pets.');
    const data = await requestJson(baseUrl, `/pets/${encodeURIComponent(authenticated.id)}`, { headers: { Authorization: `Bearer ${authenticated.token}` } }, signal, request);
    if (data === null) return [];
    if (!Array.isArray(data) || data.some(pet => !Number.isSafeInteger(pet.idPet) || pet.idPet <= 0 || typeof pet.nome !== 'string')) throw new Error('Resposta da lista de pets inesperada.');
    return data;
}
