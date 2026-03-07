exports.handler = async (event) => {
  const cors = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers: cors, body: '' };

  const orderId = (event.queryStringParameters || {}).orderId;
  if (!orderId)
    return { statusCode: 400, headers: cors, body: JSON.stringify({ error: 'Missing orderId' }) };

  try {
    const res = await fetch(
      process.env.SUPABASE_URL + '/rest/v1/orders?id=eq.' + encodeURIComponent(orderId) + '&select=id,name,scent,quantity,quantity_label,location,address,status,created_at',
      {
        headers: {
          'apikey': process.env.SUPABASE_SERVICE_KEY,
          'Authorization': 'Bearer ' + process.env.SUPABASE_SERVICE_KEY,
        },
      }
    );
    if (!res.ok) throw new Error(await res.text());
    const rows = await res.json();

    if (!rows.length)
      return { statusCode: 200, headers: cors, body: JSON.stringify({ order: null }) };

    // Only expose safe fields to customer (no contact info leak)
    const o = rows[0];
    const safe = {
      id: o.id,
      name: o.name,
      scent: o.scent,
      quantity: o.quantity,
      quantity_label: o.quantity_label,
      location: o.location,
      address: o.address,
      status: o.status,
      created_at: o.created_at,
    };

    return { statusCode: 200, headers: cors, body: JSON.stringify({ order: safe }) };
  } catch (err) {
    return { statusCode: 500, headers: cors, body: JSON.stringify({ error: 'Server error: ' + err.message }) };
  }
};
