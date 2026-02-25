#!/usr/bin/env python3
"""
moka-test.py
============
Script untuk test koneksi ke Moka POS API dan export data lengkap.

CARA PAKAI:
  1. Jalankan OAuth flow dulu untuk dapat refresh_token:
       python3 moka-test.py setup

  2. Setelah punya refresh_token, fetch semua data + export JSON:
       python3 moka-test.py fetch

  3. Atau langsung masukkan refresh_token yang sudah ada:
       python3 moka-test.py fetch --refresh-token YOUR_REFRESH_TOKEN

OUTPUT FILES:
  - moka_items_raw.json     → raw response dari Moka API
  - moka_variants_map.json  → map: item_id → { name, variants, modifiers }
  - mokaMap.json            → map: local_item_id → moka_item (untuk useMokaData.js)
"""

import sys
import json
import time
import urllib.request
import urllib.error
import urllib.parse
import argparse
import os
from datetime import datetime

# ─── CONFIG ──────────────────────────────────────────────────────────────────
MOKA_BASE      = "https://api.mokapos.com"
CLIENT_ID      = os.getenv("MOKA_CLIENT_ID",     "d01822723dc890ba8a4b84d318920f236a694d75fdcea7ad079718bc7f55d730")
CLIENT_SECRET  = os.getenv("MOKA_SECRET",         "a40de2db135e2a2cf73cd0c7af5be979ec2530d4878e5129c9bfdd32bc724887")
OUTLET_ID      = os.getenv("MOKA_OUTLET_ID",      "1143725")
REDIRECT_URI   = os.getenv("MOKA_REDIRECT_URI",   "https://sectorseven.space/callback")
# Isi ini setelah dapat refresh_token dari step setup:
SAVED_REFRESH_TOKEN = os.getenv("MOKA_REFRESH_TOKEN", "")

# ─── COLORS ──────────────────────────────────────────────────────────────────
GREEN  = "\033[92m"
YELLOW = "\033[93m"
RED    = "\033[91m"
BLUE   = "\033[94m"
CYAN   = "\033[96m"
BOLD   = "\033[1m"
RESET  = "\033[0m"

def ok(msg):    print(f"{GREEN}✓{RESET} {msg}")
def warn(msg):  print(f"{YELLOW}⚠{RESET}  {msg}")
def err(msg):   print(f"{RED}✗{RESET} {msg}")
def info(msg):  print(f"{BLUE}ℹ{RESET} {msg}")
def head(msg):  print(f"\n{BOLD}{CYAN}{'─'*60}{RESET}")
def title(msg): print(f"{BOLD}{CYAN}{msg}{RESET}")

# ─── HTTP HELPER ─────────────────────────────────────────────────────────────
def http_post(url, body: dict, headers: dict = None) -> dict:
    data    = json.dumps(body).encode()
    hdrs    = {"Content-Type": "application/json", **(headers or {})}
    req     = urllib.request.Request(url, data=data, headers=hdrs, method="POST")
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.loads(r.read().decode())

def http_get(url, token: str, params: dict = None) -> dict:
    if params:
        url += "?" + urllib.parse.urlencode(params)
    req = urllib.request.Request(url, headers={
        "Authorization": f"Bearer {token}",
        "Content-Type":  "application/json",
    })
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.loads(r.read().decode())

def http_post_status(url, body: dict, headers: dict = None):
    """Returns (status_code, response_dict)"""
    data = json.dumps(body).encode()
    hdrs = {"Content-Type": "application/json", **(headers or {})}
    req  = urllib.request.Request(url, data=data, headers=hdrs, method="POST")
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            return r.status, json.loads(r.read().decode())
    except urllib.error.HTTPError as e:
        return e.code, json.loads(e.read().decode())

# ─── STEP 1: OAUTH SETUP ─────────────────────────────────────────────────────
def run_setup():
    head("")
    title("STEP 1 — OAuth Authorization Flow")
    head("")

    # Build authorization URL
    params = urllib.parse.urlencode({
        "client_id":     CLIENT_ID,
        "redirect_uri":  REDIRECT_URI,
        "response_type": "code",
        "scope":         "profile library checkout checkout_api",
    })
    auth_url = f"{MOKA_BASE}/oauth/authorize?{params}"

    print(f"""
{BOLD}Buka URL ini di browser Anda:{RESET}

  {YELLOW}{auth_url}{RESET}

Setelah login & approve, Anda akan diredirect ke:
  {REDIRECT_URI}?code=XXXXXX

Copy bagian {BOLD}code{RESET}-nya saja (setelah ?code=).
""")

    code = input("Masukkan code di sini: ").strip()
    if not code:
        err("Code kosong, keluar.")
        sys.exit(1)

    info("Menukar code dengan access_token + refresh_token…")
    try:
        data = http_post(f"{MOKA_BASE}/oauth/token", {
            "grant_type":    "authorization_code",
            "client_id":     CLIENT_ID,
            "client_secret": CLIENT_SECRET,
            "code":          code,
            "redirect_uri":  REDIRECT_URI,
        })
    except urllib.error.HTTPError as e:
        body = json.loads(e.read().decode())
        err(f"Exchange gagal ({e.code}): {body}")
        sys.exit(1)

    if "access_token" not in data:
        err(f"Unexpected response: {data}")
        sys.exit(1)

    ok("Token berhasil didapat!")
    print(f"""
{BOLD}ACCESS TOKEN:{RESET}
  {data['access_token']}

{BOLD}REFRESH TOKEN:{RESET}
  {GREEN}{data['refresh_token']}{RESET}

{BOLD}Expires in:{RESET} {data.get('expires_in')} detik
{BOLD}Scope:{RESET}      {data.get('scope')}
""")

    # Save to file
    token_file = "moka_tokens.json"
    with open(token_file, "w") as f:
        json.dump({
            "access_token":  data["access_token"],
            "refresh_token": data["refresh_token"],
            "expires_in":    data.get("expires_in"),
            "obtained_at":   datetime.now().isoformat(),
        }, f, indent=2)
    ok(f"Tokens disimpan ke {token_file}")

    print(f"""
{BOLD}{YELLOW}NEXT STEPS:{RESET}
1. Copy refresh_token di atas
2. Di Netlify → Site Settings → Environment Variables, tambahkan:
     MOKA_REFRESH_TOKEN = {data['refresh_token']}
     MOKA_CLIENT_ID     = {CLIENT_ID}
     MOKA_SECRET        = {CLIENT_SECRET}
     MOKA_OUTLET_ID     = {OUTLET_ID}

3. Jalankan: python3 moka-test.py fetch --refresh-token {data['refresh_token'][:20]}...
""")
    return data["refresh_token"]


# ─── STEP 2: REFRESH TOKEN → ACCESS TOKEN ────────────────────────────────────
def get_access_token(refresh_token: str) -> str:
    info("Mendapatkan access_token baru dari refresh_token…")
    try:
        data = http_post(f"{MOKA_BASE}/oauth/token", {
            "grant_type":    "refresh_token",
            "client_id":     CLIENT_ID,
            "client_secret": CLIENT_SECRET,
            "refresh_token": refresh_token,
        })
    except urllib.error.HTTPError as e:
        body = json.loads(e.read().decode())
        err(f"Token refresh gagal ({e.code}): {body}")
        sys.exit(1)

    if "access_token" not in data:
        err(f"Unexpected response: {data}")
        sys.exit(1)

    ok(f"Access token didapat (expires in {data.get('expires_in')}s)")
    return data["access_token"]


# ─── STEP 3: FETCH ALL ITEMS ──────────────────────────────────────────────────
def fetch_all_items(token: str) -> list:
    head("")
    title("STEP 2 — Fetch Items dari Moka")
    head("")

    all_items = []
    page = 1
    per_page = 200

    while True:
        info(f"Fetching halaman {page} (per_page={per_page})…")
        try:
            data = http_get(
                f"{MOKA_BASE}/v1/outlets/{OUTLET_ID}/items",
                token,
                {"page": page, "per_page": per_page, "include_deleted": "false"},
            )
        except urllib.error.HTTPError as e:
            body = json.loads(e.read().decode())
            err(f"Fetch items gagal ({e.code}): {body}")
            sys.exit(1)

        items = data.get("data", {}).get("items") or data.get("data", {}).get("item") or []

        if not items:
            break

        all_items.extend(items)
        ok(f"  → {len(items)} items di halaman {page} (total: {len(all_items)})")

        # Cek pagination
        meta = data.get("meta", {})
        total = meta.get("total_count") or meta.get("count") or 0
        if len(all_items) >= total or len(items) < per_page:
            break

        page += 1
        time.sleep(0.3)  # rate limit safety

    ok(f"Total: {len(all_items)} items berhasil di-fetch")
    return all_items


# ─── STEP 4: FETCH ALL MODIFIERS ──────────────────────────────────────────────
def fetch_all_modifiers(token: str) -> list:
    head("")
    title("STEP 3 — Fetch Modifiers dari Moka")
    head("")

    all_mods = []
    page = 1

    while True:
        info(f"Fetching modifiers halaman {page}…")
        try:
            data = http_get(
                f"{MOKA_BASE}/v1/outlets/{OUTLET_ID}/modifiers",
                token,
                {"page": page, "per_page": 200, "include_deleted": "false"},
            )
        except urllib.error.HTTPError as e:
            body = json.loads(e.read().decode())
            warn(f"Fetch modifiers gagal ({e.code}): {body} — mungkin tidak ada modifier")
            return []

        mods = (
            data.get("data", {}).get("modifiers")
            or data.get("data", {}).get("modifier")
            or []
        )

        if not mods:
            break

        all_mods.extend(mods)
        ok(f"  → {len(mods)} modifiers di halaman {page} (total: {len(all_mods)})")

        meta = data.get("meta", {})
        total = meta.get("total_count") or meta.get("count") or 0
        if len(all_mods) >= total or len(mods) < 200:
            break

        page += 1
        time.sleep(0.3)

    ok(f"Total: {len(all_mods)} modifier groups berhasil di-fetch")
    return all_mods


# ─── STEP 5: PROCESS & EXPORT ─────────────────────────────────────────────────
def process_and_export(items: list, modifiers: list):
    head("")
    title("STEP 4 — Memproses & Export JSON")
    head("")

    # ── 1. Raw export ─────────────────────────────────────────────────────────
    raw_file = "moka_items_raw.json"
    with open(raw_file, "w") as f:
        json.dump({"items": items, "modifiers": modifiers,
                   "exported_at": datetime.now().isoformat()}, f, indent=2, ensure_ascii=False)
    ok(f"Raw data disimpan ke {raw_file}")

    # ── 2. Variants map: item_id → detail ─────────────────────────────────────
    variants_map = {}
    items_with_variants = 0
    items_with_modifiers = 0
    total_variants = 0
    total_modifier_groups = 0

    for item in items:
        item_id   = item.get("id")
        item_name = item.get("name", "")

        # Variants
        raw_variants = item.get("item_variants", []) or []
        active_variants = [v for v in raw_variants if not v.get("is_deleted")]
        total_variants += len(active_variants)
        if len(active_variants) > 1:
            items_with_variants += 1

        # Modifiers (active_modifiers sudah ada di item response)
        raw_mods = item.get("active_modifiers", []) or []
        active_mods = [m for m in raw_mods if not m.get("is_deleted")]
        total_modifier_groups += len(active_mods)
        if active_mods:
            items_with_modifiers += 1

        variants_map[item_id] = {
            "id":          item_id,
            "name":        item_name,
            "category_id": item.get("category_id"),
            "category":    item.get("category", {}),
            "sell_price":  item.get("sell_price"),
            "description": item.get("description", ""),
            "image_url":   item.get("image_url", ""),
            "variants": [
                {
                    "id":         v.get("id"),
                    "name":       v.get("name", ""),
                    "sku":        v.get("sku", ""),
                    "price":      v.get("sell_price") or v.get("price"),
                    "barcode":    v.get("barcode", ""),
                    "is_default": v.get("is_default", False),
                }
                for v in active_variants
            ],
            "modifiers": [
                {
                    "id":                  m.get("id"),
                    "name":                m.get("name", ""),
                    "min_options":         m.get("min_no_of_options", 0),
                    "max_options":         m.get("max_no_of_options", 1),
                    "options": [
                        {
                            "id":    o.get("id"),
                            "name":  o.get("name", ""),
                            "price": o.get("price", 0),
                        }
                        for o in (m.get("modifier_options") or [])
                        if not o.get("is_deleted")
                    ],
                }
                for m in active_mods
            ],
        }

    variants_file = "moka_variants_map.json"
    with open(variants_file, "w") as f:
        json.dump(variants_map, f, indent=2, ensure_ascii=False)
    ok(f"Variants map disimpan ke {variants_file}")

    # ── 3. mokaMap.json (keyed by item name, untuk matching dengan menuData) ──
    # Format: { "nama item lowercase": { ...moka item data... } }
    # useMokaData.js sudah handle matching by name
    moka_map_by_name = {}
    for item in items:
        key = item.get("name", "").lower().strip()
        if key:
            moka_map_by_name[key] = item

    moka_map_file = "mokaMap.json"
    with open(moka_map_file, "w") as f:
        json.dump(moka_map_by_name, f, indent=2, ensure_ascii=False)
    ok(f"mokaMap.json disimpan ke {moka_map_file}")

    # ── 4. Summary ────────────────────────────────────────────────────────────
    head("")
    title("RINGKASAN HASIL")
    head("")

    print(f"""
  {BOLD}Total items:{RESET}            {len(items)}
  {BOLD}Items dengan variants:{RESET}  {items_with_variants}
  {BOLD}Items dengan modifiers:{RESET} {items_with_modifiers}
  {BOLD}Total variants:{RESET}         {total_variants}
  {BOLD}Total modifier groups:{RESET}  {total_modifier_groups}
  {BOLD}Total modifiers (standalone):{RESET} {len(modifiers)}
""")

    # Tampilkan preview items dengan variants/modifiers
    print(f"{BOLD}Preview items yang punya variants atau modifiers:{RESET}")
    shown = 0
    for item in items:
        raw_v = [v for v in (item.get("item_variants") or []) if not v.get("is_deleted")]
        raw_m = [m for m in (item.get("active_modifiers") or []) if not m.get("is_deleted")]
        if len(raw_v) > 1 or raw_m:
            print(f"\n  {CYAN}▸ {item.get('name')}{RESET} (id: {item.get('id')})")
            if len(raw_v) > 1:
                print(f"    Variants ({len(raw_v)}):")
                for v in raw_v:
                    price = v.get('sell_price') or v.get('price', '-')
                    print(f"      • {v.get('name')} — Rp{price}")
            if raw_m:
                print(f"    Modifiers ({len(raw_m)} groups):")
                for m in raw_m:
                    opts = [o for o in (m.get('modifier_options') or []) if not o.get('is_deleted')]
                    print(f"      [wajib:{m.get('min_no_of_options',0)} | maks:{m.get('max_no_of_options',1)}] {m.get('name')}")
                    for o in opts[:4]:
                        price_str = f"+Rp{o.get('price')}" if o.get('price') else "gratis"
                        print(f"         - {o.get('name')} ({price_str})")
                    if len(opts) > 4:
                        print(f"         ... +{len(opts)-4} lainnya")
            shown += 1
            if shown >= 15:
                remaining = sum(1 for i in items
                               if (len([v for v in (i.get('item_variants') or []) if not v.get('is_deleted')]) > 1
                                   or [m for m in (i.get('active_modifiers') or []) if not m.get('is_deleted')]))
                if remaining > shown:
                    print(f"\n  {YELLOW}... dan {remaining - shown} item lainnya (lihat moka_variants_map.json){RESET}")
                break

    head("")
    print(f"""
{BOLD}FILE OUTPUT:{RESET}
  📄 {GREEN}moka_items_raw.json{RESET}     — semua data mentah dari API
  📄 {GREEN}moka_variants_map.json{RESET}  — terstruktur per item (variants + modifiers)
  📄 {GREEN}mokaMap.json{RESET}            — copy ke src/data/ untuk offline dev

{BOLD}NEXT STEP untuk offline dev:{RESET}
  cp mokaMap.json src/data/mokaMap.json
  # lalu tambahkan VITE_USE_LOCAL_MOKA=true di .env.local
""")


# ─── FETCH FLOW ───────────────────────────────────────────────────────────────
def run_fetch(refresh_token: str):
    head("")
    title("MOKA POS — Test & Data Export")
    print(f"  Outlet ID : {OUTLET_ID}")
    print(f"  Client ID : {CLIENT_ID[:20]}…")
    print(f"  Time      : {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    head("")

    # 1. Get access token
    access_token = get_access_token(refresh_token)

    # 2. Fetch items
    items = fetch_all_items(access_token)

    # 3. Fetch standalone modifiers
    modifiers = fetch_all_modifiers(access_token)

    # 4. Process & export
    process_and_export(items, modifiers)

    ok("Semua selesai! ✓")


# ─── MAIN ─────────────────────────────────────────────────────────────────────
def main():
    parser = argparse.ArgumentParser(
        description="Moka POS API test & data export tool",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Contoh penggunaan:
  python3 moka-test.py setup                         # OAuth flow, dapat refresh_token
  python3 moka-test.py fetch                         # Pakai MOKA_REFRESH_TOKEN env var
  python3 moka-test.py fetch --refresh-token TOKEN   # Langsung pakai token
        """
    )
    sub = parser.add_subparsers(dest="command")

    # setup command
    sub.add_parser("setup", help="Jalankan OAuth flow untuk dapat refresh_token")

    # fetch command
    fetch_parser = sub.add_parser("fetch", help="Fetch data & export JSON")
    fetch_parser.add_argument(
        "--refresh-token", "-t",
        help="Refresh token (default: dari MOKA_REFRESH_TOKEN env var atau moka_tokens.json)"
    )

    args = parser.parse_args()

    if args.command == "setup":
        run_setup()

    elif args.command == "fetch":
        # Resolve refresh token: CLI arg → env var → saved file
        refresh_token = args.refresh_token or SAVED_REFRESH_TOKEN

        if not refresh_token:
            # Coba load dari moka_tokens.json
            if os.path.exists("moka_tokens.json"):
                with open("moka_tokens.json") as f:
                    saved = json.load(f)
                refresh_token = saved.get("refresh_token", "")
                if refresh_token:
                    ok(f"Menggunakan refresh_token dari moka_tokens.json")

        if not refresh_token:
            err("Refresh token tidak ditemukan!")
            print(f"""
  Pilihan:
  1. Jalankan setup dulu:  python3 moka-test.py setup
  2. Atau langsung:        python3 moka-test.py fetch --refresh-token YOUR_TOKEN
  3. Atau set env var:     export MOKA_REFRESH_TOKEN=YOUR_TOKEN
""")
            sys.exit(1)

        run_fetch(refresh_token)

    else:
        parser.print_help()
        print(f"\n{YELLOW}Hint: Mulai dari 'setup' jika belum punya refresh_token{RESET}\n")


if __name__ == "__main__":
    main()