import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { CalendarNotice } from '../src/views/components/CalendarNotice';

describe('avisos do calendário', () => {
    it('apresenta falhas em um cartão acessível com opção de tentar novamente', () => {
        const markup = renderToStaticMarkup(createElement(CalendarNotice, { kind: 'error', message: 'Não conseguimos carregar o calendário.', retry: () => {} }));
        expect(markup).toContain('page-feedback-card');
        expect(markup).toContain('page-feedback-error');
        expect(markup).toContain('role="alert"');
        expect(markup).toContain('Tentar novamente');
    });

    it('distingue confirmações de erros e permite dispensar o aviso', () => {
        const markup = renderToStaticMarkup(createElement(CalendarNotice, { kind: 'success', message: 'Vagas atualizadas.', onDismiss: () => {} }));
        expect(markup).toContain('calendar-notice-success');
        expect(markup).toContain('role="status"');
        expect(markup).toContain('Tudo certo!');
        expect(markup).toContain('Entendi');
        expect(markup).not.toContain('page-feedback-error');
    });
});
