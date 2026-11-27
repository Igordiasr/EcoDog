import { useEffect, useState } from 'react';
import { createDashboardApi } from '../../api/dashboard-api';
import './AdminPlanServices.css';

const money = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const display = value => typeof value === 'string' && value.trim() ? value : 'Não informado';

export function AdminPlanServices({ session }) {
    const [state, setState] = useState({ loading: true, services: [], error: '' });
    const [retry, setRetry] = useState(0);
    const [search, setSearch] = useState('');

    useEffect(() => {
        const controller = new AbortController();
        setState({ loading: true, services: [], error: '' });
        if (!session?.token || session.profile !== 'admin') {
            setState({ loading: false, services: [], error: 'Sessão administrativa necessária para consultar os serviços.' });
            return () => controller.abort();
        }
        const api = createDashboardApi(import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080', undefined, session.token);
        api.services(controller.signal)
            .then(services => { if (!controller.signal.aborted) setState({ loading: false, services, error: '' }); })
            .catch(() => { if (!controller.signal.aborted) setState({ loading: false, services: [], error: 'Não foi possível consultar os serviços. Tente novamente.' }); });
        return () => controller.abort();
    }, [session?.token, session?.profile, retry]);

    const filtered = state.services.filter(service => [service.nome, service.categoria, service.modalidade].some(value => typeof value === 'string' && value.toLocaleLowerCase('pt-BR').includes(search.trim().toLocaleLowerCase('pt-BR'))));
    return <section className="admin-services" aria-label="Serviços cadastrados">
        <div className="admin-services-tools"><div><h2>Serviços cadastrados</h2><p>A consulta inclui todas as modalidades, inclusive serviços que não são planos.</p></div><label><span className="sr-only">Buscar serviços</span><input type="search" placeholder="Buscar por nome, categoria ou modalidade" value={search} onChange={event => setSearch(event.target.value)} /></label></div>
        {state.loading ? <p className="admin-services-message" role="status">Carregando serviços…</p> : state.error ? <div className="admin-services-message" role="alert"><p>{state.error}</p><button type="button" onClick={() => setRetry(value => value + 1)}>Tentar novamente</button></div> : !filtered.length ? <p className="admin-services-message">{search.trim() ? 'Nenhum serviço encontrado para esta busca.' : 'Nenhum serviço cadastrado.'}</p> : <div className="admin-services-table"><table><thead><tr><th scope="col">Nome</th><th scope="col">Categoria</th><th scope="col">Modalidade</th><th scope="col">Frequência</th><th scope="col">Valor</th><th scope="col">Situação</th></tr></thead><tbody>{filtered.map(service => <tr key={service.idServico}><td data-label="Nome">{display(service.nome)}</td><td data-label="Categoria">{display(service.categoria)}</td><td data-label="Modalidade">{display(service.modalidade)}</td><td data-label="Frequência">{display(service.frequencia)}</td><td data-label="Valor">{typeof service.valor === 'number' && Number.isFinite(service.valor) && service.valor >= 0 ? money.format(service.valor) : 'Não informado'}</td><td data-label="Situação"><span className={`admin-service-status ${service.status === true ? 'is-active' : ''}`}>{service.status === true ? 'Ativo' : service.status === false ? 'Inativo' : 'Não informada'}</span></td></tr>)}</tbody></table></div>}
        {!state.loading && !state.error && <p className="admin-services-count">Mostrando {filtered.length} de {state.services.length} {state.services.length === 1 ? 'serviço' : 'serviços'}.</p>}
    </section>;
}
