exports.handler = async (event) => {

    if (event.httpMethod === 'OPTIONS') {

      return {

              statusCode: 200,

              headers: {

                'Access-Control-Allow-Origin': '*',

                        'Access-Control-Allow-Headers': 'Content-Type',

                        'Access-Control-Allow-Methods': 'POST, OPTIONS'

              },

              body: ''

      };

    }

    if (event.httpMethod !== 'POST') {

      return {

              statusCode: 405,

              headers: { 'Access-Control-Allow-Origin': '*' },

              body: JSON.stringify({ error: 'Method not allowed' })

      };

    }

    try {

      const { email } = JSON.parse(event.body);

      if (!email || !email.includes('@')) {

            return {

                      statusCode: 400,

                      headers: { 'Access-Control-Allow-Origin': '*' },

                      body: JSON.stringify({ error: 'Invalid email' })

            };

      }

      const API_KEY = process.env.BREVO_API_KEY;

      const LIST_ID = parseInt(process.env.BREVO_LIST_ID);

      const response = await fetch(

              'https://api.brevo.com/v3/contacts',

        {

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

                                SOURCE: 'exit-intent',

                                            PRODUCT: 'OptionPayoff Studio'

                              }

                  })

        }

            );

      if (response.status === 201 || response.status === 204) {

            return {

                      statusCode: 200,

                      headers: {

                        'Access-Control-Allow-Origin': '*',

                                  'Content-Type': 'application/json'

                      },

                      body: JSON.stringify({ success: true })

            };

      }

      const data = await response.json();

      if (data.code === 'duplicate_parameter') {

            return {

                      statusCode: 200,

                      headers: { 'Access-Control-Allow-Origin': '*' },

                      body: JSON.stringify({ 

                                                     success: true,

                                  note: 'Contact already exists'

                      })

            };

      }

      return {

              statusCode: 400,

              headers: { 'Access-Control-Allow-Origin': '*' },

              body: JSON.stringify({ 

                                           success: false,

                        error: data.message || 'Failed'

              })

      };

    } catch (error) {

      return {

              statusCode: 500,

              headers: { 'Access-Control-Allow-Origin': '*' },

              body: JSON.stringify({ error: error.message })

      };

    }

};
