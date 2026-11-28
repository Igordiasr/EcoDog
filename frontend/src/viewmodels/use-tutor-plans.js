import { useEffect, useState } from 'react';
import { loadTutorPlans } from '../api/tutor-plans-api';

export function useTutorPlans(session) {
    const key = `${session?.token}:${session?.id}`;
    const [state, setState] = useState({ key: null, plans: [], loading: true, error: '' });
    const [attempt, setAttempt] = useState(0);
    useEffect(() => {
        const controller = new AbortController();
        setState({ key, plans: [], loading: true, error: '' });
        loadTutorPlans(import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080', session, controller.signal)
            .then(plans => { if (!controller.signal.aborted) setState({ key, plans, loading: false, error: '' }); })
            .catch(error => { if (!controller.signal.aborted) setState({ key, plans: [], loading: false, error: error.message }); });
        return () => controller.abort();
    }, [key, attempt]);
    return { ...(state.key === key ? state : { plans: [], loading: true, error: '' }), reload: () => setAttempt(value => value + 1) };
}
