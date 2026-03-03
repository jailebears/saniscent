const { getStore } = require("@netlify/blobs");

const ADMIN_KEY = process.env.ADMIN_SECRET_KEY || "saniscents-admin-2026";

exports.handler = async (event) => {
  const authHeader = event.headers["x-admin-key"] || "";
  if (authHeader !== ADMIN_KEY) {
    return { statusCode: 401, body: JSON.stringify({ error: "Unauthorized" }) };
  }

  try {
    const store = getStore("orders");

    let index = [];
    try {
      const raw = await store.get("_index", { type: "json" });
      if (Array.isArray(raw)) index = raw;
    } catch (_) {}

    const orders = [];
    for (const id of index) {
      try {
        const order = await store.get(id, { type: "json" });
        if (order) orders.push(order);
      } catch (_) {}
    }

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify({ orders }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Server error: " + err.message }),
    };
  }
};
