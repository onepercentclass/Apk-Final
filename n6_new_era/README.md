# N6 New Era

Rebuild frontend N6 dari nol. Backend tidak berubah — kontrak API sama
(`tools/contract-test.sh` sebagai pintu penerimaan).

## Status

- Phase 1 (Desain VNPC): selesai → `design_vnpc.md`
- Phase 2 (Flow Task): belum dimulai

## Struktur

```
n6-new-era/
  index.html
  MENU_MAP.md            # peta menu aplikasi lama (acuan)
  design_vnpc.md         # desain hasil Phase 1
  assets/icons/  assets/images/
  css/                   # tokens, reset, base, components, pages, dark
  js/
    core/                # api, auth, router, store, config, logger, utils
    ui/                  # komponen presentasional
    shared/              # fitur dipakai 2+ role (clients, schedule, messaging, members, password, pricing)
    owner/  admin/  head-coach/  coach/  client/   # khusus tiap role
  tools/                 # contract-test.sh, smoke-test.sh
```

Prinsip: folder role hanya berisi kekhususan role; sisanya berbagi di
`js/shared/`. Tanpa build step — ES modules native.

## Menjalankan

```bash
cd n6-new-era
python3 -m http.server 8080
# buka http://localhost:8080
```

## Aturan pembangunan

Pekerjaan mengikuti protokol fase di `design_vnpc.md`:
Phase 1 Desain → Phase 2 Flow Task → Phase 3 Building → Phase 4 Debugging → Phase 5 Fix.
Tidak ada fase yang dilompati atau digabung.
