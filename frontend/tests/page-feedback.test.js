import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { DesignContext, DesignRenderer } from '../src/views/components/DesignRenderer';
import { PageFeedback } from '../src/views/components/PageFeedback';
import { petDiaryFeedback, userFeedback } from '../src/viewmodels/user-feedback';
import design from '../src/views/design/TL07.json';

describe('Avisos abaixo da navbar', () => {
    for (const layout of ['desktop', 'mobile']) {
        for (const error of [false, true]) {
            it(`renderiza ${error ? 'erro' : 'carregamento'} após o cabeçalho em ${layout}`, () => {
                const pageFeedback = createElement(PageFeedback, { notices: [{ message: error ? 'Falha HTTP 500 no backend' : 'Carregando diário do pet…', error, retry: error ? () => {} : undefined }] });
                const html = renderToStaticMarkup(createElement(DesignContext.Provider, { value: { screen: 'TL07', mobile: layout === 'mobile', fields: {}, pageFeedback } }, createElement(DesignRenderer, { node: design[layout], root: true })));
                const header = html.indexOf('data-design-name="Cabeçalho"');
                const notice = html.indexOf('class="page-feedback"');
                expect(header).toBeGreaterThan(-1);
                expect(notice).toBeGreaterThan(header);
                expect(html.match(/class="page-feedback"/g)).toHaveLength(1);
                expect(html).toContain(error ? 'role="alert"' : 'role="status"');
                expect(html).not.toContain('HTTP 500');
                expect(html).not.toContain('backend');
                if (error) expect(html).toContain('Tentar novamente');
            });
        }
    }
    it('não cria um bloco quando não há avisos', () => {
        expect(renderToStaticMarkup(createElement(PageFeedback, { notices: [] }))).toBe('');
    });
});

describe('Mensagens para o tutor', () => {
    it('substitui detalhes técnicos do diário por uma orientação simples', () => {
        for (const message of ['ID inválido: pet', 'Diário de pet/data diferente do solicitado.', 'Estado inválido: medicação', 'Network Error']) {
            expect(petDiaryFeedback(new Error(message))).toBe('Não foi possível carregar o diário do seu pet. Tente novamente em instantes.');
        }
    });
    it('orienta entrar novamente quando a sessão expirou', () => {
        expect(petDiaryFeedback({ status: 401 })).toBe('Entre novamente na sua conta para consultar o diário.');
    });
    it('preserva orientações claras sem expor detalhes técnicos', () => {
        expect(userFeedback('Selecione um dos seus pets para consultar o diário.')).toBe('Selecione um dos seus pets para consultar o diário.');
        expect(userFeedback('Resposta inválida: diário')).toBe('Não foi possível carregar as informações. Tente novamente em instantes.');
    });
});
