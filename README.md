# family-memoir

A first-pass product draft for a family memoir app that accepts iPhone Voice Memos, transcribes open-ended oral stories, and turns them into memory fragments / chapter drafts with gentle follow-up prompts.

## Product idea

Start with family-only testing.

Core flow:

1. Upload an iPhone Voice Memo (`.m4a` preferred)
2. Transcribe the recording
3. Extract people / places / events / emotions / gaps
4. Generate a memory fragment draft
5. Suggest 3-5 natural follow-up questions

The first version is intentionally simple:

- no realtime interview UI
- no heavy authoring interface
- no strict question tree
- no pricing / billing considerations yet

The product philosophy is:

> Let the elder talk however they want. The system listens first, then organizes.

## MVP scope

- Accept `m4a`, `mp3`, `wav`
- Async processing pipeline
- Save transcript and intermediate understanding output
- Produce structured JSON + readable draft
- Show result page with:
  - title
  - memory fragment draft
  - quotes
  - focus summary
  - follow-up questions

## Repo layout

- `docs/product.md` — product definition
- `docs/freeform-mode.md` — “free narration” interaction philosophy
- `docs/pipeline.md` — backend processing pipeline
- `schemas/memory-draft.schema.json` — structured model output shape
- `examples/` — example input/output payloads
- `todo.md` — next implementation steps

## First principles

1. Real > polished
2. Listening > controlling
3. Fragment > forced completeness
4. Preserve voice > summarize into blandness
5. Ask less, but ask better

## Status

Minimal runnable skeleton available. See below for how to run.

## How to run

1. Install dependencies:
   ```bash
   npm install
   ```

2. Copy env file:
   ```bash
   cp .env.example .env
   ```

3. Start the server:
   ```bash
   npm start
   ```

4. Open your browser to:
   - **Upload page**: http://localhost:3000/
   - **Result page example**: http://localhost:3000/result
   - **Mock API endpoint**: http://localhost:3000/api/result/mock

The app runs on port 3000 by default. Set `PORT` environment variable to change.

## What's implemented

- Simple Express server (`server.js`)
- Upload form UI (served from `/prototype/index.html`)
- Result page example (served from `/prototype/result.html`)
- Mock upload endpoint at `POST /api/upload` (placeholder)
- Mock result endpoint at `GET /api/result/:id` (returns example JSON)
- Transcript-to-LLM pipeline endpoint at `POST /api/generate-from-transcript`
- Two-step generation flow:
  - understanding layer (`prompts/understanding.md`)
  - writing layer (`prompts/writing.md`)
- Mock/live switch for model integration via `.env`

## LLM integration

By default, the project can run in **mock mode**.

If `MEMOIR_USE_MOCK=1` or `OPENAI_API_KEY` is missing, `/api/generate-from-transcript` returns a mock result based on the example files.

To enable real model calls:

1. Put your API key in `.env`
2. Set:
   ```bash
   MEMOIR_USE_MOCK=0
   ```
3. Restart the server

Example request:

```bash
curl -X POST http://localhost:3000/api/generate-from-transcript \
  -H 'Content-Type: application/json' \
  -d '{
    "person_name": "奶奶",
    "theme": "自由讲述",
    "notes": "这一段主要讲老家和母亲",
    "transcript": "我小时候啊，家里其实挺穷的，房子也不大，但是人多，所以总是热热闹闹的。"
  }'
```

## Next steps

See `todo.md` for implementation roadmap.
