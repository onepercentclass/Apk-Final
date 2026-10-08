#!/usr/bin/env bash
# N6 New Era — contract test frontend <-> backend.
# Acceptance gate: 10/10 harus lolos sebelum rilis.
# Catatan: skrip ini HANYA ditulis di Phase 3; dijalankan mulai Phase 4.
set -u
BASE="https://api.denisbergkam.com/api/n6/v1"
PASS=0
FAIL=0

check() { # check <nama> <http_code_ekspektasi> <kode_aktual>
  if [ "$3" = "$2" ]; then PASS=$((PASS+1)); echo "ok   $1 ($3)";
  else FAIL=$((FAIL+1)); echo "FAIL $1 (harap $2, dapat $3)"; fi
}

code_of() { curl -s -o /dev/null -w "%{http_code}" --max-time 15 "$1"; }

# 1-2: endpoint publik terekam tanpa token
check "GET /auth/me tanpa token -> 401" 401 "$(code_of "$BASE/auth/me")"
check "GET /clients tanpa token -> 401" 401 "$(code_of "$BASE/clients?limit=1")"

# 3-10: butuh token; gunakan N6_TOKEN dari environment (jangan hardcode)
if [ -z "${N6_TOKEN:-}" ]; then
  echo "lewati 3-10: set N6_TOKEN untuk cek endpoint ber-token"
else
  auth() { curl -s -o /dev/null -w "%{http_code}" --max-time 15 -H "Authorization: Bearer $N6_TOKEN" "$1"; }
  check "GET /auth/me" 200 "$(auth "$BASE/auth/me")"
  check "GET /clients" 200 "$(auth "$BASE/clients?limit=1")"
  check "GET /accounts" 200 "$(auth "$BASE/accounts?limit=1")"
  check "GET /pricing" 200 "$(auth "$BASE/pricing")"
  check "GET /tickets" 200 "$(auth "$BASE/tickets?limit=1")"
  check "GET /schedules/coach/requests" 200 "$(auth "$BASE/schedules/coach/requests?limit=1")"
  check "GET /dashboards/headcoach/team" 200 "$(auth "$BASE/dashboards/headcoach/team")"
  check "GET /finance/summary" 200 "$(auth "$BASE/finance/summary")"
fi

echo "---"
echo "lolos $PASS, gagal $FAIL"
[ "$FAIL" -eq 0 ]
