$ErrorActionPreference = 'Stop'

# Minimal static file server for local verification of the N6 app.
$root = 'C:\Users\Denis Bergkam I\Downloads\APK N6\APK N6'
$port = 8778

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$port/")
$listener.Start()
Write-Output "serving $root on http://localhost:$port/"

$mime = @{
  '.html' = 'text/html; charset=utf-8'
  '.js'   = 'text/javascript; charset=utf-8'
  '.mjs'  = 'text/javascript; charset=utf-8'
  '.css'  = 'text/css; charset=utf-8'
  '.json' = 'application/json; charset=utf-8'
  '.png'  = 'image/png'
  '.jpg'  = 'image/jpeg'
  '.svg'  = 'image/svg+xml'
  '.ico'  = 'image/x-icon'
  '.txt'  = 'text/plain; charset=utf-8'
  '.md'   = 'text/markdown; charset=utf-8'
  '.py'   = 'text/plain; charset=utf-8'
}

while ($listener.IsListening) {
  try { $ctx = $listener.GetContext() } catch { break }
  $req = $ctx.Request
  $res = $ctx.Response
  $rel = [System.Uri]::UnescapeDataString($req.Url.AbsolutePath.TrimStart('/'))
  if ($rel -eq '') { $rel = 'index.html' }
  $path = Join-Path $root ($rel -replace '/', '\')
  if (-not $path.StartsWith($root)) {
    $res.StatusCode = 403
    $res.Close()
    continue
  }
  if (-not (Test-Path $path -PathType Leaf)) {
    $res.StatusCode = 404
    $b = [System.Text.Encoding]::UTF8.GetBytes("404 $rel")
    $res.ContentType = 'text/plain; charset=utf-8'
    $res.ContentLength64 = $b.Length
    $res.OutputStream.Write($b, 0, $b.Length)
    $res.Close()
    continue
  }
  $ext = [System.IO.Path]::GetExtension($path).ToLowerInvariant()
  $res.ContentType = if ($mime.ContainsKey($ext)) { $mime[$ext] } else { 'application/octet-stream' }
  $bytes = [System.IO.File]::ReadAllBytes($path)
  $res.ContentLength64 = $bytes.Length
  $res.OutputStream.Write($bytes, 0, $bytes.Length)
  $res.Close()
}
$listener.Stop()