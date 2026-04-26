// netlify/functions/_lib/ntfy.js
// Helper untuk kirim push notification ke admin via ntfy.sh
//
// ENV var (existing di production): NTFY_TOPIC = "sectorseven-alerts-XXXXXX"
// Helper compose URL: https://ntfy.sh/${NTFY_TOPIC}
//
// Subscribe via app ntfy (Android/iOS) atau buka URL di browser.

const NTFY_TOPIC = process.env.NTFY_TOPIC;
const NTFY_BASE  = "https://ntfy.sh";

// Priority: 1 (min) - 5 (max/urgent)
// Tags: comma-separated emoji codes (warning, rotating_light, gift, money, etc)
//   ref: https://docs.ntfy.sh/emojis/

/**
 * Kirim notifikasi ke ntfy topic.
 * Fire-and-forget — tidak block flow utama kalau ntfy down.
 *
 * @param {Object} opts
 * @param {string} opts.title    — judul notif (max 250 char)
 * @param {string} opts.message  — body notif (max 4096 char)
 * @param {number} [opts.priority=3]  — 1-5
 * @param {string} [opts.tags]   — comma-separated emoji codes
 * @param {string} [opts.click]  — URL yang terbuka saat tap notif
 */
export async function notify({ title, message, priority = 3, tags = "", click = "" }) {
  if (!NTFY_TOPIC) {
    console.warn("[ntfy] NTFY_TOPIC not set — skip");
    return null;
  }

  try {
    const headers = {
      "Content-Type": "text/plain; charset=utf-8",
      Title:          String(title).slice(0, 250),
      Priority:       String(Math.max(1, Math.min(5, priority))),
    };
    if (tags) headers.Tags = tags;
    if (click) headers.Click = click;

    const res = await fetch(`${NTFY_BASE}/${NTFY_TOPIC}`, {
      method:  "POST",
      headers,
      body:    String(message).slice(0, 4096),
    });

    if (!res.ok) {
      console.error("[ntfy] failed:", res.status, await res.text().catch(() => ""));
    }
    return res;
  } catch (err) {
    console.error("[ntfy] error:", err.message);
    return null;
  }
}

/** Priority 5 — kasus butuh manual handling segera */
export async function notifyUrgent({ title, message, tags = "rotating_light", click = "" }) {
  return notify({ title, message, priority: 5, tags, click });
}

/** Priority 3 — info biasa untuk audit trail */
export async function notifyInfo({ title, message, tags = "information_source", click = "" }) {
  return notify({ title, message, priority: 3, tags, click });
}