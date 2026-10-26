# SPEC-08 — Plano de testes e gates de liberação

## Execução localizada

- Ler somente a spec do módulo em validação, seus testes alterados e o checklist abaixo; não reabrir roadmap, relatórios ou design para repetir a análise. Comandos e configuração Playwright estão resumidos no README.
- Ordem: testes pontuais indicados no módulo → `npm test` → `npm run build` → E2E pertinente → teste real autorizado após gates. Suíte E2E completa quando a alteração for transversal. Não executar requisições protegidas/escritas enquanto faltar identidade/base isolada autorizada.
- Registrar evidências por módulo em `specs/integracao-backend/evidencias/<modulo>.md` (arquivo planejado), sem duplicar documentos históricos. Incluir resultados desta execução, falhas preexistentes, contratos revalidados, gates e pendências; nunca copiar resultados antigos como novos.
- Nenhuma mudança de aplicação é exigida por esta spec isoladamente. Se um teste revelar falha, voltar apenas à spec/arquivo afetado; não expandir escopo automaticamente.

## Evidências desta análise

- Swagger UI e OpenAPI JSON acessíveis em `localhost:8080` por consulta somente leitura.
- Contratos, parâmetros, schemas e códigos publicados inspecionados; divergências comparadas com código local.
- Protótipos/estados inspecionados no Pencil, com capturas dos painéis de dashboard mobile, calendário e feed para conferência visual.
- Frontend analisado em fonte; `git status` inicial tinha somente `roadmap-integracao-ecodogpark.md` não rastreado, preservado.
- **Não realizados:** requisições de negócio pessoais/financeiras, autenticação, gravações, testes de banco, build, testes unitários ou E2E da aplicação nesta entrega documental. Números de testes de relatórios anteriores não são resultados desta execução.

## Camadas de validação para implementação

### 1. Contrato/adaptador — sem persistência real

Fixtures devem refletir exatamente DTOs publicados e variantes confirmadas do código, com IDs de domínio distintos dos IDs visuais. Testar:

- Método, caminho, query obrigatória, headers, corpo aninhado e ausência de corpo em PATCH de cancelamento/DELETE/GET.
- 200/201/204 conforme operação; falha de parsing em 2xx não é sucesso validado.
- Mapas 400 por campo, 401/403/404/409/5xx, rede/CORS e abort.
- IDs positivos/seguros, duplicidade, campos ausentes/nulos, enum desconhecido, data inválida, meses ISO/localizados e conversão monetária.
- Separação catálogo/programação/participação/medicação/agenda/contrato.

Fixtures continuam exclusivamente em `tests/`; não inserir fallback delas no runtime.

### 2. Hooks e UI — respostas controladas

- Carregando, vazio válido, erro, retry e acesso negado conforme painéis de status.
- Duplo clique, resposta fora de ordem, troca de pet/data/mês, saída/desmontagem, foco/teclado e etapas mobile.
- Operação confirmada + consulta falha não reenvia POST/PUT/PATCH/DELETE.
- Resultado indeterminado de escrita não afirma “não foi salvo” nem garante retry seguro.
- Prévia DEV sem chamadas reais mesmo com fontes operacionais configuradas; rotas protegidas mantêm controle de perfil.
- Layout aprovado preservado; rótulos e pendências não deslocam controles desnecessariamente.

### 3. Backend de desenvolvimento — identidade e banco isolados

Preparar base descartável autorizada, relógio/hoje coerente em São Paulo, usuários/pets/catálogos conhecidos e permissão para efeitos de teste. Não tocar produção nem apagar catálogo compartilhado para testar vazio.

| Área | Cenários reais mínimos |
|---|---|
| Segurança | Sem identidade; perfil errado; tutor A tentando pet/agenda/diário B; monitor em recurso fora do escopo |
| Catálogo | Resposta real e CORS pelo navegador; sem escrita |
| Calendário | Dia configurado/inexistente; vagas inferior à ocupação; atualização concorrente; horário sobreposto; remoção com participação |
| Pets | Criação com saúde válida/inválida e rollback; edição preservando saúde; exclusão com histórico/vínculos |
| Agendamento | Orçamento/reserva iguais em preço; feriado/domingo/Hotel aprovados; multipet/multidata; último lugar concorrente; cancelamento e efeitos financeiros |
| Presença | Agendado com `dataEntrada` à meia-noite; saída antes da entrada; dia errado; cancelado; transições repetidas/concorrentes |
| Feed/atividades | Vínculos do dia/CONFIRMADO; justificativa negativa; segunda gravação RF-042; lote com IDs fora do dia; atividade global ≠ participação |
| Diário | Resumo individual coerente com participação e refeição; data obrigatória no histórico; acesso cruzado negado |
| Dashboard | Séries reais/rótulos; metas data/serviço/múltiplas/projeção JPA; pendência PAGO; contrato não relinkável; CORS |

## Checklist por módulo

- [ ] Endpoint/DTO e versão implantada confirmados; divergências Swagger/código resolvidas ou tratadas explicitamente.
- [ ] Gate SEC-01 e gates específicos atendidos; fora do escopo permanece isolado.
- [ ] Nenhum ID de design/nome/posição/usuário fixo é identidade operacional.
- [ ] Estados e escrita confirmada/indeterminada são corretos, sem mock de fallback.
- [ ] Testes unitários, TypeScript, build e regressões E2E executados; falhas preexistentes distinguidas.
- [ ] Teste manual real no navegador, CORS, permissões e persistência registrados.
- [ ] Sem perda de saúde, histórico, concorrência de vagas ou duplicação por retry.
- [ ] Fonte real ligada no bootstrap somente para módulos aprovados; prévias isoladas.
- [ ] Relatório atualizado com arquivos alterados, comandos/resultados, mocks substituídos, limitações e gates pendentes.

Consultar `package.json` e configuração atual para comandos efetivos; exemplos de validação futura: `npx tsc --noEmit --incremental false`, `npm test`, `npm run build` e E2E específicos. Usar saída/cache temporários aprovados quando necessário e não sobrescrever resultados/trabalho preexistentes. Um build aprovado não substitui teste real.

## Registro de evidência recomendado

Para cada requisito: ID da spec/gate, versão/commit frontend/backend, ambiente, data/hora/fuso, fixture ou caso real, método/endpoint/status, resultado observado, teste executado e pendência. Não registrar tokens, CPF, dados clínicos completos ou dumps pessoais.

## Fora do escopo — P8

TL02/TL04/TL15/TL16/TL17 permanecem sem integração nesta etapa. Preservar telas, validações e navegação; não consumir CRUD `/usuarios` só porque está publicado, nem implementar login falso para liberar outros módulos. Planos/vínculos e EcoMigo/Twilio também não são entregas desta integração.

**Conclusão permitida:** “módulo X conectado e validado nas condições Y”. **Conclusão proibida sem evidências:** “frontend totalmente integrado” ou “backend seguro porque o Swagger funciona”.
