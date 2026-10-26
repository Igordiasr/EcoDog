# EcoDog Park — Análise e integração entre Front-end e Back-end

## 1. Objetivo

Analise detalhadamente o front-end e o back-end existentes no projeto EcoDog Park para identificar os contratos reais da API e realizar a integração entre as funcionalidades que já possuem suporte suficiente no back-end.

Não comece implementando chamadas indiscriminadamente. Primeiro, compare as duas camadas, identifique as funcionalidades compatíveis, documente as divergências e, em seguida, implemente a integração dos fluxos viáveis.

## 2. Funcionalidades fora do escopo

**Não implemente nem tente integrar, nesta etapa:**
- Login e autenticação.
- Cadastro de usuários.
- Gerenciamento de usuários.
- Gerenciamento de clientes e tutores.
- Gerenciamento de planos e vínculos relacionados a planos.

O back-end dessas funcionalidades ainda não está finalizado. Preserve as interfaces existentes, mas mantenha esses fluxos isolados da integração operacional. Não crie endpoints fictícios, não invente contratos e não simule operações reais como se tivessem sido persistidas.

Essa exclusão não autoriza remover funcionalidades existentes ou alterar seu design.

## 3. Preservação do projeto

- Preserve o design, os componentes, a navegação, as telas e os comportamentos visuais já aprovados.
- Não faça redesign, refatoração ampla ou mudanças de arquitetura sem necessidade direta para a integração.
- Não modifique funcionalidades fora do escopo.
- Preserve alterações preexistentes nos arquivos.
- Não remova validações, proteções ou bloqueios existentes apenas para fazer uma operação funcionar.
- Não introduza dados fictícios em fluxos que passarem a utilizar dados reais.
- Não exponha credenciais, senhas, tokens ou informações sensíveis.
- Não instale dependências sem demonstrar necessidade.
- Não altere configurações de produção sem necessidade e sem explicar o impacto.

## 4. Fase 1 — Análise comparativa

Inspecione o código-fonte atual das duas camadas, incluindo:

### Front-end
- Telas, componentes, formulários e navegação.
- Modelos e interfaces TypeScript.
- Serviços e adaptadores existentes.
- Mocks e dados de demonstração.
- Validações e regras de negócio locais.
- Estados de carregamento, sucesso, vazio e erro.
- Bloqueios de operações e mecanismos de segurança.
- Configuração do Vite e das URLs de API.

### Back-end
- Controllers e rotas realmente implementadas.
- Métodos HTTP e parâmetros exigidos.
- DTOs de entrada e saída.
- Services, repositories e entidades relacionados.
- Relacionamentos entre as entidades.
- Validações, regras de negócio e tratamento de exceções.
- Códigos HTTP e formatos de resposta.
- Dependências entre endpoints e requisitos de persistência.

Não considere um endpoint disponível apenas porque existe uma tela correspondente. Confirme o contrato no código do back-end.

## 5. Fase 2 — Classificação dos módulos

Compare as funcionalidades e classifique cada uma em uma destas categorias:

1. **Pronta para integração:** existe endpoint funcional e o contrato é suficiente.
2. **Integração parcial:** existe endpoint, mas há divergências que precisam ser resolvidas com segurança.
3. **Bloqueada pelo back-end:** falta endpoint, contrato, regra de negócio ou dependência necessária.
4. **Fora do escopo:** pertence a login, cadastro, usuários, clientes/tutores ou planos.

Considere, quando houver suporte real no código, funcionalidades como:

- Cadastro e consulta de pets vinculados a tutores já existentes.
- Consulta e atualização dos dados dos pets.
- Vacinas, alergias, medicações e demais informações de saúde.
- Calendário, disponibilidade e capacidade.
- Reservas e agendamentos.
- Check-in e check-out.
- Participação dos pets nas atividades.
- Dashboard, indicadores e distribuição de dados.
- Catálogos e demais consultas auxiliares.

A lista é apenas um roteiro de investigação. Não presuma que todas essas operações existem ou estejam prontas.

Produza uma tabela com: funcionalidade, tela ou componente, endpoint confirmado, método HTTP, DTOs envolvidos, situação e pendências.

## 6. Fase 3 — Planejamento da integração

Antes de modificar os arquivos, determine:

- Quais serviços do front-end podem ser reutilizados.
- Quais adaptadores precisam ser criados ou ajustados.
- Quais campos precisam ser mapeados entre TypeScript e Java.
- Como tratar datas, fusos horários, enums, IDs e valores monetários.
- Como tratar respostas sem corpo, erros HTTP, validações por campo, conflitos e falhas de rede.
- Quais telas devem ter carregamento, estados vazios, mensagens de erro e atualização dos dados.
- Quais operações dependem de um tutor ou usuário autenticado e, por isso, ainda não podem operar com segurança.
- Quais informações do dashboard podem ser obtidas dos endpoints existentes e quais exigiriam novos contratos.

Não invente endpoints, parâmetros, campos, permissões ou respostas. Se houver incompatibilidade que exija alteração do back-end, documente-a e não altere o back-end para contorná-la.

## 7. Fase 4 — Implementação da integração viável

Após concluir a análise, implemente os fluxos classificados como prontos para integração.

- Utilize os endpoints, métodos HTTP e DTOs efetivamente existentes.
- Centralize as chamadas HTTP nos serviços apropriados, respeitando a arquitetura atual do projeto.
- Evite chamadas HTTP diretamente espalhadas pelas telas.
- Faça o mapeamento entre os modelos da API e os modelos utilizados pela interface quando necessário.
- Implemente tratamento consistente de carregamento, sucesso, ausência de dados e erros.
- Evite submissões duplicadas e atualizações indevidas.
- Atualize a interface com os dados retornados pelo servidor, sem presumir sucesso antes da resposta.
- Substitua mocks por dados reais somente nos fluxos efetivamente integrados.
- Preserve mocks em prévias ou demonstrações que continuarem sem integração, deixando clara sua natureza.
- Não utilize dados fictícios como alternativa silenciosa quando uma chamada real falhar.
- Não remova mecanismos de proteção existentes, incluindo os bloqueios de operações sem identidade operacional.

### Regras para operações dependentes de identidade

Se uma operação precisar identificar o tutor responsável, validar a propriedade de um pet ou confirmar as permissões do usuário, verifique se existe um mecanismo real e seguro para fornecer essas informações.

Se login, autenticação ou autorização ainda não estiverem disponíveis, não invente IDs de usuários, não utilize um usuário fixo e não considere a simples existência de um ID suficiente para autorizar uma operação.

Mantenha essas operações bloqueadas quando não for possível executá-las com segurança. Registre a dependência no relatório.

## 8. Fase 5 — Validação

Execute as validações disponíveis e seguras, incluindo, quando aplicável:

- TypeScript.
- Testes unitários.
- Build do front-end.
- Testes dos serviços e adaptadores.
- Testes de integração em ambiente apropriado.
- Verificação de erros no console e nas requisições, quando for possível testar a aplicação.

Não execute testes que possam apagar, sobrescrever ou comprometer dados reais. Não utilize banco de produção para testes destrutivos.

Não afirme que a integração foi validada se apenas o build ou os testes unitários tiverem sido executados.

## 9. Relatório final obrigatório

Ao concluir, apresente:

1. **Resumo da integração:** o que foi conectado e o que continua bloqueado.
2. **Tabela de correspondência:** telas, serviços, endpoints e DTOs utilizados.
3. **Arquivos alterados:** caminho e motivo de cada alteração.
4. **Mocks substituídos:** onde passaram a ser utilizados dados reais.
5. **Tratamento de erros:** como a interface responde a falhas e respostas inesperadas.
6. **Validações executadas:** comandos e resultados reais.
7. **Pendências do back-end:** contratos, endpoints, regras ou mecanismos de segurança que ainda faltam.
8. **Testes manuais recomendados:** passos para confirmar cada fluxo integrado.
9. **Limitações conhecidas:** funcionalidades que não podem operar por dependerem dos módulos excluídos.

## 10. Critério de conclusão

A integração deve ser considerada concluída apenas para os fluxos efetivamente conectados, testados e compatíveis com o back-end.

Não declare o projeto totalmente integrado se houver módulos importantes bloqueados.

**Comece examinando o código atual das duas camadas. Preserve o que já funciona, implemente somente o que estiver sustentado pelos contratos existentes e documente claramente as pendências que dependem do back-end.**