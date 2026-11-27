import { useEffect, useRef, useState } from 'react';
import { moneyBRL, validISODate } from '../../models/dashboard-model';

export function DashboardPayments({ source, onClose, onPaid }) {
    const [rows, setRows] = useState([]);
    const [selected, setSelected] = useState('');
    const [date, setDate] = useState('');
    const [method, setMethod] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [attempt, setAttempt] = useState(0);
    const inFlight = useRef(false);
    useEffect(() => {
        const controller = new AbortController();
        setLoading(true);
        setError('');
        source.pendingMovements(controller.signal).then(data => { if (!controller.signal.aborted) setRows(data); })
            .catch(error => { if (!controller.signal.aborted) setError(error.message); })
            .finally(() => { if (!controller.signal.aborted) setLoading(false); });
        return () => controller.abort();
    }, [source, attempt]);
    const row = rows.find(item => String(item.id) === selected);
    const submit = async event => {
        event.preventDefault();
        if (!row || !validISODate(date) || !method.trim() || inFlight.current) return;
        inFlight.current = true;
        setSaving(true);
        setError('');
        try {
            await source.payMovement(row, method.trim(), date);
            onPaid();
        } catch (error) {
            setError(error.message || 'Não foi possível registrar o pagamento.');
        } finally {
            inFlight.current = false;
            setSaving(false);
        }
    };
    return <form className="dialog-content dashboard-payment-form" onSubmit={submit}>
      <h2>Registrar pagamento</h2>
      <p>Selecione uma movimentação pendente para registrar seu pagamento. Não é possível criar receitas avulsas nesta tela.</p>
      {loading ? <p role="status">Carregando movimentações…</p> : error && !rows.length ? <><p role="alert">{error}</p><button type="button" onClick={() => setAttempt(value => value + 1)}>Tentar novamente</button></> : !rows.length ? <p>Nenhuma movimentação pendente.</p> : <>
        <label className="management-field">Movimentação pendente
          <select className="design-input" required value={selected} disabled={saving} onChange={event => setSelected(event.target.value)}>
            <option value="">Selecione</option>
            {rows.map(item => <option key={item.id} value={item.id}>{item.usuario} • {item.pet} • {item.servico} • {moneyBRL(Math.round(item.valor * 100))} • #{item.id}</option>)}
          </select>
        </label>
        <label className="management-field">Data do pagamento<input className="design-input" type="date" required value={date} disabled={saving} onChange={event => setDate(event.target.value)}/></label>
        <label className="management-field">Forma de pagamento<input className="design-input" type="text" required maxLength={100} value={method} disabled={saving} onChange={event => setMethod(event.target.value)}/></label>
        {error && <p role="alert">{error}</p>}
      </>}
      <div className="dialog-actions"><button type="button" disabled={saving} onClick={onClose}>Cancelar</button><button type="submit" disabled={loading || saving || !row || !validISODate(date) || !method.trim()}>{saving ? 'Salvando…' : 'Registrar pagamento'}</button></div>
    </form>;
}
