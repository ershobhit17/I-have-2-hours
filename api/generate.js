/**
 * Vercel Serverless Function Proxy for OpenRouter AI
 * Allows secure deployments where the OpenRouter API Key is stored
 * in server environment variables (OPENROUTER_API_KEY) rather than client-side code.
 */

export default async function handler(req, res) {
  // CORS support
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  // Use environment variable from Vercel / hosting provider
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    return res.status(500).json({
      error: 'OPENROUTER_API_KEY is not configured in environment variables.'
    });
  }

  const { model, messages, temperature, max_tokens } = req.body || {};

  try {
    const origin = req.headers.origin || req.headers.referer || 'https://ihave2hours.vercel.app';
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': origin,
        'X-Title': 'I Have 2 Hours'
      },
      body: JSON.stringify({
        model: model || 'google/gemini-2.5-flash',
        messages: messages || [],
        temperature: typeof temperature === 'number' ? temperature : 0.6,
        max_tokens: max_tokens || 1500
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Internal proxy error' });
  }
}
