# EcoDog Park — correções críticas e limites operacionais

## A. Problemas confirmados

Reproduzidos antes das alterações no navegador:

- P0.1: editar Mel carregava Thor; editar Creche carregava Hotel. Em
  `src/screens/ScreenPage.tsx`, `openDialog` preenchia campos a partir do JSON e
  `action` atribuía `targetRef` com IDs de nós visuais. Não existia consulta do
  registro selecionado. Vínculos e edição de usuário compartilham esse caminho.
- P0.2: `src/design/calendar.ts` inferia seleção disponível pela cor. TL03 não
  consultava capacidade/reservas e enviava nomes de pets. `CalendarSource` da
  TL14 não fornece identidade dos pets selecionados, presença, DayUse ou todas
  as regras necessárias para confirmar TL03/TL09.
- P0.3: TL10 aceitou salvar novamente uma refeição e substituiu o primeiro valor
  em `monitorSaved`. O renderer mantinha campos editáveis e a ação enviava
  `record.id` do design ao adaptador.
- P0.4: o primeiro botão de saída estava habilitado mesmo com entrada não
  registrada. TL11 não possui fonte de consulta de check-in operacional.

RF-042 foi confirmado diretamente em `Briefing_Front-End - Completo.xlsx`, aba
Requisitos Funcionais, linha 44 (também em `briefing-data.json`):

> Informações consideradas essenciais para o histórico do cão não deverão ser
> excluídas por usuários. Registros de alimentação, medicamentos, comportamento,
> atividades e intercorrências não poderão ser alterados posteriormente. Dado um
> registro operacional protegido, quando um usuário tentar alterá-lo ou excluí-lo,
> então a operação não deverá ser permitida.

Não foram inventadas exceções, permissões de correção ou trilha de auditoria.

## B. Correções e alcance

- `src/services/prototype-safety.ts` é um bloqueio explícito dos caminhos que
  ainda só possuem exemplos. Não é contrato HTTP nem detector automático de
  capacidades de um backend.
- A edição de registros ilustrativos não abre formulários de outro registro.
  IDs visuais deixaram de ser capturados como `target`. Escritas dependentes
  desses IDs são recusadas antes de chamar o adaptador. A interface e os JSON
  dos formulários foram preservados para uma futura fonte identificada.
- O formulário de novo vínculo continua disponível como rascunho ilustrativo,
  com aviso interno, mas não envia nomes de tutor/pet como identidade. Payloads
  de criação não recebem mais nomes de pets, dia ou serviço de outras telas.
- Registros do feed já marcados como salvos no exemplo são somente leitura,
  identificados como exemplos, não como persistência real.
- Novos rascunhos da prévia DEV podem ser corrigidos antes do salvamento local.
  Depois, snapshot, campos e ação de salvar ficam protegidos na sessão. Uma
  referência síncrona impede uma segunda gravação antes da próxima renderização.
- Os snapshots permanecem exclusivamente em memória; recarregar descarta-os.
  TL10 operacional não envia IDs de design nem declara sucesso de servidor.
- Check-out fica desabilitado sem evidência operacional de check-in. A ação de
  entrada também não transforma horários/contadores fictícios em presença real.
- TL03/TL09 mantêm seleção, recorrência, cálculo estimado e passagem pelo login,
  mas exibem aviso de calendário ilustrativo. A legenda diferencia seleção do
  protótipo de vaga real. Cores nunca autorizam envio de reserva ao adaptador.
- Dashboard e calendário administrativo com modelos normalizados não foram
  substituídos. Nenhum endpoint, DTO ou dependência foi criado.

## C. Verificações

Baseline antes de alterar os caminhos da aplicação:

- `npm test`: 76 testes, 12 arquivos, aprovados.
- `npx tsc --noEmit --incremental false`: aprovado.
- `npx vite build --outDir /tmp/opencode/ecodog-p0-before-build`: aprovado.
- Playwright completo: 118 aprovados e 18 reprovados, de 136 testes.

Verificações por grupo foram executadas. Regressões específicas até aqui:

- edição bloqueada sem alterar a identidade/dados de Mel, Creche e vínculo,
  em desktop/mobile, sem chamadas ao adaptador;
- rascunho editável antes de salvar; snapshot local bloqueado depois;
- DOM desabilitado não permite nova gravação; recarga não representa histórico;
- check-out sem fonte de check-in, sem transição fictícia;
- calendário recolorido não confirma reserva, mesmo com adaptador de teste que
  responderia sucesso e uma `CalendarSource` injetada;
- feed sem identidade não envia operação e preserva o rascunho.

O teste antigo de feed que exigia sobrescrita foi ajustado por contradizer RF-042.
Testes de posicionamento e regras/datas de calendário não foram alterados.
Após as correções:

- `npm test`: 83 testes aprovados, em 14 arquivos.
- `npx tsc --noEmit --incremental false`: aprovado.
- `npx vite build --outDir /tmp/opencode/ecodog-p0-final-build`: aprovado.
- `npx playwright test tests/e2e/critical-safety.spec.ts tests/e2e/monitor-feed.spec.ts`:
  15 testes aprovados, inclusive o bloqueio de criação de vínculo sem identidade.
- Regressão de rodapé/agendamento junto aos críticos: 29 aprovados e duas
  falhas preexistentes de espaçamento desktop; rodapés e agendamento mobile
  passaram sem alteração dos testes de posicionamento.

Uma execução intermediária completa apresentou 128 aprovados e 20 reprovados.
Dois problemas novos de altura mobile foram causados pelo aviso externo de
disponibilidade. O aviso foi integrado ao texto existente da tela, em vez de
adicionar um bloco antes do layout. Ambos passaram na reexecução específica.
A execução completa da versão final terminou com **131 aprovados e 18
reprovados, de 149 testes**, em aproximadamente 2,9 minutos. Log:
`/tmp/opencode/ecodog-p0-final.log`.

As 18 entradas reprovadas já estavam na baseline:

- carrossel mobile: 1;
- centralização do cadastro: 6;
- posicionamento/espaçamento desktop do agendamento: 3;
- posicionamento do login: 3;
- Estrutura/login/agendamento: 5.

Em `tests/e2e/structure-flow.spec.ts:77`, a causa mudou: antes havia envio
simulado seguido de divergência de datas; agora não há envio, pois o teste
espera autorização para reservar somente com exemplos. Esse pressuposto
contradiz P0.2. Os outros quatro testes de Estrutura continuam dependentes de
datas/domingos de agosto sem relógio fixado. Não foram ajustados nesta etapa.
As duas regressões novas de altura mobile não aparecem na execução final.

Não há script/configuração de lint. Não houve teste com backend real ou
comprovação de persistência, capacidade sob concorrência ou autorização HTTP.

## D. Lacunas e decisões pendentes

| Lacuna | Impacto e informação necessária |
|---|---|
| Identidade de pets/planos/vínculos | Não há ligação comprovada entre cards JSON e entidades. É necessária fonte de consulta com IDs de domínio e dados do registro; `DashboardPet.id` não identifica automaticamente os cards de Meus Pets. |
| Formulário de edição de pet | Colisões de linhas do JSON permanecem no artefato não operacional. Antes de reativar, associar campos a registros identificados e compartilhar o rascunho/validação do cadastro. |
| Disponibilidade | Definir unidade de capacidade, estados que ocupam vagas, DayUse, horários, antecedência, Hotel e operação multipet. Não basta injetar o calendário administrativo. |
| Reserva | Confirmar contrato de criação/resultado e validação autoritativa. Cores ou estimativa de carrinho não confirmam vaga/preço. |
| Feed/histórico | Fonte por pet/agendamento/registro, autoria real, consulta de históricos e rejeição de alteração protegida no backend. |
| Presença | Fonte de check-ins/out reais, identidade da reserva e resultado canônico da transição. Duplicidade, horários e permissões completas ainda não foram definidos. |
| Contratos | Nenhum endpoint/DTO novo foi presumido. Operações bloqueadas não devem ser liberadas apenas porque `execute` passa a resolver uma Promise. |

## E. Riscos residuais

Esta etapa contém os caminhos inseguros no frontend; não fornece integridade
operacional definitiva. P0.1 não está concluído como edição real: está bloqueado
com causa documentada. P0.2/P0.4 não passaram a ter reserva/presença reais. P0.3
protege somente a apresentação e os snapshots locais da prévia, não um histórico
em servidor. A proteção definitiva exige validação do backend.

## F. Próximo passo mínimo

Validar fontes/modelos de identidade, disponibilidade, presença e histórico.
Só então substituir cada bloqueio por consulta do registro, validação e resposta
operacional correspondentes, com testes de identidade e falha/concorrência.
Não reativar operações usando nomes, posições ou IDs do protótipo. Qualquer
exceção de correção do histórico requer decisão explícita compatível com RF-042.
