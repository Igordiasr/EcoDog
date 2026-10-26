import { useEffect, useRef, useState } from 'react';
import { IntegrationPending } from './api';

export type PetCatalogKind = 'vacinas' | 'medicamentos' | 'alergias';
export interface PetCatalogItem { id: string; name: string }
export type PetHealthCatalog = Record<PetCatalogKind, PetCatalogItem[]>;
// Normalized frontend catalog, NOT a database schema or HTTP response contract.
export interface PetHealthCatalogSource {
  load(signal?: AbortSignal): Promise<PetHealthCatalog>;
  createItem?(kind: PetCatalogKind, name: string): Promise<PetCatalogItem>;
}
const empty = (): PetHealthCatalog => ({ vacinas: [], medicamentos: [], alergias: [] });
export const catalogNameKey = (name: string) => name.trim().replace(/\s+/g, ' ').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('pt-BR');
export function catalogNameError(name: string, items: PetCatalogItem[]) {
  if (!name.trim() || !/\p{L}/u.test(name)) return 'Informe um nome válido.';
  return items.some(item => catalogNameKey(item.name) === catalogNameKey(name)) ? 'Este item já está cadastrado.' : '';
}
export function usePetHealthCatalog(enabled: boolean, preview: boolean, source?: PetHealthCatalogSource) {
  if (preview) source = undefined;
  const [data, setData] = useState<PetHealthCatalog>(empty);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [editor, setEditor] = useState<{ kind: PetCatalogKind; name: string } | null>(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const inFlight = useRef(false), sequence = useRef(0);
  const onCreated = useRef<((item: PetCatalogItem) => void) | undefined>(undefined);
  const example = import.meta.env.DEV && preview && !source;
  useEffect(() => {
    if (!enabled) return;
    let active = true;
    const controller = new AbortController();
    setData(empty()); setLoading(true); setMessage('');
    const load = source ? source.load(controller.signal) : example ? import('./pet-health-examples').then(module => module.petHealthExamples()) : Promise.reject(new IntegrationPending());
    load.then(data => { if (active) setData(data); }).catch(error => { if (active) { setData(empty()); setMessage(error instanceof Error ? error.message : 'Não foi possível carregar o catálogo.'); } }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; controller.abort(); };
  }, [enabled, example, source]);
  const open = (kind: PetCatalogKind, callback?: (item: PetCatalogItem) => void) => { onCreated.current = callback; setError(''); setEditor({ kind, name: '' }); };
  const save = async () => {
    if (!editor || inFlight.current) return;
    const error = catalogNameError(editor.name, data[editor.kind]); setError(error);
    if (error) return;
    inFlight.current = true; setSaving(true);
    try {
      const name = editor.name.trim().replace(/\s+/g, ' ');
      const item = example ? { id: `local-catalog-${sequence.current++}`, name } : source?.createItem ? await source.createItem(editor.kind, name) : await Promise.reject(new IntegrationPending());
      setData(data => ({ ...data, [editor.kind]: [...data[editor.kind], item] }));
      onCreated.current?.(item);
      setMessage(example ? 'Item adicionado somente à prévia (memória). Não foi salvo no servidor.' : 'Cadastro confirmado pelo adaptador do catálogo.');
      setEditor(null);
    } catch (error) { setError(error instanceof Error ? error.message : 'Não foi possível cadastrar o item.'); }
    finally { inFlight.current = false; setSaving(false); }
  };
  return { data, loading, message, editor, setEditor, error, setError, saving, open, save, close: () => { if (!inFlight.current) setEditor(null); }, example };
}
export type PetHealthCatalogController = ReturnType<typeof usePetHealthCatalog>;
