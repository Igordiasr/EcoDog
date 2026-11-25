import { requestJson } from './http';
import { date, enumValue, list, object, uuid, text } from '../models/integration-contracts';
import { sessionFromToken } from '../models/auth';
export async function deleteTutorPet(baseUrl, session, petId, request) {
    const auth = sessionFromToken(session?.token);
    if (!auth || auth.profile !== 'tutor' || auth.id !== String(session?.id).toLowerCase()) throw new Error('Sua sessão expirou. Entre novamente.');
    uuid(petId, 'pet');
    uuid(auth.id, 'tutor');
    return requestJson(baseUrl, `/tutores/${encodeURIComponent(auth.id)}/pets/${petId}`, { method: 'DELETE', headers: { Authorization: `Bearer ${auth.token}` } }, undefined, request);
}
export function createPetsApi(baseUrl, request, token) {
    return {
        /** SEC-01: caller must supply a server-authorized tutor ID; never guess it. */
        async list(tutorId, signal) {
            uuid(tutorId, 'tutor');
            const response = await requestJson(baseUrl, `/tutores/${tutorId}/pets`, { headers: token ? { Authorization: `Bearer ${token}` } : {} }, signal, request);
            return list(response ?? [], 'pets').map((item) => {
                const p = object(item, 'pet');
                if (typeof p.castrado !== 'boolean')
                    throw new Error('Estado de castração inválido');
                return { idPet: uuid(p.idPet, 'pet'), nome: text(p.nome, 'nome'), raca: text(p.raca, 'raça'), sexo: enumValue(p.sexo, ['M', 'F'], 'sexo'), castrado: p.castrado, dataNascimento: date(p.dataNascimento, 'nascimento') };
            });
        },
    };
}
