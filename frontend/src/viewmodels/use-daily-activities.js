import { useEffect, useMemo, useRef, useState } from 'react';
import { createDailyActivitiesApi } from '../api/daily-activities-api';
import { createMonitorFeedApi } from '../api/monitor-feed-api';
import { presenceDay } from './use-presence';

export function visibleDailyActivities(data, completed) {
    return (data?.atividadesDoDia || []).filter(activity => completed ? activity.situacao === 'CONCLUIDA' : activity.situacao !== 'CONCLUIDA');
}

export function useDailyActivities(enabled, session) {
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
    const api = useMemo(() => createDailyActivitiesApi(baseUrl, undefined, session?.token), [baseUrl, session?.token]);
    const feed = useMemo(() => createMonitorFeedApi(baseUrl, undefined, session?.token), [baseUrl, session?.token]);
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);
    const [completed, setCompleted] = useState(false);
    const [expanded, setExpanded] = useState(null);
    const [day, setDay] = useState(presenceDay);
    const [refresh, setRefresh] = useState(0);
    const [detailsPet, setDetailsPet] = useState(null);
    const [details, setDetails] = useState(null);
    const [detailsError, setDetailsError] = useState('');
    const lock = useRef(false);
    const generation = useRef(0);
    useEffect(() => {
        if (!enabled) return;
        const timer = setInterval(() => setDay(presenceDay()), 60000);
        return () => clearInterval(timer);
    }, [enabled]);
    useEffect(() => {
        const version = ++generation.current;
        setData(null);
        setError('');
        setDetailsPet(null);
        if (!enabled) return;
        const controller = new AbortController();
        setLoading(true);
        api.today(controller.signal).then(result => {
            if (version !== generation.current) return;
            setData(result);
        }).catch(error => { if (!controller.signal.aborted) setError(error.message); })
            .finally(() => { if (!controller.signal.aborted) setLoading(false); });
        return () => { controller.abort(); ++generation.current; };
    }, [enabled, api, day, refresh]);
    useEffect(() => {
        setDetails(null);
        setDetailsError('');
        if (!detailsPet) return;
        const controller = new AbortController();
        feed.pet(detailsPet.idPet, controller.signal).then(result => { if (!controller.signal.aborted) setDetails(result); })
            .catch(error => { if (!controller.signal.aborted) setDetailsError(error.message); });
        return () => controller.abort();
    }, [detailsPet, feed]);
    const activities = visibleDailyActivities(data, completed);
    const activeId = activities.some(activity => activity.idAtividadeDoDia === expanded) ? expanded : activities[0]?.idAtividadeDoDia;
    const complete = async id => {
        const activity = data?.atividadesDoDia.find(activity => activity.idAtividadeDoDia === id);
        if (!enabled || lock.current || !activity || activity.situacao === 'CONCLUIDA') return;
        const version = generation.current;
        lock.current = true;
        setSaving(true);
        setError('');
        try {
            await api.complete(id);
            if (version !== generation.current) return;
            // Refresh authoritative status; never keep actionable stale cards after a failed refresh.
            setData(null);
            setLoading(true);
            const result = await api.today();
            if (version === generation.current) setData(result);
        } catch (error) {
            if (version === generation.current) setError(error.message);
        } finally {
            lock.current = false;
            setSaving(false);
            if (version === generation.current) setLoading(false);
        }
    };
    return { data, activities, activeId, loading, error, saving, completed, toggleCompleted: () => { setCompleted(value => !value); setExpanded(null); }, expand: setExpanded, complete, retry: () => setRefresh(value => value + 1), detailsPet, details, detailsError, openPet: setDetailsPet, closePet: () => setDetailsPet(null) };
}
