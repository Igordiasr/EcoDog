import { userFeedback } from '../../viewmodels/user-feedback';

export function PageFeedback({ notices }) {
    if (!notices?.length) return null;
    return <div className="page-feedback" aria-label="Avisos da página">
        {notices.map(({ message, error, retry, disabled }, index) => <section key={index} className={`page-feedback-card${error ? ' page-feedback-error' : ''}`} role={error ? 'alert' : 'status'}>
            <h2>{error ? 'Não conseguimos carregar as informações' : 'Só um instante'}</h2>
            <p>{userFeedback(message)}</p>
            {retry && <button type="button" disabled={disabled} onClick={retry}>Tentar novamente</button>}
        </section>)}
    </div>;
}
