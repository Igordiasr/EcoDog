# Ajustes transversais — integrações pendentes

## Cadastro de pet

Não havia campo/modelo de convênio nem catálogo de saúde no frontend.
O campo Convênio foi adicionado ao rascunho de apresentação como opcional;
o adaptador de `savePet` precisa mapear esse dado conforme o contrato aprovado.
Não foi criada tabela ou endpoint de convênios.

`App.petHealthCatalogSource` fornece o catálogo normalizado de vacinas,
medicamentos e alergias. A criação de itens utiliza `createItem` do adaptador
somente quando ele estiver disponível. Os tipos são de apresentação, não
estruturas de resposta HTTP. As seleções preservam os nomes no rascunho atual.
Dados de exemplo e inclusão em memória existem apenas na prévia DEV, com aviso.

Aplicação e validade são datas independentes na associação da vacina ao pet.
A validade é opcional enquanto não houver regra de obrigatoriedade aprovada;
quando informada, exige data real e ano com quatro dígitos. Pode estar no futuro.
Não foi presumido prazo de validade por tipo de vacina.

## Agenda de Meus Pets

`App.tutorScheduleSource` utiliza o modelo normalizado de reservas existente.
O adaptador deve fornecer somente reservas autorizadas para a tutora.
Os indicadores são derivados das reservas válidas de Creche, correspondente
ao plano mostrado pela interface atual. Exemplos são exclusivos da prévia.

## Feed e histórico de observações

Não foi encontrado serviço de consulta, modelo de histórico ou persistência
de versões das observações. O estado `monitorSaved` mantém somente o último
rascunho confirmado na sessão; não é um histórico e não sobrevive à recarga.
O contrato de `saveRecord` não foi modificado para inventar histórico.

Proposta para aprovação antes de alterar contratos: o backend deve definir
identidade do registro, vínculo com pet/agendamento/data, autoria real e regra
de versionamento ou imutabilidade. Depois poderá expor consulta autorizada das
observações anteriores. Não presumir exclusão ou sobrescrita do histórico.

Alimentação, participação em atividades, medicações e observações gerais
continuam em categorias e chaves independentes; alimentação não substitui o
conjunto de atividades do pet.

## Check-in → Feed

O acesso reutiliza `/monitor/feed` e as permissões existentes. Como os cards
atuais são derivados do protótipo, o contexto disponível é o nome ilustrativo
do pet, exibido como tal no feed. Não foram usados IDs visuais como IDs reais.
O vínculo definitivo por pet e agendamento depende da identificação fornecida
pelo backend; não se deve registrar informações reais usando esses exemplos.
