# EcoDog — integrações por tela

Análise estática de 03/11/2026: `frontend/EcoDog.pen`, `frontend/src` e `backend/src/main/java/br/com/ecodogpark/backend`. Requisitos de cadastro atualizados em 06/11/2026 conforme definição do usuário: três POSTs por perfil com endereço no mesmo payload. Nenhuma operação foi executada na API ou no banco; a atualização não comprova disponibilidade ou integração dos novos contratos.

Desktop, mobile e etapas de revisão estão agrupados pela funcionalidade. **Integrada** significa que há chamadas no fluxo padrão do código, não que a execução em ambiente real foi validada.

## Convenções

- **Existente:** contrato identificado no backend. **Sugestão:** rota/campo/resposta para desenvolvimento futuro, ainda não disponível.
- **Definido em 06/11/2026:** requisito informado para os novos cadastros, ainda sujeito à verificação de disponibilidade e DTOs. Não confundir com integração concluída.
- Base padrão: `http://localhost:8080`, configurável por `VITE_API_BASE_URL`.
- JSON: `Content-Type: application/json`; rotas protegidas: `Authorization: Bearer <token>`.
- Datas `YYYY-MM-DD`, meses `YYYY-MM`, horários `HH:mm:ss`; dinheiro como número em reais.
- IDs e valores dos exemplos são fictícios; usar registros reais autorizados. Senhas nunca são devolvidas.
- GET e DELETE não enviam corpo. Resposta 204 não contém JSON. Etapas de formulário acumulam dados para envio final após revisão.
- As sugestões servem para definir novas APIs: não precisam se limitar aos endpoints ou entidades atuais. Preferir contratos por responsabilidade, IDs explícitos e DTOs próprios, em vez de receber entidades de persistência. Reutilizar rotas existentes é uma opção, não uma restrição.

## 1. Telas com pendências

### TL04 — Cadastro público | Parcial

**Já tem na análise anterior:** cadastro pessoal conectado a `POST /usuarios`, sem endereço. Essa rota não é mais o destino previsto para a criação pública.

**Definido em 06/11/2026:** cadastro inicial cria tutor por `POST /tutores`, enviando os dados obrigatórios do usuário e um objeto `endereco` na mesma requisição. Etapas acumulam dados localmente; somente a conclusão envia o POST. Não criar conta e endereço em chamadas separadas.

**Falta:** migrar a integração para `/tutores`, conectar a coleta/persistência do endereço e verificar o novo DTO e sua resposta. No formulário previsto, CEP, cidade, rua, número e bairro são obrigatórios; complemento é opcional. Confirmar essas regras no contrato novo. Confirmação de senha é local.

**Corpo ilustrativo para `POST /tutores` — estrutura definida, nomes/tipos dos campos a confirmar no DTO:**

```json
{
  "nome": "Maria Silva",
  "email": "tutor@example.com",
  "cpf": "52998224725",
  "telefone": "11912345678",
  "senha": "Senha123!",
  "endereco": {
    "cep": "04101000",
    "cidade": "São Paulo",
    "rua": "Rua das Flores",
    "numero": "123",
    "bairro": "Vila Mariana",
    "complemento": "Apto. 12"
  }
}
```

**Resposta anterior de `POST /usuarios` — 201, apenas referência; resposta de `/tutores` a confirmar:**

```json
{
  "id": 4,
  "nome": "Maria Silva",
  "email": "tutor@example.com",
  "telefone": "11912345678"
}
```

**Segurança e resultado:** o cadastro público cria somente tutor; não oferecer seleção de perfil administrativo. Preservar dados em erro, impedir envio duplicado e redirecionar ao login somente após confirmação do servidor. Confirmar se o novo endpoint persiste usuário/endereço atomicamente e como comunica falhas; não presumir sucesso parcial nem repetir automaticamente após timeout.

Limites anteriores, a reconfirmar nos novos DTOs: nome 120, e-mail 150, telefone 20 caracteres; CPF válido com 11 dígitos; senha de tutor/administrador entre 6 e 100. No exemplo, número do endereço é texto; suporte a complemento `null` depende do contrato. A proposta anterior de PUT separado para endereço no cadastro foi substituída pelo POST único.

### TL06 — Cadastro e edição de pet | Parcial / edição bloqueada

**Já tem:** `POST /pets/{idTutor}` (201) e `PUT /pets/{idTutor}/{idPet}` (200), ambos com `CadastroPetRequest`. Cadastro básico está conectado.

**Falta:** catálogos de saúde, leitura completa para editar e upload de foto. Frontend bloqueia saúde preenchida e edição para evitar perda de informações. O PUT substitui todas as listas de saúde; lista desconhecida não pode ser enviada como vazia.

**Envio existente — cadastro/edição, após obter IDs reais de saúde:**

```json
{
  "nome": "Bob",
  "raca": "Labrador",
  "sexo": "M",
  "castrado": true,
  "dataNascimento": "2020-05-10",
  "observacao": "Atenção na alimentação",
  "relacaoComOutros": "Sociável",
  "veterinario": "Dra. Ana",
  "telefoneVeterinario": "11987654321",
  "convenio": false,
  "medicacoesDoPet": [
    { "medicacao": { "idMedicacoes": 2 }, "frequencia": "A cada 12 horas", "dosagem": "1 comprimido", "emUso": true }
  ],
  "vacinasDoPet": [
    { "vacina": { "idVacinas": 3 }, "dataAplicacao": "2026-10-01", "dataValidade": "2027-10-01" }
  ],
  "alergiasDoPet": [
    { "alergia": { "idAlergias": 1 } }
  ]
}
```

Listas obrigatórias, `[]` somente se realmente não houver itens. Nascimento passado; nome/raça até 100, sexo um caractere, observação até 200, relação com outros até 100. Campos principais são obrigatórios. Entidades de catálogo não são criadas automaticamente pelo cadastro do pet.

**Consultas sugeridas — sem corpo:**

| Nova rota | Resposta sugerida — 200 |
| --- | --- |
| `GET /catalogos/vacinas` | `[{"idVacinas":3,"nome":"V10","tipo":"Polivalente"}]` |
| `GET /catalogos/medicacoes` | `[{"idMedicacoes":2,"nome":"Medicamento de exemplo","tipo":"Comprimido"}]` |
| `GET /catalogos/alergias` | `[{"idAlergias":1,"descricao":"Alergia a frango"}]` |
| `GET /pets/{idTutor}/{idPet}` | Objeto com `idPet`, todos os campos do envio acima e nomes/descrições dos itens de saúde |

**“Outros” em alergias — sugestão `POST /catalogos/alergias`:**

```json
{ "descricao": "Alergia a determinado produto de limpeza" }
```

Resposta 201:

```json
{ "idAlergias": 5, "descricao": "Alergia a determinado produto de limpeza" }
```

Usar o ID retornado no envio final do pet. Definir permissões/duplicidade e se a descrição é catálogo compartilhado ou informação exclusiva do pet.

**Foto — sugestão:** `POST /pets/{idTutor}/{idPet}/foto`, multipart com campo `arquivo`, após receber `idPet`; não JSON. Resposta 201:

```json
{ "idPet": 9, "fotoUrl": "/arquivos/pets/9/foto.webp" }
```

Definir tamanho/formato e tratar falha de upload separadamente do cadastro.

### TL05 — Meus Pets | Parcial

**Já tem:** listagem `GET /pets/{idTutor}` e exclusão `DELETE /pets/{idTutor}/{idPet}`, sem corpo. Lista retorna dados resumidos:

```json
[{ "idPet": 9, "nome": "Bob", "raca": "Labrador", "sexo": "M", "castrado": true, "dataNascimento": "2020-05-10" }]
```

**Falta:** ligar dias agendados à fonte operacional (`tutorScheduleSource` não criada no App padrão). Edição depende da leitura completa descrita no TL06.

**Consulta a conectar — já existente:** `GET /calendario/tutor/agendamentos?idUsuario=4&ano=2026&mes=11`, sem corpo. Usar resposta do backend com IDs reais; não criar nova rota nem transformar nomes ilustrativos em identificadores.

*Agendamentos*

- Cancelar: `PATCH /calendario/agendamentos/15/cancelar?idUsuario=4`, sem corpo.

Requisição:
```json
[{idAgendamento: "1", situacao:"cancelado"}]
```

Resposta: `204`

Plano vigente não é nova contratação: valida saldo/limite semanal. Cancelamento exige propriedade, data não passada e situação permitida. Vagas/preços são validados pelo servidor.

### TL03 — Agendamento e confirmação | Parcial

**Já tem:** seleção de pets, serviços ativos, disponibilidade, orçamento e contratação:

- `GET /calendario/pets?idUsuario=4`.
- `GET /calendario/servicos?categoria=HOTEL` (também CRECHE/DAYUSE).
- `GET /calendario/disponibilidade?servico=HOTEL&ano=2026&mes=11`.
- `POST /calendario/orcamentos?idUsuario=4` e `POST /calendario/agendamentos?idUsuario=4`.

**Envio existente — serviço por dia:**

```json
{ "idServico": 1, "idsPet": [9], "datasUtilizacao": ["2026-11-10", "2026-11-11"], "dataInicioPlano": null }
```

```
**Observação:** `Não haverá mais contratação de plano em agendamento '"dataInicioPlano": null'
Conforme abaixo:
```
```json
{ "idServico": 1, "idsPet": [9], "datasUtilizacao": [{data:"2026-11-10", eFeriado:false}, {data:"2026-11-11", eFeriado:false}] }
```

Para contratação de modalidade Hotel, informar apenas as `datas`; backend calcula preço novamente para validação. Confirmação deve respeitar `aguardandoAprovacao` retornado, sem anunciar aprovação indevida.

**Falta:** ligar consulta mensal, cancelamento (somente até 24h antes da data). Todos já possuem endpoints; não exigem contratos novos.

**Envios existentes a conectar:**

Solicitação hotel:

```json
{ "idsPet": [9], "datasUtilizacao": [{data:"2026-11-10", eFeriado:false}, {data:"2026-11-11", eFeriado:false}], "servico": "hotel" }
```

### TL15 — Gestão de funcionários: listagem, criação, edição e situação | Pendente

**Definido em 06/11/2026:** três endpoints de criação por perfil, todos com dados obrigatórios do usuário e objeto `endereco` no mesmo corpo:

| Perfil | Criação | Local de cadastro |
| --- | --- | --- |
| Tutor | `POST /tutores` | Cadastro público inicial (TL04) |
| Monitor | `POST /monitores` | Botão “Adicionar monitor” na gestão de funcionários administrativa |
| Administrador | `POST /administradores` | Botão “Adicionar administrador” na gestão de funcionários administrativa |

O perfil é determinado pela rota. O novo requisito de endereço aplica-se aos três POSTs; não implica alteração automática dos contratos de PUT/PATCH. A análise anterior identificou senha de monitor de 6 a 255 caracteres; reconfirmar limites e campos específicos nos novos DTOs.

**Falta:** implementar os dois botões de criação de funcionários e conectar cada formulário ao POST correto com endereço aninhado; verificar DTOs, respostas e autorização administrativa. Permanecem pendentes listagem/ações reais, CPF/situação/dados completos na leitura, edição sem exigir senha e ativação/desativação reversível. Na análise anterior, tutor/administrador retornavam `id`, `nome`, `email`, `telefone` e monitor acrescentava `dataCadastro`; respostas novas precisam ser confirmadas. Os botões de criação desta tela são para monitores e administradores; tutor é criado no cadastro público.

**Criação definida:** “Adicionar monitor” envia `POST /monitores`; “Adicionar administrador” envia `POST /administradores`. Usar a estrutura ilustrada no TL04 (dados do usuário e objeto `endereco`), adaptando campos e validações ao DTO de cada perfil. Uma única requisição por criação, sem PUT posterior de endereço. Manter token da sessão administrativa, loading, prevenção de duplo clique e dados do formulário em erro; confirmar sucesso pelo servidor e atualizar a lista. Códigos e corpos das respostas ainda precisam ser verificados.

**Edição sugerida — PATCH individual por perfil:**

```json
{
  "nome": "Maria Oliveira",
  "email": "novo@example.com",
  "telefone": "11912345678"
}
```

Resposta sugerida 200: objeto atualizado com `id`, dados enviados, `perfil`, `ativo`, `dataCadastro`; CPF apenas em consulta autorizada quando necessário. O contrato de edição de endereço ainda precisa ser definido; não reutilizar a antiga proposta de PUT do cadastro como se estivesse aprovada. Campo omitido é preservado; senha não deve ser fictícia/vazia para satisfazer o PUT atual.

**Situação sugerida — `PATCH /{id}/situacao` e equivalentes por perfil:**

```json
{ "ativo": false }
```

Resposta `204`

Usar `true` para reativar. DELETE atual chama `deleteById`, não equivale a desativação reversível. Listagem sugerida deve devolver `id`, `nome`, `email`, `telefone`, `perfil`, `ativo`, `dataCadastro`; pode retornar 204 quando vazia no contrato atual.

**Situação sugerida - `DELETE /{id}`**

```json
{"deletado": true}
```

Resposta `204`

### TL16 — Clientes e vínculos de planos | Pendente

**Já tem:** entidades de contrato e contratação pelo agendamento do tutor. Essa contratação não recebe preço negociado, fim manual ou diárias arbitrárias.

**Falta:** listagem administrativa, busca, criação/edição de vínculo e ativação/desativação. Tela permanece ilustrativa, sem identidade operacional.

**Envio sugerido — `POST /contratos` / `PUT /contratos/{idContrato}`:**

```json
{
  "idTutor": 4, "idPet": 9, "idServico": 2,
  "periodo": "MENSAL", "quantidadeDiarias": 8,
  "dataInicio": "2026-11-10", "dataFim": "2026-12-10", "valor": 500.00
}
```

**Resposta sugerida — 201/200:**

```json
{
  "idContrato": 20,
  "tutor": { "id": 4, "nome": "Maria Silva" },
  "pet": { "idPet": 9, "nome": "Bob" },
  "servico": { "idServico": 2, "nome": "Creche mensal", "categoria": "CRECHE" },
  "periodo": "MENSAL", "quantidadeDiarias": 8,
  "dataInicio": "2026-11-10", "dataFim": "2026-12-10", "valor": 500.00, "ativo": true
}
```

**Consulta sugerida:** `GET /contratos?nomeTutor=Maria`, sem corpo; resposta 200 como array dos objetos acima.

**Situação sugerida — `PATCH /contratos/{idContrato}/situacao`:** envio `{"ativo":false}`; resposta 200 `{"idContrato":20,"ativo":false}`.

Validar propriedade do pet, períodos, preço, conflitos e efeitos em saldo/agendamentos. `quantidadeDiarias` não existe em `ContratosEntity`; `ativo`/`periodo` são propostas, não valores garantidos pelo modelo atual.

### TL17 — Planos: criação, edição, situação e exclusão | Pendente

**Já tem:** consulta de serviços por `/dashboard/servicos` e ativos por `/calendario/servicos?categoria=CRECHE`.

**Falta:** CRUD de planos/serviços e conexão das ações da tela.

**Envio sugerido — `POST /planos` / `PUT /planos/{idPlano}`:**

```json
{ "nome": "Creche mensal", "categoria": "CRECHE", "quantidadeDiarias": 8, "valor": 500.00 }
```

**Resposta sugerida — 201/200:**

```json
{ "idPlano": 2, "nome": "Creche mensal", "categoria": "CRECHE", "quantidadeDiarias": 8, "valor": 500.00, "ativo": true }
```

**Consultas sugeridas:** `GET /planos` retorna array; `GET /planos/{idPlano}` retorna objeto acima, sem corpo.

**Situação sugerida:** `PATCH /planos/{idPlano}/situacao`, envio `{"ativo":false}`; resposta 200 `{"idPlano":2,"ativo":false}`.

**Exclusão sugerida:** `DELETE /planos/{idPlano}`, sem corpo; resposta 204. Com vínculo impeditivo, retornar 409 e preservar registro.

Definir se plano será entidade própria ou representação de `idServico`. “Diárias” da tela não pode ser convertida automaticamente em `frequencia` semanal. Preservar condições dos contratos já firmados.

### TL13 — Dashboard e metas | Parcial

**Já tem:** resumo/gráficos por `GET /dashboard`; serviços por `GET /dashboard/servicos`; consulta/criação/edição de metas conectadas.

**Envio existente — `POST /dashboard/metas` / `PUT /dashboard/metas/{id}`:**

```json
{ "mesReferencia": "2026-11-01", "valor": 1500.00, "servico": { "idServico": 2 } }
```

Ambos retornam 201. Consulta: `GET /dashboard/metas?mesReferencia=2026-11-01&servico=CRECHE`.

**Falta:** definir conversão de mês/ano da tela para data completa; primeiro dia é sugestão de convenção, não regra garantida. Frontend bloqueia sem data de referência definida. Receitas são descritas abaixo, pois têm contrato distinto.

**Sugestão para simplificar o contrato futuro:** `POST /metas` / `PUT /metas/{idMeta}` com DTO próprio:

```json
{ "mesReferencia": "2026-11", "valor": 1500.00, "idServico": 2 }
```

Resposta sugerida 201/200:

```json
{ "idMeta": 10, "mesReferencia": "2026-11", "valor": 1500.00, "idServico": 2 }
```

Consulta sugerida: `GET /metas?mesReferencia=2026-11&idServico=2`. O backend define a conversão/persistência do mês, sem exigir que o frontend invente um dia. Manter os endpoints atuais é alternativa, desde que a convenção de data seja acordada.

### TL13 — Registro de receitas | Pendente

**Já tem:** `GET /dashboard/movimentacoes` lista pendências; `PUT /dashboard/movimentacoes/{id}` registra pagamento existente:

```json
{ "formaPagamento": "PIX", "dataPagamento": "2026-11-03", "contrato": { "idContrato": 20 } }
```

**Falta:** criação avulsa do formulário (cliente, pet, serviço, data, valor). `api.execute('saveRevenue')` não implementa HTTP. O PUT acima marca `PAGO`, mas não cria receita nem recebe valor.

**Envio sugerido — `POST /receitas`, para preservar criação avulsa:**

```json
{ "idTutor": 4, "idPet": 9, "idServico": 2, "dataPagamento": "2026-11-03", "valor": 100.00, "formaPagamento": "PIX" }
```

**Resposta sugerida — 201:**

```json
{ "idReceita": 30, "idTutor": 4, "idPet": 9, "idServico": 2, "dataPagamento": "2026-11-03", "valor": 100.00, "formaPagamento": "PIX", "situacao": "PAGO" }
```

Forma de pagamento precisa ser coletada, não presumida. Definir vínculo obrigatório a contrato, duplicidade e efeitos contábeis. Alternativa sem novo endpoint: adaptar tela à baixa de pendências com `id`/`idContrato` reais, sem preço avulso.

### TL14 — Calendário administrativo | Pendente no fluxo padrão

**Já tem:** cliente `calendar-api.js` e endpoints:

- `GET /calendario/dias?mes=2026-11`, `/calendario/dia?data=2026-11-10`, `/calendario/catalogo-atividades`.
- `PUT /calendario/2026-11-10/vagas`: `{"vagasCreche":20,"vagasHotel":10}`.
- `POST /calendario/2026-11-10/atividades`: `{"idAtividade":3,"horaInicio":"09:00:00","horaFim":"10:00:00"}`.
- `DELETE /calendario/atividades/{id}`, sem corpo.

**Falta:** criar/conectar `calendarSource` no App padrão. Edição de horários, lote e aprovação administrativa não têm endpoints equivalentes.

**Envios e respostas sugeridos, se essas ações forem mantidas:**

| Ação / nova rota | Envio JSON | Resposta sugerida — 200 |
| --- | --- | --- |
| `PUT /calendario/atividades/{idAtividadeDoDia}` | `{"horaInicio":"09:30:00","horaFim":"10:30:00"}` | `{"idAtividadeDoDia":7,"idAtividade":3,"horaInicio":"09:30:00","horaFim":"10:30:00"}` |
| `PUT /calendario/vagas/lote` | `{"datas":["2026-11-10","2026-11-11"],"vagasCreche":20,"vagasHotel":10}` | `{"datasAtualizadas":["2026-11-10","2026-11-11"]}` |
| `PATCH /calendario/agendamentos/{idAgendamento}/aprovacao` | `{"aprovar":true}` | `{"idAgendamento":15,"situacao":"CONFIRMADO"}` |

Vagas não negativas; horários sem sobreposição e fim posterior ao início. Exclusão pode falhar com pets vinculados. Definir atomicidade do lote, rejeição de agendamento e efeitos financeiros/saldo. Não confundir ID do catálogo com ID da atividade programada.

### Meus Dados — frame `BuDxA` | Parcial

**Já tem:** modal de consulta nome/e-mail/telefone por GET individual do perfil. PUT de usuário existe, mas exige CPF/senha e não segue a semântica da tela.

**Falta:** formulário completo, CPF/nascimento/perfil/endereço na leitura; contato/endereço editáveis e troca opcional de senha validando a atual. Nome/CPF/nascimento/perfil são somente leitura no protótipo.

**Consulta sugerida:** `GET /usuarios/me`, sem corpo, usuário derivado do JWT. Resposta 200:

```json
{
  "id": 4, "nome": "Maria Silva", "cpf": "52998224725", "dataNascimento": "1990-08-15",
  "perfil": "TUTOR", "email": "tutor@example.com", "telefone": "11912345678",
  "endereco": { "cep": "04101000", "cidade": "São Paulo", "rua": "Rua das Flores", "numero": "123", "bairro": "Vila Mariana" }
}
```

Nascimento desconhecido deve ser `null`; sua origem precisa ser definida, não copiada do exemplo visual.

**Envio sugerido de contato — `PATCH /usuarios/me`:**

```json
{
  "email": "novo@example.com", "telefone": "11912345678"
}
```

Resposta 200: contato atualizado, por exemplo `{"id":4,"email":"novo@example.com","telefone":"11912345678"}`.

**Endereço — sugestão `PATCH /usuarios/me/endereco`:**

```json
{ "cep": "04101000", "cidade": "São Paulo", "rua": "Rua das Flores", "numero": "123", "bairro": "Vila Mariana" }
```

Resposta 200: endereço atualizado. Complemento não aparece nessa tela: omissão deve preservá-lo. Esta proposta de edição usa a identidade do JWT; não é uma segunda chamada de cadastro. A criação no TL04/TL15 envia endereço junto ao POST por perfil; PATCH de edição preserva campos omitidos.

**Senha — sugestão `PUT /usuarios/me/senha`:**

```json
{ "senhaAtual": "SenhaAtual123!", "novaSenha": "NovaSenha123!" }
```

Resposta 204, sem corpo. Confirmação local; validar atual, política de senha e revogação de sessões. Protótipo pede 8 caracteres com letras/números, diferente do mínimo 6 atual. Contato, endereço e senha são chamadas distintas: comunicar sucesso parcial e repetir apenas as operações que falharam.

### Recuperação de senha | Pendente

**Já tem:** tela do frontend informando indisponibilidade; não foi identificada tela dedicada no protótipo.

**Falta:** envio de recuperação, token temporário e redefinição.

**Envio sugerido — `POST /auth/recuperacao-senha`:**

```json
{ "email": "tutor@example.com" }
```

Resposta 202, igual para conta conhecida/desconhecida:

```json
{ "mensagem": "Se houver uma conta com esse e-mail, enviaremos as instruções de recuperação." }
```

**Conclusão sugerida — `POST /auth/redefinicao-senha`:**

```json
{ "token": "<token-de-recuperacao>", "novaSenha": "NovaSenha123!" }
```

Resposta 204. Token com expiração/uso único, diferente do JWT de login; conclusão requer tela futura.

### EcoMigo — assistente web | Pendente

**Já tem:** backend WhatsApp `POST /api/whatsapp/webhook`, parâmetros `From`/`Body`, resposta texto; não é chat web JSON. Há consulta de atendimentos pendentes, sem tela dedicada identificada.

**Falta:** chamada frontend, identidade de conversa, resposta JSON e política para acesso público/autenticado.

**Envio sugerido — `POST /api/ecomigo/mensagens`:**

```json
{ "idConversa": null, "mensagem": "Qual o horário de funcionamento?" }
```

**Resposta sugerida — 200:**

```json
{
  "idConversa": "conv-123",
  "resposta": { "idMensagem": "msg-456", "autor": "ECOMIGO", "texto": "<resposta baseada nas informações oficiais>", "dataHora": "2026-11-03T10:00:00-03:00" },
  "atendimentoHumanoSolicitado": false
}
```

Próximas mensagens usam o ID retornado. Não inventar telefone WhatsApp a partir da sessão. A segurança atual exige autenticação no webhook; integração Twilio precisa de autenticação adequada do provedor. Cliente `requestJson` não aceita resposta texto sem adaptação.

## 2. Telas integradas — documentação

### TL02 — Entrar | Integrada

**Já tem:** `POST /usuarios/login`, autenticação/encaminhamento por perfil.

**Envio existente:**

```json
{ "email": "tutor@example.com", "senha": "Senha123!" }
```

**Resposta existente — 200:**

```json
{ "token": "<jwt>" }
```

**Falta:** nenhuma integração adicional identificada; validar execução/expiração. JWT documentado com validade de 10 minutos. Claims orientam apresentação, não substituem autorização no servidor.

### TL07 — Diário do Pet | Integrada

**Já tem:** consulta diária e histórico:

- `GET /api/diario/{idPet}?data=2026-11-03`.
- `GET /api/diario/{idPet}/historico?data=2026-11-02`.

**Envio:** parâmetros na URL, sem corpo. Data opcional no diário, obrigatória no histórico. Resposta 200 com resumo, atividades, medicações e observações; listas vazias sem registros.

**Falta:** nenhuma integração adicional identificada; validar em execução. Tutor não grava registros nessa tela.

### TL10 — Feed do Monitor | Integrada

**Já tem:** consultas `GET /feed-monitor/pet/{id}`, `/feed-monitor/pet/{id}/atividades`, `/feed-monitor/pet/{id}/medicacoes`.

**Envios existentes:**

| Operação | Corpo JSON |
| --- | --- |
| `PUT /feed-monitor/pet/{idPet}/atividades/{idParticipacao}` | `{"situacao":"NAO_PARTICIPOU","observacao":"Pet estava em repouso"}` |
| `PUT /feed-monitor/pet/{idPet}/medicacoes/{idMedicacao}` | `{"situacao":"NAO_TOMOU","observacao":"Tutor orientou suspender a dose"}` |
| `POST /feed-monitor/pet/{id}/observacoes` | `{"observacao":"Pet se alimentou normalmente"}` |

Atualizações retornam 200 com registro; observação retorna 201. Participação: `PARTICIPOU`/`NAO_PARTICIPOU`; medicação: `TOMOU`/`NAO_TOMOU`. Negativas exigem justificativa; observação geral até 200 caracteres. IDs são dos registros diários, não do catálogo.

**Falta:** nenhuma integração adicional identificada; validar regras de agendamento confirmado do dia em execução.

### TL11 — Check-in / check-out | Integrada

**Já tem:** `GET /checkin-checkout?data=2026-11-03`; `PATCH /checkin-checkout/{id}/check-in` e `/check-out`.

**Envio existente para entrada/saída:**

```json
{ "responsavel": "Maria Silva" }
```

Resposta 204. Responsável obrigatório até 100 caracteres; ID do agendamento, não do pet. Saída exige entrada anterior; repetição/situação incompatível pode retornar 409.

**Falta:** nenhuma integração adicional identificada; validar execução.

### TL12 — Atividades do dia | Integrada

**Já tem:** consulta e atualização de atividades programadas ligadas à API.

**Envio existente (`AtualizarAtividadeRequest`):**

```json
{ "situacao": "CONCLUIDA", "idAtividadeDoDia": 7 }
```

ID positivo obrigatório; situações `PENDENTE`, `CONCLUIDA`, `NAO_CONCLUIDA`. Conclusão coletiva não equivale à participação individual do pet.

**Falta:** nenhuma integração adicional identificada; validar execução.

### TL01, TL08, TL09 — Início, Sobre e Estrutura | Conteúdo estático

**Já tem:** conteúdo institucional e navegação.

**Falta:** nenhuma API necessária para o conteúdo atual; não há CMS identificado. **Envio/resposta:** não se aplica.

Menus, revisões, confirmações e estados de carregamento/erro não exigem endpoints próprios: devem refletir as operações da tela correspondente.

## 3. Cuidados transversais e referências

### Diretrizes para definir os novos endpoints

- **Pets:** o corpo completo existente é opção de compatibilidade. Uma nova API pode separar `POST /pets` (dados básicos com `idTutor`), `PUT /pets/{idPet}/saude` (as três listas do exemplo TL06) e a rota de foto. Respostas sugeridas: criação 201 com `idPet` e dados básicos; saúde 200 com `idPet` e listas persistidas. Definir transação ou progresso parcial para não perder informações entre chamadas. Não adicionar esta separação ao fluxo atual sem implementar os contratos.
- **Catálogos:** DTOs de consulta/criação com IDs e nomes, em vez de entidades JPA no corpo. Decidir explicitamente se itens livres pertencem ao catálogo ou somente ao pet.
- **Agendamento e calendário:** rotas existentes podem ser mantidas; novas operações de aprovação, lote e edição já têm exemplos no tópico TL14. Não simular uma ação inexistente com endpoint de outra responsabilidade.
- **Receitas, contratos e planos:** propostas próprias nos tópicos TL13/TL16/TL17, sem limitação ao modelo atual. Definir vínculos e regras antes da implementação; presença de uma entidade no backend não obriga reutilizar sua estrutura como JSON.
- **Usuário:** na criação, usar `POST /tutores`, `POST /monitores` e `POST /administradores` com dados do usuário e `endereco` juntos, conforme definição de 06/11/2026. Separação de contato, endereço, senha e situação permanece apenas como proposta para edição; a leitura pode agregar essas informações.
- **Compatibilidade:** novos contratos podem coexistir com os atuais. Padronizar nomes de IDs, formato das respostas e política PUT/PATCH, e definir migração antes de trocar as chamadas do frontend.

- Novos contratos devem retornar erros claros: 400 validação, 401 sessão, 403 permissão, 404 registro ausente, 409 conflito. Exemplo **sugerido**, exigindo adaptação do tratamento frontend:

```json
{ "codigo": "DADOS_INVALIDOS", "mensagem": "Revise os campos indicados.", "campos": { "endereco.cep": "Informe oito dígitos." } }
```

- Validar autorização por perfil e propriedade no servidor. `SecurityConfig.java` exige autenticação geral, sem restrições explícitas por perfil nessa configuração.
- Exclusão de usuários/pets chama `deleteById` nos serviços, apesar de descrições de soft delete; não tratar como reversível sem confirmar comportamento efetivo.
- Fontes opcionais não ligadas por padrão: `calendarSource`, `petHealthCatalogSource`, `tutorScheduleSource` em `frontend/src/App.jsx`.
- Bloqueios/indisponibilidade: `src/models/api.js`, `src/models/pet-registration.js`, `src/viewmodels/prototype-safety.js`, `src/views/screens/AccountPages.jsx`.
- Contratos verificados nos controllers/DTOs e serviços do backend; especialmente `UsuarioService.java`, `TutorService.java`, `DashboardService.java`.
- Prioridade: leitura/catálogos de pets; ligação de fontes; CRUD/situação de usuários; receitas; contratos/planos; Meus Dados/senha; chat web.
