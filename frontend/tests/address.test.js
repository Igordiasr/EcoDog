import { beforeEach, describe, expect, it, vi } from 'vitest';
import axios from 'axios';
import { lookupAddress } from '../src/models/address';

vi.mock('axios', () => ({ default: { get: vi.fn(), isCancel: vi.fn(() => false) } }));

describe('Consulta de CEP', () => {
    beforeEach(() => vi.clearAllMocks());

    it('consulta o CEP sem máscara e mapeia o endereço', async () => {
        axios.get.mockResolvedValue({ data: { logradouro: 'Praça da Sé', bairro: 'Sé', localidade: 'São Paulo' } });
        const signal = new AbortController().signal;
        await expect(lookupAddress('01001-000', signal)).resolves.toEqual({ rua: 'Praça da Sé', bairro: 'Sé', cidade: 'São Paulo' });
        expect(axios.get).toHaveBeenCalledWith('https://viacep.com.br/ws/01001000/json/', { signal, timeout: 10000, withCredentials: false });
    });

    it('não consulta CEP incompleto', async () => {
        await expect(lookupAddress('01001')).rejects.toThrow('8 dígitos');
        expect(axios.get).not.toHaveBeenCalled();
    });

    it('informa quando o CEP não existe', async () => {
        axios.get.mockResolvedValue({ data: { erro: true } });
        await expect(lookupAddress('00000000')).rejects.toThrow('CEP não encontrado');
    });

    it('permite preenchimento manual quando a consulta falha', async () => {
        axios.get.mockRejectedValue(new Error('Network Error'));
        await expect(lookupAddress('01001000')).rejects.toThrow('Preencha o endereço manualmente');
    });

    it('aceita CEP sem logradouro ou bairro', async () => {
        axios.get.mockResolvedValue({ data: { localidade: 'São Paulo' } });
        await expect(lookupAddress('01001000')).resolves.toEqual({ rua: '', bairro: '', cidade: 'São Paulo' });
    });
});
