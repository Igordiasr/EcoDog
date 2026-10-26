# Integração conforme spec_integracao.md

## Análise, classificação e plano

O código dos controllers, DTOs, services e modelos TypeScript foi comparado antes da implementação. Não há mecanismo operacional de autenticação/autorização no projeto; portanto IDs recebidos nas rotas não autorizam operações. As rotas protegidas e os bloqueios de `prototype-safety.ts` foram preservados.

| Funcionalidade / tela | Endpoint confirmado e método | DTOs Java | Situação e pendências |
| --- | --- | --- | --- |
| Catálogo de atividades / TL09, detalhes | GET `/calendario/catalogo-atividades` | `AtividadeCalendarioResponse` | Pronta para adaptação de consulta não sensível; conectada sem gravações, mediante URL explícita. Disponibilidade HTTP real não verificada. |
| Calendário / TL14 | GET `/calendario/dias?mes=yyyy-MM`, GET `/calendario/dia?data=yyyy-MM-dd` | lista de `LocalDate`, `CalendarioDiaResponse`, `AlunoAgendadoResponse` | Parcial: alunos não informam serviço, horário ou nascimento; disponibilidade não existe neste DTO. Não fabricar esses campos nem expor dados pessoais sem autorização. |
| Vagas / TL14 | PUT `/calendario/{data}/vagas` | `VagasCalendarioRequest`, `CalendarioDiaResponse` | Parcial/bloqueada operacionalmente: requer permissão administrativa; servidor não protege redução abaixo da ocupação. Request grava ambos os serviços. |
| Atividades do calendário / TL14 | POST `/calendario/{data}/atividades`, DELETE `/calendario/atividades/{id}` | `AdicionarAtividadeCalendarioRequest`, `AtividadeCalendarioResponse` | Parcial: criação usa ID de catálogo, não nome livre; falta atualização existente e permissão administrativa. |
| Alteração mensal e bloqueio administrativo / TL14 | Nenhum contrato confirmado para escrita mensal/bloqueio | — | Bloqueada: falta gravação mensal atômica e bloqueio explícito de datas. A consulta agregada de disponibilidade existe, mas não supre essas operações. Não fazer loop de PUTs. |
| Consulta/cadastro de pets / TL05–TL06 | GET/POST `/pets/{idTutor}` | `CadastroPetRequest`, `CadastroPetResponse`, `PetParaListaResponse` | Parcial: depende de tutor autorizado; listas não oferecem todo o estado para edição; validações divergentes. |
| Edição/exclusão de pet / TL05 | PUT/DELETE `/pets/{idTutor}/{idPet}` | `CadastroPetRequest`, `CadastroPetResponse`; DELETE sem corpo | Parcial, bloqueada operacionalmente: atualização verifica vínculo e substitui saúde em transação; exclusão também verifica vínculo. Isso não autentica o tutor. Faltam identidade segura e consulta completa para edição. |
| Saúde / TL06 | Saúde incluída no POST de pet; nenhum CRUD de catálogo confirmado | DTOs `CadastroVacinaPetRequest`, `CadastroMedicacaoPetRequest`, `CadastroAlergiaPetRequest` | Parcial/bloqueada: faltam consultas de catálogos de saúde; cadastro depende de tutor e integridade transacional. |
| Disponibilidade / TL03, TL09 | GET `/calendario/disponibilidade?servico=CRECHE\|HOTEL\|DAYUSE&ano=2026&mes=10` | `VagasDisponiveisResponse` | Parcial: consulta agregada sem identidade; calendário visual usa bloqueios demonstrativos, e há divergências de capacidade entre services. Não substituir cores locais por uma promessa de reserva. |
| Catálogo de serviços / TL03 | GET `/calendario/servicos?categoria=CRECHE\|HOTEL\|DAYUSE` | `ServicoAtivoResponse` | Parcial: mistura modalidades diárias e planos excluídos do escopo; preços locais e recorrência não equivalem ao contrato. |
| Pets e agendamentos do tutor / TL03, TL05 | GET `/calendario/pets?idUsuario=...`; GET `/calendario/tutor/agendamentos?idUsuario=...&ano=...&mes=...` | `PetsDoTutorResponse`, `AgendamentosTutorResponse` | Parcial, bloqueada por identidade: parâmetro de usuário não é autenticação. |
| Orçamento e reserva / TL03 | POST `/calendario/orcamentos?idUsuario=...`; POST `/calendario/agendamentos?idUsuario=...` | `OrcamentoRequest`, `OrcamentoResponse`, `AgendamentoCriadoResponse` | Parcial, bloqueada: há contrato e verificação de propriedade por ID, mas não autenticação. Reserva também pode contratar plano; regras de domingos, feriados e concorrência divergem da interface. |
| Cancelamento / TL05 | PATCH `/calendario/agendamentos/{idAgendamento}/cancelar?idUsuario=...` | `CancelamentoResponse` | Parcial, bloqueada: exige tutor autenticado e pode cancelar contrato e movimentação vinculados. |
| Agendamento por plano | POST `/calendario/planos/agendamentos?idUsuario=...` | `OrcamentoRequest`, `AgendamentoPlanoResponse` | Fora do escopo: dependência explícita de plano e saldo semanal. |
| Diário e histórico / TL07 | GET `/api/diario/{idPet}?data=yyyy-MM-dd`; GET `/api/diario/{idPet}/historico?data=yyyy-MM-dd` | `DiarioPetResponse`, `ResumoDiarioPetResponse`, `AtividadeDiarioPetResponse`, `MedicacaoDiarioPetResponse` | Parcial, bloqueada por autorização do pet. Data opcional apenas no diário; histórico exige data. Resumo usa situação da atividade do dia, não participação individual do pet. |
| Check-in/out / TL11 | GET `/checkin-checkout?data=yyyy-MM-dd`, PATCH `/{id}/check-in`, PATCH `/{id}/check-out` sob `/checkin-checkout` | `CheckinCheckoutRequest`, `CheckinCheckoutResponse` | Parcial: leitura contém dados pessoais; gravação requer monitor autorizado e validação da data. Sem fonte/identidade operacional na tela. |
| Atividades do dia / TL12 | GET/PUT `/atividades`, PUT `/atividades/atualizarPets` | `AtividadesDoDiaResponse`, `AtualizarAtividadeRequest`, lista de IDs | Parcial: consulta contém pets; atualização em lote não limita presença/data. Requer monitor e registros reais. |
| Feed / TL10 | GET `/pet/{id}`, GET `/pet/{id}/atividades`, GET `/pet/{id}/medicacoes`; POST `/pet/{id}/observacoes`, PUT `/pet/{idPet}/atividades/{idParticipacao}`, PUT `/pet/{idPet}/medicacoes/{idMedicacao}`, todos sob `/feed-monitor` | `PetFeedMonitorResponse`, `AtividadeDoPetResponse`, `MedicacaoDoDiaResponse`, requests correspondentes | Parcial: identidade de monitor e pet/agendamento confirmado são necessárias. Nenhum bloqueio removido. |
| Dashboard / TL13 | GET `/dashboard`, `/dashboard/metas`, `/dashboard/servicos`, `/dashboard/movimentacoes`; POST/PUT metas; PUT movimentações | `DadosDashboardResponse`, `ManipulacaoMetaRequest`, `AlterarMovimentacaoRequest` | Parcial: backend entrega agregados, frontend calcula sobre registros individuais; não reconstruir registros fictícios. Falta permissão administrativa; projeção de metas precisa validação JPA. Receita local não corresponde à atualização de movimentação existente. |
| Login, cadastro, usuários, clientes/tutores, planos | Não integrados | Interfaces existentes preservadas | Fora do escopo por determinação da spec. |

### Decisões de implementação

- Reutilizar `Modal` e `dialog-content`: consulta no diálogo de detalhes de TL09, acessível pelo botão “Consultar catálogo de atividades” somente quando configurado, sem alterar carrossel, fotos, CSS ou navegação. O botão é a única adição visual à página, necessária para acessar a consulta sem confundir fotos institucionais com registros reais.
- Criar serviço GET centralizado e adaptador específico. Não reutilizar `EcoDogApi.execute` para inventar operações de consulta nem conectar `unavailableApi` a gravações.
- Mapear `idAtividade` (inteiro seguro positivo) para `id`, `nome` para `name`, `descricao` e `categoria` para campos opcionais nulos. Não usar `idAtividadeDoDia` como identidade de catálogo.
- Datas, horários e valores monetários não são necessários nesse fluxo; não converter `LocalTime` em instante UTC nem fabricar data/agendamento/valor.
- Não exibir catálogos reais como se identificassem as fotografias institucionais. O diálogo informa essa distinção e não vincula por nome ou posição.
- Nenhuma consulta de pets, finanças ou presença foi publicada anonimamente para contornar autenticação.

### Revisão dos contratos atuais e pendências concretas

Esta execução encontrou trabalho preexistente nos seis arquivos de integração e em `ScreenPage.tsx`; preservou-o e corrigiu conclusões desatualizadas do relatório após consultar novamente o código Java. Nenhum endpoint foi adicionado ao backend.

- Disponibilidade: `data` é `LocalDate`, `categoriaServico` é string, `capacidadeTotal` é Integer e `vagasDisponiveis` é Long. CRECHE e DAYUSE compartilham ocupação no repository. `AgendamentoTutorService` assume capacidade 10 para dia não configurado, enquanto `GerenciamentoCalendarioService.buscarDia` retorna zero e cria dias com zero. Isso precisa ser reconciliado antes de integrar a disponibilidade às regras do calendário aprovado. O serviço de reservas não bloqueia domingos de creche nem implementa feriados/preços diferenciados; os bloqueios locais não foram removidos.
- Reserva: `OrcamentoRequest` exige mapeamento de `idServico`, `idsPet`, `datasUtilizacao` e, para plano, `dataInicioPlano`. Nomes demonstrativos dos pets e frequência semanal da interface não são IDs nem parâmetros equivalentes. Gravação valida capacidade e duplicidade, mas não há trava evidente para concorrência; verificar atomicidade em ambiente isolado antes da ativação. Orçamento tem HTTP 200, criação tem 201, cancelamento tem 200.
- Pets: mapear nascimento para `dataNascimento`, booleanos de castração/convênio, sexo de um caractere e listas de saúde por IDs reais. Foto não consta do DTO. Cadastro não possui transação envolvendo as quatro gravações; listas não têm `@Valid` em cascata. Edição substitui listas completas: não enviar formulário incompleto, pois apagaria dados existentes. Verificação de vínculo já existe, mas não autentica quem envia `idTutor`.
- Datas futuras: manter `LocalDate` como `yyyy-MM-dd` e `YearMonth` como `yyyy-MM`; não transformar datas civis em UTC. `LocalTime` não contém fuso. Operações de presença usam America/Sao_Paulo; orçamento/cancelamento usam `LocalDate.now()` sem fuso explícito. Valores `BigDecimal` precisam de conversão decimal controlada para centavos, sem reconstruir receitas individuais a partir de agregados. Enums devem ser mapeados explicitamente, nunca por posição.
- Presença: check-out aceita `dataEntrada` preenchida mesmo que represente apenas o dia agendado; falta validação explícita da situação CONFIRMADO. Check-in sobrescreve entrada com o horário atual sem verificar o dia do agendamento. Esses problemas não foram contornados no frontend.
- Diário: dados são pessoais e consultas não verificam tutor. A análise do resumo usa andamento global da atividade; confirmar regra de participação individual antes de conectá-lo à tela do tutor.
- Dashboard: receitas, metas, contagem de agendamentos, séries mensais e distribuição de contratos já vêm agregadas. O modelo da interface exige registros individuais e distribuição de pets; contratos não são pets. Não há capacidade no DTO do dashboard. Permissões administrativas e adaptação de apresentação permanecem pendentes.
- Erros: Bean Validation retorna HTTP 400 com mapa de campos string via `ApiExceptionHandler`; services também lançam 400, 403, 404 e 409 via `ResponseStatusException`. Não presumir que todas as exceções usem o mesmo JSON. A integração GET trata falha de parsing e mensagens genéricas; os demais formulários continuam isolados.

## Ativação e configuração

Somente configure `VITE_API_BASE_URL` em um ambiente apropriado, por exemplo `http://localhost:8080`. Não coloque credenciais, tokens, query strings ou fragmentos na URL. Sem essa variável, não há chamada HTTP e o diálogo informa a integração pendente. Não foi criado arquivo `.env` nem alterada configuração de produção.

A origem do frontend deve ser aceita pelo CORS do backend; atualmente o controller do calendário aceita `http://localhost:5173`. Não foi criado proxy nem alterado CORS. A URL é incorporada pelo Vite no build. Em produção HTTPS, a API também deve usar HTTPS.

## Fluxo e tratamento de erros

Abrir os detalhes em `/estrutura` inicia GET do catálogo; o diálogo exibe carregamento, lista retornada ou vazio explícito. Falhas HTTP, rede/CORS e DTOs inesperados não usam dados de demonstração como fallback. Existe repetição manual; fechar o diálogo cancela a requisição e impede atualização de componente desmontado. Conteúdo remoto é renderizado como texto React, sem HTML remoto.

O serviço entende 204 como ausência de corpo, mas o adaptador rejeita 204 para esse endpoint, cujo contrato exige lista. Erros HTTP preservam status e campos string para consumidores, exibindo mensagem genérica sem diagnósticos arbitrários. Não há escrita nem submissão operacional. As prévias `/prototipo/*` continuam isoladas do catálogo real.

## Arquivos envolvidos

- `src/services/http.ts`: transporte GET, status HTTP, resposta sem corpo, cancelamento e erros.
- `src/services/activity-catalog.ts`: contrato de catálogo, validação de URL e DTO, mapeamento sem dados fictícios.
- `src/components/ActivityCatalogDetails.tsx`: estados de consulta no diálogo existente.
- `src/screens/ScreenPage.tsx`: ligação exclusiva dos detalhes públicos TL09, fora da prévia.
- `tests/activity-catalog.test.ts`: testes com respostas HTTP controladas, sem rede ou persistência real.
- `scripts/validate-integration.mjs`: verificação reproduzível de navegador com API interceptada e cache fora do projeto.
- `INTEGRACAO.md`: classificação, planejamento, limites e verificação manual.

Nenhum mock foi removido: o placeholder de detalhes da tela operacional pública passa a consultar o catálogo quando configurado; carrossel institucional e prévias permanecem intactos. Nesta execução o adaptador também passou a rejeitar registros programados apresentados indevidamente como catálogo, e o componente limpa estados antigos quando a configuração muda.

## Testes manuais recomendados

1. Usar backend de desenvolvimento com esquema validado e catálogo conhecido; não utilizar produção para testes.
2. Configurar a URL da API, abrir `/estrutura` e o botão “Consultar catálogo de atividades”. Verificar GET `/calendario/catalogo-atividades` e correspondência exata com os registros retornados.
3. Confirmar carregamento, catálogo vazio, erro HTTP, API offline, CORS negado e resposta inválida. Não devem aparecer dados fictícios em substituição.
4. Fechar enquanto a consulta estiver em andamento e reabrir; a resposta antiga não deve atualizar o diálogo novo. Repetir após uma falha.
5. Verificar `/prototipo/TL09` sem chamadas reais, fotos/carrossel preservados e rotas protegidas ainda redirecionando para login.
6. Conferir console e aba Network: nenhuma chamada de autenticação ou gravação deve ser realizada pelo catálogo.

## Limitação de conclusão

Há integração de código somente para a consulta de catálogo. Testes unitários e build não comprovam funcionamento com servidor real, CORS, inicialização Spring ou banco. O projeto não está totalmente integrado. Demais módulos permanecem bloqueados ou fora do escopo até contratos e autorização suficientes.

## Validações executadas nesta implementação

- `./node_modules/.bin/tsc --noEmit --incremental false --pretty false`: aprovado sem emissão de arquivos.
- `./node_modules/.bin/vitest run --no-cache --configLoader runner`: 17 arquivos, 101 testes aprovados, incluindo três regressões adicionadas nesta execução para distinguir catálogo de atividade programada.
- Build pela API `vite.build`, com `configLoader: 'runner'`, cache e saída isolados em `/tmp/opencode`: aprovado. Permanecem avisos preexistentes de imagens relativas não resolvidas no build.
- `node scripts/validate-integration.mjs`: Chromium/Playwright pela API, sem usar a configuração que escreve em `test-results`: Vite com cache temporário e todas as requisições à API interceptadas. Aprovados catálogo, vazio, HTTP 403, repetição, ausência de consulta real em prévia e redirecionamento da rota `/admin` para `/entrar`. Nenhum erro JavaScript capturado. Esses testes utilizam dados controlados apenas no navegador de teste, não são mocks de runtime do aplicativo nem validação do servidor real.
- `git diff --check`: aprovado.

Não foram instaladas dependências, modificados arquivos do backend ou realizados testes contra banco/servidor real. `spec_integracao.md` não foi editada. `DesignRenderer.tsx`, `styles.css` e `tsconfig.tsbuildinfo` não foram alterados nesta implementação.
