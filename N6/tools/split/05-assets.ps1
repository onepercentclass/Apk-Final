$ErrorActionPreference = 'Stop'
$WORK = 'C:\Users\Denis Bergkam I\AppData\Local\Temp\opencode\n6split\_work'
$SRC  = Join-Path $WORK 'src'
$N6   = Join-Path $WORK 'n6'
$utf8 = New-Object System.Text.UTF8Encoding($false)

# stable name per image, keyed by content hash
$names = @{
  'EE20E419F9' = 'logo-white'
  'B80E2533D6' = 'logo-black'
  'C0DC99CD16' = 'logo-report-a4'
  'A1FF252B1E' = 'logo-report'
  '21B822B78A' = 'logo-request-report'
  '3D7042F9BB' = 'logo-print-hc'
  'F68A440BDB' = 'logo-manual-program'
  'E8A02557DA' = 'logo-print-pace'
  'CLIENT_HEADER_LOGO' = 'logo-client-header'
  'LOGO_B64'            = 'logo-client-print'
  '8465EBD21F'          = 'logo-client-header'
  'E1F5C89870'          = 'logo-client-print'
}

function Get-Hash10([string]$b64) {
  $md5 = [System.Security.Cryptography.MD5]::Create()
  return [BitConverter]::ToString($md5.ComputeHash([System.Text.Encoding]::ASCII.GetBytes($b64))).Replace('-','').Substring(0,10)
}
function Write-Utf8([string]$rel, [string]$text) {
  $p = Join-Path $N6 $rel
  $d = Split-Path $p -Parent
  if (-not (Test-Path $d)) { New-Item -ItemType Directory -Path $d -Force | Out-Null }
  [System.IO.File]::WriteAllText($p, $text, $utf8)
}

New-Item -ItemType Directory -Path (Join-Path $N6 'assets\img') -Force | Out-Null
$written = @{}
$log = @()

foreach ($role in @('owner','admin','headcoach','coach','client')) {
  $path = Join-Path $SRC "$role.html"
  $t = [System.IO.File]::ReadAllText($path, $utf8)

  # 1) The client dashboard builds its <img> tags by concatenation:
  #       '<img src="data:image/png;base64,' + CLIENT_HEADER_LOGO + '" alt=...>'
  #    Step 2 below turns the constant into a file path, so the literal data-URI
  #    prefix has to go too. The whole src="..." concatenation is rewritten in one
  #    pass, because leaving the prefix behind yields invalid JavaScript:
  #       '<img src="' + CLIENT_HEADER_LOGO + '" alt=...>'
  $SQ = [char]39
  $concatPattern = 'src="data:image/png;base64,' + $SQ + '\s*\+\s*([A-Za-z_$][A-Za-z0-9_$]*)\s*\+\s*' + $SQ
  $t = [regex]::Replace($t, $concatPattern, [System.Text.RegularExpressions.MatchEvaluator]{
    param($m)
    'src="' + $SQ + ' + ' + $m.Groups[1].Value + ' + ' + $SQ
  })

  # 2) every remaining blob, with or without the data: prefix.
  #    Collect first, then patch back-to-front so earlier indices stay valid.
  $rx = [regex]'(?:data:image/png;base64,)?([A-Za-z0-9+/=]{2000,})'
  $hits = @()
  foreach ($m in $rx.Matches($t)) { $hits += ,@($m.Index, $m.Length, $m.Groups[1].Value) }
  for ($i = $hits.Count - 1; $i -ge 0; $i--) {
    $idx = $hits[$i][0]; $len = $hits[$i][1]; $b64 = $hits[$i][2]
    $h = Get-Hash10 $b64
    if (-not $names.ContainsKey($h)) { continue }
    $nm = $names[$h]
    $rel = "assets/img/$nm.png"
    if (-not $written.ContainsKey($h)) {
      $png = [System.Convert]::FromBase64String($b64)
      [System.IO.File]::WriteAllBytes((Join-Path $N6 $rel), $png)
      $written[$h] = $rel
      $log += ('  wrote {0,-34} {1,7} bytes  ({2})' -f $rel, $png.Length, $h)
    }
    $t = $t.Remove($idx, $len).Insert($idx, "assets/img/$nm.png")
  }

  [System.IO.File]::WriteAllText($path, $t, $utf8)
  $left = ([regex]::Matches($t, 'base64,[A-Za-z0-9+/=]{500,}')).Count
  $log += ("{0,-11} remaining inline base64 blobs: {1}" -f $role, $left)
}

Write-Utf8 'assets/README.md' @'
# assets/

Static files only. Anything the browser needs at runtime that is not code or
stylesheet lives here.

## img/

Extracted from the five original single-file dashboards, which embedded every
logo as a base64 `data:` URI inside the markup, inside inline `<style>` rules
and inside JS string constants. They are now real files, referenced by a
relative path so they are cacheable and editable.

| file | original source | used by |
| --- | --- | --- |
| `logo-white.png` | `owner.html` / `admin.html` / `headcoach.html` sidebar `.brand-logo` | Owner, Admin, Head Coach |
| `logo-black.png` | same, `.logo-black` variant | Owner, Admin, Head Coach |
| `logo-report.png` | `const LOGO_DATA` in the monthly-report generator | Owner, Admin |
| `logo-report-a4.png` | `printN6Report()` A4 template | Owner, Admin |
| `logo-request-report.png` | `n6-monthly-pdf-reports` coach-request report | Owner, Admin |
| `logo-print-hc.png` | `N6_PRINT_LOGO` canvas export | Head Coach |
| `logo-manual-program.png` | manual program builder export | Head Coach |
| `logo-print-pace.png` | `PACE_PRINT_LOGO` pace calculator export | Head Coach |
| `logo-client-header.png` | `const CLIENT_HEADER_LOGO` | Client |
| `logo-client-print.png` | `const LOGO_B64` (A3 summary JPG) | Client |

Add future imagery to `img/` and reference it from `css/` or `js/`, never as an
inline `data:` URI.
'@

$log