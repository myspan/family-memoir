# Backend Pipeline Draft v0.1

## Goal

Process an uploaded iPhone Voice Memo asynchronously and return a usable memory fragment result.

## High-level flow

```text
[Upload]
  -> [Recording stored]
  -> [Transcription job]
  -> [Transcript saved]
  -> [Understanding job]
  -> [Structured understanding JSON saved]
  -> [Writing job]
  -> [Memory draft saved]
  -> [Result page]
```

## Core objects

### Recording
- id
- person_name
- theme (optional)
- original_filename
- mime_type
- storage_path
- duration_seconds
- notes
- status
- created_at

Statuses:
- uploaded
- transcribing
- transcribed
- understanding
- writing
- completed
- failed

### Transcript
- recording_id
- raw_text
- language
- segments_json
- transcription_engine
- confidence_note

### MemoryDraft
- recording_id
- title
- piece_type
- focus_json
- narrative_draft
- quotes_json
- entities_json
- emotions_json
- needs_clarification_json
- follow_up_questions_json
- source_quality_json
- model_name
- version

## Recommended services

### UploadService
- validate file type
- persist original upload
- create recording row

### TranscriptionService
- normalize audio if needed
- call speech-to-text
- save transcript

### UnderstandingService
- extract focus / quotes / entities / gaps / follow-ups
- validate JSON shape
- save intermediate understanding output

### WritingService
- generate title and readable draft
- stay grounded in transcript + understanding output

### DraftAssembler
- merge final result
- persist MemoryDraft
- mark recording complete

## Why split understanding and writing

One-shot generation is fragile.

A two-layer pipeline is easier to debug:
- if entities are wrong, fix understanding
- if prose is bland, fix writing

## API sketch

### POST /api/recordings
Multipart form:
- file
- person_name
- theme (optional)
- notes (optional)

Returns:
```json
{ "id": "rec_123", "status": "uploaded" }
```

### GET /api/recordings/:id
Returns current status.

### GET /api/recordings/:id/result
Returns final structured result when complete.

## Operational notes

- Save original transcript for regeneration
- Save intermediate understanding JSON for prompt iteration
- Expose coarse-grained status to avoid black-box waiting
- Keep v0.1 async; do not block request/response on full processing
