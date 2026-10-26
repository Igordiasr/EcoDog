# SPEC-04 — Disponibilidade, orçamento, agendamento e agenda

**Prioridade:** P4. **Telas:** TL03, agenda TL05 e entrada pública TL09. **Gate:** SEC-01 nas consultas pessoais/orçamento/escritas.

## Execução localizada

- Ler `src/services/booking-draft.ts`, `booking-cart.ts` e `tutor-schedule.ts`; criar `src/services/booking-api.ts`. Na UI ler seletivamente `src/components/BookingDates.tsx`, `BookingCart.tsx`, `ScheduledPetDays.tsx` e `src/design/booking.ts`/`structure-booking.ts`. Buscar handlers TL03/TL05/TL09 em `src/screens/ScreenPage.tsx`.
- Ordem: serviços/disponibilidade → pets autorizados → orçamento → reserva → agenda de leitura → cancelamento apenas após AGE-05. SPEC-02 não é leitura obrigatória: pool compartilhado, ausência de configuração e concorrência estão resumidos nos gates abaixo. Não criar ID de reserva com chave visual.
- Criar `tests/booking-api.test.ts`; executar `npm test -- tests/booking-api.test.ts tests/booking-cart.test.ts tests/booking-draft.test.ts` e `npm run test:e2e -- tests/e2e/booking.spec.ts tests/e2e/booking-pets.spec.ts tests/e2e/structure-flow.spec.ts`.
- Auditoria pontual: `../backend/src/main/java/br/com/ecodogpark/backend/controller/AgendamentoTutorController.java`; consultar apenas DTO/service da operação em dúvida.

## Contratos publicados

| Método/endpoint | Parâmetros/corpo | Resposta |
|---|---|---|
| GET `/calendario/servicos` | `categoria` obrigatória | 200 `ServicoAtivoResponse[]` |
| GET `/calendario/disponibilidade` | `servico`, `ano`, `mes` obrigatórios | 200 `VagasDisponiveisResponse[]` |
| GET `/calendario/pets` | `idUsuario` obrigatório | 200 `PetsDoTutorResponse[]` |
| GET `/calendario/tutor/agendamentos` | `idUsuario`, `ano`, `mes` obrigatórios | 200 `AgendamentosTutorResponse[]` |
| POST `/calendario/orcamentos` | query `idUsuario`; `OrcamentoRequest` | 200 `OrcamentoResponse` |
| POST `/calendario/agendamentos` | query `idUsuario`; `OrcamentoRequest` | Swagger 200; controller local 201; `AgendamentoCriadoResponse` |
| PATCH `/calendario/agendamentos/{idAgendamento}/cancelar` | query `idUsuario`; sem corpo | 200 `CancelamentoResponse { mensagem }` |

Estes endpoints têm documentação de erros incompleta. Tratar 400/403/404/409/5xx conforme SPEC-00; não concluir que o único resultado possível é 200.

`OrcamentoRequest`: `{ idServico, idsPet, datasUtilizacao, dataInicioPlano }`. Para modalidade não plano, usar ID real, IDs distintos de pets autorizados e datas civis distintas. `dataInicioPlano` não é usado nesta etapa; alinhar omissão/nulo com backend. Não enviar carrinho, nomes ou frequência como substitutos desses campos.

## Serviços e disponibilidade

- Adaptador planejado `src/services/booking-api.ts`; `ServicoAtivoResponse.id` é ID de serviço (diferente de `idServico` em outros DTOs). Preservar `categoria`, `modalidade`, `frequencia`, `valor`.
- Código aceita categorias normalizadas `CRECHE`, `HOTEL`, `DAYUSE`, embora Swagger publique apenas string. Modalidade `PLANO` e endpoint `/calendario/planos/agendamentos` permanecem excluídos; não contratar plano incidentalmente pelo POST genérico.
- Disponibilidade: `data`, `categoriaServico`, `capacidadeTotal`, `vagasDisponiveis`; mapear por data/categoria real. Ausência ou consulta falha = desconhecido, nunca zero/fechado nem vaga garantida.
- Exibir contagem informativa no calendário preservado; remover dependência de cor/seed para autorizar seleção real. Seleção marcada visualmente não reserva vaga.
- Revalidar ao mudar categoria/mês/pets e antes de orçamento; tamanho do grupo exige vagas para todos em cada data.

**Gate AGE-01:** regra única de capacidade com SPEC-02, estados AGENDADO/CONFIRMADO, pool Creche/DayUse, datas agendadas versus `dataEntrada`, domingo/feriado, antecedência e Hotel. Código atual conta ocupação por `dataEntrada`, que check-in sobrescreve; efeitos devem ser resolvidos/testados no backend, não compensados por cor ou timezone local.

**Gate AGE-02:** regras de preço/feriados aprovadas. `calcularValorTotal` local multiplica valor × datas × pets, sem feriados/preços diferenciados. `booking-cart.ts` é estimativa e não pode virar confirmação autoritativa.

## Fluxo operacional

1. Carregar serviços não plano e pets autorizados; sem pets usar estado específico e acesso a TL06.
2. Escolher serviço/datas/IDs de pets; preservar rascunho na transição TL09 → login → TL03, mas revalidar IDs e disponibilidade após autenticação. `booking-draft` não guarda autorização nem garantia de vaga.
3. POST orçamento; exibir `servico`, `modalidade`, nomes retornados, `datasUtilizacao`, `valorTotal`. Requisição obsoleta após mudança de seleção é descartada.
4. Mostrar revisão com preço do servidor; diferença de estimativa exige revisão explícita, sem alterar cobrança silenciosamente.
5. Confirmar → uma chamada POST agendamento. Servidor recalcula preço, propriedade, capacidade, conflito e gravação atômica do conjunto.
6. Resposta possui apenas `valorTotal` e `aguardandoAprovacao`, **sem IDs/datas/nome do serviço**. Não criar comprovante/protocolo inexistente nem dizer “confirmado” se aguarda aprovação. Limpar rascunho somente após sucesso.
7. Consultar agenda após sucesso; consulta falha não repete POST. Interrupção de rede após envio deixa resultado indeterminado e requer reconciliação.

**Gate AGE-03:** transação existente não comprova exclusão mútua. Testar último lugar com duas reservas concorrentes, multipet/multidata e duplicidade; backend precisa garantir capacidade sem overbooking. Sem endpoint/token de idempotência, não repetir escrita automaticamente.

**Gate AGE-04:** alinhar HTTP 200/201 Swagger/controller; adaptador pode reconhecer ambos como sucesso com DTO válido, registrando a divergência até correção. Testar a versão efetivamente implantada.

## Agenda e cancelamento

`AgendamentosTutorResponse` tem `data`, `idPet`, `nomePet`, `servico`, `situacaoAgendamento`; **não tem `idAgendamento`**. Retorna estados de presença, não status do plano.

- Adaptar `TutorScheduleSource` para agenda de leitura sem identidade de reserva fictícia, ou aguardar DTO com ID. Não usar chave composta pet/data/serviço como ID enviável ao backend.
- Indicadores de Creche da TL05 podem ser derivados das linhas autorizadas/data; não afirmar frequência contratada/saldo/plano com base nessas linhas.
- Cancelamento exige ID real autorizado e política financeira. **Gate AGE-05:** incluir ID na consulta de agenda ou fornecer fonte autorizada equivalente, além de regra de efeitos em contrato/movimentação/prazo. Manter ação indisponível enquanto faltar.
- Não usar cancelamento do tutor para operações administrativas da TL14. Não inventar reembolso, multa ou exclusão em cascata.

## Estados e aceite

Painel `YTBAv`: buscando datas/pets, nenhum pet selecionado, indisponibilidade, erro, falha preservando escolhas e confirmação. “Auventura agendada” só com sucesso; aprovação pendente recebe copy distinta.

1. Preço confirmado vem do orçamento/reserva real, nunca do carrinho local.
2. Dois pets requerem capacidade para ambos; dois tutores concorrentes não excedem vaga no servidor.
3. Troca de serviço/mês invalida orçamento e seleção incompatível.
4. Campo sem ID de agenda não dispara cancelamento.
5. Falha/409 preserva escolhas e atualiza disponibilidade para revisão; sucesso + recarga falha não gera nova reserva.
6. Recorrência de Creche pode expandir datas civis para modalidade diária aprovada; não traduz frequência em contratação de plano.
7. Nenhum fluxo usa nomes de Thor/Mel/Luke, agosto de 2026 ou cores do protótipo como dados reais.

**Testes planejados:** `tests/booking-api.test.ts`, testes de cart/draft apenas como rascunho, E2E TL03/TL05/TL09 com relógio fixo e gates, concorrência em banco isolado.
