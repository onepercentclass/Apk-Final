$ErrorActionPreference = 'Stop'
$WORK = 'C:\Users\Denis Bergkam I\AppData\Local\Temp\opencode\n6split\_work'
$SRC  = Join-Path $WORK 'src'
$N6   = Join-Path $WORK 'n6'
$utf8 = New-Object System.Text.UTF8Encoding($false)
$roles = @('owner','admin','headcoach','coach','client')

function Write-Utf8([string]$rel, [string]$text) {
  $p = Join-Path $N6 $rel
  $d = Split-Path $p -Parent
  if (-not (Test-Path $d)) { New-Item -ItemType Directory -Path $d -Force | Out-Null }
  [System.IO.File]::WriteAllText($p, $text, $utf8)
}

# ------------------------------------------------------------ block split
function Get-Blocks {
  param([string]$Html)
  $headEnd = $Html.IndexOf('</head>')
  $scripts = New-Object System.Collections.ArrayList
  $styles  = New-Object System.Collections.ArrayList
  $external = @()
  $i = 0
  while ($true) {
    $ls = $Html.IndexOf('<script', $i); if ($ls -lt 0) { break }
    $gs = $Html.IndexOf('>', $ls); $cse = $Html.IndexOf('</script>', $gs); if ($cse -lt 0) { break }
    $stag = $Html.Substring($ls, $gs - $ls + 1)
    $idm  = [regex]::Match($stag, 'id="([^"]*)"'); $srcm = [regex]::Match($stag, 'src="([^"]*)"')
    if ($srcm.Success) { $external += $srcm.Groups[1].Value }
    else { [void]$scripts.Add([pscustomobject]@{ Id=$(if($idm.Success){$idm.Groups[1].Value}else{''}); InHead=($ls -lt $headEnd); Js=$Html.Substring($gs+1,$cse-$gs-1) }) }
    $i = $cse + 9
  }
  $i = 0
  while ($true) {
    $lt = $Html.IndexOf('<style', $i); if ($lt -lt 0) { break }
    $gt = $Html.IndexOf('>', $lt); $cl = $Html.IndexOf('</style>', $gt); if ($cl -lt 0) { break }
    $idm = [regex]::Match($Html.Substring($lt, $gt - $lt + 1), 'id="([^"]*)"')
    [void]$styles.Add([pscustomobject]@{ Id=$(if($idm.Success){$idm.Groups[1].Value}else{''}); InHead=($lt -lt $headEnd); Css=$Html.Substring($gt+1,$cl-$gt-1) })
    $i = $cl + 8
  }
  $bo = $Html.IndexOf('<body'); $bt = $Html.IndexOf('>', $bo) + 1; $bc = $Html.LastIndexOf('</body>')
  $headInner = ($Html.Substring(0, $headEnd) -replace '(?s)<style.*?</style>', '' -replace '(?s)<script.*?</script>', '')
  return [pscustomobject]@{ Scripts=$scripts; Styles=$styles; External=@($external); HeadInner=$headInner; BodyInner=$Html.Substring($bt, $bc-$bt) }
}

# ---------------------------------------------- CSS banner -> target file
# ordered: first match wins
$cssRoutes = @(
  @{ re = 'HARGA\s*/\s*PROGRAM|PRICING';                 f = 'modules/harga.css' },
  @{ re = 'TICKETS?|KELUHAN';                             f = 'modules/tiket.css' },
  @{ re = 'CHAT|PESAN';                                   f = 'modules/pesan.css' },
  @{ re = 'JADWAL|KALENDER|WEEKLY SCHEDULE|SCHEDULE GRID'; f = 'modules/jadwal.css' },
  @{ re = 'PAYROLL|SENSITIVE|KEUANGAN|FINANCE';           f = 'modules/keuangan.css' },
  @{ re = 'RAPOR|LAPORAN|REPORT';                         f = 'modules/laporan.css' },
  @{ re = 'KOMISI|COMMISSION';                            f = 'modules/komisi.css' },
  @{ re = 'PROGRAM BUILDER|BUAT PROGRAM|HCMANUAL|WEEKLY'; f = 'modules/program.css' },
  @{ re = 'KOREKSI';                                      f = 'modules/koreksi.css' },
  @{ re = 'MONITORING|ANTRIAN|PRESTASI|ATLET';            f = 'modules/monitoring.css' },
  @{ re = 'PERIODE COACH';                                f = 'modules/periode.css' },
  @{ re = 'SIDEBAR|TOPBAR|CONTENT|BOTTOM NAV|AKUN MOBILE|DRAWER'; f = 'layout.css' },
  @{ re = 'MODAL|TABLE SCROLL|ATTENDANCE|SUB TABS|PROGRESS BAR|TIMELINE|FILTER BAR|CHARTS'; f = 'components.css' },
  @{ re = 'RINGKASAN|EXPORT|PRINT|A3';                    f = 'print.css' },
  @{ re = 'theme|THEME|Tema|DESIGN SYSTEM|switchable';    f = 'themes.css' },
  @{ re = '.';                                            f = 'modules/extras.css' }
)

function Resolve-CssTarget([string]$banner) {
  # NB: -match is already case-insensitive; never upper-case the pattern
  # (it would turn \s into \S).
  foreach ($r in $cssRoutes) {
    if ($banner -match $r.re) { return $r.f }
  }
  return 'modules/extras.css'
}

# ------------------------------------------ split a css blob by banner comments
function Split-CssByBanner {
  param([string]$Css)
  $rx = [regex]'(?m)^[ \t]*/\*[ \t]*(?:-+[ \t]*)?(?<t>[^*\r\n]+?)(?:[ \t]*-+)?[ \t]*\*/[ \t]*\r?\n'
  $ms = @($rx.Matches($Css))
  if ($ms.Count -eq 0) { return @(@{ Banner=''; Text=$Css }) }
  $out = @()
  $lead = $Css.Substring(0, $ms[0].Index)
  if ($lead.Trim() -ne '') { $out += ,@{ Banner = ''; Text = $lead } }
  for ($i = 0; $i -lt $ms.Count; $i++) {
    $s = $ms[$i].Index
    $e = if ($i + 1 -lt $ms.Count) { $ms[$i+1].Index } else { $Css.Length }
    $out += ,@{ Banner = $ms[$i].Groups['t'].Value.Trim(); Text = $Css.Substring($s, $e - $s) }
  }
  return $out
}

# =============================================================== generate
$log = @()
$orderList = New-Object System.Collections.ArrayList
foreach ($role in $roles) {
  $html = [System.IO.File]::ReadAllText((Join-Path $SRC "$role.html"), $utf8)
  $b = Get-Blocks $html

  # ---------------------------------------------------------------- CSS
  $buckets = [ordered]@{}
  $order   = New-Object System.Collections.ArrayList
  $origParts = @()
  $embeddedParts = @()

  foreach ($st in $b.Styles) {
    if ($st.InHead) { $origParts += ,$st.Css } else { $embeddedParts += ,@{ Id=$st.Id; Css=$st.Css } }
  }

  # tokens: the leading :root block of the first head style
  $first = $origParts[0]
  $rootEnd = $first.IndexOf('}')
  $tokens = $first.Substring(0, $rootEnd + 1)
  $rest    = $first.Substring($rootEnd + 1)

  $buckets['tokens.css'] = $tokens
  [void]$order.Add('tokens.css')

  foreach ($part in (Split-CssByBanner $rest)) {
    # the unnamed run before the first banner is the reset + typography block
    $target = if ($part.Banner -eq '') { 'base.css' } else { Resolve-CssTarget $part.Banner }
    if (-not $buckets.Contains($target)) { [void]$order.Add($target) }
    $buckets[$target] = $buckets[$target] + $part.Text
  }

  # remaining head style blocks: keep one file per original block so nothing is
  # conflated. theme-ish blocks go to themes.css, the rest to polish/<id>.css
  $headBlocks = @()
  $i = 0
  while ($true) {
    $ls2 = $html.IndexOf('<style', $i); if ($ls2 -lt 0) { break }
    $gs2 = $html.IndexOf('>', $ls2); $cs2 = $html.IndexOf('</style>', $gs2); if ($cs2 -lt 0) { break }
    if ($ls2 -lt $html.IndexOf('</head>')) { $headBlocks += ,$html.Substring($gs2 + 1, $cs2 - $gs2 - 1) }
    $i = $cs2 + 8
  }
  $bi = 1
  for ($i = 1; $i -lt $headBlocks.Count; $i++) {
    $css = $headBlocks[$i]
    $bi++
    if ($css -match '(?i)theme|unified') { $target = 'themes.css' }
    else {
      $nm = 'polish/block-' + $bi + '.css'
      $target = $nm
    }
    if (-not $buckets.Contains($target)) { [void]$order.Add($target) }
    $buckets[$target] = $buckets[$target] + "`n/* ---- $role.html : original style block #$bi ---- */`n" + $css
  }

  foreach ($f in $order) {
    $rel = "css/$role/$f"
    Write-Utf8 $rel ("/* N6 - $rel */`n/* Extracted verbatim from $role.html. Cascade order matters: load this file after`n   everything listed before it in css/$role/ORDER.txt */`n`n" + $buckets[$f])
    [void]$orderList.Add("$f`t$($buckets[$f].Length)")
  }
  $log += ("{0,-11} {1,2} css files" -f $role, $order.Count)
  Write-Utf8 "css/$role/ORDER.txt" (("# N6 css load order for role: $role`n# files MUST be included in this sequence (cascade depends on it)`n" + ($orderList -join "`n")) + "`n")
  $orderList = New-Object System.Collections.ArrayList
}

$log