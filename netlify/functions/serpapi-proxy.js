const SERPAPI_KEY = process.env.SERPAPI_KEY;

exports.handler = async (event) => {
  if (!SERPAPI_KEY) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Missing SerpAPI key' }) };
  }
  
  const { query, useAIMode = true } = JSON.parse(event.body || '{}');
  if (!query) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Missing query' }) };
  }

  // Choose engine based on mode
  const engine = useAIMode ? 'google_ai_mode' : 'google';

  // Build params cleanly
  const params = new URLSearchParams({
    engine,
    q: query,
    api_key: SERPAPI_KEY,
    hl: 'en',
    gl: 'us',
  });

  // Optional: no_cache for AI mode to avoid stale responses
  if (useAIMode) {
    params.append('no_cache', 'true');
  }

  // Optional: request more results in regular mode
  if (!useAIMode) {
    params.append('num', '10');
  }

  const url = `https://serpapi.com/search.json?${params.toString()}`;

  try {
    // Direct fetch – no proxy needed!
    const response = await fetch(url);

    if (!response.ok) {
      const errorText = await response.text();
      return {
        statusCode: response.status,
        body: JSON.stringify({ error: `SerpAPI error: ${response.status} - ${errorText}` })
      };
    }

    const data = await response.json();

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};