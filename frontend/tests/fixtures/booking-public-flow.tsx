import { createRoot } from 'react-dom/client';
import { PublicBookingAvailability } from '../../src/components/PublicBookingAvailability';
import { ScheduledPetDays } from '../../src/components/ScheduledPetDays';
import { cancellationIntegrationNotice, parseTutorSchedule } from '../../src/services/booking-api';

// Isolated presentation fixtures, not a claim of production authentication.
const params = new URLSearchParams(location.search);
const rows = parseTutorSchedule([{ data: '2026-08-14', idPet: 19, nomePet: 'Pet de teste', servico: 'CRECHE', situacaoAgendamento: 'AGENDADO' }], '2026-08');
createRoot(document.getElementById('root')!).render(params.has('agenda')
  ? <><ScheduledPetDays records={rows} error="" example={false} /><p>{cancellationIntegrationNotice}</p></>
  : <PublicBookingAvailability baseUrl={params.get('base') || ''} />);
