import { content, fieldKey, nodes, type DesignNode } from './types';
import { dashboardServices, dashboardSummary, moneyBRL, parseMoney, periodLabel, validPeriod, type DashboardData } from '../services/dashboard-model';
import type { DashboardFormMode } from '../services/dashboard-validation';

export function dashboardFormDesign(node: DesignNode, mode: DashboardFormMode, values: Record<string, string>, data: DashboardData | null): DesignNode {
  const editing = mode === 'editGoal' || mode === 'loadedGoal';
  if (editing && !nodes(node).length && content(node) === 'Salvar') return { ...node, children: ['Salvar alterações'] };
  let children = node.children?.filter(child => content(child).trim() !== '×');
  const label = nodes(node)[0];
  if (!label || !['Rótulo', 'Label'].includes(label.name || '')) return { ...node, children };
  let key = fieldKey(content(label));
  if (editing && key === 'mes') {
    key = 'mes-cadastrado';
    children = children?.map(child => child === label ? { ...label, children: ['Mês cadastrado'] } : child);
  }
  if (children?.some(child => typeof child !== 'string' && child.name === 'Texto' && content(child) === 'Não preenchido')) {
    let value = values[key] || '';
    if (key === 'cliente') value = data?.clients.find(client => client.id === value)?.name || '';
    if (key === 'pet') value = data?.pets.find(pet => pet.id === value)?.name || '';
    if (key === 'mes-cadastrado') value = validPeriod(value) ? periodLabel(value) : '';
    if (key === 'mes' && validPeriod(`${values.ano}-${value}`)) value = periodLabel(`${values.ano}-${value}`);
    if (key === 'ano' && editing) value = values['mes-cadastrado']?.slice(0, 4) || '';
    if (key === 'valor') { const cents = parseMoney(value); value = cents === null ? '' : moneyBRL(cents); }
    children = children.map(child => typeof child !== 'string' && child.name === 'Texto' ? { ...child, children: [value || 'Não preenchido'] } : child);
  }
  return { ...node, children };
}

export function dashboardDesign(node: DesignNode, data: DashboardData | null): DesignNode {
  const view = data ? dashboardSummary(data) : null;
  const children = nodes(node);
  const panelWithTitle = (text: string) => children.find(child => nodes(child).some(node => node.name === 'Título' && content(node) === text));
  const revenuePanel = panelWithTitle('Receita prevista × Receita recebida');
  const contractsPanel = panelWithTitle('Novos contratos no mês');
  const distributionPanel = panelWithTitle('Distribuição de pets');
  if (revenuePanel && contractsPanel && distributionPanel) {
    return { ...node, className: node.className.replace(/\bflex-row\b/g, 'flex-col'), children: node.children?.flatMap(child => {
      if (child === revenuePanel) return [{ ...revenuePanel, className: `${revenuePanel.className} dashboard-revenue-panel` }, { tag: 'div', name: 'Gráficos de contratos e distribuição', className: 'dashboard-secondary-charts w-full', children: [contractsPanel, distributionPanel] }];
      if (child === contractsPanel || child === distributionPanel) return [];
      return [child];
    }) };
  }
  const title = children.find(child => child.name === 'Título');
  const text = title && content(title);
  if (node.name === 'Indicador' && text) {
    const service = dashboardServices.find(service => text === `Receita mensal (${service})`);
    const metric = service && view?.monthly.find(row => row.service === service);
    if (service) return { ...node, children: node.children?.map(child => {
      if (typeof child === 'string') return child;
      if (child.name === 'Valor') return { ...child, children: [metric ? moneyBRL(metric.received) : '—'] };
      if (child.name === 'Descrição') return { ...child, className: `${child.className} kpi-meta-line`, children: [{ tag: 'span', name: 'Identificação da meta', className: 'kpi-meta-label', children: ['Meta'] }, metric ? `: ${metric.goal === undefined ? 'não cadastrada' : moneyBRL(metric.goal)} • ${metric.percentage === null ? '—' : `${new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 2 }).format(metric.percentage)}%`}${metric.arrow ? ` ${metric.arrow}` : ''}` : ': indisponível • —'] };
      if (child.name === 'Progresso') return { ...child, children: [{ ...nodes(child)[0], name: `Dashboard progress ${service}` }] };
      return child;
    }) };
    if (text === 'Contratos ativos' || text === 'Pacotes ativos') return { ...node, children: node.children?.map(child => typeof child === 'string' ? child : child.name === 'Título' ? { ...child, children: ['Contratos ativos'] } : child.name === 'Valor' ? { ...child, children: [view ? String(view.activeContracts) : '—'] } : child.name === 'Descrição' ? { ...child, children: ['Somente contratos ativos.'] } : child) };
  }
  if (node.name === 'Serviço' && children.some(child => child.name === 'Descrição' && /^(Creche|Hotel|DayUse):/.test(content(child)))) {
    const service = dashboardServices.find(service => content(node).startsWith(`${service}:`))!;
    const occupancy = view?.occupancy.find(row => row.service === service);
    return { ...node, children: children.map(child => child.name === 'Descrição' ? { ...child, children: [{ tag: 'span', name: 'Identificação do serviço', className: 'kpi-service-label', children: [service === 'DayUse' ? 'Day Use' : service] }, `: ${occupancy ? `${occupancy.count}/${occupancy.capacity ?? '—'}` : '—/—'}`] } : child.name === 'Progresso' ? { ...child, children: [{ ...nodes(child)[0], name: `Dashboard occupancy progress ${service}` }] } : child) };
  }
  if (text === 'Receita prevista × Receita recebida' || text === 'Novos contratos no mês' || text === 'Novos clientes no mês') {
    const revenue = text === 'Receita prevista × Receita recebida';
    return { ...node, children: node.children?.map(child => typeof child === 'string' ? child : child.name === 'Gráfico' ? { ...child, name: revenue ? 'Dashboard revenue chart' : 'Dashboard contracts chart', children: [] } : child.name === 'Descrição' ? { ...child, children: [revenue ? 'Últimos 12 meses • Valores em reais. Meses sem dados são indicados como indisponíveis.' : 'Últimos 6 meses • Novos contratos por serviço.'] } : child.name === 'Título' && !revenue ? { ...child, children: ['Novos contratos no mês'] } : child) };
  }
  if (text === 'Distribuição de pets') {
    let index = 0;
    const labels = ['Cães ativos com pacote de Creche', 'Cães ativos com reserva de Hotel', 'Cães ativos com reserva de DayUse', 'Cães inativos'];
    return { ...node, children: node.children?.map(child => {
      if (typeof child === 'string') return child;
      if (child.name === 'Distribuição') return { ...child, name: 'Dashboard distribution chart', children: [] };
      if (child.name === 'Descrição' && index < 4) {
        const category = index++, count = view?.distribution.counts[category];
        return { ...child, className: `${child.className} dashboard-distribution-legend dashboard-category-${category}`, children: [`${labels[category]} (${count ?? '—'})${view ? ` • ${new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 }).format(view.distribution.total ? count! / view.distribution.total * 100 : 0)}%` : ''}`] };
      }
      if (child.name === 'Descrição') return { ...child, name: 'Pendência de classificação', children: [view?.distribution.unclassified.length ? `${view.distribution.unclassified.length} pet(s) precisam de classificação de serviço; não foram contados duas vezes.` : !view ? 'Dados de distribuição indisponíveis.' : ''] };
      return child;
    }).filter(child => typeof child === 'string' || child.name !== 'Pendência de classificação' || content(child)) };
  }
  const movement = children.find(child => child.name === 'Movimentação');
  if (movement) {
    const template = nodes(movement);
    const rows = view?.movements.slice(0, 3).map(row => {
      const values = [`${row.date.split('-').reverse().join('/')}${row.time ? ` ${row.time}` : ''}`, row.service, data?.pets.find(pet => pet.id === row.petId)?.name || 'Pet não identificado', moneyBRL(row.cents)];
      const mobile = content(template[0]).startsWith('Data:');
      return { ...movement, id: `dashboard-movement-${row.id}`, children: template.map((child, index) => ({ ...child, id: `dashboard-movement-${row.id}-${index}`, children: [mobile ? `${['Data', 'Serviço', 'Pet', 'Valor'][index]}: ${values[index]}` : values[index]] })) };
    }) || [];
    let inserted = false;
    const tableHeader = children.find(child => child.name === 'Cabeçalho da tabela');
    const tableRows: DesignNode[] = rows.length ? rows : [{ tag: 'p', name: 'Estado das movimentações', className: 'w-full text-[var(--text)]', children: [data ? 'Nenhuma movimentação registrada.' : 'Dados de receitas indisponíveis.'] }];
    return { ...node, children: node.children?.flatMap(child => {
      if (child === tableHeader) return [];
      if (typeof child === 'string' || child.name !== 'Movimentação') return [child];
      if (inserted) return [];
      inserted = true;
      return [{ tag: 'div', name: 'Lista de movimentações', className: 'dashboard-movements-scroll w-full', children: [...(tableHeader ? [tableHeader] : []), ...tableRows] }];
    }) };
  }
  return node;
}
