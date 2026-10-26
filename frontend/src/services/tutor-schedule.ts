import { useEffect, useState } from 'react';
import { IntegrationPending } from './api';
// Read model only: the published DTO has no reservation ID.
export interface TutorScheduleRecord { petId: string; petName?: string; service: 'Creche' | 'Hotel' | 'DayUse' | null; date: string; status?: string | null; valid: boolean }
export interface TutorScheduleSource { load(signal?: AbortSignal): Promise<TutorScheduleRecord[]> }
export function useTutorSchedule(enabled: boolean, preview: boolean, source?: TutorScheduleSource) {
  if (preview) source = undefined;
  const [data, setData] = useState<TutorScheduleRecord[] | null>(null);
  const [error, setError] = useState('');
  const example = import.meta.env.DEV && preview && !source;
  useEffect(() => {
    if (!enabled) return;
    let active = true; setData(null); setError('');
    const controller = new AbortController();
    const load = source ? source.load(controller.signal) : example ? import('./tutor-schedule-examples').then(module => module.tutorScheduleExamples()) : Promise.reject(new IntegrationPending());
    load.then(data => { if (active) setData(data); }).catch(error => { if (active) setError(error instanceof Error ? error.message : 'Não foi possível carregar os agendamentos.'); });
    return () => { active = false; controller.abort(); };
  }, [enabled, example, source]);
  return { data, error, example };
}
