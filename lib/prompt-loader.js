const fs = require('fs');
const path = require('path');

function loadPrompt(name) {
  return fs.readFileSync(path.join(__dirname, '..', 'prompts', name), 'utf8');
}

module.exports = { loadPrompt };
