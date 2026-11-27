import { useEffect, useMemo, useRef, useState } from 'react';
import { createUsersApi } from '../../api/users-api';
import { Modal } from './Modal';
import './UserManagement.css';

const labels = { nome: 'Nome', sobrenome: 'Sobrenome', email: 'E-mail', cpf: 'CPF', telefone: 'Telefone', senha: 'Senha', confirmation: 'Confirmação de senha' };

function UserList({ api, kind, title, singular }) {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [search, setSearch] = useState('');
    const [refresh, setRefresh] = useState(0);
    const [draft, setDraft] = useState(null);
    const [removing, setRemoving] = useState(null);
    const lock = useRef(false);
    const generation = useRef(0);

    useEffect(() => {
        const controller = new AbortController();
        ++generation.current;
        setUsers([]); setLoading(true); setError('');
        api.list(kind, controller.signal).then(data => { if (!controller.signal.aborted) setUsers(data); })
            .catch(error => { if (!controller.signal.aborted) setError(error.message); })
            .finally(() => { if (!controller.signal.aborted) setLoading(false); });
        return () => { controller.abort(); ++generation.current; };
    }, [api, kind, refresh]);

    const perform = async action => {
        if (lock.current) return;
        const version = generation.current;
        lock.current = true; setBusy(true); setError(''); setMessage('');
        try { await action(version); }
        catch (error) { if (version === generation.current) setError([error.message, ...Object.values(error.fields || {})].join(' ')); }
        finally { lock.current = false; setBusy(false); }
    };
    const finish = (version, successMessage) => {
        if (version !== generation.current) return;
        setDraft(null); setRemoving(null); setMessage(successMessage); setRefresh(value => value + 1);
    };
    const save = event => {
        event.preventDefault();
        if (draft.senha !== draft.confirmation) { setError('Confira a confirmação de senha.'); return; }
        void perform(async version => { await api.save(kind, draft, draft.id); finish(version, 'Usuário salvo com sucesso.'); });
    };
    const filtered = users.filter(user => `${user.nome || ''} ${user.sobrenome || ''} ${user.email || ''} ${user.telefone || ''}`.toLocaleLowerCase('pt-BR').includes(search.trim().toLocaleLowerCase('pt-BR')));

    return <section className="user-list" aria-labelledby={`${kind}-title`}>
        <div className="user-list-heading">
            <div><h2 id={`${kind}-title`}>{title}</h2><p>Gerencie os cadastros de {title.toLocaleLowerCase('pt-BR')}.</p></div>
            <button className="user-primary-button" type="button" disabled={busy || loading} onClick={() => { setError(''); setDraft({}); }}>+ Criar {singular}</button>
        </div>
        <div className="user-list-card">
            <div className="user-list-tools">
                <p>{loading ? 'Buscando registros…' : `${users.length} ${users.length === 1 ? 'registro' : 'registros'}`}</p>
                <label className="user-search"><span className="sr-only">Pesquisar {title.toLocaleLowerCase('pt-BR')}</span><input type="search" value={search} onChange={event => setSearch(event.target.value)} placeholder="Buscar por nome, e-mail ou telefone" /></label>
            </div>
            {error && !draft && !removing && <div className="user-notice user-error" role="alert">{error} <button type="button" disabled={busy} onClick={() => setRefresh(value => value + 1)}>Tentar novamente</button></div>}
            {message && <p className="user-notice" role="status">{message}</p>}
            {loading ? <p className="user-empty" role="status">Carregando {title.toLocaleLowerCase('pt-BR')}…</p> : !error && !filtered.length ? <p className="user-empty">{search ? 'Nenhum usuário encontrado para esta busca.' : `Nenhum ${singular.toLocaleLowerCase('pt-BR')} cadastrado.`}</p> : !error && <div className="user-table"><table><thead><tr><th scope="col">Nome</th><th scope="col">E-mail</th><th scope="col">Telefone</th><th scope="col">Status</th><th scope="col">Ações</th></tr></thead><tbody>{filtered.map(user => <tr key={user.id}><td data-label="Nome" className="user-name">{user.nome} {user.sobrenome}</td><td data-label="E-mail">{user.email || '—'}</td><td data-label="Telefone">{user.telefone || '—'}</td><td data-label="Status"><span className={`user-status ${user.statusUsuario === true ? 'is-active' : ''}`}>{user.statusUsuario === true ? 'Ativo' : user.statusUsuario === false ? 'Inativo' : 'Não informado'}</span></td><td data-label="Ações"><div className="user-actions"><button type="button" disabled={busy} onClick={() => void perform(async version => { const data = await api.get(kind, user.id); if (version === generation.current) setDraft({ ...data, cpf: '', senha: '', confirmation: '' }); })}>Editar <span className="sr-only">{user.nome}</span></button><button type="button" disabled={busy} onClick={() => { setError(''); setRemoving(user); }}>Excluir <span className="sr-only">{user.nome}</span></button></div></td></tr>)}</tbody></table></div>}
            {!loading && !error && users.length > 0 && <p className="user-list-footer">Mostrando {filtered.length} de {users.length} {users.length === 1 ? 'registro' : 'registros'}</p>}
        </div>
        {draft && <Modal title={draft.id ? 'Editar usuário' : `Criar ${singular}`} onClose={() => { if (!busy) setDraft(null); }}><form onSubmit={save} className="user-form">
            <h2>{draft.id ? 'Editar usuário' : `Criar ${singular}`}</h2>
            {draft.id && <p>Informe novamente o CPF e a senha desejada: o backend exige esses campos, mas não os retorna na consulta.</p>}
            {Object.entries(labels).map(([key, label]) => <label key={key}>{label}<input required disabled={busy} name={key} type={key === 'email' ? 'email' : ['senha', 'confirmation'].includes(key) ? 'password' : 'text'} autoComplete={['senha', 'confirmation'].includes(key) ? 'new-password' : 'off'} minLength={['senha', 'confirmation'].includes(key) ? 6 : undefined} maxLength={['senha', 'confirmation'].includes(key) ? kind === 'monitores' ? 255 : 100 : key === 'email' ? 150 : key === 'cpf' ? 14 : key === 'telefone' ? 20 : 120} pattern={key === 'cpf' ? '(?:[0-9]{11}|[0-9]{3}\\.[0-9]{3}\\.[0-9]{3}-[0-9]{2})' : undefined} value={draft[key] || ''} onChange={event => setDraft(value => ({ ...value, [key]: event.target.value }))} /></label>)}
            {error && <p role="alert">{error}</p>}<div className="user-form-actions"><button type="button" disabled={busy} onClick={() => setDraft(null)}>Cancelar</button><button className="user-primary-button" disabled={busy} type="submit">{busy ? 'Salvando…' : 'Salvar'}</button></div>
        </form></Modal>}
        {removing && <Modal title="Excluir usuário" onClose={() => { if (!busy) setRemoving(null); }}><div className="user-form"><h2>Excluir usuário</h2><p>Excluir {removing.nome} {removing.sobrenome}?</p>{error && <p role="alert">{error}</p>}<div className="user-form-actions"><button type="button" disabled={busy} onClick={() => setRemoving(null)}>Cancelar</button><button className="user-primary-button" type="button" disabled={busy} onClick={() => void perform(async version => { await api.remove(kind, removing.id); finish(version, 'Usuário excluído com sucesso.'); })}>{busy ? 'Excluindo…' : 'Confirmar exclusão'}</button></div></div></Modal>}
    </section>;
}

export function UserManagement({ session, onMenu }) {
    const api = useMemo(() => createUsersApi(import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080', session?.token), [session?.token]);
    return <div className="user-management">
        <header className="user-management-header"><button type="button" className="user-menu-button" onClick={onMenu} aria-label="Abrir menu"><span aria-hidden="true">☰</span></button><span className="user-brand">EcoDog Park</span><span className="user-profile">Administração <span aria-hidden="true">A</span></span></header>
        <div className="user-management-content">
            <div className="user-intro"><p>Área administrativa</p><h1>Gerenciamento de funcionários</h1><span>Confira os cadastros e gerencie cada usuário com facilidade.</span></div>
            <UserList api={api} kind="monitores" title="Monitores" singular="Monitor" />
            <UserList api={api} kind="administradores" title="Administradores" singular="Administrador" />
        </div>
        <footer className="user-management-footer"><span>EcoDog Park</span><span>Carinho em cada auventura.</span></footer>
    </div>;
}
