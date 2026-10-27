import { useEffect, useState } from 'react';
import { createPetDiaryApi } from '../api/pet-diary-api';
import { loadTutorPets } from '../models/tutor-pets';
import { presenceDay } from './use-presence';

export function usePetDiary(enabled, requestedId, day, session) {
    const [state, setState] = useState({ data: null, pet: null, loading: false, error: '' });
    useEffect(() => {
        if (!enabled) return;
        const controller = new AbortController();
        const base = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
        setState({ data: null, pet: null, loading: true, error: '' });
        (async () => {
            const pets = await loadTutorPets(base, session, controller.signal);
            const pet = requestedId ? pets.find(p => p.idPet === requestedId) : pets[0];
            if (!pet) throw new Error('Selecione um dos seus pets para consultar o diário.');
            const api = createPetDiaryApi(base, undefined, session?.token);
            const data = await (day === presenceDay() ? api.day(pet.idPet, day, controller.signal) : api.historyDay(pet.idPet, day, controller.signal));
            if (!controller.signal.aborted) setState({ data, pet, loading: false, error: '' });
        })().catch(error => { if (!controller.signal.aborted) setState({ data: null, pet: null, loading: false, error: error.message }); });
        return () => controller.abort();
    }, [enabled, requestedId, day, session?.token, session?.id]);
    return state;
}
