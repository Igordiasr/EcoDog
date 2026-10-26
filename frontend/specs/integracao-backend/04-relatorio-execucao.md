# Execução da SPEC-04 — Agendamento e agenda do tutor

## Implementação disponível sem liberar os gates

- `src/services/booking-api.ts`: adaptador público para GET serviços e disponibilidade com parâmetros tipados, AbortSignal e fetch injetável; valida categoria, período/data civil, IDs, duplicidades, capacidade e números financeiros. Erros/204 não viram vazio nem exemplos.
- IDs de serviço usam `id` real do DTO, normalizado para string; dinheiro usa arredondamento decimal em centavos. Modalidade/frequência são preservadas, sem inferir autorização por posição ou categoria.
- Função de capacidade do grupo distingue desconhecido/insuficiente/informativo: duas vagas só atendem informativamente até dois pets; nunca dá autorização para reservar.
- Consulta pública manual em TL09/TL03: serviços não plano e contagens por data, com mês atual explícito, troca de categoria/mês cancelável, descarte de respostas antigas e retry manual. Nenhuma fonte real é utilizada nas prévias.
- Parsers de pets, orçamento, resultado de reserva e agenda são infraestrutura pura, sem HTTP protegido. Payload diário exige modalidade aprovada, IDs de pets fornecidos por fonte autorizada e datas distintas; não contém carrinho/preço/nome/frequência nem data de início de plano.
- Métodos pessoais/orçamento/reserva/cancelamento do adaptador rejeitam antes de fetch. Não foi presumido token, cookie ou usuário fixo. `EcoDogApi.execute` e o bloqueio `book` existente foram preservados.
- `TutorScheduleSource` agora usa modelo de leitura sem ID de reserva. Parser mantém pet/data/serviço/situação; categorias/situações desconhecidas não autorizam ações. Indicadores de Creche não são saldo, frequência contratada ou plano.
- Rascunho TL09 → login → TL03 não é apagado apenas pela restauração visual. Mantém expiração existente e só o caminho de sucesso de reserva pode limpá-lo. Rascunho nunca comprova disponibilidade/autorização.
- Testes de cart/draft continuam tratando dados locais como estimativas/rascunhos. E2E usam relógio fixo e comprovam que uma fixture que resolve escrita não supera os bloqueios.

## Gates que continuam pendentes

| Gate | Pendência / decisão |
|---|---|
| SEC-01 | Transporte de sessão aprovado, principal validado e provas de 401/403/acesso cruzado negado. Sem isso, não consultar pets/agenda reais nem enviar orçamento/reserva. |
| AGE-01 | Capacidade única Creche/DayUse, contagem após check-in, estados, Hotel, domingo/feriado e antecedência. Contagens públicas são apenas informativas; calendário existente permanece ilustrativo, sem autorizar seleção operacional. |
| AGE-02 | Preço/feriados e modalidades diárias aprovadas. Nenhum preço local é confirmação de cobrança. Não há modalidade operacional habilitada por padrão. |
| AGE-03 | Provas de concorrência/atomicidade/duplicidade em banco isolado, último lugar e conjunto multipet/multidata. Nenhum teste de escrita foi realizado no banco compartilhado. |
| AGE-04 | Swagger declara 200, controller retorna 201. Divergência auditada; validação da versão implantada e implementação HTTP da escrita ficam pendentes da liberação anterior. |
| AGE-05 | ID real de agendamento em fonte autorizada e política financeira/prazo/efeitos. Modelo de leitura não tem ID; cancelamento permanece indisponível. |

## Limites do aceite

O fluxo operacional orçamento → revisão → reserva → recarga **não foi liberado**. Revalidação de pets/IDs/disponibilidade após login, comparação de preço, aprovação pendente e reconciliação dependem dos gates acima. Os parsers não comprovam propriedade nem capacidade concorrente.

Não foram criados protocolos, IDs compostos enviáveis, contratação de planos, compensação local de ocupação por `dataEntrada`, reembolso, multa ou retry automático de escrita. Não houve alteração de backend, seeds, credenciais, produção ou banco compartilhado.

## Auditoria pontual

- `AgendamentoTutorController`: GETs e POSTs publicados; criação retorna 201; cancelamento exige `idAgendamento`.
- DTOs confirmam que `OrcamentoRequest` usa IDs/datas, `AgendamentoCriadoResponse` tem apenas valor/aprovação e agenda não tem ID da reserva.
- `AgendamentoTutorService`: pets são buscados por `idUsuario` recebido; não é prova de principal autenticado. Disponibilidade consulta capacidade/ocupação; transação sozinha não prova exclusão mútua. Preço e concorrência não foram aprovados nesta execução.

## Validação

- `npm test -- tests/booking-api.test.ts tests/booking-cart.test.ts tests/booking-draft.test.ts`: 41 testes passaram.
- Suíte unitária completa: 157 testes passaram.
- E2E solicitados TL03/TL05/TL09: 25 testes passaram; com `critical-safety.spec.ts`, 42 testes passaram. Fixtures e interceptação são apenas para apresentação/regressão, não prova de autenticação/CORS/concorrência do backend.
- Build passou com avisos existentes de imagens não resolvidas.
