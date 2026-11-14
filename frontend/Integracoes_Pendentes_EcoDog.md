# EcoDog — integrações por tela

Análise estática de 03/11/2026: `frontend/EcoDog.pen`, `frontend/src` e `backend/src/main/java/br/com/ecodogpark/backend`. Contratos de controllers/DTOs revisados em 06/11/2026 para explicitar envio e retorno. Requisitos de cadastro atualizados em 06/11/2026 conforme definição do usuário: três POSTs por perfil com endereço no mesmo payload. Nenhuma operação foi executada na API ou no banco; a atualização não comprova disponibilidade ou integração dos novos contratos.

Desktop, mobile e etapas de revisão estão agrupados pela funcionalidade. **Integrada** significa que há chamadas no fluxo padrão do código, não que a execução em ambiente real foi validada.

## Convenções

- **Existente:** contrato identificado no backend. **Sugestão:** rota/campo/resposta para desenvolvimento futuro, ainda não disponível.
- **Definido em 06/11/2026:** requisito informado para os novos cadastros, ainda sujeito à verificação de disponibilidade e DTOs. Não confundir com integração concluída.
- **Migração de rotas definida:** operações de usuário passam a usar `/tutores`, `/monitores` ou `/administradores`, conforme o perfil. Todas as rotas por perfil deste documento são o destino definido; contratos anteriormente verificados servem de referência de payload/retorno, não comprovam disponibilidade nas novas URLs. Login também é específico por perfil; a tela deve identificar o perfil antes da chamada, sem tentar os três endpoints sucessivamente. Operações `me` usam o prefixo do perfil autenticado e identidade derivada do JWT.
- Em cada operação, **envio** inclui IDs no caminho, filtros na query, cabeçalhos aplicáveis e corpo; **retorno** identifica status e conteúdo. Os cabeçalhos comuns abaixo valem para todas as tabelas. Retorno **a confirmar** não significa corpo vazio nem resposta já implementada. Exemplos sugeridos são propostas, não descrição do backend atual.
- Base padrão: `http://localhost:8080`, configurável por `VITE_API_BASE_URL`.
- JSON: `Content-Type: application/json`; rotas protegidas: `Authorization: Bearer <token>`.
- Datas `YYYY-MM-DD`, meses `YYYY-MM`, horários `HH:mm:ss`; dinheiro como número em reais.
- IDs e valores dos exemplos são fictícios; usar registros reais autorizados. Senhas nunca são devolvidas.
- GET e DELETE não enviam corpo. Resposta 204 não contém JSON. Etapas de formulário acumulam dados para envio final após revisão.
- As sugestões servem para definir novas APIs: não precisam se limitar aos endpoints ou entidades atuais. Preferir contratos por responsabilidade, IDs explícitos e DTOs próprios, em vez de receber entidades de persistência. Reutilizar rotas existentes é uma opção, não uma restrição.

## 1. Telas com pendências

### Revisão de imagens dos pets — 08/11/2026

Conferência dos layouts desktop/mobile e edição em `src/views/design/*.json`, derivados do protótipo. **Requisito futuro de retorno:** as consultas abaixo devem devolver a referência persistida `fotoUrl` para preencher a foto do pet. Isso não afirma que o DTO Java ou o adaptador visual atual já aceita/exibe o campo. Nenhum endpoint foi alterado por esta revisão.

**Convenção única:** `fotoUrl` é `string` com URL HTTP(S) absoluta acessível pelo navegador, ou `null` quando não houver foto. Exemplo: `http://localhost:5173/arquivos/pets/<uuid>.webp`, obtido pelo fluxo local do TL06. Retornar o campo também quando nulo; usar placeholder neutro na ausência/erro de imagem, nunca a foto fictícia de outro pet. Não retornar arquivo, base64, caminho de disco, URL `blob:` ou URL relativa ao backend. O backend persiste a referência, não os bytes, e as consultas leem a foto atual do cadastro, sem duplicar o arquivo por diário/agendamento/atividade. A origem local deve permanecer acessível; `localhost` não funciona para outros dispositivos.

| Tela / uso no protótipo | Consulta que deve fornecer a imagem | Local do campo no retorno esperado |
| --- | --- | --- |
| TL03 — Agendamento, foto do pet selecionado | `GET /calendario/pets?idUsuario=4` | `fotoUrl` em cada objeto do array, junto de `idPet`, `nomePet` |
| TL05 — Meus Pets, foto de cada cartão | `GET /pets/{idTutor}` | `fotoUrl` em cada pet, junto dos seis campos atuais |
| TL06 — Cadastro/revisão e edição, foto e identificação | `GET /pets/{idTutor}/{idPet}` (leitura sugerida); POST/PUT existentes | No objeto de detalhe; no DTO de gravação quando retornar o cadastro. Na criação/revisão antes de salvar, usar o arquivo/preview local, sem nova consulta |
| TL07 — Diário do Pet, foto no resumo | `GET /api/diario/{idPet}` e `GET /api/diario/{idPet}/historico` | `fotoUrl` na raiz, junto de `idPet`, `data`, preservando resumo e registros |
| TL10 — Diário/Feed do Monitor, identificação do pet | `GET /feed-monitor/pet/{id}` | `fotoUrl` na raiz, junto de `nome`, `raca`, `nomeTutor`, `observacao` |
| TL11 — Check-in/check-out, foto dos pets previstos | `GET /checkin-checkout?data=2026-11-03` | `fotoUrl` em cada agendamento do array, associado ao seu `idPet` |
| TL12 — Atividades do dia, cartões dos grupos | `GET /atividades` | `atividadesDoDia[].grupos[].petsDoGrupo[].fotoUrl` |
| TL14 — Calendário administrativo, alunos agendados | `GET /calendario/dia?data=2026-11-10` | `alunosAgendados[].fotoUrl`; também no `CalendarioDiaResponse` retornado por PUT de vagas |

**Sem acréscimo indiscriminado:** serviços, disponibilidade, catálogos, login, usuários, metas, gráficos e respostas 204 não precisam de `fotoUrl`. Orçamento/confirmação do TL03 pode reutilizar os pets obtidos pela consulta, sem mudar o array atual de nomes. Agenda mensal do tutor pode associar `idPet` à listagem do TL05; não exige duplicar `fotoUrl` no DTO mensal. TL16/vínculo de plano e registro de receitas não apresentam foto individual nos formulários conferidos; IDs/nomes continuam suficientes. Fotos institucionais TL01/TL04/TL08/TL09, fotos de atividades e avatares de usuário/assistente não são a foto cadastral do pet.

**Pendência transversal:** atualizar DTOs de leitura, persistência de `fotoUrl`, adaptadores e renderizadores dessas telas; validar autorização e imagem ausente/indisponível em desktop/mobile. Não tornar uma foto obrigatória para cadastrar ou consultar o pet. A inclusão de campos não muda caminhos, parâmetros ou métodos dos endpoints existentes.

### Auditoria dos retornos — 06/11/2026

Conferência estática dos consumidores em `src/models/auth.js`, `src/models/pet-registration.js`, `src/api/pets-api.js`, `src/api/tutor-booking.js`, `src/api/dashboard-api.js`, `src/api/dashboard-source.js`, `src/api/calendar-api.js` e dos DTOs correspondentes. **Não é possível garantir que todos os corpos sugeridos serão utilizados:** várias ações ainda não têm consumidor HTTP. Os exemplos futuros abaixo são formatos possíveis, não uma exigência de devolver todos os campos enviados.

**Regra de necessidade:** retornar dados para identificar registros, renderizar uma consulta ou refletir valores calculados/persistidos pelo servidor. Quando a ação apenas confirma uma gravação e a tela recarrega a consulta, status de sucesso é suficiente; 204 não tem corpo. Não reduzir respostas existentes sem adaptar e testar os consumidores. Um campo enviado não precisa ser devolvido por esse motivo.

| Fluxo | Retorno necessário e uso | Dados condicionais / que não devem ser exigidos |
| --- | --- | --- |
| TL04 — criação de tutor | O consumidor atual em `createAuthApi.register` valida `id`, `nome`, `email`; esses campos precisam permanecer ao migrar para `/tutores`, ou o consumidor deve ser adaptado para confirmação por status. Sucesso permite encaminhar ao login. | Telefone, sobrenome e endereço completo não são usados por essa validação. Persistir endereço é obrigatório pelo requisito, **devolvê-lo não**. Consultá-lo posteriormente em Meus Dados. Nunca retornar senha. |
| TL06 — gravação de pet | `registerTutorPet` exige `idPet` positivo para confirmar o cadastro. Foto é salva no frontend antes do POST; o JSON envia `fotoUrl`, não arquivo. | O restante do cadastro devolvido hoje não é necessário à confirmação. Retorno futuro do cadastro inclui `fotoUrl`; campos e listas completos são necessários na **leitura de edição**. |
| TL06 — saúde e foto | Catálogos precisam de ID e rótulo; detalhe do pet precisa de campos editáveis, listas completas e `fotoUrl` para preencher a foto sem perda. Criação de alergia precisa devolver seu ID se seguida do cadastro. | `tipo` só é necessário se exibido/usado para seleção. Persistência e leitura de `fotoUrl` no Java e exibição nas consultas permanecem pendentes; foto ausente retorna `null`. |
| TL05/TL03 — pets e agenda | Listagem de pets usa os seis campos resumidos do contrato atual. Consulta mensal precisa de data, pet, serviço, situação e **`idAgendamento` para cancelar**. Orçamento atual valida `valorTotal` e `datasUtilizacao`; criação valida `valorTotal` e `aguardandoAprovacao`. | IDs dos agendamentos não são necessários à confirmação atual, mas precisam estar disponíveis na consulta para ações posteriores. Mensagem do cancelamento pode ser substituída por status apenas com adaptação do futuro consumidor. Propostas de datas como objetos exigem adaptar o validador atual de strings. |
| TL15 — funcionários | Consulta futura precisa de ID, dados efetivamente exibidos e `ativo` para ação reversível. Criação/edição pode confirmar por status e recarregar a lista. | Não exigir eco de CPF/endereço nas gravações. `perfil` pode ser derivado da rota quando as listas são separadas; `dataCadastro` só se exibida/ordenada. CPF/endereço apenas em leitura autorizada para formulário que os use. Nenhuma dessas ações futuras está integrada. |
| TL16/TL17 — contratos e planos | Consultas futuras precisam de IDs para ações/seleção, nomes para exibição, condições mostradas/editadas e situação para ativar/desativar. | Objetos completos nas respostas POST/PUT só se a tela atualizar o estado diretamente; com recarga, status basta. PATCH de situação pode retornar 204 com recarga, sem eco de ID/`ativo`. Não exigir objetos aninhados completos onde ID/rótulo resolve. |
| TL13 — dashboard e metas | Resumo usa KPIs, **`planosAtivos.planosAtivos`**, ocupação, séries, distribuição e movimentações. Serviços fornecem ID/nome/categoria/frequência para seleção; consulta de metas usa `idMeta`, `mesReferencia`, `valor`, `servico.idServico`. | `saveGoal` aguarda a gravação mas não utiliza seu corpo: não exigir objeto completo nem `idMeta` no POST/PUT atual. O ID é necessário na consulta para editar. Não exigir campos extras de serviço apenas para gravar uma meta. |
| TL13 — receitas | Consulta de pendências fornece IDs reais para futura baixa; criação avulsa ainda não tem HTTP. Sucesso de gravação seguido de recarga pode usar apenas status. | O eco integral de tutor/pet/serviço/valor/pagamento no POST sugerido não tem consumidor atual. Não exigir `MovimentacoesEntity` nem relações JPA como resposta de uma futura baixa; preferir DTO mínimo ou 204 com adaptação. |
| TL14 — calendário | Fonte opcional lê datas, identidade/configuração do dia, vagas, IDs/nome/horários das atividades e IDs/dados/situação dos alunos. IDs distinguem catálogo, programação e agendamento. | Fonte atual é somente leitura e não está ligada por padrão. Corpos de edição/lote/aprovação não têm consumidor de gravação: podem ser substituídos por status e recarga. Metadados de catálogo só se exibidos no seletor/detalhe. |
| Meus Dados | Leitura atual usa nome/e-mail/telefone. Formulário completo futuro requer os campos efetivamente exibidos e endereço editável, com autorização. | Respostas de PATCH contato/endereço podem ser 204 se houver recarga; não é necessário eco de ID. Nascimento/perfil/CPF pertencem à leitura futura, não à resposta de cadastro. Complemento omitido deve ser preservado no servidor, independentemente de ser devolvido. |
| Recuperação / EcoMigo web | Recuperação precisa de confirmação genérica, sem revelar existência da conta. Chat futuro precisa do texto da resposta; ID de conversa apenas se houver continuidade gerenciada pelo servidor. | `idMensagem`, `autor`, `dataHora` e `atendimentoHumanoSolicitado` são condicionais a histórico/identificação/exibição/encaminhamento implementados. Nenhum desses campos é consumido por HTTP hoje. Não exigir chat web JSON para abrir o WhatsApp. |

TL02/TL07/TL10/TL11/TL12 conservam os contratos existentes descritos na seção 2: token para sessão, dados de consulta para renderização e IDs para ações; gravações 204 já confirmam sucesso sem JSON. Os retornos existentes são documentação de compatibilidade, não uma afirmação de que cada campo é indispensável a todo consumidor.

**Critério para aprovar um novo retorno:** registrar o componente/adaptador que lê cada campo e a ação ou informação que ele viabiliza. Se não houver consumidor, manter como condicional ou usar confirmação por status. Escolher uma estratégia por operação (atualização local com DTO ou recarga após sucesso), implementar o consumidor e validar em execução antes de afirmar que a resposta será utilizada.

### TL04 — Cadastro público | Parcial

**Destino definido:** cadastro pessoal por `POST /tutores`, com endereço. A migração da chamada atual e a persistência precisam ser validadas.

| Classificação / operação | O que é enviado | O que é retornado |
| --- | --- | --- |
| **Definido, ainda não implementado no controller consultado:** `POST /tutores` | JSON ilustrado abaixo, incluindo `endereco` na mesma requisição | Status e DTO **a confirmar**. **Sugestão mínima compatível com o consumidor atual:** 201 com `id`, `nome`, `email`; endereço deve ser persistido, mas não precisa ser devolvido; nunca senha |

**Definido em 06/11/2026:** cadastro inicial cria tutor por `POST /tutores`, enviando os dados obrigatórios do usuário e um objeto `endereco` na mesma requisição. Etapas acumulam dados localmente; somente a conclusão envia o POST. Não criar conta e endereço em chamadas separadas.

**Falta:** migrar a integração para `/tutores`, conectar a coleta/persistência do endereço e verificar o novo DTO e sua resposta. No formulário previsto, CEP, cidade, rua, número e bairro são obrigatórios; complemento é opcional. Confirmar essas regras no contrato novo. Confirmação de senha é local.

**Corpo ilustrativo para `POST /tutores` — estrutura definida, nomes/tipos dos campos a confirmar no DTO:**

```json
{
  "nome": "Maria",
  "sobrenome": "Silva",
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

**Resposta de referência para `POST /tutores` — 201; DTO na nova rota a confirmar:**

```json
{
  "id": 4,
  "nome": "Maria",
  "email": "tutor@example.com",
  "telefone": "11912345678"
}
```

**Segurança e resultado:** o cadastro público cria somente tutor; não oferecer seleção de perfil administrativo. Preservar dados em erro, impedir envio duplicado e redirecionar ao login somente após confirmação do servidor. Confirmar se o novo endpoint persiste usuário/endereço atomicamente e como comunica falhas; não presumir sucesso parcial nem repetir automaticamente após timeout.

Limites anteriores, a reconfirmar nos novos DTOs: nome 60, sobrenome 120, e-mail 150, telefone 20 caracteres; CPF válido com 11 dígitos; senha de tutor entre 6 e 100. No exemplo, número do endereço é texto; suporte a complemento `null` depende do contrato. A proposta anterior de PUT separado para endereço no cadastro foi substituída pelo POST único.

### TL06 — Cadastro e edição de pet | Parcial / edição bloqueada

**Já tem:** `POST /pets/{idTutor}` (201) e `PUT /pets/{idTutor}/{idPet}` (200), ambos com `CadastroPetRequest`. Cadastro básico está conectado.

**Retorno existente:** ambos devolvem `CadastroPetResponse`: `idPet`, `idTutor`, `nome`, `raca`, `sexo`, `castrado`, `dataNascimento`, `observacao`, `relacaoComOutros`, `veterinario`, `telefoneVeterinario`, `convenio`, `medicacoesDoPet`, `vacinasDoPet`, `alergiasDoPet`. As listas retornam objetos de catálogo aninhados: medicação com `emUso`, `dosagem`, `frequencia`; vacina com `dataAplicacao`, `dataValidade`; alergia com seu objeto `alergia`. POST envia `idTutor` no caminho; PUT envia também `idPet`; ambos enviam o JSON abaixo. POST retorna 201 e PUT 200, com o cadastro persistido, não somente um ID.

**Falta:** catálogos de saúde, leitura completa para editar e persistência de `fotoUrl` no backend. O armazenamento local de foto no frontend está implementado conforme abaixo. Frontend bloqueia saúde preenchida e edição para evitar perda de informações. O PUT substitui todas as listas de saúde; lista desconhecida não pode ser enviada como vazia.

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

| Nova rota — todas **sugeridas** | O que é enviado | O que é retornado — sugestão 200 |
| --- | --- | --- |
| `GET /catalogos/vacinas` | Sem parâmetros e sem corpo | `[{"idVacinas":3,"nome":"V10","tipo":"Polivalente"}]` |
| `GET /catalogos/medicacoes` | Sem parâmetros e sem corpo | `[{"idMedicacoes":2,"nome":"Medicamento de exemplo","tipo":"Comprimido"}]` |
| `GET /catalogos/alergias` | Sem parâmetros e sem corpo | `[{"idAlergias":1,"descricao":"Alergia a frango"}]` |
| `GET /pets/{idTutor}/{idPet}` | IDs do tutor e pet no caminho; sem corpo | Objeto com `idPet`, `idTutor`, todos os campos do envio acima e nomes/descrições dos itens de saúde; listas completas, inclusive vazias quando não houver itens |

**Retorno esperado para edição — acréscimo ao objeto acima:** `fotoUrl: string | null`, para preencher “Foto do pet”/“Alterar foto”. POST 201 e PUT 200, quando devolverem `CadastroPetResponse`, devem incluir a referência persistida no mesmo campo. Exemplo de campo adicional: `"fotoUrl":"http://localhost:5173/arquivos/pets/<uuid>.webp"`. A gravação atual confirma pelo `idPet`; a referência no retorno é requisito futuro, não validação já implementada. O envio futuro de edição deve preservar a referência quando não houver troca de foto.

**“Outros” em alergias — sugestão `POST /catalogos/alergias`:**

```json
{ "descricao": "Alergia a determinado produto de limpeza" }
```

Resposta 201:

```json
{ "idAlergias": 5, "descricao": "Alergia a determinado produto de limpeza" }
```

Usar o ID retornado no envio final do pet. Definir permissões/duplicidade e se a descrição é catálogo compartilhado ou informação exclusiva do pet.

**Foto — armazenamento local implementado no frontend:** ao cadastrar com foto, o frontend envia o arquivo binário para `POST /local-api/pet-images` no servidor Vite (não no backend Java), com `Content-Type: image/jpeg`, `image/png` ou `image/webp`. Limite: 5 MB, com verificação de assinatura do arquivo. Arquivos ficam em `frontend/.local-storage/pets/`, ignorada pelo Git, com nomes UUID. Resposta 201:

```json
{ "fotoUrl": "/arquivos/pets/<uuid>.webp" }
```

O frontend converte o caminho em URL absoluta da origem atual (ex.: `http://localhost:5173/arquivos/pets/<uuid>.webp`) e envia **somente `fotoUrl`**, junto dos campos já existentes, no JSON de `POST /pets/{idTutor}`. Não envia arquivo, base64 ou URL `blob:` ao Java e não usa `/pets/{idTutor}/{idPet}/foto`.

**Alteração pendente no backend, sem mudanças de endpoints:** aceitar/persistir `fotoUrl` opcional no `CadastroPetRequest` e devolver esse campo em `CadastroPetResponse`, detalhe e listagem do pet. Resposta esperada continua com `idPet` positivo e os dados do cadastro; acrescentar `"fotoUrl":"http://localhost:5173/arquivos/pets/<uuid>.webp"` quando houver foto. O frontend não exige esse campo na resposta de gravação enquanto o backend não for atualizado; a persistência da referência ainda não está garantida pelo Java atual.

As imagens são servidas por GET/HEAD `/arquivos/pets/<arquivo>` no frontend, com `npm run dev` ou `npm run preview`. Hospedagem estática de `dist` não suporta gravação; produção precisará de armazenamento/servidor próprio. A URL depende da origem/porta do frontend; os arquivos não acompanham clones do Git. Falha no armazenamento impede o envio do cadastro. Falha posterior no cadastro pode deixar arquivo sem pet associado na pasta local. Não há exclusão automática desses arquivos nesta implementação.

### TL05 — Meus Pets | Parcial

**Já tem:** listagem `GET /pets/{idTutor}` e exclusão `DELETE /pets/{idTutor}/{idPet}`, sem corpo. Lista retorna dados resumidos:

**Envio e retorno existentes:** GET envia `idTutor` no caminho e retorna 200 com o array abaixo (`[]` sem pets). DELETE envia `idTutor` e `idPet` no caminho e retorna 204, **sem corpo**.

```json
[{ "idPet": 9, "nome": "Bob", "raca": "Labrador", "sexo": "M", "castrado": true, "dataNascimento": "2020-05-10" }]
```

**Retorno esperado — GET 200 com foto, mantendo os campos atuais:**

```json
[{ "idPet": 9, "nome": "Bob", "raca": "Labrador", "sexo": "M", "castrado": true, "dataNascimento": "2020-05-10", "fotoUrl": "http://localhost:5173/arquivos/pets/<uuid>.webp" }]
```

Sem foto: `fotoUrl: null`; sem pets: `[]`. Acréscimo pendente no DTO e no consumidor dos cartões. DELETE permanece 204 sem corpo.

**Falta:** ligar dias agendados à fonte operacional (`tutorScheduleSource` não criada no App padrão). Edição depende da leitura completa descrita no TL06.

**Consulta a conectar — já existente:** `GET /calendario/tutor/agendamentos?idUsuario=4&ano=2026&mes=11`. **Envia:** `idUsuario`, `ano`, `mes` na query, sem corpo. **Retorna:** 200 com array `[{"data":"2026-11-10","idPet":9,"nomePet":"Bob","servico":"HOTEL","situacaoAgendamento":"AGENDADO"}]`, ou `[]`. O DTO atual **não retorna `idAgendamento`**, necessário para cancelar; não usar `idPet` como substituto.

**Cancelamento existente a conectar:** `PATCH /calendario/agendamentos/15/cancelar?idUsuario=4`. **Envia:** `idAgendamento=15` no caminho e `idUsuario=4` na query, **sem corpo JSON**. **Retorna:** 200 com `{"mensagem":"<mensagem de confirmação do servidor>"}`, não 204.

**Sugestão para viabilizar a ação na lista:** manter a consulta mensal e acrescentar `idAgendamento` em cada objeto retornado (200). O envio continua `idUsuario`, `ano`, `mes` na query, sem corpo. Essa inclusão de campo não existe no DTO atual. Leitura completa e edição sugeridas estão no TL06, com seus respectivos envios/retornos.

Plano vigente não é nova contratação: valida saldo/limite semanal. Cancelamento exige propriedade, data não passada e situação permitida. Vagas/preços são validados pelo servidor.

### TL03 — Agendamento e confirmação | Parcial

**Já tem:** seleção de pets, serviços ativos, disponibilidade, orçamento e contratação:

- `GET /calendario/pets?idUsuario=4`.
- `GET /calendario/servicos?categoria=HOTEL` (também CRECHE/DAYUSE).
- `GET /calendario/disponibilidade?servico=HOTEL&ano=2026&mes=11`.
- `POST /calendario/orcamentos?idUsuario=4` e `POST /calendario/agendamentos?idUsuario=4`.

| Operação **existente** | O que é enviado | O que é retornado |
| --- | --- | --- |
| `GET /calendario/pets` | Query `idUsuario=4`; sem corpo | 200, `[{"idPet":9,"nomePet":"Bob"}]` ou `[]` |
| `GET /calendario/servicos` | Query `categoria=HOTEL` (ou CRECHE/DAYUSE); sem corpo | 200, array com `id`, `nome`, `categoria`, `modalidade`, `frequencia`, `valor` |
| `GET /calendario/disponibilidade` | Query `servico=HOTEL`, `ano=2026`, `mes=11`; sem corpo | 200, array com `data`, `categoriaServico`, `capacidadeTotal`, `vagasDisponiveis` |
| `POST /calendario/orcamentos` | Query `idUsuario=4` e JSON existente abaixo | 200, objeto com `servico`, `modalidade`, `pets` (nomes), `datasUtilizacao` (datas), `valorTotal`; não cria agendamento |
| `POST /calendario/agendamentos` | Query `idUsuario=4` e mesmo JSON existente | 201, `{"valorTotal":300.00,"aguardandoAprovacao":true}`; não retorna IDs dos agendamentos |
| `POST /calendario/planos/agendamentos` | Query `idUsuario=4`, JSON com `idsPet:[9]`, `datasUtilizacao:["2026-11-10"]`; DTO compartilhado, `idServico`/`dataInicioPlano` não representam nova contratação nesse fluxo | 201, objeto com `pets` (nomes), `datas` (datas), `saldos` (objetos com `pet`, `inicioSemana`, `usados`, `restantes`) e `aguardandoAprovacao` |
| Consulta mensal / cancelamento | Parâmetros e ausência de corpo descritos no TL05 | 200 com array mensal / 200 com objeto `mensagem`, conforme TL05 |

**Retorno esperado — pets disponíveis para seleção, GET `/calendario/pets` 200:**

```json
[{ "idPet": 9, "nomePet": "Bob", "fotoUrl": "http://localhost:5173/arquivos/pets/<uuid>.webp" }]
```

Adicionar `fotoUrl: string | null` ao DTO atual para a foto dos pets selecionados no protótipo. Array vazio continua `[]`. Orçamento e confirmação reutilizam essa consulta para as imagens; seus retornos atuais não precisam mudar.

**Envio existente — serviço por dia:**

```json
{ "idServico": 1, "idsPet": [9], "datasUtilizacao": ["2026-11-10", "2026-11-11"], "dataInicioPlano": null }
```

**Alteração desejada / sugestão, não contrato existente:** retirar a contratação de plano desta tela. A estrutura abaixo propõe datas com indicador de feriado; o DTO atual recebe `List<LocalDate>` (strings), não objetos. **Envia:** query `idUsuario=4` e JSON proposto para orçamento/criação nas mesmas rotas, caso sejam adaptadas. **Retorna, sugestão:** orçamento 200 com `servico`, `modalidade`, `pets`, `datasUtilizacao` no novo formato e `valorTotal`; criação 201 com `valorTotal` e `aguardandoAprovacao`. Preço e feriados devem ser validados pelo servidor.
```json
{ "idServico": 1, "idsPet": [9], "datasUtilizacao": [{"data":"2026-11-10", "eFeriado":false}, {"data":"2026-11-11", "eFeriado":false}] }
```

Para contratação de modalidade Hotel, informar apenas as `datas`; backend calcula preço novamente para validação. Confirmação deve respeitar `aguardandoAprovacao` retornado, sem anunciar aprovação indevida.

**Falta:** ligar consulta mensal e cancelamento. Os endpoints existem, mas a consulta precisa fornecer `idAgendamento`. **Regra desejada:** cancelar somente até 24h antes; o contrato atual documenta bloqueio de datas passadas, não comprova essa antecedência. Definir horário de referência e implementar a regra no servidor.

**Alternativa sugerida para solicitação de hotel, não envio existente:** adaptar `POST /calendario/agendamentos?idUsuario=4` para receber categoria em vez de `idServico`. **Envia:** query `idUsuario` e JSON abaixo. **Retorna, sugestão:** 201 com `valorTotal` e `aguardandoAprovacao`. Escolher entre esta alternativa e a proposta com `idServico`; não usar ambas como contratos já disponíveis.

```json
{ "idsPet": [9], "datasUtilizacao": [{"data":"2026-11-10", "eFeriado":false}, {"data":"2026-11-11", "eFeriado":false}], "servico": "HOTEL" }
```

### TL15 — Gestão de funcionários: listagem, criação, edição e situação | Pendente

**Destino definido (não integrado à tela):** rotas específicas de monitores e administradores. Os contratos consultados antes da migração são referência; disponibilidade e DTOs nas novas rotas precisam ser verificados. Criação inclui endereço no mesmo payload.

| Operação **definida por perfil — disponibilidade a confirmar** | O que é enviado | O que é retornado |
| --- | --- | --- |
| `GET /monitores` / `GET /administradores` | Sem parâmetros e sem corpo | Referência: 200, array com `id`, `nome`, `email`, `telefone`; monitor acrescenta **`dataRegistro`**. Lista vazia no contrato anterior: 204 sem corpo |
| `GET /monitores/{id}` / `GET /administradores/{id}` | `id` no caminho; sem corpo | Referência: 200, objeto com os mesmos campos da listagem do perfil |
| `POST /monitores` / `POST /administradores` | JSON com `nome`, `email`, `cpf`, `telefone`, `senha`, `endereco` | Sugestão: 201; campos mínimos conforme auditoria; nunca senha |
| `PUT /monitores/{id}` / `PUT /administradores/{id}` | `id` no caminho e JSON com `nome`, `email`, `cpf`, `telefone`, `senha`; revisão de semântica pendente | Referência: 200, objeto atualizado com os campos de leitura do perfil |
| `DELETE /monitores/{id}` / `DELETE /administradores/{id}` | `id` no caminho; **sem corpo** | Referência: 204, **sem corpo**; exclusão não é ativação/desativação |

**Sugestões de leitura:** `GET /monitores` / `GET /administradores` enviam nenhum parâmetro/corpo e retornam 200 com array de `id`, `nome`, `email`, `telefone`, `perfil`, `ativo`, `dataCadastro` (`[]` se vazio). `GET /monitores/{id}` / `GET /administradores/{id}` enviam `id` no caminho, sem corpo, e retornam 200 com um desses objetos; acrescentar CPF/endereço somente em leitura autorizada. Esses campos adicionais e novas rotas não existem nos contratos atuais.

**Definido em 06/11/2026:** três endpoints de criação por perfil, todos com dados obrigatórios do usuário e objeto `endereco` no mesmo corpo:

| Perfil | Criação | Local de cadastro |
| --- | --- | --- |
| Tutor | `POST /tutores` | Cadastro público inicial (TL04) |
| Monitor | `POST /monitores` | Botão “Adicionar monitor” na gestão de funcionários administrativa |
| Administrador | `POST /administradores` | Botão “Adicionar administrador” na gestão de funcionários administrativa |

O perfil é determinado pela rota. O novo requisito de endereço aplica-se aos três POSTs; não implica alteração automática dos contratos de PUT/PATCH. A análise anterior identificou senha de monitor de 6 a 255 caracteres; reconfirmar limites e campos específicos nos novos DTOs.

**Falta:** implementar os dois botões de criação de funcionários e conectar cada formulário ao POST correto com endereço aninhado; verificar DTOs, respostas e autorização administrativa. Permanecem pendentes listagem/ações reais, CPF/situação/dados completos na leitura, edição sem exigir senha e ativação/desativação reversível. Tutor/administrador retornam `id`, `nome`, `email`, `telefone` e monitor acrescenta `dataRegistro` no DTO atual; `dataCadastro` é nome sugerido para o contrato futuro. Os botões de criação desta tela são para monitores e administradores; tutor é criado no cadastro público.

**Criação definida:** “Adicionar monitor” envia `POST /monitores`; “Adicionar administrador” envia `POST /administradores`. **Envia:** JSON com `nome`, `email`, `cpf`, `telefone`, `senha`, `endereco` (campos do TL04), adaptando validações ao DTO de cada perfil. **Retorno definido:** códigos e corpos ainda precisam ser verificados. **Retorno sugerido:** 201, objeto com `id`, `nome`, `email`, `telefone`, `perfil`, `ativo`, `dataCadastro` e `endereco` persistido; sem senha. Uma única requisição por criação, sem PUT posterior de endereço. Manter token da sessão administrativa, loading, prevenção de duplo clique e dados do formulário em erro; confirmar sucesso pelo servidor e atualizar a lista.

**Edição sugerida — `PATCH /monitores/{id}` / `PATCH /administradores/{id}`:** envia `id` no caminho e o JSON abaixo; retorna 200 com o objeto atualizado descrito após o exemplo.

```json
{
  "nome": "Maria Oliveira",
  "email": "novo@example.com",
  "telefone": "11912345678"
}
```

Resposta sugerida 200: objeto atualizado com `id`, dados enviados, `perfil`, `ativo`, `dataCadastro`; CPF apenas em consulta autorizada quando necessário. O contrato de edição de endereço ainda precisa ser definido; não reutilizar a antiga proposta de PUT do cadastro como se estivesse aprovada. Campo omitido é preservado; senha não deve ser fictícia/vazia para satisfazer o PUT atual.

**Situação sugerida — `PATCH /monitores/{id}/situacao` / `PATCH /administradores/{id}/situacao`:** envia `id` no caminho e JSON abaixo.

```json
{ "ativo": false }
```

**Retorno sugerido:** 204, **sem corpo**.

Usar `true` para reativar. DELETE atual chama `deleteById`, não equivale a desativação reversível. Listagem sugerida deve devolver `id`, `nome`, `email`, `telefone`, `perfil`, `ativo`, `dataCadastro`; pode retornar 204 quando vazia no contrato atual.

**Exclusão nas rotas por perfil — `DELETE /monitores/{id}` / `DELETE /administradores/{id}`:** envia somente `id` no caminho, **sem corpo** (não enviar `{"deletado":true}`). Retorna, por sugestão, 204 **sem corpo**; 409 se houver vínculo impeditivo. É uma operação distinta da situação reversível; disponibilidade a confirmar.

### TL16 — Clientes e vínculos de planos | Pendente

**Já tem:** entidades de contrato e contratação pelo agendamento do tutor. Essa contratação não recebe preço negociado, fim manual ou diárias arbitrárias.

**Envio/retorno existentes:** `POST /calendario/agendamentos?idUsuario=4` envia `idUsuario` na query e `OrcamentoRequest` do TL03 (`idServico`, `idsPet`, `datasUtilizacao`, `dataInicioPlano`); retorna 201 com `valorTotal` e `aguardandoAprovacao`, **não** o objeto administrativo abaixo. Não foi identificado CRUD administrativo de contratos; entidades não constituem um contrato HTTP de leitura/edição.

**Falta:** listagem administrativa, busca, criação/edição de vínculo e ativação/desativação. Tela permanece ilustrativa, sem identidade operacional.

**Envio sugerido — `POST /contratos` / `PUT /contratos/{idContrato}`:**

POST envia o JSON abaixo sem ID no caminho; PUT envia também `idContrato` no caminho. Os retornos sugeridos são, respectivamente, 201 e 200 com o objeto completo abaixo.

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

| Operação **existente** | O que é enviado | O que é retornado |
| --- | --- | --- |
| `GET /dashboard/servicos` | Sem parâmetros e sem corpo | 200, array com `idServico`, `nome`, `categoria`, `modalidade`, `frequencia`, `valor`, `status` |
| `GET /calendario/servicos` | Query `categoria=CRECHE`; sem corpo | 200, array com `id`, `nome`, `categoria`, `modalidade`, `frequencia`, `valor`; somente ativos |

Nenhuma dessas consultas retorna `idPlano` ou `quantidadeDiarias` como no contrato sugerido abaixo.

**Falta:** CRUD de planos/serviços e conexão das ações da tela.

**Envio sugerido — `POST /planos` / `PUT /planos/{idPlano}`:**

POST envia o JSON abaixo sem ID no caminho; PUT envia também `idPlano` no caminho. Retornos sugeridos: POST 201 e PUT 200 com o objeto completo abaixo.

```json
{ "nome": "Creche mensal", "categoria": "CRECHE", "quantidadeDiarias": 8, "valor": 500.00 }
```

**Resposta sugerida — 201/200:**

```json
{ "idPlano": 2, "nome": "Creche mensal", "categoria": "CRECHE", "quantidadeDiarias": 8, "valor": 500.00, "ativo": true }
```

**Consultas sugeridas:** `GET /planos` envia nenhum parâmetro/corpo e retorna 200 com array dos objetos acima (`[]` se vazio); `GET /planos/{idPlano}` envia `idPlano` no caminho, sem corpo, e retorna 200 com um objeto acima.

**Situação sugerida:** `PATCH /planos/{idPlano}/situacao`, envio `{"ativo":false}`; resposta 200 `{"idPlano":2,"ativo":false}`.

**Exclusão sugerida:** `DELETE /planos/{idPlano}`, sem corpo; resposta 204. Com vínculo impeditivo, retornar 409 e preservar registro.

Definir se plano será entidade própria ou representação de `idServico`. “Diárias” da tela não pode ser convertida automaticamente em `frequencia` semanal. Preservar condições dos contratos já firmados.

### TL13 — Dashboard e metas | Parcial

**Já tem:** resumo/gráficos por `GET /dashboard`; serviços por `GET /dashboard/servicos`; consulta/criação/edição de metas conectadas.

| Operação **existente** | O que é enviado | O que é retornado |
| --- | --- | --- |
| `GET /dashboard` | Sem parâmetros e sem corpo | 200, objeto com arrays `kpiReceitas`, `agendamentosPorServico`, `graficoReceita`, `graficoNovosServicos`, `graficoContratosPorServico`, `ultimasMovimentacoes` e objeto `planosAtivos:{"planosAtivos":12}` (quantidade consumida pelo indicador de planos ativos) |
| `GET /dashboard/servicos` | Sem parâmetros e sem corpo | 200, array com `idServico`, `nome`, `categoria`, `modalidade`, `frequencia`, `valor`, `status` |
| `GET /dashboard/metas` | Query `mesReferencia=2026-11-01`, `servico=CRECHE`; sem corpo | 200, array com `idMeta`, `mesReferencia`, `valor`, `servico` (objeto com os campos da consulta de serviços); `[]` sem metas |
| `POST /dashboard/metas` / `PUT /dashboard/metas/{id}` | JSON abaixo; no PUT, também `id` no caminho | **201 em ambos**, objeto com `mesReferencia`, `valor`, `servico` (objeto com os campos acima); o DTO de gravação **não retorna `idMeta`** |

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

Consulta sugerida: `GET /metas?mesReferencia=2026-11&idServico=2`. **Envia:** mês e ID do serviço na query, sem corpo. **Retorna, sugestão:** 200 com array dos objetos de meta acima (`[]` sem metas). POST/PUT sugeridos enviam o JSON proposto; PUT também envia `idMeta` no caminho. O backend define a conversão/persistência do mês, sem exigir que o frontend invente um dia. Manter os endpoints atuais é alternativa, desde que a convenção de data seja acordada.

### TL13 — Registro de receitas | Pendente

**Já tem:** `GET /dashboard/movimentacoes` lista pendências; `PUT /dashboard/movimentacoes/{id}` registra pagamento existente:

**Envio/retorno existentes:** GET não envia parâmetros nem corpo e retorna 200 com array de `id`, `dataRegistro`, `usuario` (nome), `pet` (nome), `servico` (nome), `valor`, `idContrato`. PUT envia `id` da movimentação no caminho e JSON abaixo; retorna 200 com `MovimentacoesEntity`: `idMovimentacoes`, `valor`, `dataRegistro`, `situacao`, `formaPagamento`, `dataPagamento`, `contrato` (entidade aninhada). A serialização completa das relações de `contrato` precisa ser validada em execução; não equivale ao DTO de receita sugerido.

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

| Operação **existente** | O que é enviado | O que é retornado |
| --- | --- | --- |
| `GET /calendario/dias` | Query `mes=2026-11`; sem corpo | 200, array de datas, exemplo `["2026-11-10"]` |
| `GET /calendario/dia` | Query `data=2026-11-10`; sem corpo | 200, `CalendarioDiaResponse`: `idCalendario`, `data`, `vagasCreche`, `vagasHotel`, `atividades`, `alunosAgendados` |
| `GET /calendario/catalogo-atividades` | Sem parâmetros e sem corpo | 200, array com `idAtividadeDoDia`, `idAtividade`, `nome`, `descricao`, `categoria`, `horaInicio`, `horaFim`, `situacao`; campos de programação do dia nulos |
| `PUT /calendario/{data}/vagas` | Data no caminho; JSON `{"vagasCreche":20,"vagasHotel":10}` | 200, `CalendarioDiaResponse` com vagas atualizadas |
| `POST /calendario/{data}/atividades` | Data no caminho; JSON `{"idAtividade":3,"horaInicio":"09:00:00","horaFim":"10:00:00"}` | 201, objeto com `idAtividadeDoDia`, `idAtividade`, `nome`, `descricao`, `categoria`, `horaInicio`, `horaFim`, `situacao` |
| `DELETE /calendario/atividades/{id}` | ID da atividade programada no caminho; sem corpo | 204, sem corpo |

No retorno do dia, `atividades` contém os campos de programação acima; `alunosAgendados` contém `idAgendamento`, `idPet`, `nome`, `raca`, `idade`, `tutor`, `situacao`. Dia não configurado retorna ID nulo, vagas zeradas e atividades vazias.

**Retorno esperado com foto — GET do dia 200 / PUT de vagas 200:** acrescentar `fotoUrl: string | null` a cada item de `alunosAgendados`, preservando todos os campos atuais. Exemplo de aluno: `{"idAgendamento":15,"idPet":9,"nome":"Bob","raca":"Labrador","idade":6,"tutor":"Maria Silva","situacao":"CONFIRMADO","fotoUrl":"http://localhost:5173/arquivos/pets/<uuid>.webp"}`. Foto preenche o espaço “Foto a preencher” do aluno; não pertence ao catálogo de atividades. A coleção vazia continua `[]`. Tipos/valores dos demais campos devem seguir o DTO existente; a única inclusão proposta aqui é `fotoUrl`.

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

| Operação **existente** | O que é enviado | O que é retornado |
| --- | --- | --- |
| `GET /tutores/{id}`, `GET /monitores/{id}`, `GET /administradores/{id}` | ID do usuário no caminho conforme perfil; sem corpo | Referência anterior: 200, `id`, `nome`, `email`, `telefone`; monitor também retorna `dataRegistro`. DTO nas novas rotas a confirmar; referência não retorna CPF, nascimento ou endereço |
| `PUT /tutores/{id}`, `PUT /monitores/{id}`, `PUT /administradores/{id}` | ID no caminho e JSON de referência com `nome`, `email`, `cpf`, `telefone`, `senha` | Referência anterior: 200, objeto atualizado com os mesmos campos de leitura do perfil; não retorna senha. Disponibilidade e semântica nas novas rotas a confirmar |

**Sugestões:** as operações `/tutores/me`, `/monitores/me` e `/administradores/me` abaixo são contratos novos; escolher somente a rota do perfil autenticado. Usuário identificado pelo token, sem enviar ID de usuário na URL ou no JSON. As leituras/edições por ID acima também são destinos da migração, não operações já verificadas nas novas URLs.

**Falta:** formulário completo, CPF/nascimento/perfil/endereço na leitura; contato/endereço editáveis e troca opcional de senha validando a atual. Nome/CPF/nascimento/perfil são somente leitura no protótipo.

**Consulta sugerida:** `GET /tutores/me`, `GET /monitores/me` ou `GET /administradores/me`, conforme perfil; sem corpo, usuário derivado do JWT. Resposta 200:

```json
{
  "id": 4, "nome": "Maria Silva", "cpf": "52998224725", "dataNascimento": "1990-08-15",
  "perfil": "TUTOR", "email": "tutor@example.com", "telefone": "11912345678",
  "endereco": { "cep": "04101000", "cidade": "São Paulo", "rua": "Rua das Flores", "numero": "123", "bairro": "Vila Mariana" }
}
```

Nascimento desconhecido deve ser `null`; sua origem precisa ser definida, não copiada do exemplo visual.

**Envio sugerido de contato — `PATCH /tutores/me`, `PATCH /monitores/me` ou `PATCH /administradores/me`, conforme perfil:**

```json
{
  "email": "novo@example.com", "telefone": "11912345678"
}
```

Resposta 200: contato atualizado, por exemplo `{"id":4,"email":"novo@example.com","telefone":"11912345678"}`.

**Endereço — sugestão `PATCH /tutores/me/endereco`, `PATCH /monitores/me/endereco` ou `PATCH /administradores/me/endereco`, conforme perfil:**

```json
{ "cep": "04101000", "cidade": "São Paulo", "rua": "Rua das Flores", "numero": "123", "bairro": "Vila Mariana" }
```

**Retorno sugerido — 200:** `{"cep":"04101000","cidade":"São Paulo","rua":"Rua das Flores","numero":"123","bairro":"Vila Mariana","complemento":"Apto. 12"}` (endereço persistido). **Envio sugerido:** somente JSON acima e token, sem ID/parâmetros. Complemento não aparece nessa tela: omissão deve preservá-lo. Esta proposta de edição usa a identidade do JWT; não é uma segunda chamada de cadastro. A criação no TL04/TL15 envia endereço junto ao POST por perfil; PATCH de edição preserva campos omitidos.

**Senha — sugestão `PUT /tutores/me/senha`, `PUT /monitores/me/senha` ou `PUT /administradores/me/senha`, conforme perfil:**

```json
{ "senhaAtual": "SenhaAtual123!", "novaSenha": "NovaSenha123!" }
```

Resposta 204, sem corpo. Confirmação local; validar atual, política de senha e revogação de sessões. Protótipo pede 8 caracteres com letras/números, diferente do mínimo 6 atual. Contato, endereço e senha são chamadas distintas: comunicar sucesso parcial e repetir apenas as operações que falharam.

### Recuperação de senha | Pendente

**Já tem:** tela do frontend informando indisponibilidade; não foi identificada tela dedicada no protótipo.

**Envio/retorno existentes:** nenhum; a tela não envia solicitação HTTP de recuperação e não recebe resposta de API. As duas operações abaixo são **sugeridas**, sem parâmetros na URL, enviando somente os respectivos JSONs; status e corpos indicados também são sugestões.

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

**Retorno sugerido:** 204, **sem corpo**. Token com expiração/uso único, diferente do JWT de login; conclusão requer tela futura.

### EcoMigo — assistente web | Pendente

**Já tem:** backend WhatsApp `POST /api/whatsapp/webhook`, parâmetros `From`/`Body`, resposta texto; não é chat web JSON. Há consulta de atendimentos pendentes, sem tela dedicada identificada.

| Operação **existente** (não integrada ao assistente web) | O que é enviado | O que é retornado |
| --- | --- | --- |
| `POST /api/whatsapp/webhook` | Parâmetros `From=whatsapp:+5511912345678` e `Body=Qual o horário de funcionamento?`, via parâmetros/formulário compatíveis com `@RequestParam`; **não JSON de chat web** | 200, texto da resposta do chatbot ou texto de confirmação de solicitação de atendimento humano |
| `GET /api/whatsapp/atendimentos-pendentes` | Sem parâmetros e sem corpo | 200, array com `protocolo`, `remetente`, `mensagem`, `dataHora`, `status` |

**Envio/retorno atuais da tela web:** nenhum HTTP identificado. A proposta abaixo envia somente JSON, sem parâmetros na URL, e retorna o objeto JSON sugerido.

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

### TL02 — Entrar | Migração por perfil pendente

**Destino definido:** `POST /tutores/login`, `POST /monitores/login` ou `POST /administradores/login`, conforme perfil de acesso. Autenticação/encaminhamento já existem no frontend, mas as chamadas específicas e sua disponibilidade no backend precisam ser implementadas/verificadas. Definir como a tela identifica o perfil antes do envio; o servidor deve conferir se a conta pertence ao perfil da rota.

**Envio existente:**

```json
{ "email": "tutor@example.com", "senha": "Senha123!" }
```

**Resposta existente — 200:**

```json
{ "token": "<jwt>" }
```

**Falta:** migrar a chamada de login para a rota do perfil, definir a identificação do perfil na tela e validar execução/expiração nas três rotas. JWT anteriormente documentado com validade de 10 minutos. Claims orientam apresentação, não substituem autorização no servidor.

**Envio/retorno de referência:** manter e-mail/senha no envio e `token` na resposta nas três rotas, sujeitos à confirmação dos novos contratos; não executar login por tentativa sequencial de perfis.

### TL07 — Diário do Pet | Integrada

**Já tem:** consulta diária e histórico:

- `GET /api/diario/{idPet}?data=2026-11-03`.
- `GET /api/diario/{idPet}/historico?data=2026-11-02`.

**Envio existente:** `idPet` no caminho e `data` na query, sem corpo, em ambas as consultas. Data opcional no diário, obrigatória no histórico. **Retorno existente — 200 em ambas:** objeto com `idPet`, `data`, `resumo:{"statusRefeicao":"<status do servidor>","statusEngajamento":"<status do servidor>"}`, `atividades:[{"descricao":"<descrição>"}]`, `medicacoes:[{"nome":"<medicação>","status":"TOMOU"}]`, `observacoes` (texto). Listas vazias sem registros; não são arrays de IDs de catálogo.

**Retorno esperado com foto — 200 em ambas as consultas:**

```json
{
  "idPet": 9,
  "fotoUrl": "http://localhost:5173/arquivos/pets/<uuid>.webp",
  "data": "2026-11-03",
  "resumo": { "statusRefeicao": "Todas as refeições do dia foram concluídas.", "statusEngajamento": "O pet participou em todas as atividades do dia." },
  "atividades": [{ "descricao": "Brincadeiras" }],
  "medicacoes": [{ "nome": "Medicação prescrita", "status": "TOMOU" }],
  "observacoes": "Descansou após as atividades."
}
```

**Falta:** incluir `fotoUrl: string | null` no DTO diário/histórico e adaptar a foto no resumo. Mesmo num dia sem registros, retornar a referência cadastral atual do pet autorizado; listas continuam vazias. O frontend já consulta a listagem do tutor para identificar o pet e pode reutilizar sua `fotoUrl` após atualização do DTO, mas o retorno esperado do diário também explicita a referência. Validar em execução. Tutor não grava registros nessa tela; métodos/rotas permanecem GET.

### TL10 — Feed do Monitor | Integrada

**Já tem:** consultas `GET /feed-monitor/pet/{id}`, `/feed-monitor/pet/{id}/atividades`, `/feed-monitor/pet/{id}/medicacoes`.

| Consulta **existente** | O que é enviado | O que é retornado |
| --- | --- | --- |
| `GET /feed-monitor/pet/{id}` | ID do pet no caminho; sem corpo | 200, objeto com `nome`, `raca`, `nomeTutor`, `observacao` |
| `GET /feed-monitor/pet/{id}/atividades` | ID do pet no caminho; sem corpo | 200, array com `idParticipacaoDoPet`, `nomeAtividade`, `categoriaAtividade`, `situacao`, `observacao` |
| `GET /feed-monitor/pet/{id}/medicacoes` | ID do pet no caminho; sem corpo | 200, array com `idMedicacaoDoDia`, `nomeMedicacao`, **`status`**, `observacao` |

**Envios existentes:**

| Operação **existente** | O que é enviado | O que é retornado |
| --- | --- | --- |
| `PUT /feed-monitor/pet/{idPet}/atividades/{idParticipacao}` | IDs do pet/participação no caminho; JSON `{"situacao":"NAO_PARTICIPOU","observacao":"Pet estava em repouso"}` | 200, objeto com `idParticipacaoDoPet`, `nomeAtividade`, `categoriaAtividade`, `situacao`, `observacao` atualizados |
| `PUT /feed-monitor/pet/{idPet}/medicacoes/{idMedicacao}` | IDs do pet/medicação do dia no caminho; JSON `{"situacao":"NAO_TOMOU","observacao":"Tutor orientou suspender a dose"}` | 200, objeto com `idMedicacaoDoDia`, `nomeMedicacao`, **`status`**, `observacao` atualizados (envia `situacao`, recebe `status`) |
| `POST /feed-monitor/pet/{id}/observacoes` | ID do pet no caminho; JSON `{"observacao":"Pet se alimentou normalmente"}` | 201, `{"observacao":"Pet se alimentou normalmente"}` |

Atualizações retornam 200 com registro; observação retorna 201. Participação: `PARTICIPOU`/`NAO_PARTICIPOU`; medicação: `TOMOU`/`NAO_TOMOU`. Negativas exigem justificativa; observação geral até 200 caracteres. IDs são dos registros diários, não do catálogo.

**Retorno esperado com foto — GET `/feed-monitor/pet/{id}` 200:** `{"nome":"Bob","raca":"Labrador","nomeTutor":"Maria Silva","observacao":"Atenção à alimentação","fotoUrl":"http://localhost:5173/arquivos/pets/<uuid>.webp"}`. Acrescentar `fotoUrl: string | null` na identificação para preencher “Foto de Thor” com o pet real. Consultas/atualizações de atividades, medicações e observações mantêm seus corpos; não repetir foto em cada registro.

**Falta:** incluir a referência no DTO/consumidor da identificação e validar regras de agendamento confirmado do dia em execução. Nenhum endpoint novo necessário.

### TL11 — Check-in / check-out | Integrada

**Já tem:** `GET /checkin-checkout?data=2026-11-03`; `PATCH /checkin-checkout/{id}/check-in` e `/check-out`.

**Consulta existente — envio:** `data` opcional na query, sem corpo (ausente: dia atual em America/Sao_Paulo). **Retorno — 200:** array com `idAgendamento`, `idPet`, `nomePet`, `dataEntrada`, `dataSaida`, `tutorCheckin`, `tutorCheckout`, `pertences`, `racaoMarca`, `quantidade`. **Entrada/saída — envio:** ID do agendamento no caminho e JSON abaixo; **retorno em ambas:** 204, **sem corpo**.

**Envio existente para entrada/saída:**

```json
{ "responsavel": "Maria Silva" }
```

Resposta 204. Responsável obrigatório até 100 caracteres; ID do agendamento, não do pet. Saída exige entrada anterior; repetição/situação incompatível pode retornar 409.

**Falta:** nenhuma integração adicional identificada; validar execução.

**Retorno esperado com foto — GET 200:** acrescentar `fotoUrl: string | null` em cada agendamento, preservando `idAgendamento`, `idPet`, `nomePet`, `dataEntrada`, `dataSaida`, `tutorCheckin`, `tutorCheckout`, `pertences`, `racaoMarca`, `quantidade`. Exemplo de acréscimo no item: `"fotoUrl":"http://localhost:5173/arquivos/pets/<uuid>.webp"`. Necessário para a foto de cada pet previsto; atualizar DTO e consumidor. Sem agendamentos: `[]`; sem foto: `null`. PATCH de entrada/saída continua 204 sem corpo, sem campo de imagem. Nenhum endpoint novo necessário.

### TL12 — Atividades do dia | Integrada

**Já tem:** consulta e atualização de atividades programadas ligadas à API.

| Operação **existente** | O que é enviado | O que é retornado |
| --- | --- | --- |
| `GET /atividades` | Sem parâmetros e sem corpo | 200, objeto com `data`, `atividadesDoDia`; cada atividade contém `idAtividadeDoDia`, `nome`, `descricao`, `categoria`, `horaInicio`, `horaFim`, `situacao`, `grupos`. Cada grupo contém `grupo`, `petsDoGrupo`; cada pet contém `idPet`, `nome`, `idParticipacaoDoPet`, `idAgendamento` |
| `PUT /atividades` | JSON abaixo, sem parâmetros no caminho/query | 204, sem corpo |
| `PUT /atividades/atualizarPets` | JSON array de IDs de **participação**, exemplo `[21,22]`; sem parâmetros na URL | 204, sem corpo; atualiza participações pendentes para `PARTICIPOU` |

**Retorno esperado com foto — GET `/atividades` 200:** manter o objeto/agrupamento atual e acrescentar `fotoUrl: string | null` em `atividadesDoDia[].grupos[].petsDoGrupo[]`. Exemplo de pet do grupo: `{"idPet":9,"nome":"Bob","idParticipacaoDoPet":21,"idAgendamento":15,"fotoUrl":"http://localhost:5173/arquivos/pets/<uuid>.webp"}`. Necessário para “Foto do pet” nos cartões dos grupos; atualizar DTO e consumidor. Sem foto: `null`; coleções vazias permanecem vazias. Os PUTs continuam com os envios atuais e 204 sem corpo. Nenhum endpoint novo necessário.

**Envio existente (`AtualizarAtividadeRequest`):**

```json
{ "situacao": "CONCLUIDA", "idAtividadeDoDia": 7 }
```

ID positivo obrigatório; situações `PENDENTE`, `CONCLUIDA`, `NAO_CONCLUIDA`. Conclusão coletiva não equivale à participação individual do pet.

**Falta:** nenhuma integração adicional identificada; validar execução.

### TL01, TL08, TL09 — Início, Sobre e Estrutura | Conteúdo estático

**Já tem:** conteúdo institucional e navegação.

**Falta:** nenhuma API necessária para o conteúdo atual; não há CMS identificado. **Envio existente:** nenhum HTTP para o conteúdo institucional. **Retorno existente:** nenhum retorno de API; conteúdo local. **Sugestão:** nenhum endpoint proposto; envio e retorno adicionais não se aplicam.

Menus, revisões, confirmações e estados de carregamento/erro não exigem endpoints próprios: devem refletir as operações da tela correspondente.

## 3. Cuidados transversais e referências

### Diretrizes para definir os novos endpoints

- **Pets — alternativa sugerida, não existente:** `POST /pets` envia JSON com `idTutor` e os campos não relacionados às listas de saúde do TL06; retorna 201 com `idPet`, `idTutor` e dados básicos persistidos. `PUT /pets/{idPet}/saude` envia `idPet` no caminho e JSON com `medicacoesDoPet`, `vacinasDoPet`, `alergiasDoPet` do TL06; retorna 200 com `idPet` e as três listas persistidas. Foto envia/retorna conforme TL06. O corpo completo existente é opção de compatibilidade. Definir transação ou progresso parcial para não perder informações entre chamadas. Não adicionar esta separação ao fluxo atual sem implementar os contratos.
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
