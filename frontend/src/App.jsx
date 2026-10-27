import { useEffect, useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { screens } from './views/screens/catalog';
import { ScreenPage } from './views/screens/ScreenPage';
import { DevelopmentNav } from './views/components/DevelopmentNav';
import { unavailableApi } from './models/api';
import { unconfiguredHolidayCalendar } from './models/holidays';
export function App({ api = unavailableApi, holidayCalendar = unconfiguredHolidayCalendar, dashboardSource, calendarSource, petHealthCatalogSource, tutorScheduleSource }) {
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        let active = true;
        api.session().then(s => { if (active)
            setSession(s); }).catch(() => { if (active)
            setSession(null); }).finally(() => { if (active)
            setLoading(false); });
        return () => { active = false; };
    }, [api]);
    return <>
    {import.meta.env.DEV && <DevelopmentNav />}
    <Routes>
    {screens.map(screen => <Route key={screen.id} path={screen.path} element={screen.profile && loading ? <p role="status">Carregando…</p> : screen.profile && session?.profile !== screen.profile ? <Navigate to="/entrar" replace/> : <ScreenPage id={screen.id} api={api} session={session} holidayCalendar={holidayCalendar} dashboardSource={dashboardSource} calendarSource={session?.profile === 'admin' ? calendarSource : undefined} petHealthCatalogSource={petHealthCatalogSource} tutorScheduleSource={tutorScheduleSource} onSession={setSession}/>}/>)}

    <Route path="*" element={<Navigate to="/" replace/>}/>
    </Routes>
  </>;
}
