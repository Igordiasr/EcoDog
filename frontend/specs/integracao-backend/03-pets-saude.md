# SPEC-03 — Pets, cadastro, edição e saúde

**Prioridade:** P3. **Telas:** TL05/TL06. **Gate:** SEC-01 (tutor/propriedade); demais gates por operação abaixo.

## Execução localizada

- Ler `src/services/pet-draft.ts`, `src/services/pet-validation.ts` e `src/services/pet-health-catalog.ts`; criar `src/services/pets-api.ts`. Na UI consultar `src/design/pet-health.ts`, `src/components/PetField.tsx`, `PetAllergies.tsx` e `PetCatalogDialog.tsx` apenas conforme campo alterado; handlers TL05/TL06 em `src/screens/ScreenPage.tsx` por busca.
- Ordem: lista e IDs → mapear rascunho/validação → registrar decisões PET-01/02 → preparar cadastro → edição/exclusão somente com gates próprios. Lista não é fonte completa para edição; não carregar `petEdit.json` para obter dados.
- Criar `tests/pets-api.test.ts`; executar `npm test -- tests/pets-api.test.ts tests/pet-draft.test.ts tests/pet-validation.test.ts tests/pet-health-catalog.test.ts` e `npm run test:e2e -- tests/e2e/pets.spec.ts tests/e2e/pet-registration.spec.ts`.
- Auditoria pontual: `../backend/src/main/java/br/com/ecodogpark/backend/controller/TutorController.java`; localizar `CadastroPetRequest` e DTOs de saúde somente para decisões pendentes. Catálogos inexistentes são bloqueios, não tarefa de busca por nome no design.

## Contratos publicados

| Operação | Endpoint | DTO | Sucesso/erros declarados |
|---|---|---|---|
| Listar | GET `/pets/{idTutor}` | `PetParaListaResponse[]` | 200 lista inclusive vazia; 404 |
| Cadastrar | POST `/pets/{idTutor}` | `CadastroPetRequest` → `CadastroPetResponse` | 201; 400/404/409 |
| Editar | PUT `/pets/{idTutor}/{idPet}` | Mesmo request/response | 200; 400/403/404 |
| Excluir | DELETE `/pets/{idTutor}/{idPet}` | Sem corpo | 204; 403/404 |

GET de lista só traz `idPet`, `nome`, `raca`, `sexo`, `castrado`, `dataNascimento`. Não contém saúde, observações, veterinário/convênio, foto, plano ou estado completo de edição. Não existe GET de detalhe de pet neste grupo publicado.

## Mapeamento do cadastro

| Origem do formulário/rascunho | `CadastroPetRequest` | Regra |
|---|---|---|
| `nome`, `raca` | mesmos campos | Não vazios, máximo 100 |
| `sexo` | `sexo` | M/F explícitos; backend valida comprimento 1, não enum |
| `castrado` Sim/Não | `castrado` boolean | Não usar `Boolean('Não')` |
| `nascimento` | `dataNascimento` | Data válida e estritamente passada (`@Past`) |
| Observação do pet | `observacao` | Não vazia, máximo 200; confirmar campo real do formulário |
| `relacionamento-com-outros-pets` | `relacaoComOutros` | Não vazio, máximo 100 |
| `veterinario`, `contato` | `veterinario`, `telefoneVeterinario` | Ambos não vazios; telefone conforme regra aprovada |
| `convenio` | `convenio` boolean | Obrigatório no backend; rascunho atual trata como opcional |
| `vacinas` | `vacinasDoPet` | Associações identificadas com aplicação e validade |
| `medicamentos` | `medicacoesDoPet` | Associações identificadas com frequência/dosagem/emUso |
| `allergies` | `alergiasDoPet` | IDs reais, não texto livre como identidade |

Todos os campos acima são requeridos no schema, incluindo as três listas. Listas vazias podem representar ausência **confirmada** de associações; nunca completar com `[]` um estado de edição desconhecido. Java exige texto não branco em observação/relacionamento/veterinário/telefone, requisito mais forte que alguns limites exibidos no OpenAPI.

**Gate PET-01:** harmonizar campos obrigatórios/opcionais com produto/backend sem inserir “Sem observação”, dados veterinários falsos ou `convenio=false` como resposta presumida. Reutilizar `createPetDraft`, `validatePetForm` e etapas mobile; integração deve mapear DTO, não enviar rascunho inteiro.

## Saúde e catálogos

Schemas aninhados existentes:

- Vacina: `{ vacina: VacinasEntity, dataAplicacao, dataValidade }`; identidade da entidade: `idVacinas`.
- Medicação: `{ medicacao: MedicacoesEntity, frequencia, dosagem, emUso }`; identidade: `idMedicacoes`.
- Alergia: `{ alergia: AlergiasEntity }`; identidade: `idAlergias`.

Não há endpoint publicado de consulta/criação de catálogo de vacinas, medicações ou alergias. Objetos embutidos no cadastro não equivalem a CRUD desses catálogos. O OpenAPI expõe entidades, não requests simples de ID.

**Gate PET-02:** definir origem autorizada dos catálogos e aceitar referências identificadas no request. Confirmar se somente `{ idVacinas }`/`{ idMedicacoes }`/`{ idAlergias }` basta no binding/validação; não assumir a partir do schema. `MedicacoesEntity.nome` aparece obrigatório. Não inventar endpoints ou enviar entidades completas controladas pelo usuário sem regra de servidor.

- Evoluir seleções de `PetHealthCatalogSource` para conservar ID além do rótulo; não resolver nomes duplicados por primeira ocorrência.
- “Outros” com descrição exige persistência de catálogo/associação aprovada; manter inclusão operacional bloqueada enquanto não houver contrato.
- `dataAplicacao`/`dataValidade` são datas independentes. Validade é opcional no modelo visual; confirmar nulabilidade e constraints reais antes de gravar. Não calcular prazo padrão por vacina.
- Frequência textual não define agenda de doses nem horários. Dosagem e `emUso` devem vir de escolhas explícitas.

## Fluxos por operação

**Lista:** adaptador planejado `src/services/pets-api.ts`; montar cards reais e ações por `idPet`. GET 200 `[]` usa estado “Nenhum pet cadastrado”; 404 não é tutor sem pets. Meus Planos/Meus Dados permanecem excluídos.

**Cadastro:** enviar uma única operação de cadastro; esperar resposta 201 para navegar a TL05 e recarregar lista. Service local não tem transação envolvendo pet + três gravações de saúde e listas não possuem `@Valid` em cascata. **Gate PET-03:** consistência/validação transacional comprovada; falha de saúde não deve deixar cadastro parcial. Não orquestrar quatro gravações no frontend.

**Edição:** abrir registro correto com consulta completa autorizada. Response de cadastro/edição é completo, mas cache da sessão não substitui consulta fresca para edição após recarga. **Gate PET-04:** GET completo ou contrato de atualização parcial seguro; até lá manter editar bloqueado. PUT atual exclui/recria associações: não enviar formulário da lista nem seed do JSON. Verificar concorrência para não sobrescrever alterações de outro cliente.

**Exclusão:** modal identifica pet selecionado; DELETE só após confirmação. Não excluir planos/histórico via outras chamadas. **Gate PET-05:** política de retenção RF-042 e vínculos existentes confirmada no backend; teste com pet vinculado em base isolada. Não presumir que exclusão de pet possa apagar histórico essencial.

**Foto:** request não tem campo/upload. Preservar preview local identificado; não enviar `File` no JSON nem informar foto persistida. Definir contrato separado antes de habilitar upload real.

## Estados e critérios de aceite

Usar painel `YTBAv`: validação por campo, salvando, cadastro/edição confirmada, falha com rascunho preservado; mobile retorna à etapa do erro.

1. Editar Mel nunca abre Thor; nomes homônimos não conflitam com IDs.
2. Castrado/convênio “Não” geram `false`; sexo/data/listas seguem contrato.
3. Cadastro inválido não é enviado; erro 400 mapeia apenas campos conhecidos.
4. Edição não apaga saúde desconhecida; gravação parcial/concorrente é bloqueada pelos gates.
5. Exclusão 204 remove card após recarga; 403 preserva e nega; nenhuma operação apaga histórico protegido.
6. Prévia continua local e foto/catálogo inexistente não gera sucesso falso.

**Testes planejados:** `tests/pets-api.test.ts`, regressões de pet validation/draft, E2E cadastro/edição/lista com IDs reais de fixture; teste real protegido após PET-01–05 aplicáveis.
