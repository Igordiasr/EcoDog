# SPEC-06 — Diário e consulta por data

**Prioridade:** P6. **Tela:** TL07 `/tutor/diario`. **Gate:** SEC-01 (tutor/propriedade) e DIA-01 abaixo.

## Execução localizada

- Criar `src/services/pet-diary-api.ts` e modelo/hook tipado; consultar `src/services/api.ts` para sessão e buscar TL05/TL07 em `src/screens/ScreenPage.tsx`. Transformação visual existente: `diaryActionsDesign` em `src/design/presentation-adjustments.ts`.
- Ordem: seleção autorizada/ID → consulta pet/data cancelável → validação DTO → estados de leitura → composição somente após DIA-01/SEC-01. SPEC-05 não precisa ser carregada: conclusão global não prova participação individual e observações não têm histórico estruturado.
- Criar `tests/pet-diary-api.test.ts`; executar `npm test -- tests/pet-diary-api.test.ts` e `npm run test:e2e -- tests/e2e/pets.spec.ts tests/e2e/critical-safety.spec.ts`. E2E específico TL05→TL07 é planejado, não coberto automaticamente pelos arquivos existentes.
- Auditoria pontual: `../backend/src/main/java/br/com/ecodogpark/backend/controller/DiarioPetController.java`; localizar `DiarioPetService` somente para validar DIA-01.

## Contratos confirmados

| Endpoint | Parâmetros | Resposta |
|---|---|---|
| GET `/api/diario/{idPet}` | `data=yyyy-MM-dd` opcional; padrão hoje em São Paulo | 200 `DiarioPetResponse` |
| GET `/api/diario/{idPet}/historico` | Mesma data, **obrigatória** | 200 mesmo DTO; 400 data inválida/ausente |

Histórico retorna **um diário de uma data**, não lista de dias, paginação ou timeline de versões.

| Campo | Apresentação |
|---|---|
| `idPet`, `data` | Conferir correspondência com pet/data consultados |
| `resumo.statusRefeicao`, `resumo.statusEngajamento` | Textos retornados, sujeitos ao gate semântico |
| `atividades[] { descricao }` | Descrição textual; não possui ID, horário ou enum de participação |
| `medicacoes[] { nome, status }` | Rótulo e PENDENTE/TOMOU/NAO_TOMOU |
| `observacoes` | Texto concatenado com quebras de linha; sem autoria/horário por registro |

## Implementação planejada

- Criar `src/services/pet-diary-api.ts` e hook/modelo de consulta autorizada; reutilizar layout TL07 e `diaryActionsDesign`.
- “Ver diário” de TL05 fornece ID real. Entrada direta sem pet selecionado exige escolha autorizada, não o primeiro Thor do JSON. Navegação não concede acesso: servidor verifica propriedade a cada GET.
- Manter datas completas na seleção; enviar data explicitamente para consultas reproduzíveis. Troca pet/data cancela consulta e descarta resultado antigo.
- Não converter descrição de atividade em nome/participação, nem texto concatenado em registros com autores/horários inventados.
- Conteúdo remoto é texto React; preservar quebras de linha sem HTML remoto. Medicação PENDENTE não significa “Não tomou”.
- 200 com arrays vazios/observações vazias permite estado “Sem registros” considerando também o resumo válido. Falha/403/DTO inválido não equivale a vazio.
- UI é somente leitura e não oferece edição/exclusão de histórico protegido.

## Gate DIA-01 — semântica do pet

`DiarioPetService.montarResumo` usa a situação **global** de `AtividadesDoDiaEntity` para afirmar que o pet participou/completou refeições. Isso não prova a participação individual, cujo registro é `ParticipacaoDoPetEntity`.

Antes de exibir resumo operacional, backend precisa basear afirmações nos registros individuais e separar alimentação de conclusão global, conforme SPEC-05. Não corrigir interpretação inventando status no frontend nem publicar frases sabidamente incompatíveis como resumo verdadeiro. Pode-se preparar consultas e testar mapeamento, mas liberação do diário depende de semântica correta e autorização.

## Estados e aceite

Seguir `YTBAv`: abrindo diário do pet/data reais, vazio, erro com retry e “Esse diário é privado”. Nome vem de fonte autorizada, não do próprio `idPet` ou persona.

1. Tutor A não consulta diário do pet B, inclusive por URL direta.
2. Data opcional/obrigatória respeita os dois endpoints; calendário não sofre deslocamento de fuso.
3. Trocas rápidas de pet/data não mostram diário anterior.
4. Atividade global concluída com pet NAO_PARTICIPOU não gera resumo “participou”.
5. Observações não ganham autoria/horário fictício; nenhum histórico é editável.
6. 200 vazio, 403, rede indisponível e payload incorreto têm estados distintos.

**Testes planejados:** `tests/pet-diary-api.test.ts`, E2E seleção TL05→TL07, privacidade e cenário de participação individual em backend de desenvolvimento.
