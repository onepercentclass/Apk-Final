#!/usr/bin/env bash
# N6 New Era — smoke test: cek sintaks semua modul JS + keberadaan file wajib.
# Catatan: skrip ini HANYA ditulis di Phase 3; dijalankan mulai Phase 4.
set -u
DIR="$(cd "$(dirname "$0")/.." && pwd)"
FAIL=0

req_file() {
  if [ -f "$DIR/$1" ]; then echo "ok   $1"; else echo "FAIL hilang: $1"; FAIL=$((FAIL+1)); fi
}

for f in index.html \
  css/tokens.css css/reset.css css/base.css css/components.css css/pages.css \
  js/main.js \
  js/core/config.js js/core/logger.js js/core/utils.js js/core/api.js \
  js/core/store.js js/core/auth.js js/core/router.js \
  js/ui/toast.js js/ui/modal.js js/ui/empty-state.js js/ui/table.js \
  js/ui/badge.js js/ui/stat-card.js \
  js/shared/password/password.js js/shared/members/members.js \
  js/shared/clients/clients.js js/shared/messaging/messaging.js \
  js/shared/schedule/schedule.js js/shared/pricing/pricing.js \
  js/client/laporan.js js/client/performa.js \
  js/coach/beranda.js js/coach/informasi.js js/coach/absensi.js \
  js/admin/beranda.js \
  js/head-coach/beranda.js js/head-coach/program.js js/head-coach/monitoring.js \
  js/head-coach/koreksi.js js/head-coach/atlet.js js/head-coach/coach.js \
  js/owner/beranda.js js/owner/keuangan.js js/owner/komisi.js; do
  req_file "$f"
done

if command -v node >/dev/null 2>&1; then
  while IFS= read -r f; do
    if node --check "$DIR/$f" 2>/dev/null; then echo "ok   sintaks $f";
    else echo "FAIL sintaks: $f"; FAIL=$((FAIL+1)); fi
  done < <(cd "$DIR" && find js -name "*.js")
else
  echo "lewati cek sintaks: node tidak tersedia"
fi

echo "---"
[ "$FAIL" -eq 0 ] && echo "SMOKE OK" || echo "SMOKE GAGAL ($FAIL)"
[ "$FAIL" -eq 0 ]
