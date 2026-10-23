# dev_dashboard
Campitelli - Controle de PRs e demandas

## Checks dos Pull Requests

Os checks exibidos nos detalhes do PR combinam as APIs de check runs e de status
do commit no GitHub, incluindo todas as paginas. Para cada contexto de status,
somente o resultado mais recente e considerado, evitando mostrar falhas antigas
que ja foram corrigidas.

## Minhas Demandas

As demandas sao agrupadas pelo nome original do campo Board Column do Azure.
Os grupos mostram a contagem dos itens apos os filtros, mantendo os mais
recentemente atualizados primeiro em cada grupo. Itens sem Board Column ficam
no grupo "Sem coluna informada".

O painel ocupa o espaco disponivel da tela, com rolagem interna, e diminui
quando "Meus Bugs por Modulo" e expandido. O estagio generico nao e exibido
nos cards nem oferecido como filtro; os grupos usam a coluna original do Azure.

## Publicar no GitHub Pages

Este projeto ja esta preparado para deploy automatico no GitHub Pages via GitHub Actions.

### 1) Suba o projeto para o GitHub

Crie o repositorio e envie o codigo para a branch `main`.

### 2) Ative o Pages para usar GitHub Actions

No repositorio no GitHub:

1. Abra **Settings** > **Pages**.
2. Em **Build and deployment**, selecione **Source: GitHub Actions**.

### 3) Faça push na `main`

Todo push na `main` dispara o workflow [deploy-pages.yml](.github/workflows/deploy-pages.yml), que:

1. Instala dependencias com pnpm.
2. Gera build com base path correto para o nome do repositorio.
3. Publica automaticamente no GitHub Pages.

### 4) Acesse o link publicado

URL final (repositorio comum):

`https://SEU_USUARIO.github.io/NOME_DO_REPOSITORIO/`

Exemplo:

`https://campitelli.github.io/dev_dashboard/`

Se o repositorio for `SEU_USUARIO.github.io`, a URL sera na raiz:

`https://SEU_USUARIO.github.io/`
