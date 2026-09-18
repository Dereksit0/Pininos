<#
  Servidor estático local para revisar el sitio sin instalar nada.
  Útil en Windows sin Node ni Python.

  Uso:   powershell -ExecutionPolicy Bypass -File serve.ps1
  Luego: abrir http://localhost:8080/   ·   detener con Ctrl+C

  Hace falta un servidor (y no abrir index.html directamente) porque el
  iframe del mapa de Google no carga desde file://.
#>
param([int]$Puerto = 8080)

$ErrorActionPreference = 'Stop'
$root = $PSScriptRoot

$mime = @{
  '.html'='text/html; charset=utf-8'; '.css'='text/css; charset=utf-8'
  '.js'='application/javascript; charset=utf-8'; '.svg'='image/svg+xml'
  '.mp4'='video/mp4'; '.webp'='image/webp'; '.png'='image/png'
  '.jpg'='image/jpeg'; '.jpeg'='image/jpeg'; '.ico'='image/x-icon'
  '.xml'='application/xml'; '.txt'='text/plain; charset=utf-8'
  '.json'='application/json'; '.woff2'='font/woff2'
}

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$Puerto/")
$listener.Start()
Write-Host "Pininos sirviendo en http://localhost:$Puerto/  (Ctrl+C para detener)"

try {
  while ($listener.IsListening) {
    $ctx = $listener.GetContext()
    $path = [Uri]::UnescapeDataString($ctx.Request.Url.AbsolutePath)
    if ($path -eq '/') { $path = '/index.html' }
    $file = Join-Path $root ($path.TrimStart('/') -replace '/','\')

    if (Test-Path $file -PathType Leaf) {
      $ext = [IO.Path]::GetExtension($file).ToLower()
      $ct = $mime[$ext]
      if (-not $ct) { $ct = 'application/octet-stream' }
      $bytes = [IO.File]::ReadAllBytes($file)
      $ctx.Response.ContentType = $ct
      $ctx.Response.ContentLength64 = $bytes.Length
      $ctx.Response.OutputStream.Write($bytes, 0, $bytes.Length)
    } else {
      $ctx.Response.StatusCode = 404
    }
    Write-Host "$($ctx.Response.StatusCode) $path"
    $ctx.Response.Close()
  }
} finally {
  $listener.Stop()
}
