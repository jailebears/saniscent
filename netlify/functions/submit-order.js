const { getStore } = require("@netlify/blobs");

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const body = JSON.parse(event.body);
    const { name, contact, address, scent, quantity, notes } = body;

    if (!name || !contact || !address || !scent || !quantity) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing required fields" }),
      };
    }

    const store = getStore("orders");

    const orderId = "ORD-" + Date.now() + "-" + Math.random().toString(36).substr(2, 5).toUpperCase();
    const timestamp = new Date().toISOString();

    const order = {
      id: orderId,
      name,
      contact,
      address,
      scent,
      quantity: parseInt(quantity),
      notes: notes || "",
      status: "pending",
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    await store.setJSON(orderId, order);

    // Maintain index list
    let index = [];
    try {
      const raw = await store.get("_index", { type: "json" });
      if (Array.isArray(raw)) index = raw;
    } catch (_) {}
    index.unshift(orderId);
    await store.setJSON("_index", index);

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify({ success: true, orderId }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Server error: " + err.message }),
    };
  }
};
