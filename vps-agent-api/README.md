# agent-api — kendali VPS via HTTPS

Pengganti SSH untuk agen: service kecil (FastAPI) di VPS yang menerima
perintah admin lewat HTTPS. Dibuat karena egress proxy sandbox memblokir
port 22.

## Arsitektur

```
agen --HTTPS:443--> nginx (TLS + rate limit) --> agent-api (user `agentapi`, 127.0.0.1:8777)
                                                        |
                          wrapper root (/usr/local/sbin/agent-api-priv, arg divalidasi ketat)
                          role postgres `agentapi` (grant minimal)
```

- **Tidak ada shell bebas.** `/shell` hanya mengizinkan pola allowlist read-only.
- **DB:** `/db/query` hanya SELECT; `/db/reset-password` operasi tetap.
- API tidak jalan sebagai root dan tidak bisa memodifikasi dirinya sendiri.
- Semua request tercatat di `/var/log/agent-api/audit.log`.

## Instalasi (sekali, di VPS sebagai root)

```bash
sudo bash setup.sh
```

Lalu tempel `nginx-snippet.conf` ke konfigurasi nginx dan reload.
Token API hanya tampil sekali saat instalasi — simpan baik-baik.

Catatan:
- `AGENT_API_BACKEND_SRC` (default `backend`): nama folder backend di repo,
  relatif terhadap repo. Sesuaikan jika berbeda sebelum menjalankan deploy backend.
- Repo default `/home/ubuntu/Apk-Final` (bisa diubah via env di service file).

## Endpoint (semua butuh `Authorization: Bearer <token>`)

| Method | Path | Fungsi |
|---|---|---|
| GET | `/health` | cek hidup |
| POST | `/deploy/frontend {"app":"n6_new_era"}` | git pull + rsync ke /var/www/demo/{app}/ |
| POST | `/deploy/backend` | git pull + rsync ke /opt/apkfinal/app/ + restart apkfinal |
| POST | `/service {"name":"apkfinal\|nginx","action":"status\|restart\|reload"}` | systemctl |
| GET | `/logs?service=apkfinal&lines=100` | journalctl |
| POST | `/db/reset-password {"username","password"}` | hash bcrypt + update n6.accounts |
| POST | `/db/query {"sql":"SELECT ..."}` | SELECT saja, maks 200 baris |
| POST | `/shell {"command":"df -h"}` | allowlist diagnostik (lihat `SHELL_ALLOW` di app.py) |

## Memberi token ke agen

Token adalah kredensial penuh atas VPS — perlakukan seperti password root.
Jangan taruh di chat grup atau file publik. Berikan ke agen lewat jalur
pribadi; agen menyimpannya di vault, bukan di memori chat.

## Rotasi token

```bash
openssl rand -hex 32 | sudo tee /etc/agent-api/token
sudo chmod 600 /etc/agent-api/token
sudo chown agentapi:agentapi /etc/agent-api/token
sudo systemctl restart agent-api
```
