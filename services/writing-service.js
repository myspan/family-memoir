const { callJsonModel, isMockMode, getExampleOutput } = require('../lib/llm');
const { loadPrompt } = require('../lib/prompt-loader');

async function generateDraft({ personName, theme, transcript, understanding }) {
  if (isMockMode()) {
    const example = getExampleOutput();
    return {
      title: example.title,
      piece_type: example.piece_type,
      narrative_draft: example.narrative_draft
    };
  }

  const system = loadPrompt('writing.md');
  const user = JSON.stringify(
    {
      person_name: personName || null,
      theme: theme || null,
      transcript,
      understanding_json: understanding
    },
    null,
    2
  );

  return callJsonModel({
    system,
    user,
    temperature: 0.6,
    model: process.env.OPENAI_WRITING_MODEL || process.env.OPENAI_MODEL || 'gpt-4.1'
  });
}

module.exports = { generateDraft };
