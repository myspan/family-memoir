const express = require('express');
const path = require('path');
const fs = require('fs');
const { generateUnderstanding } = require('./services/understanding-service');
const { generateDraft } = require('./services/writing-service');
const { isMockMode } = require('./lib/llm');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from public directory if needed
app.use('/static', express.static(path.join(__dirname, 'public')));
app.use('/prototype', express.static(path.join(__dirname, 'prototype')));

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'prototype', 'index.html'));
});

app.get('/result', (req, res) => {
  res.sendFile(path.join(__dirname, 'prototype', 'result.html'));
});

// Mock upload endpoint
app.post('/api/upload', (req, res) => {
  // Placeholder for future upload processing
  res.json({
    success: true,
    message: 'Upload received (mock)',
    processingId: 'mock-' + Date.now()
  });
});

// Mock result endpoint - returns example JSON
app.get('/api/result/:id', (req, res) => {
  const examplePath = path.join(__dirname, 'examples', 'output-example.json');
  fs.readFile(examplePath, 'utf8', (err, data) => {
    if (err) {
      res.status(500).json({ error: 'Failed to read example data' });
      return;
    }
    res.json(JSON.parse(data));
  });
});

app.post('/api/generate-from-transcript', async (req, res) => {
  try {
    const { person_name, theme, notes, transcript } = req.body || {};

    if (!transcript || typeof transcript !== 'string' || !transcript.trim()) {
      return res.status(400).json({ error: 'transcript is required' });
    }

    const understanding = await generateUnderstanding({
      personName: person_name,
      theme,
      notes,
      transcript
    });

    const writing = await generateDraft({
      personName: person_name,
      theme,
      transcript,
      understanding
    });

    return res.json({
      mode: isMockMode() ? 'mock' : 'live',
      input: {
        person_name: person_name || null,
        theme: theme || null,
        notes: notes || null
      },
      result: {
        ...understanding,
        ...writing
      }
    });
  } catch (error) {
    console.error('generate-from-transcript failed:', error);
    return res.status(500).json({
      error: 'Generation failed',
      detail: error.message
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Family Memoir app running on http://localhost:${PORT}`);
  console.log('');
  console.log('Available routes:');
  console.log(`  - http://localhost:${PORT}/          (upload page)`);
  console.log(`  - http://localhost:${PORT}/result    (result page example)`);
  console.log(`  - http://localhost:${PORT}/api/result/mock  (example JSON)`);
  console.log(`  - POST http://localhost:${PORT}/api/generate-from-transcript  (LLM pipeline)`);
  console.log(`  - Mode: ${isMockMode() ? 'mock' : 'live'}`);
});
