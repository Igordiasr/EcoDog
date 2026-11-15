import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { content, nodes, fieldKey } from '../views/design/types';
import { requestJson } from '../api/http';
import { HttpError } from '../api/http';

export function usePlanos(api, session, preview = false) {
    const navigate = useNavigate();
    const location = useLocation();
    const [currentUser, setCurrentUser] = useState(null);
    useEffect(() => {
        setCurrentUser(null);
        if (!session?.token || preview) return;
        const controller = new AbortController();
        loadCurrentUserName(import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080', session, controller.signal)
            .then(name => { if (!controller.signal.aborted) setCurrentUser({ token: session.token, name }); })
            .catch(() => {});
        return () => controller.abort();
    }, [session?.token, session?.id, preview]);

    const [planos, setPlanos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);
    const [dialog, setDialog] = useState('');
    const [dialogDesign, setDialogDesign] = useState(null);
    const [dialogFields, setDialogFields] = useState({});
    const [editingId, setEditingId] = useState(null);
    const [confirmAction, setConfirmAction] = useState(null);
    const [dialogOperation, setDialogOperation] = useState(''); // 'createPlan' | 'editPlan' | 'toggleAtivo' | 'deletePlan'

    const loadPlanos = async () => {
        setLoading(true);
        setError('');
        setPlanos([]);
        try {
            const token = session?.token || '';
            const raw = await requestJson(import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080', '/api/planos', {
                method: 'GET',
                headers: token ? { Authorization: `Bearer ${token}` } : {}
            });
            // Parse the response - assuming it returns an array or has a structure
            let data = [];
            if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
                // Handle response format
                data = raw.planos || [];
            } else if (Array.isArray(raw)) {
                data = raw;
            }
            setPlanos(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Não foi possível carregar os planos');
            console.error('Erro ao carregar planos:', err);
        } finally {
            setLoading(false);
        }
    };

    const savePlan = async (planData, isEdit = false, targetId = null) => {
        setSaving(true);
        setError('');
        try {
            const token = session?.token || '';
            const method = isEdit ? 'PUT' : 'POST';
            const path = targetId ? `/api/planos/${targetId}` : '/api/planos';

            const raw = await requestJson(import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080', path, {
                method: method,
                headers: token ? { Authorization: `Bearer ${token}` } : {},
                body: JSON.stringify(planData)
            });

            // Refresh the plans list after save
            await loadPlanos();
            setDialog('');
            setDialogDesign(null);
            setDialogFields({});
            setSaving(false);
            return { success: true, message: 'Plano salvo com sucesso!' };
        } catch (err) {
            setError(err instanceof HttpError ? err.message : 'Não foi possível salvar o plano');
            setSaving(false);
            return { success: false, message: err instanceof Error ? err.message : 'Erro desconhecido' };
        }
    };

    const togglePlanAtivo = async (planId) => {
        setSaving(true);
        setError('');
        try {
            const token = session?.token || '';
            const raw = await requestJson(import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080', `/api/planos/${planId}/ativo`, {
                method: 'PATCH',
                headers: token ? { Authorization: `Bearer ${token}` } : {}
            });

            await loadPlanos();
            setSaving(false);
            return { success: true, message: 'Status do plano alterado com sucesso!' };
        } catch (err) {
            setError(err instanceof HttpError ? err.message : 'Não foi possível alterar o status');
            setSaving(false);
            return { success: false, message: err instanceof Error ? err.message : 'Erro desconhecido' };
        }
    };

    const deletePlan = async (planId) => {
        setConfirmAction(null);
        setSaving(true);
        setError('');
        try {
            const token = session?.token || '';
            const raw = await requestJson(import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080', `/api/planos/${planId}`, {
                method: 'DELETE',
                headers: token ? { Authorization: `Bearer ${token}` } : {}
            });

            await loadPlanos();
            setSaving(false);
            return { success: true, message: 'Plano excluído com sucesso!' };
        } catch (err) {
            setError(err instanceof HttpError ? err.message : 'Não foi possível excluir o plano');
            setSaving(false);
            return { success: false, message: err instanceof Error ? err.message : 'Erro desconhecido' };
        }
    };

    const openDialog = async (key, planData = null) => {
        setMessage('');
        setDialogStep(0);
        setDialog(key);
        setDialogDesign(null);
        setDialogFields({});
        setEditingId(planData?.id || null);

        if (key === 'createPlan') {
            setDialogOperation('createPlan');
            // Load services for the select
            try {
                const token = session?.token || '';
                const raw = await requestJson(import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080', '/api/planos/servicos-ativos', {
                    method: 'GET',
                    headers: token ? { Authorization: `Bearer ${token}` } : {}
                });
                // Set services in dialog fields
                if (raw && raw.servicos) {
                    setDialogFields(current => ({ ...current, servicos: raw.servicos }));
                }
            } catch (err) {
                console.error('Erro ao carregar serviços:', err);
            }
        }

        if (key === 'editPlan' && planData) {
            setDialogOperation('editPlan');
            setEditingId(planData.id);
            // Pre-fill the form with plan data
            setDialogFields(current => ({
                ...current,
                id: planData.id,
                nome: planData.nome,
                idServico: planData.idServico,
                diarias: planData.diarias,
                valor: planData.valor,
                ativo: planData.ativo
            }));
        }
    };

    const closeDialog = () => {
        setDialog('');
        setDialogDesign(null);
        setDialogFields({});
        setEditingId(null);
        setDialogOperation('');
    };

    const handleAction = async (operation) => {
        if (busy || needsValidation && !validate(operation === 'savePet'))
            return;

        setBusy(true);
        setMessage('');

        try {
            let result;
            switch (dialogOperation) {
                case 'createPlan':
                    result = await savePlan(dialogFields, false);
                    break;
                case 'editPlan':
                    if (editingId !== null) {
                        result = await savePlan(dialogFields, true, editingId);
                    }
                    break;
                case 'toggleAtivo':
                    result = await togglePlanAtivo(editingId);
                    break;
                case 'deletePlan':
                    result = await deletePlan(editingId);
                    break;
                default:
                    close();
                    return;
            }

            if (result.success) {
                setMessage(result.message);
                close();
            } else {
                setMessage(result.message);
            }
        } catch (err) {
            setMessage(err instanceof Error ? err.message : 'Não foi possível concluir a operação');
        } finally {
            setBusy(false);
        }
    };

    const busy = useRef(false);
    busy.current = saving || loading;

    const validate = (keys) => {
        // Basic validation - check required fields
        const required = ['nome', 'idServico', 'diarias', 'valor'];
        const errors = {};
        required.forEach(field => {
            if (!dialogFields[field]) {
                errors[field] = `O campo ${field} é obrigatório`;
            }
        });
        setErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const [errors, setErrors] = useState({});

    const referenceDate = mode === 'editGoal' || mode === 'loadedGoal' ? values['mes-cadastrado'] : `${values.ano}-${values.mes}-01`;

    return {
        planos,
        loading,
        error,
        dialog,
        dialogDesign,
        dialogFields,
        editingId,
        confirmAction,
        dialogOperation,
        savePlan,
        togglePlanAtivo,
        deletePlan,
        openDialog,
        closeDialog,
        handleAction,
        busy: busy.current,
        errors,
        loadPlanos
    };
}