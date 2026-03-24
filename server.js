const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { generateUnderstanding } = require('./services/understanding-service');
const { generateDraft } = require('./services/writing-service');
const { isMockMode } = require('./lib/llm');

const app = express();
const PORT = process.env.PORT || 3000;
const uploadsDir = path.join(__dirname, 'uploads');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    cb(null, `${Date.now()}-${safeName}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = [
      'audio/mp4',
      'audio/x-m4a',
      'audio/mpeg',
      'audio/wav',
      'audio/x-wav',
      'audio/webm',
      'video/quicktime',
      'application/octet-stream'
    ];

    const ext = path.extname(file.originalname).toLowerCase();
    const allowedExts = ['.m4a', '.mp3', '.wav', '.webm', '.mp4', '.mov'];

    if (allowed.includes(file.mimetype) || allowedExts.includes(ext)) {
      return cb(null, true);
    }

    return cb(new Error('Unsupported file type'));
  }
});

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

// Real upload endpoint (local save only for now)
app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'file is required' });
  }

  const { person_name, theme, notes } = req.body || {};

  return res.json({
    success: true,
    mode: 'local-upload',
    message: 'File uploaded and saved locally',
    upload: {
      id: `upload-${Date.now()}`,
      person_name: person_name || null,
      theme: theme || null,
      notes: notes || null,
      original_name: req.file.originalname,
      saved_name: req.file.filename,
      mime_type: req.file.mimetype,
      size_bytes: req.file.size,
      stored_at: req.file.path
    },
    next_step: 'transcription_not_connected_yet'
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

app.use((error, _req, res, _next) => {
  console.error('request failed:', error);
  return res.status(400).json({
    error: error.message || 'Request failed'
  });
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
