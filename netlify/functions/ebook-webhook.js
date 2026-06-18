exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  try {
    const params = new URLSearchParams(event.body);
    const email = params.get('email');
    const productId = params.get('product_permalink');
    const saleId = params.get('sale_id');

    if (!email || productId !== 'ufuea') {
      return { statusCode: 200, body: JSON.stringify({ skipped: true }) };
    }

    const API_KEY = process.env.BREVO_API_KEY;
    const LIST_ID = 6;

    const response = await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: {
        'api-key': API_KEY,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        email: email,
        listIds: [LIST_ID],
        updateEnabled: true,
        attributes: {
          SOURCE: 'ebook-purchase',
          PRODUCT: 'Options Trading Visual Guide',
          SALE_ID: saleId || ''
        }
      })
    });

    if (response.status === 201 || response.status === 204) {
      console.log('Ebook buyer added to Brevo: ' + email);
      return {
        statusCode: 200,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ success: true, email: email })
      };
    }

    const data = await response.json();

    if (data.code === 'duplicate_parameter') {
      console.log('Contact exists, updated: ' + email);
      return { statusCode: 200, body: JSON.stringify({ success: true, note: 'updated' }) };
    }

    console.error('Brevo error:', data);
    return { statusCode: 200, body: JSON.stringify({ success: false, error: data.message }) };

  } catch (error) {
    console.error('Webhook error:', error.message);
    return { statusCode: 200, body: JSON.stringify({ error: error.message }) };
  }
};
