$ErrorActionPreference = 'Stop'
$WORK = 'C:\Users\Denis Bergkam I\AppData\Local\Temp\opencode\n6split\_work'
$SRC  = Join-Path $WORK 'src'
$N6   = Join-Path $WORK 'n6'
$utf8 = New-Object System.Text.UTF8Encoding($false)
$roles = @('owner','admin','headcoach','coach','client')
$log = @()

function Write-Utf8([string]$rel, [string]$text) {
  $p = Join-Path $N6 $rel
  $d = Split-Path $p -Parent
  if (-not (Test-Path $d)) { New-Item -ItemType Directory -Path $d -Force | Out-Null }
  [System.IO.File]::WriteAllText($p, $text, $utf8)
}

# =============================================== 1. dedupe shared extras
# hash only the code, not the generated header comment
$seen = @{}
foreach ($role in $roles) {
  $dir = Join-Path $N6 "js\modules\$role"
  if (-not (Test-Path $dir)) { continue }
  foreach ($f in Get-ChildItem $dir -Filter 'extra-*.js' | Sort-Object Name) {
    $t = [System.IO.File]::ReadAllText($f.FullName, $utf8)
    $ci = $t.IndexOf('*/')
    $code = if ($ci -ge 0) { $t.Substring($ci + 2).Trim() } else { $t.Trim() }
    $md5 = [System.Security.Cryptography.MD5]::Create()
    $h = [BitConverter]::ToString($md5.ComputeHash([System.Text.Encoding]::UTF8.GetBytes($code))).Replace('-','').Substring(0,12)
    if ($seen.ContainsKey($h)) {
      # prefer the original <script id="..."> carried in the file name
      $nm = $null
      if ($f.Name -match '^extra-\d+-(.+)\.js$' -and $Matches[1] -ne 'script') { $nm = $Matches[1] }
      if (-not $nm) {
        if ($code -match "const KEY='([^']+)'") { $nm = (($Matches[1] -replace '^n6:','') -replace ':v\d+$','') }
      }
      if (-not $nm) { $nm = 'shared-' + $h }
      $nm = ($nm -replace '[^A-Za-z0-9_-]','-') -replace '^-|-$',''
      $target = "js/shared/$nm.js"
      $hdr = '/**' + "`n" +
             ' * N6 shared module - ' + $nm + "`n" +
             ' *' + "`n" +
             ' * Was duplicated byte for byte in ' + (Split-Path (Split-Path $seen[$h] -Parent) -Leaf) + ' and ' + $role + '.html.' + "`n" +
             ' * Kept once here; both roles load this same file after their bundle.' + "`n" +
             ' *' + "`n" +
             ' * Standalone IIFE, already self-contained, so sharing it changes nothing.' + "`n" +
             ' */' + "`n`n"
      $want = $hdr + $code
      $tgtPath = Join-Path $N6 $target
      # Always re-derive. A plain Test-Path guard would let a stale copy from an
      # earlier run survive and keep text that no longer matches the sources.
      $have = if (Test-Path $tgtPath) { [System.IO.File]::ReadAllText($tgtPath, $utf8) } else { $null }
      if ($have -cne $want) { Write-Utf8 $target $want }
      # remove BOTH copies so the script is never evaluated twice
      if ($seen[$h] -ne $f.FullName) { Remove-Item $seen[$h] -Force }
      Remove-Item $f.FullName -Force
      $log += ('  dedupe: {0} + {1} -> js/shared/{2}.js  (one copy now, loaded once)' -f (Split-Path $seen[$h] -Leaf), $f.Name, $nm)
    } else {
      $seen[$h] = $f.FullName
    }
  }
}

# =============================================== 2. per-role view module
foreach ($role in $roles) {
  $html = [System.IO.File]::ReadAllText((Join-Path $SRC "$role.html"), $utf8)
  $bo = $html.IndexOf('<body')
  $bt = $html.IndexOf('>', $bo) + 1
  $bc = $html.LastIndexOf('</body>')
  $body = $html.Substring($bt, $bc - $bt)
  # drop the inline <script> blocks: they now live in js/dist and js/modules
  $body = [regex]::Replace($body, '(?s)<script.*?</script>', "`n<!-- N6: script block moved to js/modules/$role + js/dist/$role.js -->`n")
  # capture the <body> attributes of the original
  $attr = $html.Substring($bo, $bt - $bo)

  $esc = $body.Replace('\', '\\').Replace('`', '\`').Replace('${', '\${')
  $UP  = $role.ToUpperInvariant()
  $attrJs = $attr.Replace('\', '\\').Replace("'", "\'")

  $out = ''
  $out += '/**' + "`n"
  $out += ' * N6 view - ' + $role + "`n"
  $out += ' *' + "`n"
  $out += ' * The markup that used to sit inside <body> in ' + $role + '.html, kept byte for byte.' + "`n"
  $out += ' * Nothing was renamed, reordered or removed. The tier gate in js/core/access.js' + "`n"
  $out += ' * works purely off the data-panel / data-client-tab attributes that already exist' + "`n"
  $out += ' * on the navigation elements.' + "`n"
  $out += ' *' + "`n"
  $out += ' * Original <body> tag: ' + $attrJs + "`n"
  $out += ' */' + "`n`n"
  $out += 'export const BODY_ATTR = ''' + $attrJs + ''';' + "`n`n"
  $out += 'export const VIEW_' + $UP + ' = `' + $esc + '`;' + "`n`n"
  $out += 'export default VIEW_' + $UP + ';' + "`n"
  Write-Utf8 "js/views/$role.js" $out
  $log += ("  view: {0,-11} {1,7} chars" -f $role, $body.Length)
}

$log