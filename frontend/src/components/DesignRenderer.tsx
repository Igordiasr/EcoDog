import { createElement, useContext, createContext, type ReactNode } from 'react';
import lastStudentPhoto from '../../images/foto 9.jpeg';
import { content, nodes, fieldKey, type DesignNode } from '../design/types';
import { Field } from './Field';
import { ArrowIcon, arrowText, type ArrowDirection } from './ArrowIcon';
import { calendarDay } from '../design/calendar';
import { bookingDate, weekdayForDate, recurringBookingDates } from '../design/booking';
import { BookingDates } from './BookingDates';
import { BookingCartSummary } from './BookingCart';
import { formatMoney, type BookingCart } from '../services/booking-cart';
import { petChoices } from '../services/pet-draft';
import { isMonitorRecord, monitorRecordKey, monitorRecordValues, monitorRecordLocked, monitorOptions, monitorOption, type MonitorSavedRecord } from '../design/monitor-records';
import { DashboardCharts } from './DashboardCharts';
import { DashboardField, isDashboardField } from './DashboardField';
import { dashboardSummary } from '../services/dashboard-model';
import type { DashboardController } from '../services/use-dashboard';
import { ManagementCalendar, ManagementCapacity, ManagementAvailability, ManagementBulk, ManagementActivity, ManagementBooking } from './ManagementCalendar';
import type { ManagementCalendarController } from '../services/use-management-calendar';
import { findDesignNode } from '../design/structure-booking';
import type { PetHealthCatalogController } from '../services/pet-health-catalog';
import { ScheduledPetDays } from './ScheduledPetDays';
import type { useTutorSchedule } from '../services/tutor-schedule';
import { PetField } from './PetField';
import { PetAllergies } from './PetAllergies';
import { petRecordFields, type PetRecordIds, type PetRecordKind } from '../services/pet-validation';
import { bookingSelectionNotice } from '../services/prototype-safety';

export interface DesignContextValue {
  screen: string;
  mobile: boolean;
  modal: boolean;
  fields: Record<string, string>;
  setField(key: string, value: string): void;
  action(label: string, node: DesignNode, ancestors: DesignNode[]): void;
  day: number;
  selectedDates: string[];
  crecheWeekdays: number[];
  cart: BookingCart;
  removeDate(date: string): void;
  service: string;
  pets: string[];
  busy: boolean;
  search: string;
  monthOffset: number;
  activityIndex?: number;
  monitorSaved?: Record<string, MonitorSavedRecord>;
  dashboard?: DashboardController;
  managementCalendar?: ManagementCalendarController;
  petHealthCatalog?: PetHealthCatalogController;
  tutorSchedule?: ReturnType<typeof useTutorSchedule>;
  petRecords?: PetRecordIds;
  petRecord?: { kind: PetRecordKind; id: number };
  petErrors?: Record<string, string>;
  removePetRecord?(kind: PetRecordKind, id: number): void;
  petAllergies?: string[];
  setPetAllergies?(values: string[]): void;
}
export const DesignContext = createContext<DesignContextValue>(null!);

const labels = new Set(['Entrar', 'Cadastrar', 'INÍCIO', 'SOBRE', 'ESTRUTURA', 'ENTRAR', 'CADASTRE-SE', 'Meus Pets', 'Agendamento', 'Dashboard geral', 'Calendário', 'Usuários', 'Clientes', 'Planos', 'Adicionar Pet', 'Agendar', 'Salvar', 'Salvar alterações', 'Cancelar', 'Voltar', 'Editar', 'Excluir', 'Ver diário', 'Criar usuário', 'Criar Plano', 'Vincular Plano', 'Criar meta', 'Editar meta', 'Adicionar receita', 'Adicionar', 'Adicionar foto', 'Adicionar alergia', 'Registrar entrada', 'Registrar saída', 'Entrada registrada', 'Saída registrada', 'Atividades', 'Detalhes', 'Ver detalhes', 'Concluído', 'CONCLUÍDOS', 'Desativar', 'Ativar', 'Alterar', 'Adicionar atividade', 'Continuar', 'Avançar', 'Anterior', 'Próximo', 'Enviar', 'Entendi', 'Fechar', 'Voltar para Meus Pets', 'Salvar meta', 'Selecionar meta', '←', '→', '×']);
const stripPosition = (c: string) => c.replace(/(?:^|\s)(?:absolute|left-\S+|top-\S+)/g, ' ').trim();
const stripSize = (c: string) => c.replace(/(?:^|\s)(?:w-\[\d+(?:\.\d+)?px\]|h-\[\d+(?:\.\d+)?px\])/g, ' ').trim();
function isLeaf(n: DesignNode) { return !nodes(n).length && n.tag !== 'img'; }
function textChild(n: DesignNode) { return nodes(n).find(isLeaf); }

export interface DesignRendererProps { node: DesignNode; ancestors?: DesignNode[]; root?: boolean; inert?: boolean }
export function DesignRenderer({ node, ancestors = [], root = false, inert = false }: DesignRendererProps): ReactNode {
  const ctx = useContext(DesignContext);
  const name = node.name || '';
  const value = content(node);
  const childNodes = nodes(node);
  const parent = ancestors.at(-1);
   let className = node.className;
   const bookingContext = ctx.screen === 'TL03' || ctx.screen === 'TL09' && [node, ...ancestors].some(ancestor => /(?:^|\s)booking-(calendar|controls)(?:\s|$)/.test(ancestor.className));
   const sectionTitle = bookingContext && isLeaf(node) && value !== 'Agendamento de aulunos' && (
     name === 'Título' || name === 'Título do resumo' || ['Serviço', 'Data', 'Pets', 'Revisão final', 'Selecione o tipo de agendamento', 'Quais aulunos vão para a escola?', 'Quando vamos nos ver?'].includes(value)
   );
   if (sectionTitle) className += ' booking-section-title';
   const isPawBackground = /^(Textura vetorial|textura-fundo)/.test(name) || /image-import-1\.png/.test(className);
   if (isPawBackground) className += ` paw-background${ctx.mobile ? ' paw-background-mobile' : ''}`;
   const isHeader = /^(header|Cabeçalho)$/.test(name) && childNodes.some(n => content(n) === 'EcoDog Park');
   const parentIsHeader = parent && /^(header|Cabeçalho)$/.test(parent.name || '') && nodes(parent).some(n => content(n) === 'EcoDog Park');
   if (isHeader) className += ' design-header';
   if (parentIsHeader && value === 'EcoDog Park') className += ' header-brand';
   if (parentIsHeader && childNodes.some(n => n.name === 'Botão Cadastrar') && childNodes.some(n => n.name === 'Botão Entrar')) className += ' header-actions';
    const props: Record<string, unknown> = { className, 'data-design-id': node.id, 'data-design-name': name };
    if (ctx.screen === 'TL08' && ['Od5Hs', 'CHLdU'].includes(node.id || '')) props.style = { backgroundImage: `url("${lastStudentPhoto}")` };
   if (['TL01', 'TL08', 'TL09'].includes(ctx.screen) && isLeaf(node) && value && ancestors.some(ancestor => /Footer|Rodapé|rodapé|Assinatura/.test(ancestor.name || ''))) props['data-footer-text'] = 'true';
  const flowGroup = /^Group \d+$/.test(name) && ancestors.length <= 2;
  const rootGroup = root && /^Group/.test(name);
  const isGroupChild = parent && /^Group \d+$/.test(parent.name || '') && ancestors.length <= 2;
   if (root || flowGroup) {
     className = stripPosition(stripSize(className)) + ' design-flow';
     if (!ctx.modal) className += root ? ' page-layout' : ' page-layout-group';
     if (root && !ctx.modal && ctx.screen === 'TL03') className += ' scheduling-page';
    if (root && /TL02|Entrar -/.test(name) && !ctx.modal) className += ' login-screen';
    if (rootGroup || flowGroup) className += ' flex flex-col';
    if (root && !rootGroup && !node.className.includes(' flex ')) className += ' static-canvas';
  }
  if (isGroupChild && !flowGroup && name !== 'Footer' && !/EcoMigo/.test(name)) className = stripPosition(className).replace(/w-\[1440px\]/, 'w-full') + ' relative';
  if (name === 'Footer' && isGroupChild) className = stripPosition(className).replace(/w-\[1440px\]/, 'w-full') + ' relative';
   if (isGroupChild && /Home -|Sobre -|Estrutura-/.test(name)) className = stripPosition(className).replace(/w-\[1440px\]/, 'w-full');
   if (!ctx.modal && ancestors.length <= 2 && /^(Footer|Rodapé|Rodapé e assinatura|Assinatura e rodapé)$/.test(name)) {
     const pageParent = parent && (ancestors.length === 1 || /^Group \d+$/.test(parent.name || ''));
     if (pageParent) className += ' page-footer';
   }
   props.className = className;
   if (ctx.screen === 'TL05' && ['dRpD5', 'AwXSp'].includes(node.id || '') && ctx.tutorSchedule) return <div {...props}><ScheduledPetDays records={ctx.tutorSchedule.data} error={ctx.tutorSchedule.error} example={ctx.tutorSchedule.example} /></div>;
   if (ctx.screen === 'TL14' && ctx.managementCalendar) {
      const calendar = ctx.managementCalendar;
     if (name === 'Management state') return <div className="management-message"><p role={calendar.loadError ? 'alert' : 'status'}>{calendar.loading ? 'Carregando calendário…' : calendar.loadError || (calendar.example ? 'Prévia com dados mock. Alterações somente em memória.' : 'Dados carregados pelo adaptador do calendário.')}</p>{calendar.loadError && <button type="button" className="management-button" onClick={() => void calendar.reload()}>Recarregar dados</button>}{calendar.message && <p role="status">{calendar.message}</p>}</div>;
     if (name === 'Management calendar') return <ManagementCalendar calendar={calendar} className={className} />;
     if (name === 'Management availability') return <ManagementAvailability calendar={calendar} />;
     if (name === 'Management bulk') return <ManagementBulk calendar={calendar} className={className} />;
     if (name.startsWith('Management capacity ')) return <ManagementCapacity calendar={calendar} className={className} service={name.endsWith('Creche') ? 'Creche' : 'Hotel'} />;
     if (name === 'Management activity') {
       const row = calendar.data?.activities.find(row => row.id === node.id);
       return row ? <ManagementActivity calendar={calendar} className={className} row={row} /> : null;
     }
     if (name === 'Management booking') {
       const row = calendar.data?.bookings.find(row => row.id === node.id);
       const photo = findDesignNode(node, 'Foto a preencher');
       return row ? <ManagementBooking calendar={calendar} className={className} row={row} photo={photo && <DesignRenderer node={photo} inert />} /> : null;
     }
   }
   if (ctx.screen === 'TL13' && ctx.dashboard) {
     if (ctx.modal && isDashboardField(node)) return <DashboardField node={node} dashboard={ctx.dashboard} />;
     if (name === 'Dashboard revenue chart' || name === 'Dashboard contracts chart' || name === 'Dashboard distribution chart') return <div {...props}><DashboardCharts data={ctx.dashboard.data} kind={name === 'Dashboard revenue chart' ? 'revenue' : name === 'Dashboard contracts chart' ? 'contracts' : 'distribution'} /></div>;
     if (name.startsWith('Dashboard progress ') || name.startsWith('Dashboard occupancy progress ')) {
       const service = name.replace(/^Dashboard (?:occupancy )?progress /, '');
       const view = ctx.dashboard.data && dashboardSummary(ctx.dashboard.data);
       const metric = view?.monthly.find(row => row.service === service);
       const occupancy = view?.occupancy.find(row => row.service === service);
       const percentage = name.includes('occupancy') ? occupancy?.capacity ? Math.min(100, occupancy.count / occupancy.capacity * 100) : 0 : metric?.progress || 0;
       return <div {...props} className={className.replace(/(?:^|\s)w-\[[^\]]+\]/g, '')} style={{ width: `${percentage}%` }} />;
     }
   }
   if (isPawBackground) return createElement(node.tag, { ...props, 'aria-hidden': true });
   if (node.slide) {
     props.role = 'img';
     props['data-carousel-slide'] = node.slide.index;
     props['aria-current'] = node.slide.active ? 'true' : undefined;
     props['aria-label'] = `Imagem ${node.slide.index + 1}${node.slide.active ? ', selecionada' : ''}`;
   }

   const namedArrow = /^(?:arrow|chevron)-(left|right|up|down)$/.exec(name);
   if (!inert && ctx.screen === 'TL09' && ['A1e4J', 'vCdKM', 'ow7Lb', 'mb4qQ'].includes(node.id || '')) {
     const previous = ['A1e4J', 'ow7Lb'].includes(node.id || '');
     const label = previous ? 'Atividade anterior' : 'Próxima atividade';
     return <button {...props} type="button" className={`${className} design-button`} aria-label={label} disabled={previous ? (ctx.activityIndex || 0) === 0 : ctx.activityIndex === 2} onClick={() => ctx.action(label, node, ancestors)}><ArrowIcon direction={previous ? 'left' : 'right'} /></button>;
   }
   if (namedArrow) return <span {...props} className={`${className} arrow-icon-slot`}><ArrowIcon direction={namedArrow[1] as ArrowDirection} /></span>;
   if (node.tag === 'img' && /^(botao-(prev|next)(-mes)?|btn-(anterior|proximo))$/.test(parent?.name || '')) {
     const direction = /prev|anterior/.test(parent!.name!) ? 'left' : 'right';
     return <span {...props} className={`${className} arrow-icon-slot text-[var(--brand)]`}><ArrowIcon direction={direction} /></span>;
   }

  // Informative photos use their exact imported fills, but are exposed as images.
   if (node.tag === 'img') return <img {...props} className={className} src={node.src} alt={node.decorative ? '' : name} aria-hidden={node.decorative || undefined} loading="lazy" draggable={false} />;
  if (node.tag === 'br' || node.tag === 'hr') return createElement(node.tag, props);
  if (/bg-\[url|background-image/.test(className) && /foto|imagem|image|espaço|estrutura/i.test(name)) {
    props.role = 'img'; props['aria-label'] = name.replaceAll('-', ' ');
  }
  if (/textura|Fundo circular|Círculo interno/.test(name)) props['aria-hidden'] = true;

   if (!inert && ctx.screen === 'TL06' && name === 'Pet allergies') return <PetAllergies catalog={ctx.petHealthCatalog} selected={ctx.petAllergies || []} setSelected={values => ctx.setPetAllergies?.(values)} others={ctx.fields['alergia-outros'] === 'Sim'} description={ctx.fields['alergia-personalizada'] || ''} setField={ctx.setField} error={ctx.petErrors?.['alergia-personalizada']} />;
   if (!inert && ctx.screen === 'TL06' && name === '+  Adicionar') return <button {...props} type="button" className={`${className} design-button`} onClick={() => ctx.action('+ Adicionar', node, ancestors)}>+ Adicionar</button>;
   if (!inert && ctx.screen === 'TL06' && name === 'Pet records' && ctx.petRecords) {
     const kind = node.id === 'pet-vacinas' ? 'vacinas' : 'medicamentos';
     return <div {...props} className="pet-records">
       {ctx.petRecords[kind].map(id => <div className="pet-record" key={id}>
         <DesignContext.Provider value={{ ...ctx, petRecord: { kind, id } }}>
           {childNodes.map(child => <DesignRenderer key={child.id} node={child} ancestors={[...ancestors, node]} />)}
         </DesignContext.Provider>
         <button type="button" className="pet-record-remove" onClick={() => ctx.removePetRecord?.(kind, id)}>Remover {kind === 'vacinas' ? 'vacina' : 'remédio'}</button>
       </div>)}
     </div>;
   }
   if (!inert && ctx.screen === 'TL06' && name === 'Opções' && parent) {
     const label = content(textChild(parent) || parent);
     const key = fieldKey(label);
     if (key === 'sexo' || key === 'castrado') return <div {...props} role="group" aria-label={label}>
       {petChoices[key].map((option, index) => {
         const design = childNodes[index];
         return <label key={option} className={`${design?.className || ''} pet-choice${ctx.fields[key] === option ? ' pet-choice-selected' : ''}`}>
           <input type="radio" name={key} value={option} checked={ctx.fields[key] === option} disabled={ctx.busy} onChange={() => ctx.setField(key, option)} />
           <span className={nodes(design || node).at(-1)?.className}>{option}</span>
         </label>;
       })}
       {ctx.petErrors?.[key] && <p className="pet-field-error" role="status">{ctx.petErrors[key]}</p>}
     </div>;
   }
   if (ctx.screen === 'TL06' && isLeaf(node) && name === 'Texto' && parent && value === 'Não preenchido') {
     const key = fieldKey(parent.name || '');
     let summary = ctx.fields[key];
     const kind = ['vacina', 'data', 'validade'].includes(key) ? 'vacinas' : ['remedio', 'dosagem', 'frequencia'].includes(key) ? 'medicamentos' : null;
     if (kind) summary = ctx.petRecords?.[kind].map(id => ctx.fields[`${kind}.${id}.${key}`]?.trim()).filter(Boolean).join(' · ') || '';
     if (key === 'alergias') summary = [...(ctx.petAllergies || []), ...(ctx.fields['alergia-outros'] === 'Sim' && ctx.fields['alergia-personalizada']?.trim() ? [ctx.fields['alergia-personalizada'].trim()] : [])].join(' · ');
     return <div {...props}>{summary || value}</div>;
   }

   // Labels and controls are translated from the same field containers as the prototype.
  const isInput = /^(Entrada|Controle|Input|Campo de texto|Entrada de mensagem)$/.test(name) || name === 'Frame' && /^campo(?:-| )/i.test(parent?.name || '');
  if (isInput && !inert && parent && !['TL07'].includes(ctx.screen)) {
    const label = content(textChild(parent) || parent).split(' • ')[0];
    const section = ancestors.findLast(n => /Registro de rotina|Registro de alimentação|Grupo de campos|Vacinas|Remédio/.test(n.name || ''));
    const sectionTitle = section && section.name?.startsWith('Registro') ? content(section).split(/Ração|Escolha|Registro salvo|Participação|Medicação/)[0] : section?.name?.includes('Vacinas') ? 'vacina' : section?.name?.includes('Remédio') ? 'remedio' : '';
    const key = fieldKey(`${sectionTitle} ${label}`);
    const saved = section?.name?.startsWith('Registro') && content(section).includes('Registro salvo');
     const fieldText = content(textChild(node) || node);
     if (ctx.screen === 'TL10') {
       const record = ancestors.findLast(isMonitorRecord);
       if (record) {
          const key = `monitor.${monitorRecordKey(record)}.observacoes`;
          const snapshot = ctx.monitorSaved?.[monitorRecordKey(record)];
          return <Field id={`${node.id}-input`} label={content(textChild(parent) || parent)} className={className} placeholder={fieldText} value={snapshot?.values.observacoes ?? monitorRecordValues(record, ctx.fields).observacoes ?? ''} readonly={ctx.busy || monitorRecordLocked(record, snapshot)} onChange={v => ctx.setField(key, v)} />;
       }
     }
     if (ctx.screen === 'TL06') {
       const baseKey = fieldKey(label);
       const path = ctx.petRecord ? `${ctx.petRecord.kind}.${ctx.petRecord.id}.${baseKey}` : baseKey;
       const active = ctx.petRecord && (ctx.petRecord.id !== 0 || petRecordFields[ctx.petRecord.kind].some(key => !!ctx.fields[`${ctx.petRecord!.kind}.${ctx.petRecord!.id}.${key}`]) || ctx.petRecord.kind === 'vacinas' && !!ctx.fields[`vacinas.${ctx.petRecord.id}.validade`]);
       const catalogKind = baseKey === 'vacina' ? 'vacinas' : baseKey === 'remedio' ? 'medicamentos' : null;
       return <PetField id={`${ctx.petRecord ? `${ctx.petRecord.kind}-${ctx.petRecord.id}-` : ''}${node.id}-input`} label={label} fieldKey={baseKey} className={className} placeholder={fieldText} value={ctx.fields[path] || ''} required={baseKey === 'validade' ? false : ctx.petRecord ? !!active : ['nome', 'nascimento', 'raca'].includes(baseKey)} error={ctx.petErrors?.[path]} readonly={!!saved || ctx.busy} options={catalogKind ? ctx.petHealthCatalog?.data[catalogKind].map(item => item.name) || [] : undefined} onAdd={catalogKind ? () => ctx.petHealthCatalog?.open(catalogKind, item => ctx.setField(path, item.name)) : undefined} onChange={v => ctx.setField(path, v)} />;
     }
     return <Field id={`${node.id}-input`} label={label} className={className} placeholder={fieldText} value={ctx.fields[key] || ''} readonly={!!saved} onChange={v => ctx.setField(key, v)} />;
  }
  if (!inert && /^Campo$|^Campo de observações$|^campo-|^Campo (nome|email|telefone|endereço|senha|confirmação)/i.test(name)) props.className = className + ' field-container';
  if (!inert && isLeaf(node) && parent && /^Campo$|^Campo de observações$|^campo-|^Campo (nome|email|telefone|endereço|senha|confirmação)/i.test(parent.name || '')) {
    return <label className={className} htmlFor={`${nodes(parent).find(n => /Entrada|Frame|Input/.test(n.name || ''))?.id}-input`}>{value}</label>;
  }

   const recurse = (child: DesignNode | string, i: number, locked = inert) => typeof child === 'string' ? arrowText(child) : <DesignRenderer key={child.id || i} node={child} ancestors={[...ancestors, node]} inert={locked} />;
  const renderChildren = (locked = inert) => node.children?.map((child, i) => recurse(child, i, locked));

  if (!inert && ctx.screen === 'TL03' && name === 'Valor previsto') return <div {...props}>
    {childNodes.filter(child => child.name !== 'Valor linha').map((child, index) => recurse(child, index))}
  </div>;
  if (!inert && bookingContext && ctx.screen === 'TL03' && isLeaf(node) && value === 'Cancelar') return <button {...props} type="button" className={`${className} design-button`} onClick={() => ctx.action('Cancelar', node, ancestors)}>{value}</button>;

  if (/EcoMigo • Acesso/.test(name) && !inert) return <button {...props} type="button" className={`${className} assistant-trigger`} aria-label="Abrir Assistente EcoMigo" onClick={() => ctx.action('Assistente', node, ancestors)}>{renderChildren(true)}</button>;
  if (!inert && (/^(Abrir menu|menu|Menu)$/.test(name) && !isLeaf(node))) return <button {...props} type="button" className={`${className} design-button`} aria-label="Abrir menu" aria-haspopup="true" onClick={() => ctx.action('Menu', node, ancestors)}>{renderChildren(true)}</button>;
  if (!inert && /Minimizar assistente|Fechar assistente/.test(name)) return <button {...props} type="button" className={`${className} design-button`} aria-label={name} onClick={() => ctx.action('Fechar', node, ancestors)}>{renderChildren(true)}</button>;
  if (!inert && /botao-prev|botao-next/.test(name)) return <button {...props} type="button" className={`${className} design-button`} aria-label={name.includes('prev') ? 'Imagem anterior' : 'Próxima imagem'} onClick={() => ctx.action(name.includes('prev') ? 'Carrossel anterior' : 'Carrossel próximo', node, ancestors)}>{renderChildren(true)}</button>;

  const dayCell = !isLeaf(node) && childNodes.some(n => n.name === 'Número do dia') && /^\d+/.test(value);
  if (!inert && dayCell) {
    const day = parseInt(value);
     const unavailable = bookingContext ? calendarDay(node)?.unavailable === true : /#d|#c|#f2/.test(className) && !/var\(--/.test(className);
     const blockedSunday = bookingContext && ctx.service === 'Creche' && weekdayForDate(bookingDate(day, ctx.monthOffset)) === 0;
     const selected = !unavailable && !blockedSunday && (bookingContext ? ctx.selectedDates.includes(bookingDate(day, ctx.monthOffset)) : day === ctx.day);
     const frequencyLimit = bookingContext && ctx.service === 'Creche' && ctx.crecheWeekdays.length === 6 && !ctx.crecheWeekdays.includes(weekdayForDate(bookingDate(day, ctx.monthOffset)));
     return <button {...props} type="button" className={`${className.replace(/bg-\[[^\]]+\]/g, '')} calendar-day ${selected ? 'calendar-selected' : ''}`} aria-label={`${day}, ${unavailable || blockedSunday ? 'indisponível' : selected ? 'selecionado' : frequencyLimit ? 'limite de frequência' : 'disponível'}`} aria-description={bookingContext ? `${blockedSunday ? 'Domingos não estão disponíveis para Creche. ' : ''}Disponibilidade apenas para seleção ilustrativa. Vagas reais não foram consultadas.` : undefined} aria-pressed={selected} disabled={unavailable || blockedSunday || frequencyLimit} onClick={() => ctx.action(`Dia ${day}`, node, ancestors)}>{day}{selected && <span aria-hidden="true"> ✓</span>}</button>;
   }
   if (!inert && bookingContext && ctx.service === 'Creche' && name === 'Dia da semana') {
     const weekday = parent ? nodes(parent).findIndex(child => child.id === node.id) : -1;
     const selected = ctx.crecheWeekdays.includes(weekday);
     const calendar = ancestors.findLast(ancestor => ancestor.name === 'Calendário de agosto');
     const disabled = weekday === 0 || !selected && (ctx.crecheWeekdays.length === 6 || !recurringBookingDates(calendar, [weekday], ctx.monthOffset).length);
     const title = value.charAt(0) + value.slice(1).toLocaleLowerCase('pt-BR');
     return <button {...props} type="button" className={`${className} calendar-weekday${selected ? ' creche-weekday-selected' : ''}`} aria-label={`Selecionar ${['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'][weekday]}`} aria-pressed={selected} disabled={disabled} onClick={() => ctx.action(`Semana ${weekday}`, node, ancestors)}>{title}{selected && ' ✓'}</button>;
   }
   const serviceLabel = value.replace(/^[○●✓]\s*/, '').trim();
   if (!inert && !isLeaf(node) && (name === 'Serviço' || /^[○●]\s/.test(name)) && ['Creche', 'Hotel', 'DayUse'].includes(serviceLabel)) return <button {...props} type="button" className={`${className.replace(/bg-\[[^\]]+\]/g, '')} service-option ${ctx.service === serviceLabel ? 'service-selected' : ''}`} aria-label={serviceLabel} aria-pressed={ctx.service === serviceLabel} onClick={() => ctx.action(serviceLabel, node, ancestors)}>{ctx.mobile ? `${ctx.service === serviceLabel ? '●' : '○'}  ${serviceLabel}` : `${ctx.service === serviceLabel ? '✓ ' : ''}${serviceLabel}`}</button>;
   if (!inert && !isLeaf(node) && (/Selecionar todos/.test(name) || /^☐\s+Todos os pets/.test(name))) return <button {...props} type="button" className={`${className} design-button`} aria-label="Todos os pets" aria-pressed={ctx.pets.length === 3} onClick={() => ctx.action('Todos os pets', node, ancestors)}><span className={ctx.screen === 'TL03' ? 'pets-all-checkbox' : undefined} aria-hidden="true">{ctx.pets.length === 3 ? '☑' : '☐'}</span><span>Todos os pets</span></button>;
   if (!inert && !isLeaf(node) && /^(Thor|Mel|Luke) · selecionado$/.test(name)) {
     const pet = name.split(' · ')[0];
     const selected = ctx.pets.includes(pet);
     return <button {...props} type="button" className={`${className} design-button`} aria-label={pet} aria-pressed={selected} onClick={() => ctx.action(`Pet ${pet}`, node, ancestors)}>{childNodes.map((child, i) => i === 0 ? <span key={child.id} className={child.className}>{selected ? '✓' : '○'}  {pet}</span> : <span key={child.id} className={child.className}>{selected ? 'Selecionado' : 'Não selecionado'}</span>)}</button>;
   }
   if (!inert && /Seleção atual/.test(name) && childNodes.length >= 2) {
     const label = content(childNodes[0]);
     if (ctx.screen === 'TL10') {
       const record = ancestors.findLast(isMonitorRecord)!;
       const field = fieldKey(label);
        const key = `monitor.${monitorRecordKey(record)}.${field}`;
        const snapshot = ctx.monitorSaved?.[monitorRecordKey(record)];
        return <div {...props}>{recurse(childNodes[0], 0)}<Field id={`${node.id}-select`} label={label} className={childNodes[1].className} placeholder="Selecione" value={snapshot?.values[field] ?? ctx.fields[key] ?? monitorOption(content(childNodes[1]))} optionList={monitorOptions[field]} readonly={ctx.busy || monitorRecordLocked(record, snapshot)} onChange={v => ctx.setField(key, v)} /></div>;
     }
    const key = fieldKey(`${ancestors.findLast(n => /Registro de rotina|Registro de alimentação/.test(n.name || ''))?.id || ''} ${label}`);
    const saved = ancestors.some(n => /Registro de rotina|Registro de alimentação/.test(n.name || '') && content(n).includes('Registro salvo'));
    return <div {...props}>{recurse(childNodes[0], 0)}<Field id={`${node.id}-select`} label={label} className={childNodes[1].className} placeholder={content(childNodes[1])} value={ctx.fields[key] || content(childNodes[1])} readonly={saved} onChange={v => ctx.setField(key, v)} /></div>;
  }
  if (!inert && /Seleção/.test(name) && value.match(/^[○◉✓]?\s*(M|F|Sim|Não)$/) && parent) {
    const label = content(ancestors.findLast(n => n.name === 'Escolha') || parent).split(/[○◉]/)[0].trim();
    const key = fieldKey(label);
    const option = value.replace(/[○◉✓]/g, '').trim();
    return <label {...props} className={`${className} radio-option`}><input type="radio" name={key} value={option} checked={ctx.fields[key] === option} onChange={() => ctx.setField(key, option)} />{option}</label>;
  }
  if (!inert && /^Pesquisar/.test(value) && isLeaf(node) && parent && /Entrada|Campo|Pesquisa/.test(parent.name || '')) return <input className={`${className} design-input`} aria-label="Pesquisar Tutor" placeholder={value} value={ctx.search} onChange={e => ctx.setField('pesquisa', e.target.value)} />;
  if (!inert && /Vínculo de plano/.test(name) && ctx.search && !value.toLowerCase().includes(ctx.search.toLowerCase())) return null;

   const label = value.replace(/ ✓$/, '').trim();
   if (!inert && !isLeaf(node) && label === '×' && ancestors.some(n => n.name === 'Pet selecionado')) {
     const record = ancestors.findLast(n => n.name === 'Pet selecionado')!;
     const pet = content(record).split(' ')[0];
     const selected = ctx.pets.includes(pet);
     return <button {...props} type="button" className={`${className} design-button`} aria-label={pet} aria-pressed={selected} onClick={() => ctx.action(`Pet ${pet}`, node, ancestors)}>{selected ? '×' : '○'}</button>;
   }
   const canAct = !inert && !isLeaf(node) && (labels.has(label) || ['CADASTRAR', 'Quero agendar', 'Agendar visita', 'Saiba mais', 'Como funciona'].includes(label)) && childNodes.length <= 3 && !/Coluna|Registro|Data|Resumo|cta-agendar/.test(name);
   if (!inert && ctx.screen === 'TL11' && label === 'Feed do Monitor' && !isLeaf(node)) return <button {...props} type="button" className={`${className} design-button`} onClick={() => ctx.action(label, node, ancestors)}>{renderChildren(true)}</button>;
  const inlineLink = !inert && isLeaf(node) && /Já tem|Não tem login|Clique aqui|Conheça|Saiba mais|NOSSO ESPAÇO|SOBRE NÓS/.test(value);
  if (canAct || inlineLink) {
     const record = ctx.screen === 'TL10' ? ancestors.findLast(isMonitorRecord) : undefined;
     const alreadySaved = /Entrada registrada|Saída registrada/.test(label) || label === 'Salvar' && !!record && monitorRecordLocked(record, ctx.monitorSaved?.[monitorRecordKey(record)]);
     const missingCheckInEvidence = ctx.screen === 'TL11' && label === 'Registrar saída';
      return <button {...props} type="button" className={`${className} design-button`} disabled={ctx.busy || alreadySaved || missingCheckInEvidence || ctx.screen === 'TL14' && label === 'Adicionar atividade' && !ctx.managementCalendar?.can('activity')} aria-description={missingCheckInEvidence ? 'Check-out indisponível: nenhum check-in operacional foi consultado.' : undefined} aria-label={label === '×' ? 'Remover' : label} onClick={() => ctx.action(label, node, ancestors)}>{renderChildren(true)}</button>;
  }
    if (!inert && ctx.screen === 'TL09' && bookingContext && isLeaf(node) && name === 'Mês') {
     const label = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(new Date(2026, 7 + ctx.monthOffset, 1));
     return <div {...props}>{label.charAt(0).toLocaleUpperCase('pt-BR') + label.slice(1)}</div>;
    }
    if (!inert && isLeaf(node) && bookingContext && ['Disponível', 'Indisponível'].includes(value)) return <div {...props}>{value === 'Disponível' ? 'Selecionável no protótipo' : 'Bloqueado no protótipo'}</div>;
    if (!inert && ctx.screen === 'TL03' && isLeaf(node) && (/^Etapa \d de 4/.test(value) || value.startsWith('Um novo dia de auventuras'))) return <div {...props}>{value}<p role="status">{bookingSelectionNotice}</p></div>;
    if (!inert && ctx.screen === 'TL09' && isLeaf(node) && value === 'Veja nossas vagas') return <div {...props}>Calendário ilustrativo</div>;
    if (!inert && ctx.screen === 'TL09' && isLeaf(node) && value.startsWith('Verifique os dias disponíveis')) return <div {...props} role="status">{bookingSelectionNotice} Escolha datas apenas para a prévia.</div>;
   if (!inert && value === 'Meus Dados' && (isLeaf(node) || childNodes.length === 1)) return <button {...props} type="button" className={`${className} design-button`} onClick={() => ctx.action('Meus Dados', node, ancestors)}>{renderChildren(true)}</button>;
   if (!inert && bookingContext && isLeaf(node) && parent?.name === 'Dia da semana') {
     const dayName = value.toLocaleLowerCase('pt-BR');
     return <div {...props}>{dayName.charAt(0).toLocaleUpperCase('pt-BR') + dayName.slice(1)}</div>;
   }
   if (!inert && isLeaf(node) && /^(Agosto|Setembro)$/.test(value) && ctx.monthOffset) {
     const monthName = new Intl.DateTimeFormat('pt-BR', { month: 'long' }).format(new Date(2026, (value === 'Agosto' ? 7 : 8) + ctx.monthOffset, 1));
     return createElement(sectionTitle ? 'h2' : 'div', props, bookingContext ? monthName.charAt(0).toLocaleUpperCase('pt-BR') + monthName.slice(1) : monthName);
   }
   if (!inert && ['TL03'].includes(ctx.screen) && isLeaf(node)) {
     if (name === 'Montante') return <div {...props} aria-live="polite">{formatMoney(ctx.cart.totalCents)}</div>;
     if (name === 'Rótulo valor') return <div {...props}>Valor total</div>;
     if (name === 'Nota valor') return <div {...props}><BookingCartSummary cart={ctx.cart} service={ctx.service} frequency={ctx.crecheWeekdays.length} removeDate={ctx.removeDate} /></div>;
     if (/^Valor previsto:/.test(value)) return <div {...props}>
       <h2 className="booking-section-title font-interface text-[var(--brand)]">Resumo do Agendamento</h2>
        <BookingCartSummary cart={ctx.cart} service={ctx.service} frequency={ctx.crecheWeekdays.length} removeDate={ctx.removeDate} />
     </div>;
     if (name === 'Status' || /13 de agosto • Hotel/.test(value)) return <div {...props}>{ctx.service === 'DayUse' ? 'Day Use' : ctx.service}</div>;
     if (/estão selecionados para/.test(value)) return <div {...props}>{ctx.pets.join(', ')} estão selecionados para essa auventura.</div>;
     if (name === 'Seleção individual') {
       const record = ancestors.findLast(n => n.name === 'Pet selecionado');
       const pet = record && content(record).split(' ')[0];
       return <div {...props}>{value.replace('Selecionado', pet && ctx.pets.includes(pet) ? 'Selecionado' : 'Não selecionado')}</div>;
     }
     if (ancestors.some(n => n.name === 'Card · Revisão final')) {
       if (value === 'Hotel') return <div {...props}>{ctx.service}</div>;
       if (value === '13 de agosto') return <div {...props}><BookingDates dates={ctx.selectedDates} /></div>;
       if (value === 'Thor · Mel · Luke') return <div {...props}>{ctx.pets.join(' · ') || 'Nenhum pet selecionado'}</div>;
     }
   }
  if (/^Tabela de|Plano contratado/.test(name)) { props.role = 'table'; props['aria-label'] = name; }
  if (/Cabeçalho da tabela/.test(name)) props.role = 'row';
  if (/^Coluna$/.test(name)) props.role = 'columnheader';
  if (/^Registro de usuário$|^Vínculo de plano$|^Movimentação$/.test(name) || name === 'Plano' && !isLeaf(node)) props.role = 'row';
  if (parent && /^Registro de usuário$|^Vínculo de plano$|^Movimentação$|^Plano$/.test(parent.name || '')) props.role = 'cell';
   let tag = sectionTitle ? 'h2' : node.tag;
  if (isLeaf(node) && /Luckiest_Guy/.test(className) && value !== 'EcoDog Park') {
    const pageTitles: Record<string, RegExp> = {
      TL01: /^Oi aumigo/i, TL02: /^Bem-vindo de volta/i, TL03: /^Agendamento de aulunos/i,
      TL04: /^Cadastro$/, TL05: /^Meus Pets$/, TL06: /^Cadastro de pet$/, TL07: /^Diário de/,
      TL08: /^Sobre n[oó]s$/i, TL09: /^Nosso espa[cç]o$/i, TL10: /^Feed do Monitor$/,
      TL11: /^Check-in e check-out dos Pets$/, TL12: /^Atividades do dia$/,
      TL13: /^Dashboard geral$/, TL14: /^Gerenciamento de calendário$/,
      TL15: /^Gerenciamento de usuários$/, TL16: /^Gerenciamento de Clientes$/i,
      TL17: /^Gerenciamento de Planos$/i,
    };
    tag = !ctx.modal && pageTitles[ctx.screen]?.test(value) ? 'h1' : 'h2';
  }
  return createElement(tag, props, renderChildren());
}
