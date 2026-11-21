<#
  Monta o site: le src\ e gera a pasta docs\ (e a pasta que o GitHub Pages publica).
  Nao precisa instalar nada: roda no PowerShell que ja vem com o Windows.

  Uso (na pasta do projeto):
    powershell -ExecutionPolicy Bypass -File build.ps1                 # versao para publicar (sem rascunhos)
    powershell -ExecutionPolicy Bypass -File build.ps1 -IncludeDrafts  # versao de previa (mostra rascunhos)

  Metadados aceitos no topo de cada pagina (comentarios <!--@chave: valor-->):
    title, description, scripts (lista separada por virgula), noindex, draft, nav (item do menu ativo),
    wa (mensagem automatica do WhatsApp desta pagina), ogtype,
    e nos artigos: heading, summary, date (AAAA-MM-DD), category, leitura (minutos).
  Marcadores: {{ROOT}} {{WA}} {{WA:texto}} {{TELEFONE}} {{EMAIL}} {{INSTAGRAM}} {{INSTAGRAM_URL}} {{ENDERECO}}
    {{ENDERECO_CURTO}} {{MAPS}} {{MAPS_EMBED}} {{NOME}} {{ANO}} {{PARTIAL:nome}} {{ARTIGOS_LISTA}}
    {{ARTIGOS_RECENTES}} {{ARTIGOS_CATEGORIA:Nome}} {{OUTROS_ARTIGOS}}
#>
param([switch]$IncludeDrafts)
$ErrorActionPreference = 'Stop'
$root = $PSScriptRoot
$src  = Join-Path $root 'src'
$out  = Join-Path $root 'docs'
$pagesDir = Join-Path $src 'pages'
$partialsDir = Join-Path $src 'partials'
$utf8 = New-Object System.Text.UTF8Encoding($false)

function Read-Utf8($p) { [System.IO.File]::ReadAllText($p, [System.Text.Encoding]::UTF8) }
function Write-Utf8($p, $t) {
  $d = Split-Path $p -Parent
  if (-not (Test-Path $d)) { New-Item -ItemType Directory -Force $d | Out-Null }
  [System.IO.File]::WriteAllText($p, $t, $utf8)
}
function Esc-Attr($s) { if ($null -eq $s) { return '' }; return $s.Replace('&', '&amp;').Replace('"', '&quot;').Replace('<', '&lt;').Replace('>', '&gt;') }
function Json-Str($s) {
  if ($null -eq $s) { $s = '' }
  $sb = New-Object System.Text.StringBuilder
  [void]$sb.Append('"')
  foreach ($ch in $s.ToCharArray()) {
    $c = [int]$ch
    if ($ch -eq '"') { [void]$sb.Append('\"') }
    elseif ($ch -eq '\') { [void]$sb.Append('\\') }
    elseif ($ch -eq '<') { [void]$sb.Append('<') }
    elseif ($c -lt 32) { [void]$sb.Append(' ') }
    else { [void]$sb.Append($ch) }
  }
  [void]$sb.Append('"')
  return $sb.ToString()
}
function Strip-Tags($s) { $t = [regex]::Replace($s, '<[^>]+>', ''); $t = [regex]::Replace($t, '\s+', ' '); return [System.Net.WebUtility]::HtmlDecode($t.Trim()) }

$site   = (Read-Utf8 (Join-Path $src 'site.json')) | ConvertFrom-Json
$layout = Read-Utf8 (Join-Path $partialsDir 'layout.html')
$header = Read-Utf8 (Join-Path $partialsDir 'header.html')
$footer = Read-Utf8 (Join-Path $partialsDir 'footer.html')

# Limpa docs\ (preserva CNAME, usado quando houver dominio proprio)
if (Test-Path $out) { Get-ChildItem $out -Force | Where-Object { $_.Name -ne 'CNAME' } | Remove-Item -Recurse -Force }
else { New-Item -ItemType Directory $out | Out-Null }
Copy-Item (Join-Path $src 'assets') (Join-Path $out 'assets') -Recurse
Write-Utf8 (Join-Path $out '.nojekyll') ''

function Parse-Page($path) {
  $raw = Read-Utf8 $path
  $meta = @{}
  foreach ($m in [regex]::Matches($raw, '<!--@(\w+):\s*(.*?)\s*-->')) { $meta[$m.Groups[1].Value] = $m.Groups[2].Value }
  $body = [regex]::Replace($raw, '<!--@(\w+):\s*(.*?)\s*-->\r?\n?', '')
  # anotacoes internas (TODO, REVISAR...) nao vao para o site publicado
  $body = [regex]::Replace($body, '(?s)[ \t]*<!--\s*(TODO|REVISAR|ATEN|RASCUNHO).*?-->\r?\n?', '')
  return @{ meta = $meta; body = $body }
}

# 1) Le todas as paginas
$pages = @()
Get-ChildItem $pagesDir -Recurse -Filter *.html | ForEach-Object {
  $rel = $_.FullName.Substring($pagesDir.Length + 1).Replace('\', '/')
  $p = Parse-Page $_.FullName
  $isDraft = ($p.meta['draft'] -eq 'true')
  if ($isDraft -and -not $IncludeDrafts) { return }
  $pages += [pscustomobject]@{ rel = $rel; meta = $p.meta; body = $p.body }
}

# 2) Cartoes e listas de artigos (mais recentes primeiro)
function Format-Date($s) { [datetime]::ParseExact($s, 'yyyy-MM-dd', [System.Globalization.CultureInfo]::InvariantCulture).ToString('dd/MM/yyyy') }
$articles = @($pages | Where-Object { $_.rel -like 'artigos/*' -and $_.rel -ne 'artigos/index.html' } | Sort-Object @{ Expression = { $_.meta['date'] }; Descending = $true }, @{ Expression = { $_.meta['ordem'] } })
function Card($a) {
  $slug = $a.rel.Substring('artigos/'.Length)
  $draft = ''
  if ($a.meta['draft'] -eq 'true') { $draft = ' (rascunho)' }
  $leitura = ''
  if ($a.meta['leitura']) { $leitura = ' &middot; Leitura de ' + $a.meta['leitura'] + ' min' }
  "<a class=`"post`" href=`"{{ROOT}}artigos/$slug`" data-reveal><span class=`"chip`"><i></i>$($a.meta['category'])$draft</span><h3>$($a.meta['heading'])</h3><p>$($a.meta['summary'])</p><span class=`"meta`">$(Format-Date $a.meta['date'])$leitura</span></a>"
}
function LinkItem($a) {
  $slug = $a.rel.Substring('artigos/'.Length)
  "<a href=`"{{ROOT}}artigos/$slug`"><small>$($a.meta['category'])</small>$($a.meta['heading'])</a>"
}
$listaTodos = ''
$listaRecentes = ''
$i = 0
foreach ($a in $articles) { $c = Card $a; $listaTodos += $c + "`n"; if ($i -lt 6) { $listaRecentes += $c + "`n" }; $i++ }
$vazio = '<p style="color:var(--mute)">Em breve, novos conte&uacute;dos.</p>'
if ($listaTodos -eq '')    { $listaTodos = $vazio }
if ($listaRecentes -eq '') { $listaRecentes = $vazio }

# 3) Substituicao de marcadores
function Expand($t, $root_, $msgWa) {
  $waLink = $site.whatsappLink + '?text=' + [uri]::EscapeDataString($msgWa)
  $t = $t.Replace('{{ROOT}}', $root_).Replace('{{NOME}}', $site.nome).Replace('{{TELEFONE}}', $site.telefone)
  $t = $t.Replace('{{ENDERECO_CURTO}}', $site.enderecoCurto).Replace('{{ENDERECO}}', $site.enderecoLinha)
  $t = $t.Replace('{{EMAIL}}', $site.email).Replace('{{INSTAGRAM_URL}}', $site.instagramUrl).Replace('{{INSTAGRAM}}', $site.instagram)
  $t = $t.Replace('{{WA}}', $waLink).Replace('{{ANO}}', (Get-Date).Year.ToString()).Replace('{{SITEURL}}', $site.siteUrl)
  $t = $t.Replace('{{MAPS_EMBED}}', $site.mapsEmbed.Replace('&', '&amp;')).Replace('{{MAPS}}', $site.mapsLink.Replace('&', '&amp;'))
  $ev = [System.Text.RegularExpressions.MatchEvaluator]{ param($m) $site.whatsappLink + '?text=' + [uri]::EscapeDataString($m.Groups[1].Value) }
  $t = [regex]::Replace($t, '\{\{WA:([^}]+)\}\}', $ev)
  return $t
}

# 4) Gera cada pagina
foreach ($pg in $pages) {
  $depth = ($pg.rel.ToCharArray() | Where-Object { $_ -eq '/' }).Count
  $r = '../' * $depth
  if ($pg.rel -eq '404.html') { $r = '/' }   # a pagina de erro pode abrir em qualquer endereco: usa caminhos a partir da raiz
  $title = $pg.meta['title']
  if ($pg.rel -ne 'index.html') { $title = "$title | $($site.nome)" }
  $canonPath = $pg.rel -replace 'index\.html$', ''
  $canonical = "$($site.siteUrl)/$canonPath"
  $robots = ''
  if ($site.noindex -or $pg.meta['noindex'] -eq 'true') { $robots = '<meta name="robots" content="noindex, nofollow">' }
  $msgWa = $site.mensagemWhatsappPadrao
  if ($pg.meta['wa']) { $msgWa = $pg.meta['wa'] }
  $ogtype = 'website'
  if ($pg.meta['ogtype']) { $ogtype = $pg.meta['ogtype'] }

  # Dados estruturados (SEO)
  $jsonld = ''
  if ($pg.rel -eq 'index.html') {
    $jsonld = '<script type="application/ld+json">{"@context":"https://schema.org","@type":"LegalService","name":' + (Json-Str $site.nome) + ',"url":"' + $site.siteUrl + '/","logo":"' + $site.siteUrl + '/assets/img/emblema-192.png","image":"' + $site.siteUrl + '/assets/img/og-imagem.png","telephone":"+' + $site.telefoneE164 + '","email":' + (Json-Str $site.email) + ',"areaServed":{"@type":"Country","name":"Brasil"},"address":{"@type":"PostalAddress","streetAddress":' + (Json-Str $site.enderecoRua) + ',"addressLocality":' + (Json-Str $site.enderecoCidade) + ',"addressRegion":"' + $site.enderecoUF + '","addressCountry":"BR"},"geo":{"@type":"GeoCoordinates","latitude":' + $site.latitude + ',"longitude":' + $site.longitude + '},"sameAs":["' + $site.instagramUrl + '"]}</script>'
  }
  if ($pg.rel -like 'artigos/*' -and $pg.rel -ne 'artigos/index.html') {
    $jsonld = '<script type="application/ld+json">{"@context":"https://schema.org","@type":"Article","headline":' + (Json-Str $pg.meta['heading']) + ',"description":' + (Json-Str $pg.meta['description']) + ',"datePublished":"' + $pg.meta['date'] + '","inLanguage":"pt-BR","mainEntityOfPage":"' + $canonical + '","author":{"@type":"Organization","name":' + (Json-Str $site.nome) + '},"publisher":{"@type":"Organization","name":' + (Json-Str $site.nome) + ',"logo":{"@type":"ImageObject","url":"' + $site.siteUrl + '/assets/img/emblema-192.png"}}}</script>'
  }
  $faqs = [regex]::Matches($pg.body, '<details[^>]*>\s*<summary>(.*?)</summary>(.*?)</details>', 'Singleline')
  if ($faqs.Count -gt 0) {
    $items = @()
    foreach ($f in $faqs) { $items += '{"@type":"Question","name":' + (Json-Str (Strip-Tags $f.Groups[1].Value)) + ',"acceptedAnswer":{"@type":"Answer","text":' + (Json-Str (Strip-Tags $f.Groups[2].Value)) + '}}' }
    $jsonld += "`n" + '<script type="application/ld+json">{"@context":"https://schema.org","@type":"FAQPage","mainEntity":[' + ($items -join ',') + ']}</script>'
  }

  $extra = ''
  if ($pg.meta['scripts']) { foreach ($s in $pg.meta['scripts'].Split(',')) { $extra += '<script src="{{ROOT}}assets/js/' + $s.Trim() + '" defer></script>' + "`n" } }

  $body = $pg.body
  # partes reaproveitaveis (ex.: {{PARTIAL:calculadora}})
  $evp = [System.Text.RegularExpressions.MatchEvaluator]{ param($m) Read-Utf8 (Join-Path $partialsDir ($m.Groups[1].Value + '.html')) }
  $body = [regex]::Replace($body, '\{\{PARTIAL:([\w-]+)\}\}', $evp)
  $body = $body.Replace('{{ARTIGOS_LISTA}}', $listaTodos).Replace('{{ARTIGOS_RECENTES}}', $listaRecentes)
  $evc = [System.Text.RegularExpressions.MatchEvaluator]{ param($m)
    $cat = $m.Groups[1].Value
    $sel = @($articles | Where-Object { $_.meta['category'] -eq $cat })
    if ($sel.Count -eq 0) { return '<a href="{{ROOT}}artigos/index.html">Ver todos os conte&uacute;dos</a>' }
    return (($sel | ForEach-Object { LinkItem $_ }) -join "`n")
  }
  $body = [regex]::Replace($body, '\{\{ARTIGOS_CATEGORIA:([^}]+)\}\}', $evc)
  if ($body.Contains('{{OUTROS_ARTIGOS}}')) {
    $outros = @($articles | Where-Object { $_.rel -ne $pg.rel } | Select-Object -First 5)
    $body = $body.Replace('{{OUTROS_ARTIGOS}}', (($outros | ForEach-Object { LinkItem $_ }) -join "`n"))
  }

  $hdr = $header
  $nav = $pg.meta['nav']
  $evn = [System.Text.RegularExpressions.MatchEvaluator]{ param($m) if ($m.Groups[1].Value -eq $nav) { ' aria-current="page"' } else { '' } }
  $hdr = [regex]::Replace($hdr, '\{\{CUR:(\w+)\}\}', $evn)

  $html = $layout.Replace('{{HEADER}}', $hdr).Replace('{{FOOTER}}', $footer).Replace('{{CONTENT}}', $body)
  $html = $html.Replace('{{TITLE}}', (Esc-Attr $title)).Replace('{{DESCRIPTION}}', (Esc-Attr $pg.meta['description'])).Replace('{{ROBOTS}}', $robots)
  $html = $html.Replace('{{CANONICAL}}', $canonical).Replace('{{JSONLD}}', $jsonld).Replace('{{EXTRA_SCRIPTS}}', $extra)
  $html = $html.Replace('{{BODY_WA}}', (Esc-Attr $msgWa)).Replace('{{OGTYPE}}', $ogtype)
  $html = Expand $html $r $msgWa
  if ($html -match '\{\{[A-Z_]+(:[^}]*)?\}\}') { Write-Warning "Marcador nao substituido em $($pg.rel): $($Matches[0])" }
  Write-Utf8 (Join-Path $out $pg.rel) $html
}

# 5) sitemap.xml e robots.txt
$urls = $pages | Where-Object { $_.rel -ne '404.html' -and $_.meta['noindex'] -ne 'true' } | ForEach-Object { $c = $_.rel -replace 'index\.html$', ''; "  <url><loc>$($site.siteUrl)/$c</loc></url>" }
Write-Utf8 (Join-Path $out 'sitemap.xml') ("<?xml version=`"1.0`" encoding=`"UTF-8`"?>`n<urlset xmlns=`"http://www.sitemaps.org/schemas/sitemap/0.9`">`n" + ($urls -join "`n") + "`n</urlset>`n")
if ($site.noindex) { $rb = "User-agent: *`nDisallow: /`n" } else { $rb = "User-agent: *`nAllow: /`nSitemap: $($site.siteUrl)/sitemap.xml`n" }
Write-Utf8 (Join-Path $out 'robots.txt') $rb

Write-Host "Site montado em docs\ com $($pages.Count) paginas. Rascunhos incluidos: $IncludeDrafts. Bloqueado para o Google (noindex): $($site.noindex)"
