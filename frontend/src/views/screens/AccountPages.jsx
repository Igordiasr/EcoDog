import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createAuthViewModel, registrationData, registrationAddressData } from '../../viewmodels/auth';
import { loadCurrentUser } from '../../models/current-user';
import { Menu } from '../components/Menu';
import { screens } from './catalog';
import { StandaloneEcoMigo } from '../components/StandaloneEcoMigo';

export function RegistrationPage({ api }) {
    const [fields, setFields] = useState({}), [step, setStep] = useState(0), [busy, setBusy] = useState(false), [error, setError] = useState('');
    const inFlight = useRef(false), navigate = useNavigate(), heading = useRef(null);
    const [menuOpen, setMenuOpen] = useState(false);
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
                ['nome', 'Nome', 'text', 'Seu nome completo', 'name'], ['e-mail', 'E-mail', 'email', 'seuemail@exemplo.com', 'email'], ['telefone', 'Telefone com DDD', 'tel', '(11) 91234-5678', 'tel'], ['cpf', 'CPF', 'text', '000.000.000-00', 'off'], ['senha', 'Senha', 'password', 'No mínimo 6 caracteres', 'new-password'], ['confirmacao-de-senha', 'Confirmação de senha', 'password', 'Repita sua senha', 'new-password'],
            ] : [
                ['cep', 'CEP', 'text', '00000-000', 'postal-code'], ['rua', 'Rua / Logradouro', 'text', 'Nome da sua rua', 'address-line1'], ['numero', 'Número', 'text', '123 ou S/N', 'off'], ['bairro', 'Bairro', 'text', 'Seu bairro', 'address-level3'], ['cidade', 'Cidade', 'text', 'Sua cidade', 'address-level2'],
            ]).map(([key, label, type, placeholder, autoComplete]) => <label key={key}>{label}<input className="design-input" name={key} type={type} placeholder={placeholder} autoComplete={autoComplete} required maxLength={key === 'numero' ? 10 : undefined} inputMode={['cep', 'cpf'].includes(key) ? 'numeric' : undefined} value={fields[key] || ''} onChange={event => setFields(values => ({ ...values, [key]: event.target.value }))}/></label>)}</fieldset>
            {step === 1 && <p className="address-integration-note">O endereço será enviado com o cadastro, mas sua gravação depende da atualização do backend.</p>}
            {error && <p role="alert">{error}</p>}
            <div className="dialog-actions">{step > 0 && <button type="button" disabled={busy} onClick={() => { setStep(0); setError(''); }}>Voltar</button>}<button type="submit" disabled={busy}>{busy ? 'Cadastrando…' : step === 0 ? 'Avançar' : 'Concluir cadastro'}</button></div>
        </form><Link to="/entrar">Voltar ao login</Link>
        </section></div></main><StandaloneEcoMigo/>
    </div>;
}

export function ForgotPasswordPage() {
    const [email, setEmail] = useState(''), [message, setMessage] = useState('');
    return <main className="account-page"><h1>Esqueceu a senha?</h1><p>O envio de recuperação de senha ainda não está disponível neste sistema.</p>
        <form onSubmit={event => { event.preventDefault(); setMessage('Recuperação indisponível. Nenhum e-mail foi enviado.'); }}><label>E-mail<input className="design-input" type="email" required autoComplete="email" value={email} onChange={event => setEmail(event.target.value)}/></label><button type="submit">Verificar recuperação</button></form>
        {message && <p role="status">{message}</p>}<Link to="/entrar">Voltar ao login</Link><StandaloneEcoMigo/></main>;
}

export function MyProfile({ session, onLogout }) {
    const [state, setState] = useState({ loading: true }), [attempt, setAttempt] = useState(0);
    useEffect(() => {
        const controller = new AbortController(); setState({ loading: true });
        loadCurrentUser(import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080', session, controller.signal)
            .then(user => { if (!controller.signal.aborted) setState({ user }); })
            .catch(error => { if (!controller.signal.aborted) { setState({ error: error.message }); if (error.status === 401) void onLogout(); } });
        return () => controller.abort();
    }, [session?.token, attempt]);
    return <div className="dialog-content"><h2>Meus Dados</h2>{state.loading ? <p role="status">Carregando seus dados…</p> : state.error ? <><p role="alert">{state.error}</p><button type="button" onClick={() => setAttempt(value => value + 1)}>Tentar novamente</button></> : <dl>{[['nome', 'Nome'], ['email', 'E-mail'], ['telefone', 'Telefone']].map(([key, label]) => <div key={key}><dt>{label}</dt><dd>{state.user[key] || 'Não informado'}</dd></div>)}</dl>}
        <p>CPF e endereço não são devolvidos pela consulta. A edição exige dados que a consulta não retorna; esta tela é somente leitura.</p><button type="button" onClick={onLogout}>Sair da conta</button></div>;
}
