$ErrorActionPreference = 'Stop'

$SrcDir  = 'C:\Users\Denis Bergkam I\Downloads\APK N6\APK N6'
$OutDir  = 'C:\Users\Denis Bergkam I\AppData\Local\Temp\opencode\n6split\_stage'

$roles = @('owner','admin','headcoach','coach','client')

if (Test-Path $OutDir) { Remove-Item $OutDir -Recurse -Force }
New-Item -ItemType Directory -Path $OutDir -Force | Out-Null

function Find-HeadClose([string]$c) {
  # real document head close = FIRST "</head>" in the file (templates live inside <script>)
  return $c.IndexOf('</head>', [System.StringComparison]::Ordinal)
}
function Find-BodyOpen([string]$c) {
  $i = $c.IndexOf('<body', [System.StringComparison]::Ordinal)
  return $i
}
function Find-BodyClose([string]$c) {
  # real </body> = LAST occurrence
  return $c.LastIndexOf('</body>', [System.StringComparison]::Ordinal)
}

foreach ($role in $roles) {
  $path = Join-Path $SrcDir "$role.html"
  $c = [System.IO.File]::ReadAllText($path)

  $headClose = Find-HeadClose $c
  $bodyOpen  = Find-BodyOpen  $c
  $bodyClose = Find-BodyClose $c

  $roleDir = Join-Path $OutDir $role
  New-Item -ItemType Directory -Path $roleDir -Force | Out-Null
  New-Item -ItemType Directory -Path (Join-Path $roleDir 'css') -Force | Out-Null
  New-Item -ItemType Directory -Path (Join-Path $roleDir 'js')  -Force | Out-Null

  # ---- state machine: collect top-level <style> and <script> blocks ----
  $styles = New-Object System.Collections.ArrayList   # @{Id; Css}
  $scripts = New-Object System.Collections.ArrayList  # @{Id; Js; InHead}
  $headPlainParts = New-Object System.Collections.ArrayList

  $i = 0
  $n = $c.Length
  $headCursor = 0
  while ($i -lt $n) {
    $lt = $c.IndexOf('<', $i)
    if ($lt -lt 0) { break }

    if ($c.Substring($lt, [Math]::Min(7, $n - $lt)) -ceq '<style>') { $tagLen = 7; $id = '' }
    elseif ($c.Substring($lt, [Math]::Min(7, $n - $lt)) -ceq '<style ') {
      $tagLen = $c.IndexOf('>', $lt) - $lt + 1
      $tagTxt = $c.Substring($lt, $tagLen)
      $m = [regex]::Match($tagTxt, 'id="([^"]+)"')
      $id = if ($m.Success) { $m.Groups[1].Value } else { '' }
    }
    else { $i = $lt + 1; continue }

    $closeIdx = $c.IndexOf('</style>', $lt, [System.StringComparison]::Ordinal)
    if ($closeIdx -lt 0) { $i = $lt + 1; continue }
    $inner = $c.Substring($lt + $tagLen, $closeIdx - ($lt + $tagLen))
    $inHead = $lt -lt $headClose
    if ($inHead) {
      [void]$styles.Add(@{ Id = $id; Css = $inner })
      $headPlainParts.Add($c.Substring($headCursor, $lt - $headCursor))
      $headCursor = $closeIdx + 8
    } else {
      [void]$styles.Add(@{ Id = ("INLINE:" + $id); Css = $inner; Embedded = $true })
    }
    $i = $closeIdx + 8
  }

  # scripts
  $i = 0
  while ($i -lt $n) {
    $lt = $c.IndexOf('<script', $i)
    if ($lt -lt 0) { break }
    $gt = $c.IndexOf('>', $lt)
    if ($gt -lt 0) { break }
    $tagTxt = $c.Substring($lt, $gt - $lt + 1)
    $closeIdx = $c.IndexOf('</script>', $gt, [System.StringComparison]::Ordinal)
    if ($closeIdx -lt 0) { $i = $lt + 7; continue }
    $inner = $c.Substring($gt + 1, $closeIdx - ($gt + 1))
    $m = [regex]::Match($tagTxt, 'id="([^"]+)"')
    $id = if ($m.Success) { $m.Groups[1].Value } else { '' }
    $src = if ($tagTxt -match 'src="([^"]+)"') { $Matches[1] } else { '' }
    [void]$scripts.Add(@{ Id = $id; Js = $inner; Src = $src; InHead = ($lt -lt $headClose) })
    $i = $closeIdx + 9
  }

  # ---- write head preamble (everything in <head> that is not a style/script block) ----
  $headSlice = $c.Substring(0, $headClose)
  $headSliceClean = [regex]::Replace($headSlice, '(?s)<style.*?</style>', '')
  $headSliceClean = [regex]::Replace($headSliceClean, '(?s)<script.*?</script>', '')
  [System.IO.File]::WriteAllText((Join-Path $roleDir 'head.html'), $headSliceClean, [System.Text.UTF8Encoding]::new($false))

  # ---- write body ----
  $bodyOpenTag = $c.IndexOf('>', $bodyOpen) + 1
  $body = $c.Substring($bodyOpenTag, $bodyClose - $bodyOpenTag)
  # strip script blocks from body, keep everything else
  $bodyNoScript = [regex]::Replace($body, '(?s)<script.*?</script>', "`n<!--SCRIPT_SLOT-->`n")
  [System.IO.File]::WriteAllText((Join-Path $roleDir 'body.html'), $bodyNoScript, [System.Text.UTF8Encoding]::new($false))
  [System.IO.File]::WriteAllText((Join-Path $roleDir 'body-full.html'), $body, [System.Text.UTF8Encoding]::new($false))

  # ---- write css blocks ----
  $k = 0
  foreach ($s in $styles) {
    $k++
    $name = if ($s.Id) { $s.Id } else { "block-$k" }
    $name = ($name -replace '[^A-Za-z0-9_-]', '_')
    $flag = if ($s.ContainsKey('Embedded') -and $s.Embedded) { 'embedded-' } else { '' }
    [System.IO.File]::WriteAllText((Join-Path $roleDir "css\$flag$name.css"), $s.Css, [System.Text.UTF8Encoding]::new($false))
  }

  # ---- write js blocks ----
  $k = 0
  foreach ($s in $scripts) {
    if ($s.Src) {
      $k++
      [System.IO.File]::WriteAllText((Join-Path $roleDir "js\zz-external-$k.js"), "/* EXTERNAL: $($s.Src) */`n", [System.Text.UTF8Encoding]::new($false))
      continue
    }
    $k++
    $name = if ($s.Id) { $s.Id } else { "block-$k" }
    $name = ($name -replace '[^A-Za-z0-9_-]', '_')
    $flag = if ($s.InHead) { 'head-' } else { 'body-' }
    [System.IO.File]::WriteAllText((Join-Path $roleDir "js\$flag$k-$name.js"), $s.Js, [System.Text.UTF8Encoding]::new($false))
  }

  Write-Output ("{0,-11} headClose={1,-7} bodyOpen={2,-7} bodyClose={3,-7}  css={4,-3} js={5}" -f `
    $role, $headClose, $bodyOpen, $bodyClose, $styles.Count, $scripts.Count)
}

Write-Output ''
Write-Output '--- staging tree ---'
Get-ChildItem $OutDir -Recurse -File | ForEach-Object {
  '{0,10}  {1}' -f $_.Length, $_.FullName.Substring($OutDir.Length + 1)
}