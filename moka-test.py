#!/usr/bin/env python3
"""
moka-test.py
============
Autentikasi ulang Moka OAuth dan dapatkan refresh_token baru.

Cara pakai:
  python3 moka-test.py

Ikuti instruksi di terminal:
  1. Buka URL di browser, login Moka, klik Allow
  2. Salin 'code' dari URL callback
  3. Paste di terminal
  4. Salin MOKA_REFRESH_TOKEN yang tampil → update di Netlify
"""

import sys
import json
import urllib.parse
import urllib.request
import urllib.error

# ── Credentials ───────────────────────────────────────────────────────────────
MOKA_CLIENT_ID  = "d01822723dc890ba8a4b84d318920f236a694d75fdcea7ad079718bc7f55d730S"
MOKA_SECRET     = "a40de2db135e2a2cf73cd0c7af5be979ec2530d4878e5129c9bfdd32bc724887"
MOKA_OUTLET_ID  = "1143725"
REDIRECT_URI    = "https://sectorseven.space"   # ← ganti jika beda di Moka Dashboard

# ── Konstanta ─────────────────────────────────────────────────────────────────
MOKA_BASE       = "https://api.mokapos.com"
MOKA_AUTH_URL   = f"{MOKA_BASE}/oauth/authorize"
MOKA_TOKEN_URL  = f"{MOKA_BASE}/oauth/token"
MOKA_ITEMS_URL  = f"{MOKA_BASE}/v1/outlets/{MOKA_OUTLET_ID}/items?per_page=5"

SEP  = "─" * 60
GRN  = "\033[32m"; YLW = "\033[33m"; RED = "\033[31m"
CYN  = "\033[36m"; BLD = "\033[1m";  RST = "\033[0m"

def ok(m):   print(f"{GRN}✓  {m}{RST}")
def warn(m): print(f"{YLW}⚠  {m}{RST}")
def err(m):  print(f"{RED}✗  {m}{RST}")
def info(m): print(f"{CYN}ℹ  {m}{RST}")
def bold(m): print(f"{BLD}{m}{RST}")

# ── HTTP helpers ──────────────────────────────────────────────────────────────
def post_json(url, payload):
    data = json.dumps(payload).encode()
    req  = urllib.request.Request(
        url, data=data,
        headers={"Content-Type": "application/json"},
        method="POST"
    )
    try:
        with urllib.request.urlopen(req) as resp:
            return json.loads(resp.read())
    except urllib.error.HTTPError as e:
        body = e.read().decode(errors="replace")
        try:    return json.loads(body)
        except: raise RuntimeError(f"HTTP {e.code}: {body[:400]}")

def get_json(url, token):
    req = urllib.request.Request(url, headers={"Authorization": f"Bearer {token}"})
    try:
        with urllib.request.urlopen(req) as resp:
            return json.loads(resp.read())
    except urllib.error.HTTPError as e:
        body = e.read().decode(errors="replace")
        try:    return json.loads(body)
        except: raise RuntimeError(f"HTTP {e.code}: {body[:400]}")

# ── Step 1: Build authorization URL ──────────────────────────────────────────
def build_auth_url():
    params = urllib.parse.urlencode({
        "response_type": "code",
        "client_id":     MOKA_CLIENT_ID,
        "redirect_uri":  REDIRECT_URI,
        "scope":         "library checkout checkout_api",
    })
    return f"{MOKA_AUTH_URL}?{params}"

# ── Step 2: Exchange code → tokens ────────────────────────────────────────────
def exchange_code(code):
    info("Menukar authorization code → access_token + refresh_token…")
    return post_json(MOKA_TOKEN_URL, {
        "grant_type":    "authorization_code",
        "client_id":     MOKA_CLIENT_ID,
        "client_secret": MOKA_SECRET,
        "code":          code,
        "redirect_uri":  REDIRECT_URI,
    })

# ── Step 3: Test refresh flow ─────────────────────────────────────────────────
def test_refresh(refresh_token):
    info("Menguji refresh_token (simulasi Netlify Function)…")
    result = post_json(MOKA_TOKEN_URL, {
        "grant_type":    "refresh_token",
        "client_id":     MOKA_CLIENT_ID,
        "client_secret": MOKA_SECRET,
        "refresh_token": refresh_token,
    })
    if "error" in result:
        raise RuntimeError(result.get("error_description") or result.get("error"))
    access_token = result.get("access_token")
    if not access_token:
        raise RuntimeError(f"Tidak ada access_token: {result}")
    ok(f"Refresh OK! Token berlaku {result.get('expires_in', '?')} detik")
    return access_token

# ── Step 4: Test fetch items ──────────────────────────────────────────────────
def test_fetch_items(access_token):
    info(f"Fetch items dari outlet {MOKA_OUTLET_ID}…")
    try:
        data  = get_json(MOKA_ITEMS_URL, access_token)
        items = (data.get("data") or {}).get("items") \
             or (data.get("data") or {}).get("item") or []
        ok(f"Fetch berhasil! {len(items)} item (maks 5 ditampilkan):")
        for it in items[:5]:
            nvars = len(it.get("item_variants", []))
            nmods = len(it.get("active_modifiers", []))
            print(f"     • [{it.get('id','?')}] {it.get('name','?')}"
                  f"  variants={nvars}  modifiers={nmods}")
    except Exception as e:
        warn(f"Fetch items gagal: {e}")

# ── Main ──────────────────────────────────────────────────────────────────────
def main():
    print()
    bold("=" * 60)
    bold("  Moka OAuth — Sector Seven")
    bold("=" * 60)
    print(f"  Client ID  : {MOKA_CLIENT_ID[:16]}…")
    print(f"  Outlet ID  : {MOKA_OUTLET_ID}")
    print(f"  Redirect   : {REDIRECT_URI}")
    print()

    # ── Tampilkan authorization URL ───────────────────────────────────────────
    print(SEP)
    bold("  LANGKAH 1 — Buka URL ini di browser:")
    print(SEP)
    auth_url = build_auth_url()
    print(f"\n  {CYN}{auth_url}{RST}\n")
    info("Login Moka → klik Allow/Izinkan")
    info("Setelah redirect, lihat URL browser — salin nilai 'code='")
    info(f"Contoh: {REDIRECT_URI}?code=XXXX  ← salin bagian XXXX")
    print()

    code = input("  Paste authorization code di sini: ").strip()
    if not code:
        err("Code tidak boleh kosong.")
        sys.exit(1)

    # ── Exchange code ─────────────────────────────────────────────────────────
    print()
    print(SEP)
    bold("  LANGKAH 2 — Exchange code…")
    print(SEP)
    print()

    try:
        token_data = exchange_code(code)
    except Exception as e:
        err(f"Exchange gagal: {e}")
        sys.exit(1)

    if "error" in token_data:
        err(f"Moka error: {token_data.get('error_description') or token_data.get('error')}")
        sys.exit(1)

    access_token  = token_data.get("access_token")
    refresh_token = token_data.get("refresh_token")

    if not access_token or not refresh_token:
        err(f"Response tidak lengkap: {token_data}")
        sys.exit(1)

    ok("Exchange berhasil!")

    # ── Test refresh ──────────────────────────────────────────────────────────
    print()
    print(SEP)
    bold("  LANGKAH 3 — Test refresh_token…")
    print(SEP)
    print()

    try:
        new_access_token = test_refresh(refresh_token)
    except Exception as e:
        err(f"Refresh gagal: {e}")
        sys.exit(1)

    # ── Test fetch items ──────────────────────────────────────────────────────
    print()
    print(SEP)
    bold("  LANGKAH 4 — Test fetch items dari Moka…")
    print(SEP)
    print()
    test_fetch_items(new_access_token)

    # ── Hasil akhir ───────────────────────────────────────────────────────────
    print()
    print(SEP)
    bold("  ✅  SELESAI — Salin MOKA_REFRESH_TOKEN berikut:")
    print(SEP)
    print()
    print(f"  {BLD}MOKA_REFRESH_TOKEN{RST} =")
    print(f"  {GRN}{refresh_token}{RST}")
    print()
    bold("  Cara update di Netlify:")
    print("    1. Netlify Dashboard → Site → Site configuration")
    print("    2. Environment variables → MOKA_REFRESH_TOKEN → Edit")
    print("    3. Paste nilai di atas → Save")
    print("    4. Deploys → Trigger deploy → Deploy site")
    print()

    # Simpan ke file backup
    with open("moka-tokens.json", "w") as f:
        json.dump({
            "access_token":  new_access_token,
            "refresh_token": refresh_token,
            "expires_in":    token_data.get("expires_in"),
            "scope":         token_data.get("scope"),
        }, f, indent=2)
    ok("Token disimpan ke moka-tokens.json (jangan di-commit ke git!)")
    print()

if __name__ == "__main__":
    main()