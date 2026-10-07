#!/usr/bin/env bash
#
# N6 Contract Test (Fase I)
#
# Verifikasi bahwa backend mengembalikan field yang diharapkan frontend.
# Menggantikan kebutuhan mock server — test langsung ke backend asli.
#
# Usage:
#   tools/contract-test.sh                    # test ke production API
#   API_BASE=https://staging... tools/contract-test.sh
#
# Membutuhkan: curl, python3
# Kredensial test: t_owner / test123 (di-set via DB)
#
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
API_BASE="${API_BASE:-https://api.denisbergkam.com/api/n6/v1}"
EXPECTATIONS="$ROOT/tools/contract/expectations.json"

PASS=0
FAIL=0
WARN=0

pass() { echo "  ✅ $1"; PASS=$((PASS+1)); }
fail() { echo "  ❌ $1"; FAIL=$((FAIL+1)); }
warn() { echo "  ⚠️  $1"; WARN=$((WARN+1)); }

echo "N6 Contract Test"
echo "================"
echo "API: $API_BASE"
echo ""

# 1. Login untuk dapatkan token
echo "[1/2] Login sebagai t_owner..."
LOGIN_RESP=$(curl -s -X POST "$API_BASE/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"t_owner","password":"test123"}' \
  --max-time 15)

TOKEN=$(echo "$LOGIN_RESP" | python3 -c "import sys,json; print(json.load(sys.stdin).get('access_token',''))" 2>/dev/null || echo "")

if [ -z "$TOKEN" ]; then
  echo "  ❌ Login gagal. Response:"
  echo "$LOGIN_RESP" | head -5
  exit 1
fi
echo "  ✅ Login berhasil (token diperoleh)"
echo ""

# 2. Test setiap endpoint
echo "[2/2] Test endpoints..."
echo ""

# Baca expectations dan test satu per satu
python3 << PYEOF
import json, subprocess, sys

with open("$EXPECTATIONS", encoding='utf-8') as f:
    exp = json.load(f)

token = "$TOKEN"
api_base = "$API_BASE"

results = {"pass": 0, "fail": 0, "warn": 0}

for key, spec in exp.items():
    if key.startswith("_"):
        continue
    method, path = key.split(" ", 1)
    query = spec.get("query", "")
    url = f"{api_base}/{path}"
    if query:
        url += f"?{query}"

    # Lakukan request
    try:
        result = subprocess.run(
            ["curl", "-s", "-H", f"Authorization: Bearer {token}", url, "--max-time", "15"],
            capture_output=True, text=True, timeout=20
        )
        body = result.stdout
        data = json.loads(body) if body.strip() else None
    except Exception as e:
        print(f"  ❌ {method} /{path}: request gagal ({e})")
        results["fail"] += 1
        continue

    if data is None:
        print(f"  ❌ {method} /{path}: response kosong/invalid JSON")
        results["fail"] += 1
        continue

    # Cek tipe
    expected_type = spec.get("type", "object")
    if expected_type == "array":
        # Backend mungkin return {items: [...]} atau langsung [...]
        items = data.get("items", data) if isinstance(data, dict) else data
        if not isinstance(items, list):
            print(f"  ❌ {method} /{path}: expected array, got {type(data).__name__}")
            results["fail"] += 1
            continue
        sample = items[0] if items else {}
    else:
        if not isinstance(data, dict):
            print(f"  ❌ {method} /{path}: expected object, got {type(data).__name__}")
            results["fail"] += 1
            continue
        sample = data

    # Cek fields (skip jika array kosong)
    expected_fields = spec.get("fields", [])
    if expected_type == "array" and not items:
        print(f"  ✅ {method} /{path} (empty array, skip field check)")
        results["pass"] += 1
        continue

    missing = [f for f in expected_fields if f not in sample]
    # Field tambahan (hanya info, tidak fail)
    extra = [k for k in sample.keys() if k not in expected_fields] if isinstance(sample, dict) else []

    if missing:
        print(f"  ❌ {method} /{path}: hilang: {', '.join(missing)}")
        results["fail"] += 1
    else:
        msg = f"  ✅ {method} /{path} ({len(expected_fields)}/{len(expected_fields)} field)"
        if extra and len(extra) <= 3:
            msg += f" [+{len(extra)} tambahan]"
        print(msg)
        results["pass"] += 1

print(f"\n================")
print(f"Hasil: {results['pass']} lolos, {results['fail']} gagal")
sys.exit(1 if results["fail"] > 0 else 0)
PYEOF

EXIT_CODE=$?
echo ""
if [ $EXIT_CODE -eq 0 ]; then
  echo "Contract test OK — frontend dan backend selaras"
else
  echo "Contract test GAGAL — ada mismatch frontend/backend"
fi
exit $EXIT_CODE
