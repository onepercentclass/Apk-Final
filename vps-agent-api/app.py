#!/usr/bin/env python3
"""Agent API — kendali VPS via HTTPS untuk agen Muse.

Model keamanan:
- Auth: Bearer token, dibandingkan dengan secrets.compare_digest.
- Berjalan sebagai user terbatas `agentapi`; operasi istimewa lewat
  wrapper milik root /usr/local/sbin/agent-api-priv (validasi arg ketat).
- Tidak ada shell bebas: /shell hanya mengizinkan pola allowlist read-only.
- /db/query hanya SELECT; /db/reset-password adalah operasi tetap.
- Semua request tercatat di audit log. Tidak ada UI docs (docs_url=None).
"""
import json
import logging
import os
import re
import secrets
import shlex
import shutil
import subprocess
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional

from fastapi import FastAPI, Header, HTTPException, Query
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field

# ---------------- konfigurasi ----------------
TOKEN_FILE = Path(os.environ.get("AGENT_API_TOKEN_FILE", "/etc/agent-api/token"))
PRIV_BIN = os.environ.get("AGENT_API_PRIV", "/usr/local/sbin/agent-api-priv")
AUDIT_FILE = Path(os.environ.get("AGENT_API_AUDIT", "/var/log/agent-api/audit.log"))
DB_PASS_FILE = Path(os.environ.get("AGENT_API_DB_PASS_FILE", "/etc/agent-api/dbpass"))
DB_HOST = os.environ.get("AGENT_API_DB_HOST", "127.0.0.1")
DB_NAME = os.environ.get("AGENT_API_DB_NAME", "apkfinal")
DB_USER = os.environ.get("AGENT_API_DB_USER", "agentapi")


def _read_secret(p: Path, name: str) -> str:
    try:
        v = p.read_text().strip()
    except Exception as e:
        raise RuntimeError(f"tidak bisa baca {name} di {p}: {e}")
    if not v:
        raise RuntimeError(f"{name} kosong di {p}")
    return v


EXPECTED_TOKEN = _read_secret(TOKEN_FILE, "token API")
DB_PASSWORD = _read_secret(DB_PASS_FILE, "password DB")

try:
    import psycopg2  # noqa: E402
except ImportError as e:
    raise RuntimeError(f"psycopg2 tidak ada di venv: {e}")

try:
    import bcrypt  # noqa: E402
except ImportError as e:
    raise RuntimeError(f"bcrypt tidak ada di venv: {e}")

# ---------------- audit log ----------------
AUDIT_FILE.parent.mkdir(parents=True, exist_ok=True)
_audit = logging.getLogger("agent-api-audit")
_audit.setLevel(logging.INFO)
_h = logging.FileHandler(AUDIT_FILE)
_h.setFormatter(logging.Formatter("%(message)s"))
_audit.addHandler(_h)


def log_audit(endpoint: str, ok: bool, detail: str = "", params: Optional[dict] = None):
    safe = {k: ("***" if k in ("password", "token") else v) for k, v in (params or {}).items()}
    _audit.info(json.dumps({
        "ts": datetime.now(timezone.utc).isoformat(),
        "endpoint": endpoint, "ok": ok,
        "detail": str(detail)[:500], "params": safe,
    }, ensure_ascii=False))


# ---------------- aplikasi ----------------
app = FastAPI(title="agent-api", docs_url=None, redoc_url=None, openapi_url=None)


@app.exception_handler(HTTPException)
async def _http_exc_handler(request, exc: HTTPException):
    log_audit(request.url.path, False, detail=str(exc.detail))
    return JSONResponse(status_code=exc.status_code,
                        content={"ok": False, "detail": exc.detail})


def check_auth(authorization: str = Header(default="")):
    if not authorization.startswith("Bearer "):
        raise HTTPException(401, "butuh Bearer token")
    if not secrets.compare_digest(authorization[7:].strip(), EXPECTED_TOKEN):
        raise HTTPException(403, "token salah")


def priv(*args: str, timeout: int = 180) -> str:
    """Panggil wrapper istimewa. Argumen sudah divalidasi oleh pemanggil."""
    try:
        p = subprocess.run(["sudo", "-n", PRIV_BIN, *args],
                           capture_output=True, text=True, timeout=timeout)
    except subprocess.TimeoutExpired:
        raise HTTPException(504, "perintah timeout")
    if p.returncode != 0:
        raise HTTPException(500, f"gagal: {p.stderr.strip()[-300:]}")
    return p.stdout.strip()[-8000:]


def db_conn():
    return psycopg2.connect(host=DB_HOST, dbname=DB_NAME, user=DB_USER,
                            password=DB_PASSWORD,
                            options="-c statement_timeout=15000")


# ---------------- endpoint ----------------

@app.get("/health")
def health(authorization: str = Header(default="")):
    check_auth(authorization)
    return {"ok": True}


class DeployFrontIn(BaseModel):
    app: str = Field(pattern=r"^[a-z0-9][a-z0-9\-]{0,40}$")


@app.post("/deploy/frontend")
def deploy_frontend(body: DeployFrontIn, authorization: str = Header(default="")):
    check_auth(authorization)
    out = priv("deploy-frontend", body.app)
    log_audit("deploy/frontend", True, params={"app": body.app})
    return {"ok": True, "output": out}


@app.post("/deploy/backend")
def deploy_backend(authorization: str = Header(default="")):
    check_auth(authorization)
    out = priv("deploy-backend", timeout=240)
    log_audit("deploy/backend", True)
    return {"ok": True, "output": out}


class ServiceIn(BaseModel):
    name: str = Field(pattern=r"^(apkfinal|nginx)$")
    action: str = Field(pattern=r"^(status|restart|reload)$")


@app.post("/service")
def service(body: ServiceIn, authorization: str = Header(default="")):
    check_auth(authorization)
    out = priv("service", body.name, body.action)
    log_audit("service", True, params={"name": body.name, "action": body.action})
    return {"ok": True, "output": out}


@app.get("/logs")
def logs(service: str = Query(pattern=r"^(apkfinal|nginx)$"),
         lines: int = Query(100, ge=1, le=500),
         authorization: str = Header(default="")):
    check_auth(authorization)
    try:
        p = subprocess.run(["journalctl", "-u", service, "-n", str(lines), "--no-pager"],
                           capture_output=True, text=True, timeout=30)
    except subprocess.TimeoutExpired:
        raise HTTPException(504, "timeout")
    out = (p.stdout or p.stderr)[-12000:]
    log_audit("logs", True, params={"service": service, "lines": lines})
    return {"ok": True, "output": out}


class ResetIn(BaseModel):
    username: str = Field(pattern=r"^[A-Za-z0-9_.\-]{1,64}$")
    password: str = Field(min_length=8, max_length=128)


@app.post("/db/reset-password")
def db_reset_password(body: ResetIn, authorization: str = Header(default="")):
    check_auth(authorization)
    pw_hash = bcrypt.hashpw(body.password.encode(), bcrypt.gensalt(rounds=12)).decode()
    with db_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(
                "UPDATE n6.accounts SET password_hash=%s, updated_at=now() WHERE username=%s",
                (pw_hash, body.username),
            )
            if cur.rowcount != 1:
                conn.rollback()
                raise HTTPException(404, "username tidak ditemukan")
    log_audit("db/reset-password", True, params={"username": body.username})
    return {"ok": True}


class QueryIn(BaseModel):
    sql: str = Field(min_length=7, max_length=2000)


@app.post("/db/query")
def db_query(body: QueryIn, authorization: str = Header(default="")):
    check_auth(authorization)
    sql = body.sql.strip()
    if sql.endswith(";"):
        sql = sql[:-1].strip()
    if not re.match(r"(?i)^select\b", sql):
        raise HTTPException(400, "hanya SELECT yang diizinkan")
    if ";" in sql:
        raise HTTPException(400, "satu statement saja")
    with db_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(sql)
            cols = [d[0] for d in cur.description]
            rows = cur.fetchmany(200)
    log_audit("db/query", True, params={"sql": sql[:200]})
    return {"ok": True, "columns": cols, "rows": [list(r) for r in rows]}


# Pola perintah yang diizinkan di /shell (fullmatch, tanpa shell=True).
SHELL_ALLOW = [
    r"df -h",
    r"free -m",
    r"uptime",
    r"ps aux",
    r"ss -tlnp",
    r"systemctl status (apkfinal|nginx)",
    r"journalctl -u (apkfinal|nginx) -n [0-9]{1,3} --no-pager",
    r"ls -la /var/www/demo/?",
    r"tail -n [0-9]{1,3} /var/log/nginx/(error|access)\.log",
    r"du -sh /var/www/demo/?",
]
SHELL_META = re.compile(r"[;&|$`<>\\*?~#()\[\]{}!]")


class ShellIn(BaseModel):
    command: str = Field(min_length=2, max_length=300)


@app.post("/shell")
def shell(body: ShellIn, authorization: str = Header(default="")):
    check_auth(authorization)
    cmd = body.command.strip()
    if SHELL_META.search(cmd):
        raise HTTPException(400, "karakter shell tidak diizinkan")
    if not any(re.fullmatch(p, cmd) for p in SHELL_ALLOW):
        raise HTTPException(403, "perintah tidak ada di allowlist")
    args = shlex.split(cmd)
    exe = shutil.which(args[0])
    if not exe:
        raise HTTPException(500, "perintah tidak ditemukan")
    args[0] = exe
    try:
        p = subprocess.run(args, capture_output=True, text=True, timeout=30)
    except subprocess.TimeoutExpired:
        raise HTTPException(504, "timeout")
    out = (p.stdout or p.stderr)[-8000:]
    log_audit("shell", True, params={"command": cmd})
    return {"ok": True, "output": out, "returncode": p.returncode}
