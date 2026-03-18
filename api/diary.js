export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { text } = req.body;
  if (!text) return res.status(400).json({ error: '내용이 없어요' });

  const systemPrompt = `당신은 친근하고 따뜻한 일기 정리 도우미입니다.
사용자가 짧고 구어체로 적은 일기 내용을 받아서,
자연스럽고 감성적인 한국어 일기 문체로 아름답게 다듬어 주세요.
규칙:
- 원문의 핵심 내용과 감정을 모두 보존할 것
- 문장을 자연스럽게 이어주고 맞춤법을 교정할 것
- 너무 화려하거나 과장하지 말고 일기다운 진솔한 문체 유지
- 1인칭(나, 나는, 내가 등) 사용
- 이모지나 특수문자 사용 금지
- 분량은 원문의 1.5~2배 정도로 자연스럽게 확장
- 결과물만 출력, 설명 문구 없이`;

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'HTTP-Referer': process.env.SITE_URL || 'https://ai-diary.vercel.app',
        'X-Title': 'AI 일기장'
      },
      body: JSON.stringify({
        model: 'meta-llama/llama-4-maverick:free',
        stream: false,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: text }
        ]
      })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error?.message || 'AI 오류');

    const result = data.choices?.[0]?.message?.content || '';
    return res.status(200).json({ result });

  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
