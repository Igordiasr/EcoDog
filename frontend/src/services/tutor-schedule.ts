import { useEffect, useState } from 'react';
import type { DashboardReservation } from './dashboard-model';
import { IntegrationPending } from './api';
// Reuses the normalized reservation model. The adapter must enforce tutor ownership.
export interface TutorScheduleSource { load(): Promise<DashboardReservation[]> }
export function useTutorSchedule(enabled: boolean, preview: boolean, source?: TutorScheduleSource) {
  const [data, setData] = useState<DashboardReservation[] | null>(null);
  const [error, setError] = useState('');
  const example = import.meta.env.DEV && preview && !source;
  useEffect(() => {
    if (!enabled) return;
    let active = true; setData(null); setError('');
    const load = source ? source.load() : example ? import('./tutor-schedule-examples').then(module => module.tutorScheduleExamples()) : Promise.reject(new IntegrationPending());
    load.then(data => { if (active) setData(data); }).catch(error => { if (active) setError(error instanceof Error ? error.message : 'Não foi possível carregar os agendamentos.'); });
    return () => { active = false; };
  }, [enabled, example, source]);
  return { data, error, example };
}
