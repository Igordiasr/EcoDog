import { describe, it, expect } from 'vitest';
import { petRegistrationBody, registerTutorPet } from '../src/models/pet-registration';

const draft = { nome: 'Luna', raca: 'Labrador', sexo: 'F', castrado: 'Não', nascimento: '2020-05-10', obs: ' Saudável ', 'relacionamento-com-outros-pets': ' Amigável ', veterinario: 'Ana', contato: '11999999999', convenio: 'Sim', vacinas: [], medicamentos: [], allergies: [] };
const token = `header.${btoa(JSON.stringify({ sub: '4', roles: 'TUTOR', exp: 4102444800 }))}.signature`;
const session = { token, id: '4' };

describe('cadastro de pet', () => {
    it('mapeia os dados do pet sem enviar os registros de saúde', () => {
        const body = petRegistrationBody({ ...draft, vacinas: [{ vacina: 'V10', data: '2026-01-01' }], medicamentos: [{ remedio: 'Remédio', dosagem: '1 ml', frequencia: '12 horas' }], allergies: ['Pó'] }, { vacinas: [{ id: 2, name: 'V10' }], medicamentos: [{ id: 3, name: 'Remédio' }], alergias: [{ id: 5, name: 'Pó' }] });
        expect(body).toMatchObject({ castrado: false, convenio: true, observacao: 'Saudável', vacinasDoPet: [], medicacoesDoPet: [], alergiasDoPet: [] });
        expect(body).not.toHaveProperty('photo');
    });
    it('permite salvar sem catálogo mesmo com itens preenchidos', () => {
        expect(petRegistrationBody({ ...draft, allergies: ['Pó'], medicamentos: [{ remedio: 'Teste' }], vacinas: [{ vacina: 'V10' }] })).toMatchObject({ alergiasDoPet: [], medicacoesDoPet: [], vacinasDoPet: [] });
    });
    it('envia o cadastro autenticado para o tutor da sessão', async () => {
        const request = async (url, options) => {
            expect(url).toBe('http://localhost:8080/pets/4');
            expect(options.method).toBe('POST');
            expect(options.headers.Authorization).toBe(`Bearer ${token}`);
            expect(JSON.parse(options.body)).toEqual(petRegistrationBody(draft));
            return new Response(JSON.stringify({ idPet: 8 }), { status: 201 });
        };
        await expect(registerTutorPet('http://localhost:8080', session, draft, undefined, request)).resolves.toMatchObject({ idPet: 8 });
    });
    it('rejeita sessões divergentes e trata conflitos', async () => {
        await expect(registerTutorPet('http://localhost:8080', { ...session, id: '9' }, draft)).rejects.toThrow(/sessão expirou/);
        await expect(registerTutorPet('http://localhost:8080', session, draft, undefined, async () => new Response('{}', { status: 409 }))).rejects.toThrow(/esse nome/);
    });
    it('atualiza o pet usando PUT sem enviar registros de saúde', async () => {
        const request = async (url, options) => {
            expect(url).toBe('http://localhost:8080/pets/4/8');
            expect(options.method).toBe('PUT');
            expect(JSON.parse(options.body)).toMatchObject({ alergiasDoPet: [], medicacoesDoPet: [], vacinasDoPet: [] });
            return new Response(JSON.stringify({ idPet: 8 }), { status: 200 });
        };
        await expect(registerTutorPet('http://localhost:8080', session, draft, undefined, request, 8)).resolves.toMatchObject({ message: 'Pet atualizado com sucesso.' });
        await expect(registerTutorPet('http://localhost:8080', session, draft, undefined, request, -1)).rejects.toThrow(/Identificador/);
    });
});
