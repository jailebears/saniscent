const { getStore } = require("@netlify/blobs");
const ADMIN_KEY = process.env.ADMIN_SECRET_KEY || "saniscents-admin-2026";
exports.handler = async (event) => {
  if (event.httpMethod !== "POST") return { statusCode: 405, body: "Method Not Allowed" };
  const authHeader = event.headers["x-admin-key"] || "";
  if (authHeader !== ADMIN_KEY) return { statusCode: 401, body: JSON.stringify({ error: "Unauthorized" }) };
  try {
    const { orderId, status } = JSON.parse(event.body);
    const validStatuses = ["pending", "confirmed", "shipped", "fulfilled", "cancelled"];
    if (!orderId || !validStatuses.includes(status)) return { statusCode: 400, body: JSON.stringify({ error: "Invalid" }) };
    const store = getStore("orders");
    const order = await store.get(orderId, { type: "json" });
    if (!order) return { statusCode: 404, body: JSON.stringify({ error: "Not found" }) };
    order.status = status;
    order.updatedAt = new Date().toISOString();
    await store.setJSON(orderId, order);
    return { statusCode: 200, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }, body: JSON.stringify({ success: true, order }) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
