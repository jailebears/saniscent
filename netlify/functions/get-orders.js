
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

  try {
    const res = await fetch(
      process.env.SUPABASE_URL + '/rest/v1/orders?select=*&order=created_at.desc',
      {
        headers: {
          'apikey': process.env.SUPABASE_SERVICE_KEY,
          'Authorization': 'Bearer ' + process.env.SUPABASE_SERVICE_KEY,
        },
      }
    );
    if (!res.ok) throw new Error(await res.text());
    const orders = await res.json();
    return { statusCode: 200, headers: cors, body: JSON.stringify({ orders }) };
  } catch (err) {
    return { statusCode: 500, headers: cors, body: JSON.stringify({ error: 'Server error: ' + err.message }) };
  }
};
