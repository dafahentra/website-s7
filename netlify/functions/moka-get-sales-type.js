// netlify/functions/moka-get-sales-type.js
// TEMPORARY — jalankan sekali untuk dapat sales_type_id "Online Order"
// Setelah dapat ID-nya, hapus file ini.
//
// Cara pakai:
//   Buka: https://sectorseven.space/.netlify/functions/moka-get-sales-type
//   Lihat hasilnya, cari id dari "Online Order"
//   Salin id tersebut ke useMokaCheckout.js

const MOKA_BASE   = "https://api.mokapos.com";
const OUTLET_ID   = process.env.MOKA_OUTLET_ID;
const ACCESS_TOKEN = process.env.MOKA_ACCESS_TOKEN;

export const handler = async () => {
  try {
    // 1. List semua sales type yang ada
    const listRes  = await fetch(
      `${MOKA_BASE}/v1/outlets/${OUTLET_ID}/sales_type`,
      { headers: { Authorization: `Bearer ${ACCESS_TOKEN}` } }
    );
    const listData = await listRes.json();
    const existing = listData?.data?.results ?? [];

    // 2. Cari "Online Order" dari list
    const onlineOrder = existing.find(
      (s) => s.name?.toLowerCase() === "online order" && !s.is_deleted
    );

    // 3. Generate sales type khusus untuk Advanced Ordering (jika perlu)
    const genRes  = await fetch(
      `${MOKA_BASE}/v1/outlets/${OUTLET_ID}/advanced_orderings/generate_sales_type`,
      {
        method:  "POST",
        headers: { Authorization: `Bearer ${ACCESS_TOKEN}`, "Content-Type": "application/json" },
      }
    );
    const genData = await genRes.json();

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({
        all_sales_types:    existing.map((s) => ({ id: s.id, name: s.name, active: s.active_state })),
        online_order_found: onlineOrder ? { id: onlineOrder.id, name: onlineOrder.name } : null,
        generated:          genData?.data ?? genData,
        // ← Salin id dari "online_order_found" ke ONLINE_ORDER_SALES_TYPE_ID di useMokaCheckout.js
      }, null, 2),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};