# Dashboard TL13 — integração e regras isoladas

## Ponto de conexão

`App.dashboardSource` recebe um `DashboardSource`, definido em
`src/services/dashboard-model.ts`. Seu método `load()` deve normalizar os dados
confirmados do backend para o modelo de apresentação do frontend. Esse modelo
não representa um contrato HTTP nem define endpoints.

`useDashboard` carrega a fonte, valida os formulários e reutiliza as operações
existentes `EcoDogApi.execute('saveGoal', ...)` e `execute('saveRevenue', ...)`.
O adaptador deve traduzir os campos e IDs conforme o contrato real aprovado.
Após uma operação confirmada, a fonte é consultada novamente e os indicadores,
gráficos e movimentações são recalculados. Uma falha de gravação mantém o popup
aberto e preserva os campos.

Sem uma fonte configurada, a rota autenticada mostra indisponibilidade. Apenas
a prévia DEV usa `dashboard-examples.ts`: suas alterações ficam em memória,
não representam persistência e são identificadas explicitamente na mensagem.

## Regras que precisam de confirmação pelo sistema

- `effectiveContract` exclui pendentes do gráfico de contratos efetivados.
  Contratos inativos continuam no histórico do mês em que foram criados.
  O mapeamento dos estados do backend deve confirmar essa distinção.
- Pets inativos pertencem exclusivamente à categoria Inativos. Um pet ativo
  com exatamente um serviço é classificado nesse serviço. Um pet com vários
  serviços precisa de `classification` fornecida pelo adaptador, conforme a
  regra aprovada. Sem ela, aparece uma pendência explícita; não há prioridade
  arbitrária nem contagem duplicada. O total da rosca é o dos pets classificados.
- Reservas devem chegar normalizadas por data de ocupação. Se Hotel utiliza
  intervalos de hospedagem, o adaptador deve expandi-los segundo a regra real.
- As janelas dos gráficos incluem o mês corrente: 12 meses para receitas e
  6 para novos contratos. Receitas mensais desconhecidas usam `null`, não zero.
- Os cálculos usam todos os registros fornecidos pela fonte. A seção Últimas
  movimentações exibe somente os três mais recentes, conforme a regra atual.
  A ordenação considera data completa e horário quando ambos os registros o
  possuem; horários desconhecidos não são inventados. O adaptador pode informar
  `time` no modelo de apresentação sem definir um novo campo de API.

## Validação

- `tests/dashboard.test.ts`: cálculos, contagens, classificação e validações.
- `tests/e2e/dashboard.spec.ts`: integração da TL13, formulários, atualizações,
  falhas, layout desktop/mobile, foco e fechamento dos popups.
- `tests/fixtures/dashboard-flow.*`: adaptadores exclusivamente de teste;
  não são usados pela aplicação nem pelo build de produção.
