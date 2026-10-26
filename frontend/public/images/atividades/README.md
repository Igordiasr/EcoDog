# Imagens das atividades

Armazene aqui as fotos destinadas às atividades da tela Estrutura.

- Use nomes descritivos em minúsculas, sem espaços ou acentos, separados por hífen.
- Exemplos: `socializacao.webp`, `brincadeiras-ao-ar-livre.jpg`, `descanso.jpg`.
- Para várias fotos da mesma atividade: `socializacao-01.webp`, `socializacao-02.webp`.
- Prefira WebP ou JPG para fotos; use PNG quando precisar de transparência.

O Vite disponibiliza estes arquivos em `/images/atividades/<nome-do-arquivo>`.
Não inclua `public` no endereço usado no frontend.

Adicionar um arquivo nesta pasta não altera a tela automaticamente: a imagem
precisa ser referenciada no componente ou nos dados da atividade em uma futura
alteração. Não renomeie nem substitua os arquivos `image-import-*` existentes
em `public/images`, pois eles já são usados por outras telas.
