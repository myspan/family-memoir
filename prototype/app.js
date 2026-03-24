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

function saveLatestResult(data) {
  localStorage.setItem('familyMemoirLatestResult', JSON.stringify(data));
}

function loadLatestResult() {
  const raw = localStorage.getItem('familyMemoirLatestResult');
  return raw ? JSON.parse(raw) : null;
}

window.FamilyMemoirApp = {
  generateFromTranscript,
  saveLatestResult,
  loadLatestResult
};
