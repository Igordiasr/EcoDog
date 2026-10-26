import { validISODate, type DashboardReservation } from '../services/dashboard-model';
export function ScheduledPetDays({ records, error, example }: { records: DashboardReservation[] | null; error: string; example: boolean }) {
  if (error) return <p role="status">Agenda indisponível. {error}</p>;
  if (!records) return <p role="status">Carregando agendamentos…</p>;
  const bookings = records.filter(row => row.valid && row.service === 'Creche' && validISODate(row.date));
  const dates = [...new Set(bookings.map(row => row.date))].sort();
  return <div className="scheduled-pet-days" role="group" aria-label={example ? 'Dias agendados — dados ilustrativos de desenvolvimento' : 'Dias agendados'}>
    <div className="scheduled-days-list">
      {dates.map(date => {
        const label = date.split('-').reverse().join('/');
        return <div key={date} className="scheduled-day-card" role="group" aria-label={`Agendamentos de ${label}`}>
          <time dateTime={date}>{label}</time>
        </div>;
      })}
    </div>
    {!dates.length && <p>Nenhum dia agendado.</p>}
  </div>;
}
