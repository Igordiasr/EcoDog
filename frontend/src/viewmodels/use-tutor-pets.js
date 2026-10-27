import { useEffect, useState } from 'react';
import { loadTutorPets } from '../models/tutor-pets';

export function useTutorPets(enabled, session) {
    const [state, setState] = useState({ key: null, pets: [], loading: true, error: '' });
    const [attempt, setAttempt] = useState(0);
    const key = session?.token;
    useEffect(() => {
        if (!enabled) return;
        const controller = new AbortController();
        setState({ key, pets: [], loading: true, error: '' });
        loadTutorPets(import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080', session, controller.signal)
            .then(pets => { if (!controller.signal.aborted) setState({ key, pets, loading: false, error: '' }); })
            .catch(error => { if (!controller.signal.aborted) setState({ key, pets: [], loading: false, error: error.message }); });
        return () => controller.abort();
    }, [enabled, key, session?.id, attempt]);
    return { ...(state.key === key ? state : { pets: [], loading: true, error: '' }), reload: () => setAttempt(value => value + 1) };
}
