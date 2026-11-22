import { describe, expect, it, vi } from 'vitest';
import { createAuthViewModel, registrationData, registrationAddressData } from '../src/viewmodels/auth';

const fields = {
    nome: '  Maria  ', sobrenome: '  da Silva  ', 'e-mail': 'maria@example.com',
    cpf: '529.982.247-25', telefone: '(11) 91234-5678', senha: 'Senha123!',
    'confirmacao-de-senha': 'Senha123!', cep: '01001-000', rua: 'Praça da Sé',
    numero: '10', complemento: '  Apartamento 12  ', bairro: 'Sé', cidade: 'São Paulo',
};

describe('Cadastro de tutor', () => {
    it('mantém nome e sobrenome separados sem espaços nas extremidades', () => {
        expect(registrationData(fields)).toMatchObject({ nome: 'Maria', sobrenome: 'da Silva' });
    });

    it.each(['nome', 'sobrenome'])('exige o campo %s', key => {
        expect(() => registrationData({ ...fields, [key]: '   ' })).toThrow('Informe seu nome e sobrenome.');
    });

    it.each(['nome', 'sobrenome'])('valida o limite do campo %s enviado à API', key => {
        expect(() => registrationData({ ...fields, [key]: 'a'.repeat(121) })).toThrow('Confira o nome');
    });

    it('envia nome e sobrenome separados, preservando os demais dados', async () => {
        const api = { register: vi.fn().mockResolvedValue({ id: 1 }) };
        await createAuthViewModel(api).register(fields);
        expect(api.register).toHaveBeenCalledWith({
            nome: 'Maria', sobrenome: 'da Silva', email: 'maria@example.com', cpf: '52998224725',
            telefone: '11912345678', senha: 'Senha123!',
            endereco: { cep: '01001000', rua: 'Praça da Sé', numero: '10', complemento: 'Apartamento 12', bairro: 'Sé', cidade: 'São Paulo' },
        });
    });
    it('permite cadastro sem complemento', () => {
        expect(registrationAddressData({ ...fields, complemento: undefined }).complemento).toBe('');
    });
});
