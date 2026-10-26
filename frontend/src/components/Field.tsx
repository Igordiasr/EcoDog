import { fieldKey } from '../design/types';
import { ArrowIcon } from './ArrowIcon';

export interface FieldProps {
  id: string; label: string; className: string; placeholder: string;
  value: string; onChange(value: string): void; readonly?: boolean; optionList?: string[];
}
const options: Record<string, string[]> = {
  servico: ['Creche', 'Hotel', 'DayUse'], periodo: ['Diário', 'Mensal', 'Personalizado'],
  perfil: ['Tutora', 'Monitora', 'Administração'],
  refeicao: ['Comida servida', 'Não servida'], participacao: ['Participou', 'Não Participou'],
  medicacao: ['Tomou', 'Não tomou'],
  tutor: ['Viviane'], cliente: ['Viviane'], pet: ['Bob', 'Thor', 'Mel', 'Luke', 'Nina'],
  mes: ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'],
};
export function Field({ id, label, className, placeholder, value, onChange, readonly, optionList }: FieldProps) {
  const key = fieldKey(label);
  const isSelect = !!optionList || key in options;
  const isTextarea = /obs|observac|relacionamento/.test(key);
  const type = /senha/.test(key) ? 'password' : /e-mail|email/.test(key) ? 'email' : /telefone|contato/.test(key) ? 'tel' : /nascimento|^data$|inicio|^fim$/.test(key) ? 'date' : /horario/.test(key) ? 'time' : /valor|diarias|quantidade|^ano$/.test(key) ? 'number' : 'text';
  const required = !readonly && !/obs|observac|veterinario|contato|vacina|dosagem|frequencia|remedio|relacionamento/.test(key);
  const props = { id, name: key, 'aria-label': label, className: `${className} design-input`, value, required, disabled: readonly, onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => onChange(e.target.value) };
  return <>
    <label htmlFor={id} className="sr-only">{label}</label>
     {isSelect ? <span className="select-arrow-slot"><select {...props}><option value="">{placeholder || 'Selecione'}</option>{(optionList || options[key]).map(option => <option key={option}>{option}</option>)}</select><ArrowIcon direction="down" /></span>
      : isTextarea ? <textarea {...props} placeholder={placeholder} rows={2} />
      : <input {...props} type={type} placeholder={placeholder} step={type === 'number' ? 'any' : undefined} />}
  </>;
}
