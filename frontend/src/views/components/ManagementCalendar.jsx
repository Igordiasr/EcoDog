import { Modal } from './Modal';
import { ArrowIcon } from './ArrowIcon';
import { CalendarNotice } from './CalendarNotice';
import { dayConfiguration, monthCells, occupiedPlaces, parseCapacity } from '../../models/calendar-model';
import { periodLabel, validISODate } from '../../models/dashboard-model';
const dateLabel = (date) => date.split('-').reverse().join('/');
export function ManagementCalendar({ calendar, className }) {
    return <section className={`${className} management-calendar`} aria-label="Calendário mensal">
    <div className="management-month-navigation"><button type="button" className="management-button" aria-label="Mês anterior" disabled={calendar.saving} onClick={() => calendar.navigateMonth(-1)}><ArrowIcon direction="left"/></button><h2>{periodLabel(calendar.period)}</h2><button type="button" className="management-button" aria-label="Próximo mês" disabled={calendar.saving} onClick={() => calendar.navigateMonth(1)}><ArrowIcon direction="right"/></button></div>
    <div className="management-calendar-grid">
      {['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'].map(day => <span key={day} className="management-weekday">{day}</span>)}
      {monthCells(calendar.period).map((date, index) => {
            if (!date)
                return <span key={`empty-${index}`} aria-hidden="true"/>;
            const config = dayConfiguration(calendar.data, date), selected = date === calendar.selectedDate;
            const status = config.available === true ? 'disponível' : config.available === false ? 'indisponível' : config.capacity.Creche !== undefined ? 'configurado' : 'sem configuração';
            return <button key={date} type="button" className={`management-day${selected ? ' management-day-selected' : config.available === false ? ' management-day-unavailable' : config.available === undefined && config.capacity.Creche === undefined ? ' management-day-unknown' : ''}`} aria-label={`${dateLabel(date)}, ${status}${selected ? ', selecionado' : ''}`} aria-pressed={selected} disabled={calendar.saving} onClick={() => calendar.selectDate(date)}>{Number(date.slice(-2))}{selected && ' ✓'}</button>;
        })}
    </div>
    <p className="management-calendar-legend">✓ Selecionado • — Sem configuração</p>
    <p>Selecionado: {dateLabel(calendar.selectedDate)}</p>
  </section>;
}
export function ManagementAvailability({ calendar }) {
    return null;
}
export function ManagementCapacity({ calendar, className, service }) {
    const raw = calendar.drafts[service], value = parseCapacity(raw), occupied = calendar.data ? occupiedPlaces(calendar.data, calendar.selectedDate, service) : 0;
    const error = calendar.errors[service] || (calendar.editing[service] && (value === null ? 'Informe uma quantidade inteira maior ou igual a zero.' : value < occupied ? `O limite não pode ser inferior aos ${occupied} agendamentos confirmados.` : ''));
    const id = `management-capacity-${service}`;
    return <div className={`${className} management-capacity`}>
    <label htmlFor={id}>Quantidade de vagas {service.toLowerCase()}</label>
    <p>Atual: {calendar.configuration.capacity[service] ?? 'não configurada'}{calendar.example ? ` • Ocupadas: ${occupied}` : ''}</p>
    <input id={id} aria-label={`Quantidade de vagas ${service.toLowerCase()}`} className="design-input" type="text" inputMode="numeric" value={raw} disabled={!calendar.editing[service] || calendar.saving || !calendar.data} aria-invalid={!!error} aria-describedby={error ? `${id}-error` : undefined} onChange={e => { calendar.setDrafts(values => ({ ...values, [service]: e.target.value })); calendar.setErrors(errors => ({ ...errors, [service]: '' })); }}/>
    {error && <p id={`${id}-error`} role="status" className="management-error">{error}</p>}
    <div className="management-actions"><button type="button" className="management-button" disabled={!calendar.data || calendar.saving} onClick={() => calendar.setEditing(values => ({ ...values, [service]: true }))}>Alterar</button><button type="button" className="management-button management-primary" disabled={!calendar.editing[service] || calendar.saving || !!error} onClick={() => void calendar.saveCapacity(service)}>Salvar</button></div>
  </div>;
}
export function ManagementBulk({ calendar, className }) {
    return <div className={className}><button type="button" className="management-button" disabled={!calendar.data || calendar.saving} onClick={() => { calendar.setErrors({}); calendar.setMessage(''); calendar.setBulk({ service: 'Creche', quantity: '' }); }}>Todos os dias do mês</button><p>*Altera somente as vagas do serviço selecionado para {periodLabel(calendar.period)}.</p></div>;
}
export function ManagementActivity({ calendar, className, row }) {
    return <article className={`${className} management-record`} aria-label={row.name}><div className="management-record-heading"><h3>{row.name}</h3><button type="button" className="management-button management-danger" aria-label={`Remover ${row.name}`} disabled={calendar.saving} onClick={() => calendar.removeActivity(row)}>×</button></div><p>De: {row.start || 'não informado'} • Até: {row.end || 'não informado'}</p><button type="button" className="management-button" onClick={() => { calendar.setErrors({}); calendar.setMessage(''); calendar.setActivity({ ...row, readOnly: !calendar.example, start: row.start || '', end: row.end || '' }); }}>Ver detalhes</button></article>;
}
const studentStatuses = { PENDENTE: 'Aguardando confirmação', AGENDADO: 'Agendado', CONFIRMADO: 'Entrada registrada', RETIRADO: 'Retirado', CANCELADO: 'Cancelado', confirmed: 'Confirmado', pending: 'Aguardando confirmação', cancelled: 'Cancelado' };

export function ManagementStudent({ row, photo, onRemove, saving = false }) {
    const age = row.age == null ? 'Idade não informada' : `${row.age} ${row.age === 1 ? 'ano' : 'anos'}`;
    const hasTimes = row.start || row.end;
    const awaitingConfirmation = row.status === 'PENDENTE' || row.status === 'pending';
    return <article className="management-student-card" aria-label={`Agendamento de ${row.name}`}>
        {awaitingConfirmation && <p className="management-student-pending-badge">Aguardando confirmação</p>}
        <div className="management-student-identification">
            <div className="management-student-photo" aria-hidden="true">{photo}</div>
            <div className="management-student-text">
                <h3>{row.name}</h3>
                <p>{row.breed || 'Raça não informada'} • {age}</p>
                <p>Tutor: {row.tutor || 'não informado'}</p>
            </div>
            <button type="button" className="management-student-remove" aria-label={onRemove ? `Cancelar agendamento de ${row.name}` : `Cancelamento do agendamento de ${row.name} indisponível`} title={onRemove ? 'Cancelar agendamento' : 'Cancelamento indisponível para esta situação'} disabled={!onRemove || saving} onClick={onRemove}>×</button>
        </div>
        <p className="management-student-time">{hasTimes ? <>De: {row.start || 'não informado'} &nbsp; • &nbsp; Até: {row.end || 'não informado'}</> : 'Horários não informados'}</p>
        {awaitingConfirmation && <div className="management-student-approval"><button type="button" className="management-button management-approval-button" disabled>Confirmar estadia</button><p>A confirmação de estadia ainda não está disponível.</p></div>}
        <details className="management-student-details">
            <summary><svg viewBox="0 0 18 18" width="18" height="18" fill="none" aria-hidden="true"><path d="M4.5 6.75L9 11.25L13.5 6.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>Ver detalhes</summary>
            <div className="management-student-details-content">
                {row.date && <p>Data: {dateLabel(row.date)}</p>}
                {row.service && <p>Serviço: {row.service}</p>}
                <p>Situação: {studentStatuses[row.status] || 'Não informada'}</p>
            </div>
        </details>
    </article>;
}

export function ManagementBooking({ calendar, row, photo }) {
    let age;
    if (row.birthDate && validISODate(row.birthDate)) {
        const today = new Date(), birth = new Date(`${row.birthDate}T12:00:00`);
        if (!Number.isNaN(birth.getTime()) && birth <= today)
            age = today.getFullYear() - birth.getFullYear() - (today.getMonth() < birth.getMonth() || today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate() ? 1 : 0);
    }
    return <ManagementStudent row={{ ...row, name: row.petName, age }} photo={photo} saving={calendar.saving} onRemove={calendar.example ? () => calendar.cancelBooking(row.id) : undefined}/>;
}
export function ManagementCalendarDialogs({ calendar }) {
    const booking = calendar.data?.bookings.find(row => row.id === calendar.bookingId);
    return <>
    {calendar.activity && <Modal title="Detalhes da atividade" className="management-calendar-modal" onClose={() => calendar.requestLeave(() => calendar.setActivity(null))}><form className="dialog-content management-dialog" onSubmit={e => { e.preventDefault(); void calendar.saveActivity(); }}><h2>Atividade do dia {dateLabel(calendar.activity.date)}</h2>
      <CalendarNotice kind="error" message={calendar.errors.catalog}/>
      {!calendar.example && !calendar.activity.readOnly ? <label className="management-field">Atividade<select className="design-input" value={calendar.activity.catalogId} disabled={calendar.catalogLoading || calendar.saving} aria-invalid={!!calendar.errors.name} onChange={e => { const selected = calendar.catalog.find(item => item.id === e.target.value); calendar.setActivity(row => ({ ...row, catalogId: e.target.value, name: selected?.name || '' })); calendar.setErrors(errors => ({ ...errors, name: '' })); }}><option value="">{calendar.catalogLoading ? 'Carregando atividades…' : 'Selecione uma atividade'}</option>{calendar.catalog.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select>{calendar.errors.name && <span className="management-error" role="status">{calendar.errors.name}</span>}</label> : <label className="management-field">Nome da atividade<input className="design-input" value={calendar.activity.name || ''} disabled={calendar.activity.readOnly} onChange={e => calendar.setActivity(row => ({ ...row, name: e.target.value }))}/>{calendar.errors.name && <span className="management-error">{calendar.errors.name}</span>}</label>}
      {['start', 'end'].map(key => <label className="management-field" key={key}>{key === 'start' ? 'Início' : 'Término'}<input className="design-input" type="time" value={calendar.activity[key] || ''} disabled={calendar.activity.readOnly || calendar.saving} aria-invalid={!!calendar.errors[key]} onChange={e => { const value = e.target.value; calendar.setActivity(row => row && ({ ...row, [key]: value })); calendar.setErrors(errors => ({ ...errors, [key]: '' })); }}/>{calendar.errors[key] && <span className="management-error" role="status">{calendar.errors[key]}</span>}</label>)}<CalendarNotice kind={calendar.messageKind} message={calendar.message} onDismiss={() => calendar.setMessage('')}/><div className="management-actions"><button type="button" className="management-button" onClick={() => calendar.requestLeave(() => calendar.setActivity(null))}>{calendar.activity.readOnly ? 'Fechar' : 'Cancelar'}</button>{!calendar.activity.readOnly && <button type="submit" className="management-button management-primary" disabled={calendar.saving || calendar.catalogLoading || (!calendar.example && !calendar.catalog.length)}>Salvar atividade</button>}</div></form></Modal>}
    {booking && <Modal title="Detalhes do agendamento" onClose={() => calendar.setBookingId(null)}><div className="dialog-content management-dialog"><h2>Agendamento de {booking.petName}</h2><p>Identificador do pet: {booking.petId}</p><p>Data: {dateLabel(booking.date)}</p><ManagementBooking calendar={calendar} row={booking}/><button type="button" className="management-button" onClick={() => calendar.setBookingId(null)}>Fechar detalhes</button></div></Modal>}
    {calendar.bulk && <Modal title="Todos os dias do mês" className="management-calendar-modal" onClose={() => calendar.requestLeave(() => calendar.setBulk(null))}><form className="dialog-content management-dialog" onSubmit={e => { e.preventDefault(); calendar.confirmBulk(); }}><h2>Vagas para {periodLabel(calendar.period)}</h2><label className="management-field">Serviço<select aria-label="Serviço" className="design-input" value={calendar.bulk.service} onChange={e => { calendar.setBulk(bulk => bulk && ({ ...bulk, service: e.target.value })); calendar.setErrors({}); }}><option>Creche</option><option>Hotel</option></select></label><label className="management-field">Quantidade<input className="design-input" aria-label="Quantidade" inputMode="numeric" value={calendar.bulk.quantity} aria-invalid={!!calendar.errors.bulk} onChange={e => { const quantity = e.target.value; calendar.setBulk(bulk => bulk && ({ ...bulk, quantity })); calendar.setErrors({}); }}/></label>{calendar.errors.bulk && <p className="management-error" role="status">{calendar.errors.bulk}</p>}<CalendarNotice kind={calendar.messageKind} message={calendar.message} onDismiss={() => calendar.setMessage('')}/><button type="submit" className="management-button management-primary" disabled={calendar.saving}>Aplicar ao mês</button></form></Modal>}
    {calendar.confirmation && <Modal title={calendar.confirmation.title} className="management-calendar-modal" onClose={() => !calendar.saving && calendar.setConfirmation(null)}><div className="dialog-content management-dialog"><h2>{calendar.confirmation.title}</h2><p>{calendar.confirmation.message}</p><div className="management-actions management-confirmation-actions"><button type="button" className="management-button" disabled={calendar.saving} onClick={() => calendar.setConfirmation(null)}>{calendar.confirmation.cancelLabel || 'Voltar'}</button><button type="button" className="management-button management-primary" disabled={calendar.saving} onClick={async () => { await calendar.confirmation.run(); calendar.setConfirmation(null); }}>{calendar.saving ? 'Aguarde…' : calendar.confirmation.confirmLabel || 'Confirmar'}</button></div></div></Modal>}
  </>;
}
