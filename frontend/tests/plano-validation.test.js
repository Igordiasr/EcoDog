import { describe, expect, it } from 'vitest';
import { formatPlanCurrency, parsePlanCurrency, planDailyLabel, planRequest, validatePlan } from '../src/models/plano-validation';

describe('validação e apresentação de planos', () => {
  it('valida os campos obrigatórios e valores positivos', () => {
    expect(validatePlan({ nome: '', idServico: '', diarias: '0', valor: 'x' })).toMatchObject({
      nome: expect.any(String), idServico: expect.any(String), diarias: expect.any(String), valor: expect.any(String),
    });
    expect(validatePlan({ nome: 'Hotel', idServico: '2', diarias: '8', valor: '120,50' })).toEqual({});
  });

  it('converte e formata valores em reais', () => {
    expect(parsePlanCurrency('R$ 1.234,50')).toBe(1234.5);
    expect(formatPlanCurrency(0)).toBe('R$ 0,00');
    expect(planRequest({ nome: 'Hotel', idServico: '2', diarias: '8', valor: '120,50' })).toEqual({
      nome: 'Hotel', idServico: 2, diarias: 8, valor: 120.5,
    });
  });

  it('pluraliza diária', () => {
    expect(planDailyLabel(1)).toBe('1 diária');
    expect(planDailyLabel(8)).toBe('8 diárias');
  });
});
