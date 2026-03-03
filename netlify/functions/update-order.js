// SaniScents -- update-order.js
// Database: Supabase
// Required Netlify env vars: SUPABASE_URL, SUPABASE_SERVICE_KEY, ADMIN_SECRET_KEY

const ADMIN_KEY = process.env.ADMIN_SECRET_KEY || 'saniscents-admin-2026';
const VALID = ['pending', 'confirmed', 'shipped', 'fulfilled', 'cancelled'];

exports.handler = async (event) => {
  const cors = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, x-admin-key',
  };
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers: cors, body: '' };
  if (event.httpMethod !== 'POST')
    return { statusCode: 405, headers: cors, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  if ((event.headers['x-admin-key'] || '') !== ADMIN_KEY)
    return { statusCode: 401, headers: cors, body: JSON.stringify({ error: 'Unauthorized' }) };

  try {
    const { orderId, status } = JSON.parse(event.body || '{}');
    if (!orderId || !VALID.includes(status))
      return { statusCode: 400, headers: cors, body: JSON.stringify({ error: 'Invalid request' }) };

    const res = await fetch(
      process.env.SUPABASE_URL + '/rest/v1/orders?id=eq.' + orderId,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'apikey': process.env.SUPABASE_SERVICE_KEY,
          'Authorization': 'Bearer ' + process.env.SUPABASE_SERVICE_KEY,
          'Prefer': 'return=representation',
        },
        body: JSON.stringify({ status, updated_at: new Date().toISOString() }),
      }
    );
    if (!res.ok) throw new Error(await res.text());
    const rows = await res.json();
    if (!rows.length) return { statusCode: 404, headers: cors, body: JSON.stringify({ error: 'Order not found' }) };
    return { statusCode: 200, headers: cors, body: JSON.stringify({ success: true, order: rows[0] }) };
  } catch (err) {
    return { statusCode: 500, headers: cors, body: JSON.stringify({ error: 'Server error: ' + err.message }) };
  }
};
