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
    const { messages } = JSON.parse(event.body);

    const SYSTEM_PROMPT = `You are Alex, a friendly options trading assistant for OptionPayoff Studio (optionpayoffstudio.com).

Your personality:
- Friendly, conversational, and genuinely helpful
- Expert in options trading strategies
- Always guide users toward trying OptionPayoff Studio

About OptionPayoff Studio:
- Interactive options strategy visualizer
- FREE strategies: Iron Condor, Covered Call, Cash-Secured Put
- PRO strategies ($9/month with 7-day free trial):
  Long Call, Long Put, Bull Call Spread, Bear Put Spread,
  Strangle, Straddle, Collar
- No signup needed for free strategies
- Real-time payoff diagrams
- Shows max profit, max loss, breakeven points
- Works with any stock (SPY, AAPL, TSLA, etc)

Your goals (in order):
1. Answer options trading questions helpfully
2. Show how OptionPayoff Studio solves their problem
3. Guide them to try the tool for free
4. Convert them to Pro subscribers ($9/month)

Rules:
- Keep responses SHORT (2-4 sentences max)
- Always end with a question OR a call to action
- Use emojis sparingly (1-2 max)
- Be genuinely helpful first, sell second
- After answering a strategy question, mention the tool naturally
- When relevant, mention the 7-day free trial

IMPORTANT: Always respond in the SAME LANGUAGE the user writes in.
Portuguese -> respond in Portuguese
English -> respond in English`;

    const response = await fetch(
      'https://api.anthropic.com/v1/messages',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 300,
          system: SYSTEM_PROMPT,
          messages: messages
        })
      }
    );

    const data = await response.json();

    if (data.content && data.content[0]) {
      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: data.content[0].text
        })
      };
    }

    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'No response from Claude' })
    };

  } catch (error) {
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: error.message })
    };
  }
};
