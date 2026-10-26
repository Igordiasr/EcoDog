import { validISODate } from '../services/dashboard-model';
import type { TutorScheduleRecord } from '../services/tutor-schedule';
export function ScheduledPetDays({ records, error, example }: { records: TutorScheduleRecord[] | null; error: string; example: boolean }) {
  if (error) return <p role="status">Agenda indisponível. {error}</p>;
  if (!records) return <p role="status">Carregando agendamentos…</p>;
  const bookings = records.filter(row => row.valid && row.service === 'Creche' && validISODate(row.date));
  const dates = [...new Set(bookings.map(row => row.date))].sort();
  const unknown = records.some(row => row.service === null || row.status === null);
  return <div className="scheduled-pet-days" role="group" aria-label={example ? 'Dias agendados — dados ilustrativos de desenvolvimento' : 'Dias agendados'}>
    <div className="scheduled-days-list">
      {dates.map(date => {
        const label = date.split('-').reverse().join('/');
        return <div key={date} className="scheduled-day-card" role="group" aria-label={`Agendamentos de ${label}`}>
          <time dateTime={date}>{label}</time>
        </div>;
      })}
    </div>
    {unknown && <p role="status">Há registros com categoria ou situação desconhecida. A agenda exige revisão e não autoriza ações.</p>}
    {!dates.length && !unknown && <p>Nenhum dia agendado.</p>}
  </div>;
}
