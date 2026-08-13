/* ============================================
   Dr.Judge — 판정 결과
   ============================================ */

(function () {
  const esc = (s) =>
    String(s).replace(
      /[&<>"']/g,
      (c) =>
        ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c],
    );

  const params = new URLSearchParams(location.search);
  const id = params.get('id');

  // 방금 요청한 판정을 저장소에서 찾아옵니다.
  // 없으면(직접 열어본 경우) 예시 데이터를 보여줍니다.
  const saved = id && Store.getResult ? Store.getResult(id) : null;
  const r = saved || RESULT_SAMPLE;
  const claim = saved ? saved.claim : params.get('q') || RESULT_SAMPLE.claim;
  const level =
    EVIDENCE_LEVELS.find((l) => l.key === r.level) || EVIDENCE_LEVELS[0];
  const sources = RESULT_SAMPLE.sources;

  /* ---------- 내용 채우기 ---------- */
  document.getElementById('claimText').textContent = `“${claim}”`;
  document.getElementById('levelName').textContent = level.name;
  document.getElementById('levelSources').textContent = sources.join(' · ');
  document.getElementById('sourceList').innerHTML = sources
    .map((s) => `<li>${esc(s)}</li>`)
    .join('');
  document.getElementById('criteriaPreview').innerHTML = BUY_CRITERIA[0].items
    .map(([t]) => `<li>${esc(t)}</li>`)
    .join('');

  if (!r.conflict) document.getElementById('conflictCard').hidden = true;

  // 등급에 맞춰 표시 (임상적 근거 있음 / 전문가 의견 있음 → 초록, 나머지는 회색)
  const strong = level.key === 'clinical' || level.key === 'expert';
  const mark = document.querySelector('.tagcard__mark');
  if (!strong) mark.style.background = 'var(--gray-400)';

  document.querySelector('.tagcard__desc').textContent = level.desc;

  /* ---------- 공유 피드에 게시 ---------- */
  document.getElementById('postBtn').addEventListener('click', () => {
    if (!Store.isLoggedIn()) {
      location.href = './login.html';
      return;
    }
    const d = new Date();
    Store.addCard({
      category: '건강 · 판정 결과',
      date: `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`,
      title: claim,
      result: level.name,
    });
    alert('공유 피드에 게시했어요. 마이페이지에서 확인할 수 있습니다.');
    location.href = './mypage.html';
  });

  /* ---------- 링크로 공유 ---------- */
  const confirmBox = document.getElementById('shareConfirm');
  const open = () => (confirmBox.hidden = false);
  const close = () => (confirmBox.hidden = true);

  document.getElementById('linkBtn').addEventListener('click', open);
  document.getElementById('shareCancel').addEventListener('click', close);
  confirmBox.addEventListener('click', (e) => {
    if (e.target === confirmBox) close();
  });

  document.getElementById('shareOk').addEventListener('click', async () => {
    close();
    const url = location.href;
    const text = `Dr.Judge 판정 결과 — ${claim}`;

    if (navigator.share) {
      try {
        await navigator.share({ title: 'Dr.Judge', text, url });
        return;
      } catch (e) {
        /* 사용자가 취소한 경우 */
      }
    }
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(url);
      alert('링크를 복사했어요.');
    }
  });
})();
