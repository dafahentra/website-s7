#!/usr/bin/env python3
"""
moka-test-data.py
Test koneksi Moka, ambil items, cocokkan dengan menu Sector Seven,
dan generate dummy mokaMap.json untuk dipakai di frontend saat dev.

Usage:
  python3 moka-test-data.py

Requirements:
  pip install requests
"""

import json, sys, os, time
from urllib.parse import quote

try:
    import requests
except ImportError:
    print("Install dulu: pip3 install requests")
    sys.exit(1)

# ── Credentials ───────────────────────────────────────────────────────────────
CLIENT_ID     = "d01822723dc890ba8a4b84d318920f236a694d75fdcea7ad079718bc7f55d730"
CLIENT_SECRET = "a40de2db135e2a2cf73cd0c7af5be979ec2530d4878e5129c9bfdd32bc724887"
REDIRECT_URI  = "https://sectorseven.space/callback"
MOKA_BASE     = "https://api.mokapos.com"
SCOPES        = "profile library transaction checkout_api"
STATE_FILE    = os.path.expanduser("~/.moka_test_state.json")

# ── Colors ────────────────────────────────────────────────────────────────────
G="\033[92m"; R="\033[91m"; Y="\033[93m"; C="\033[96m"
W="\033[97m"; DIM="\033[2m"; BOLD="\033[1m"; RESET="\033[0m"

def ok(m):   print(f"  {G}✓{RESET} {m}")
def err(m):  print(f"  {R}✗{RESET} {m}")
def info(m): print(f"  {C}→{RESET} {m}")
def warn(m): print(f"  {Y}⚠{RESET} {m}")
def sep():   print(f"\n{DIM}{'─'*56}{RESET}")

# ── Local menu names (from menuData.js) ───────────────────────────────────────
LOCAL_MENU = {
    "Espresso Based":  ["Sectorize","Americano","Abericano","Latte","Cappucino"],
    "Flavoured Lattes":["White Vanilla","Buttery","Hazelnutz","Palmer","Caramelted"],
    "Matcha Series":   ["Pure Matcha","Green Flag","Red Flag","Dirty Matcha","Sea Salt Matcha"],
    "Milk Series":     ["Chocolate","Red Velvet","Wizzie Berry"],
    "Pastry":          ["Croissant Almond","Cinnamon Roll","Apple Danish"],
    "Sourdough":       ["Plain","Double Choco","Blueberry Cream Cheese"],
}
ALL_LOCAL_NAMES = [n for names in LOCAL_MENU.values() for n in names]

# ── State helpers ─────────────────────────────────────────────────────────────
def load_state():
    if os.path.exists(STATE_FILE):
        with open(STATE_FILE) as f:
            return json.load(f)
    return {}

def save_state(s):
    with open(STATE_FILE,"w") as f:
        json.dump(s, f, indent=2)

# ── Auth helpers ──────────────────────────────────────────────────────────────
def get_token_via_refresh(refresh_token):
    res = requests.post(f"{MOKA_BASE}/oauth/token", json={
        "grant_type":    "refresh_token",
        "client_id":     CLIENT_ID,
        "client_secret": CLIENT_SECRET,
        "refresh_token": refresh_token,
    }, timeout=15)
    data = res.json()
    if not res.ok:
        raise Exception(data.get("error_description") or data.get("error") or str(data))
    return data

def get_token_via_code(code):
    res = requests.post(f"{MOKA_BASE}/oauth/token", json={
        "grant_type":    "authorization_code",
        "client_id":     CLIENT_ID,
        "client_secret": CLIENT_SECRET,
        "code":          code,
        "redirect_uri":  REDIRECT_URI,
    }, timeout=15)
    data = res.json()
    if not res.ok:
        raise Exception(data.get("error_description") or data.get("error") or str(data))
    return data

# ── Main test ─────────────────────────────────────────────────────────────────
def main():
    print(f"\n{BOLD}{C}╔══════════════════════════════════════════════════════╗")
    print(f"║  🔍  Moka Data Tester — Sector Seven                ║")
    print(f"╚══════════════════════════════════════════════════════╝{RESET}\n")

    state = load_state()
    access_token = None

    # ── Step 1: Get access token ──────────────────────────────────────────────
    sep()
    print(f"{BOLD}  [1/4] Autentikasi{RESET}")

    if state.get("refresh_token"):
        info("Mencoba refresh token yang tersimpan...")
        try:
            tok = get_token_via_refresh(state["refresh_token"])
            access_token = tok["access_token"]
            state["access_token"] = access_token
            if "refresh_token" in tok:
                state["refresh_token"] = tok["refresh_token"]
            save_state(state)
            ok(f"Token refreshed: {access_token[:30]}...")
        except Exception as e:
            err(f"Refresh gagal: {e}")
            state.pop("refresh_token", None)
            save_state(state)

    if not access_token:
        # Try with code
        print(f"\n  Perlu authorization. Buka URL ini di browser:\n")
        auth_url = (
            f"{MOKA_BASE}/oauth/authorize"
            f"?client_id={CLIENT_ID}"
            f"&redirect_uri={quote(REDIRECT_URI)}"
            f"&response_type=code"
            f"&scope={quote(SCOPES)}"
        )
        print(f"  {C}{auth_url}{RESET}\n")
        print(f"  Setelah Allow, copy nilai 'code' dari URL redirect.")
        code = input(f"\n  {Y}Paste code di sini: {RESET}").strip()
        if not code:
            err("Code kosong, keluar.")
            sys.exit(1)

        info("Menukar code → token...")
        try:
            tok = get_token_via_code(code)
            access_token = tok["access_token"]
            state["access_token"]  = access_token
            state["refresh_token"] = tok["refresh_token"]
            save_state(state)
            ok(f"access_token : {access_token[:30]}...")
            ok(f"refresh_token: {tok['refresh_token'][:30]}...")
        except Exception as e:
            err(f"Exchange gagal: {e}")
            sys.exit(1)

    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type":  "application/json",
    }

    # ── Step 2: Get outlet ID ─────────────────────────────────────────────────
    sep()
    print(f"{BOLD}  [2/4] Ambil Outlet ID{RESET}\n")

    outlet_id = state.get("outlet_id")

    if not outlet_id:
        # Get profile first
        info("GET /v1/profile/self ...")
        try:
            res = requests.get(f"{MOKA_BASE}/v1/profile/self", headers=headers, timeout=15)
            data = res.json()
            if res.ok:
                profile = data.get("data", {})
                biz_id  = profile.get("business_id") or profile.get("id")
                name    = profile.get("name") or profile.get("business_name", "?")
                ok(f"Business: {name}  (ID: {biz_id})")
                state["business_id"] = biz_id

                # Get outlets
                info(f"GET /v1/businesses/{biz_id}/outlets ...")
                res2 = requests.get(
                    f"{MOKA_BASE}/v1/businesses/{biz_id}/outlets",
                    headers=headers, timeout=15
                )
                data2 = res2.json()
                if res2.ok:
                    outlets = data2.get("data", [])
                    if not isinstance(outlets, list): outlets = [outlets]
                    print(f"\n  {G}Outlets:{RESET}")
                    for o in outlets:
                        print(f"    ID: {BOLD}{o.get('id')}{RESET}  |  {o.get('name')}")
                    if outlets:
                        outlet_id = outlets[0]["id"]
                        state["outlet_id"] = outlet_id
                        save_state(state)
                        ok(f"Menggunakan outlet_id: {outlet_id}")
                else:
                    err(f"Outlets error: {data2}")
            else:
                err(f"Profile error: {data}")
        except Exception as e:
            err(f"Request error: {e}")
            sys.exit(1)
    else:
        ok(f"Outlet ID dari cache: {outlet_id}")

    if not outlet_id:
        outlet_id = input(f"  {Y}Masukkan outlet_id manual: {RESET}").strip()
        state["outlet_id"] = outlet_id
        save_state(state)

    # ── Step 3: Fetch all items ───────────────────────────────────────────────
    sep()
    print(f"{BOLD}  [3/4] Fetch Items dari Moka{RESET}\n")

    info(f"GET /v1/outlets/{outlet_id}/items?per_page=200 ...")
    try:
        res = requests.get(
            f"{MOKA_BASE}/v1/outlets/{outlet_id}/items?per_page=200&include_deleted=false",
            headers=headers, timeout=20
        )
        data = res.json()
        print(f"  HTTP {res.status_code}\n")

        if not res.ok:
            err(f"Error: {data.get('meta',{}).get('error_message', data)}")
            sys.exit(1)

        moka_items = data.get("data",{}).get("items") or data.get("data",{}).get("item", [])
        ok(f"Total items di Moka: {len(moka_items)}")

        # Print all Moka item names
        print(f"\n  {BOLD}Semua item di Moka ({len(moka_items)}):{RESET}")
        for item in moka_items:
            n_variants  = len(item.get("item_variants") or [])
            n_modifiers = len(item.get("active_modifiers") or [])
            variants_str  = f"{C}{n_variants} variant{'s' if n_variants!=1 else ''}{RESET}"
            modifiers_str = f"{Y}{n_modifiers} modifier{'s' if n_modifiers!=1 else ''}{RESET}"
            print(f"    • {item['name']:<28} {variants_str}  {modifiers_str}")

    except Exception as e:
        err(f"Request error: {e}")
        sys.exit(1)

    # ── Step 4: Match dengan local menu ───────────────────────────────────────
    sep()
    print(f"{BOLD}  [4/4] Cocokkan dengan Menu Sector Seven{RESET}\n")

    moka_by_name = {}
    for mi in moka_items:
        moka_by_name[mi["name"].lower().strip()] = mi

    matched   = []
    unmatched = []

    for category, names in LOCAL_MENU.items():
        for name in names:
            moka = moka_by_name.get(name.lower().strip())
            if moka:
                matched.append((category, name, moka))
            else:
                unmatched.append((category, name))

    # Print matched
    print(f"  {G}{BOLD}✓ Cocok ({len(matched)}/{len(ALL_LOCAL_NAMES)}):{RESET}")
    for cat, name, moka in matched:
        variants  = moka.get("item_variants") or []
        modifiers = moka.get("active_modifiers") or []
        v_names = [v.get("name") or "default" for v in variants]
        m_names = [m.get("name") for m in modifiers]
        print(f"    {G}✓{RESET} {name:<28}  variants={C}{v_names}{RESET}  mods={Y}{m_names}{RESET}")

    # Print unmatched
    if unmatched:
        print(f"\n  {R}{BOLD}✗ Tidak cocok ({len(unmatched)}):{RESET}")
        print(f"  {DIM}  (nama di menuData.js berbeda dengan nama di Moka){RESET}")
        for cat, name in unmatched:
            # Find closest match
            close = [mk for mk in moka_by_name if name.lower() in mk or mk in name.lower()]
            hint = f"  {DIM}→ mungkin: {close[0]!r}?{RESET}" if close else ""
            print(f"    {R}✗{RESET} [{cat}] {name!r}{hint}")
    else:
        print(f"\n  {G}{BOLD}🎉 Semua item cocok!{RESET}")

    # ── Generate mokaMap.json ─────────────────────────────────────────────────
    sep()
    print(f"{BOLD}  Generate mokaMap.json{RESET}\n")

    # Build mokaMap: { localId: mokaItem }
    local_id_map = {}
    local_id = 1
    for cat, names in LOCAL_MENU.items():
        for name in names:
            local_id_map[name] = local_id
            local_id += 1

    moka_map = {}
    for cat, name, moka in matched:
        lid = local_id_map.get(name)
        if lid:
            moka_map[str(lid)] = moka

    # Save to file
    out_file = "mokaMap.json"
    with open(out_file, "w") as f:
        json.dump(moka_map, f, indent=2, ensure_ascii=False)

    ok(f"Saved: {out_file}  ({len(moka_map)} items mapped)")

    # Print summary of first matched item
    if moka_map:
        first_id = next(iter(moka_map))
        first    = moka_map[first_id]
        print(f"\n  {DIM}Contoh struktur (item ID {first_id} — {first.get('name')}):{RESET}")

        variants  = first.get("item_variants") or []
        modifiers = first.get("active_modifiers") or []

        print(f"    item_variants ({len(variants)}):")
        for v in variants[:3]:
            print(f"      id:{v.get('id')}  name:{v.get('name')!r}  price:{v.get('price')}")

        print(f"    active_modifiers ({len(modifiers)}):")
        for m in modifiers[:3]:
            opts = m.get("modifier_options") or m.get("active_options") or []
            print(f"      id:{m.get('id')}  name:{m.get('name')!r}  options:{len(opts)}")
            for o in opts[:4]:
                print(f"        └ id:{o.get('id')}  {o.get('name')!r}  price:{o.get('price')}")

    # ── Env vars summary ──────────────────────────────────────────────────────
    sep()
    print(f"{BOLD}  Summary — Copy ke Netlify Environment Variables:{RESET}\n")
    print(f"  {DIM}MOKA_CLIENT_ID     = {CLIENT_ID}")
    print(f"  MOKA_SECRET        = {CLIENT_SECRET}")
    if state.get("refresh_token"):
        print(f"  MOKA_REFRESH_TOKEN = {state['refresh_token']}")
    if outlet_id:
        print(f"  MOKA_OUTLET_ID     = {outlet_id}{RESET}")

    print(f"\n  {G}File mokaMap.json sudah dibuat di folder ini.{RESET}")
    print(f"  {DIM}Taruh di src/data/mokaMap.json untuk dipakai sebagai fallback saat dev.{RESET}\n")

if __name__ == "__main__":
    main()