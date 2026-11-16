import { useCallback, useEffect, useMemo, useState } from 'react';
import { createPlanosApi } from '../api/planos-api';
import { planRequest, validatePlan } from '../models/plano-validation';

const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
const blankForm = () => ({ nome: '', idServico: '', diarias: '1', valor: '' });

export function usePlanos(enabled, session) {
  const api = useMemo(() => createPlanosApi(baseUrl, session?.token), [session?.token]);
  const [planos, setPlanos] = useState([]);
  const [servicos, setServicos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [formError, setFormError] = useState('');
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(blankForm);
  const [fieldErrors, setFieldErrors] = useState({});

  const reload = useCallback(async (signal) => {
    setLoading(true);
    setError('');
    try {
      const result = await api.list(signal);
      if (!Array.isArray(result)) throw new Error('Resposta inesperada ao carregar planos.');
      setPlanos(result);
    } catch (cause) {
      if (!signal?.aborted) setError(cause.message || 'Não foi possível carregar os planos.');
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    if (!enabled || !session?.token) return undefined;
    const controller = new AbortController();
    void reload(controller.signal);
    return () => controller.abort();
  }, [enabled, session?.token, reload]);

  const openCreate = useCallback(async () => {
    setForm(blankForm());
    setFieldErrors({});
    setFormError('');
    setModal({ type: 'create' });
    try {
      const result = await api.listServices();
      setServicos(Array.isArray(result) ? result : []);
      if (!Array.isArray(result)) setFormError('Não foi possível carregar os serviços ativos.');
    } catch (cause) {
      setFormError(cause.message || 'Não foi possível carregar os serviços ativos.');
    }
  }, [api]);

  const openEdit = useCallback(async (plano) => {
    setForm({ nome: plano.nome ?? '', idServico: String(plano.idServico ?? ''), diarias: String(plano.diarias ?? ''), valor: String(plano.valor ?? '') });
    setFieldErrors({});
    setFormError('');
    setModal({ type: 'edit', id: plano.id, ativo: plano.ativo });
    try {
      const result = await api.listServices();
      setServicos(Array.isArray(result) ? result : []);
    } catch (cause) {
      setFormError(cause.message || 'Não foi possível carregar os serviços ativos.');
    }
  }, [api]);

  const closeModal = useCallback(() => { if (!saving) setModal(null); }, [saving]);
  const setField = useCallback((name, value) => {
    setForm(current => ({ ...current, [name]: value }));
    setFieldErrors(current => ({ ...current, [name]: '' }));
  }, []);

  const save = useCallback(async (event) => {
    event?.preventDefault();
    const errors = validatePlan(form);
    setFieldErrors(errors);
    if (Object.keys(errors).length) return;
    setSaving(true);
    setFormError('');
    try {
      const payload = { ...planRequest(form), ...(modal.type === 'edit' ? { ativo: modal.ativo } : {}) };
      if (modal.type === 'edit') await api.update(modal.id, payload);
      else await api.create(payload);
      setModal(null);
      await reload();
    } catch (cause) {
      setFormError(cause.message || 'Não foi possível salvar o plano.');
    } finally { setSaving(false); }
  }, [api, form, modal, reload]);

  const toggleActive = useCallback(async (plano) => {
    setError('');
    try {
      const updated = await api.toggleActive(plano.id);
      setPlanos(current => current.map(item => item.id === plano.id ? updated : item));
    } catch (cause) { setError(cause.message || 'Não foi possível alterar o status.'); }
  }, [api]);

  const remove = useCallback(async (plano) => {
    if (!window.confirm(`Excluir o plano “${plano.nome}”?`)) return;
    setError('');
    try {
      await api.remove(plano.id);
      setPlanos(current => current.filter(item => item.id !== plano.id));
    } catch (cause) { setError(cause.message || 'Não foi possível excluir o plano.'); }
  }, [api]);

  return { planos, servicos, loading, saving, error, modal, form, fieldErrors, formError,
    reload, openCreate, openEdit, closeModal, setField, save, toggleActive, remove };
}
