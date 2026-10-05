<#
.SYNOPSIS
    Rebuilds js/dist/<role>.js from the per-menu source fragments.

.DESCRIPTION
    The five original dashboards were single files: one giant <script> block per
    role. Those blocks have been split into one file per sidebar menu under
    js/modules/<role>/, but the split must never change behaviour, and a single
    IIFE cannot span several files at runtime without an eval.

    So the fragments are the source of truth and js/dist/<role>.js is the
    artefact the browser loads. This script reassembles it:

        _iife.txt            the original (function(){ ... })(); wrapper
        <menu>.js            the units that belong to that menu, in source order,
                             separated by the /*__N6_UNIT__*/ sentinel
        manifest.js          the run-length list that restores the exact original
                             interleaving of those fragments

    After reassembling, the result is compared byte for byte with the committed
    js/dist/<role>.js. A mismatch is a hard error: it means someone reordered or
    edited a fragment without updating the manifest, which would silently change
    hoisting and break the role.

.PARAMETER Role
    Limit the build to one role. Omit to build all five.

.PARAMETER Check
    Do not write anything. Exit non-zero if any bundle would change.

.EXAMPLE
    powershell -ExecutionPolicy Bypass -File tools/build.ps1
    powershell -ExecutionPolicy Bypass -File tools/build.ps1 -Role owner -Check
#>
[CmdletBinding()]
param(
  [ValidateSet('owner', 'admin', 'headcoach', 'coach', 'client')]
  [string[]] $Role,

  [switch] $Check
)

$ErrorActionPreference = 'Stop'

$Root = Split-Path -Parent $PSScriptRoot
if (-not $Root) { $Root = (Get-Location).Path }

$Utf8 = New-Object System.Text.UTF8Encoding($false)
$Sentinel = '/*__N6_UNIT__*/'
$BodyMark = '//__N6_BODY__'
$ManifestMark = '//__N6_MANIFEST__'
$AllRoles = @('owner', 'admin', 'headcoach', 'coach', 'client')

function Write-Step([string]$Message) {
  Write-Host "  $Message"
}

function Get-Units([string]$File) {
  <#
    Split one fragment file into its individual units. The prose header ends at
    the //__N6_BODY__ marker, not at the first "*/", so the header can never
    leak a newline into the reassembled bundle.
  #>
  $text = [System.IO.File]::ReadAllText($File, $Utf8)
  $m = $text.IndexOf($BodyMark)
  if ($m -lt 0) { throw "fragment $File has no $BodyMark marker" }
  $code = $text.Substring($m + $BodyMark.Length + 1)
  return @($code -split [regex]::Escape($Sentinel))
}

function Get-ManifestRuns([string]$File) {
  <# Read [ 'file', count ], ... out of manifest.js without executing JS. #>
  $text = [System.IO.File]::ReadAllText($File, $Utf8)
  $m = $text.IndexOf($ManifestMark)
  if ($m -lt 0) { throw "manifest $File has no $ManifestMark marker" }
  $body = $text.Substring($m + $ManifestMark.Length)
  $body = $body.Substring(0, $body.IndexOf('];'))
  $runs = @()
  foreach ($m in [regex]::Matches($body, "\[\s*'([^']+)'\s*,\s*(\d+)\s*\]")) {
    $runs += [pscustomobject]@{ File = $m.Groups[1].Value; Count = [int]$m.Groups[2].Value }
  }
  return $runs
}

function Get-Wrapper([string]$File) {
  <#
    Read the === PREFIX === / === SUFFIX === pair out of _iife.txt. The newline
    after each marker terminates the marker line and is not part of the content,
    so Prefix and Suffix come back verbatim.
  #>
  $text = [System.IO.File]::ReadAllText($File, $Utf8)
  $pm = $text.IndexOf('=== PREFIX ===')
  $sm = $text.IndexOf('=== SUFFIX ===')
  if ($pm -lt 0 -or $sm -lt 0) { throw "wrapper $File is missing its PREFIX/SUFFIX markers" }
  $p = $pm + '=== PREFIX ==='.Length
  $s = $sm + '=== SUFFIX ==='.Length
  if ($text[$p] -eq "`n") { $p++ }
  if ($text[$s] -eq "`n") { $s++ }
  return [pscustomobject]@{
    Prefix = $text.Substring($p, $sm - $p)
    Suffix = $text.Substring($s)
  }
}

$roles = if ($Role) { $Role } else { $AllRoles }
$failed = @()

foreach ($r in $roles) {
  $modDir = Join-Path $Root "js\modules\$r"
  if (-not (Test-Path $modDir)) { Write-Host "skip $r (no js/modules/$r)"; continue }

  Write-Host ""
  Write-Host "N6 build :: $r"

  $wrapper = Get-Wrapper (Join-Path $modDir '_iife.txt')
  $runs = Get-ManifestRuns (Join-Path $modDir 'manifest.js')

  $cache = @{}
  foreach ($run in $runs) {
    if ($cache.ContainsKey($run.File)) { continue }
    $frag = Join-Path $modDir ($run.File + '.js')
    if (-not (Test-Path $frag)) { throw "${r}: manifest references $($run.File).js but the file is missing" }
    # @( ) matters: a one-unit fragment would otherwise come back as a bare
    # string, and $units[0] on a string yields its first character
    $units = @(Get-Units $frag)
    $cache[$run.File] = $units
    Write-Step ("{0,-16} {1,4} units" -f ($run.File + '.js'), $units.Count)
  }

  # walk the manifest, pulling units in order. A file may appear in several
  # separate runs, so track a cursor per file instead of restarting at 0.
  $ordered = New-Object System.Text.StringBuilder
  $cursor = @{}
  foreach ($run in $runs) {
    $units = $cache[$run.File]
    $from = if ($cursor.ContainsKey($run.File)) { $cursor[$run.File] } else { 0 }
    $to = $from + $run.Count
    if ($to -gt $units.Count) {
      throw "${r}: manifest wants units $from..$($to - 1) from $($run.File).js but it only holds $($units.Count)"
    }
    for ($i = $from; $i -lt $to; $i++) { [void]$ordered.Append($units[$i]) }
    $cursor[$run.File] = $to
  }

  foreach ($run in $runs) {
    if ($cursor[$run.File] -ne $cache[$run.File].Count) {
      throw "${r}: $($run.File).js holds $($cache[$run.File].Count) units but the manifest only consumes $($cursor[$run.File])"
    }
  }

  $built = $wrapper.Prefix + $ordered.ToString() + $wrapper.Suffix

  $header = "/**`n * N6 dist bundle - $r`n *`n" +
            " * GENERATED FILE - do not edit. Source of truth is js/modules/$r/*.js`n" +
            " * Rebuilt by tools/build.ps1; concatenation is byte-identical to the`n" +
            " * original <script> block in $r.html.`n */`n`n"

  $distPath = Join-Path $Root "js\dist\$r.js"
  $existing = if (Test-Path $distPath) { [System.IO.File]::ReadAllText($distPath, $Utf8) } else { $null }

  # exact comparison, no trimming: whitespace is part of the contract
  if ($null -ne $existing -and $existing -ceq ($header + $built)) {
    Write-Step 'bundle already up to date'
    continue
  }

  if ($Check) {
    $failed += $r
    Write-Step 'DIFFERS from js/dist - run again without -Check to rebuild'
    continue
  }

  [System.IO.File]::WriteAllText($distPath, $header + $built, $Utf8)
  Write-Step ("wrote js/dist/$r.js ({0} chars)" -f $built.Length)
}

Write-Host ""
if ($failed.Count -gt 0) {
  Write-Host "build check FAILED for: $($failed -join ', ')"
  exit 1
}
Write-Host "build ok"
exit 0