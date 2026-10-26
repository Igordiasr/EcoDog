# SPEC-00 — Transporte, identidade e estados transversais

**Prioridade:** P0. **Escopo:** infraestrutura mínima para as specs seguintes, sem implementar login/cadastro.

## Execução localizada

- Ler `src/services/http.ts`, `src/services/api.ts` e `src/services/activity-catalog.ts`. `getJson(baseUrl, path, signal?, request?)` retorna `Promise<unknown>`; manter injeção de fetch para testes. `HttpError` expõe `status` e `fields`.
- `EcoDogApi.execute` retorna apenas `{ message }`, não DTO de domínio: manter fontes/adaptadores tipados separados, sem sucesso genérico para operações excluídas.
- Ler `src/App.tsx` na composição; `src/main.tsx` apenas se necessário. Buscar handlers afetados em `src/screens/ScreenPage.tsx` e gates em `src/services/prototype-safety.ts`.
- Ordem: transporte → testes → composição sem liberar módulos protegidos → isolamento de prévias. Criar `tests/http.test.ts`; executar `npm test -- tests/http.test.ts tests/activity-catalog.test.ts tests/prototype-safety.test.ts` e `npm run build`. Composição: `npm run test:e2e -- tests/e2e/critical-safety.spec.ts`.

## Estado atual

`App` usa `unavailableApi`; `session()` retorna `null`. Rotas protegidas redirecionam para `/entrar`. `Session { userId, name, profile }` é modelo de frontend, não prova de autenticação. `prototype-safety.ts` bloqueia operações dependentes de cards ilustrativos. `http.ts` só oferece GET com `credentials: 'omit'`.

## Requisitos

- **BASE-01:** evoluir `src/services/http.ts` para transporte tipado GET/POST/PUT/PATCH/DELETE, mantendo `getJson` compatível com catálogo público. Receber `AbortSignal`, serializar query com `URLSearchParams`, enviar JSON apenas quando há corpo e não executar `response.json()` em 204.
- **BASE-02:** DTOs HTTP e validação ficam nos adaptadores em `src/services/`; hooks recebem modelos de apresentação. Não espalhar `fetch` em `ScreenPage.tsx` nem converter `EcoDogApi.execute` em sucesso genérico para todas as operações.
- **BASE-03:** manter URL de API explícita e validada, por `VITE_API_BASE_URL`; exemplo DEV `http://localhost:8080`. Não criar `.env` com segredos nem alterar produção. Base sem credenciais/query/fragmento; HTTPS em produção HTTPS.
- **BASE-04:** manter contrato público sem credenciais. Para dados protegidos, definir transporte de sessão com a equipe de backend antes de implementar: cookie com proteção CSRF ou token, conforme contrato aprovado. Não presumir JWT, Bearer, refresh token ou endpoint `/me` inexistente.
- **BASE-05:** identidade vem de sessão validada no servidor. `idUsuario`/`idTutor` enviados devem corresponder ao principal autorizado; `idPet`, agendamento e registro devem ser autorizados por propriedade/perfil no backend. Nunca usar nome, posição, ID de nó Pencil ou usuário fixo.
- **BASE-06:** manter bloqueios atuais até cada fluxo possuir fonte real, IDs, autorização e regra confirmada. Um adaptador que resolve Promise não habilita automaticamente os controles.
- **BASE-07:** fontes reais não são utilizadas por `/prototipo/*`; mocks permanecem explicitamente DEV. Revisar inclusive injeções de `dashboardSource`, `calendarSource`, `petHealthCatalogSource` e `tutorScheduleSource`, hoje encaminhadas às prévias por `App`.
- **BASE-08:** cancelar consultas ao trocar tela/pet/data/filtro; descartar respostas fora de ordem. Cache, se houver, segregado por identidade e período; limpar dados pessoais ao sair ou trocar sessão.

## Modelo de estados de consulta e escrita

**Consulta:** bloqueada → carregando → sucesso/vazio/erro. “Vazio” exige resposta válida vazia; 403/404/DTO inválido não são lista vazia. Dados antigos podem permanecer apenas identificados como desatualizados e sem habilitar ação que dependa deles.

**Escrita:** rascunho → validação → confirmação contextual → enviando → confirmada → recarregando. Usar trava síncrona contra duplo clique, desabilitar ação e preservar campos enquanto pendente.

| Resultado | Comportamento obrigatório |
|---|---|
| 400 | Mensagem geral e erros apenas nos campos conhecidos; preservar rascunho |
| 401 | Indicar sessão necessária/expirada e limpar dados protegidos conforme contrato |
| 403 | Acesso negado; não repetir com outro ID ou exibir dados anteriores |
| 404 | Recurso não disponível; não substituí-lo por outro registro |
| 409 | Conflito; preservar escolhas e oferecer atualização/revisão |
| 5xx/rede/CORS/parsing | Erro seguro, sem mock como fallback |
| 204 previsto | Sucesso sem corpo, seguido da recarga aplicável |
| Sucesso + falha de recarga | “Operação confirmada; não foi possível atualizar a consulta”; oferecer só recarga |
| Rede interrompida após envio | Resultado indeterminado; reconciliar por consulta antes de repetir escrita |

Não implementar retry automático de escrita: não há contrato de idempotência publicado. Em operações sem consulta identificável suficiente, mostrar pendência de confirmação e não garantir que nova tentativa seja segura. Cancelar `fetch` de escrita não garante rollback no servidor.

`ApiExceptionHandler`/`ResponseStatusException` podem gerar formatos diferentes. Preservar status técnico; permitir mapas de erros string somente por whitelist de campos. Nunca mostrar stack trace, SQL, HTML remoto ou mensagens contendo dados de outro usuário.

## Datas, enums, IDs e dinheiro

- `LocalDate`: `yyyy-MM-dd`; `YearMonth`: `yyyy-MM`. Validar data civil e não convertê-la em UTC.
- `LocalTime`: `HH:mm:ss`; exibir `HH:mm` apenas com regra explícita para segundos. Não inventar fuso/instante.
- `LocalDateTime` do check-in aparece sem offset apesar de Swagger `date-time`. Tratar como horário local do backend em `America/Sao_Paulo`, não com `new Date(valor)` dependente do fuso do navegador; alinhar contrato de offset antes de suportar instantes absolutos.
- Categorias: mapear `CRECHE`, `HOTEL`, `DAYUSE` para rótulos; estados de agendamento não são estados de pagamento/contrato. Enum desconhecido torna ação indisponível, nunca usa valor por posição.
- IDs Java `int64`: aceitar apenas inteiros positivos seguros no JSON atual; converter para string no modelo interno quando necessário. Se backend precisar de valores maiores que `Number.MAX_SAFE_INTEGER`, exigir representação textual, sem recuperar precisão perdida.
- Valores reais: validar número finito e converter para centavos com arredondamento decimal controlado, limites seguros e saída pt-BR. Zero retornado é diferente de campo ausente. Nunca enviar preço local como cobrança autoritativa.

## CORS e liberação

Há `@CrossOrigin(http://localhost:5173)` em vários controllers; `DashboardController` não o declara. Verificar CORS por grupo e preflight de escrita; Swagger/Node funcionar não comprova acesso do navegador. Não adicionar proxy para esconder falta de autorização ou ampliar CORS indiscriminadamente.

**Gate SEC-01:** equipe responsável entrega mecanismo de identidade e matriz tutor/monitor/admin/propriedade; testes provam 401/403 e acesso cruzado negado. Enquanto não atendido, somente consultas públicas aprovadas podem operar.

## Arquivos planejados e aceite

- Evoluir `src/services/http.ts`, `api.ts` e bootstrap `App.tsx`/`main.tsx` apenas na composição necessária. Criar adaptadores por domínio e testes em `tests/`.
- Cenário: prévia com fonte real configurada → nenhuma chamada real.
- Cenário: duas consultas A/B com A atrasada → B permanece na tela.
- Cenário: POST confirmado e GET falha → nenhum segundo POST ao clicar recarregar.
- Cenário: duas submissões no mesmo tick → uma escrita.
- Cenário: 204, corpo inválido, 400 mapa, 403, 409, API offline → estados corretos sem vazamento ou fallback.
- Cenário: sessão inválida ou ID de outro tutor → backend nega; frontend não contorna.
