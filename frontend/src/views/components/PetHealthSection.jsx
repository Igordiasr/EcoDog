import { useState } from 'react';
import { PetField } from './PetField';
export function PetHealthSection({ kind, ctx }) {
    const [selection, setSelection] = useState(''), [details, setDetails] = useState({});
    const label = { vacinas: 'vacina', medicamentos: 'medicamento', alergias: 'alergia' }[kind];
    const key = kind === 'vacinas' ? 'vacina' : 'remedio';
    const items = ctx.petHealthCatalog?.data[kind] || [];
    const records = kind === 'alergias' ? ctx.petAllergies || [] : ctx.petRecords[kind];
    const selectedNames = kind === 'alergias' ? records : records.map(id => ctx.fields[`${kind}.${id}.${key}`]);
    const valid = items.some(item => item.name === selection) && !selectedNames.includes(selection);
    const extras = kind === 'vacinas' ? [['data', 'Data'], ['validade', 'Validade (opcional)']] : kind === 'medicamentos' ? [['dosagem', 'Dosagem'], ['frequencia', 'Frequência']] : [];
    const add = () => {
        if (!valid || ctx.busy) return;
        if (kind === 'alergias') ctx.setPetAllergies([...records, selection]);
        else ctx.addHealthRecord(kind, { [key]: selection, ...details });
        setSelection(''); setDetails({});
    };
    return <div className="pet-health-section"><label>Selecionar {label}<select className="design-input" aria-label={`Selecionar ${label}`} value={selection} disabled={ctx.busy || !items.length} onChange={event => setSelection(event.target.value)}><option value="">Selecione</option>{items.filter(item => !selectedNames.includes(item.name)).map(item => <option key={item.id} value={item.name}>{item.name}</option>)}</select></label>
        {extras.map(([field, title]) => <div key={field}><label htmlFor={`${kind}-draft-${field}`}>{title}</label><PetField id={`${kind}-draft-${field}`} label={title} fieldKey={field} className="" value={details[field] || ''} onChange={value => setDetails(values => ({ ...values, [field]: value }))} readonly={ctx.busy || !items.length}/></div>)}
        <button type="button" className="management-button" disabled={!valid || ctx.busy} onClick={add}>Adicionar</button>
        {!items.length && <p role="status">Catálogo de {kind} indisponível. Nenhum registro de saúde será adicionado ou enviado.</p>}
        {!records.length && <p>Nenhum item adicionado.</p>}
        <ul className="pet-health-cards">{records.map(record => {
            const name = kind === 'alergias' ? record : ctx.fields[`${kind}.${record}.${key}`];
            return <li key={record}><strong>{name}</strong>{kind !== 'alergias' && extras.map(([field, title]) => <div key={field}><label htmlFor={`${kind}-${record}-${field}`}>{title}</label><PetField id={`${kind}-${record}-${field}`} label={title} fieldKey={field} className="" value={ctx.fields[`${kind}.${record}.${field}`] || ''} required={field !== 'validade'} error={ctx.petErrors?.[`${kind}.${record}.${field}`]} readonly={ctx.busy} onChange={value => ctx.setField(`${kind}.${record}.${field}`, value)}/></div>)}<button type="button" disabled={ctx.busy} aria-label={`Remover ${name}`} onClick={() => kind === 'alergias' ? ctx.setPetAllergies(records.filter(item => item !== record)) : ctx.removePetRecord(kind, record)}>Remover {name}</button></li>;
        })}</ul></div>;
}
