exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
      return { statusCode: 405, body: 'Method not allowed' };
        }

          const { email } = JSON.parse(event.body);

            if (!email || !email.includes('@')) {
                return {
                      statusCode: 400,
                            body: JSON.stringify({ error: 'Invalid email' })
                                };
                                  }

                                    const API_KEY = process.env.MAILCHIMP_API_KEY;
                                      const AUDIENCE_ID = process.env.MAILCHIMP_AUDIENCE_ID;
                                        const SERVER = process.env.MAILCHIMP_SERVER;

                                          const url = `https://${SERVER}.api.mailchimp.com/3.0/lists/${AUDIENCE_ID}/members`;

                                            try {
                                                const response = await fetch(url, {
                                                      method: 'POST',
                                                            headers: {
                                                                    'Authorization': `Bearer ${API_KEY}`,
                                                                            'Content-Type': 'application/json',
                                                                                  },
                                                                                        body: JSON.stringify({
                                                                                                email_address: email,
                                                                                                        status: 'subscribed',
                                                                                                                tags: ['exit-intent', 'free-trial']
                                                                                                                      })
                                                                                                                          });
                                                                                                                          
                                                                                                                              const data = await response.json();
                                                                                                                              
                                                                                                                                  if (data.status === 'subscribed' || data.id) {
                                                                                                                                        return {
                                                                                                                                                statusCode: 200,
                                                                                                                                                        headers: {
                                                                                                                                                                  'Access-Control-Allow-Origin': '*',
                                                                                                                                                                            'Content-Type': 'application/json'
                                                                                                                                                                                    },
                                                                                                                                                                                            body: JSON.stringify({ success: true })
                                                                                                                                                                                                  };
                                                                                                                                                                                                      } else {
                                                                                                                                                                                                            return {
                                                                                                                                                                                                                    statusCode: 400,
                                                                                                                                                                                                                            headers: { 'Access-Control-Allow-Origin': '*' },
                                                                                                                                                                                                                                    body: JSON.stringify({ 
                                                                                                                                                                                                                                              success: false, 
                                                                                                                                                                                                                                                        error: data.detail || 'Subscription failed' 
                                                                                                                                                                                                                                                                })
                                                                                                                                                                                                                                                                      };
                                                                                                                                                                                                                                                                          }
                                                                                                                                                                                                                                                                            } catch (error) {
                                                                                                                                                                                                                                                                                return {
                                                                                                                                                                                                                                                                                      statusCode: 500,
                                                                                                                                                                                                                                                                                            headers: { 'Access-Control-Allow-Origin': '*' },
                                                                                                                                                                                                                                                                                                  body: JSON.stringify({ error: error.message })
                                                                                                                                                                                                                                                                                                      };
                                                                                                                                                                                                                                                                                                        }
                                                                                                                                                                                                                                                                                                        };
