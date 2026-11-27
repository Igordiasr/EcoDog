import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createAuthViewModel, registrationData, registrationAddressData } from '../../viewmodels/auth';
import { loadCurrentUser, updateCurrentTutor, updateTutorPassword } from '../../models/current-user';
import { lookupAddress } from '../../models/address';
import { Menu } from '../components/Menu';
import { screens } from './catalog';
import { StandaloneEcoMigo } from '../components/StandaloneEcoMigo';

export function RegistrationPage({ api }) {
    const [fields, setFields] = useState({}), [step, setStep] = useState(0), [busy, setBusy] = useState(false), [error, setError] = useState('');
    const inFlight = useRef(false), navigate = useNavigate(), heading = useRef(null);
    const [menuOpen, setMenuOpen] = useState(false);
    const [addressStatus, setAddressStatus] = useState('');
    const cep = (fields.cep || '').replace(/\D/g, '');
    useEffect(() => {
        setAddressStatus('');
        if (step !== 1 || cep.length !== 8) return;
        const controller = new AbortController();
        const timer = setTimeout(() => {
            setAddressStatus('Consultando CEP…');
            lookupAddress(cep, controller.signal).then(address => {
                if (controller.signal.aborted) return;
                setFields(values => (values.cep || '').replace(/\D/g, '') === cep ? { ...values, ...address } : values);
                setAddressStatus('Endereço preenchido. Confira os dados e informe o número.');
            }).catch(error => {
                if (!controller.signal.aborted) setAddressStatus(error.message);
            });
        }, 300);
        return () => { clearTimeout(timer); controller.abort(); };
    }, [cep, step]);
    useEffect(() => { heading.current?.focus(); }, [step]);
    const submit = async event => {
        event.preventDefault();
        if (inFlight.current) return;
        try { registrationData(fields); } catch (error) { setError(error.message); setStep(0); return; }
        setError('');
        if (step === 0) { setStep(1); return; }
        try { registrationAddressData(fields); } catch (error) { setError(error.message); return; }
        inFlight.current = true; setBusy(true);
        try {
            await createAuthViewModel(api).register(fields);
            navigate('/entrar', { state: { message: 'Cadastro realizado! Entre com seu e-mail e senha.' } });
        } catch (error) { setError(error.message); }
        finally { inFlight.current = false; setBusy(false); }
    };
    return <div className="registration-page">
        <header className="registration-header"><button type="button" aria-label="Abrir menu" aria-expanded={menuOpen} onClick={() => setMenuOpen(value => !value)}><img src="/design-assets/1c5a79b14e9a0b05.svg" alt=""/></button><Link className="registration-brand" to="/">EcoDog Park</Link></header>
        {menuOpen && <Menu current="TL04" profile="public" go={id => navigate(screens.find(screen => screen.id === id).path)} close={() => setMenuOpen(false)}/>}
        <main className="registration-content"><div className="registration-card">
        <div className="registration-photo" role="img" aria-label="Aumigo EcoDog Park"/>
        <section className="account-page registration-form"><div className="registration-title"><span className="registration-eyebrow">SUA CONTA</span><h1 ref={heading} tabIndex={-1}>Cadastro</h1><p>Preencha os dados abaixo para criar sua conta.</p></div>
        <div className="registration-progress"><p role="status">Etapa {step + 1} de 2 • {step === 0 ? 'Dados pessoais e acesso' : 'Endereço'}</p><div className="registration-progress-bars" aria-hidden="true"><span className="active"/><span className={step === 1 ? 'active' : ''}/></div></div>
        <form onSubmit={submit}>
            <fieldset disabled={busy} className={step === 1 ? 'address-fields' : ''}><legend className="sr-only">{step === 0 ? 'Dados pessoais e acesso' : 'Endereço'}</legend>{(step === 0 ? [
                ['nome', 'Nome', 'text', 'Seu nome', 'given-name'], ['sobrenome', 'Sobrenome', 'text', 'Seu sobrenome', 'family-name'], ['e-mail', 'E-mail', 'email', 'seuemail@exemplo.com', 'email'], ['telefone', 'Telefone com DDD', 'tel', '(11) 91234-5678', 'tel'], ['cpf', 'CPF', 'text', '000.000.000-00', 'off'], ['senha', 'Senha', 'password', 'No mínimo 6 caracteres', 'new-password'], ['confirmacao-de-senha', 'Confirmação de senha', 'password', 'Repita sua senha', 'new-password'],
            ] : [
                ['cep', 'CEP', 'text', '00000-000', 'postal-code'], ['rua', 'Rua / Logradouro', 'text', 'Nome da sua rua', 'address-line1'], ['numero', 'Número', 'text', '123 ou S/N', 'off'], ['complemento', 'Complemento (opcional)', 'text', 'Apartamento, bloco, casa etc.', 'address-line2'], ['bairro', 'Bairro', 'text', 'Seu bairro', 'address-level3'], ['cidade', 'Cidade', 'text', 'Sua cidade', 'address-level2'],
            ]).map(([key, label, type, placeholder, autoComplete]) => <label key={key}>{label}<input className="design-input" name={key} type={type} placeholder={placeholder} autoComplete={autoComplete} required={key !== 'complemento'} maxLength={key === 'numero' ? 10 : key === 'cep' ? 9 : undefined} inputMode={['cep', 'cpf'].includes(key) ? 'numeric' : undefined} value={fields[key] || ''} onChange={event => {
                const value = key === 'cep' ? event.target.value.replace(/\D/g, '').slice(0, 8).replace(/^(\d{5})(\d)/, '$1-$2') : event.target.value;
                setFields(values => ({ ...values, [key]: value }));
            }}/></label>)}</fieldset>
            {step === 1 && addressStatus && <p role="status">{addressStatus}</p>}
            {error && <p role="alert">{error}</p>}
            <div className="dialog-actions">{step > 0 && <button type="button" disabled={busy} onClick={() => { setStep(0); setError(''); }}>Voltar</button>}<button type="submit" disabled={busy}>{busy ? 'Cadastrando…' : step === 0 ? 'Avançar' : 'Concluir cadastro'}</button></div>
        </form><Link to="/entrar">Voltar ao login</Link>
        </section></div></main><StandaloneEcoMigo/>
    </div>;
}

export function ForgotPasswordPage() {
    const [email, setEmail] = useState(''), [message, setMessage] = useState('');
    const [menuOpen, setMenuOpen] = useState(false), navigate = useNavigate();
    return <div className="forgot-password-page">
        <header className="registration-header"><button type="button" aria-label="Abrir menu" aria-expanded={menuOpen} onClick={() => setMenuOpen(value => !value)}><img src="/design-assets/1c5a79b14e9a0b05.svg" alt=""/></button><Link className="registration-brand" to="/">EcoDog Park</Link></header>
        {menuOpen && <Menu current="TL02" profile="public" go={id => navigate(screens.find(screen => screen.id === id).path)} close={() => setMenuOpen(false)}/>}
        <main className="forgot-password-content"><div className="forgot-password-card">
            <section className="account-page forgot-password-form" aria-labelledby="forgot-password-title">
                <div className="forgot-password-intro"><span>RECUPERE SEU ACESSO</span><h1 id="forgot-password-title">Esqueci minha senha</h1><p>Tudo bem, aumigo! Informe o e-mail da sua conta para recuperar seu acesso.</p></div>
                <form onSubmit={event => { event.preventDefault(); setMessage('Recuperação indisponível. Nenhum e-mail foi enviado.'); }}>
                    <label>E-mail<input className="design-input" name="email" type="email" placeholder="seuemail@exemplo.com" required autoComplete="email" aria-describedby="forgot-password-notice" value={email} onChange={event => setEmail(event.target.value)}/></label>
                    <div className="forgot-password-actions"><button type="submit">Enviar link de recuperação</button><Link to="/entrar">Voltar para entrar</Link></div>
                </form>
                <div className="forgot-password-notice" id="forgot-password-notice"><h2>Recuperação de acesso</h2><p>O envio de recuperação de senha ainda não está disponível neste sistema.</p><p>Nenhum e-mail será enviado por enquanto.</p></div>
                {message && <p className="forgot-password-status" role="status">{message}</p>}
            </section>
            <div className="forgot-password-photo" role="img" aria-label="Aumigo EcoDog Park"/>
        </div></main><StandaloneEcoMigo/>
    </div>;
}

export function MyProfile({ session, onLogout, onClose }) {
    const [state, setState] = useState({ loading: true }), [attempt, setAttempt] = useState(0);
    const [tab, setTab] = useState('dados'), [fields, setFields] = useState({}), [password, setPassword] = useState({});
    const [cepChanged, setCepChanged] = useState(false), [addressStatus, setAddressStatus] = useState('');
    const [busy, setBusy] = useState(false), [message, setMessage] = useState(''), [error, setError] = useState('');
    const fieldsRef = useRef(fields), saving = useRef(false);
    fieldsRef.current = fields;
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
    const isTutor = session?.profile === 'tutor';
    useEffect(() => {
        const controller = new AbortController(); setState({ loading: true });
        loadCurrentUser(baseUrl, session, controller.signal)
            .then(user => { if (!controller.signal.aborted) { setState({ user }); setFields({ ...user, ...(user.endereco || {}) }); } })
            .catch(error => { if (!controller.signal.aborted) { setState({ error: error.message, status: error.status }); if (error.status === 401) void onLogout(); } });
        return () => controller.abort();
    }, [session?.token, session?.id, session?.profile, attempt, baseUrl]);
    const cep = (fields.cep || '').replace(/\D/g, '');
    useEffect(() => {
        setAddressStatus('');
        if (!isTutor || tab !== 'dados' || !cepChanged || cep.length !== 8) return;
        const controller = new AbortController();
        setAddressStatus('Consultando CEP…');
        const timer = setTimeout(() => {
            const original = fieldsRef.current;
            lookupAddress(cep, controller.signal).then(address => {
                if (controller.signal.aborted) return;
                setFields(values => {
                    if ((values.cep || '').replace(/\D/g, '') !== cep) return values;
                    const changes = Object.fromEntries(Object.entries(address).filter(([key]) => values[key] === original[key]));
                    return { ...values, ...changes };
                });
                setAddressStatus('Endereço consultado. Confira os dados e informe o número.');
            }).catch(error => { if (!controller.signal.aborted) setAddressStatus(error.message); });
        }, 300);
        return () => { clearTimeout(timer); controller.abort(); };
    }, [cep, cepChanged, tab, isTutor]);
    const save = async event => {
        event.preventDefault();
        if (saving.current || !isTutor || !state.user) return;
        saving.current = true; setBusy(true); setError(''); setMessage('');
        try {
            if (tab === 'dados') {
                const user = await updateCurrentTutor(baseUrl, session, fields);
                setState({ user }); setFields({ ...user, ...(user.endereco || {}) }); setCepChanged(false);
                setMessage('Dados atualizados com sucesso.');
            } else {
                await updateTutorPassword(baseUrl, session, password);
                setPassword({}); setMessage('Senha atualizada com sucesso.');
            }
        } catch (error) {
            setError(error.message);
            if (error.status === 401) void onLogout();
        } finally { saving.current = false; setBusy(false); }
    };
    const changeTab = next => { setTab(next); setPassword({}); setError(''); setMessage(''); };
    const field = (key, label, options = {}) => <label className={`profile-field profile-field-${key}`}>{label}<input className="design-input" name={key} type={options.type || 'text'} maxLength={options.maxLength} required={key !== 'complemento'} inputMode={key === 'cep' ? 'numeric' : undefined} autoComplete={options.autoComplete} value={fields[key] || ''} onChange={event => {
        const value = key === 'cep' ? event.target.value.replace(/\D/g, '').slice(0, 8).replace(/^(\d{5})(\d)/, '$1-$2') : event.target.value;
        if (key === 'cep') setCepChanged(true);
        setFields(values => ({ ...values, [key]: value }));
    }}/></label>;
    const monitorBlocked = session?.profile === 'monitor' && state.status === 403;
    const canShowForm = state.user || monitorBlocked;
    return <section className="dialog-content profile-content" aria-labelledby="my-profile-title">
        <header className="profile-intro"><h2 id="my-profile-title">Meu perfil</h2><p>Cuide dos seus dados por aqui.</p></header>
        <div className="profile-tabs" role="tablist" aria-label="Meu perfil" onKeyDown={event => {
            if (!busy && ['ArrowLeft', 'ArrowRight'].includes(event.key)) {
                event.preventDefault();
                const next = tab === 'dados' ? 'seguranca' : 'dados';
                changeTab(next);
                event.currentTarget.querySelector(`#profile-tab-${next}`)?.focus();
            }
        }}>
            <button type="button" role="tab" id="profile-tab-dados" tabIndex={tab === 'dados' ? 0 : -1} aria-selected={tab === 'dados'} aria-controls="profile-panel" disabled={busy} onClick={() => changeTab('dados')}>Meus dados</button>
            <button type="button" role="tab" id="profile-tab-seguranca" tabIndex={tab === 'seguranca' ? 0 : -1} aria-selected={tab === 'seguranca'} aria-controls="profile-panel" disabled={busy} onClick={() => changeTab('seguranca')}>Segurança</button>
        </div>
        {state.loading ? <p className="profile-status" role="status">Carregando seus dados…</p> : !canShowForm ? <div className="profile-status"><p role="alert">{state.error}</p><button type="button" onClick={() => setAttempt(value => value + 1)}>Tentar novamente</button></div> : <form className="profile-form" onSubmit={save}>
            <div id="profile-panel" role="tabpanel" aria-labelledby={`profile-tab-${tab}`} className="profile-panel">
                {tab === 'dados' ? <>
                    <div className="profile-identity"><strong>{state.user ? [state.user.nome, state.user.sobrenome].filter(Boolean).join(' ') : 'Dados da conta indisponíveis'}</strong>{state.user?.email && <span>{state.user.email}</span>}<small>Nome e e-mail vinculados à sua conta.</small></div>
                    {monitorBlocked && <div className="profile-warning"><p role="alert">A consulta de perfil do monitor não está liberada pelo backend.</p><button type="button" onClick={() => setAttempt(value => value + 1)}>Tentar novamente</button></div>}
                    <div className="profile-section"><h3>Telefone</h3>{field('telefone', 'Celular com DDD', { type: 'tel', maxLength: 20, autoComplete: 'tel' })}<p className="profile-help">Usaremos este número para entrar em contato.</p></div>
                    {isTutor && <div className="profile-section"><h3>Seu endereço</h3><div className="profile-address-row profile-address-street">{field('cep', 'CEP', { maxLength: 9, autoComplete: 'postal-code' })}{field('rua', 'Rua / avenida', { maxLength: 150, autoComplete: 'address-line1' })}</div><div className="profile-address-row profile-address-details">{field('numero', 'Número', { maxLength: 10 })}{field('complemento', 'Complemento (opcional)', { maxLength: 100, autoComplete: 'address-line2' })}{field('bairro', 'Bairro', { maxLength: 100 })}</div><div className="profile-address-row">{field('cidade', 'Cidade', { maxLength: 100, autoComplete: 'address-level2' })}</div>{addressStatus && <p className="profile-help" role="status">{addressStatus}</p>}</div>}
                </> : <div className="profile-security"><h3>Alterar senha</h3><p>Para sua segurança, confirme a senha atual antes de criar uma nova.</p>{[['senhaAtual', 'Senha atual', 'Digite sua senha atual', 'current-password'], ['novaSenha', 'Nova senha', 'Crie uma nova senha', 'new-password'], ['confirmacao', 'Confirmar nova senha', 'Repita a nova senha', 'new-password']].map(([key, label, placeholder, autoComplete]) => <div key={key}><label className="profile-field">{label}<input className="design-input" type="password" name={key} autoComplete={autoComplete} placeholder={placeholder} maxLength={100} required value={password[key] || ''} onChange={event => setPassword(values => ({ ...values, [key]: event.target.value }))}/></label>{key === 'novaSenha' && <p className="profile-help">Use pelo menos 8 caracteres, com letras e números.</p>}</div>)}<aside className="profile-privacy"><strong>Sua senha é privada.</strong><p>Nunca compartilhe sua senha com outras pessoas.</p></aside></div>}
                {!isTutor && <p className="profile-warning" role="status">A alteração de {tab === 'dados' ? 'telefone' : 'senha'} ainda não está disponível para este acesso no backend. Nenhuma alteração será salva.</p>}
                {error && <p role="alert">{error}</p>}{message && <p role="status">{message}</p>}
            </div>
            <footer className="profile-footer"><div className="profile-actions"><button type="button" disabled={busy} onClick={onClose}>Cancelar</button><button type="submit" disabled={busy || !isTutor || addressStatus === 'Consultando CEP…'}>{busy ? 'Salvando…' : tab === 'dados' ? 'Salvar alterações' : 'Atualizar senha'}</button></div>{tab === 'dados' && isTutor && <p className="profile-help">As alterações serão aplicadas à sua conta.</p>}<button type="button" className="profile-logout" disabled={busy} onClick={onLogout}>Sair da conta</button></footer>
        </form>}
        {!canShowForm && !state.loading && <div className="profile-footer"><button type="button" className="profile-logout" onClick={onLogout}>Sair da conta</button></div>}
    </section>;
}
