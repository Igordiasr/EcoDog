# SPEC-02 — Calendário administrativo

**Prioridade:** P2. **Tela:** TL14 `/admin/calendario`. **Gate:** SEC-01 (admin) para leitura e escrita.

## Execução localizada

- Ler `src/services/calendar-model.ts` e `src/services/use-management-calendar.ts`; criar `src/services/calendar-api.ts`. Só na UI ler `src/design/management-calendar.ts` e `src/components/ManagementCalendar.tsx` (`ManagementCalendarDialogs`). Composição em `src/App.tsx`; handlers TL14 em `src/screens/ScreenPage.tsx` por busca.
- Ordem: DTOs/leitura → resolver modelo de alunos sem serviço → estados → escritas com gates → composição protegida. Sem decisão de produto, preparar leitura e manter controles incompatíveis indisponíveis; não escolher mudança visual silenciosamente.
- Criar `tests/calendar-api.test.ts`; executar `npm test -- tests/calendar-api.test.ts tests/calendar.test.ts` e `npm run test:e2e -- tests/e2e/management-calendar.spec.ts`.
- Auditoria pontual: `../backend/src/main/java/br/com/ecodogpark/backend/controller/GerenciamentoCalendarioController.java`; localizar DTO pelo nome da tabela abaixo. Não ler módulos de tutor/monitor para esta etapa.

## Contratos confirmados

| Método/endpoint | Entrada | Saída/sucesso | Erros declarados |
|---|---|---|---|
| GET `/calendario/dias` | query `mes=yyyy-MM`, obrigatório | 200 `LocalDate[]` | 400 |
| GET `/calendario/dia` | query `data=yyyy-MM-dd`, obrigatória | 200 `CalendarioDiaResponse` | 400 |
| GET `/calendario/catalogo-atividades` | — | 200 catálogo | — |
| PUT `/calendario/{data}/vagas` | `{ vagasCreche, vagasHotel }`, ambos inteiros ≥ 0 | 200 `CalendarioDiaResponse` | 400 |
| POST `/calendario/{data}/atividades` | `{ idAtividade, horaInicio, horaFim }` | 201 `AtividadeCalendarioResponse` | 400/404/409 |
| DELETE `/calendario/atividades/{id}` | ID de **atividade do dia** | 204 sem corpo | 404/409 |

`CalendarioDiaResponse`: `idCalendario`, `data`, `vagasCreche`, `vagasHotel`, `atividades[]`, `alunosAgendados[]`. Dia inexistente: ID nulo, vagas zero e atividades vazias; não equivale a um bloqueio administrativo confirmado.

## Leitura e modelo

- Criar adaptador planejado `src/services/calendar-api.ts`; reutilizar `CalendarSource`, `useManagementCalendar`, `managementCalendarDesign` e `ManagementCalendarDialogs`.
- `loadMonth(period)` consulta datas configuradas e seus detalhes, com concorrência limitada; incluir consulta do dia selecionado mesmo se não configurado. Mudança de seleção/mês deve cancelar ou invalidar resultados antigos.
- Falha de um dia não o transforma em dia vazio/zero. Expor falha identificada ou falhar o mês integralmente, sem dados parciais habilitando escrita; a política escolhida deve ser testada.
- Configuração com `idCalendario = null`: preservar ausência de configuração no modelo, sem inferir `available = false` ou `true` a partir de vagas/cores.
- Atividade: `idAtividadeDoDia` → identidade da programação; guardar `idAtividade` separadamente para catálogo. Nome/horários retornados são canônicos.
- Aluno: `idAgendamento`, `idPet`, `nome`, `raca`, `idade`, `tutor`, `situacao`. Idade é da data consultada, não nascimento estimado. Não inventar serviço ou horário.

**Incompatibilidade obrigatória:** `CalendarBooking` exige `service`, e a API não o fornece. Antes de conectar os alunos ao modelo, aprovar uma destas soluções: extensão do DTO com serviço real ou modelo de apresentação para alunos sem serviço. Preferir adaptação localizada para leitura; capacidade/ocupação por serviço permanece indisponível até informação autoritativa. Não associar registros pela ordem ou por nome com a agenda de outro perfil.

Estados `AGENDADO`, `CONFIRMADO`, `RETIRADO`, `CANCELADO` precisam permanecer distinguíveis: modelo atual só prevê pending/confirmed/cancelled. Não mapear RETIRADO automaticamente para reserva cancelada nem descartar presença histórica.

## Escritas e limites

### Vagas do dia

- Formulário de um serviço precisa enviar **ambos** os campos do PUT. Preservar valor real do outro serviço; não preencher zero por ausência/falha de consulta.
- Exigir validação no backend de ocupação e controle concorrente de alteração/reserva. O service atual simplesmente sobrescreve valores; validação local não libera esta escrita.
- Backend deve alinhar padrão 10 da disponibilidade/reserva com zero do calendário inexistente, estados que ocupam capacidade e compartilhamento Creche/DayUse.
- Sem versionamento/ETag publicado, GET antes de PUT não elimina atualização perdida. Resolver política de concorrência antes de liberar alterações simultâneas.

### Programar/remover atividade

- Substituir nome livre do comando interno por seleção identificada do catálogo, sem redesign. Payload exige ID e horas válidas; fim posterior ao início.
- Código local proíbe sobreposição global no dia; injetar `activityConflict` conforme essa regra, mantendo backend autoritativo. Confirmar concorrência de criação.
- Remoção confirma nome/data e usa `idAtividadeDoDia`; 409 com pets vinculados preserva registro na tela.
- Não há PUT para editar programação. Manter edição indisponível, não simular com DELETE + POST.
- Não remover registros operacionais protegidos para contornar RF-042; DELETE publicado limita programação sem pets vinculados.

### Controles sem contrato

- “Aplicar ao mês todo”: indisponível até contrato de escrita mensal **atômica**. Não fazer loop de PUTs nem prometer rollback.
- Abrir/fechar/bloquear data: indisponível até contrato explícito. Vagas zero não é equivalente a bloqueio.
- “Remover agendamento” como admin: não usar PATCH do tutor com ID de usuário escolhido. Falta autorização/contrato administrativo de cancelamento.

## Painéis de status e aceite

Seguir `SI6gX`: consulta vazia, carregamento, erro, acesso negado e confirmações contextuais. Datas/nome nas mensagens vêm do registro selecionado; horários ausentes não viram `08:00–17:00`.

1. Selecionar A/B rapidamente não mistura alunos/atividades.
2. Dia não configurado aparece como tal, sem disponibilidade inventada.
3. Alunos sem serviço/horário são apresentados honestamente; cálculo por serviço não usa suposições.
4. Capacidade inferior à ocupação ou escrita concorrente é rejeitada pelo servidor antes da liberação.
5. POST com catálogo real persiste; DELETE 204 recarrega; DELETE 409 mantém programação.
6. Sucesso de escrita seguido de GET falho oferece apenas recarga, sem repetir escrita.
7. Ações mensais/bloqueio/edição/cancelamento admin sem contrato não enviam HTTP.

**Testes planejados:** `tests/calendar-api.test.ts`, regressões em `tests/calendar.test.ts` e `tests/e2e/management-calendar.spec.ts`; teste real com admin e base isolada após gates.
