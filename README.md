# Site do Soares Porath Advocacia

Site institucional estático (HTML, CSS e JavaScript simples), hospedado no GitHub Pages.

## Para ver o site no computador
1. Monte o site: `powershell -ExecutionPolicy Bypass -File build.ps1 -IncludeDrafts`
2. Abra `docs/index.html` no navegador.

## Estrutura
- `src/`: arquivos-fonte (páginas, estilos, scripts, imagens, dados do escritório). **É aqui que se edita.**
- `build.ps1`: monta `src/` em `docs/` (PowerShell, não precisa instalar nada).
- `docs/`: site pronto, publicado pelo GitHub Pages. Gerado automaticamente, não editar à mão.
- `tests/`: teste da calculadora de rescisão (abrir `tests/calculadora.test.html`).
- `CLAUDE.md`: instruções permanentes do projeto (regras da OAB, decisões, como atualizar).

## Para outro desenvolvedor
Não há dependências nem etapa de instalação. Cada página é um `.html` em `src/pages/` com metadados no topo e marcadores como `{{ROOT}}` e `{{WA}}`, expandidos pelo `build.ps1`. Leia o `CLAUDE.md`: ele traz as regras de publicidade da advocacia (Provimento 205/2021 do CFOAB), que limitam o que pode ser escrito no site.

## Cuidado
O repositório é público. Nunca adicione dados de clientes, documentos internos, propostas, currículos ou conversas.
