function text(el, value) {
  if (el) el.textContent = value || '';
}

function html(el, value) {
  if (el) el.innerHTML = value || '';
}

function renderList(el, items, renderItem) {
  if (!el) return;
  el.innerHTML = '';
  (items || []).forEach((item) => {
    const li = document.createElement('li');
    li.innerHTML = renderItem ? renderItem(item) : String(item);
    el.appendChild(li);
  });
}

function renderQuotes(el, quotes) {
  if (!el) return;
  el.innerHTML = '';
  (quotes || []).forEach((quote) => {
    const block = document.createElement('blockquote');
    block.textContent = quote;
    el.appendChild(block);
  });
}

function renderChips(el, result) {
  if (!el) return;
  el.innerHTML = '';
  const chips = [];
  (result.entities?.people || []).forEach((p) => chips.push(`人物：${p.name}`));
  (result.entities?.places || []).forEach((p) => chips.push(`地点：${p.name}`));
  (result.entities?.times || []).forEach((t) => chips.push(`时间：${t.label}`));
  (result.entities?.events || []).forEach((e) => chips.push(`事件：${e.name}${e.status === 'unexpanded' ? '（待展开）' : ''}`));

  chips.forEach((item) => {
    const chip = document.createElement('div');
    chip.className = 'chip';
    chip.textContent = item;
    el.appendChild(chip);
  });
}

function renderResult(payload) {
  const result = payload?.result;
  if (!result) return;

  text(document.getElementById('mode-pill'), payload.mode === 'live' ? '真实模型结果' : 'Mock 结果');
  text(document.getElementById('title'), result.title);
  text(document.getElementById('lead'), '这一版先不追求把一生讲全，而是尽量把这段口述里最值得留下的东西整理出来。');

  const draftHtml = (result.narrative_draft || '')
    .split('\n\n')
    .map((p) => `<p>${p}</p>`)
    .join('');
  html(document.getElementById('draft'), draftHtml);

  renderQuotes(document.getElementById('quotes'), result.quotes);

  const focus = result.summary_focus || {};
  renderList(document.getElementById('focus-list'), [
    `主要在讲：${focus.main_focus || '—'}`,
    `最突出的对象：${(focus.primary_people || []).join('、') || '—'}${focus.primary_places?.length ? '；' + focus.primary_places.join('、') : ''}`,
    `最明显的情绪：${(focus.primary_emotions || []).join('、') || '—'}`,
    `尚未展开：${(focus.unexpanded_threads || []).join('、') || '—'}`
  ]);

  renderChips(document.getElementById('chips'), result);
  renderList(document.getElementById('followups'), result.follow_up_questions);
}

document.addEventListener('DOMContentLoaded', () => {
  const payload = window.FamilyMemoirApp?.loadLatestResult();
  if (payload) {
    renderResult(payload);
  }
});
