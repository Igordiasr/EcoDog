import { useCallback, useEffect, useMemo, useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { screens } from './views/screens/catalog';
import { ScreenPage } from './views/screens/ScreenPage';
import { DevelopmentNav } from './views/components/DevelopmentNav';
import { authApi } from './models/auth';
import { unconfiguredHolidayCalendar } from './models/holidays';
import { createDashboardSource } from './api/dashboard-source';
export function App({ api = authApi, holidayCalendar = unconfiguredHolidayCalendar, dashboardSource: providedDashboardSource, calendarSource, petHealthCatalogSource, tutorScheduleSource }) {
    const [session, setSession] = useState(null);
    const expireSession = useCallback(() => {
        void api.logout();
        setSession(null);
    }, [api]);
    const dashboardSource = useMemo(() => providedDashboardSource ?? (session?.profile === 'admin' && session?.token
        ? createDashboardSource(import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080', undefined, session.token, expireSession)
        : undefined), [providedDashboardSource, session?.profile, session?.token, expireSession]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        let active = true;
        api.session().then(s => { if (active)
            setSession(s); }).catch(() => { if (active)
            setSession(null); }).finally(() => { if (active)
            setLoading(false); });
        return () => { active = false; };
    }, [api]);
    useEffect(() => {
        if (!session?.expiresAt) return;
        const timer = setTimeout(expireSession, Math.max(0, session.expiresAt - Date.now()));
        return () => clearTimeout(timer);
    }, [expireSession, session]);
    return <>
    {import.meta.env.DEV && <DevelopmentNav />}
    <Routes>
    {screens.map(screen => <Route key={screen.id} path={screen.path} element={screen.profile && loading ? <p role="status">Carregando…</p> : screen.profile && session?.profile !== screen.profile ? <Navigate to="/entrar" replace/> : <ScreenPage id={screen.id} api={api} session={session} holidayCalendar={holidayCalendar} dashboardSource={dashboardSource} calendarSource={session?.profile === 'admin' ? calendarSource : undefined} petHealthCatalogSource={petHealthCatalogSource} tutorScheduleSource={tutorScheduleSource} onSession={setSession}/>}/>)}

    <Route path="*" element={<Navigate to="/" replace/>}/>
    </Routes>
  </>;
}
