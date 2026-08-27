
const menuButton = document.querySelector('.menu-toggle');
const nav = document.querySelector('.main-nav');
menuButton.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  menuButton.setAttribute('aria-expanded', open);
});
nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => nav.classList.remove('open')));

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: .12 });
document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const el = entry.target;
    const target = Number(el.dataset.count);
    const start = performance.now();
    const duration = 1100;
    function frame(now) {
      const progress = Math.min((now - start) / duration, 1);
      el.textContent = Math.floor(target * (1 - Math.pow(1 - progress, 3)));
      if (progress < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
    counterObserver.unobserve(el);
  });
}, { threshold: .8 });
document.querySelectorAll('[data-count]').forEach(el => counterObserver.observe(el));

document.addEventListener('pointermove', e => {
  const glow = document.querySelector('.cursor-glow');
  glow.style.left = e.clientX + 'px';
  glow.style.top = e.clientY + 'px';
});

document.querySelectorAll('.course-card').forEach(card => {
  card.addEventListener('pointermove', e => {
    if (window.innerWidth < 900) return;
    const r = card.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - .5;
    const y = (e.clientY - r.top) / r.height - .5;
    card.style.transform = `perspective(900px) rotateY(${x * 5}deg) rotateX(${-y * 5}deg) translateY(-4px)`;
  });
  card.addEventListener('pointerleave', () => card.style.transform = '');
});

const modalData = {
  'modal-n3': ['N3 文法系統班','以相似文法比較為主軸，降低「每條都背過、放在一起卻不會選」的問題。',['易混句型比較','情境例句與口說練習','每週作業與個別回饋']],
  'modal-translation': ['N2 翻譯訓練','訓練從日文結構辨識、語意重組到自然中文表達的完整流程。',['長句拆解','語氣與主語判斷','直譯問題修正']],
  'modal-beginner': ['初級日文課程','適合零基礎或想重新打底的學習者，建立穩定且可持續的基礎。',['五十音與發音','基礎助詞與句型','生活會話練習']],
  'modal-talk': ['日文會話課程','以主題情境與即時修正，提升實際開口的速度與自然度。',['情境角色扮演','常用表達替換','發音與語氣調整']]
};
const dialog = document.querySelector('#courseModal');
document.querySelectorAll('.course-card').forEach(card => {
  card.addEventListener('click', () => {
    const [title, copy, list] = modalData[card.dataset.modal];
    dialog.querySelector('.modal-title').textContent = title;
    dialog.querySelector('.modal-copy').textContent = copy;
    dialog.querySelector('.modal-list').innerHTML = list.map(item => `<li>${item}</li>`).join('');
    dialog.showModal();
  });
});
dialog.querySelector('.modal-close').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', e => {
  const r = dialog.getBoundingClientRect();
  if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) dialog.close();
});
dialog.querySelector('.modal-action').addEventListener('click', () => dialog.close());

document.querySelectorAll('.work-tabs button').forEach(button => {
  button.addEventListener('click', () => {
    document.querySelector('.work-tabs button.active').classList.remove('active');
    button.classList.add('active');
    const filter = button.dataset.filter;
    document.querySelectorAll('.work-card').forEach(card => {
      card.classList.toggle('hidden', filter !== 'all' && card.dataset.category !== filter);
    });
  });
});

const escapeHtml = value => String(value).replace(/[&<>'"]/g, char => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
})[char]);

async function loadPreviewData() {
  try {
    const [lessonResponse, videoResponse] = await Promise.all([
      fetch('data/lessons.json'),
      fetch('data/daidai-videos.json')
    ]);
    if (!lessonResponse.ok || !videoResponse.ok) throw new Error('資料載入失敗');
    const lessons = await lessonResponse.json();
    const videos = await videoResponse.json();

    const latest = lessons.filter(item => item.featured).slice(0, 3);
    document.querySelector('#latestLessons').innerHTML = latest.map(item => `
      <article class="lesson-card reveal" data-level="${escapeHtml(item.level)}">
        <span class="lesson-meta">${escapeHtml(item.date)} · ${escapeHtml(item.category)} · ${escapeHtml(item.level)}</span>
        <h3>${escapeHtml(item.title)}</h3>
        <p>${escapeHtml(item.summary)}</p>
        <a class="lesson-link" href="${escapeHtml(item.source)}" target="_blank" rel="noopener noreferrer">閱讀教學原文 ↗</a>
      </article>
    `).join('');

    document.querySelector('#lessonArchive').innerHTML = lessons.map(item => `
      <article class="archive-item">
        <time datetime="${escapeHtml(item.dateIso)}">${escapeHtml(item.date)}</time>
        <span>${escapeHtml(item.category)} · ${escapeHtml(item.level)}</span>
        <strong>${escapeHtml(item.title)}</strong>
        <a href="${escapeHtml(item.source)}" target="_blank" rel="noopener noreferrer">查看 ↗</a>
      </article>
    `).join('');

    document.querySelector('#videoGrid').innerHTML = videos.map(item => `
      <article class="video-card reveal">
        <div class="video-frame">
          <iframe src="https://www.youtube-nocookie.com/embed/${escapeHtml(item.youtubeId)}" title="${escapeHtml(item.title)}" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
        </div>
        <div class="video-copy">
          <span class="video-meta">${escapeHtml(item.date)} · ${escapeHtml(item.type)}</span>
          <h3>${escapeHtml(item.title)}</h3>
          <p>${escapeHtml(item.description)}</p>
        </div>
      </article>
    `).join('');

    document.querySelectorAll('.reveal:not(.visible)').forEach(el => revealObserver.observe(el));
  } catch (error) {
    document.querySelector('#latestLessons').innerHTML = '<p class="data-fallback">教學資料暫時無法載入，請稍後重新整理。</p>';
    document.querySelector('#videoGrid').innerHTML = '<p class="data-fallback">影片資料暫時無法載入，請稍後重新整理。</p>';
  }
}

const archiveToggle = document.querySelector('#archiveToggle');
archiveToggle.addEventListener('click', () => {
  const archive = document.querySelector('#lessonArchive');
  const open = archive.classList.toggle('open');
  archiveToggle.setAttribute('aria-expanded', String(open));
  archiveToggle.textContent = open ? '收合教學歸檔' : '展開全部 10 篇';
});

loadPreviewData();
