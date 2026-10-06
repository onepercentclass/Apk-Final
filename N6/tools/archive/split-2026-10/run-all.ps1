$ErrorActionPreference = 'Stop'
# Full N6 pipeline. Order matters.
$here = Split-Path -Parent $MyInvocation.MyCommand.Path
$steps = @('00-normalize.ps1','05-assets.ps1','20-css.ps1','30-js.ps1','40-views.ps1','45-tiers.ps1','50-bundles.ps1')
foreach ($s in $steps) {
  Write-Output ""
  Write-Output "=================== $s ==================="
  & powershell -NoProfile -ExecutionPolicy Bypass -File (Join-Path $here $s)
  if ($LASTEXITCODE -ne 0) { throw "$s failed with exit code $LASTEXITCODE" }
}
Write-Output ""
Write-Output "pipeline complete"