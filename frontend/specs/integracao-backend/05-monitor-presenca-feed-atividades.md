# SPEC-05 — Monitor: presença, feed e atividades

**Prioridade:** P5. **Telas:** TL11 → TL12/TL10. **Gate:** SEC-01 (monitor), IDs reais e RF-042 no servidor.

## Execução localizada

- Trabalhar uma seção por vez: A cria `src/services/presence-api.ts`; B cria `monitor-feed-api.ts`; C cria `daily-activities-api.ts` (todos planejados). Ler `src/services/prototype-safety.ts` e buscar handlers TL10/TL11/TL12 e `monitorSaved` em `src/screens/ScreenPage.tsx`.
- Na UI: `src/design/monitor-records.ts` (feed), `src/design/presentation-adjustments.ts` (`checkInFeedDesign`) e trechos de monitor em `src/components/DesignRenderer.tsx`. Não usar JSON de cards como fonte operacional.
- Ordem: presença/IDs e navegação → consultas feed → programação diária → escritas somente após gates. RF-042 exige proteção de servidor contra sobrescrita inclusive concorrente; trava em memória não atende.
- Criar `tests/presence-api.test.ts`, `tests/monitor-feed-api.test.ts`, `tests/daily-activities-api.test.ts`. Executar cada teste criado separadamente; regressão `npm test -- tests/monitor-safety.test.ts tests/prototype-safety.test.ts` e `npm run test:e2e -- tests/e2e/monitor-feed.spec.ts tests/e2e/critical-safety.spec.ts`.
- Auditoria Java em `../backend/src/main/java/br/com/ecodogpark/backend/controller/`: A `CheckinCheckoutController.java`; B `FeedMonitorController.java`; C `AtividadesDoDiaController.java`. Abrir só o controller da seção em execução.

## A. Presença — TL11

| Endpoint | Request | Resposta/sucesso | Erros declarados |
|---|---|---|---|
| GET `/checkin-checkout?data=yyyy-MM-dd` | Data opcional; padrão hoje em São Paulo | 200 `CheckinCheckoutResponse[]` | — |
| PATCH `/checkin-checkout/{id}/check-in` | `{ responsavel }` | 204 sem corpo | 400/404/409 |
| PATCH `/checkin-checkout/{id}/check-out` | `{ responsavel }` | 204 sem corpo | 400/404/409 |

`id` na transição é `idAgendamento`, não pet. Consulta traz `idAgendamento`, `idPet`, `nomePet`, `dataEntrada`, `dataSaida`, `situacao`, `tutorCheckin`, `tutorCheckout`, `pertences`, `racaoMarca`, `quantidade`.

- Criar adaptador/modelo planejados `src/services/presence-api.ts`; cards e contadores somente a partir de resposta validada.
- `AGENDADO`: aguardando entrada; `CONFIRMADO`: em permanência com evidência real; `RETIRADO`: saída registrada; `CANCELADO`: sem ações de presença. Contradição entre estado/horários bloqueia ação e pede recarga.
- Código de reserva grava `dataEntrada` à meia-noite antes do check-in; GET devolve valor cru apesar da descrição Swagger “nulo antes da entrada”. Não exibir esse valor como entrada registrada. Modelo deve separar programação/presença; **gate MON-01:** corrigir/alinhação do contrato de data e validar o dia da transição no servidor.
- Check-out atual só exige `dataEntrada != null` e `dataSaida == null`; não exige CONFIRMADO. Backend deve impedir saída de AGENDADO/CANCELADO e check-in fora do dia permitido, com proteção concorrente.
- `responsavel` é nome de quem entrega/retira, não identidade autenticada do monitor. Confirmar formulário com texto não branco ≤ 100 e autoria de servidor; não copiar persona Mariana/P02.
- Após 204 recarregar presença; não inventar timestamp com relógio do navegador.
- Raça/tutor/cuidados/horário previsto do protótipo não constam desse DTO. Exigir fonte complementar autorizada ou apresentar ausência explícita; `tutorCheckin` não é nome do tutor proprietário.
- Pertences/ração/quantidade estão disponíveis para leitura; PATCH não os grava. Não prometer edição desses campos.

## B. Feed — TL10

| Endpoint | Request/response | Sucesso/erros |
|---|---|---|
| GET `/feed-monitor/pet/{id}` | `PetFeedMonitorResponse { nome, raca, nomeTutor, observacao }` | 200; 404 |
| GET `/feed-monitor/pet/{id}/atividades` | `AtividadeDoPetResponse[]` | 200, inclusive vazio |
| GET `/feed-monitor/pet/{id}/medicacoes` | `MedicacaoDoDiaResponse[]` | 200, inclusive vazio |
| PUT `/feed-monitor/pet/{idPet}/atividades/{idParticipacao}` | `{ situacao, observacao }` → participação | 200; 400/404 |
| PUT `/feed-monitor/pet/{idPet}/medicacoes/{idMedicacao}` | `{ situacao, observacao }` → medicação do dia | 200; 400/404 |
| POST `/feed-monitor/pet/{id}/observacoes` | `{ observacao }` → `{ observacao }` | 201; 400/404 |

- Navegar de TL11 com contexto real `{ petId, appointmentId, date }` derivado do card. Modelo interno não acrescenta parâmetros HTTP inexistentes: endpoints feed só recebem pet e trabalham com dia atual/CONFIRMADO no service local. **Gate MON-02:** validar correlação/autorização, unicidade do agendamento do dia e data antes de salvar; não selecionar pet pelo nome.
- Adaptador planejado `src/services/monitor-feed-api.ts`; consultas podem rodar em paralelo com estados por seção. Uma falha não vira vazio nem habilita escrita com IDs antigos.
- Atividade: `idParticipacaoDoPet`, `nomeAtividade`, `categoriaAtividade`, `situacao`, `observacao`. IDs de participação não são `idAtividade` nem `idAtividadeDoDia`.
- Medicação: `idMedicacaoDoDia`, `nomeMedicacao`, `status`, `observacao`. Não usar ID de catálogo/associação de saúde na URL.
- Escrever atividade apenas PARTICIPOU/NAO_PARTICIPOU; medicação apenas TOMOU/NAO_TOMOU. PENDENTE existe no enum mas service rejeita como submissão. Justificativa não branca obrigatória nas opções negativas.
- Service sobrescreve observação com “Sem observação” em opções positivas. Se UI permite observação positiva, informar incompatibilidade e bloquear perda silenciosa até regra/contrato aprovado; não dizer que o texto foi salvo.
- Observação geral: limite publicado 200 caracteres; validar conteúdo real. Resposta não tem ID, data, autor ou horário; não exibir persona como autoria operacional e não fabricar histórico versionado.

**Gate MON-03 — RF-042:** alimentação, medicações, comportamento, atividades e intercorrências são históricos protegidos. Backend atual permite sobrescrever participação/medicação já gravada; `monitorSaved` é só memória. Exigir rejeição de segunda gravação/correção indevida, autoria/vínculo e consistência concorrente no servidor. Só liberar controles de primeira gravação quando essa proteção for demonstrada. Após sucesso, bloquear edição e manter snapshot canônico retornado, não rascunho.

**Alimentação:** não existe endpoint independente confirmado para refeições manhã/tarde. Não transformar refeição em observação geral nem atualizar atividade de catálogo pelo rótulo. Se backend representa alimentação por participação categorizada, equipe precisa confirmar identidade, enum, observações e semântica antes do adaptador. Até lá seção real indica indisponibilidade; exemplos continuam só na prévia.

**Histórico de observações:** diário fornece texto concatenado, não registros estruturados/autoria/versões para monitor. Manter histórico estruturado indisponível até contrato autorizado. POST confirmado + rede/recarga falha não pode ser repetido automaticamente por risco de duplicar observação sem ID.

## C. Atividades do dia — TL12

| Endpoint | Request/response | Sucesso/erros |
|---|---|---|
| GET `/atividades` | `AtividadesDoDiaResponse { data, atividadesDoDia[] }` | 200 |
| PUT `/atividades` | `{ situacao, idAtividadeDoDia }` | 204; 400/404 |
| PUT `/atividades/atualizarPets` | **Array de IDs de participação**, não IDs de pets | 204 |

`AtividadeProgramadaResponse`: ID, nome/descrição/categoria, horaInicio/horaFim, situacao, grupos. Grupo: `{ grupo, petsDoGrupo[] }`; pet: `{ idPet, nome, idParticipacaoDoPet, idAgendamento }`.

- Adaptador planejado `src/services/daily-activities-api.ts`; consulta só hoje no backend, sem parâmetro `data` publicado. Mostrar `response.data`; não criar navegação histórica com query inexistente.
- Grupos/cards vêm da API; `grupo = 0` não significa quatro pets ou grupo ilustrativo. Não fabricar composição, raça/cuidados/duração. Duração só pode ser derivada dos horários reais com regra válida.
- `situacao` global: PENDENTE/CONCLUIDA/NAO_CONCLUIDA. Filtro concluídas usa CONCLUIDA; demais estados identificados separadamente, sem tratar NAO_CONCLUIDA como participação negativa de todos.
- “Concluído” chama apenas PUT `/atividades` para estado global. Não chamar lote automaticamente: conclusão da atividade não prova participação de todos os pets.
- Lote recebe `idParticipacaoDoPet[]`, validando cada vínculo/data/presença/permissão e resultado atômico no servidor. **Gate MON-04:** service atual atualiza por IDs sem esses limites e sem proteção RF-042; manter lote desativado.
- PUT global atual verifica existência, mas não data/presença/imutabilidade do registro. Gate MON-03 também se aplica a essa escrita; não liberar simples troca entre concluída/pendente como edição livre.

## Estados, testes e aceite

Painéis `YTBAv`, `p0fsx`, `FNSk8`: carregamento, vazio, erro, seleção não salva, confirmação contextual, salvando/concluindo com controles bloqueados e retorno seguro. Adicionar distinção de resultado indeterminado e sucesso com falha de recarga da SPEC-00.

1. Check-out sem CONFIRMADO/evidência válida não envia; servidor também rejeita tentativa direta.
2. Entrada/saída 204 recarrega horários canônicos sem segunda transição.
3. Feed aberto para um card mantém IDs do mesmo pet/agendamento; 404 não carrega outro registro.
4. Registro negativo exige justificativa; positivo não perde texto silenciosamente.
5. Segundo salvamento protegido, inclusive de outro navegador, é rejeitado no servidor.
6. CONCLUIDA global não marca participação em lote; payload de lote usa participação, nunca pet.
7. IDs fora do dia/presença/perfil ou de outro recurso são rejeitados.
8. Alimentação/histórico/autoria sem contrato aparecem como pendências, não como dados persistidos.

**Testes planejados:** adaptadores de presença/feed/atividades, `tests/e2e/critical-safety.spec.ts`, `monitor-feed.spec.ts`, fluxo TL11→TL10 com IDs de fixture, concorrência/imutabilidade em ambiente isolado após gates.
