# Execução da SPEC-02 — Calendário administrativo

## Implementado dentro dos gates atuais

- Adaptação localizada de alunos aprovada pelo usuário: serviço opcional, idade da data consultada, sem nascimento/horários inventados; AGENDADO, CONFIRMADO, RETIRADO e CANCELADO permanecem distintos. Registros cancelados são preservados na leitura contratual.
- `calendar-api.ts`: parsers de dias, detalhes e catálogo com validação de IDs, duplicidades, datas, quantidades e horários. Identidade da programação e ID do catálogo são separados. Dia inexistente mantém `calendarId: null`, ausência de capacidade configurada e disponibilidade desconhecida.
- Fonte contratual preparada com transporte injetado, até quatro detalhes simultâneos e consulta do dia selecionado mesmo fora da lista configurada. Política: qualquer falha rejeita todo o mês, sem disponibilizar dados parciais.
- Seleção/mês invalidam respostas anteriores e recebem AbortSignal. Recargas manuais também invalidam resultados antigos. Após gravação confirmada e recarga falha, a UI limpa dados, bloqueia controles e oferece apenas nova consulta.
- Payloads puros de POST/DELETE com IDs reais; edição não é simulada. Preparação de PUT preserva ambos os valores reais e rejeita ausência de configuração. Essas funções não executam nem autorizam HTTP.
- UI apresenta idade consultada, estados distintos e ocupação por serviço desconhecida. Seleção identificada de catálogo preparada no diálogo; ações incompatíveis desabilitadas pela fonte contratual, com verificação adicional no commit.
- Fonte bloqueada por padrão no hook reutilizado por TL14; composição protegida existente em App e isolamento de prévias preservados. Nenhum transporte de sessão foi presumido.

## Pendências que impedem liberação real

- SEC-01: sessão/principal, autorização administrativa, 401/403 e acesso cruzado ainda sem contrato/evidência. A fonte de produção rejeita leitura/escrita antes de HTTP. A fonte preparada só exercita contratos com transporte injetado; não está conectada a fetch.
- Vagas: service sobrescreve valores sem validar ocupação, versionamento ou exclusão mútua. Permanecem pendentes capacidade compartilhada Creche/DayUse, estados que ocupam vagas e alinhamento do padrão de dias inexistentes. GET antes de PUT não resolve concorrência.
- Atividades: service verifica sobreposição e vínculos, mas transação simples não comprova concorrência de POST/DELETE. POST persistido, DELETE 204/409 e recarga contra backend real ficam pendentes dos gates; não foram executados no banco compartilhado.
- Escrita mensal atômica, abrir/fechar data, editar programação e cancelar como administrador continuam sem contrato liberado. Nenhum loop mensal, DELETE+POST de edição ou PATCH de tutor foi criado.
- Teste com admin e base isolada, CORS/preflight e evidências de concorrência ainda pendentes. Não houve alteração de backend, credenciais, seeds ou banco.

## Validação

- `npm test -- tests/calendar-api.test.ts tests/calendar.test.ts`: 19 testes passaram.
- Suíte unitária completa: 164 testes passaram antes do acréscimo do teste de payload de capacidade, também aprovado na execução localizada final.
- `npm run test:e2e -- tests/e2e/management-calendar.spec.ts`: 19 testes passaram na execução final isolada. Novos cenários: alunos sem serviço, gates, seleção fora de ordem e recarga sem repetir gravação.
- Build passou com avisos existentes de imagens não resolvidas; verificação TypeScript final passou.
- Execuções E2E simultâneas a build/TypeScript tiveram falhas intermitentes com navegação para a aplicação normal; execução isolada final passou. Fixtures não comprovam autenticação ou atomicidade do backend.

O aceite operacional completo permanece bloqueado pelos gates acima. A implementação entregue prepara leitura/apresentação e contratos, sem liberar silenciosamente operações inseguras.
