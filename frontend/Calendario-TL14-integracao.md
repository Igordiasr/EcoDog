# Gerenciamento de calendário TL14

## Fonte e operações

`App.calendarSource` é o ponto de conexão. `CalendarSource.loadMonth` recebe
o período `AAAA-MM` e retorna dados normalizados de apresentação. Os tipos em
`src/services/calendar-model.ts` não definem endpoints, tabelas ou respostas HTTP.
O adaptador futuro deve mapear os contratos reais do backend.

`CalendarSource.apply` recebe comandos internos da interface. Alterações mensais
devem ser atômicas: não implementar como várias gravações independentes sem
transação. Vagas, disponibilidade, atividades e agendamentos são independentes.
Quando `apply` não é fornecido, somente vagas de um dia e criação/edição de
atividade podem utilizar as operações genéricas já existentes de `EcoDogApi`.
As demais ações informam indisponibilidade, sem inventar operações de API.

Após uma operação confirmada, os dados são consultados novamente. Falhas de
gravação preservam os campos. Se a gravação for confirmada mas a consulta falhar,
a interface diferencia esses resultados e oferece recarregar sem repetir a escrita.

## Regras

- Todas as chaves usam a data completa `AAAA-MM-DD`. A seleção inicial é hoje.
- Disponibilidade ausente é mostrada como “Sem configuração”, nunca presumida.
- Vagas são inteiros não negativos; a redução não pode ficar abaixo dos
  agendamentos confirmados. Pendentes/cancelados não ocupam essa contagem.
- Fechar um dia não cancela agendamentos existentes e exige confirmação quando
  há registros associados. O limite de cada serviço é independente.
- `validateBookingRequest` verifica disponibilidade, capacidade e conflitos
  conhecidos do mesmo pet. A integração real de agendamento precisa reutilizar
  essa fonte/regra e repetir as validações no servidor, inclusive sob concorrência.
- `activityConflict` é uma política injetável. Sem regra aprovada de simultaneidade,
  não é inventada uma proibição global de atividades simultâneas.
- `cancellationError` permite aplicar a política do sistema. Prazos, multas,
  reembolsos e restrições de cada serviço continuam pendentes de definição;
  não foi presumida uma política financeira ou um prazo novo.
- Reservas de hotel devem ser normalizadas por data de ocupação pelo adaptador,
  caso o modelo real use intervalos. Horários ausentes permanecem não informados.
- Cancelar altera somente o agendamento, sem excluir pet ou tutor.

## Desenvolvimento e testes

`/prototipo/TL14` usa `calendar-examples.ts` exclusivamente em DEV. Gravações
ficam em memória e são identificadas como mock, sem afirmar persistência real.
As fixtures `tests/fixtures/calendar-flow.*` são exclusivamente de teste.

Testes: `tests/calendar.test.ts` e `tests/e2e/management-calendar.spec.ts`.
