import { HttpError, requestJson } from '../api/http';
import { sessionFromToken } from './auth';

export function petRegistrationBody(draft) {
    return {
        nome: draft.nome, raca: draft.raca, sexo: draft.sexo,
        castrado: draft.castrado === 'Sim', dataNascimento: draft.nascimento,
        observacao: draft.obs.trim(), relacaoComOutros: draft['relacionamento-com-outros-pets'].trim(),
        veterinario: draft.veterinario, telefoneVeterinario: draft.contato, convenio: draft.convenio === 'Sim',
        medicacoesDoPet: [],
        vacinasDoPet: [],
        alergiasDoPet: [],
    };
}

export async function registerTutorPet(baseUrl, session, draft, catalog, request, petId) {
    const authenticated = sessionFromToken(session?.token);
    if (!authenticated || authenticated.profile !== 'tutor' || authenticated.id !== String(session.id)) throw new Error('Sua sessão expirou. Entre novamente para cadastrar seu pet.');
    const body = petRegistrationBody(draft, catalog);
    if (petId !== undefined && (!Number.isSafeInteger(petId) || petId <= 0)) throw new Error('Identificador do pet inválido.');
    try {
        const result = await requestJson(baseUrl, `/pets/${encodeURIComponent(authenticated.id)}${petId === undefined ? '' : `/${petId}`}`, { method: petId === undefined ? 'POST' : 'PUT', headers: { Authorization: `Bearer ${authenticated.token}` }, body }, undefined, request);
        if (!Number.isSafeInteger(result?.idPet) || result.idPet <= 0) throw new Error('Resposta do cadastro inesperada. Confira Meus Pets antes de tentar novamente.');
        return { ...result, message: petId === undefined ? 'Pet cadastrado com sucesso.' : 'Pet atualizado com sucesso.' };
    } catch (error) {
        if (!(error instanceof HttpError)) throw error;
        const messages = { 400: 'Confira os dados do pet informados.', 401: 'Sua sessão expirou. Entre novamente.', 403: 'Você não tem permissão para cadastrar este pet.', 404: 'Tutor não encontrado.', 409: 'Já existe um pet cadastrado com esse nome.' };
        throw new HttpError(error.status, messages[error.status] || error.message, error.fields);
    }
}
