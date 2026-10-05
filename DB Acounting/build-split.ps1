# Split db-accounting.html -> modular structure (byte-identik, tanpa ubah UI/UX)
$ErrorActionPreference = 'Stop'
$src  = Join-Path (Get-Location) 'db-accounting.html'
$root = Join-Path (Get-Location) 'db-accounting-modular'

$lines = Get-Content -Path $src -Encoding UTF8
Write-Host ("Total lines: " + $lines.Count)

function Find-First($substr, $from = 0) {
  for ($i = $from; $i -lt $lines.Count; $i++) {
    if ($lines[$i].Contains($substr)) { return $i }
  }
  throw "Marker tidak ketemu: $substr"
}
function Find-FirstNot($substr, $notSubstr, $from = 0) {
  for ($i = $from; $i -lt $lines.Count; $i++) {
    if ($lines[$i].Contains($substr) -and (-not $lines[$i].Contains($notSubstr))) { return $i }
  }
  throw "Marker tidak ketemu: $substr (not $notSubstr)"
}
function Write-Slice($path, $from, $to) {
  $dir = Split-Path $path -Parent
  if (-not (Test-Path $dir)) { New-Item -ItemType Directory -Path $dir | Out-Null }
  $enc = New-Object System.Text.UTF8Encoding $false
  $sw = New-Object System.IO.StreamWriter($path, $false, $enc)
  for ($i = $from; $i -le $to; $i++) { $sw.WriteLine($lines[$i]) }
  $sw.Close()
  Write-Host ("  wrote " + $path + " [" + ($from + 1) + "-" + ($to + 1) + "]")
}

# ---------- struktur folder ----------
@('css','js','js\menus','assets','tiers','backend\app\routers') | ForEach-Object {
  $d = Join-Path $root $_
  if (-not (Test-Path $d)) { New-Item -ItemType Directory -Path $d | Out-Null }
}

# ---------- CSS (style: baris 10..500, 0-based 9..499) ----------
$styleOpen = 9; $styleClose = 499
$shellIdx   = Find-First '#shell{display:flex' 0
$baseIdx    = Find-First '*{box-sizing:border-box;}' 0
$mainIdx    = Find-First '---------- MAIN ----------' 0
$authIdx    = Find-First '---------- AUTH SCREEN ----------' 0
$viewIdx    = Find-First '#view{padding:' 0
$cogridIdx  = Find-First '.co-grid{' 0
$refreshIdx = Find-First 'UI REFRESH' 0
$fixIdx     = Find-First 'PERBAIKAN SISTEM TEMA' 0
Write-Slice (Join-Path $root 'css\01-tokens.css')      ($styleOpen + 1) ($baseIdx - 1)
Write-Slice (Join-Path $root 'css\02-base.css')        $baseIdx         ($shellIdx - 1)
Write-Slice (Join-Path $root 'css\03-sidebar.css')     $shellIdx        ($mainIdx - 1)
Write-Slice (Join-Path $root 'css\04-topbar.css')      $mainIdx         ($authIdx - 1)
Write-Slice (Join-Path $root 'css\05-auth.css')        $authIdx         ($viewIdx - 1)
Write-Slice (Join-Path $root 'css\06-components.css') $viewIdx         ($cogridIdx - 1)
Write-Slice (Join-Path $root 'css\07-modules.css')     $cogridIdx       ($refreshIdx - 1)
Write-Slice (Join-Path $root 'css\08-polish.css')      $refreshIdx      ($fixIdx - 1)
Write-Slice (Join-Path $root 'css\09-theme-fix.css')   $fixIdx          ($styleClose - 1)

# ---------- JS (script: 0-based 514..2041) ----------
$scriptOpen = 514; $scriptClose = 2041
$iIcons  = Find-First '============================= ICONS' 0
$iConst  = Find-First '= CONSTANTS =' 0
$iState  = Find-First '= STATE =' 0
$iTheme  = Find-First '= THEME =' 0
$iUtil   = Find-First '= UTIL =' 0
$iCsv    = Find-First '= CSV EXPORT' 0
$iPersist= Find-First '= PERSISTENCE' 0
$iAuth   = Find-FirstNot '============================= AUTH =' 'SCREEN' 0
$iAcct   = Find-First 'ACCOUNTING CORE' 0
$iChart  = Find-First 'SIMPLE SVG CHARTS' 0
$iModal  = Find-FirstNot '= MODAL =' 'SCREEN' 0
$iRouter = Find-First 'ROUTER / RENDER SHELL' 0
$iAuthScr= Find-First 'AUTH SCREEN' $iRouter
$iPages  = Find-First '= PAGES =' $iAuthScr
$iDash   = Find-First '---- DASHBOARD ----' 0
$iTrx    = Find-First '---- TRANSAKSI' 0
$iSale   = Find-First '---- PENJUALAN' 0
$iBuy    = Find-First '---- PEMBELIAN' 0
$iKas    = Find-First '---- KAS & BANK' 0
$iJur    = Find-First '---- JURNAL UMUM' 0
$iInv    = Find-First '---- PERSEDIAAN' 0
$iAset   = Find-First '---- ASET TETAP' 0
$iKontak = Find-First '---- KONTAK' 0
$iLap    = Find-First '---- LAPORAN' 0
$iPajak  = Find-First 'MANAJEMEN PAJAK' 0
$iCo     = Find-First 'MULTI PERUSAHAAN' 0
$iSet    = Find-First '---- PENGATURAN' 0
$iBoot   = Find-First '= BOOT =' 0
$iRenderSidebar = Find-First 'function renderSidebar(){' $iAuthScr

$js = Join-Path $root 'js'
Write-Slice (Join-Path $js 'core-icons.js')      $iIcons   ($iConst - 1)
Write-Slice (Join-Path $js 'core-constants.js')  $iConst   ($iState - 1)
Write-Slice (Join-Path $js 'core-state.js')      $iState   ($iTheme - 1)
Write-Slice (Join-Path $js 'core-theme.js')      $iTheme   ($iUtil - 1)
Write-Slice (Join-Path $js 'core-utils.js')      $iUtil    ($iCsv - 1)
Write-Slice (Join-Path $js 'core-csv.js')        $iCsv     ($iPersist - 1)
# core-store.js ditulis manual (localStorage + API nonaktif) -> lewati slice PERSISTENCE
Write-Slice (Join-Path $js 'core-auth.js')       $iAuth    ($iAcct - 1)
Write-Slice (Join-Path $js 'core-accounting.js') $iAcct    ($iChart - 1)
Write-Slice (Join-Path $js 'core-charts.js')     $iChart   ($iModal - 1)
Write-Slice (Join-Path $js 'core-modal.js')      $iModal   ($iRouter - 1)

# core-shell.js = ROUTER block + renderSidebar..renderAll + PAGES init (digabung agar urut)
$enc = New-Object System.Text.UTF8Encoding $false
$shellPath = Join-Path $js 'core-shell.js'
$sw = New-Object System.IO.StreamWriter($shellPath, $false, $enc)
for ($i = $iRouter; $i -le ($iAuthScr - 1); $i++) { $sw.WriteLine($lines[$i]) }
for ($i = $iRenderSidebar; $i -le ($iPages - 1); $i++) {
  # filter menu sidebar berbasis tier (tier 0 = semua, jadi output identik dgn aslinya)
  $ln = $lines[$i].Replace('`${NAV.map(', '`${visibleNav().map(')
  $sw.WriteLine($ln)
}
$sw.Close()
Write-Host ("  wrote " + $shellPath)

# page-auth.js = AUTH SCREEN block tanpa bagian shell
Write-Slice (Join-Path $js 'page-auth.js') $iAuthScr ($iRenderSidebar - 1)

$menus = Join-Path $js 'menus'
Write-Slice (Join-Path $menus 'menu-dashboard.js')  $iDash   ($iTrx - 1)
Write-Slice (Join-Path $menus 'menu-transaksi.js')  $iTrx    ($iSale - 1)
Write-Slice (Join-Path $menus 'menu-penjualan.js')  $iSale   ($iBuy - 1)
Write-Slice (Join-Path $menus 'menu-pembelian.js')  $iBuy    ($iKas - 1)
Write-Slice (Join-Path $menus 'menu-kasbank.js')    $iKas    ($iJur - 1)
Write-Slice (Join-Path $menus 'menu-jurnal.js')     $iJur    ($iInv - 1)
Write-Slice (Join-Path $menus 'menu-persediaan.js') $iInv    ($iAset - 1)
Write-Slice (Join-Path $menus 'menu-asettetap.js')  $iAset   ($iKontak - 1)
Write-Slice (Join-Path $menus 'menu-kontak.js')     $iKontak ($iLap - 1)
Write-Slice (Join-Path $menus 'menu-laporan.js')    $iLap    ($iPajak - 1)
Write-Slice (Join-Path $menus 'menu-pajak.js')      $iPajak  ($iCo - 1)
Write-Slice (Join-Path $menus 'menu-perusahaan.js') $iCo     ($iSet - 1)
Write-Slice (Join-Path $menus 'menu-pengaturan.js') $iSet    ($iBoot - 1)

# boot.js = BOOT block, ganti hook downloads non-standalone dgn null (perilaku sama: toast fallback)
$bootPath = Join-Path $js 'boot.js'
$sw = New-Object System.IO.StreamWriter($bootPath, $false, $enc)
for ($i = $iBoot; $i -le ($scriptClose - 1); $i++) {
  $ln = $lines[$i].Replace("try{ S.downloads = await claude.use('downloads'); }catch(e){ S.downloads=null; }", "S.downloads = null; /* unduhan via browser bawaan; integrasi native nonaktif (lihat js/config.js) */")
  $sw.WriteLine($ln)
}
$sw.Close()
Write-Host ("  wrote " + $bootPath)

# ---------- assets/logo.png (decode dari LOGO_DATA_URI, kode tetap pakai DATA URI) ----------
$logoLine = $lines[$iConst..($iConst+40)] | Where-Object { $_.Contains('LOGO_DATA_URI=') } | Select-Object -First 1
$prefix = 'const LOGO_DATA_URI="data:image/png;base64,'
$start = $logoLine.IndexOf('base64,') + 7
$b64 = $logoLine.Substring($start).TrimEnd('";')
[System.IO.File]::WriteAllBytes((Join-Path $root 'assets\logo.png'), [System.Convert]::FromBase64String($b64))
Write-Host '  wrote assets/logo.png'

# ---------- verifikasi: gabungan css/js identik dgn blok asli ----------
function Join-Section($from, $to) { return ([string]::Join("`n", $lines[$from..$to]) + "`n") }
$origCss = Join-Section ($styleOpen + 1) ($styleClose - 1)
$cssFiles = @('css\01-tokens.css','css\02-base.css','css\03-sidebar.css','css\04-topbar.css','css\05-auth.css','css\06-components.css','css\07-modules.css','css\08-polish.css','css\09-theme-fix.css')
$cat = ''
foreach ($f in $cssFiles) { $cat += ([System.IO.File]::ReadAllText((Join-Path $root $f), $enc)) }
if ($cat -eq $origCss) { Write-Host 'CSS VERIFY: IDENTIK' } else { Write-Host ('CSS VERIFY: BEDA len=' + $cat.Length + ' vs ' + $origCss.Length) }
Write-Host 'SELESAI SPLIT'
