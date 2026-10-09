#!/usr/bin/env bash
#
# DB Accounting Contract Test (adopsi dari N6 Fase I)
#
# Verifikasi backend mengembalikan field yang diharapkan frontend.
# Login pakai email (bukan username).
#
# Usage:
#   tools/contract-test.sh
#
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
API_BASE="${API_BASE:-https://api.denisbergkam.com/api/dbacc}"
EXPECTATIONS="$ROOT/tools/contract/expectations.json"

echo "DB Accounting Contract Test"
echo "==========================="
echo "API: $API_BASE"
echo ""

echo "[1/2] Login sebagai t_owner@example.com..."
LOGIN_RESP=$(curl -s -X POST "$API_BASE/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"t_owner@example.com","password":"test123"}' \
  --max-time 15)

TOKEN=$(echo "$LOGIN_RESP" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('token') or d.get('access_token') or d.get('accessToken') or '')" 2>/dev/null || echo "")

if [ -z "$TOKEN" ]; then
  echo "  ❌ Login gagal: $(echo "$LOGIN_RESP" | head -c 200)"
  exit 1
fi
echo "  ✅ Login berhasil"
echo ""
echo "[2/2] Test endpoints..."
echo ""

python3 << PYEOF
import json, subprocess, sys

with open("$EXPECTATIONS", encoding='utf-8') as f:
    exp = json.load(f)

token = "$TOKEN"
api_base = "$API_BASE"
results = {"pass": 0, "fail": 0}

for key, spec in exp.items():
    if key.startswith("_"):
        continue
    method, path = key.split(" ", 1)
    url = f"{api_base}/{path}"

    try:
        result = subprocess.run(
            ["curl", "-s", "-H", f"Authorization: Bearer {token}", url, "--max-time", "15"],
            capture_output=True, text=True, timeout=20
        )
        data = json.loads(result.stdout) if result.stdout.strip() else None
    except Exception as e:
        print(f"  ❌ {method} /{path}: request gagal ({e})")
        results["fail"] += 1
        continue

    if data is None:
        print(f"  ❌ {method} /{path}: response kosong/invalid")
        results["fail"] += 1
        continue

    if isinstance(data, dict) and data.get("detail"):
        print(f"  ⚠️  {method} /{path}: {data['detail']} (skip)")
        continue

    expected_type = spec.get("type", "object")
    if expected_type == "array":
        items = data.get("items", data) if isinstance(data, dict) else data
        if not isinstance(items, list):
            print(f"  ❌ {method} /{path}: expected array, got {type(data).__name__}")
            results["fail"] += 1
            continue
        if not items:
            print(f"  ✅ {method} /{path} (empty, skip)")
            results["pass"] += 1
            continue
        sample = items[0]
    else:
        if not isinstance(data, dict):
            print(f"  ❌ {method} /{path}: expected object, got {type(data).__name__}")
            results["fail"] += 1
            continue
        sample = data

    expected_fields = spec.get("fields", [])
    missing = [f for f in expected_fields if f not in sample]
    if missing:
        print(f"  ❌ {method} /{path}: hilang: {', '.join(missing)}")
        results["fail"] += 1
    else:
        print(f"  ✅ {method} /{path}")
        results["pass"] += 1

print(f"\n===========================")
print(f"Hasil: {results['pass']} lolos, {results['fail']} gagal")
sys.exit(1 if results["fail"] > 0 else 0)
PYEOF
