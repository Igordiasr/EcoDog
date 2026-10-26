import { useEffect, useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { screens } from './screens/catalog';
import { ScreenPage } from './screens/ScreenPage';
import { DevelopmentNav } from './components/DevelopmentNav';
import { unavailableApi, type EcoDogApi, type Session } from './services/api';
import { unconfiguredHolidayCalendar, type HolidayCalendar } from './services/holidays';
import type { DashboardSource } from './services/dashboard-model';
import type { CalendarSource } from './services/calendar-model';
import type { PetHealthCatalogSource } from './services/pet-health-catalog';
import type { TutorScheduleSource } from './services/tutor-schedule';

export interface AppProps { api?: EcoDogApi; holidayCalendar?: HolidayCalendar; dashboardSource?: DashboardSource; calendarSource?: CalendarSource; petHealthCatalogSource?: PetHealthCatalogSource; tutorScheduleSource?: TutorScheduleSource }
export function App({ api = unavailableApi, holidayCalendar = unconfiguredHolidayCalendar, dashboardSource, calendarSource, petHealthCatalogSource, tutorScheduleSource }: AppProps) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let active = true;
    setSession(null); setLoading(true);
    api.session().then(s => { if (active) setSession(s); }).catch(() => { if (active) setSession(null); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [api]);
  return <>
    {import.meta.env.DEV && <DevelopmentNav />}
    <Routes>
    {screens.map(screen => <Route key={screen.id} path={screen.path} element={screen.profile && loading ? <p role="status">Carregando…</p> : screen.profile && session?.profile !== screen.profile ? <Navigate to="/entrar" replace /> : <ScreenPage key={`${screen.id}:${session?.userId ?? 'public'}:${session?.profile ?? ''}`} id={screen.id} api={api} session={session} holidayCalendar={holidayCalendar} dashboardSource={dashboardSource} calendarSource={calendarSource} petHealthCatalogSource={petHealthCatalogSource} tutorScheduleSource={tutorScheduleSource} onSession={setSession} />} />)}
    {import.meta.env.DEV && screens.map(screen => <Route key={`preview-${screen.id}`} path={`/prototipo/${screen.id}`} element={<ScreenPage key={`preview-${screen.id}`} id={screen.id} preview api={unavailableApi} onSession={() => {}} />} />)}
    <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </>;
}
