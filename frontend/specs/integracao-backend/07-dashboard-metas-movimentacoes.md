# SPEC-07 — Dashboard, metas e movimentações

**Prioridade:** P7. **Tela:** TL13 `/admin`. **Gate:** SEC-01 (admin); ajustes semânticos/contratuais por seção.

## Execução localizada

- Ler `src/services/dashboard-model.ts` e `use-dashboard.ts`; criar `src/services/dashboard-api.ts`. Na apresentação consultar `src/design/dashboard.ts`, `src/components/DashboardCharts.tsx` e `DashboardField.tsx`; validação em `src/services/dashboard-validation.ts`. Buscar handlers TL13 em `src/screens/ScreenPage.tsx`; compor em `src/App.tsx` somente após gates.
- Ordem: agregados tipados sem entidades fictícias → normalização de séries → decisões de rótulos → consultas de metas/pendências → escritas aprovadas. Preservar fonte de exemplos para prévia; não carregar JSONs de gráfico/modal para reconstruir contratos.
- Criar `tests/dashboard-api.test.ts`; executar `npm test -- tests/dashboard-api.test.ts tests/dashboard.test.ts` e `npm run test:e2e -- tests/e2e/dashboard.spec.ts`.
- Auditoria pontual: `../backend/src/main/java/br/com/ecodogpark/backend/controller/DashboardController.java`; buscar `MetaRepository.buscarMetaPorMesEServico` só para DASH-06 e `DashboardService` só para séries/métrica divergente.

## Contratos publicados

| Método/endpoint | Entrada | Sucesso/DTO | Erros declarados |
|---|---|---|---|
| GET `/dashboard` | Sem filtro de período | 200 `DadosDashboardResponse` | — |
| GET `/dashboard/servicos` | — | 200 `ServicoParaListaResponse[]` | — |
| GET `/dashboard/metas` | `mesReferencia=yyyy-MM-dd` e `servico`, obrigatórios | 200 `MetaParaListaResponse[]` | — |
| POST `/dashboard/metas` | `ManipulacaoMetaRequest` | 201 `ManipulacaoMetaResponse` | 400 |
| PUT `/dashboard/metas/{id}` | Mesmo request; ID real de meta | **201**, mesmo response | 400/404 |
| GET `/dashboard/movimentacoes` | — | 200 `MovimentacaoPendenteResponse[]` | — |
| PUT `/dashboard/movimentacoes/{id}` | `AlterarMovimentacaoRequest` | 200 `MovimentacoesEntity` | 400/404 |

GET principal é agregado. Não existe filtro de mês publicado para ele; não acrescentar query para sugerir períodos arbitrários atendidos pelo servidor.

## Modelo e mapeamento de indicadores

`DashboardSource.load()` atual exige registros individuais em `DashboardData`; `dashboardSummary` recalcula contagens/somas. Isso não é compatível com resposta agregada sem fabricação de entidades.

**DASH-01:** criar adaptador planejado `src/services/dashboard-api.ts` e caminho de apresentação de agregados (ex.: fonte alternativa tipada), preservando fonte atual de exemplos/testes. Adaptar `dashboardDesign`/`useDashboard` pontualmente para receber indicadores/séries reais, não inventar `DashboardPet`, clientes, receitas ou reservas para alimentar cálculos existentes.

| Campo API | Elemento visual | Regra/limite |
|---|---|---|
| `kpiReceitas[] { categoria, acumuladoMes, meta, percentualMeta }` | Receita/meta por categoria | Converter dinheiro; meta zero não prova meta cadastrada; sem percentual significativo usar ausência explícita |
| `planosAtivos.planosAtivos` | Contagem publicada | Não equivaler automaticamente a todos os contratos ativos/pacotes; confirmar filtro do repository e rótulo |
| `agendamentosPorServico[] { servico, quantidadeAgendada }` | Agendamentos previstos hoje | Contagem de agendamentos AGENDADO/CONFIRMADO, não necessariamente pets únicos; capacidade ausente |
| `graficoReceita[] { mesReferencia, receitaPrevista, receitaRecebida }` | Série 12 meses incluindo atual | Zero retornado é conhecido; mês ausente é desconhecido |
| `graficoNovosServicos[] { mesReferencia, creche, hotel, dayUse }` | Série 6 meses | Novos contratos/serviços, não novos clientes |
| `graficoContratosPorServico[] { categoria, quantidade }` | Distribuição de contratos | Não preencher “Distribuição de pets” |
| `ultimasMovimentacoes[] { dataPagamento, servico, pet, valor }` | Últimas movimentações | Sem ID/horário: somente leitura; respeitar ordem do servidor para empates |

**DASH-02 — rótulos:** desktop/mobile do protótipo divergem: contratos ativos/pacotes ativos e novos contratos/novos clientes. Definir rótulo único conforme métrica real. “Pets previstos 6/10” exige denominador ausente no dashboard e unidade validada; não reutilizar capacidade 10 local. Até contrato adequado, apresentar apenas contagem com rótulo de agendamentos ou seção indisponível, mediante aprovação sem redesign.

**DASH-03 — rosca:** manter “Distribuição de pets” indisponível até contrato de pets únicos/inativos/classificação multiproduto. Alternativa de renomear para contratos requer aprovação de produto; jamais mostrar contratos como 44 pets. Não criar pets artificiais para reproduzir contagens.

**DASH-04 — séries:** Swagger usa exemplo `2026-10`, mas código local formata `MMMM/yyyy` pt-BR, como `outubro/2026`. Parser explícito aceita formatos confirmados, converte para `yyyy-MM`, trata todos os meses/acento/ano e rejeita desconhecido; não usar `Date.parse` de texto localizado. Preferível alinhar backend em formato ISO. Janela: receitas 12 meses, novos serviços 6. Código calcula “receita prevista” a partir de metas; confirmar significado antes de chamá-la previsão contratual.

## Metas: criar e editar

`ManipulacaoMetaRequest`: `{ mesReferencia: LocalDate, valor: number > 0, servico: ServicosEntity }`; referência é objeto **aninhado**, não `idServico` no topo.

- Seleção usa GET `/dashboard/servicos`, ID real `idServico`. Backend lista todos os serviços; definir filtro de elegibilidade/status e se meta pertence a serviço específico ou categoria. Não escolher arbitrariamente o primeiro serviço de Creche.
- Confirmar payload mínimo `{ servico: { idServico } }` no binding/persistência; schema de entidade não comprova validação/lookup seguro. Servidor deve resolver referência permitida sem aceitar alteração de preço/status pela entidade enviada.
- `mesReferencia` é data, não YearMonth. **Gate DASH-05:** padronizar dia de referência (proposta: dia 01) e buscar metas pelo mês completo. Código consulta igualdade exata da data; converter seleção “outubro” em `2026-10-01` pode perder metas gravadas no dia 26. Resolver antes da liberação, sem consultar todos os dias como workaround silencioso.
- `MetaParaListaResponse` traz `idMeta`, data, valor e serviço; editar pelo ID retornado. Response de POST/PUT não traz ID: após sucesso recarregar metas e dashboard; não inferir ID por posição.
- Confirmar regra de múltiplas metas por mês/categoria/serviço: KPI soma metas, modelo antigo espera uma por categoria. Não deduplicar apagando valores reais nem presumir unicidade.
- **Gate DASH-06:** validar consulta JPA de metas. `MetaRepository.buscarMetaPorMesEServico` faz `SELECT m, s` e declara `List<MetasEntity>`; o mapper espera entidade. Swagger acessível não comprova execução dessa projeção.
- POST e PUT aceitam 201 com DTO válido; falha mantém modal/campos, sucesso com recarga falha não repete operação.

## Movimentações: pendências versus nova receita

`MovimentacaoPendenteResponse`: `id`, `dataRegistro`, `usuario`, `pet`, `servico`, `valor`, `idContrato`. `AlterarMovimentacaoRequest`: `{ formaPagamento, dataPagamento, contrato: ContratosEntity }`, todos requeridos.

- GET retorna **pendentes**, não o histórico completo nem lista de todos os clientes/pets.
- Formulário visual “Adicionar receita” pede cliente/pet/serviço/data/valor; contrato só atualiza pagamento de movimentação existente. Não mapear `saveRevenue` livre para PUT por ID de design.
- **Gate DASH-07:** aprovar apresentação de seleção de pendência existente com ID, contrato e valor somente leitura, forma/data de pagamento; se deve criar nova receita, falta contrato e ação permanece bloqueada.
- Confirmar referência mínima `contrato: { idContrato }`, vínculo à movimentação e autorização no backend. Service atual permite substituir contrato recebido; não aceitar relink arbitrário por manipulação de payload.
- Valor/cliente/pet/serviço não são campos alteráveis no request; não prometer persistência deles.
- Sucesso PUT marca PAGO no service local; atualizar pendências e dashboard. Resposta é entidade: validar apenas campos necessários, não depender de grafo completo nem expor associações sensíveis.

## Estados e aceite

- Consulta principal: carregamento/vazio válido/erro seguro; não voltar aos R$ 1.800/6.300 do wireframe em falha.
- Catálogos/metas/pendências têm loading/error independentes nos formulários; ação indisponível se seleção incompleta.
- Manter desktop/mobile, foco, popups, indicadores e espaço dos gráficos; mudança de rótulo/unidade exige aprovação, não redesign.
- Verificar CORS do dashboard no navegador: controller local não declara `@CrossOrigin`.

1. Soma de receitas reflete agregados da API sem receitas individuais inventadas.
2. Contratos não são pets/clientes; capacidade ausente não vira 10.
3. Séries ISO/pt-BR normalizam e ordenam corretamente; zero e ausente distintos.
4. Meta positiva usa ID real/data padronizada; edição PUT 201 funciona; duplicidade não é escondida.
5. Registro de pagamento usa ID de pendência/contrato corretos; botão de receita livre sem contrato não envia HTTP.
6. Sem autorização/CORS ou com recarga falha, UI mostra estado correto e não declara dados em tempo real fictícios.

**Testes planejados:** `tests/dashboard-api.test.ts`, regressões em `tests/dashboard.test.ts` e `tests/e2e/dashboard.spec.ts`; testes JPA/persistência/CORS protegidos após gates.
