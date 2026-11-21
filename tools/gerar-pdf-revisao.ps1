<#
  Gera um PDF com todas as paginas do site (prévia para revisão), usando o Edge ou o Chrome ja instalados.
  Uso: powershell -ExecutionPolicy Bypass -File tools\gerar-pdf-revisao.ps1
  Saida: revisao\Revisao-site-Soares-Porath.pdf  (a pasta revisao\ nao vai para o GitHub)
  Obs.: monta o site com rascunhos para o PDF e, no fim, remonta a versao de publicacao (sem rascunhos).
#>
$ErrorActionPreference = 'Stop'
$root = Split-Path $PSScriptRoot -Parent
$utf8 = [System.Text.Encoding]::UTF8
$utf8nb = New-Object System.Text.UTF8Encoding($false)
$cfg = [System.IO.File]::ReadAllText((Join-Path $PSScriptRoot 'revisao-paginas.json'), $utf8) | ConvertFrom-Json

function Esc($s) { [System.Net.WebUtility]::HtmlEncode($s) }

# 1) monta com rascunhos
& powershell -NoProfile -ExecutionPolicy Bypass -File (Join-Path $root 'build.ps1') -IncludeDrafts | Out-Null

# 2) pendencias marcadas nos arquivos-fonte (comentarios TODO / ATENCAO / REVISAR / RASCUNHO)
$pend = ''
Get-ChildItem (Join-Path $root 'src\pages') -Recurse -Filter *.html | ForEach-Object {
  $rel = $_.FullName.Substring((Join-Path $root 'src\pages').Length + 1).Replace('\', '/')
  $txt = [System.IO.File]::ReadAllText($_.FullName, $utf8)
  foreach ($m in [regex]::Matches($txt, '(?s)<!--(?!@)\s*(.*?)\s*-->')) {
    if ($m.Groups[1].Value -match 'TODO|ATEN|REVISAR|RASCUNHO') { $pend += '<li><strong>' + (Esc $rel) + ':</strong> ' + (Esc $m.Groups[1].Value) + '</li>' }
  }
}

# 3) corpo: conteudo de cada pagina
$first = [System.IO.File]::ReadAllText((Join-Path $root 'docs\index.html'), $utf8)
$header = [regex]::Match($first, '(?s)<header class="topo-site".*?</header>').Value
$footer = [regex]::Match($first, '(?s)<footer class="rodape">.*?</footer>').Value
$header = [regex]::Replace($header, '(src|srcset)="assets/', '$1="../docs/assets/').Replace(', assets/', ', ../docs/assets/')
$footer = [regex]::Replace($footer, '(src|srcset)="assets/', '$1="../docs/assets/').Replace(', assets/', ', ../docs/assets/')
$lista = ''
$body = ''
$n = 0
foreach ($p in $cfg.paginas) {
  $n++
  $f = Join-Path $root ('docs\' + $p.arquivo.Replace('/', '\'))
  $h = [System.IO.File]::ReadAllText($f, $utf8)
  $main = [regex]::Match($h, '(?s)<main id="conteudo">(.*?)</main>').Groups[1].Value
  $main = $main.Replace('<details>', '<details open>')
  $main = [regex]::Replace($main, '(src|srcset|href)="(\.\./)*assets/', '$1="../docs/assets/')
  $main = [regex]::Replace($main, ', (\.\./)*assets/', ', ../docs/assets/')
  $lista += '<li>' + (Esc $p.nome) + ' <span style="color:#666">(' + (Esc $p.arquivo) + ')</span></li>'
  $extra = ''
  if ($n -eq 1) { $extra = $header }
  $body += '<section class="pg"><div class="pg-label">P&aacute;gina ' + $n + ' de ' + $cfg.paginas.Count + ' &middot; ' + (Esc $p.nome) + '</div>' + $extra + $main + '</section>'
}

$html = @"
<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>$(Esc $cfg.titulo)</title>
<link rel="stylesheet" href="../docs/assets/css/style.css">
<style>
@page{size:1200px 1700px;margin:0}
*{-webkit-print-color-adjust:exact;print-color-adjust:exact}
html,body{background:#070C1B!important;color:#E8ECF6!important}
.pg{break-before:page}
.pg-label{background:#3a3f4b;color:#fff;font:600 15px system-ui,sans-serif;padding:10px 24px}
.capa{padding:70px 60px;font:17px/1.6 system-ui,sans-serif;color:#E8ECF6}
.capa h1{font-family:Georgia,serif;color:#F0DDA8;font-size:38px}
.capa li{margin-bottom:6px;text-align:left}
.topo-site{position:static!important;display:block!important;margin:16px 0}
.mnav,.wa,.bg,.burger{display:none!important}
.lado aside,.lado-esq aside,.lado-form aside{position:static!important}
.card,.area,.post,.valor,.marco,.demanda,details,.passo,.socio,.chamada{break-inside:avoid}
.sec{padding:48px 0}.topo,.perfil-topo{padding:50px 0 20px}.hero{padding:50px 0;min-height:0}
.faq details{display:block}.faq details>*{display:block}
</style></head><body>
<section class="capa">
<h1>$(Esc $cfg.titulo)</h1>
<p>$(Esc $cfg.intro)</p>
<h2 style="font-size:24px">P&aacute;ginas deste documento</h2><ol>$lista</ol>
<h2 style="font-size:24px">Pend&ecirc;ncias marcadas no c&oacute;digo</h2><ul>$pend</ul>
</section>
$body
<section class="pg">$footer</section>
</body></html>
"@

$outDir = Join-Path $root 'revisao'
New-Item -ItemType Directory -Force $outDir | Out-Null
$htmlPath = Join-Path $outDir 'revisao.html'
[System.IO.File]::WriteAllText($htmlPath, $html, $utf8nb)

# 4) imprime em PDF com o Edge (ou Chrome)
$browser = @('C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe', 'C:\Program Files\Google\Chrome\Application\chrome.exe', 'C:\Program Files (x86)\Google\Chrome\Application\chrome.exe') | Where-Object { Test-Path $_ } | Select-Object -First 1
if (-not $browser) { throw 'Nao encontrei Edge nem Chrome.' }
$pdf = Join-Path $outDir 'Revisao-site-Soares-Porath.pdf'
if (Test-Path $pdf) { Remove-Item $pdf -Force }
$url = 'file:///' + $htmlPath.Replace('\', '/')
$profile = Join-Path $env:TEMP 'perfil-pdf-sp'
$ErrorActionPreference = 'Continue'
& $browser --headless=new --disable-gpu --no-pdf-header-footer --user-data-dir="$profile" --virtual-time-budget=8000 "--print-to-pdf=$pdf" $url 2>&1 | Out-Null
$ErrorActionPreference = 'Stop'
Start-Sleep -Seconds 2

# 5) volta para a versao de publicacao (sem rascunhos)
& powershell -NoProfile -ExecutionPolicy Bypass -File (Join-Path $root 'build.ps1') | Out-Null
if (Test-Path $pdf) { Write-Host ("PDF gerado: " + $pdf + " (" + [math]::Round((Get-Item $pdf).Length / 1KB) + " KB)") } else { Write-Host 'Falhou: PDF nao foi criado.' }
