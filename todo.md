# TODO

## Product / UX
- Add upload-page copy for family testing
- Define result page layout for title / draft / quotes / follow-ups
- Decide whether v0.1 uses "memory fragment" or "chapter draft" in UI

## AI / prompts
- Create understanding-layer prompt template
- Create writing-layer prompt template
- Add transcript chunking rules for long recordings
- Define quote selection heuristics

## Backend
- Pick storage approach for uploaded audio
- Pick STT engine for Chinese-first `.m4a` uploads
- Add job orchestration
- Add schema validation for model output
- Add retry / failure handling for transcription and model steps

## Data
- Define DB schema for Recording / Transcript / MemoryDraft
- Store transcript and understanding JSON for regeneration
- Decide versioning strategy for prompt / output schema changes

## Future
- Add second-round upload flow for answering follow-up prompts
- Add family-friendly export (PDF / printable page)
- Add person timeline / people cards once enough recordings exist
