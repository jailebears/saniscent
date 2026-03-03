// SaniScents -- send-message.js
// Saves a new message to Supabase messages table
// Required env vars: SUPABASE_URL, SUPABASE_SERVICE_KEY, ADMIN_SECRET_KEY

const ADMIN_KEY = process.env.ADMIN_SECRET_KEY || 'saniscents-admin-2026';

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
    const { orderId, sender, text } = JSON.parse(event.body || '{}');
    if (!orderId || !sender || !text)
      return { statusCode: 400, headers: cors, body: JSON.stringify({ error: 'Missing fields' }) };

    const message = {
      order_id: orderId,
      sender: sender,   // 'admin' or 'customer'
      text: text,
      created_at: new Date().toISOString(),
    };

    const res = await fetch(process.env.SUPABASE_URL + '/rest/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': process.env.SUPABASE_SERVICE_KEY,
        'Authorization': 'Bearer ' + process.env.SUPABASE_SERVICE_KEY,
        'Prefer': 'return=minimal',
      },
      body: JSON.stringify(message),
    });

    if (!res.ok) throw new Error(await res.text());
    return { statusCode: 200, headers: cors, body: JSON.stringify({ success: true }) };
  } catch (err) {
    return { statusCode: 500, headers: cors, body: JSON.stringify({ error: 'Server error: ' + err.message }) };
  }
};
