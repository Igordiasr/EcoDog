import { useEffect, useState } from 'react';
import { bookingCategories, createBookingApi, type BookingAvailability, type BookingCategory, type BookingService } from '../services/booking-api';
import { dateKey } from '../services/dashboard-model';
import { safeRequestMessage } from '../services/request-state';

export function PublicBookingAvailability({ baseUrl = import.meta.env.VITE_API_BASE_URL }: { baseUrl?: string }) {
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState<BookingCategory>('HOTEL');
  const [period, setPeriod] = useState(() => dateKey(new Date()).slice(0, 7));
  return <section aria-label="Consulta pública de serviços e disponibilidade">
    <button type="button" onClick={() => setOpen(value => !value)} aria-expanded={open}>Consultar serviços e disponibilidade</button>
    {open && <>
      <p>Consulta informativa do sistema; não reserva vagas nem autoriza seleção no calendário ilustrativo. Regras de capacidade e preços ainda dependem de validação.</p>
      <label>Categoria<select value={category} onChange={event => setCategory(event.target.value as BookingCategory)}>{bookingCategories.map(value => <option key={value}>{value}</option>)}</select></label>
      <label>Mês<input type="month" value={period} onChange={event => setPeriod(event.target.value)} /></label>
      <AvailabilityQuery key={`${baseUrl}:${category}:${period}`} baseUrl={baseUrl} category={category} period={period} />
    </>}
  </section>;
}
function AvailabilityQuery({ baseUrl, category, period }: { baseUrl?: string; category: BookingCategory; period: string }) {
  const [result, setResult] = useState<{ services: BookingService[]; availability: BookingAvailability[] } | null>(null);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    if (!baseUrl) return;
    const controller = new AbortController();
    setResult(null); setError('');
    async function load() {
      try {
        const api = createBookingApi(baseUrl!);
        const [services, availability] = await Promise.all([api.services(category, controller.signal), api.availability(category, period, controller.signal)]);
        if (!controller.signal.aborted) setResult({ services: services.filter(service => service.modality !== 'PLANO'), availability });
      } catch (cause) { if (!controller.signal.aborted) setError(safeRequestMessage(cause)); }
    }
    void load();
    return () => controller.abort();
  }, [baseUrl, category, period, attempt]);
  if (!baseUrl) return <p role="status">Consulta não configurada. A integração depende de VITE_API_BASE_URL.</p>;
  if (error) return <><p role="alert">{error} Disponibilidade desconhecida.</p><button type="button" onClick={() => { setResult(null); setError(''); setAttempt(value => value + 1); }}>Atualizar consulta pública</button></>;
  if (!result) return <p role="status">Consultando serviços e disponibilidade…</p>;
  return <>
    <h2>Serviços não plano</h2>
    {result.services.length ? <ul>{result.services.map(service => <li key={service.id}>{service.name} — {service.modality}{service.frequency && ` — ${service.frequency}`}</li>)}</ul> : <p>Nenhum serviço não plano disponível.</p>}
    <h2>Contagens informativas por data</h2>
    {result.availability.length ? <ul>{result.availability.map(day => <li key={day.date}><time dateTime={day.date}>{day.date.split('-').reverse().join('/')}</time>: {day.remaining} vagas informadas de {day.capacity}. Não constitui garantia de vaga.</li>)}</ul> : <p>Nenhuma contagem retornada. Disponibilidade desconhecida.</p>}
  </>;
}
