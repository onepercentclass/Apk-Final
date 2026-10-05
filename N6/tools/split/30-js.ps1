$ErrorActionPreference = 'Stop'
. "$PSScriptRoot\lib-split.ps1"

$WORK = 'C:\Users\Denis Bergkam I\AppData\Local\Temp\opencode\n6split\_work'
$SRC  = Join-Path $WORK 'src'
$N6   = Join-Path $WORK 'n6'
$utf8 = New-Object System.Text.UTF8Encoding($false)
$SENTINEL = '/*__N6_UNIT__*/'

function Write-Utf8([string]$rel, [string]$text) {
  $p = Join-Path $N6 $rel
  $d = Split-Path $p -Parent
  if (-not (Test-Path $d)) { New-Item -ItemType Directory -Path $d -Force | Out-Null }
  [System.IO.File]::WriteAllText($p, $text, $utf8)
}

# ============================================================ menu config
# tier 0 = owner (sees everything).  A user at tier T may use any feature
# whose tier >= T, so owner(0) > admin(1) > headcoach(2) > coach(3) > client(4).
$menus = [ordered]@{
  owner = @(
    @{ key='beranda';     tier=0; label='Beranda' }
    @{ key='klien';       tier=1; label='Klien' }
    @{ key='jadwalklien'; tier=1; label='Jadwal Klien' }
    @{ key='jadwalcoach'; tier=1; label='Jadwal Coach' }
    @{ key='harga';       tier=1; label='Harga & Program' }
    @{ key='komisi';      tier=0; label='Performa & Komisi' }
    @{ key='keuangan';    tier=0; label='Keuangan' }
    @{ key='tiket';       tier=1; label='Tiket & Keluhan' }
    @{ key='pesan';       tier=1; label='Pesan' }
  )
  admin = @(
    @{ key='beranda';     tier=1; label='Beranda' }
    @{ key='klien';       tier=1; label='Klien' }
    @{ key='jadwalklien'; tier=1; label='Jadwal Klien' }
    @{ key='jadwalcoach'; tier=1; label='Jadwal Coach' }
    @{ key='harga';       tier=1; label='Harga & Program' }
    @{ key='tiket';       tier=1; label='Tiket & Keluhan' }
    @{ key='pesan';       tier=1; label='Pesan' }
  )
  headcoach = @(
    @{ key='hub';         tier=2; label='Beranda' }
    @{ key='hcmanual';    tier=2; label='Buat Program' }
    @{ key='hcmonitor';   tier=2; label='Monitoring Klien' }
    @{ key='hcclientchat';tier=2; label='Pesan' }
    @{ key='coach';       tier=2; label='Coach' }
    @{ key='klien';       tier=2; label='Klien' }
    @{ key='koreksi';     tier=2; label='Koreksi' }
    @{ key='atlet';       tier=2; label='Atlet Binaan' }
  )
  coach = @(
    @{ key='home';   tier=3; label='Beranda' }
    @{ key='klien';  tier=3; label='Klien' }
    @{ key='info';   tier=3; label='Informasi' }
    @{ key='jadwal'; tier=3; label='Absensi' }
  )
  client = @(
    @{ key='laporan';  tier=4; label='Laporan' }
    @{ key='performa'; tier=4; label='Performa' }
    @{ key='chat';     tier=4; label='Chat' }
  )
}

# keyword -> menu, used only to place code in a sensibly named file.
# Placement never changes behaviour: the build re-assembles source order.
$kw = @{
  beranda     = 'Beranda|Statistik|statCard|Kpi|kpi|Analytics|analytics|BusinessHealth|healthGrid|Timeline|Chart|chart|TopPerformer|Ringkasan'
  klien       = 'Klien|klien|Client|client|arsip|Arsip|arsipKlien'
  jadwalklien = 'jadwalklien|JadwalKlien|clientSchedule|scheduleClient|SessionClient'
  jadwalcoach = 'jadwalcoach|JadwalCoach|coachSchedule|slot|Slot|roster|Roster|dayOff|DayOff'
  harga       = 'harga|Harga|price|Price|pricing|Pricing|katalog|Katalog|programCatalog|ProgramCatalog'
  komisi      = 'komisi|Komisi|commission|Commission'
  keuangan    = 'keuangan|Keuangan|finance|Finance|expense|Expense|revenue|Revenue|pengeluaran|Pengeluaran'
  tiket       = 'tiket|Tiket|ticket|Ticket|keluhan|Keluhan'
  pesan       = 'pesan|Pesan|message|Message|chat|Chat|messages|Messages'
  hub         = 'hub|Hub'
  hcmanual    = 'hcmanual|HcManual|manualProgram|buildProgram|weeklyBuilder'
  hcmonitor   = 'hcmonitor|HcMonitor|monitoring|Monitoring|flagged|Flagged|podium|Podium'
  hcclientchat= 'hcclientchat|HcClientChat|clientChat'
  coach       = 'coachAtten|CoachAtten|coachRoster|trainer|Trainer'
  koreksi     = 'koreksi|Koreksi|correction|Correction'
  atlet       = 'atlet|Atlet|athlete|Athlete|prestasi|Prestasi|binaan'
  home        = 'renderHome|homeHero|dashboardHome'
  info        = 'info|Info|raporData|Rapor|laporan'
  jadwal      = 'Absensi|attendance|Attendance|absensi'
  laporan     = 'laporan|Laporan|ringkasan|Ringkasan|summarySheet|printArea'
  performa    = 'performa|Performa|score|Score|calCell|Calendar'
  chat        = 'chat|Chat|bubble|Bubble'
}

function Classify-Unit {
  param([string]$Text, [string[]]$MenuKeys, [hashtable]$PanelMap)
  $score = @{}
  foreach ($k in $MenuKeys) { $score[$k] = 0 }
  $strs = Get-N6Strings $Text
  foreach ($s in $strs.Keys) {
    if ($PanelMap.Contains($s)) { $k = $PanelMap[$s]; if ($score.Contains($k)) { $score[$k] += 5 } }
  }
  foreach ($k in $MenuKeys) {
    if (-not $kw.ContainsKey($k)) { continue }
    foreach ($n in [regex]::Matches($Text, $kw[$k])) { $score[$k] += 1 }
  }
  $best = ''; $bestN = 0
  foreach ($k in $MenuKeys) { if ($score[$k] -gt $bestN) { $bestN = $score[$k]; $best = $k } }
  if ($bestN -ge 4) { return $best }
  return '_core'
}

# --------------------------------------------------------------- helpers
function Get-Blocks {
  param([string]$Html)
  $headEnd = $Html.IndexOf('</head>')
  $scripts = New-Object System.Collections.ArrayList
  $i = 0
  while ($true) {
    $ls = $Html.IndexOf('<script', $i); if ($ls -lt 0) { break }
    $gs = $Html.IndexOf('>', $ls); $cse = $Html.IndexOf('</script>', $gs); if ($cse -lt 0) { break }
    $stag = $Html.Substring($ls, $gs - $ls + 1)
    $idm = [regex]::Match($stag, 'id="([^"]*)"'); $srcm = [regex]::Match($stag, 'src="([^"]*)"')
    if ($srcm.Success) { } else {
      [void]$scripts.Add([pscustomobject]@{ Id=$(if($idm.Success){$idm.Groups[1].Value}else{''}); InHead=($ls -lt $headEnd); Js=$Html.Substring($gs+1,$cse-$gs-1) })
    }
    $i = $cse + 9
  }
  $bo = $Html.IndexOf('<body'); $bt = $Html.IndexOf('>', $bo) + 1; $bc = $Html.LastIndexOf('</body>')
  return [pscustomobject]@{ Scripts=$scripts; BodyInner=$Html.Substring($bt, $bc-$bt) }
}

$declRe = '(?m)^  (?:async[ \t]+)?(?:function|const|let|var|class)[ \t*]'
$log = @()

foreach ($role in @('owner','admin','headcoach','coach','client')) {
  $html = [System.IO.File]::ReadAllText((Join-Path $SRC "$role.html"), $utf8)
  $b = Get-Blocks $html
  $pm = Get-N6PanelMap $b.BodyInner
  $menuKeys = @($menus[$role] | ForEach-Object { $_.key })

  $mainIdx = -1; $main = $null
  for ($i = 0; $i -lt $b.Scripts.Count; $i++) {
    if (-not $b.Scripts[$i].InHead -and $b.Scripts[$i].Js.Length -gt 3000) { $mainIdx = $i; $main = $b.Scripts[$i].Js; break }
  }
  $extras = @()
  for ($i = 0; $i -lt $b.Scripts.Count; $i++) { if ($i -ne $mainIdx) { $extras += ,$b.Scripts[$i] } }

  $bs = $main.IndexOf('(function()')
  $bodyStart = $main.IndexOf('{', $bs) + 1
  $bodyEnd = $main.LastIndexOf('})();')
  if ($bodyEnd -lt $bodyStart) { $bodyEnd = $main.LastIndexOf('}());') }
  if ($bodyEnd -lt $bodyStart) { $bodyEnd = $main.Length }
  $pre = $main.Substring(0, $bodyStart); $core = $main.Substring($bodyStart, $bodyEnd - $bodyStart); $post = $main.Substring($bodyEnd)

  $marks = @()
  foreach ($m in [regex]::Matches($core, $declRe)) { $marks += $m.Index }
  foreach ($m in [regex]::Matches($core, '(?m)^\}\)\(\);')) { $marks += $m.Index }
  $marks = @($marks | Sort-Object -Unique)

  $units = New-Object System.Collections.ArrayList
  if ($marks.Count -eq 0) { [void]$units.Add($core) }
  elseif ($marks[0] -ne 0) { [void]$units.Add($core.Substring(0, $marks[0])) }
  for ($i = 0; $i -lt $marks.Count; $i++) {
    $s = $marks[$i]; $e = if ($i + 1 -lt $marks.Count) { $marks[$i+1] } else { $core.Length }
    $u = $core.Substring($s, $e - $s)
    if ($u.Trim() -ne '') { [void]$units.Add($u) }
  }

  # classify
  $assign = @()
  foreach ($u in $units) { $assign += ,(Classify-Unit -Text $u -MenuKeys $menuKeys -PanelMap $pm.Map) }

  # group units per target, keeping source order inside each file
  $groups = [ordered]@{}
  for ($i = 0; $i -lt $units.Count; $i++) {
    $g = $assign[$i]
    if (-not $groups.Contains($g)) { $groups[$g] = New-Object System.Collections.ArrayList }
    [void]$groups[$g].Add([pscustomobject]@{ Text = $units[$i]; SrcIdx = $i })
  }

  # manifest: run-length list in SOURCE order
  $runs = New-Object System.Collections.ArrayList
  $prev = $null
  foreach ($g in $assign) {
    if ($prev -ne $null -and $prev.g -eq $g) { $prev.n++ }
    else { $entry = [pscustomobject]@{ g = $g; n = 1 }; [void]$runs.Add($entry); $prev = $entry }
  }

  # write fragment files
  foreach ($g in $groups.Keys) {
    $text = ($groups[$g] | ForEach-Object { $_.Text }) -join $SENTINEL
    $label = 'shared core / boot / state'
    $tier  = 'n/a'
    foreach ($mm in $menus[$role]) { if ($mm.key -eq $g) { $label = $mm.label; $tier = $mm.tier } }
    $hdr = "/**`n * N6 modules - $role / $g`n * menu label : $label`n * minimum tier: $tier`n *`n * Source-fragment. These files are concatenated in the order declared by`n * js/modules/$role/manifest.js and wrapped in the role's original IIFE by`n * tools/build.ps1 -> js/dist/$role.js. Concatenating every fragment in manifest`n * order reproduces $role.html's main script byte for byte.`n *`n * Do not reorder or edit by hand: run tools/build.ps1 after any change.`n */`n//__N6_BODY__`n"
    Write-Utf8 "js/modules/$role/$g.js" ($hdr + $text)
  }

  $man = "/**`n * N6 build manifest - $role`n *`n * Every unit of the original $role.html main script is stored in exactly one file`n * under js/modules/$role/. This array restores the original source order when the`n * fragments are concatenated.`n *`n * shape: [ '<file-stem>', <how many consecutive units come from that file> ]`n *`n * Regenerate with: powershell -ExecutionPolicy Bypass -File tools/build.ps1`n */`n"
  $manArr = ($runs | ForEach-Object { "  ['" + $_.g + "', " + $_.n + "]" }) -join ",`n"
  Write-Utf8 "js/modules/$role/manifest.js" ($man + "//__N6_MANIFEST__`nexport const MANIFEST_" + $role.ToUpperInvariant() + " = [`n" + $manArr + "`n];`n`nexport default MANIFEST_" + $role.ToUpperInvariant() + ";`n")

  # extras (standalone IIFEs, load after the bundle)
  $ex = @()
  $n = 0
  foreach ($e in $extras) {
    $n++
    $nm = 'extra-' + $n + '-' + ($(if ($e.Id) { $e.Id } else { 'script' }) -replace '[^A-Za-z0-9_-]','_') + '.js'
    Write-Utf8 "js/modules/$role/$nm" ("/**`n * N6 modules - $role / extra script #$n`n *`n * Standalone IIFE that already ran after the role bundle in $role.html.`n * Keep as its own file: it is loaded verbatim, in file-name order, after`n * js/dist/$role.js`n */`n`n" + $e.Js)
    $ex += $nm
  }

  # dist bundle (lossless)
  $bundle = $pre + ($units -join '') + $post
  $verify = $pre + (($units | ForEach-Object { $_ }) -join '') + $post
  Write-Utf8 "js/dist/$role.js" ("/**`n * N6 dist bundle - $role`n *`n * GENERATED FILE - do not edit. Source of truth is js/modules/$role/*.js`n * Rebuilt by tools/build.ps1; concatenation is byte-identical to the`n * original <script> block in $role.html.`n */`n`n" + $bundle)
  $ok = ($verify -ceq $main)

  # the IIFE wrapper, so tools/build.ps1 can rebuild without reading js/dist.
  # The newline belongs to the marker line, never to the content, so what
  # follows === PREFIX === is the prefix verbatim (and likewise for the suffix).
  $wrapper = "=== PREFIX ===`n" + $pre + "=== SUFFIX ===`n" + $post
  Write-Utf8 "js/modules/$role/_iife.txt" $wrapper

  $log += ("{0,-11} units={1,4} files={2,2} extras={3} roundtrip={4}" -f $role, $units.Count, $groups.Count, $n, $ok)
}
$log