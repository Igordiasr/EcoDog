export function parsePlanCurrency(value) {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  const normalized = String(value ?? '').trim().replace(/^R\$\s*/, '').replace(/\./g, '').replace(',', '.');
  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) return null;
  const amount = Number(normalized);
  return Number.isFinite(amount) ? amount : null;
}

export function formatPlanCurrency(value) {
  const amount = parsePlanCurrency(value);
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(amount ?? 0);
}

export function planDailyLabel(value) {
  const count = Number(value);
  return `${count} ${count === 1 ? 'diária' : 'diárias'}`;
}

export function validatePlan(fields) {
  const errors = {};
  if (!String(fields.nome ?? '').trim()) errors.nome = 'Informe o nome do plano.';
  if (!Number.isSafeInteger(Number(fields.idServico)) || Number(fields.idServico) <= 0) errors.idServico = 'Selecione um serviço.';
  if (!Number.isSafeInteger(Number(fields.diarias)) || Number(fields.diarias) <= 0) errors.diarias = 'Informe ao menos uma diária.';
  const valor = parsePlanCurrency(fields.valor);
  if (valor === null || valor < 0) errors.valor = 'Informe um valor válido.';
  return errors;
}

export function planRequest(fields) {
  return {
    nome: String(fields.nome).trim(),
    idServico: Number(fields.idServico),
    diarias: Number(fields.diarias),
    valor: parsePlanCurrency(fields.valor),
    ...(typeof fields.ativo === 'boolean' ? { ativo: fields.ativo } : {}),
  };
}
