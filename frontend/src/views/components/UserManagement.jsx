import { useEffect, useMemo, useRef, useState } from 'react';
import { createUsersApi } from '../../api/users-api';
import { Modal } from './Modal';
import './UserManagement.css';

export function UserManagement({ session, onMenu }) {
    const api = useMemo(() => createUsersApi(import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080', session?.token), [session?.token]);
    const [kind, setKind] = useState('monitores');
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
        setUsers([]); setLoading(true); setError(''); setDraft(null); setRemoving(null);
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
    const finish = (version, message) => {
        if (version !== generation.current) return;
        setDraft(null); setRemoving(null); setMessage(message); setRefresh(value => value + 1);
    };
    const save = event => {
        event.preventDefault();
        if (draft.senha !== draft.confirmation) { setError('Confira a confirmação de senha.'); return; }
        void perform(async version => { await api.save(kind, draft, draft.id); finish(version, 'Usuário salvo com sucesso.'); });
    };
    const labels = { nome: 'Nome', sobrenome: 'Sobrenome', email: 'E-mail', cpf: 'CPF', telefone: 'Telefone', senha: 'Senha', confirmation: 'Confirmação de senha' };
    const filtered = users.filter(user => `${user.nome} ${user.sobrenome} ${user.email} ${user.telefone}`.toLocaleLowerCase('pt-BR').includes(search.toLocaleLowerCase('pt-BR')));
    return <section className="user-management">
        <header><h1>Gerenciamento de usuários</h1><button type="button" onClick={onMenu}>Menu</button></header>
        <div className="user-toolbar">
            <label>Tipo de usuário<select value={kind} disabled={busy} onChange={event => { setKind(event.target.value); setMessage(''); }}><option value="monitores">Monitores</option><option value="administradores">Administradores</option></select></label>
            <label>Pesquisar<input type="search" value={search} onChange={event => setSearch(event.target.value)} placeholder="Nome, e-mail ou telefone" /></label>
            <button type="button" disabled={busy || loading} onClick={() => { setError(''); setDraft({}); }}>Cadastrar usuário</button>
        </div>
        {error && !draft && !removing && <p role="alert">{error} <button type="button" disabled={busy} onClick={() => setRefresh(value => value + 1)}>Tentar novamente</button></p>}
        {message && <p role="status">{message}</p>}
        {loading ? <p role="status">Carregando usuários…</p> : !error && !filtered.length ? <p>Nenhum usuário encontrado.</p> : <div className="user-table"><table><thead><tr><th>Nome</th><th>E-mail</th><th>Telefone</th><th>Status</th><th>Ações</th></tr></thead><tbody>{filtered.map(user => <tr key={user.id}><td>{user.nome} {user.sobrenome}</td><td>{user.email}</td><td>{user.telefone}</td><td>{user.statusUsuario ? 'Ativo' : 'Inativo'}</td><td><button type="button" disabled={busy} onClick={() => void perform(async version => { const data = await api.get(kind, user.id); if (version === generation.current) setDraft({ ...data, cpf: '', senha: '', confirmation: '' }); })}>Editar <span className="sr-only">{user.nome}</span></button><button type="button" disabled={busy} onClick={() => { setError(''); setRemoving(user); }}>Excluir <span className="sr-only">{user.nome}</span></button></td></tr>)}</tbody></table></div>}
        {draft && <Modal title={draft.id ? 'Editar usuário' : 'Cadastrar usuário'} onClose={() => { if (!busy) setDraft(null); }}><form onSubmit={save} className="user-form">
            {draft.id && <p>Informe novamente o CPF e a senha desejada: o backend exige esses campos, mas não os retorna na consulta.</p>}
            {Object.entries(labels).map(([key, label]) => <label key={key}>{label}<input required disabled={busy} name={key} type={key === 'email' ? 'email' : ['senha', 'confirmation'].includes(key) ? 'password' : 'text'} autoComplete={['senha', 'confirmation'].includes(key) ? 'new-password' : 'off'} minLength={['senha', 'confirmation'].includes(key) ? 6 : undefined} maxLength={['senha', 'confirmation'].includes(key) ? kind === 'monitores' ? 255 : 100 : key === 'email' ? 150 : key === 'cpf' ? 14 : key === 'telefone' ? 20 : 120} pattern={key === 'cpf' ? '(?:[0-9]{11}|[0-9]{3}\\.[0-9]{3}\\.[0-9]{3}-[0-9]{2})' : undefined} value={draft[key] || ''} onChange={event => setDraft(value => ({ ...value, [key]: event.target.value }))} /></label>)}
            {error && <p role="alert">{error}</p>}<div><button type="button" disabled={busy} onClick={() => setDraft(null)}>Cancelar</button><button disabled={busy} type="submit">{busy ? 'Salvando…' : 'Salvar'}</button></div>
        </form></Modal>}
        {removing && <Modal title="Excluir usuário" onClose={() => { if (!busy) setRemoving(null); }}><div className="user-form"><p>Excluir {removing.nome} {removing.sobrenome}?</p>{error && <p role="alert">{error}</p>}<div><button type="button" disabled={busy} onClick={() => setRemoving(null)}>Cancelar</button><button type="button" disabled={busy} onClick={() => void perform(async version => { await api.remove(kind, removing.id); finish(version, 'Usuário excluído com sucesso.'); })}>{busy ? 'Excluindo…' : 'Confirmar exclusão'}</button></div></div></Modal>}
    </section>;
}
