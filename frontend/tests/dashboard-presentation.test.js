import { describe, expect, it } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { DashboardOccupancy } from '../src/views/components/DashboardOccupancy';
import { DashboardCharts } from '../src/views/components/DashboardCharts';
import { dashboardDesign } from '../src/views/design/dashboard';
import design from '../src/views/design/TL13.json';

const data = (occupancy, total = 44) => ({ summary: {
    occupancy,
    distribution: { counts: [total, 0, 0, 0], total, unit: 'contratos', unclassified: [] },
} });
const occupancy = [
    { service: 'Creche', count: 4, capacity: 10 },
    { service: 'Hotel', count: 3, capacity: 10 },
    { service: 'DayUse', count: 3, capacity: 10 },
];

describe('dashboard presentation', () => {
    it.each(['desktop', 'mobile'])('substitui a ocupação antiga no layout %s', layout => {
        function findIndicator(node) {
            if (node.name === 'Indicador' && node.children?.some(child => child.name === 'Título' && child.children?.includes('Pets previstos para hoje'))) return node;
            return node.children?.filter(child => typeof child !== 'string').map(findIndicator).find(Boolean);
        }
        const result = dashboardDesign(findIndicator(design[layout]), data(occupancy));
        expect(result.children.find(child => child.name === 'Dashboard occupancy')).toBeDefined();
    });

    it('mostra a capacidade compartilhada e os segmentos proporcionais', () => {
        const html = renderToStaticMarkup(createElement(DashboardOccupancy, { data: data(occupancy) }));
        expect(html).toContain('Creche + Day Use: 7/10');
        expect(html).toContain('Creche: 4');
        expect(html).toContain('Day Use: 3');
        expect(html).toContain('Hotel: 3/10');
        expect(html).toContain('width:40%');
        expect(html).toContain('width:30%');
    });

    it('não inventa limites ausentes ou conflitantes', () => {
        for (const rows of [occupancy.map(row => ({ ...row, capacity: undefined })), occupancy.map(row => row.service === 'DayUse' ? { ...row, capacity: 5 } : row)]) {
            const html = renderToStaticMarkup(createElement(DashboardOccupancy, { data: data(rows) }));
            expect(html).toContain('Creche + Day Use: 7/—');
        }
        expect(renderToStaticMarkup(createElement(DashboardOccupancy, { data: null }))).toContain('Creche + Day Use: —/—');
    });

    it('mantém total e unidade em linhas separadas dentro do gráfico', () => {
        const html = renderToStaticMarkup(createElement(DashboardCharts, { data: data(occupancy, 100000), kind: 'distribution' }));
        expect(html).toContain('x="90" y="80" textLength="90"');
        expect(html).toContain('x="90" y="106" class="dashboard-donut-unit"');
        expect(html).toContain('>contratos</tspan>');
    });
});
