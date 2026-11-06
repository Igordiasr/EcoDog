import { requestJson } from './http';
import { date, enumValue, list, object, positiveId, text } from '../models/integration-contracts';
import { sessionFromToken } from '../models/auth';
export async function deleteTutorPet(baseUrl, session, petId, request) {
    const auth = sessionFromToken(session?.token);
    if (!auth || auth.profile !== 'tutor' || auth.id !== String(session.id)) throw new Error('Sua sessão expirou. Entre novamente.');
    positiveId(petId, 'pet');
    return requestJson(baseUrl, `/pets/${encodeURIComponent(auth.id)}/${petId}`, { method: 'DELETE', headers: { Authorization: `Bearer ${auth.token}` } }, undefined, request);
}
export function createPetsApi(baseUrl, request) {
    return {
        /** SEC-01: caller must supply a server-authorized tutor ID; never guess it. */
        async list(tutorId, signal) {
            positiveId(tutorId, 'tutor');
            const response = await requestJson(baseUrl, `/pets/${tutorId}`, {}, signal, request);
            return list(response, 'pets').map((item) => {
                const p = object(item, 'pet');
                if (typeof p.castrado !== 'boolean')
                    throw new Error('Estado de castração inválido');
                return { idPet: positiveId(p.idPet, 'pet'), nome: text(p.nome, 'nome'), raca: text(p.raca, 'raça'), sexo: enumValue(p.sexo, ['M', 'F'], 'sexo'), castrado: p.castrado, dataNascimento: date(p.dataNascimento, 'nascimento') };
            });
        },
    };
}
