import { useRef, useState } from 'react';
import { PetField } from './PetField';
export function PetHealthSection({ kind, ctx }) {
    const [selection, setSelection] = useState(''), [details, setDetails] = useState({});
    const detailsRef = useRef(details);
    detailsRef.current = details;
    const label = { vacinas: 'vacina', medicamentos: 'medicamento', alergias: 'alergia' }[kind];
    const key = kind === 'vacinas' ? 'vacina' : 'remedio';
    const items = ctx.petHealthCatalog?.data[kind] || [];
    const records = kind === 'alergias' ? ctx.petAllergies || [] : ctx.petRecords[kind];
    const selectedNames = kind === 'alergias' ? records : records.map(id => ctx.fields[`${kind}.${id}.${key}`]);
    const catalog = ctx.petHealthCatalog;
    const editing = catalog?.editor?.inline && catalog.editor.kind === kind;
    const extras = kind === 'vacinas' ? [['data', 'Data'], ['validade', 'Validade (opcional)']] : kind === 'medicamentos' ? [['dosagem', 'Dosagem'], ['frequencia', 'Frequência']] : [];
    const add = (name, values = {}) => {
        if (ctx.busy) return;
        if (kind === 'alergias') ctx.setPetAllergies([...records, name]);
        else ctx.addHealthRecord(kind, { [key]: name, ...values });
    };
    return <div className={`pet-health-section pet-health-${kind}`}>
        <div className="pet-health-entry">
            <p className="pet-health-notice">Selecione um item para adicioná-lo à lista acima. Use “Outros” para cadastrar um novo.</p>
            <div className="pet-health-fields">
                <label className="pet-health-field">Selecionar {label}<select className="design-input" aria-label={`Selecionar ${label}`} value={editing ? '__other__' : selection} disabled={ctx.busy || (!items.length && !catalog?.example)} onChange={event => {
                    if (event.target.value === '__other__') { setDetails({}); catalog?.open(kind, item => { add(item.name, detailsRef.current); setDetails({}); }, true); }
                    else { catalog?.close(); add(event.target.value); setSelection(''); }
                }}><option value="">Selecione</option>{items.map(item => <option key={item.id} value={item.name} disabled={selectedNames.includes(item.name)}>{item.name}{selectedNames.includes(item.name) ? ' — já selecionado' : ''}</option>)}<option value="__other__">Outros · cadastrar novo</option></select></label>
            </div>
            {editing && <div className="pet-health-new">
                <h3>{kind === 'alergias' ? 'Nova alergia' : kind === 'vacinas' ? 'Nova vacina' : 'Novo remédio'}</h3>
                <div className="pet-health-field"><label htmlFor={`${kind}-new-name`}>{kind === 'alergias' ? 'Descreva a alergia' : `Nome ${kind === 'vacinas' ? 'da vacina' : 'do remédio'}`}</label><input id={`${kind}-new-name`} className="design-input" value={catalog.editor.name} disabled={ctx.busy || catalog.saving} aria-invalid={!!catalog.error} aria-describedby={catalog.error ? `${kind}-catalog-error` : undefined} onChange={event => { catalog.setEditor(editor => ({ ...editor, name: event.target.value })); catalog.setError(''); }}/></div>
                {extras.map(([field, title]) => <div className="pet-health-field" key={field}><label htmlFor={`${kind}-draft-${field}`}>{title}</label><PetField id={`${kind}-draft-${field}`} label={title} fieldKey={field} className="" value={details[field] || ''} onChange={value => setDetails(values => ({ ...values, [field]: value }))} readonly={ctx.busy || catalog.saving}/></div>)}
                {catalog.error && <p id={`${kind}-catalog-error`} className="pet-field-error" role="status">{catalog.error}</p>}
                <p className="pet-health-notice">O novo item aparece na lista acima após a confirmação.</p>
                <div className="pet-health-new-actions"><button type="button" className="management-button pet-health-add" disabled={ctx.busy || catalog.saving} onClick={() => void catalog.save()}>Adicionar {kind === 'medicamentos' ? 'remédio' : label} ao pet</button><button type="button" className="pet-health-remove" disabled={catalog.saving} onClick={catalog.close}>Cancelar</button></div>
            </div>}
        </div>
        {!items.length && <p className="pet-health-notice" role="status">Catálogo de {kind} indisponível. Nenhum registro de saúde será adicionado ou enviado.</p>}
        {!records.length && <p className="pet-health-empty">Nenhum item adicionado.</p>}
        <ul className="pet-health-cards" aria-label={{ vacinas: 'Vacinas adicionadas', medicamentos: 'Remédios controlados adicionados', alergias: 'Alergias adicionadas' }[kind]}>{records.map(record => {
            const name = kind === 'alergias' ? record : ctx.fields[`${kind}.${record}.${key}`];
            return <li key={record}>
                <div className="pet-health-card-header"><strong>{name}</strong><button type="button" className="pet-health-remove" disabled={ctx.busy} aria-label={`Remover ${name}`} onClick={() => kind === 'alergias' ? ctx.setPetAllergies(records.filter(item => item !== record)) : ctx.removePetRecord(kind, record)}>Remover</button></div>
                {kind !== 'alergias' && <div className="pet-health-fields">{extras.map(([field, title]) => <div className="pet-health-field" key={field}><label htmlFor={`${kind}-${record}-${field}`}>{title}</label><PetField id={`${kind}-${record}-${field}`} label={title} fieldKey={field} className="" value={ctx.fields[`${kind}.${record}.${field}`] || ''} required={field !== 'validade'} error={ctx.petErrors?.[`${kind}.${record}.${field}`]} readonly={ctx.busy} onChange={value => ctx.setField(`${kind}.${record}.${field}`, value)}/></div>)}</div>}
            </li>;
        })}</ul></div>;
}
