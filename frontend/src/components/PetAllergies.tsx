import type { PetHealthCatalogController } from '../services/pet-health-catalog';
interface Props {
  selected: string[]; setSelected(values: string[]): void;
  others: boolean; description: string; setField(key: string, value: string): void;
  error?: string;
  catalog?: PetHealthCatalogController;
}

export function PetAllergies({ selected, setSelected, catalog, error }: Props) {
  return <div className="pet-allergies">
    <label>Selecionar alergia<select className="design-input" aria-label="Selecionar alergia" value="" onChange={e => {
      if (e.target.value === '__add__') catalog?.open('alergias', item => setSelected([...new Set([...selected, item.name])]));
      else if (e.target.value) setSelected([...new Set([...selected, e.target.value])]);
    }}><option value="">Selecione</option>{catalog?.data.alergias.filter(item => !selected.includes(item.name)).map(item => <option key={item.id} value={item.name}>{item.name}</option>)}<option value="__add__">Outros / adicionar nova alergia…</option></select></label>
    {error && <p className="pet-field-error" role="status">{error}</p>}
    {selected.length > 0 && <ul className="pet-allergy-list" aria-label="Alergias selecionadas">{selected.map(value => <li key={value}><span>{value}</span><button type="button" aria-label={`Remover alergia ${value}`} onClick={() => setSelected(selected.filter(item => item !== value))}>×</button></li>)}</ul>}
  </div>;
}
