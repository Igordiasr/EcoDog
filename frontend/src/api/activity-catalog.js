import { getJson, validateApiBaseUrl } from './http';
export function createActivityCatalogSource(baseUrl, request = fetch) {
    validateApiBaseUrl(baseUrl);
    return {
        async load(signal) {
            const body = await getJson(baseUrl, '/calendario/catalogo-atividades', signal, request);
            if (!Array.isArray(body))
                throw new Error('Resposta inesperada do catálogo de atividades.');
            const ids = new Set();
            return body.map((row) => {
                if (!row || typeof row !== 'object')
                    throw new Error('Resposta inesperada do catálogo de atividades.');
                const item = row;
                if (item.idAtividadeDoDia !== null || item.horaInicio !== null || item.horaFim !== null || item.situacao !== null
                    || !Number.isSafeInteger(item.idAtividade) || Number(item.idAtividade) <= 0 || Number(item.idAtividade) > 2147483647 || ids.has(Number(item.idAtividade))
                    || typeof item.nome !== 'string' || !item.nome.trim()
                    || !(item.descricao === null || typeof item.descricao === 'string')
                    || !(item.categoria === null || typeof item.categoria === 'string'))
                    throw new Error('Resposta inesperada do catálogo de atividades.');
                ids.add(Number(item.idAtividade));
                return { id: Number(item.idAtividade), name: item.nome, description: item.descricao, category: item.categoria };
            });
        },
    };
}
