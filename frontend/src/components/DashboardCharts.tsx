import { useEffect, useRef, useState } from 'react';
import { dashboardSummary, moneyBRL, periodLabel, type DashboardData } from '../services/dashboard-model';

interface Props { data: DashboardData | null; kind: 'revenue' | 'contracts' | 'distribution' }
const contractColors = ['#247346', '#45937f', '#de8f3b'];
const donutColors = ['#67b344', '#247346', '#45937f', '#add9cc'];
const categories = ['Creche', 'Hotel', 'DayUse', 'Inativos'];

export function DashboardCharts({ data, kind }: Props) {
  const [selected, setSelected] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [availableWidth, setAvailableWidth] = useState(660);
  useEffect(() => {
    const node = scrollRef.current;
    if (!node) return;
    const observer = new ResizeObserver(() => setAvailableWidth(node.clientWidth));
    observer.observe(node);
    return () => observer.disconnect();
  }, [data, kind]);
  if (!data) return <div className="dashboard-chart-empty" role="status">Dados indisponíveis.</div>;
  const view = dashboardSummary(data);
  if (kind === 'distribution') {
    const { counts, total } = view.distribution;
    let start = 0;
    const circumference = 2 * Math.PI * 70;
    return <div className="dashboard-donut">
      <svg viewBox="0 0 180 180" width="180" height="180" aria-label="Distribuição de pets">
        {!total && <circle cx="90" cy="90" r="70" fill="none" stroke="#add9cc" strokeWidth="30" />}
        {counts.map((count, index) => {
          const length = total ? count / total * circumference : 0, offset = start;
          start += length;
          return count ? <circle key={index} cx="90" cy="90" r="70" fill="none" stroke={donutColors[index]} strokeWidth="30" strokeDasharray={`${length} ${circumference - length}`} strokeDashoffset={-offset} transform="rotate(-90 90 90)" tabIndex={0} role="button" aria-label={`${categories[index]}: ${count} pets`} onMouseEnter={() => setSelected(index)} onFocus={() => setSelected(index)} onClick={() => setSelected(index)} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelected(index); } }}><title>{categories[index]}: {count} pets</title></circle> : null;
        })}
        <text x="90" y="95" textAnchor="middle" textLength={String(total).length > 3 ? 100 : undefined} lengthAdjust="spacingAndGlyphs" className="dashboard-donut-total">{total} pets</text>
      </svg>
      <span className="dashboard-donut-tooltip" role="status">{selected !== null ? `${categories[selected]}: ${counts[selected]} pets` : ''}</span>
    </div>;
  }
  const revenue = kind === 'revenue';
  const colors = revenue ? ['var(--dashboard-forecast)', '#45937f'] : contractColors;
  const rows = revenue ? view.revenueSeries.map(row => ({ period: row.period, values: [row.forecast, row.received] })) : view.contractSeries.map(row => ({ period: row.period, values: row.counts }));
  const max = Math.max(1, ...rows.flatMap(row => row.values.map(value => value || 0)));
  const width = Math.max(revenue ? 800 : 360, availableWidth), height = revenue ? 300 : 220;
  const left = revenue ? Math.max(130, moneyBRL(Math.round(max)).length * 11 + 16) : Math.max(55, String(Math.ceil(max)).length * 11 + 16), right = width - 30, top = 14, bottom = height - 64;
  const x = (index: number) => left + (right - left) * index / Math.max(1, rows.length - 1);
  const y = (value: number) => bottom - value / max * (bottom - top);
  const current = rows[Math.min(selected ?? rows.length - 1, rows.length - 1)];
  const series = revenue ? ['Prevista', 'Recebida'] : ['Creche', 'Hotel', 'DayUse'];
  const pointDescription = (index: number) => `${periodLabel(rows[index].period)} • ${series.map((label, s) => `${label}: ${rows[index].values[s] === null ? 'sem dados' : revenue ? moneyBRL(rows[index].values[s]!) : rows[index].values[s]}`).join(' • ')}`;
  return <div className={`dashboard-chart${revenue ? ' dashboard-chart-revenue' : ''}`}>
    <div className="dashboard-chart-scroll" ref={scrollRef} tabIndex={0} aria-label="Meses do gráfico; use as setas para rolar quando necessário">
      <svg viewBox={`0 0 ${width} ${height}`} style={{ minWidth: revenue ? 800 : 360 }} aria-label={revenue ? 'Receita dos últimos 12 meses' : 'Novos contratos dos últimos 6 meses'}>
        {[0, .25, .5, .75, 1].map(fraction => <g key={fraction}><line x1={left} y1={y(max * fraction)} x2={right} y2={y(max * fraction)} stroke="#add9cc" /><text x={left - 5} y={y(max * fraction) + 4} textAnchor="end" className="dashboard-axis">{revenue ? moneyBRL(Math.round(max * fraction)) : Math.ceil(max * fraction)}</text></g>)}
        {revenue && series.map((_, s) => {
          let previous = false;
          const path = rows.map((row, index) => {
            const value = row.values[s];
            if (value === null) { previous = false; return ''; }
            const segment = `${previous ? 'L' : 'M'} ${x(index)} ${y(value)}`;
            previous = true;
            return segment;
          }).join(' ');
          return <path key={s} d={path} stroke={colors[s]} strokeWidth="2" fill="none" />;
        })}
        {rows.map((row, index) => <g key={row.period} tabIndex={0} role="button" aria-label={pointDescription(index)} onFocus={() => setSelected(index)} onMouseEnter={() => setSelected(index)} onClick={() => setSelected(index)} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelected(index); } }}>
          <title>{pointDescription(index)}</title>
          <rect x={x(index) - 25} y={top} width="50" height={height - 25} fill="transparent" />
          {row.values.map((value, s) => value === null ? null : revenue ? <circle key={s} cx={x(index)} cy={y(value)} r="3" fill={colors[s]} /> : <rect key={s} x={x(index) - 12 + s * 8} y={y(value)} width="7" height={bottom - y(value)} fill={colors[s]} rx="2" />)}
          <text x={x(index)} y={height - 35} textAnchor="middle" className="dashboard-axis">{new Intl.DateTimeFormat('pt-BR', { month: 'short' }).format(new Date(`${row.period}-01T12:00:00`)).replace('.', '')}</text>
          <text x={x(index)} y={height - 7} textAnchor="middle" className="dashboard-axis">{row.period.slice(0, 4)}</text>
        </g>)}
      </svg>
    </div>
    <p className="dashboard-chart-tooltip" role="status">{pointDescription(rows.indexOf(current))}</p>
  </div>;
}
