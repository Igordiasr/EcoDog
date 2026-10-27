import { getJson } from './http';
const categories = ['CRECHE', 'HOTEL', 'DAYUSE'];
const record = (value) => {
    if (!value || typeof value !== 'object' || Array.isArray(value))
        throw new Error('Resposta inválida do calendário.');
    return value;
};
const list = (value) => {
    if (!Array.isArray(value))
        throw new Error('Lista inválida do calendário.');
    return value;
};
export function categoryForService(service) {
    if (service === 'Creche')
        return 'CRECHE';
    if (service === 'DayUse')
        return 'DAYUSE';
    if (service === 'Hotel')
        return 'HOTEL';
    throw new Error('Categoria de serviço desconhecida.');
}
export async function loadActiveServices(baseUrl, category, signal, request) {
    const query = new URLSearchParams({ categoria: category });
    return list(await getJson(baseUrl, `/calendario/servicos?${query}`, signal, request)).map(item => {
        const r = record(item);
        if (!Number.isSafeInteger(r.id) || Number(r.id) <= 0 || typeof r.nome !== 'string' || r.categoria !== category || !Number.isFinite(r.valor))
            throw new Error('Serviço inválido retornado pela API.');
        return { id: Number(r.id), nome: r.nome, categoria: category, modalidade: String(r.modalidade ?? ''), frequencia: String(r.frequencia ?? ''), valor: Number(r.valor) };
    });
}
export async function loadBookingAvailability(baseUrl, category, year, month, signal, request) {
    const query = new URLSearchParams({ servico: category, ano: String(year), mes: String(month) });
    return list(await getJson(baseUrl, `/calendario/disponibilidade?${query}`, signal, request)).map(item => {
        const r = record(item);
        if (typeof r.data !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(r.data) || r.categoriaServico !== category || !Number.isSafeInteger(r.capacidadeTotal) || Number(r.capacidadeTotal) < 0 || !Number.isSafeInteger(r.vagasDisponiveis) || Number(r.vagasDisponiveis) < 0)
            throw new Error('Disponibilidade inválida retornada pela API.');
        return { data: r.data, categoriaServico: category, capacidadeTotal: Number(r.capacidadeTotal), vagasDisponiveis: Number(r.vagasDisponiveis) };
    });
}
