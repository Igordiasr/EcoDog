import { useEffect, useState } from 'react';
import { createActivityCatalogSource, type ActivityCatalogItem } from '../services/activity-catalog';

export function ActivityCatalogDetails({ close, baseUrl = import.meta.env.VITE_API_BASE_URL }: { close(): void; baseUrl?: string }) {
  const [items, setItems] = useState<ActivityCatalogItem[] | null>(null);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    setItems(null); setError('');
    if (!baseUrl) return;
    const controller = new AbortController();
    async function load() {
      try {
        const result = await createActivityCatalogSource(baseUrl!).load(controller.signal);
        if (!controller.signal.aborted) setItems(result);
      } catch (cause) {
        if (!controller.signal.aborted) setError(cause instanceof TypeError ? 'Não foi possível acessar a API. Verifique a conexão e a configuração de CORS.' : cause instanceof Error ? cause.message : 'Não foi possível consultar o catálogo.');
      }
    }
    void load();
    return () => controller.abort();
  }, [baseUrl, attempt]);
  return <div className="dialog-content"><h2>Catálogo de atividades</h2>
    <p>Consulta ao catálogo do sistema. As fotografias da página são institucionais e não identificam registros deste catálogo.</p>
    {!baseUrl ? <p role="status">Consulta não configurada. Os detalhes dependem da integração com o sistema.</p>
      : error ? <><p role="alert">{error}</p><button type="button" onClick={() => setAttempt(value => value + 1)}>Tentar novamente</button></>
      : items === null ? <p role="status">Carregando atividades…</p>
      : items.length === 0 ? <p role="status">Nenhuma atividade cadastrada.</p>
      : <ul>{items.map(item => <li key={item.id}><h3>{item.name}</h3>{item.category && <p>{item.category}</p>}{item.description && <p>{item.description}</p>}</li>)}</ul>}
    <button type="button" onClick={close}>Voltar</button>
  </div>;
}
