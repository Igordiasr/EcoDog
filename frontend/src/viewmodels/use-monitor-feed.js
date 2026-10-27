import { useEffect, useMemo, useRef, useState } from 'react';
import { createMonitorFeedApi } from '../api/monitor-feed-api';
import { presenceDay } from './use-presence';

export function useMonitorFeed(enabled, petId, session) {
    const api = useMemo(() => createMonitorFeedApi(import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080', undefined, session?.token), [session?.token]);
    const [data, setData] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [day, setDay] = useState(presenceDay);
    const generation = useRef(0);
    const lock = useRef(false);
    useEffect(() => {
        if (!enabled) return;
        const timer = setInterval(() => setDay(presenceDay()), 60000);
        return () => clearInterval(timer);
    }, [enabled]);
    useEffect(() => {
        const version = ++generation.current;
        setData(null);
        setError('');
        setLoading(false);
        if (!enabled) return;
        if (!Number.isSafeInteger(petId) || petId <= 0) {
            setError('Selecione um pet na tela de check-in para consultar sua rotina.');
            return;
        }
        const controller = new AbortController();
        setLoading(true);
        Promise.all([api.pet(petId, controller.signal), api.activities(petId, controller.signal), api.medication(petId, controller.signal)])
            .then(([pet, activities, medication]) => { if (version === generation.current) setData({ pet, activities, medication }); })
            .catch(error => { if (!controller.signal.aborted) setError(error.message); })
            .finally(() => { if (!controller.signal.aborted) setLoading(false); });
        return () => { controller.abort(); ++generation.current; };
    }, [enabled, petId, api, day]);
    const save = async (record, values) => {
        if (!enabled || !data || lock.current || record.unavailable) return false;
        const version = generation.current;
        lock.current = true;
        setSaving(true);
        try {
            const observation = values.observacoes || '';
            const positive = values.medicacao === 'Tomou' || values.participacao === 'Participou' || values.refeicao === 'Se alimentou';
            const detail = positive && observation.trim() ? `${record.name}: ${observation.trim()}` : '';
            if (detail.length > 200) throw new Error('O nome do cuidado e sua observação devem somar até 200 caracteres.');
            if (record.kind === 'observation') await api.observation(petId, observation);
            else if (record.kind === 'medication') await api.updateMedication(petId, record.id, { Tomou: 'TOMOU', 'Não tomou': 'NAO_TOMOU' }[values.medicacao], observation);
            else await api.updateActivity(petId, record.id, { Participou: 'PARTICIPOU', 'Não participou': 'NAO_PARTICIPOU', 'Se alimentou': 'PARTICIPOU', Recusou: 'NAO_PARTICIPOU' }[values.participacao || values.refeicao], observation);
            // Positive outcomes currently discard observations in the PUT endpoints.
            // Store the contextual detail in the diary's general observations instead.
            if (detail) await api.observation(petId, detail);
            return version === generation.current;
        } finally {
            lock.current = false;
            setSaving(false);
        }
    };
    return { data, error, loading, saving, save, day };
}
