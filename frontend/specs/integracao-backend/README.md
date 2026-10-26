# Specs de integração — EcoDog Park

**Data da análise:** 26/10/2026. **Entrega:** especificações para implementação; nenhuma integração nova foi ativada.

## Execução com contexto mínimo

Todos os caminhos `src/`, `tests/` e comandos são relativos a `frontend/`; backend fica em `../backend/`. **Entrada padrão: este README → SPEC-00 → somente a spec do módulo solicitado.** Ler SPEC-08 na validação/liberação. Não carregar todas as specs juntas.

- Os blocos por módulo indicam arquivos existentes, planejados e testes. Abrir somente os arquivos da etapa atual; buscar símbolos antes de ler arquivos extensos.
- Roadmap, `spec_integracao.md`, relatórios e protótipo são fontes de auditoria, **não pré-leituras obrigatórias**. Escopo, preservação, contratos e divergências estão reproduzidos aqui. Não abrir JSONs de telas, imagens ou `.pen` para implementar adaptadores. Consultar design apenas diante de dúvida visual concreta; `.pen` exclusivamente via Pencil.
- Não varrer backend inteiro nem carregar OpenAPI completo. Para divergência, consultar somente controller/DTO/service da operação indicada; localizar DTO pelo nome antes de ler. API offline permite preparação com testes controlados, não validação real.
- Gates são dependências externas ou decisões pendentes, não oportunidades de bypass. Preparar partes independentes e manter ativação bloqueada. Mudanças de backend, autenticação ou produto exigem autorização específica.
- Nulabilidade, entidade mínima ou enum não confirmados não devem ser presumidos. Consultar apenas schema/código necessário quando a etapa depender disso; registrar contrato confirmado na spec para evitar reinvestigação. Não inventar sucesso de contrato pendente.
- Verificar `git status --short` antes de editar e preservar alterações existentes. Se símbolos/contratos divergirem do snapshot de 26/10/2026, revalidar só a evidência afetada.
- Entregar arquivos alterados, comandos/resultados, gates atendidos/pendentes e status **preparado**, **conectado** ou **validado**. Preparado não significa liberado; build não prova persistência.

### Comandos confirmados

`npm test -- tests/<arquivo>.test.ts`: Vitest pontual. `npm run test:e2e -- tests/e2e/<arquivo>.spec.ts`: Playwright pontual. `npm test`: suíte unitária. `npm run build`: `tsc -b && vite build`. `npm run test:e2e`: suíte E2E. Playwright usa `http://localhost:5173`, inicia `npm run dev`, reutiliza servidor existente e tem dois workers. Não iniciar servidor duplicado nem encerrar servidor do usuário. Criar testes planejados antes de executar seus caminhos. Não executar `design:import`: integração não exige regenerar telas.

## Fontes e precedência

- Roadmap: [`../../roadmap-integracao-ecodogpark.md`](../../roadmap-integracao-ecodogpark.md), prioridades P0–P8.
- Escopo e preservação: [`../../spec_integracao.md`](../../spec_integracao.md).
- API consultada: [Swagger UI](http://localhost:8080/swagger-ui/index.html) e [OpenAPI JSON](http://localhost:8080/v3/api-docs). Documento OpenAPI **3.1.0**, API versão **1.0**, com **43 caminhos, 56 operações e 70 schemas** na consulta.
- Protótipos: `../../EcoDog.pen`, inspecionado pelas ferramentas do Pencil, incluindo versões desktop/mobile, formulários em etapas e painéis de estados. Design não alterado.
- Frontend: `src/screens/catalog.ts`, `ScreenPage.tsx`, `App.tsx`, modelos, hooks e proteções em `src/services/` e transformações em `src/design/`.
- Backend: controllers, DTOs, services e repositories em `backend/src/main/java/br/com/ecodogpark/backend/`, relativo à raiz do workspace.
- Relatórios anteriores: `INTEGRACAO.md`, `Correcoes-criticas-P0.md`, `Ajustes-transversais-integracao.md`, `Calendario-TL14-integracao.md` e `Dashboard-TL13-integracao.md`.

O Swagger confirma contratos publicados, **não comprova persistência, autorização ou funcionamento dos endpoints de negócio**. Quando o código local diverge do Swagger, esta spec registra ambos e exige alinhamento/teste, sem presumir qual versão está em execução. Lacunas listadas como propostas não são endpoints existentes.

## Ordem de execução e dependências

| Spec | Roadmap | Telas | Situação de ativação |
|---|---|---|---|
| [00 — Base, segurança e estados](00-base-seguranca-estados.md) | P0 | Todas | Preparar transporte; identidade operacional bloqueada |
| [01 — Catálogo público](01-catalogo-publico.md) | P1 | TL09 | Código já conectado; validar servidor/navegador |
| [02 — Calendário administrativo](02-calendario-administrativo.md) | P2 | TL14 | Parcial; leitura exige admin, escritas têm gates adicionais |
| [03 — Pets e saúde](03-pets-saude.md) | P3 | TL05/TL06 | Bloqueada por identidade, edição completa e catálogos |
| [04 — Agendamento e agenda](04-agendamento-agenda-tutor.md) | P4 | TL03/TL05/TL09 | Leituras públicas preparáveis; reserva bloqueada |
| [05 — Operação do monitor](05-monitor-presenca-feed-atividades.md) | P5 | TL10/TL11/TL12 | Bloqueada por identidade, presença e RF-042 |
| [06 — Diário](06-diario-pet.md) | P6 | TL07 | Bloqueada por autorização e semântica individual |
| [07 — Dashboard](07-dashboard-metas-movimentacoes.md) | P7 | TL13 | Parcial; agregados exigem adaptação do modelo |
| [08 — Validação e liberação](08-validacao-liberacao.md) | P0–P8 | Todas | Checklist obrigatório por módulo |

P0 é dependência de toda leitura pessoal, financeira ou administrativa e de toda escrita protegida. Pode-se desenvolver adaptadores com fixtures de teste antes dele, mas não liberar telas operacionais. Login/cadastro continuam fora do escopo: a equipe responsável deve fornecer a identidade e autorização como dependência externa, não como bypass nesta entrega.

## Matriz resumida por tela

| Tela/rota | Integração especificada | Limite |
|---|---|---|
| TL01 `/`, TL08 `/sobre` | Nenhuma API operacional necessária | Conteúdo institucional preservado |
| TL02 `/entrar`, TL04 `/cadastro` | Nenhuma nesta etapa | Login/cadastro fora do escopo |
| TL03 `/tutor/agendamento` | Serviços, disponibilidade, pets, orçamento, reserva | Sem planos; IDs reais e regras autoritativas |
| TL05 `/tutor/pets` | Lista de pets e agenda; exclusão; edição condicionada | Não integrar Meus Planos/Meus Dados |
| TL06 `/tutor/pets/novo` | Cadastro e saúde | Sem upload fictício nem saúde por nome |
| TL07 `/tutor/diario` | Diário por pet/data | Privacidade e participação individual |
| TL09 `/estrutura` | Catálogo público; disponibilidade apenas informativa | Fotos institucionais separadas da API |
| TL10 `/monitor/feed` | Dados do pet, participações, medicações, observações | Alimentação sem contrato independente confirmado |
| TL11 `/monitor/check-in` | Presença e transições por agendamento | Horários reais; não usar meia-noite como check-in |
| TL12 `/monitor/atividades` | Atividades/grupos do dia | Conclusão global ≠ participação individual |
| TL13 `/admin` | Indicadores, séries, metas e pendências | Contratos ≠ pets; atualização ≠ nova receita |
| TL14 `/admin/calendario` | Dias, vagas e programação | Sem escrita mensal/bloqueio/cancelamento admin confirmados |
| TL15 `/admin/usuarios`, TL16 `/admin/clientes`, TL17 `/admin/planos` | Nenhuma nesta etapa | Mesmo que exista CRUD de usuários no Swagger, P8 permanece fora do escopo |

EcoMigo aparece no protótipo, mas não pertence às entregas do roadmap. `/api/whatsapp/webhook` é integração externa, não contrato de chat web; não conectá-lo ao assistente visual nem enviar mensagens Twilio nesta etapa.

## Divergências novas ou revalidadas

1. `POST /calendario/agendamentos`: Swagger declara **200**; controller local retorna **201**. Plano apresenta a mesma divergência, mas continua excluído.
2. Séries do dashboard: Swagger exemplifica `2026-10`; `DashboardService` produz `outubro/2026`. Normalização explícita é necessária.
3. Agenda do tutor não informa `idAgendamento`; não sustenta cancelamento nem o `id` de reserva exigido pelo modelo atual.
4. `CalendarioDiaResponse.alunosAgendados` não informa serviço, horário ou nascimento. `CalendarBooking.service` é obrigatório: adaptador direto é insuficiente.
5. Check-in usa `dataEntrada` também como data agendada: criação grava `data.atStartOfDay()` e consulta devolve esse valor. Timestamp não nulo não prova entrada realizada.
6. Capacidade: reserva/disponibilidade usam padrão 10 em dia inexistente; calendário administrativo retorna zero e `idCalendario = null`. Creche/DayUse compartilham capacidade; modelo administrativo só tem Creche/Hotel.
7. Cadastro exige `observacao`, `relacaoComOutros`, veterinário, telefone, convênio e listas; edição substitui toda a saúde. Não preencher requisitos ausentes com textos inventados.
8. Feed permite sobrescrever participações/medicações no servidor, contrariando a proteção de histórico RF-042. Resposta de observação não tem ID/autoria/horário.
9. Dashboard não tem capacidade nem distribuição de pets; consultas de movimentações retornam apenas pendentes. Metas usam entidade aninhada e resposta de escrita não traz `idMeta`.
10. OpenAPI não publica `securitySchemes` nem requisitos `security`; não foi encontrado mecanismo de autorização nos trechos inspecionados. Isso é ausência de evidência de segurança, não permissão para acesso anônimo.

## Evidências visuais dos painéis

| Nós em `EcoDog.pen` | Uso nesta especificação |
|---|---|
| `YTBAv` — estados compartilhados | TL03, TL05, TL06, TL07, TL11: carregamento, vazio, falha, privacidade e confirmação |
| `SI6gX` — calendário | Consulta, acesso negado, gravação, confirmação mensal e remoção contextual |
| `p0fsx` — feed | Seleção ainda não salva, salvar bloqueado, retorno de sucesso/falha |
| `FNSk8` — atividades | Pendentes/concluídas, grupos, bloqueio durante registro |
| `b95AAL`, `MYay8`, `A1RSG` | Dashboard desktop/mobile e formulários de metas/receitas |
| `gQmGK`, `deq1Y`, `w2cXI`, `BGG1n` | Pets e telas mobile do monitor |

As copy dos estados são propostas visuais. Só usar “salvo”, “entrada registrada” ou “agendamento concluído” com evidência do servidor. Não manter nomes, valores ou datas ilustrativas em views reais.

## Definição de pronto

Cada spec só é concluída com contrato validado, gates atendidos, estados implementados, testes de adaptador/UI e evidência contra backend de desenvolvimento. Documentar restrições restantes; nunca declarar integração global concluída a partir de build ou Swagger acessível.
