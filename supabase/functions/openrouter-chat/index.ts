const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

type ChatMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

function jsonResponse(body: Record<string, unknown>, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405);
  }

  const apiKey = Deno.env.get('OPENROUTER_API_KEY');
  if (!apiKey) {
    return jsonResponse({
      error: 'OpenRouter is not configured. Set the OPENROUTER_API_KEY Supabase Edge Function secret.',
    }, 503);
  }

  if (!req.headers.get('Authorization')?.startsWith('Bearer ')) {
    return jsonResponse({ error: 'A valid sign-in session is required.' }, 401);
  }

  try {
    const body = await req.json();
    const messages: ChatMessage[] = body?.messages;
    if (
      !Array.isArray(messages) ||
      messages.length === 0 ||
      !messages.every((message) =>
        message &&
        ['system', 'user', 'assistant'].includes(message.role) &&
        typeof message.content === 'string' &&
        message.content.length <= 20000
      )
    ) {
      return jsonResponse({ error: 'The chat request is invalid.' }, 400);
    }

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://mindspace-app.com',
        'X-Title': 'MindSpace AI Support',
      },
      body: JSON.stringify({
        model: 'qwen/qwen-2.5-72b-instruct',
        messages,
        temperature: typeof body.temperature === 'number' ? body.temperature : 0.8,
        max_tokens: typeof body.max_tokens === 'number' ? body.max_tokens : 200,
        top_p: typeof body.top_p === 'number' ? body.top_p : 0.95,
      }),
    });

    if (!response.ok) {
      const errorText = (await response.text()).slice(0, 1000);
      console.error('OpenRouter request failed:', response.status, errorText);
      return jsonResponse({ error: `OpenRouter request failed (${response.status}).` }, 502);
    }

    const result = await response.json();
    const content = result?.choices?.[0]?.message?.content;
    if (typeof content !== 'string' || !content.trim()) {
      console.error('OpenRouter returned an invalid response.');
      return jsonResponse({ error: 'OpenRouter returned an invalid response.' }, 502);
    }

    return jsonResponse({ content });
  } catch (error) {
    console.error('OpenRouter Edge Function failed:', error);
    return jsonResponse({ error: 'Unable to reach OpenRouter right now.' }, 502);
  }
});
