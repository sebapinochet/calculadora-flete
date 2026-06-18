exports.handler = async (event) => {
  const allowedOrigins = [
    'https://calculadoraflete.netlify.app',
    'https://calculadoraflete2.netlify.app'
  ];
  const origin = event.headers.origin || '';
  const corsOrigin = allowedOrigins.includes(origin) ? origin : allowedOrigins[1];
 
  const headers = {
    'Access-Control-Allow-Origin': corsOrigin,
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
  };
 
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }
 
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: 'Method Not Allowed' };
  }
 
  try {
    const body = JSON.parse(event.body);
    // useSearch=true: incluir web search (para precios CNE)
    // useSearch=false: sin web search, respuesta rápida (para peajes)
    const useSearch = body.useSearch === true;
 
    const requestBody = {
      model: 'claude-sonnet-4-6',
      max_tokens: useSearch ? 2000 : 800,
      messages: body.messages,
    };
 
    const reqHeaders = {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    };
 
    if (useSearch) {
      reqHeaders['anthropic-beta'] = 'web-search-2025-03-05';
      requestBody.tools = [{ type: 'web_search_20250305', name: 'web_search' }];
    }
 
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: reqHeaders,
      body: JSON.stringify(requestBody),
    });
 
    const data = await response.json();
    return { statusCode: 200, headers, body: JSON.stringify(data) };
 
  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
