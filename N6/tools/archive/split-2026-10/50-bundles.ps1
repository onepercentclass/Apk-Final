$ErrorActionPreference = 'Stop'
$N6 = 'C:\Users\Denis Bergkam I\AppData\Local\Temp\opencode\n6split\_work\n6'
$utf8 = New-Object System.Text.UTF8Encoding($false)
$roles = @('owner','admin','headcoach','coach','client')

# which shared modules each role loads after its bundle
$sharedPerRole = @{
  owner     = @('js/shared/coach-requests.js', 'js/shared/n6-monthly-pdf-reports.js')
  admin     = @('js/shared/coach-requests.js', 'js/shared/n6-monthly-pdf-reports.js')
  headcoach = @()
  coach     = @()
  client    = @()
}

$out = ''
$out += '/**' + "`n"
$out += ' * N6 - generated asset manifest' + "`n"
$out += ' *' + "`n"
$out += ' * GENERATED FILE - do not edit by hand.' + "`n"
$out += ' * Rebuilt by tools/build.ps1 from css/<role>/ORDER.txt and the contents of' + "`n"
$out += ' * js/modules/<role>/. Keeping the order here is what guarantees that the' + "`n"
$out += ' * split application renders exactly like the five original single files.' + "`n"
$out += ' */' + "`n`n"
$out += 'export const ROLE_ASSETS = {' + "`n"

for ($i = 0; $i -lt $roles.Count; $i++) {
  $role = $roles[$i]

  $orderFile = Join-Path $N6 "css\$role\ORDER.txt"
  $css = @()
  foreach ($line in Get-Content $orderFile) {
    if ($line -match '^\s*#' -or $line.Trim() -eq '') { continue }
    $f = ($line -split "`t")[0].Trim()
    if ($f) { $css += "css/$role/$f" }
  }

  $extras = @()
  $dir = Join-Path $N6 "js\modules\$role"
  if (Test-Path $dir) {
    foreach ($f in Get-ChildItem $dir -Filter 'extra-*.js' | Sort-Object Name) { $extras += "js/modules/$role/$($f.Name)" }
  }
  $shared = @($sharedPerRole[$role] | Where-Object { Test-Path (Join-Path $N6 $_) })

  $scripts = @("js/dist/$role.js") + $extras + $shared

  $sep = if ($i -lt $roles.Count - 1) { ',' } else { '' }
  $out += "  $role : {" + "`n"
  $out += '    css: [' + (($css | ForEach-Object { "'" + $_ + "'" }) -join ', ') + '],' + "`n"
  $out += '    scripts: [' + (($scripts | ForEach-Object { "'" + $_ + "'" }) -join ', ') + '],' + "`n"
  $out += "  }$sep" + "`n"
}
$out += '};' + "`n`n"
$out += 'export default ROLE_ASSETS;' + "`n"

$p = Join-Path $N6 'js\core\bundles.js'
$pd = Split-Path $p -Parent
if (-not (Test-Path $pd)) { New-Item -ItemType Directory -Path $pd -Force | Out-Null }
[System.IO.File]::WriteAllText($p, $out, $utf8)
'wrote js/core/bundles.js (' + $out.Length + ' chars)'