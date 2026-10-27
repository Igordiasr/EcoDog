import { useEffect, useMemo, useRef, useState } from 'react';
import { createPresenceApi } from '../api/presence-api';

export function presenceDay(now = new Date()) {
    const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(now);
    const value = type => parts.find(part => part.type === type).value;
    return `${value('year')}-${value('month')}-${value('day')}`;
}
export const canCheckIn = pet => pet?.situacao === 'AGENDADO' && !pet.dataSaidaRaw;
export const canCheckOut = pet => pet?.situacao === 'CONFIRMADO' && !!pet.dataEntradaRaw && !pet.dataSaidaRaw;

export function usePresence(enabled, session) {
    const api = useMemo(() => createPresenceApi(import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080', undefined, session?.token), [session?.token]);
    const [day, setDay] = useState(presenceDay);
    const [pets, setPets] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);
    const [target, setTarget] = useState(null);
    const [responsible, setResponsible] = useState('');
    const lock = useRef(false);
    const generation = useRef(0);
    useEffect(() => {
        const timer = setInterval(() => setDay(presenceDay()), 60000);
        return () => clearInterval(timer);
    }, []);
    useEffect(() => {
        const version = ++generation.current;
        setPets([]);
        setTarget(null);
        setError('');
        if (!enabled) return;
        const controller = new AbortController();
        setLoading(true);
        api.list(day, controller.signal).then(data => { if (version === generation.current) setPets(data); })
            .catch(error => { if (!controller.signal.aborted) setError(error.message); })
            .finally(() => { if (!controller.signal.aborted) setLoading(false); });
        return () => { controller.abort(); ++generation.current; };
    }, [enabled, api, day]);
    const open = (pet, operation) => {
        if (lock.current || !(operation === 'checkIn' ? canCheckIn(pet) : canCheckOut(pet))) return;
        setResponsible('');
        setError('');
        setTarget({ pet, operation });
    };
    const save = async () => {
        if (!target || lock.current) return;
        const version = generation.current;
        lock.current = true;
        setSaving(true);
        setError('');
        try {
            await api[target.operation](target.pet.idAgendamento, responsible);
            if (version !== generation.current) return;
            setTarget(null);
            // Do not allow another write with stale data if the refresh fails.
            setPets([]);
            setLoading(true);
            const data = await api.list(day);
            if (version === generation.current) setPets(data);
        } catch (error) {
            if (version === generation.current) setError(error.message);
        } finally {
            lock.current = false;
            setSaving(false);
            if (version === generation.current) setLoading(false);
        }
    };
    return { pets, day, loading, error, saving, target, responsible, setResponsible, open, save, close: () => { if (!lock.current) setTarget(null); } };
}
