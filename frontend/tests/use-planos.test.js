import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { usePlanos } from '../src/viewmodels/use-planos';

describe('usePlanos', () => {
  it('expõe estado inicial e operações sem carregar antes da ativação da tela', () => {
    let viewModel;
    function Probe() {
      viewModel = usePlanos(false, null);
      return React.createElement('output', null, `${viewModel.planos.length}:${String(viewModel.loading)}`);
    }
    expect(renderToStaticMarkup(React.createElement(Probe))).toBe('<output>0:false</output>');
    expect(viewModel).toMatchObject({ planos: [], servicos: [], loading: false, modal: null, error: '' });
    expect(viewModel.openCreate).toEqual(expect.any(Function));
    expect(viewModel.save).toEqual(expect.any(Function));
    expect(viewModel.toggleActive).toEqual(expect.any(Function));
    expect(viewModel.remove).toEqual(expect.any(Function));
  });
});
