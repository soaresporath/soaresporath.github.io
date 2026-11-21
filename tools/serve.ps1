<#
  Servidor local SÓ para pré-visualizar o site no seu computador (não vai para a internet).
  Uso: powershell -ExecutionPolicy Bypass -File tools\serve.ps1
  Depois abra http://localhost:8080/docs/index.html
#>
param([int]$Port = 8080)
$root = Split-Path $PSScriptRoot -Parent
$mime = @{ '.html'='text/html; charset=utf-8'; '.css'='text/css; charset=utf-8'; '.js'='application/javascript; charset=utf-8'; '.json'='application/json'; '.png'='image/png'; '.jpg'='image/jpeg'; '.jpeg'='image/jpeg'; '.webp'='image/webp'; '.svg'='image/svg+xml'; '.xml'='application/xml'; '.txt'='text/plain; charset=utf-8'; '.ico'='image/x-icon' }
$l = New-Object System.Net.HttpListener
$l.Prefixes.Add("http://localhost:$Port/")
$l.Start()
Write-Host "Servindo $root em http://localhost:$Port/  (Ctrl+C para parar)"
while ($l.IsListening) {
  $ctx = $l.GetContext()
  try {
    $rel = [uri]::UnescapeDataString($ctx.Request.Url.AbsolutePath).TrimStart('/')
    if ($rel -eq '') { $rel = 'docs/index.html' }
    $full = [System.IO.Path]::GetFullPath((Join-Path $root $rel))
    if (-not $full.StartsWith($root)) { $ctx.Response.StatusCode = 403 }
    else {
      if (Test-Path $full -PathType Container) { $full = Join-Path $full 'index.html' }
      if (Test-Path $full -PathType Leaf) {
        $ext = [System.IO.Path]::GetExtension($full).ToLower()
        $ct = $mime[$ext]; if (-not $ct) { $ct = 'application/octet-stream' }
        $bytes = [System.IO.File]::ReadAllBytes($full)
        $ctx.Response.ContentType = $ct
        $ctx.Response.ContentLength64 = $bytes.Length
        $ctx.Response.OutputStream.Write($bytes, 0, $bytes.Length)
      } else { $ctx.Response.StatusCode = 404 }
    }
  } catch { $ctx.Response.StatusCode = 500 }
  $ctx.Response.Close()
}
