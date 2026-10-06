$ErrorActionPreference = 'Stop'
$N6 = 'C:\Users\Denis Bergkam I\AppData\Local\Temp\opencode\n6split\_work\n6'
$utf8 = New-Object System.Text.UTF8Encoding($false)

$tierDir = Join-Path $N6 'backend\tiers'
$files = Get-ChildItem $tierDir -Filter 'tier-*.json' | Sort-Object Name
$defs = @()
foreach ($f in $files) {
  $j = Get-Content $f.FullName -Raw | ConvertFrom-Json
  $defs += ,@{
    Tier = [int]$j.tier; Role = [string]$j.role; Label = [string]$j.label
    Desc = [string]$j.description; Menus = @($j.menus); Actions = $j.actions
  }
}
$defs = @($defs | Sort-Object Tier)

function J([string]$s) { return ($s -replace '\\', '\\\\' -replace "'", "\'") }

$out = ''
$out += '/**' + "`n"
$out += ' * N6 - tier access matrix (FRONTEND MIRROR)' + "`n"
$out += ' *' + "`n"
$out += ' * GENERATED FILE - do not edit by hand.' + "`n"
$out += ' * Source of truth: backend/tiers/tier-*.json (one file per role tier).' + "`n"
$out += ' * Regenerate with:  powershell -ExecutionPolicy Bypass -File tools/build.ps1' + "`n"
$out += ' *' + "`n"
$out += ' * Access rule' + "`n"
$out += ' * -----------' + "`n"
$out += ' *   tier 0 = owner     -> full access to every menu and every action' + "`n"
$out += ' *   tier 1 = admin' + "`n"
$out += ' *   tier 2 = headcoach' + "`n"
$out += ' *   tier 3 = coach' + "`n"
$out += ' *   tier 4 = client' + "`n"
$out += ' *' + "`n"
$out += ' * Each tier file lists the menus that role may open and, per domain, the' + "`n"
$out += ' * actions it may perform. There is no separate tier-0 JSON: owner is the' + "`n"
$out += ' * implicit "everything is allowed" case.' + "`n"
$out += ' */' + "`n`n"

foreach ($d in $defs) {
  $var = 'TIER_' + $d.Tier.ToString('00') + '_' + $d.Role.ToUpperInvariant()
  $out += '/** tier ' + $d.Tier + ' - ' + $d.Label + ' */' + "`n"
  $out += 'export const ' + $var + ' = {' + "`n"
  $out += '  tier: ' + $d.Tier + ',' + "`n"
  $out += '  role: ' + "'" + $d.Role + "'," + "`n"
  $out += '  label: ' + "'" + (J $d.Label) + "'," + "`n"
  $out += '  description: ' + "'" + (J $d.Desc) + "'," + "`n"
  $out += '  menus: [' + (($d.Menus | ForEach-Object { "'" + $_ + "'" }) -join ', ') + '],' + "`n"
  $out += '  actions: {' + "`n"
  $names = @($d.Actions.PSObject.Properties.Name | Sort-Object)
  for ($i = 0; $i -lt $names.Count; $i++) {
    $n = $names[$i]
    $vals = @($d.Actions.$n)
    $arr = if ($vals.Count -eq 0) { '[]' } else { '[' + (($vals | ForEach-Object { "'" + $_ + "'" }) -join ', ') + ']' }
    $comma = if ($i -lt $names.Count - 1) { ',' } else { '' }
    $out += '    ' + $n + ': ' + $arr + $comma + "`n"
  }
  $out += '  },' + "`n"
  $out += '};' + "`n`n"
}

$out += 'export const TIERS = {' + "`n"
$out += (($defs | ForEach-Object { "  " + $_.Tier + ": TIER_" + $_.Tier.ToString('00') + '_' + $_.Role.ToUpperInvariant() }) -join ",") + "`n"
$out += '};' + "`n`n"
$out += 'export default TIERS;' + "`n"

$p = Join-Path $N6 'js\core\tiers.js'
$pd = Split-Path $p -Parent
if (-not (Test-Path $pd)) { New-Item -ItemType Directory -Path $pd -Force | Out-Null }
[System.IO.File]::WriteAllText($p, $out, $utf8)
'wrote js/core/tiers.js  (' + $out.Length + ' chars, ' + $defs.Count + ' tiers)'