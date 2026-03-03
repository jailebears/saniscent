

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

  try {
    const body = JSON.parse(event.body || '{}');
    const { orderId, sender, text } = body;

    if (!orderId || !text)
      return { statusCode: 400, headers: cors, body: JSON.stringify({ error: 'Missing orderId or text' }) };

    // Admin must provide correct key
    if (sender === 'admin' && (event.headers['x-admin-key'] || '') !== ADMIN_KEY)
      return { statusCode: 401, headers: cors, body: JSON.stringify({ error: 'Unauthorized' }) };

    const safeSender = sender === 'admin' ? 'admin' : 'customer';

    const message = {
      order_id: orderId,
      sender: safeSender,
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

    if (!res.ok) {
      const errText = await res.text();
      console.error('Supabase error:', res.status, errText);
      throw new Error('Supabase ' + res.status + ': ' + errText);
    }

    return { statusCode: 200, headers: cors, body: JSON.stringify({ success: true }) };
  } catch (err) {
    return {
      statusCode: 500,
      headers: cors,
      body: JSON.stringify({ error: 'Server error: ' + err.message }),
    };
  }
};
