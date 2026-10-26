# Execução da SPEC-01 — Catálogo público

## Resultado

- Adaptador existente preservado; valida IDs inteiros positivos int32, unicidade, nome obrigatório e programação nula. Textos opcionais ausentes/nulos são normalizados para null.
- Diálogo mantém carregamento, vazio válido, erro seguro e retry manual GET. Troca de base remonta a consulta sem exibir dados anteriores; fechamento cancela fetch e descarta resultados.
- Em `/estrutura`, o botão permanece disponível sem configuração para informar integração pendente, sem chamadas. Prévia DEV identifica exemplos e não oferece consulta real.
- Fotografias institucionais e carrossel foram preservados, sem associar imagens a registros do catálogo nem anunciar horários/vagas.

## Evidência real no navegador

- Horário UTC: **2026-10-26T22:04:37.740Z** (19:04:37 em America/Sao_Paulo).
- Origem: `http://localhost:5173`; API configurada explicitamente: `http://localhost:8080`.
- Método/endpoint: `GET /calendario/catalogo-atividades`.
- Status: **200**; array válido com **4 atividades**, todas exibidas no diálogo pela resposta real.
- CORS confirmado em Chromium: resposta acessível e `Access-Control-Allow-Origin: http://localhost:5173`.
- Sem interceptação de rede, seeds, escrita ou exclusão de registros. Sem nomes, descrições ou dados sensíveis neste relatório.
- Evidência reproduzível via `scripts/validate-public-catalog-real.mjs`; requer backend ativo e porta 5173 livre:

```powershell
$env:VITE_API_BASE_URL = 'http://localhost:8080'
node scripts/validate-public-catalog-real.mjs
```

O script inicia um servidor Vite temporário e fecha servidor/navegador ao terminar. Não cria `.env` nem altera configuração de produção.

## Auditoria e regressão

- `GerenciamentoCalendarioController`: GET publicado com 200 e CORS para a origem acima.
- `GerenciamentoCalendarioService.listarCatalogoAtividades`: ordenação por nome (`findAllByOrderByNomeAsc`) e campos de programação nulos.
- `npm test -- tests/activity-catalog.test.ts`: **20 testes passaram**.
- `npm run test:e2e -- tests/e2e/structure-activities.spec.ts`: **13 testes passaram**; cenários vazios/erros usam interceptação isolada, não modificam catálogo compartilhado.
- `npm run build`: passou; avisos existentes de imagens importadas não resolvidas permanecem.

Esta evidência comprova somente o GET público nesta origem/ambiente, não autenticação, autorização de módulos protegidos nem CORS de outros endpoints.
