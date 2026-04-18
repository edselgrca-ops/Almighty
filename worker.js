export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST',
          'Access-Control-Allow-Headers': 'Content-Type',
        }
      });
    }

    const { topic } = await request.json();

    const prompt = `Write a contemporary, heartfelt Christian prayer about: "${topic}".

Requirements:
- Personal, warm, conversational tone — not formal or archaic
- First person (I / we)
- 130–180 words
- Begin directly with "Lord," or "Heavenly Father," or "Father God,"
- End with "Amen."
- No headings, no explanation — just the prayer text itself`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: 1000 }
        })
      }
    );

    const data = await response.json();
    if (data.error) {
      return new Response(JSON.stringify({ error: data.error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';

    return new Response(JSON.stringify({ text }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      }
    });
  }
};
