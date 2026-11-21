# CLAUDE.md — Site do Soares Porath Advocacia

Instruções permanentes do projeto. Leia inteiro antes de qualquer alteração. Atualize este arquivo sempre que uma decisão nova for tomada.

## O que é
Site institucional do escritório **Soares Porath Advocacia** (advocacia online, atende todo o Brasil; escritório na Av. Nicolas Boer, 399, Perdizes, São Paulo/SP).
Sócios: **Matheus Soares Pereira da Silva** (OAB/SP 534.679) e **Bianca Garcia Porath** (OAB/SP 528.825).
Áreas: Família e Sucessões · Previdenciário · Cível e Consumidor · Direito Educacional · Trabalhista.
O usuário do projeto é **advogado e não programador**: explique em português simples, peça para executar só o que for indispensável.

## Regras de ouro (nunca violar)
1. **Repositório público: nunca** colocar dados de clientes, documentos internos, propostas de honorários, currículos, prints de conversas ou e-mails pessoais. O `.gitignore` bloqueia `.docx/.pdf/.xlsx`, mas o cuidado é seu.
2. **Publicidade da advocacia (Provimento 205/2021 do CFOAB + Código de Ética):**
   - Sem promessa ou garantia de resultado; sem "resultados garantidos", "os melhores", "líderes", comparações ou autoengrandecimento (art. 3º, IV).
   - Sem valores de honorários, descontos, gratuidade ("consulta grátis", "sem compromisso") (art. 3º, I).
   - Sem casos concretos, decisões judiciais ou resultados obtidos; sem depoimentos de clientes sobre casos (art. 4º §2º, 5º §3º, 6º).
   - Sem ostentação de bens ou de estrutura física do escritório (art. 6º).
   - Sem usar logomarca ou símbolos da OAB (art. 5º §2º). Pode usar a logo do escritório.
   - Sem pagar para aparecer em rankings/prêmios (art. 5º §1º). Sem mala direta/captação ativa.
   - Artigos: caráter técnico-informativo; sem clientes, resultados, valores ou gratuidade.
   - Chamadas permitidas: "Falar pelo WhatsApp", "Fale com o escritório". Evitar "especialista" em chamadas (ver decisão abaixo).
   - Texto de lei/jurisprudência: citar só o que for verificável. Na dúvida, marcar `<!-- TODO (sócios): confirmar -->` e avisar.
   - Fonte oficial: https://www.oab.org.br/leisnormas/legislacao/provimentos/205-2021 (conferir também CED arts. 39 a 47 e resoluções do Comitê de Marketing Jurídico).
3. **Não inventar** qualificações, títulos, experiências, formação, números ou depoimentos. Faltou informação: perguntar.
4. **Nada vai ao ar sem aprovação explícita do usuário.** Fluxo: alterar → mostrar prévia → usuário aprova → publicar.

## Redesign (nov/2026): concluído em src/
- Os sócios enviaram um briefing de redesign completo. **Escolhida a Proposta 3 (Contemporâneo e Tecnológico)**. Os protótipos ficam em `propostas/` só como referência. **Em 21/11/2026 o site definitivo foi reconstruído em `src/` no estilo da Proposta 3** (26 páginas): início, Missão/Visão/Valores (com Nossa história), sócios + página de cada sócio (`socios/`), áreas + 6 páginas completas (`areas/`, inclusive `aeronauta-aviacao.html`), calculadora, 6 conteúdos (`artigos/`), contato (mapa carregado só quando o visitante clica), trabalhe conosco + obrigado, privacidade, cuidado com golpes, 404. `escritorio.html` e `aviso-legal.html` foram removidos (substituídos por Missão/Visão/Valores e Cuidado com Golpes).
- Partes reaproveitadas em `src/partials/`: `calculadora.html`, `areas-cartoes.html`, `areas-lista.html`, `area-como-atuamos.html`, `artigo-fim.html` (inseridas com `{{PARTIAL:nome}}`).
- Metadados novos: `@nav` (item do menu ativo), `@wa` (mensagem automática do WhatsApp da página; sem ela vale `mensagemWhatsappPadrao` do `site.json`), `@ogtype`, `@leitura` e `@ordem` (artigos). Marcadores novos: `{{EMAIL}}`, `{{INSTAGRAM}}`, `{{INSTAGRAM_URL}}`, `{{ENDERECO_CURTO}}`, `{{MAPS_EMBED}}`, `{{ARTIGOS_CATEGORIA:Nome}}`, `{{OUTROS_ARTIGOS}}`.
- Imagem de compartilhamento: `assets/img/og-imagem.png` (1200x630).
- **Endereço x Google Maps (verificado em 21/11/2026):** "Av. Nicolas Boer, 399" aparece no Google como **Água Branca, CEP 01140-060** (prédio TIME Jardim das Perdizes). Em 21/11/2026 a Dra. Bianca autorizou trocar o bairro **Lapa → Perdizes** (feito em `site.json`). O botão do mapa aponta para as coordenadas -23.5195894,-46.6795729. CEP continua sem ser publicado.
- Textos com `<!-- TODO (sócios) -->` nos artigos do aeronauta e da cobrança indevida: conferir antes de publicar.
- E-mail oficial confirmado: **soaresporath.adv@gmail.com**. WhatsApp: https://wa.me/5511989443124.
- Pedidos dos sócios: textos justificados (só em blocos largos; estreitos e celular à esquerda), título da home menor, áreas todas do mesmo tamanho, globo com avião na Aviação, calculadora completa na home, página Missão/Visão/Valores, Trabalhe conosco com formulário + PDF enviado ao e-mail, Política de Privacidade e Cuidado com Golpes. Nunca usar "tornar o Direito acessível" (soa barato): usar "descomplicar o Direito".
- Tipografia dos títulos: **Playfair Display (escolhida, "fonte A")**; texto em Inter; nome do logo em Cinzel. Space Grotesk foi rejeitada (informal).
- **Nunca** quebrar palavras com hífen (`hyphens:none`) e nunca usar travessão (– ou —) em textos visíveis; usar vírgula ou reescrever.
- Menu: "Missão, Visão e Valores" (com M, V e V maiúsculos). Subtítulo de seção sempre **embaixo** do título, nunca ao lado.
- **Todo link de WhatsApp abre com mensagem automática** adequada à página (regra em `propostas/shared.js`; mensagem específica via `<body data-wa="...">`). Nenhum link pode abrir a conversa em branco.
- Instagram oficial: **@soaresporath.adv** (https://www.instagram.com/soaresporath.adv/), no rodapé em "Redes sociais".
- Gratidão a Deus **aprovada pelos sócios** (21/11/2026): parágrafo + frase em destaque no fim da Nossa história (`missao-visao-valores.html`) e frase "Somos gratos a Deus por cada passo dessa caminhada." no bloco O escritório da home. Manter.
- Frase de abertura **aprovada pelos sócios**: "Advocacia estratégica para proteger o que é importante para você." ("preparada para o que vem a seguir" foi rejeitada).
- Valores (6): Ética, Técnica, Escuta ativa e empatia, Compromisso, Inovação e tecnologia, Valorização das pessoas (Transparência e Personalização ficam no método ETP). O Trabalhe conosco reflete esses valores.
- Conteúdos: um por área (6). Por enquanto são páginas de prévia com tópicos (`propostas/3-artigo.html?a=...`); os textos completos serão escritos e revisados pelos sócios antes de publicar.
- Áreas de cada sócio (informadas pela Dra. Bianca em 21/11/2026): **Bianca**: Família e Sucessões, Previdenciário, Direito do Aeronauta e da Aviação, Cível e Consumidor (Educacional saiu da lista dela). **Matheus**: Família e Sucessões, Cível e Consumidor, Direito Educacional, Trabalhista (confirmado em 21/11/2026).
- Trajetória (informada pela Dra. Bianca em 21/11/2026): ambos formados em Direito pela **FMU** (2024), aprovados no Exame de Ordem **na primeira tentativa** em 2024 (citar só ano e "primeira tentativa", nada além disso), inscrição OAB/SP em 2025; mais de 6 anos no meio jurídico. **Bianca**: trabalha desde os 14 anos; **supervisora jurídica e advogada** em escritório de advocacia que cresceu até mais de 500 colaboradores (6 líderes, até ~70 pessoas); pós em Psicologia Organizacional e Gestão de Pessoas (PUCRS); cursos de Direito Previdenciário e Direito Civil (Legale Educacional) e de comunicação, desenvolvimento de pessoas/negócios e indicadores (Grupo Acelerador, nome confirmado); foi supervisora de 6 líderes e, ao mesmo tempo, de cerca de 70 pessoas (estagiários, auxiliares, assistentes e analistas jurídicos e advogados); prática em Direito da Aviação. **Matheus**: trabalha desde os 15 anos; atuou **como advogado** em dois escritórios (grande e médio porte), com ampla experiência em audiências, atendimento a clientes e treinamento de equipes (dar ênfase a isso, pedido da Dra. Bianca); experiência em treinamento e desenvolvimento de pessoas; pós (especialização) em Direito do Trabalho (PUCRS), por isso **pode** ser apresentado como "Especialista em Direito do Trabalho" (autorizado pelos sócios em 21/11/2026; título certificado, Provimento 205/2021, art. 3º, III); curso de Direito Civil (Legale Educacional); prática em Direito Educacional; frase dele: "que o cliente entre no jogo sabendo as regras do jogo". Fotos: `src/assets/img/socios/bianca.jpg` e `matheus.jpg`.
- Na história do escritório, **não** usar "os melhores" nem comparações (Provimento 205/2021, art. 3º, IV); usar "escritório com áreas de atuação definidas, e não generalista".
- Páginas de prévia: trajetória de cada sócio (`3-socio-bianca/matheus.html`, com marcos "A preencher") e de cada área (`3-area.html?a=...`).
- Emblema refeito: círculo perfeito, desenho centralizado pelo centro visual (`emblema.png`, `emblema-96.png`, `emblema-192.png`, `monograma-dourado.png`).
- Formulário de currículos: **Google Apps Script** na conta do escritório (`tools/apps-script-curriculos.gs`, instalação em `tools/COMO-INSTALAR-CURRICULOS.md`). O site envia JSON (com o PDF em base64) para a URL do "App da Web"; a URL vai na variável `ENDPOINT` de `3-trabalhe-conosco.html`. O FormSubmit foi testado e descartado: entregava e-mails simples, mas **não entregava o PDF anexo** no plano gratuito.
  - **Instalado em 21/11/2026** na conta soaresporath.adv@gmail.com: projeto Apps Script "Currículos do site", implantação "App da Web" (executar como o escritório; acesso: qualquer pessoa), permissão apenas para enviar e-mails (sem Drive). URL: `https://script.google.com/macros/s/AKfycbwVz97jemp8mvycjqu8zWFw63bxZm-Q3jGVKL8u3Subzsogw-DlSSsT0AXCrgbMILUJHQ/exec` (já em `ENDPOINT`).
  - Ao alterar o script: colar o novo código no editor, salvar e publicar em **Implantar → Gerenciar implantações → editar → Nova versão** (assim a URL não muda).
- Fotos dos sócios: Canva bloqueia download; aguardando `src/assets/img/socios/bianca.jpg` e `matheus.jpg`.

## Decisões já tomadas pelos sócios
- Identidade: **azul-marinho `#17223F` + dourado `#D1B25F`** (dourado-escuro `#917A4B`; `#7A6330` para texto dourado sobre fundo claro). Logo e cores vêm do timbrado do escritório.
- Usar "**Especialista em…**" nas páginas dos sócios, conforme a apresentação do escritório. **Decisão dos sócios** (art. 3º, III do Provimento exige título certificado ou notória especialização comprovável; a OAB pode pedir comprovação — art. 1º §2º). Manter a expressão **só** na página `socios.html` e não nas chamadas/anúncios.
- Direito Educacional é área própria. **Fora do site:** Tributário e Pessoa com Deficiência.
- WhatsApp: (11) 98944-3124. Botão genérico usa o link `https://wa.me/message/MYBUROYWJWOLJ1`; botões por página usam o número com mensagem pronta (`{{WA:texto}}`).
- **CEP ainda não confirmado** (informado 04891-240, mas a Lapa costuma ser 05xxx): não publicar CEP até confirmar.
- Calculadora: mostra o resultado completo (sem travar), com aviso de estimativa e botão de WhatsApp opcional (inclui dados do cálculo só se o visitante marcar). Nada é enviado ou guardado. **Pendente:** consulta à OAB-SP sobre uso de calculadora (Anexo Único do Provimento limita aplicativos que respondem consultas de não clientes) e conferência das regras pelos sócios.
- Contato: WhatsApp, e-mail soaresporath.adv@gmail.com e Instagram (todos publicados). Currículos: formulário do Trabalhe conosco (Apps Script).
- Hospedagem: GitHub Pages (gratuito), sem domínio próprio por enquanto; domínio .com.br no futuro.

## Pendências (atualizar conforme resolvidas)
- [ ] Fotos dos sócios e formação/trajetória (hoje há iniciais no lugar da foto; não inventar biografia).
- [ ] Confirmar lista de serviços por área (há `TODO` nas páginas de área).
- [ ] Conferência das regras da calculadora (`src/assets/js/regras-trabalhistas.js`, campo `conferidoPelosSociosEm`).
- [ ] Confirmar CEP; decidir sobre coworking (Provimento art. 8º) se for o caso.
- [x] Usuário do GitHub: **soaresporath** (`siteUrl` já ajustado para `https://soaresporath.github.io`). Git e GitHub CLI instalados e logados.
- [x] **Publicado em 21/11/2026** ("Pode publicar" da Dra. Bianca): https://soaresporath.github.io (repositório público `soaresporath/soaresporath.github.io`, Pages na pasta `docs/` da `main`, HTTPS ativo, `noindex` = false). Publicado com os 3 trechos `TODO (sócios)` dos artigos e sem a conferência final das regras da calculadora: revisar depois.
- [ ] Revisão dos sócios: `privacidade.html`, `cuidado-com-golpes.html`, textos das 6 áreas (FAQ com citações legais) e os 6 artigos (dois têm `TODO (sócios)`).
- [x] Bairro: Perdizes (autorizado em 21/11/2026). CEP ainda não publicado.
- [ ] Analytics (Search Console; Cloudflare Web Analytics ou GA4 com banner de consentimento) e Perfil da Empresa no Google.

## Como o projeto é organizado
```
src/                 ← EDITE AQUI
  site.json          dados do escritório (nome, telefone, WhatsApp, endereço, siteUrl, noindex)
  partials/          layout.html, header.html, footer.html (valem para todas as páginas)
  pages/             uma página por arquivo .html (index, escritorio, socios, areas/, artigos/, ...)
  assets/            css/style.css, js/, img/ (logo, emblema, monograma, favicon)
build.ps1            monta src/ → docs/ (PowerShell, sem instalar nada)
docs/                ← GERADO. Nunca editar à mão. É o que o GitHub Pages publica.
tests/               calculadora.test.html (abrir no navegador; tudo deve ficar verde)
CLAUDE.md / README.md
```
Cada página começa com metadados: `<!--@title: ...-->`, `<!--@description: ...-->`, opcionalmente `@scripts`, `@noindex`, `@draft`.
Marcadores: `{{ROOT}}` (caminho relativo), `{{WA}}` (WhatsApp geral), `{{WA:mensagem}}` (WhatsApp com texto pronto), `{{TELEFONE}}`, `{{ENDERECO}}`, `{{MAPS}}`, `{{NOME}}`, `{{ANO}}`.
Links internos sempre com `{{ROOT}}arquivo.html` (com `.html`, para funcionar também abrindo o arquivo direto).

## Tarefas comuns
- **Montar o site:** `powershell -ExecutionPolicy Bypass -File build.ps1` (prévia, com rascunhos: acrescente `-IncludeDrafts`). A versão para publicar **não** inclui rascunhos.
- **Adicionar artigo:** criar `src/pages/artigos/slug-do-artigo.html` copiando o exemplo; preencher `@title`, `@heading`, `@description`, `@summary`, `@date` (AAAA-MM-DD), `@category`. A lista e a home atualizam sozinhas. Conferir contra o Provimento antes de publicar. Rascunho: `<!--@draft: true-->`.
- **Trocar texto:** editar o arquivo em `src/pages/` (ou `partials/` para cabeçalho/rodapé), montar, conferir a prévia.
- **Nova área de atuação:** copiar uma página de `src/pages/areas/`, ajustar; incluir nos cartões de `index.html`, `areas/index.html` e no rodapé (`partials/footer.html`).
- **Regras da calculadora:** só `regras-trabalhistas.js`; rodar `tests/calculadora.test.html`.
- **Fotos:** colocar em `src/assets/img/` (JPG/WebP, até ~200 KB), com texto alternativo.

## Estado do Git (ambiente do computador do usuário)
- Repositório local já iniciado (branch `main`), com a pasta `.git` **fora do OneDrive** (`C:\Users\soare\git-repos\soares-porath-site.git`; a pasta do projeto tem só um arquivo `.git` apontando para lá). Não mover nem apagar essa pasta.
- Commits usam o e-mail anônimo do GitHub (`...@users.noreply.github.com`), nunca e-mail pessoal.
- Remoto `origin` = https://github.com/soaresporath/soaresporath.github.io (público). A `main` publicada começou limpa, com 1 commit, em 21/11/2026. O histórico anterior ficou só no computador, no branch local `historico-local`: **nunca enviar esse branch** (contém anotações que não devem ser públicas).
- Para publicar uma alteração: montar sem `-IncludeDrafts`, commit na `main` e `git push` (o `gh auth setup-git` já está configurado). O Pages atualiza em 1 a 2 minutos.
- Anotações internas `<!-- TODO ... -->` são removidas automaticamente pelo `build.ps1` e não aparecem no site publicado.
- Em novas janelas do PowerShell o Git e o `gh` podem não estar no PATH: usar `$env:Path = "C:\Program Files\Git\cmd;C:\Program Files\GitHub CLI;" + $env:Path`.
- Prévia local: `tools/serve.ps1` (porta 8081 pelo `.claude/launch.json`), abrir `/docs/index.html`; para ver rascunhos montar com `-IncludeDrafts` e **depois remontar sem** antes de commitar.

## Publicação (GitHub Pages)
- Repositório público; o Pages publica a pasta **`docs/`** da branch `main`.
- Alterações por **commit** (de preferência em branch + Pull Request), nunca direto no site publicado. Descrever o que mudou em português.
- Antes de publicar: montar sem `-IncludeDrafts`, rodar os testes da calculadora, checar no celular (menu, botão de WhatsApp, calculadora), conferir `noindex`, revisar com o checklist da OAB acima.
- Domínio próprio no futuro: arquivo `docs/CNAME` (o `build.ps1` o preserva) e ajustar `siteUrl`.

## Logo
O logo do site é montado em código (`.brandmark` em `style.css`; HTML em `partials/header.html` e `footer.html`): emblema circular (`assets/img/emblema.png`, com balança e monograma SP) + nome em serifa maiúscula azul + "ADVOCACIA" dourado, centralizados na vertical, com versão `--inverse` para fundo escuro. Essência do logo original mantida (círculo azul, balança dourada, monograma SP, serifa). A fonte do nome é **Cinzel Bold** hospedada no site (`assets/fonts/cinzel-700.woff2`, licença SIL OFL em `assets/fonts/LICENSE-Cinzel-OFL.txt`, não remover); nunca carregar fontes direto do Google (LGPD). `assets/img/logo.png` é o logo original do timbrado (recortado, fundo transparente), guardado como referência.

## Design
Sóbrio e elegante; tipografia serifada nos títulos (Georgia/Times, em linha com o timbrado), sans do sistema no texto; sem vídeos, carrosséis ou animações chamativas; animações só de entrada suave, desligadas com `prefers-reduced-motion`. O conteúdo deve existir sem JavaScript. Dourado sobre fundo claro só em elementos grandes/decorativos (contraste). Mobile primeiro.
