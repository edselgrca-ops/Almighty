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

    const prompt = `You are a Christian devotional writer. Given a prayer topic, return a JSON object with exactly these four fields:

- "verseRef": a relevant Bible verse reference and translation, e.g. "Isaiah 26:3 (NIV)"
- "verseText": the full text of that verse (quoted exactly)
- "verseExplanation": 2–3 sentences explaining how this verse speaks to the topic
- "prayer": a heartfelt, personal Christian prayer (130–180 words, first person, warm tone, begins with "Lord," or "Heavenly Father," or "Father God,", ends with "Amen.")

Topic: "${topic}"

Return only valid JSON — no markdown, no code fences, no extra text.`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: 1200, responseMimeType: 'application/json' }
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

    const raw = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '{}';
    const result = JSON.parse(raw);

    return new Response(JSON.stringify(result), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      }
    });
  }
};
