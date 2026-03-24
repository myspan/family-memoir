async function generateFromTranscript(payload) {
  const res = await fetch('/api/generate-from-transcript', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Generation failed');
  }
  return data;
}

async function uploadAudio({ person_name, theme, notes, file }) {
  const form = new FormData();
  form.append('file', file);
  form.append('person_name', person_name || '');
  form.append('theme', theme || '');
  form.append('notes', notes || '');

  const res = await fetch('/api/upload', {
    method: 'POST',
    body: form
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Upload failed');
  }
  return data;
}

function saveLatestResult(data) {
  localStorage.setItem('familyMemoirLatestResult', JSON.stringify(data));
}

function loadLatestResult() {
  const raw = localStorage.getItem('familyMemoirLatestResult');
  return raw ? JSON.parse(raw) : null;
}

window.FamilyMemoirApp = {
  generateFromTranscript,
  uploadAudio,
  saveLatestResult,
  loadLatestResult
};
