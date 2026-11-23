import { useEffect, useMemo, useRef, useState } from 'react';
import { createUsersApi } from '../../api/users-api';
import { Modal } from './Modal';
import './UserManagement.css';

export function UserManagement({ session }) {
    return <section className="user-management">
        <header className="employee-page-header"><div><h1>Gerenciamento de funcionários</h1><p>Confira os cadastros e gerencie cada usuário com facilidade.</p></div></header>
        <div className="employee-lists">
            <EmployeeList session={session} kind="monitores" title="Monitores" singular="monitor" />
            <EmployeeList session={session} kind="administradores" title="Administradores" singular="administrador" />
        </div>
    </section>;
}

function EmployeeList({ session, kind, title, singular }) {
    const api = useMemo(() => createUsersApi(import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080', session?.token), [session?.token]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [search, setSearch] = useState('');
    const [refresh, setRefresh] = useState(0);
    const [draft, setDraft] = useState(null);
    const [visiblePasswords, setVisiblePasswords] = useState({});
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
    const labels = { nome: 'Nome', email: 'E-mail', sobrenome: 'Sobrenome', telefone: 'Telefone', cpf: 'CPF', senha: 'Senha', confirmation: 'Confirmação de senha' };
    const placeholders = { nome: 'Informe o nome', sobrenome: 'Informe o sobrenome', email: 'nome@exemplo.com', telefone: '(00)00000-0000', cpf: '000.000.000-00', senha: 'Digite a senha', confirmation: 'Digite a senha novamente' };
    const filtered = users.filter(user => `${user.nome} ${user.sobrenome} ${user.email} ${user.telefone}`.toLocaleLowerCase('pt-BR').includes(search.toLocaleLowerCase('pt-BR')));
    return <section className="employee-list" aria-labelledby={`employees-${kind}`}>
        <h2 className="sr-only" id={`employees-${kind}`}>{title}</h2>
        <div className="user-toolbar">
            <button className="employee-create" type="button" disabled={busy} onClick={() => { setError(''); setMessage(''); setVisiblePasswords({}); setDraft({}); }}><span aria-hidden="true">＋</span> Criar {singular === 'monitor' ? 'Monitor' : 'Administrador'}</button>
            {!loading && !error && <span className="employee-count">{users.length} {users.length === 1 ? 'registro' : 'registros'}</span>}
            <label className="employee-search"><span className="sr-only">Pesquisar {kind}</span><input type="search" value={search} onChange={event => setSearch(event.target.value)} placeholder={`Pesquisar ${kind}`} /></label>
        </div>
        {error && !draft && !removing && <p role="alert">{error} <button type="button" disabled={busy} onClick={() => setRefresh(value => value + 1)}>Tentar novamente</button></p>}
        {message && <p role="status">{message}</p>}
        <div className="employee-card">
            {loading ? <p role="status">Carregando {kind}…</p> : !error && !filtered.length ? <p>{search ? `Nenhum ${singular} encontrado para esta pesquisa.` : `Nenhum ${singular} cadastrado.`}</p> : <div className="user-table" role="region" aria-label={`Lista de ${kind}`} tabIndex={0}>
                <table aria-label={title}><thead><tr><th>Nome</th><th>E-mail</th><th>Telefone</th><th>Ativo</th><th>Ações</th><th>Data de registro</th></tr></thead>
                    <tbody>{filtered.map((user, index) => <tr key={user.id}>
                        <td><div className="employee-name"><span className="employee-number" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span><span>{user.nome} {user.sobrenome}</span></div></td>
                        <td>{user.email}</td><td>{formatPhone(user.telefone)}</td>
                        <td><span className="employee-status"><span className={`employee-status-track${user.statusUsuario ? ' is-active' : ''}`} aria-hidden="true" />{user.statusUsuario ? 'Sim' : 'Não'}</span></td>
                        <td><div className="employee-actions"><button type="button" disabled={busy} onClick={() => void perform(async version => { const data = await api.get(kind, user.id); if (version === generation.current) { setVisiblePasswords({}); setDraft({ ...user, ...data, confirmation: data.senha || '' }); } })}><svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m16 3 5 5-12 12-6 1 1-6Z" /><path d="m14 5 5 5" /></svg>Editar <span className="sr-only">{user.nome}</span></button><button type="button" disabled={busy || !user.statusUsuario} onClick={() => { setError(''); setRemoving(user); }}>Desativar <span className="sr-only">{user.nome}</span></button></div></td>
                        <td>{formatRegistrationDate(user.dataRegistro)}</td>
                    </tr>)}</tbody>
                </table>
            </div>}
            {!loading && !error && <p className="employee-table-summary">Mostrando {filtered.length} de {users.length} {users.length === 1 ? 'registro' : 'registros'}.</p>}
        </div>
        {draft && <Modal className="employee-user-modal" title={draft.id ? 'Editar usuário' : 'Criar usuário'} onClose={() => { if (!busy) setDraft(null); }}><form onSubmit={save} className="user-form employee-user-form">
            <h2>{draft.id ? 'Editar usuário' : 'Criar usuário'}</h2>
            <p>{draft.id ? 'Atualize as informações do usuário abaixo.' : 'Vamos cadastrar um novo usuário? Preencha os dados abaixo.'}</p>
            <div className="employee-form-fields">{Object.entries(labels).map(([key, label]) => {
                const password = ['senha', 'confirmation'].includes(key);
                return <label key={key} className={key === 'sobrenome' ? 'employee-surname-field' : undefined}>{label}<span className="employee-input-wrap"><input required disabled={busy} name={key} placeholder={placeholders[key]} type={key === 'email' ? 'email' : password ? visiblePasswords[key] ? 'text' : 'password' : key === 'telefone' ? 'tel' : 'text'} autoComplete={password ? 'new-password' : 'off'} minLength={password ? 6 : undefined} maxLength={password ? kind === 'monitores' ? 255 : 100 : key === 'email' ? 150 : key === 'cpf' ? 14 : key === 'telefone' ? 20 : 120} pattern={key === 'cpf' ? '(?:[0-9]{11}|[0-9]{3}\\.[0-9]{3}\\.[0-9]{3}-[0-9]{2})' : undefined} value={draft[key] || ''} onChange={event => setDraft(value => ({ ...value, [key]: event.target.value }))} />{password && <button type="button" className="employee-password-toggle" disabled={busy} aria-label={`${visiblePasswords[key] ? 'Ocultar' : 'Mostrar'} ${label.toLocaleLowerCase('pt-BR')}`} aria-pressed={!!visiblePasswords[key]} onClick={() => setVisiblePasswords(value => ({ ...value, [key]: !value[key] }))}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>{!visiblePasswords[key] && <path d="m3 3 18 18"/>}</svg></button>}</span></label>;
            })}</div>
            {error && <p role="alert">{error}</p>}<div className="employee-form-actions"><button className="employee-submit" disabled={busy} type="submit">{!draft.id && <span aria-hidden="true">＋</span>}{busy ? 'Salvando…' : draft.id ? 'Salvar alterações' : 'Criar'}</button><button type="button" disabled={busy} onClick={() => setDraft(null)}>Cancelar</button></div>
        </form></Modal>}
        {removing && <Modal title={`Desativar ${singular}`} onClose={() => { if (!busy) setRemoving(null); }}><div className="user-form"><p>Desativar {removing.nome} {removing.sobrenome}? O cadastro será mantido como inativo.</p>{error && <p role="alert">{error}</p>}<div><button type="button" disabled={busy} onClick={() => setRemoving(null)}>Cancelar</button><button type="button" disabled={busy} onClick={() => void perform(async version => { await api.remove(kind, removing.id); finish(version, 'Funcionário desativado com sucesso.'); })}>{busy ? 'Desativando…' : 'Confirmar desativação'}</button></div></div></Modal>}
    </section>;
}

function formatPhone(value) {
    const digits = String(value || '').replace(/\D/g, '');
    return /^(\d{10}|\d{11})$/.test(digits) ? digits.replace(/^(\d{2})(\d{4,5})(\d{4})$/, '($1)$2-$3') : value || '—';
}

function formatRegistrationDate(value) {
    const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value || '');
    return match ? `${match[3]}/${match[2]}/${match[1]}` : '—';
}
