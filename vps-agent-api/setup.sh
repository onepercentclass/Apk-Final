#!/bin/bash
# Installer agent-api. Jalankan sekali sebagai root di VPS:
#   sudo bash setup.sh
# Script ini: buat user, token, role DB, wrapper, sudoers, service.
set -euo pipefail
[ "$(id -u)" -eq 0 ] || { echo "jalankan sebagai root"; exit 1; }
cd "$(dirname "$0")"

API_USER=agentapi
INSTALL_DIR=/opt/agent-api
VENV_PY=/opt/apkfinal/.venv/bin/python
[ -x "$VENV_PY" ] || { echo "venv tidak ketemu di $VENV_PY"; exit 1; }

echo "== 1. user sistem =="
id "$API_USER" &>/dev/null || useradd -r -s /usr/sbin/nologin -d /nonexistent "$API_USER"

echo "== 2. token API =="
mkdir -p /etc/agent-api /var/log/agent-api
TOKEN=$(openssl rand -hex 32)
printf '%s' "$TOKEN" > /etc/agent-api/token
chmod 600 /etc/agent-api/token
chown "$API_USER:$API_USER" /etc/agent-api/token /var/log/agent-api

echo "== 3. role postgres =="
DBPASS=$(openssl rand -hex 24)
printf '%s' "$DBPASS" > /etc/agent-api/dbpass
chmod 600 /etc/agent-api/dbpass
chown "$API_USER:$API_USER" /etc/agent-api/dbpass
sudo -u postgres psql -d apkfinal -v ON_ERROR_STOP=1 <<EOF
DO \$\$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname='agentapi') THEN
    CREATE ROLE agentapi LOGIN PASSWORD '$DBPASS';
  ELSE
    ALTER ROLE agentapi WITH PASSWORD '$DBPASS';
  END IF;
END
\$\$;
GRANT CONNECT ON DATABASE apkfinal TO agentapi;
GRANT USAGE ON SCHEMA n6 TO agentapi;
GRANT SELECT, UPDATE(password_hash, updated_at) ON n6.accounts TO agentapi;
GRANT SELECT ON ALL TABLES IN SCHEMA n6 TO agentapi;
ALTER DEFAULT PRIVILEGES IN SCHEMA n6 GRANT SELECT ON TABLES TO agentapi;
EOF

echo "== 4. kode + wrapper =="
mkdir -p "$INSTALL_DIR"
cp app.py "$INSTALL_DIR"/
chown -R "$API_USER:$API_USER" "$INSTALL_DIR"
cp agent-api-priv /usr/local/sbin/agent-api-priv
chown root:root /usr/local/sbin/agent-api-priv
chmod 755 /usr/local/sbin/agent-api-priv

echo "== 5. sudoers =="
cat > /etc/sudoers.d/agent-api <<'EOF'
agentapi ALL=(root) NOPASSWD: /usr/local/sbin/agent-api-priv *
EOF
chmod 440 /etc/sudoers.d/agent-api
visudo -c

echo "== 6. grup journal + service =="
usermod -aG systemd-journal "$API_USER"
cat > /etc/systemd/system/agent-api.service <<EOF
[Unit]
Description=VPS agent API
After=network.target postgresql.service

[Service]
Type=simple
User=$API_USER
Group=$API_USER
Environment=AGENT_API_TOKEN_FILE=/etc/agent-api/token
Environment=AGENT_API_DB_PASS_FILE=/etc/agent-api/dbpass
ExecStart=$VENV_PY -m uvicorn app:app --host 127.0.0.1 --port 8777 --app-dir $INSTALL_DIR
Restart=on-failure

[Install]
WantedBy=multi-user.target
EOF
systemctl daemon-reload
systemctl enable --now agent-api
sleep 3
systemctl is-active agent-api

echo ""
echo "== SELESAI =="
echo "Token API (HANYA TAMPIL SEKALI — simpan baik-baik):"
echo "$TOKEN"
echo ""
echo "Langkah berikut: tempel isi nginx-snippet.conf ke konfigurasi nginx,"
echo "lalu: sudo nginx -t && sudo systemctl reload nginx"
echo "Tes: curl -k -H \"Authorization: Bearer \$TOKEN\" https://demo.denisbergkam.com/agent-api/health"
