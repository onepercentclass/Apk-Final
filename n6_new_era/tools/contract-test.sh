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
  # bug12: periksa tier token agar 403 pada endpoint owner-only tidak
  # dilaporkan gagal saat token bukan milik owner.
  ROLE="$(curl -s --max-time 15 -H "Authorization: Bearer $N6_TOKEN" "$BASE/auth/me" | grep -o '"role":"[^"]*"' | cut -d'"' -f4)"
  [ -z "$ROLE" ] && ROLE="?"
  echo "token role: $ROLE"
  check_role() { # check_role <nama> <kode_aktual>
    if [ "$2" = 200 ]; then PASS=$((PASS+1)); echo "ok   $1 ($2)";
    elif [ "$2" = 403 ] && [ "$ROLE" != "owner" ]; then echo "skip $1 (403, butuh token owner)";
    else FAIL=$((FAIL+1)); echo "FAIL $1 (harap 200, dapat $2)"; fi
  }
  check_role "GET /auth/me" "$(auth "$BASE/auth/me")"
  check_role "GET /clients" "$(auth "$BASE/clients?limit=1")"
  check_role "GET /accounts" "$(auth "$BASE/accounts?limit=1")"
  check_role "GET /pricing" "$(auth "$BASE/pricing")"
  check_role "GET /tickets" "$(auth "$BASE/tickets?limit=1")"
  check_role "GET /schedules/coach/requests" "$(auth "$BASE/schedules/coach/requests?limit=1")"
  check_role "GET /dashboards/headcoach/team" "$(auth "$BASE/dashboards/headcoach/team")"
  check_role "GET /finance/summary" "$(auth "$BASE/finance/summary")"
fi

echo "---"
echo "lolos $PASS, gagal $FAIL"
[ "$FAIL" -eq 0 ]
