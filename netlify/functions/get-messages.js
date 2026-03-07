// Fetches all messages for a given orderId from Supabase

const ADMIN_KEY = process.env.ADMIN_SECRET_KEY || 'saniscents-admin-2026';

exports.handler = async (event) => {
  const cors = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, x-admin-key',
  };
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers: cors, body: '' };
  if ((event.headers['x-admin-key'] || '') !== ADMIN_KEY)
    return { statusCode: 401, headers: cors, body: JSON.stringify({ error: 'Unauthorized' }) };

  const orderId = (event.queryStringParameters || {}).orderId;
  if (!orderId)
    return { statusCode: 400, headers: cors, body: JSON.stringify({ error: 'Missing orderId' }) };

  try {
    const res = await fetch(
      process.env.SUPABASE_URL + '/rest/v1/messages?order_id=eq.' + orderId + '&order=created_at.asc',
      {
        headers: {
          'apikey': process.env.SUPABASE_SERVICE_KEY,
          'Authorization': 'Bearer ' + process.env.SUPABASE_SERVICE_KEY,
        },
      }
    );
    if (!res.ok) throw new Error(await res.text());
    const messages = await res.json();
    return { statusCode: 200, headers: cors, body: JSON.stringify({ messages }) };
  } catch (err) {
    return { statusCode: 500, headers: cors, body: JSON.stringify({ error: 'Server error: ' + err.message }) };
  }
};
