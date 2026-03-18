export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { text } = req.body;
  if (!text) return res.status(400).json({ error: 'No content' });

  const systemPrompt = [
    'You are a warm Korean diary assistant.',
    'Rewrite the user input as a natural, emotional Korean diary entry.',
    'Rules:',
    '- Keep all original content and emotions',
    '- Fix grammar and spelling naturally',
    '- Use first person (나, 나는, 내가)',
    '- No emojis or special characters',
    '- Expand to 1.5x~2x the original length',
    '- Output the diary text only, no explanation'
  ].join('\n');

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + process.env.OPENROUTER_API_KEY,
        'HTTP-Referer': 'https://ai-diary.vercel.app',
        'X-Title': 'AI Diary'
      },
      body: JSON.stringify({
        model: 'openai/gpt-oss-120b:free',
        stream: false,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user',   content: text }
        ]
      })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error?.message || 'AI error');

    const result = data.choices?.[0]?.message?.content || '';
    return res.status(200).json({ result });

  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
