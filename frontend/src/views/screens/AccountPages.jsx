import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createAuthViewModel, registrationData, registrationAddressData } from '../../viewmodels/auth';
import { loadCurrentUser } from '../../models/current-user';
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
