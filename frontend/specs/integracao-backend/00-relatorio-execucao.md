# Execução da SPEC-00

## Implementado

- Transporte público `requestJson`: métodos GET/POST/PUT/PATCH/DELETE, query, JSON opcional, cancelamento, 204 e injeção de fetch. `getJson` permanece compatível.
- Validação compartilhada da URL explícita (configuração existente `VITE_API_BASE_URL`), sem credenciais/query/fragmento nem HTTP em página HTTPS. Nenhum endpoint protegido, token ou ambiente de produção foi criado.
- Erros com status técnico e mensagens locais; campos de 400 exigem whitelist do adaptador e não reproduzem textos remotos.
- Fontes de dashboard, calendário, catálogo de saúde e agenda ignoradas nas prévias, inclusive diretamente nos hooks. Calendário de feriados real também não é encaminhado por App às prévias.
- Consultas dos hooks recebem AbortSignal e descartam respostas após cleanup; composição remonta telas por identidade/perfil. Catálogo limpa dados anteriores durante nova consulta.
- Trava síncrona no handler genérico de escrita. Controladores reutilizáveis em `request-state.ts` cobrem consulta bloqueada/carregando/sucesso/vazio/erro e escrita confirmada com recarga separada, sem repetição automática após resultado indeterminado. São infraestrutura para adaptadores futuros, não liberam controles existentes.
- Testes de transporte, resposta fora de ordem, duplo envio, recarga após escrita e isolamento de prévias.

## Pendências externas / por domínio

- SEC-01 não está atendido: faltam mecanismo de sessão aprovado, matriz de permissões/propriedade e evidências de 401/403/acesso cruzado negado no backend. `unavailableApi` e bloqueios existentes foram preservados.
- CORS e preflight de escrita precisam ser verificados no navegador contra o backend real por grupo de endpoints; testes com fontes injetadas não comprovam CORS.
- DTOs, datas civis/horários, enums, IDs e conversões monetárias devem ser validados em cada adaptador confirmado. Nenhum contrato protegido ou DTO de domínio foi inventado nesta base.
- Os controladores de estados não foram conectados a operações protegidas sem contrato. Reconciliação de escrita indeterminada exige consulta identificável definida por domínio; não há garantia de repetição segura.
