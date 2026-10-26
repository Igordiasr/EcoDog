# SPEC-01 — Catálogo público de atividades

**Prioridade:** P1. **Tela:** TL09 `/estrutura`. **Situação:** chamada HTTP existente; falta validação contra servidor real e navegador.

## Execução localizada

- Ler `src/services/activity-catalog.ts`, `src/components/ActivityCatalogDetails.tsx` e `tests/activity-catalog.test.ts`. Fonte existente: `createActivityCatalogSource(baseUrl, request?)`; `load(signal?)` retorna `{ id: number, name, description, category }[]`.
- Ordem: validar parser/HTTP existente → estados do diálogo → regressão → GET real no navegador. Não criar outro adaptador. Ler `src/screens/ScreenPage.tsx` somente nos usos de `ActivityCatalogDetails` se precisar mudar configuração.
- Executar `npm test -- tests/activity-catalog.test.ts` e `npm run test:e2e -- tests/e2e/structure-activities.spec.ts`. Auditoria pontual: `../backend/src/main/java/br/com/ecodogpark/backend/controller/GerenciamentoCalendarioController.java`.

## Contrato publicado

`GET /calendario/catalogo-atividades` → **200**, array de `AtividadeCalendarioResponse`.

| Campo | Mapeamento/regra |
|---|---|
| `idAtividade` integer int32 | ID real do catálogo → `id` |
| `nome` string | → `name`; obrigatório para item válido |
| `descricao`, `categoria` | Texto opcional/nulo |
| `idAtividadeDoDia` | Nulo em catálogo; não é seu ID |
| `horaInicio`, `horaFim`, `situacao` | Nulos em catálogo; não publicar como programação |

`[]` significa catálogo vazio. 204 não está declarado para este GET e não deve ser convertido silenciosamente em sucesso vazio. O controller/service local confirma campos de programação nulos e ordenação por nome.

## Implementação e preservação

- Reutilizar `src/services/activity-catalog.ts`, `http.ts` e `src/components/ActivityCatalogDetails.tsx`; não reimplementar o fluxo já existente.
- Preservar botão “Consultar catálogo de atividades”, diálogo, carrossel, imagens, responsividade e navegação.
- Fotos institucionais não são imagens associadas ao registro por nome, posição ou ID. API não fornece foto neste contrato.
- Abrir diálogo inicia consulta; fechar cancela. Mudança da base limpa resultados antigos. Repetição é manual, somente GET.
- Não acoplar catálogo à promessa de vaga, reserva ou horários. Programação diária pertence à SPEC-02.
- Sem URL configurada: informar integração pendente; sem chamadas. Prévia: exemplos identificados, sem acesso real.

## Critérios de aceite

1. Resposta real válida aparece sem IDs de design e sem dados locais substituindo falha.
2. Carregamento, vazio, falha, retry e fechamento durante consulta funcionam.
3. Payload com `idAtividadeDoDia` de programação é rejeitado como catálogo; IDs inválidos e estrutura inesperada mostram erro.
4. CORS de `http://localhost:5173` é confirmado no navegador; registrar status, horário do teste e resultado sem dados sensíveis.
5. Testes existentes `tests/activity-catalog.test.ts` continuam passando, com regressões de configuração, cancelamento e payload.

## Evidência a produzir

Teste real GET com catálogo conhecido; vazio/erros podem ser reproduzidos em fixtures ou ambiente isolado, sem apagar o catálogo compartilhado. `scripts/validate-integration.mjs` usa interceptação: serve para regressão de UI, não prova backend/banco.
