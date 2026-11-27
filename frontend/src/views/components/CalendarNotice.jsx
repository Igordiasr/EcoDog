const titles = {
    error: 'Ops! Algo não saiu como esperado',
    success: 'Tudo certo!',
    info: 'Atenção',
    loading: 'Só um instante',
};

export function CalendarNotice({ message, kind = 'info', title, retry, onDismiss, disabled, bringIntoView = false }) {
    const ref = useRef(null);
    useEffect(() => {
        if (message && bringIntoView) ref.current?.scrollIntoView?.({ block: 'center', behavior: 'smooth' });
    }, [message, bringIntoView]);
    if (!message) return null;
    return <section ref={ref} className={`page-feedback-card calendar-notice calendar-notice-${kind}${kind === 'error' ? ' page-feedback-error' : ''}`} role={kind === 'error' ? 'alert' : 'status'}>
        <h2>{title || titles[kind]}</h2>
        <p>{message}</p>
        {(retry || onDismiss) && <div className="calendar-notice-actions">
            {retry && <button type="button" disabled={disabled} onClick={retry}>Tentar novamente</button>}
            {onDismiss && <button type="button" className="calendar-notice-dismiss" onClick={onDismiss}>Entendi</button>}
        </div>}
    </section>;
}
import { useEffect, useRef } from 'react';
