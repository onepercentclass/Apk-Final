$ErrorActionPreference = 'Stop'
$src = 'C:\Users\Denis Bergkam I\Downloads\APK N6\APK N6'
$work = 'C:\Users\Denis Bergkam I\AppData\Local\Temp\opencode\n6split\_work'

$srcDir = Join-Path $work 'src'
if (Test-Path $srcDir) { Remove-Item $srcDir -Recurse -Force }
New-Item -ItemType Directory -Path $srcDir -Force | Out-Null

$cp1252 = [System.Text.Encoding]::GetEncoding(1252)

function Convert-Lenient([byte[]]$bytes) {
  # Decode as UTF-8 where the byte sequence is valid; fall back to cp1252 per byte otherwise.
  # The five originals are a mix: some strings are already UTF-8, others are
  # windows-1252 that the file simply declares as UTF-8. Decoding strictly as
  # UTF-8 turns the latter into U+FFFD; decoding as cp1252 turns the former into
  # mojibake. So: take a multi-byte sequence only when it is well formed and
  # not an overlong / surrogate / out-of-range encoding, otherwise read one byte
  # as cp1252 and resync.
  $sb = New-Object System.Text.StringBuilder
  $i = 0; $n = $bytes.Length
  while ($i -lt $n) {
    $b0 = $bytes[$i]
    if ($b0 -lt 0x80) { [void]$sb.Append([char]$b0); $i++; continue }

    $len = 0
    if     ($b0 -ge 0xC2 -and $b0 -le 0xDF) { $len = 2 }
    elseif ($b0 -ge 0xE0 -and $b0 -le 0xEF) { $len = 3 }
    elseif ($b0 -ge 0xF0 -and $b0 -le 0xF4) { $len = 4 }

    if ($len -gt 0 -and ($i + $len) -le $n) {
      # seed the accumulator with the payload bits of the lead byte, then shift
      # in one 6-bit group per continuation byte
      $cp = [int]$b0 -band (0x7F -shr $len)
      $ok = $true
      for ($k = 1; $k -lt $len; $k++) {
        $bk = $bytes[$i + $k]
        if (($bk -band 0xC0) -ne 0x80) { $ok = $false; break }
        $cp = ($cp -shl 6) -bor ([int]$bk -band 0x3F)
      }
      if ($ok) {
        $min = if ($len -eq 2) { 0x80 } elseif ($len -eq 3) { 0x800 } else { 0x10000 }
        $surrogate = ($cp -ge 0xD800 -and $cp -le 0xDFFF)
        if ($cp -ge $min -and $cp -le 0x10FFFF -and -not $surrogate) {
          if ($cp -le 0xFFFF) { [void]$sb.Append([char]$cp) }
          else { [void]$sb.Append([char]::ConvertFromUtf32($cp)) }
          $i += $len
          continue
        }
      }
    }

    [void]$sb.Append($cp1252.GetString([byte[]]@($b0))); $i++
  }
  return $sb.ToString()
}

$utf8 = New-Object System.Text.UTF8Encoding($false)
$report = @()
foreach ($f in Get-ChildItem $src -Filter *.html | Sort-Object Name) {
  $bytes = [System.IO.File]::ReadAllBytes($f.FullName)
  $text = Convert-Lenient $bytes
  $dest = Join-Path $work ('src\' + $f.Name)
  [System.IO.File]::WriteAllText($dest, $text, $utf8)
  $replaced = ([regex]::Matches($text, [char]0xFFFD)).Count
  $report += ('{0,-15} {1,8} bytes -> {2,8} chars  U+FFFD={3}' -f $f.Name, $bytes.Length, $text.Length, $replaced)
}
$report

# sanity: show a decoded sample that previously rendered as mojibake
Write-Output ''
Write-Output '--- decoded sample (title lines) ---'
foreach ($f in Get-ChildItem (Join-Path $work 'src') -Filter *.html | Sort-Object Name) {
  $t = [System.IO.File]::ReadAllText($f.FullName, $utf8)
  $m = [regex]::Match($t, '<title>(.*?)</title>')
  '{0,-15} {1}' -f $f.Name, $m.Groups[1].Value
}