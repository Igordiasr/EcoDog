import { getJson } from './http';

export interface ActivityCatalogItem {
  id: number; name: string; description: string | null; category: string | null;
}
export interface ActivityCatalogSource { load(signal?: AbortSignal): Promise<ActivityCatalogItem[]> }

export function createActivityCatalogSource(baseUrl: string, request: typeof fetch = fetch): ActivityCatalogSource {
  const url = new URL(baseUrl);
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || url.search || url.hash) throw new Error('URL da API inválida.');
  return {
    async load(signal) {
      const body = await getJson(baseUrl, '/calendario/catalogo-atividades', signal, request);
      if (!Array.isArray(body)) throw new Error('Resposta inesperada do catálogo de atividades.');
      const ids = new Set<number>();
      return body.map((row: unknown) => {
        if (!row || typeof row !== 'object') throw new Error('Resposta inesperada do catálogo de atividades.');
        const item = row as Record<string, unknown>;
        if (item.idAtividadeDoDia !== null || item.horaInicio !== null || item.horaFim !== null || item.situacao !== null
          || !Number.isSafeInteger(item.idAtividade) || Number(item.idAtividade) <= 0 || ids.has(Number(item.idAtividade))
          || typeof item.nome !== 'string' || !item.nome.trim()
          || !(item.descricao === null || typeof item.descricao === 'string')
          || !(item.categoria === null || typeof item.categoria === 'string')) throw new Error('Resposta inesperada do catálogo de atividades.');
        ids.add(Number(item.idAtividade));
        return { id: Number(item.idAtividade), name: item.nome, description: item.descricao, category: item.categoria };
      });
    },
  };
}
