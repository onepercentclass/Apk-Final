#!/usr/bin/env bash
#
# N6 dist bundle builder (Linux port of tools/build.ps1)
#
# Rebuilds js/dist/<role>.js from the per-menu source fragments under
# js/modules/<role>/. The fragments are the source of truth; js/dist/*.js
# is the artefact the browser loads.
#
#   _iife.txt    the (function(){ ... })(); wrapper (=== PREFIX === / === SUFFIX ===)
#   <menu>.js    units separated by the /*__N6_UNIT__*/ sentinel (after //__N6_BODY__)
#   manifest.js  the run-length list restoring the original unit order
#
# Usage:
#   tools/build.sh                        rebuild all five roles
#   tools/build.sh --role owner           rebuild one role
#   tools/build.sh --check                do not write; exit 1 if any bundle would change
#   tools/build.sh --role owner --check
#
# Byte-identical contract: output must match tools/build.ps1 exactly
# (UTF-8 without BOM, exact whitespace). The GENERATED header still names
# build.ps1 on purpose so Fase A output stays byte-identical; the header
# will gain real build metadata in Fase G.
#
set -euo pipefail

ROLE=""
CHECK=0
while [[ $# -gt 0 ]]; do
  case "$1" in
    --role) ROLE="$2"; shift 2 ;;
    --check) CHECK=1; shift ;;
    -h|--help)
      sed -n '2,20p' "$0"; exit 0 ;;
    *) echo "unknown arg: $1" >&2; exit 2 ;;
  esac
done

case "$ROLE" in
  ""|owner|admin|headcoach|coach|client) ;;
  *) echo "invalid --role: $ROLE (owner|admin|headcoach|coach|client)" >&2; exit 2 ;;
esac

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
export N6_BUILD_ROOT="$ROOT"
export N6_BUILD_ROLE="$ROLE"
export N6_BUILD_CHECK="$CHECK"

python3 - <<'PYEOF'
import os, re, sys

ROOT = os.environ["N6_BUILD_ROOT"]
ONLY_ROLE = os.environ["N6_BUILD_ROLE"] or None
CHECK = os.environ["N6_BUILD_CHECK"] == "1"

SENTINEL = "/*__N6_UNIT__*/"
BODY_MARK = "//__N6_BODY__"
MANIFEST_MARK = "//__N6_MANIFEST__"
ALL_ROLES = ["owner", "admin", "headcoach", "coach", "client"]
PREFIX_MARK = "=== PREFIX ==="
SUFFIX_MARK = "=== SUFFIX ==="


def read_utf8(path):
    # utf-8-sig strips a BOM if present; we write without BOM below
    with open(path, "r", encoding="utf-8-sig", newline="") as f:
        return f.read()


def get_units(path):
    text = read_utf8(path)
    m = text.find(BODY_MARK)
    if m < 0:
        raise Exception("fragment %s has no %s marker" % (path, BODY_MARK))
    code = text[m + len(BODY_MARK) + 1:]
    return code.split(SENTINEL)


def get_manifest_runs(path):
    text = read_utf8(path)
    m = text.find(MANIFEST_MARK)
    if m < 0:
        raise Exception("manifest %s has no %s marker" % (path, MANIFEST_MARK))
    body = text[m + len(MANIFEST_MARK):]
    body = body[:body.index("];")]
    return re.findall(r"\[\s*'([^']+)'\s*,\s*(\d+)\s*\]", body)


def get_wrapper(path):
    text = read_utf8(path)
    pm = text.find(PREFIX_MARK)
    sm = text.find(SUFFIX_MARK)
    if pm < 0 or sm < 0:
        raise Exception("wrapper %s is missing its PREFIX/SUFFIX markers" % path)
    p = pm + len(PREFIX_MARK)
    if text[p] == "\n":
        p += 1
    s = sm + len(SUFFIX_MARK)
    if text[s] == "\n":
        s += 1
    return text[p:sm], text[s:]


def get_git_hash():
    """Ambil short git hash untuk build metadata (Fase G)."""
    try:
        import subprocess
        result = subprocess.run(
            ['git', 'rev-parse', '--short', 'HEAD'],
            capture_output=True, text=True, cwd=ROOT, timeout=5
        )
        if result.returncode == 0:
            return result.stdout.strip()
    except Exception:
        pass
    return 'unknown'


def header_for(role):
    # Must stay byte-identical to build.ps1 output (see script header comment).
    # Fase G: tambahkan git hash untuk traceability. Hash hanya berubah saat
    # source berubah, sehingga `build.sh --check` tetap valid.
    git_hash = get_git_hash()
    return (
        "/**\n"
        " * N6 dist bundle - %s\n"
        " *\n"
        " * GENERATED FILE - do not edit. Source of truth is js/modules/%s/*.js\n"
        " * Rebuilt by tools/build.sh; concatenation is byte-identical to the\n"
        " * original <script> block in %s.html.\n"
        " * Build: git:%s\n"
        " */\n\n" % (role, role, role, git_hash)
    )


roles = [ONLY_ROLE] if ONLY_ROLE else ALL_ROLES
failed = []

for r in roles:
    mod_dir = os.path.join(ROOT, "js", "modules", r)
    if not os.path.isdir(mod_dir):
        print("skip %s (no js/modules/%s)" % (r, r))
        continue

    print("")
    print("N6 build :: %s" % r)

    prefix, suffix = get_wrapper(os.path.join(mod_dir, "_iife.txt"))
    runs = get_manifest_runs(os.path.join(mod_dir, "manifest.js"))

    cache = {}
    for fname, _count in runs:
        if fname in cache:
            continue
        frag = os.path.join(mod_dir, fname + ".js")
        if not os.path.isfile(frag):
            raise Exception("%s: manifest references %s.js but the file is missing" % (r, fname))
        units = get_units(frag)
        cache[fname] = units
        print("  %-16s %4d units" % (fname + ".js", len(units)))

    ordered = []
    cursor = {}
    for fname, count in runs:
        count = int(count)
        units = cache[fname]
        frm = cursor.get(fname, 0)
        to = frm + count
        if to > len(units):
            raise Exception(
                "%s: manifest wants units %d..%d from %s.js but it only holds %d"
                % (r, frm, to - 1, fname, len(units)))
        ordered.extend(units[frm:to])
        cursor[fname] = to

    for fname, units in cache.items():
        if cursor.get(fname, 0) != len(units):
            raise Exception(
                "%s: %s.js holds %d units but the manifest only consumes %d"
                % (r, fname, len(units), cursor.get(fname, 0)))

    built = prefix + "".join(ordered) + suffix
    dist_path = os.path.join(ROOT, "js", "dist", r + ".js")
    want = header_for(r) + built

    existing = None
    if os.path.isfile(dist_path):
        existing = read_utf8(dist_path)

    if existing is not None and existing == want:
        print("  bundle already up to date")
        continue

    if CHECK:
        failed.append(r)
        print("  DIFFERS from js/dist - run again without --check to rebuild")
        continue

    # write UTF-8 without BOM, exact bytes
    with open(dist_path, "w", encoding="utf-8", newline="") as f:
        f.write(want)
    print("  wrote js/dist/%s.js (%d chars)" % (r, len(built)))

print("")
if failed:
    print("build check FAILED for: %s" % ", ".join(failed))
    sys.exit(1)

# Fase G3: update version.js dengan git hash terbaru (hanya jika ada yang di-rebuild)
# Version format: vYYYY.MM.DD-<hash>
if not CHECK:
    import datetime
    v_hash = get_git_hash()
    v_date = datetime.datetime.now().strftime('%Y.%m.%d')
    v_version = f"v{v_date}-{v_hash}"
    v_path = os.path.join(ROOT, "js", "core", "version.js")
    v_content = (
        "/**\n"
        " * N6 - Version (Fase G3)\n"
        " * Auto-generated by tools/build.sh. Do not edit manually.\n"
        " */\n"
        f"export const N6_VERSION = '{v_version}';\n"
        f"export const N6_BUILD_HASH = '{v_hash}';\n"
        f"export const N6_BUILD_DATE = '{v_date}';\n"
        "export default N6_VERSION;\n"
    )
    with open(v_path, "w", encoding="utf-8", newline="") as f:
        f.write(v_content)
    print(f"  version.js updated: {v_version}")

print("build ok")
PYEOF
