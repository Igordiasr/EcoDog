import { requestJson } from '../api/http';
import { sessionFromToken } from './auth';
import { isUuid, uuid } from './integration-contracts';

export async function loadTutorPets(baseUrl, session, signal, request) {
    const authenticated = sessionFromToken(session?.token);
    if (!authenticated || authenticated.profile !== 'tutor' || authenticated.id !== String(session.id)) throw new Error('Sua sessão expirou. Entre novamente para consultar seus pets.');
    uuid(authenticated.id, 'tutor');
    const data = await requestJson(baseUrl, `/tutores/${encodeURIComponent(authenticated.id)}/pets`, { headers: { Authorization: `Bearer ${authenticated.token}` } }, signal, request);
    if (data === null) return [];
    if (!Array.isArray(data) || data.some(pet => !isUuid(pet.idPet) || typeof pet.nome !== 'string')) throw new Error('Resposta da lista de pets inesperada.');
    return data;
}
