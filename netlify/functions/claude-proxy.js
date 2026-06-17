exports.handler = async (event) => {
  // Solo aceptar POST
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }
 
  // CORS headers — solo permitir desde el dominio de Netlify
  const headers = {
    'Access-Control-Allow-Origin': 'https://calculadoraflete.netlify.app',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };
 
  try {
    const body = JSON.parse(event.body);
 
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY || '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',
        'anthropic-version': '2023-06-01',
        'anthropic-beta': 'web-search-2025-03-05',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        tools: [{ type: 'web_search_20250305', name: 'web_search' }],
        messages: body.messages,
      }),
    });
 
    const data = await response.json();
    return { statusCode: 200, headers, body: JSON.stringify(data) };
 
  } catch (err) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
 
