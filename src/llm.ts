import { PatchResponseSchema } from './schemas.js';

const GROQ_API_URL = process.env.GROQ_API_URL || 'https://api.groq.ai/v1';
const GROQ_API_KEY = process.env.GROQ_API_KEY;

if (!GROQ_API_KEY) {
  throw new Error('Missing GROQ_API_KEY');
}

export async function requestPatch(prompt: string) {
  const response = await fetch(`${GROQ_API_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 1000,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(`Groq API error: ${response.status} ${response.statusText} ${JSON.stringify(data)}`);
  }

  const content = data?.choices?.[0]?.message?.content;
  if (typeof content !== 'string') {
    throw new Error('Unexpected Groq API response format');
  }

  const parsed = JSON.parse(content);
  return PatchResponseSchema.parse(parsed);
}
