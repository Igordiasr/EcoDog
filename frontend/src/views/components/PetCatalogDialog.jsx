import { Modal } from './Modal';
export function PetCatalogDialog({ catalog }) {
    if (!catalog.editor)
        return null;
    const label = { vacinas: 'vacina', medicamentos: 'medicamento', alergias: 'alergia' }[catalog.editor.kind];
    return <Modal title={`Adicionar ${label}`} onClose={catalog.close}><form className="dialog-content pet-catalog-dialog" onSubmit={e => { e.preventDefault(); void catalog.save(); }}><h2>Adicionar {label}</h2><label>Nome da {label === 'medicamento' ? 'medicação' : label}<input className="design-input" aria-label="Nome do item" value={catalog.editor.name} aria-invalid={!!catalog.error} aria-describedby={catalog.error ? 'catalog-error' : undefined} onChange={e => { const name = e.target.value; catalog.setEditor(editor => editor && ({ ...editor, name })); catalog.setError(''); }}/></label>{catalog.error && <p id="catalog-error" className="pet-field-error" role="status">{catalog.error}</p>}<div className="dialog-actions"><button type="button" disabled={catalog.saving} onClick={catalog.close}>Cancelar</button><button type="submit" disabled={catalog.saving}>Salvar item</button></div></form></Modal>;
}
