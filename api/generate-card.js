import Anthropic from '@anthropic-ai/sdk';

export default async function handler(req, res) {
  // CORS headers for local development
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { word } = req.body;

  if (!word || word.trim().length === 0) {
    return res.status(400).json({ error: '단어를 입력해주세요.' });
  }

  // Check for API key
  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(500).json({
      error: 'API key not configured. Please set ANTHROPIC_API_KEY environment variable.'
    });
  }

  try {
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY
    });

    const prompt = `다음 영어 단어 또는 한글 단어에 대한 영어 학습 카드 정보를 JSON 형식으로 생성해주세요.

입력: ${word}

응답 형식 (JSON만 반환, 다른 설명은 제외):
{
  "word": "영어 단어",
  "pronunciation": "한글 발음 (예: 컨스피러시 씨어리)",
  "ipa": "IPA 발음 기호 (예: /kənˈspɪrəsi ˈθɪri/)",
  "meaning": "주요 의미 (한글로 상세하게)",
  "examples": [
    "영어 예문1\\n→ 한글 해석1",
    "영어 예문2\\n→ 한글 해석2",
    "영어 예문3\\n→ 한글 해석3"
  ],
  "related": "유의어: ..., 반의어: ..., 파생어: ...",
  "tips": "어원: ...\\n\\n기억법: ...\\n\\n사용 팁:\\n- ...\\n- ..."
}

규칙:
1. 입력이 한글이면, 해당하는 가장 적절한 영어 단어를 찾아서 제공
2. 실생활에서 자주 쓰이는 자연스러운 예문 4개
3. 예문은 초급-중급 수준, 실용적인 문장
4. 어원 설명과 재미있는 기억법 포함
5. 사용 팁은 실전에서 어떻게 쓰는지 구체적으로
6. JSON 형식만 반환 (마크다운 코드 블록 없이)`;

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 2000,
      temperature: 0.7,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    // Extract JSON from response
    let responseText = message.content[0].text.trim();

    // Remove markdown code blocks if present
    responseText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '');

    // Parse the JSON
    const cardData = JSON.parse(responseText);

    // Validate required fields
    if (!cardData.word || !cardData.meaning) {
      return res.status(500).json({
        error: 'AI가 올바른 형식의 카드를 생성하지 못했습니다. 다시 시도해주세요.'
      });
    }

    // Format examples if needed
    if (Array.isArray(cardData.examples)) {
      cardData.example = cardData.examples.join('\n\n');
    }

    res.status(200).json(cardData);

  } catch (error) {
    console.error('Error generating card:', error);

    if (error.status === 401) {
      return res.status(500).json({
        error: 'API 인증 실패. API 키를 확인해주세요.'
      });
    }

    if (error.status === 429) {
      return res.status(429).json({
        error: 'API 사용량 한도 초과. 잠시 후 다시 시도해주세요.'
      });
    }

    res.status(500).json({
      error: 'AI 카드 생성 중 오류가 발생했습니다: ' + error.message
    });
  }
}
