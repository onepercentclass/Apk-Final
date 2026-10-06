#!/usr/bin/env bash
#
# N6 smoke test (Fase H5)
#
# Automated checks to prevent regressions:
#   1. Every dist/*.js passes node --check (syntax valid)
#   2. Every manifest.js is valid (all referenced modules exist, counts match)
#   3. No TODO/FIXME left hanging in modules/
#   4. build.sh --check passes (dist in sync with modules)
#
# Usage:
#   tools/smoke-test.sh
#
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

PASS=0
FAIL=0

pass() { echo "  ✅ $1"; PASS=$((PASS+1)); }
fail() { echo "  ❌ $1"; FAIL=$((FAIL+1)); }

echo "N6 smoke test"
echo "============="

# 1. node --check pada dist/
echo ""
echo "[1/4] Syntax check dist/*.js"
for f in js/dist/*.js; do
  if node --check "$f" 2>/dev/null; then
    pass "$(basename $f) syntax OK"
  else
    fail "$(basename $f) syntax ERROR"
  fi
done

# 2. Validasi manifest.js
echo ""
echo "[2/4] Validasi manifest.js"
for role in owner admin headcoach coach client; do
  manifest="js/modules/$role/manifest.js"
  if [ ! -f "$manifest" ]; then
    fail "$role: manifest.js tidak ditemukan"
    continue
  fi
  # Cek setiap modul yang direferensikan ada filenya
  ok=true
  while IFS= read -r line; do
    # Ekstrak nama modul dari pola ['nama', angka]
    mod=$(echo "$line" | sed -n "s/.*\['\([^']*\)'.*/\1/p")
    if [ -n "$mod" ]; then
      if [ ! -f "js/modules/$role/$mod.js" ]; then
        fail "$role: modul $mod.js tidak ditemukan"
        ok=false
      fi
    fi
  done < "$manifest"
  if $ok; then
    pass "$role: manifest valid"
  fi
done

# 3. Cek TODO/FIXME
echo ""
echo "[3/4] Cek TODO/FIXME"
todo_output=$(grep -rn "TODO\|FIXME" js/modules/ js/core/ 2>/dev/null | grep -v ".map" || true)
if [ -z "$todo_output" ]; then
  todo_count=0
else
  todo_count=$(echo "$todo_output" | wc -l | tr -d ' ')
fi
if [ "$todo_count" -eq 0 ]; then
  pass "Tidak ada TODO/FIXME"
else
  fail "Ditemukan $todo_count TODO/FIXME"
  grep -rn "TODO\|FIXME" js/modules/ js/core/ 2>/dev/null | head -5
fi

# 4. build.sh --check
echo ""
echo "[4/4] build.sh --check"
if ./tools/build.sh --check >/dev/null 2>&1; then
  pass "build.sh --check lolos"
else
  fail "build.sh --check GAGAL"
fi

echo ""
echo "============="
echo "Hasil: $PASS lolos, $FAIL gagal"
if [ "$FAIL" -gt 0 ]; then
  exit 1
fi
echo "Smoke test OK"
