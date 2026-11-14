# Relatório de execução da SPEC frontend

## Conteúdo oficial do footer — 03/11/2026

O usuário confirmou e autorizou o iframe do Google Maps e a URL oficial de Instagram. **FOO-01 e FOO-03 concluídos; status atual: 16 concluídos, 8 parciais e 1 bloqueado.** Os registros abaixo descrevem execuções anteriores e suas dependências à época.

Mapa incorporado com o `src` exato fornecido, dimensões base 600×450, CSS responsivo 4:3, borda zero, fullscreen, lazy loading, título acessível e `strict-origin-when-cross-origin`. Instagram configurado com a URL exata fornecida; o texto @ecodogpark e o link Instagram usam nova aba segura. Preservadas colunas, cores e fontes do footer. O WhatsApp continua sem número oficial configurado.

Arquivos: `src/models/frontend-config.js`, `src/views/components/InstitutionalLinks.jsx`, `src/views/components/DesignRenderer.jsx`, `src/styles.css`, `.env.example`, testes E2E e SPEC. Validação: **176 testes unitários, 10 E2E e build aprovados** (avisos preexistentes de assets e tamanho do bundle). E2E verifica URL/atributos e presença do iframe, não disponibilidade do serviço externo Google Maps.

## Correção de identidade visual — 03/11/2026

Atendendo à revisão do usuário, restaurada a composição de TL04 no cadastro: cabeçalho verde com marca e menu, fundo com textura original, foto `image-import-26.jpg`, card branco arredondado, títulos Luckiest Guy, labels/botões Lilita One e campos no padrão existente. As duas etapas, validações, payload e indisponibilidade de endereço foram preservados.

No footer de Início/Sobre/Estrutura, removida a substituição genérica: o renderer volta a usar os nós originais de logo, Localização, Contatos e Nossas Redes, com ícones, fundo verde escuro, títulos laranja e conteúdo legível em desktop/mobile. Links configuráveis são acrescentados às respectivas colunas; logo usa imagem proporcional no mesmo espaço do layout original.

Arquivos: `src/views/screens/AccountPages.jsx`, `src/views/components/DesignRenderer.jsx`, `src/views/components/InstitutionalLinks.jsx`, `src/styles.css`, `tests/e2e/frontend-corrections.spec.js` e regra explícita de preservação visual na SPEC. Conferidas capturas de tela do cadastro desktop e footers desktop/mobile. Testes de navegador agora verificam fontes/cores/card/foto do cadastro e títulos/conteúdo/logo do footer, sem pressupor que a logo seja a única imagem (os ícones originais foram restaurados).

## Continuação — 03/11/2026

Revisados a SPEC atual, o estado local do repositório e, somente para leitura, os controladores de usuários/pets/dashboard, DTOs de cadastro/listagem e a consulta de metas. Os bloqueios anteriormente registrados permanecem: endereço não aceito no cadastro, recuperação sem endpoint, saúde sem consulta integral/catálogos, metas com consulta por data exata e distribuição baseada em contratos. Nenhum contato oficial foi introduzido e nenhum arquivo de backend ou design `.pen` foi editado.

**Status dos 25 IDs permanece: 14 concluídos, 10 parciais e ADM-03 bloqueado (entrega de distribuição de pets não iniciada).** A matriz abaixo continua sendo a referência por ID, arquivos e dependências.

| Complemento | Arquivos alterados nesta continuação | Resultado |
|---|---|---|
| MON-03 | `src/api/http.js`, `tests/http.test.js`, `tests/e2e/frontend-corrections.spec.js` | Timeout ECONNABORTED/ETIMEDOUT informa que não foi possível confirmar a operação e orienta conferir dados antes de tentar novamente. Não há retry automático. Testes cobrem ambos os códigos, preservação de cancelamento e, no navegador, envio pendente/duplo clique/falha de rede com notas preservadas. |
| PET-02/04 | `src/views/components/PetHealthSection.jsx`, `tests/frontend-corrections.test.js` | Labels visíveis associados por `htmlFor` aos controles de detalhes e cards; removido aninhamento inválido de labels, preservando campos e remoção local. Catálogos e edição real continuam pendentes. |
| Documentação | `Spec_Correcoes_Frontend_EcoDog.md`, este relatório | Status e evidências atualizados, sem declarar integrações ausentes como concluídas. |

Validação nesta continuação:

- `npm test`: **176 aprovados em 32 arquivos**.
- `npm run build`: **aprovado**, mantendo avisos de referências de imagens em runtime e chunk principal acima de 500 kB.
- `npm run test:e2e -- tests/e2e/frontend-corrections.spec.js`: **10 aprovados**. A primeira execução teve 1 falha no novo teste porque a asserção exigia um elemento de status que corretamente não existia durante o envio; corrigida para verificar ausência de status de sucesso, e a suíte foi reexecutada integralmente.
- E2E usa API controlada, não servidor real. Os códigos de timeout Axios são simulados nos testes unitários; o E2E interrompe a requisição pendente e não valida o transcurso real dos 20 segundos. Toda a suíte E2E legada permanece fora desta execução, pelos impedimentos de rotas já descritos abaixo.

As alterações locais anteriores foram preservadas. Para completar as integrações, ainda são necessários os contratos/dados de backend e as decisões/configurações oficiais listadas ao final deste relatório.

## Resultado e escopo

Correções realizadas e alterações locais anteriores revisadas, exclusivamente em `frontend/`. Backend consultado somente para confirmar contratos. Nenhuma mudança em autorização, banco, aprovação de reservas ou contratos de API. O arquivo `EcoDog.pen`, já modificado no início, não foi editado nesta execução.

**Os itens parciais/bloqueados abaixo não devem ser considerados integrações completas.** Os controles dependentes de dados ausentes têm mensagens verdadeiras ou bloqueio; não há confirmação fictícia de persistência.

## Evidências

| Comando executado em frontend | Resultado final |
|---|---|
| `npm test` | **173 testes aprovados em 32 arquivos** |
| `npm run test:e2e -- tests/e2e/frontend-corrections.spec.js` | **9 testes aprovados** |
| `npm run build` | **Aprovado** |
| `git diff --check` | Sem erros de whitespace; avisos de conversão LF/CRLF |

O build ainda avisa sobre referências CSS `images/image-import-*` resolvidas em runtime e chunk principal acima de 500 kB. A logo do footer foi conferida como asset existente e carregou nos testes de navegador.

Os E2E usam respostas controladas da API, não um backend ativo. Cobrem cadastro desktop/mobile, recuperação indisponível, proteção/perfil/logout, exclusão de pet com erro e sucesso, agendamento vazio/limite mensal, gravação real do ponto de vista da integração HTTP do diário e footer/EcoMigo desktop/mobile. Não foi executada toda a suíte E2E legada: vários testes existentes dependem de `/prototipo/*` e de layouts antigos; essas rotas já não estavam configuradas no `App.jsx` encontrado. Testes de timeout HTTP específico e persistência em servidor real não foram executados.

Na primeira execução havia 18 falhas unitárias. Foram corrigidos mocks incompatíveis com o adaptador HTTP atual, configuração JSX do Vitest, caminho de inventário de designs e expectativas antigas de disponibilidade sintética/copy/descarte de saúde. Os E2E novos também detectaram e permitiram corrigir erro de renderização por categoria de serviço vazia, ausência de link de recuperação no login mobile e ausência do footer institucional novo no mobile.

## Matriz por ID

Os caminhos abaixo são relativos a `frontend/src/`, exceto testes e `.env.example`. **U** = `tests/frontend-corrections.test.js`; **E** = `tests/e2e/frontend-corrections.spec.js`. Testes adicionais já existentes foram executados pelo `npm test`.

| ID | Status | Arquivos principais | Validação | Dependência/resultado |
|---|---|---|---|---|
| GLO-01 | CONCLUÍDO | `views/design/copy-corrections.js`, `views/screens/ScreenPage.jsx` | U; inventário de textos dos JSON | Correção exata das quatro strings com hífen isolado; preserva datas, URLs, números negativos e dados da API. |
| AUT-01 | PARCIAL | `App.jsx`, `views/screens/AccountPages.jsx` | E desktop/mobile; `tests/auth.test.js` | Etapas, voltar, validação, uma submissão e preservação após erro. `UsuarioRequest` **não recebe endereço**; etapa 2 explica a indisponibilidade, sem coletar/enviar campos arbitrários. |
| AUT-02 | PARCIAL | `App.jsx`, `views/screens/AccountPages.jsx`, `views/screens/ScreenPage.jsx` | E | Rota pública, link de login, validação e retorno. Não existe endpoint de recuperação nos controladores consultados; nenhum e-mail é simulado. |
| AUT-03 | CONCLUÍDO | `models/current-user.js`, `views/screens/AccountPages.jsx`, `views/components/DesignRenderer.jsx` | U, E; `tests/current-user.test.js` | Consulta ID/perfil da sessão por GET autenticado; nome/e-mail/telefone reais. CPF/endereço ausentes em `UsuarioResponse`; somente leitura. Expiração de token e 401 encerram sessão. PUT exige CPF/senha não retornados: edição segura indisponível. |
| PET-01 | PARCIAL | `views/components/PetField.jsx`, `models/pet-registration.js` | U; `tests/pet-registration.test.js` | Criação usa Sim/Não e booleano explícito; ausência bloqueada porque DTO exige `@NotNull`. Edição bloqueada pela resposta incompleta. |
| PET-02 | PARCIAL | `views/components/PetHealthSection.jsx`, `views/components/DesignRenderer.jsx` | U para as três seções | Seletor, adicionar e cards uniformes; datas/validade/dosagem/frequência preservadas. Catálogos reais de saúde indisponíveis no backend encontrado; controles indisponíveis no modo real. |
| PET-03 | CONCLUÍDO | `views/components/PetHealthSection.jsx` | U para as três seções | Seleção inicial vazia; adicionar desabilitado sem opção válida; filtra duplicados e limpa seleção/detalhes após inclusão. |
| PET-04 | PARCIAL | `views/components/PetHealthSection.jsx`, `views/screens/ScreenPage.jsx`, `models/pet-registration.js` | U; `tests/pet-registration.test.js`, `tests/pet-draft.test.js` | Remoção apenas local; não envia saúde preenchida como listas vazias. GET de pets não retorna saúde integral e PUT substitui listas: edição persistente bloqueada para evitar apagamento. |
| PET-05 | CONCLUÍDO | `api/pets-api.js`, `views/components/TutorPets.jsx` | U, E | DELETE real `/pets/{idTutor}/{idPet}`, token, nome no modal, loading, trava de duplo clique, erro preserva card e sucesso recarrega lista. Seleção de agendamento é carregada novamente ao entrar na rota. |
| AGE-01 | CONCLUÍDO | `views/screens/ScreenPage.jsx`, `views/components/DesignRenderer.jsx` | U, E; `tests/booking-draft.test.js` | Serviço/pets/datas vazios no acesso direto; rascunho expresso preservado; nenhuma consulta de categoria/disponibilidade/orçamento sem entradas válidas. |
| AGE-02 | CONCLUÍDO | `views/design/calendar.js`, `views/screens/ScreenPage.jsx`, `views/components/DesignRenderer.jsx` | U virada do ano, E limite da seta | Limite deriva do mês/ano atual, não de offset mínimo fixo. O offset legado permanece apenas como coordenada dos designs. Datas passadas bloqueadas na seleção, orçamento e envio. |
| CAL-01 | CONCLUÍDO | `views/design/management-calendar.js`, `views/components/ManagementCalendar.jsx` | U; `tests/calendar.test.js` | Bloco específico removido; capacidades e demais operações preservadas. |
| MON-01 | CONCLUÍDO | `api/daily-activities-api.js`, `views/design/daily-activities.js` | U; `tests/daily-activities.test.js` | Grupos reais ordenados, grupo ausente como “Sem grupo”; minutos calculados de `horaInicio`/`horaFim`, inclusive virada do dia; horário inválido/ausente não inventa duração. |
| MON-02 | CONCLUÍDO | `views/screens/catalog.js`, `views/screens/ScreenPage.jsx` | U; testes de integração do diário | Nome exibido “Diário do Pet”; rota antiga `/monitor/feed` mantida. |
| MON-03 | CONCLUÍDO | `views/screens/ScreenPage.jsx`, `api/http.js` | U, E; `tests/monitor-feed-integration.test.js` | Status visível/aria-live somente após resposta positiva; erro preserva notas e permite tentar novamente. Timeout HTTP configurado em 20 s; prévia não afirma gravação em servidor. |
| MON-04 | CONCLUÍDO | `views/screens/catalog.js`, `views/screens/ScreenPage.jsx` | U, E | TL10 retirado do menu principal; acesso contextual do check-in e rota preservados. |
| ADM-01 | PARCIAL | `views/components/DashboardField.jsx`, `models/goal-reference.js`, `viewmodels/use-dashboard.js` | U virada do ano | Editor mostra mês/ano, sem dia. API exige `LocalDate` exata e repository compara igualdade; só reutiliza dia de meta real já retornada. Sem referência disponível não consulta/salva. Falta convenção mensal aprovada ou consulta por mês. |
| ADM-02 | PARCIAL | `views/components/DashboardField.jsx`, `viewmodels/use-dashboard.js` | U | Exibe referências de metas reais filtradas pelo serviço; troca de serviço invalida referência incompatível. Sem datas retornadas não inventa período. Equipe deve esclarecer “datas correspondentes”. |
| ADM-03 | BLOQUEADO | `views/design/dashboard.js`, `views/components/DashboardCharts.jsx` | U; `tests/dashboard-source.test.js` | A fonte `graficoContratosPorServico` conta **contratos**, não pets. Mantém “Distribuição de contratos” nos dados reais; não faz renomeação enganosa. Falta fonte/agregação de pets. |
| ECO-01 | PARCIAL | `models/frontend-config.js`, `views/components/DesignRenderer.jsx`, `.env.example` | U, E | Link `wa.me`, mensagem codificada, URL segura e `noopener noreferrer`; sem número configurado mostra indisponibilidade e não abre assistente/Twilio. Confirmar número oficial de atendimento. |
| ECO-02 | CONCLUÍDO | `styles.css` | U, E desktop/mobile | Ícone ampliado proporcionalmente; área de 88/72 px, foco visível e espaço inferior no mobile. |
| FOO-01 | PARCIAL | `models/frontend-config.js`, `views/components/InstitutionalLinks.jsx`, `views/components/DesignRenderer.jsx` | U, E desktop/mobile | Maps configurável e ausência explícita; falta URL/localização oficialmente confirmada. |
| FOO-02 | CONCLUÍDO | `views/components/DesignRenderer.jsx`, `styles.css` | U, E desktop/mobile; leitura do asset | Reutiliza `/images/image-import-43.jpg`, alt correto, tamanho responsivo e `object-fit: contain`, sem trocar identidade. |
| FOO-03 | PARCIAL | `models/frontend-config.js`, `views/components/InstitutionalLinks.jsx` | U, E desktop/mobile | Instagram configurável, HTTPS e abertura segura; falta confirmação da URL oficial. |
| FOO-04 | CONCLUÍDO | `views/screens/ScreenPage.jsx` | U, inspeção das variantes | Remove bloco/ação de ajuda somente em monitor/admin, sem remover ajuda institucional pública. |

## Contratos e decisões pendentes

1. **Cadastro:** `backend/.../dto/UsuarioDTO/UsuarioRequest.java` contém apenas nome, email, cpf, telefone e senha. Não há suporte a endereço. `UsuarioResponse` não retorna CPF/endereço.
2. **Pets:** `TutorController` oferece POST/GET `/pets/{idTutor}`, PUT/DELETE `/pets/{idTutor}/{idPet}`. `PetParaListaResponse` só retorna identificação, raça, sexo, castração e nascimento. PUT substitui saúde, logo consultar apenas essa lista não autoriza enviar saúde vazia. Necessários consulta completa e catálogos reais para completar edição/saúde.
3. **Metas:** `DashboardController`, `DashboardService` e `MetaRepository` usam data exata; não foi encontrada normalização obrigatória para primeiro dia do mês. Não adicionar `-01` arbitrariamente.
4. **Distribuição:** dados do dashboard permanecem contagem de contratos; disponibilizar contagem distinta de pets antes de mudar o título no modo real.
5. **Conteúdo oficial:** preencher `VITE_WHATSAPP_NUMBER`, `VITE_WHATSAPP_MESSAGE` opcional, `VITE_GOOGLE_MAPS_URL` e `VITE_INSTAGRAM_URL`. O asset da marca contém contato/perfil impressos, mas sua validade operacional não foi presumida para configurar destinos. Não há número/URL de terceiro introduzido como padrão.
6. **Diário:** alguns cuidados positivos usam PUT seguido de POST de observação, como já ocorria no fluxo encontrado. Falha da segunda chamada pode representar persistência parcial da primeira; não há transação frontend e nenhuma regra do servidor foi alterada. Validar esse caso com backend ativo.

## Arquivos e preservação do trabalho anterior

As mudanças locais da SPEC encontradas no início em `App.jsx`, APIs/models de pets/perfil, componentes de saúde/dashboard/calendário, designs, catálogo, estilos e arquivos novos de configuração foram preservadas e revisadas; não representam todas trabalho originado nesta sessão.

Nesta execução foram complementados principalmente `src/views/screens/ScreenPage.jsx`, `src/views/screens/AccountPages.jsx`, `src/views/components/DesignRenderer.jsx`, `src/views/components/TutorPets.jsx`, `src/viewmodels/use-dashboard.js`, `src/api/http.js`, `src/api/daily-activities-api.js` e `src/styles.css`. Criados `tests/frontend-corrections.test.js`, `tests/e2e/frontend-corrections.spec.js` e este relatório. Ajustados `vitest.config.js` e os testes `activity-catalog`, `booking`, `calendar-api`, `daily-activities`, `ecomigo` e `pet-registration`.
