const { callJsonModel, isMockMode, getExampleOutput } = require('../lib/llm');
const { loadPrompt } = require('../lib/prompt-loader');

async function generateUnderstanding({ personName, theme, notes, transcript }) {
  if (isMockMode()) {
    const example = getExampleOutput();
    return {
      summary_focus: example.summary_focus,
      quotes: example.quotes,
      entities: example.entities,
      emotional_signals: example.emotional_signals,
      needs_clarification: example.needs_clarification,
      follow_up_questions: example.follow_up_questions,
      source_quality: example.source_quality
    };
  }

  const system = loadPrompt('understanding.md');
  const user = JSON.stringify(
    {
      person_name: personName || null,
      theme: theme || null,
      notes: notes || null,
      transcript
    },
    null,
    2
  );

  return callJsonModel({
    system,
    user,
    temperature: 0.2,
    model: process.env.OPENAI_UNDERSTANDING_MODEL || process.env.OPENAI_MODEL || 'gpt-4.1'
  });
}

module.exports = { generateUnderstanding };
