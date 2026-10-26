# EcoDog Park — Plano de implementação · Fase 1

**Status:** análise dos quatro materiais obrigatórios realizada; nenhuma tela implementada ou alterada nesta fase. Próxima fase depende de autorização. Este plano orienta a revisão incremental do frontend já existente, não a recriação do projeto.

## 1. Inventário e fontes de verdade

Todos os caminhos abaixo são relativos à raiz real `C:\Users\Victor\Documents\Sptech\3ADS\PI\front-ecodog`.

| Material efetivamente consultado | Caminho real | Uso |
|---|---|---|
| Especificação completa | `EcoDogPark-especificacao-design-OpenCode.md` | Escopo, TL01–TL17, fluxo, estados, acessibilidade e hierarquia das fontes |
| Identidade visual completa | `EcoDogPark-Identidade-Visual.md` | Personalidade, funções das fontes e paleta original |
| Briefing original | `Briefing_Front-End - Completo.xlsx` | Leitura direta das células do XLSX, sem modificar a planilha; 57 RF, 18 RNF, 62 US, 3 personas e 17 telas |
| Protótipo original | `EcoDog.pen` | Pencil MCP: estrutura geral; detalhes dirigidos de telas, menus, formulários e estados; tokens por amostragem; screenshots de login mobile e cards de pets |
| Frontend e testes | `src/`, `scripts/import-design.mjs`, `tests/`, configurações e `package.json` | Rotas, renderização, estilos, dependências, contratos e validações existentes |

**Abas verificadas no briefing (11):** Instruções; Identificação do Projeto; Requisitos Funcionais; Requisitos Não Funcionais; User Stories; Persona; Paleta de Cores; Tom de Voz; Conteúdo das Páginas; Telas do Software; Prompt p IA. As duas abas de instruções são contexto, não novos requisitos do produto.

**Materiais auxiliares localizados, sem nova auditoria integral:** exportações HTML em `reference/{screens,forms,dialogs,extras}.html`, imagens de verificações anteriores em `reference/`, `briefing-data.json`, 52 imagens em `images/` e suas cópias em `public/images/`, 2.251 arquivos em `public/design-assets/`. Os JSON de `src/design/` foram inspecionados quanto a IDs e variantes. Esses artefatos derivados não substituem os originais. Não foi identificado arquivo ZIP na listagem da raiz; a ausência de um ZIP não impede a análise do `.pen` disponível.

**Precedência:** `.pen` para apresentação; briefing/especificação para escopo, permissões e regras. Registrar divergências, sem transformar exemplos visuais em regras de negócio. O MCP estava disponível; não houve 429, troca de modelo, exportação nova ou alteração do protótipo. A inspeção foi sequencial e limitada a estrutura e detalhes úteis ao plano, não uma auditoria visual completa de todos os nós.

## 2. Produto e fluxo ordenado

Aplicação web responsiva mobile-first para substituir fichas manuais de agendamento e reunir pets, reservas, cuidados e gestão. P01 Viviane: tutora, Android, segurança e autonomia para agendar/consultar diário; P02 Mariana: monitora, Android durante a rotina, consulta rápida e cuidados sem esquecimentos; P03 Sandra: proprietária, notebook, familiaridade iniciante, gestão clara de dados e indicadores.

### Inventário por ID, rota existente e frame confirmado

Os IDs de tela são os do briefing; os IDs de frame permitem consultas pontuais futuras. Grupos/rodapés externos devem ser preservados quando fizerem parte da composição.

| ID | Tela / acesso | Rota existente | Pencil desktop / mobile |
|---|---|---|---|
| TL01 | Início / público | `/` | `vvDGI` + rodapé `UJ5sG` (grupo `yvZir`) / `OflCN` |
| TL02 | Entrar / público | `/entrar` | `JSJFS` / `N3bLP` |
| TL03 | Agendamento / tutora | `/tutor/agendamento` | `S6MuSC` / `VOKeD` → `S0Y2Rq` → `n3UVlF` → `XUsQ0` |
| TL04 | Cadastro / público | `/cadastro` | `wgE1w` / `jbg8U` → `z7cWDi` → `Dr1OR` |
| TL05 | Meus Pets / tutora | `/tutor/pets` | `Stfn1` / `gQmGK` |
| TL06 | Cadastro e edição de pet / tutora | `/tutor/pets/novo` | cadastro `OkrI8`, edição `iqaXY` / sequências iniciadas em `D7LRW` e `U5wMSd` |
| TL07 | Diário do Pet / tutora | `/tutor/diario` | `mIedK` / `JRehE` |
| TL08 | Sobre / público | `/sobre` | `D8ObNp` + `P0hgU` (grupo `EJyfL`) / `fPdzK` |
| TL09 | Estrutura / público | `/estrutura` | `pxb8M` + `QOFeL` (grupo `uATVz`) / `RKtmG` |
| TL10 | Feed do Monitor / monitora | `/monitor/feed` | `t7oEDq` / `BGG1n` |
| TL11 | Check-in e check-out / monitora | `/monitor/check-in` | `c0vsjT` / `deq1Y` |
| TL12 | Atividades do dia / monitora | `/monitor/atividades` | `R7HSQE` / `w2cXI` |
| TL13 | Dashboard geral / administração | `/admin` | `b95AAL` / `MYay8`; metas/receitas desktop `A1RSG` |
| TL14 | Gerenciamento de calendário / administração | `/admin/calendario` | `PMvyJ` / `TWCnE` |
| TL15 | Gerenciamento de usuários / administração | `/admin/usuarios` | `Ajjm8` / `TuokS` |
| TL16 | Gerenciamento de clientes / administração | `/admin/clientes` | `k4NRI` / `C84JH` |
| TL17 | Gerenciamento de planos / administração | `/admin/planos` | `cLoVM` / `dDJNl` |

### Ordem navegável documentada (não confundir com ordem numérica)

- **Público:** TL01 → TL08/TL09, com retorno pelo menu; TL01 → TL02 ou TL04 → TL02.
- **Tutora:** TL02 → TL05 → TL06 (cadastro/edição) → TL05; TL05 → TL03 → TL05; TL05 → TL07 → TL05.
- **Monitora, briefing:** TL02 → TL10 → TL11 → TL12 → TL11; acesso TL10 → TL12 quando disponível pelo menu.
- **Administração:** TL02 → TL13 → TL14/TL15/TL16/TL17, com retorno e navegação administrativa.
- **Ordem visual do canvas:** público Home → Sobre → Estrutura → Entrar/Cadastrar; tutora Meus Pets → Cadastro/Edição → Agendamento → Diário; monitora Check-in/out → Atividades → Feed. Essa última ordem difere do ponto de entrada pós-login do briefing; não mudar o login silenciosamente.

O `.pen` tem grupos de apoio, administração complementar, mobile, alta fidelidade, EcoMigo, formulários em etapas e alergias. Não são novas páginas TL. Não foram encontrados `href` ou metadados de interação; o painel de menus diz explicitamente que o clique ainda deve ser configurado na prototipagem. Relações funcionais vêm do briefing, não de ligações interativas inexistentes.

**Etapas mobile confirmadas em `HdBJh`:** pet cadastrar/editar 6 (identificação → jeitinho/cuidados → vacinas → alergias → remédio → revisão); agendamento 4 (serviço → data → pets → revisão); cadastro 3 (dados/contato → segurança → revisão); usuário criar/editar 4; metas 2; receitas 3; vínculo de plano 4; plano criar/editar 3. São estados de uma tarefa, não rotas novas. As versões “atual” de metas/receitas existem e já são referenciadas pelo importador.

## 3. Rastreabilidade e componentes compartilhados

Na tabela, intervalos RF/US incluem todos os IDs intermediários. US foram derivadas das associações da própria planilha, incluindo campos com mais de um RF. Uma associação não concede acesso: por exemplo, TL07 apenas consulta registros criados pela monitora.

| Tela | RF explicitamente associados | US associadas | Composição / reutilização |
|---|---|---|---|
| TL01 | RF-001–003 | US01–03 | Cabeçalho público, hero, seções de serviços/estrutura, carrosséis, rodapé |
| TL02 | RF-003–005 | US03–07 | Cabeçalho, painel de acesso, campos e feedback |
| TL03 | RF-014–018, RF-023–025 | US17–22, US27–30 | Seleção de serviço, calendário, seleção de pets, resumo, confirmação |
| TL04 | RF-003, RF-006 | US03, US08 | Painel de cadastro, campos, revisão mobile |
| TL05 | RF-005, RF-007–008, RF-011, RF-013, RF-021–023 | US06–07, US09–11, US14, US16, US25–27 | Cabeçalho autenticado, cards de pets, plano contratado, confirmação de exclusão |
| TL06 | RF-007–012, RF-023 | US09–15, US27 | Formulário de pet, foto, grupos de cuidado/vacinas/medicamentos, alergias |
| TL07 | RF-019–021, RF-034–043 | US23–25, US38–48 | Data/resumo, atividades, medicações e observações somente para consulta |
| TL08/TL09 | Sem vínculo explícito na coluna de telas | Sem vínculo explícito | Cabeçalho/rodapé públicos, imagem e seções institucionais; RF-002 dá suporte à navegação, não é associação explícita destas linhas |
| TL10 | RF-005, RF-009–010, RF-013, RF-030, RF-032–044 | US06–07, US12–13, US16, US34, US36–49 | Identificação/cuidados, alimentação, atividades, medicações e observações |
| TL11 | RF-026–028 | US31–33 | Resumo de presença, cards, horários, check-in/out e acesso às atividades |
| TL12 | RF-029–033, RF-035, RF-044 | US34–37, US39, US49 | Lista/grupos de atividades, detalhes, pendentes/concluídas, duração e conclusão |
| TL13 | Sem vínculo explícito; correspondência semântica a validar: RF-045, RF-046, RF-057 | Candidatas US50–51, US62 | Indicadores, gráficos, distribuição, movimentações; metas e receitas |
| TL14 | Sem vínculo explícito; RF-045 como candidato geral | Candidata US50 | Calendário, configuração de dia, atividades e pets agendados |
| TL15 | Sem vínculo explícito; correspondência semântica a validar: RF-045, RF-056 | Candidatas US50, US61 | Tabela, busca/ações, criar/editar usuário, confirmar mudança de status |
| TL16 | RF-047–050 | US52–55 | Busca por tutor, tabela de vínculos, formulário de vinculação/edição, status |
| TL17 | RF-051–055 | US56–60 | Tabela de planos, criar/editar, status e confirmação de exclusão |

**Correção de rastreabilidade, sem alterar originais:** US34 se relaciona a RF-029 **e** RF-030, portanto aparece em TL10 e TL12; a especificação não a incluiu nessas listas. RF-045/046/056/057 dizem “Não há tela administrativa correspondente documentada”, embora as telas administrativas existam na aba de telas e no `.pen`; manter os vínculos acima como candidatos, não como requisito novo aprovado.

**Componentes já existentes a reutilizar:** `DesignRenderer`, `Field`, `Menu`, `Modal`. Botões, painéis/cards, cabeçalhos/rodapés, calendário, tabelas, indicadores e feedback estão representados no renderer/JSON/CSS; verificar equivalência antes de extrair qualquer componente novo. O Pencil não tem componentes marcados como reutilizáveis nem variáveis globais; a repetição visual não equivale a um design system conectado.

**Estados acessados:** painel geral `wq7bj`; menus aberto/recolhido por perfil `lEj4o` e público `CRLDr`; atividades `u4uCH`; feed `YvBDb`; calendário `z4Hrp`; usuários/formulários `For38`; alergias `s1hlt`; confirmação `XZ0g4`/`X5ZhWJ`; meta inicial/carregada `qR2Lm`/`YszXA`. Há padrões de loading, vazio, erro, foco, hover, disabled e confirmação; presença aguardando/em permanência/saída; atividade pendente/concluída; campos inválidos e falha sem declarar sucesso. Parte dos textos é rotulada como proposta ou exemplo estático, não copy operacional aprovada.

### Regras funcionais que não podem se perder

- Tutora só acessa/edita seus pets, planos e diários; monitora acessa os dados necessários; administração exige autorização. Guardas de rota não substituem autorização no servidor.
- Uma seleção de agendamento pode conter vários pets (RF-015), mas cada reserva deve estar vinculada a um único cão (RF-007/016). Confirmar a transação/API, sem reduzir a seleção a um pet.
- Disponibilidade/capacidade são configuradas pela equipe; não reservar dias/horários indisponíveis, lotados ou conflitantes, inclusive hotel versus creche para o mesmo pet. Preço vem dos dados, não dos exemplos.
- RF-018 limita alteração a 24 horas antes; o critério de aceitação fala em **mais de** 24 horas. Cancelamento segue a política EcoDog, ainda sem detalhamento.
- Somente a equipe registra entrada/saída; registros operacionais protegidos não são editáveis/excluíveis depois de salvos e devem manter autoria. O diário da tutora é leitura.
- Dados de saúde/orientações são informados pelo responsável e aceitos pela equipe; o software não diagnostica, prescreve nem administra medicamentos automaticamente.
- Resultado das ações reflete sucesso/falha reais. Excluir plano exige confirmação e preservação dos vínculos que seriam comprometidos; editar/ativar/desativar afeta somente o registro selecionado.
- Dashboard é resumo administrativo, não contabilidade completa. EcoMigo é elemento complementar visual, sem contrato funcional de assistente aprovado.

**RNF preservados:** RNF-001–003 usabilidade/consulta rápida/hierarquia; RNF-004–006 identidade/fontes/responsividade; RNF-007–009 autorização/privacidade/autoria; RNF-010–011 integridade/persistência; RNF-012 otimização de recursos; RNF-013–014 consistência/disponibilidade; RNF-015 manutenção; RNF-016–018 erros claros/legibilidade/status não comunicado só por cor.

## 4. Tokens e regras visuais globais

**Direção:** divertida, amigável, energética e colorida; manter textura de patinhas/ossinhos, imagens reais, marca, contornos, hierarquia e ordem das seções. Não redesenhar para uniformizar variantes diferentes.

| Papel | Identidade visual | Briefing/especificação | Observado no `.pen` |
|---|---|---|---|
| Fundo suave | `#ADD9CC` | `#ADD9CC` | `#ADD9CC` |
| Verde estrutural | `#247346` | `#1F653D` | `#247346` nos cabeçalhos/títulos; `#1F653D` na amostra de paleta |
| Turquesa de apoio | `#45937F` | `#3C816F` | amostra de paleta `#3C816F` |
| Verde positivo | `#67B344` | `#49812F` | amostra de paleta `#49812F` |
| Atenção | `#DE8F3B` | `#CB8335` | amostra de paleta `#CB8335` |
| Laranja vivo/ênfase | `#F25835` | `#CD492B` | `#F25835` na marca/paleta; não converter toda ênfase em erro |
| Superfície/texto | — | `#FEFEFE` / `#000000` | mesmos neutros; também `#182D21`, `#364D40`, `#EEF7F2`, `#A73320` em variantes consultadas |

Os nomes das amostras de paleta do `.pen` nem sempre correspondem ao HEX do preenchimento. Usar o preenchimento real do frame; distinguir cor de marca, cor de texto acessível e estado semântico. Não substituir todas as cores por uma única versão do verde. HEX/RGB de algumas linhas da planilha também divergem.

**Tipografia base (desktop → mobile):** Luckiest Guy H1 40→32 e H2 32→26; Lilita One H3 24→22, H4 20→18, card 18→16, botão 16 e label 14; Roboto corpo 16 e auxiliar 14. O `.pen` confirma as três famílias, com exceções locais como marca 26/28 no mobile. Inter 700/32/1.2 aparece apenas na tabela alternativa da planilha e conflita com RNF-005. Preservar fontes do frame/identidade. `lineHeight` não é global: amostra de usuários usa aproximadamente 1.2, 1.18 e 1.45; não aplicar esses valores a todas as telas.

**Medidas observadas, não breakpoints aprovados:** desktop 1440 px e mobile 410 px. Cabeçalho atual 88/80 px; gatilhos/menu/perfil 44 px; botões usuais 48 px; contêineres de tutor/monitor com padding 40×80 e conteúdo 1280 px; gaps recorrentes 12/16/20/24/28/32; painéis padding 28; mobile em coluna. Administração complementar usa padding 32, gap 24 e menu lateral aproximadamente 188–208 px. Cabeçalho isolado antigo do apoio mede 72 px: não utilizá-lo indiscriminadamente no lugar do frame atual.

**Raios/sombras amostrados:** controles 8/10 px; grupos 16 px; painéis 24 px; círculos 100. Sombras de painel `0 5px 14px #17472A14` e `#17472A26`; marca com sombra dura `2px 3px #000`. São variantes observadas, não escala universal. Preservar contornos e textura sem rasterizar toda a interface.

**Navegação visual:** menu branco recolhido por padrão; aberto horizontal no desktop e vertical no mobile; item atual por preenchimento/contorno. Algumas telas administrativas usam menu lateral próprio. O painel de menus contém “Meus Dados”, “Check-in / out”, “Atividades”, “Calendário”, “Usuários”; não comprova sozinho todos os destinos previstos no briefing.

**Acessibilidade:** WCAG 2.1 AA como critério: contraste normal ≥4,5:1/grande ≥3:1, toque ≥44×44, foco/teclado, labels persistentes, erros textuais/anunciados, texto alternativo e gráficos com equivalentes textuais. A planilha marca 3,75:1 como aprovado para o fundo suave, o que não aprova texto normal nesse par; recalcular cada combinação real. Resolver conflitos com a alteração acessível menos invasiva, registrada por tela.

## 5. Frontend atual e áreas prováveis de alteração

**Stack real:** React/React DOM 19.2, React Router 7.9, Vite 7.1, TypeScript 5.9 strict, Tailwind 4.1 com plugin Vite, parse5 para importação, Vitest 5 e Playwright 1.56. Sem biblioteca de gráficos/formulários ou adaptador HTTP concreto nas dependências atuais. Convenções: funções React, hooks/contexto, imports relativos, aspas simples, interfaces TypeScript, conteúdo/estilos extraídos por ID do Pencil. Não trocar TypeScript por JavaScript só porque o briefing cita JavaScript.

| Arquivo/área existente | Papel e revisão provável |
|---|---|
| `src/main.tsx`, `src/App.tsx` | StrictMode, BrowserRouter, sessão injetável, guardas por perfil; revisar lifecycle de sessão/saída e permissões com contrato real |
| `src/screens/catalog.ts` | 17 rotas TL e menus por perfil; manter paths, revisar destinos/ordem e contexto do pet/registro selecionado |
| `src/screens/ScreenPage.tsx` | Carrega JSON sob demanda; concentra campos, etapas, calendário, ações e modais; revisar por fluxo pequeno, sem substituição integral |
| `src/components/DesignRenderer.tsx` | Traduz nomes/textos dos nós em controles/semântica; reutilizar, mas retirar inferências de regras baseadas em cor/copy onde o contrato for confirmado |
| `src/components/Field.tsx` | Inputs/selects e obrigatoriedade inferidos por rótulo; auditar campos obrigatórios, formatos e opções reais |
| `src/components/Menu.tsx`, `src/components/Modal.tsx` | Navegação e dialog nativo com retorno de foco; comparar menu desktop/mobile e ações contextuais |
| `src/services/api.ts` | Interface `EcoDogApi`; padrão `unavailableApi` sem login/persistência. Evoluir contrato antes de ligar leituras/escritas |
| `src/design/*.json`, `src/design/types.ts`, `src/design/sources.css` | 17 telas e 13 pares de estados/formulários; IDs, árvores, classes e etapas; alterar derivados somente para divergência confirmada |
| `src/styles.css`, `index.html` | Tokens, overrides, responsividade e fontes Google; revisão global mínima e teste de impacto |
| `scripts/import-design.mjs`, `reference/*.html` | Pipeline existente de HTML exportado para JSON/assets; não executar importação ampla agora, pois reescreve derivados e copia imagens |
| `src/briefing-gaps.ts`, `tests/design.test.ts`, `tests/e2e/screens.spec.ts` | Lacunas anteriores e verificações; atualizar rastreabilidade/testes apenas na fase autorizada |

**Diferenças concretas encontradas no código (não corrigidas nesta fase):**

- A largura ≤1439 px seleciona variante mobile, limitada a 600 px; portanto 1024 px não usa composição desktop. Esse limite é uma decisão anterior do código, não breakpoint dos materiais. O override CSS para `.design-desktop` entre 1024–1439 não acompanha a seleção atual.
- `Menu` fica vertical também no desktop, enquanto o painel `.pen` orienta menu horizontal aberto; menu da tutora não inclui “Meus Dados”. Não substituir menus administrativos laterais por essa variante.
- Calendário detecta indisponibilidade pela classe/cor e altera o título do mês sem reconstruir uma agenda por data completa. Serviço, dia e pets já começam selecionados com valores ilustrativos; seleção individual e resumo/preço precisam ser auditados.
- Dados/listas e opções vêm dos frames ou constantes; a API só tem sessão/login/logout e `execute`, sem contrato de leitura de pets/reservas/diário/indicadores. `target` é ID visual, não ID de entidade confirmado. Data/seleção do pet não é transportada nas rotas do diário; edição usa modal atual, a conferir contra a variante de tela documentada.
- Validação de obrigatoriedade é heurística por nome do campo; ações dependem de rótulos. Existem confirmações e textos genéricos, detalhes/perfil pendentes e EcoMigo sem integração; não tratá-los como copy aprovada ou funcionalidades prontas.
- `goals.json` existe, mas o carregamento da página é por TL13; confirmar acesso à composição metas/receitas. `loadedGoal.json` tem zero etapas, apesar de as revisões mobile de metas existirem.

**Baseline executada sem build/importação:** `npm test` passou (5 testes); `npx tsc --noEmit --incremental false` passou. Playwright, build Vite, servidor/browser e comparação do frontend atual com todos os frames não foram executados nesta fase. Testes existentes verificam presença/IDs, perfis e alguns fluxos, mas não comprovam fidelidade visual, persistência ou cobertura de todos os requisitos.

## 6. Sequência recomendada — pequenas entregas autorizadas

Cada item deve terminar com comparação do frame e testes correspondentes antes de avançar. Não implementar todos os itens de uma vez.

1. **Resolver decisões bloqueantes e preparar base mínima:** confirmar copy/CTA e política de fluxo; registrar matriz de variantes/estados e contrato esperado. Ajustar somente tokens/controles/menus já existentes cuja divergência estiver confirmada. Escolher TL02 como piloto visual de base (desktop 1440/mobile 410), sem inventar login funcional. Aceite: fontes, painel, campos, foco e menu conferidos.
2. **Público, uma tela por vez:** TL01 → TL08 → TL09; depois TL04 → TL02. Conteúdo/CTA aprovados, rodapés/carrosséis, três etapas de cadastro; testes de destinos e validação documentada.
3. **Tutora:** TL05; TL06 cadastro e depois edição (seis etapas, alergias/vacinas/medicamentos); TL03 (quatro etapas, resumo/retorno); TL07 leitura. Ligar dados reais somente com contrato de propriedade, preços, disponibilidade e resultados. Testar salvar/cancelar/falhar sem perder campos.
4. **Monitora:** manter ponto de entrada confirmado; entregar TL11, TL12 e TL10 individualmente, compartilhando identificação do pet e estados. Testar entrada→presença→saída, pendente→concluída, autoria e imutabilidade; validar ligação das informações com TL07.
5. **Administração:** TL13 dashboard, metas e receitas em incrementos separados; TL14 calendário; TL15 usuários; TL16 vínculos; TL17 planos. Validar status/edição/exclusão por entidade e não apenas pelo nó visual.
6. **Revisão transversal:** larguras intermediárias, contraste/teclado/leitor de tela, recursos/imagens, falhas de rede, permissões e regressões. Não adicionar funcionalidades de assistente ou páginas fora de TL01–TL17.

## 7. Estratégia de validação

- **Visual:** comparar tela/estado com frame correspondente em 1440 e 410 px; esperar fontes e imagens. Screenshots por seção e tela sem barras de prévia misturadas à referência, verificando ordem, copy, imagens, alinhamento, padding/gap, raio, sombra e menu. Registrar tolerâncias de rasterização; não atualizar referência automaticamente para aceitar divergências. Incluir modais/etapas e diferenças locais, não só a tela inicial.
- **Responsiva:** reaproveitar Playwright em 320/410/1024/1440; acrescentar largura tablet e teste junto ao breakpoint que vier a ser aprovado. Verificar ausência de overflow e, também, ausência de dados/ações escondidos, zoom/reflow e tabelas legíveis por item.
- **Funcional:** testes por RF/US com adaptador de teste explícito, separado de produção: sessão/perfis, acesso direto indevido, propriedade de pets, cadastros/etapas, agendamento multipet/capacidade/conflitos/limite 24h, cancelamento, diário somente leitura, autoria e exclusão protegida. Exercitar loading/vazio/erro/sucesso e impedir envio repetido; não usar o protótipo como resposta de servidor.
- **Técnica:** Vitest e TypeScript a cada incremento; `npm run build` e Playwright em fase autorizada; verificar console, lazy loading, IDs TL/frame, integridade de assets e impacto de overrides globais. Build/importação reescrevem derivados: revisar escopo antes de executar. Não há script de lint atualmente; não adicionar ferramentas/dependências sem necessidade.
- **Acessibilidade:** teclado e retorno/contenção de foco em modal; foco do menu e estado expandido; calendário operável, labels/erros, status anunciado; contraste medido; nomes de imagens, semântica de tabelas e valores textuais dos gráficos; toque 44 px e zoom. Auditoria manual de leitor de tela necessária; não declarar certificação pelo resultado dos testes atuais.
- **RNF:** mapear os testes aos RNF-001–018; avaliar desempenho de imagens/recursos sem impor metas numéricas inexistentes no briefing. Segurança, autoria, persistência e integridade precisam também de validação do backend.

## 8. Decisões pendentes e alcance dos bloqueios

1. **Copy TL01 e CTA público:** a única copy final da aba Conteúdo é odontológica e cita recepção de clínica. O `.pen` contém copy EcoDog real (“Oi Aumigo, Conhece a EcoDog Park?”) e CTA “Agendar visita”; confirmar adoção dessa copy e se o CTA é visita ou o agendamento restrito TL03. Bloqueia publicação do conteúdo/ação divergentes, não a revisão visual dos campos de TL02. Textos de estados propostos também precisam de aceite antes de publicação.
2. **Fluxo da monitora e navegação complementar:** confirmar entrada TL10 do briefing versus ordem TL11→TL12→TL10 do canvas; “Meus Dados” e EcoMigo existem visualmente, mas não têm tela TL/contrato de negócio correspondente. Preservar acesso aos destinos exigidos, sem inventar nova página ou serviço.
3. **Contratos operacionais:** não foram localizados neste frontend contrato de backend, API de leitura, credenciais ou persistência. Definir entidades/IDs, ownership/permissões, consultas e payloads, reserva por cão versus envio multipet, cálculo de preço, data/período/capacidade, política de cancelamento e limite exato de 24h. Bloqueia funcionamento real, não prototipagem visual claramente identificada.
4. **Validações e ações administrativas:** confirmar campos obrigatórios/formatos/opções, política completa de exclusão de pets/planos e regras dos controles de calendário/metas/receitas. Já há exigência de confirmação e preservação de vínculos para planos; não alegar que a regra está inteiramente ausente. Vínculos RF-045/046/056/057 às telas precisam de aprovação de rastreabilidade.
5. **Visual responsivo/acessível:** cores divergentes ficam registradas e a precedência do `.pen` resolve apresentação por frame; não é necessário bloquear toda a implementação por uma paleta global. Faltam breakpoint/gutters intermediários aprovados e algumas alturas de linha/estados finais. Validar adaptação sem copiar overflow do canvas nem presumir que 1440 px é o breakpoint definitivo.

**Lacunas antigas resolvidas nesta análise:** `.pen` efetivamente disponível; TL05 e TL07 localizadas; versões mobile, menu aberto/recolhido, raios, sombras, estados e formulários encontrados. Não repetir as alegações antigas de ausência desses materiais. Detalhes não auditados integralmente serão consultados por ID apenas quando a respectiva tela for autorizada.

**Primeira entrega recomendada:** base compartilhada mínima validada em TL02, após autorização e aceite das decisões aplicáveis. Nenhuma implementação, reimportação ou alteração dos documentos/planilha/protótipo foi feita nesta fase; somente este documento de planejamento foi criado.
