import { useEffect, useState } from 'react';
import { IntegrationPending } from '../models/api';
export function useTutorSchedule(enabled, preview, source) {
    const [data, setData] = useState(null);
    const [error, setError] = useState('');
    const example = import.meta.env.DEV && preview && !source;
    useEffect(() => {
        if (!enabled)
            return;
        let active = true;
        setData(null);
        setError('');
        const load = source ? source.load() : example ? import('../models/tutor-schedule-examples').then(module => module.tutorScheduleExamples()) : Promise.reject(new IntegrationPending());
        load.then(data => { if (active)
            setData(data); }).catch(error => { if (active)
            setError(error instanceof Error ? error.message : 'Não foi possível carregar os agendamentos.'); });
        return () => { active = false; };
    }, [enabled, example, source]);
    return { data, error, example };
}
