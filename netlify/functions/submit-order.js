exports.handler = async (event) => {
  const cors = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers: cors, body: '' };
  if (event.httpMethod !== 'POST')
    return { statusCode: 405, headers: cors, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  try {
    const { name, contact, address, scent, quantity, quantityLabel, location, notes } =
      JSON.parse(event.body || '{}');
    if (!name || !contact || !address || !scent || !quantity)
      return { statusCode: 400, headers: cors, body: JSON.stringify({ error: 'Missing required fields' }) };

    const orderId = 'ORD-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5).toUpperCase();

    const order = {
      id: orderId,
      name,
      contact,
      address,
      scent,
      quantity: parseInt(quantity),
      quantity_label: quantityLabel || '',
      location: location || '',
      notes: notes || '',
      status: 'pending',
      created_at: new Date().toISOString(),
    };

    const res = await fetch(process.env.SUPABASE_URL + '/rest/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': process.env.SUPABASE_SERVICE_KEY,
        'Authorization': 'Bearer ' + process.env.SUPABASE_SERVICE_KEY,
        'Prefer': 'return=minimal',
      },
      body: JSON.stringify(order),
    });

    if (!res.ok) throw new Error(await res.text());

    return { statusCode: 200, headers: cors, body: JSON.stringify({ success: true, orderId }) };
  } catch (err) {
    return { statusCode: 500, headers: cors, body: JSON.stringify({ error: 'Server error: ' + err.message }) };
  }
};
