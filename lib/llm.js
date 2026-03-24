const fs = require('fs');
const path = require('path');

let OpenAI;
try {
  OpenAI = require('openai');
} catch (_) {
  OpenAI = null;
}

function isMockMode() {
  return !process.env.OPENAI_API_KEY || process.env.MEMOIR_USE_MOCK === '1';
}

function getExampleOutput() {
  const raw = fs.readFileSync(path.join(__dirname, '..', 'examples', 'output-example.json'), 'utf8');
  return JSON.parse(raw);
}

function getClient() {
  if (!OpenAI) {
    throw new Error('openai package is not installed');
  }
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is not set');
  }
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

async function callJsonModel({ system, user, model, temperature = 0.3 }) {
  if (isMockMode()) {
    return getExampleOutput();
  }

  const client = getClient();
  const response = await client.chat.completions.create({
    model: model || process.env.OPENAI_MODEL || 'gpt-4.1',
    temperature,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: user }
    ]
  });

  const content = response.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error('Model returned empty content');
  }

  return JSON.parse(content);
}

module.exports = {
  callJsonModel,
  isMockMode,
  getExampleOutput
};
