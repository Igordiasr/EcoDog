import axios from 'axios';

export async function lookupAddress(cep, signal) {
    const digits = cep.replace(/\D/g, '');
    if (!/^\d{8}$/.test(digits)) throw new Error('Informe um CEP válido com 8 dígitos.');
    let data;
    try {
        ({ data } = await axios.get(`https://viacep.com.br/ws/${digits}/json/`, { signal, timeout: 10000, withCredentials: false }));
    } catch (error) {
        if (signal?.aborted || axios.isCancel(error)) throw error;
        throw new Error('Não foi possível consultar o CEP. Preencha o endereço manualmente.');
    }
    if (data?.erro) throw new Error('CEP não encontrado. Confira o CEP ou preencha o endereço manualmente.');
    if (!data || typeof data.localidade !== 'string') throw new Error('Não foi possível consultar o CEP. Preencha o endereço manualmente.');
    return { rua: data.logradouro || '', bairro: data.bairro || '', cidade: data.localidade };
}
