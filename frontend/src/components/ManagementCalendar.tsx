import { Modal } from './Modal';
import { ArrowIcon } from './ArrowIcon';
import { dayConfiguration, monthCells, occupiedPlaces, parseCapacity, timeRangeError, type CalendarActivity, type CalendarBooking, type CalendarService } from '../services/calendar-model';
import { periodLabel, validISODate } from '../services/dashboard-model';
import type { ReactNode } from 'react';
import type { ManagementCalendarController } from '../services/use-management-calendar';

interface Props { calendar: ManagementCalendarController; className?: string }
const dateLabel = (date: string) => date.split('-').reverse().join('/');
export function ManagementCalendar({ calendar, className }: Props) {
  return <section className={`${className} management-calendar`} aria-label="Calendário mensal">
    <div className="management-month-navigation"><button type="button" className="management-button" aria-label="Mês anterior" disabled={calendar.saving} onClick={() => calendar.navigateMonth(-1)}><ArrowIcon direction="left" /></button><h2>{periodLabel(calendar.period)}</h2><button type="button" className="management-button" aria-label="Próximo mês" disabled={calendar.saving} onClick={() => calendar.navigateMonth(1)}><ArrowIcon direction="right" /></button></div>
    <div className="management-calendar-grid">
      {['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'].map(day => <span key={day} className="management-weekday">{day}</span>)}
      {monthCells(calendar.period).map((date, index) => {
        if (!date) return <span key={`empty-${index}`} aria-hidden="true" />;
        const config = dayConfiguration(calendar.data, date), selected = date === calendar.selectedDate;
        const status = config.available === true ? 'disponível' : config.available === false ? 'indisponível' : config.configured ? 'configurado, disponibilidade não informada' : 'sem configuração';
        return <button key={date} type="button" className={`management-day${selected ? ' management-day-selected' : config.available === false ? ' management-day-unavailable' : config.available === undefined ? ' management-day-unknown' : ''}`} aria-label={`${dateLabel(date)}, ${status}${selected ? ', selecionado' : ''}`} aria-pressed={selected} disabled={calendar.saving} onClick={() => calendar.selectDate(date)}>{Number(date.slice(-2))}{selected && ' ✓'}</button>;
      })}
    </div>
    <p className="management-calendar-legend">○ Disponível • ⊘ Indisponível • ✓ Selecionado • — Sem configuração</p>
    <p>Selecionado: {dateLabel(calendar.selectedDate)}</p>
  </section>;
}
export function ManagementAvailability({ calendar }: Props) {
  return <label className="management-field">Disponibilidade do dia<select className="design-input" aria-label="Disponibilidade do dia" value={calendar.configuration.available === undefined ? '' : String(calendar.configuration.available)} disabled={!calendar.can('availability') || calendar.saving} onChange={e => calendar.changeAvailability(e.target.value === 'true')}><option value="" disabled>{calendar.configuration.configured ? 'Disponibilidade não informada' : 'Sem configuração'}</option><option value="true">Disponível</option><option value="false">Indisponível</option></select></label>;
}
export function ManagementCapacity({ calendar, className, service }: Props & { service: CalendarService }) {
  const raw = calendar.drafts[service], value = parseCapacity(raw), occupied = calendar.data ? occupiedPlaces(calendar.data, calendar.selectedDate, service) : 0;
  const error = calendar.errors[service] || (calendar.editing[service] && (value === null ? 'Informe uma quantidade inteira maior ou igual a zero.' : value < occupied ? `O limite não pode ser inferior aos ${occupied} agendamentos confirmados.` : ''));
  const id = `management-capacity-${service}`;
  return <div className={`${className} management-capacity`}>
    <label htmlFor={id}>Quantidade de vagas {service.toLowerCase()}</label>
    <p>Atual: {calendar.configuration.capacity[service] ?? 'não configurada'} • Ocupadas: {calendar.data?.occupancyKnown === false ? 'não informadas por serviço' : occupied}</p>
    <input id={id} aria-label={`Quantidade de vagas ${service.toLowerCase()}`} className="design-input" type="text" inputMode="numeric" value={raw} disabled={!calendar.editing[service] || calendar.saving || !calendar.data} aria-invalid={!!error} aria-describedby={error ? `${id}-error` : undefined} onChange={e => { calendar.setDrafts(values => ({ ...values, [service]: e.target.value })); calendar.setErrors(errors => ({ ...errors, [service]: '' })); }} />
    {error && <p id={`${id}-error`} role="status" className="management-error">{error}</p>}
    <div className="management-actions"><button type="button" className="management-button" disabled={!calendar.can('capacity') || calendar.saving} onClick={() => calendar.setEditing(values => ({ ...values, [service]: true }))}>Alterar</button><button type="button" className="management-button management-primary" disabled={!calendar.can('capacity') || !calendar.editing[service] || calendar.saving || !!error} onClick={() => void calendar.saveCapacity(service)}>Salvar</button></div>
  </div>;
}
export function ManagementBulk({ calendar, className }: Props) {
  return <div className={className}><button type="button" className="management-button" disabled={!calendar.can('monthCapacity') || calendar.saving} onClick={() => { calendar.setErrors({}); calendar.setBulk({ service: 'Creche', quantity: '' }); }}>Todos os dias do mês</button><p>{calendar.can('monthCapacity') ? `*Altera somente as vagas do serviço selecionado para ${periodLabel(calendar.period)}.` : 'Aplicação mensal indisponível: falta contrato atômico.'}</p></div>;
}
export function ManagementActivity({ calendar, className, row }: Props & { row: CalendarActivity }) {
   return <article className={`${className} management-record`} aria-label={row.name}><div className="management-record-heading"><h3>{row.name}</h3><button type="button" className="management-button management-danger" aria-label={`Remover ${row.name}`} disabled={calendar.saving || !calendar.can('removeActivity')} onClick={() => calendar.removeActivity(row)}>×</button></div><p>De: {row.start || 'não informado'} • Até: {row.end || 'não informado'}</p><button type="button" className="management-button" onClick={() => { calendar.setErrors({}); calendar.setActivity({ ...row, start: row.start || '', end: row.end || '' }); }}>Ver detalhes</button></article>;
}
export function ManagementBooking({ calendar, className, row, photo }: Props & { row: CalendarBooking; photo?: ReactNode }) {
   let age = row.age === undefined ? 'Idade não informada' : `${row.age} anos na data consultada`;
  if (row.birthDate && validISODate(row.birthDate)) {
    const today = new Date(), birth = new Date(`${row.birthDate}T12:00:00`);
    if (!Number.isNaN(birth.getTime()) && birth <= today) age = `${today.getFullYear() - birth.getFullYear() - (today.getMonth() < birth.getMonth() || today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate() ? 1 : 0)} anos`;
  }
   return <article className={`${className} management-record`} aria-label={`Agendamento de ${row.petName}`}><div className="management-booking-identification">{photo}<div className="management-booking-text"><div className="management-record-heading"><h3>{row.petName}</h3><button type="button" className="management-button management-danger" aria-label={`Cancelar agendamento de ${row.petName}`} disabled={calendar.saving || !calendar.can('cancelBooking')} onClick={() => calendar.cancelBooking(row.id)}>×</button></div><p>{row.breed || 'Raça não informada'} • {age}</p><p>Tutor: {row.tutor || 'não informado'}</p></div></div><p>{row.service || 'Serviço não informado'} • {({ confirmed: 'Confirmado', pending: 'Agendado', withdrawn: 'Retirado', cancelled: 'Cancelado' })[row.status]}</p><p>De: {row.start || 'não informado'} • Até: {row.end || 'não informado'}</p>{row.start && row.end && timeRangeError(row.start, row.end) && <p className="management-error">{timeRangeError(row.start, row.end)}</p>}<button type="button" className="management-button" onClick={() => calendar.setBookingId(row.id)}>Ver detalhes</button></article>;
}
export function ManagementCalendarDialogs({ calendar }: Props) {
  const booking = calendar.data?.bookings.find(row => row.id === calendar.bookingId);
  const existingActivity = calendar.data?.activities.some(row => row.id === calendar.activity?.id);
  const activityReadOnly = !calendar.can(existingActivity ? 'editActivity' : 'activity');
  return <>
    {calendar.activity && <Modal title="Detalhes da atividade" onClose={() => calendar.requestLeave(() => calendar.setActivity(null))}><form className="dialog-content management-dialog" onSubmit={e => { e.preventDefault(); void calendar.saveActivity(); }}><h2>Atividade do dia {dateLabel(calendar.activity.date)}</h2>
      <label className="management-field">Nome da atividade{calendar.data?.catalog ? <select className="design-input" aria-label="Nome da atividade" disabled={activityReadOnly || calendar.saving} value={calendar.activity.catalogId || ''} aria-invalid={!!calendar.errors.name} onChange={e => { const item = calendar.data?.catalog?.find(row => row.id === e.target.value); calendar.setActivity(row => row && ({ ...row, catalogId: item?.id, name: item?.name || '' })); }}><option value="">Selecione uma atividade</option>{calendar.data.catalog.map(row => <option key={row.id} value={row.id}>{row.name}</option>)}</select> : <input className="design-input" aria-label="Nome da atividade" disabled={activityReadOnly || calendar.saving} value={calendar.activity.name} aria-invalid={!!calendar.errors.name} onChange={e => { const name = e.target.value; calendar.setActivity(row => row && ({ ...row, name })); }} />}{calendar.errors.name && <span role="status" className="management-error">{calendar.errors.name}</span>}</label>
      {(['start', 'end'] as const).map(key => <label className="management-field" key={key}>{key === 'start' ? 'Início' : 'Término'}<input className="design-input" aria-label={key === 'start' ? 'Início' : 'Término'} type="time" disabled={activityReadOnly || calendar.saving} value={calendar.activity![key] || ''} aria-invalid={!!calendar.errors[key]} onChange={e => { const value = e.target.value; calendar.setActivity(row => row && ({ ...row, [key]: value })); calendar.setErrors(errors => ({ ...errors, [key]: '' })); }} />{calendar.errors[key] && <span className="management-error" role="status">{calendar.errors[key]}</span>}</label>)}
      {activityReadOnly && <p>Somente consulta. Edição/programação indisponível.</p>}<div className="management-actions"><button type="button" className="management-button" onClick={() => calendar.requestLeave(() => calendar.setActivity(null))}>Cancelar</button><button type="submit" className="management-button management-primary" disabled={calendar.saving || activityReadOnly}>Salvar atividade</button></div></form></Modal>}
    {booking && <Modal title="Detalhes do agendamento" onClose={() => calendar.setBookingId(null)}><div className="dialog-content management-dialog"><h2>Agendamento de {booking.petName}</h2><p>Identificador do pet: {booking.petId}</p><p>Data: {dateLabel(booking.date)}</p><ManagementBooking calendar={calendar} row={booking} /><button type="button" className="management-button" onClick={() => calendar.setBookingId(null)}>Fechar detalhes</button></div></Modal>}
    {calendar.bulk && <Modal title="Todos os dias do mês" onClose={() => calendar.requestLeave(() => calendar.setBulk(null))}><form className="dialog-content management-dialog" onSubmit={e => { e.preventDefault(); calendar.confirmBulk(); }}><h2>Vagas para {periodLabel(calendar.period)}</h2><label className="management-field">Serviço<select aria-label="Serviço" className="design-input" value={calendar.bulk.service} onChange={e => { calendar.setBulk(bulk => bulk && ({ ...bulk, service: e.target.value as CalendarService })); calendar.setErrors({}); }}><option>Creche</option><option>Hotel</option></select></label><label className="management-field">Quantidade<input className="design-input" aria-label="Quantidade" inputMode="numeric" value={calendar.bulk.quantity} aria-invalid={!!calendar.errors.bulk} onChange={e => { const quantity = e.target.value; calendar.setBulk(bulk => bulk && ({ ...bulk, quantity })); calendar.setErrors({}); }} /></label>{calendar.errors.bulk && <p className="management-error" role="status">{calendar.errors.bulk}</p>}<button type="submit" className="management-button management-primary" disabled={calendar.saving}>Aplicar ao mês</button></form></Modal>}
    {calendar.confirmation && <Modal title={calendar.confirmation.title} onClose={() => calendar.setConfirmation(null)}><div className="dialog-content management-dialog"><h2>{calendar.confirmation.title}</h2><p>{calendar.confirmation.message}</p><div className="management-actions"><button type="button" className="management-button" disabled={calendar.saving} onClick={() => calendar.setConfirmation(null)}>Voltar</button><button type="button" className="management-button management-primary" disabled={calendar.saving} onClick={async () => { await calendar.confirmation!.run(); calendar.setConfirmation(null); }}>Confirmar</button></div></div></Modal>}
  </>;
}
