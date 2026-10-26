import { useState } from 'react';
import { maskPetDate, maskPetPhone, validatePetField } from '../services/pet-validation';

interface PetFieldProps {
  id: string; label: string; fieldKey: string; className: string; placeholder: string;
  value: string; onChange(value: string): void; required: boolean; error?: string; readonly?: boolean;
  options?: string[]; onAdd?(): void;
}

export function PetField({ id, label, fieldKey, className, placeholder, value, onChange, required, error, readonly, options, onAdd }: PetFieldProps) {
  const [touched, setTouched] = useState(false);
  const date = /nascimento|^data$|^validade$/.test(fieldKey);
  const phone = /contato|telefone/.test(fieldKey);
  const textarea = /obs|relacionamento/.test(fieldKey);
  const message = error || (touched || value ? validatePetField(fieldKey, value, required) : '');
  const props = {
    id, name: id, 'aria-label': label, className: `${className} design-input`, value,
    required, disabled: readonly, 'aria-invalid': !!message, 'aria-describedby': message ? `${id}-error` : undefined,
    onBlur: () => setTouched(true),
    onPaste: (e: React.ClipboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      if (!date && !phone) return;
      e.preventDefault();
      const input = e.currentTarget;
      const raw = input.value.slice(0, input.selectionStart ?? 0) + e.clipboardData.getData('text') + input.value.slice(input.selectionEnd ?? input.value.length);
      const next = date ? maskPetDate(raw) : maskPetPhone(raw);
      input.value = next;
      setTouched(true);
      onChange(next);
    },
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setTouched(true);
      const next = date ? maskPetDate(e.target.value) : phone ? maskPetPhone(e.target.value) : e.target.value;
      e.target.value = next;
      onChange(next);
    },
  };
  return <div className="pet-field-control">
    <label htmlFor={id} className="sr-only">{label}</label>
    {options ? <select {...props} onPaste={undefined} onChange={e => { if (e.target.value === '__add__') onAdd?.(); else { setTouched(true); onChange(e.target.value); } }}><option value="">Selecione</option>{value && !options.includes(value) && <option value={value}>{value}</option>}{options.map(option => <option key={option}>{option}</option>)}<option value="__add__">Adicionar novo item…</option></select>
      : textarea ? <textarea {...props} placeholder={placeholder} rows={2} /> : <input {...props} type={phone ? 'tel' : 'text'} inputMode={date || phone ? 'numeric' : undefined} maxLength={date ? 10 : undefined} placeholder={date ? 'dd/mm/aaaa' : placeholder} />}
    {message && <p id={`${id}-error`} className="pet-field-error" role="status">{message}</p>}
  </div>;
}
