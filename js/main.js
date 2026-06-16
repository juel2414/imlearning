// ───── 스크롤 애니메이션 ─────
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// ───── 카운트다운 타이머 ─────
function updateCountdown(targetDate, elemId) {
  const el = document.getElementById(elemId);
  if (!el) return;

  function tick() {
    const now = new Date().getTime();
    const target = new Date(targetDate).getTime();
    const diff = target - now;

    if (diff <= 0) {
      el.innerHTML = '<span style="color:rgba(255,255,255,0.4);font-size:13px;">종료된 프로모션입니다</span>';
      return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const secs = Math.floor((diff % (1000 * 60)) / 1000);

    el.innerHTML = `
      <div class="countdown-block"><div class="countdown-num">${String(days).padStart(2,'0')}</div><div class="countdown-unit">일</div></div>
      <span class="countdown-sep">:</span>
      <div class="countdown-block"><div class="countdown-num">${String(hours).padStart(2,'0')}</div><div class="countdown-unit">시간</div></div>
      <span class="countdown-sep">:</span>
      <div class="countdown-block"><div class="countdown-num">${String(mins).padStart(2,'0')}</div><div class="countdown-unit">분</div></div>
      <span class="countdown-sep">:</span>
      <div class="countdown-block"><div class="countdown-num">${String(secs).padStart(2,'0')}</div><div class="countdown-unit">초</div></div>
    `;
  }

  tick();
  setInterval(tick, 1000);
}

// ───── 카테고리 탭 필터 ─────
function initCatTabs() {
  const tabs = document.querySelectorAll('.cat-tab');
  const cards = document.querySelectorAll('.course-card[data-cat]');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const cat = tab.dataset.cat;
      cards.forEach(card => {
        if (cat === 'all' || card.dataset.cat === cat) {
          card.style.display = '';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
}

// ───── 네비게이션 활성화 ─────
function initNavActive() {
  const path = window.location.pathname.split('/').pop();
  document.querySelectorAll('.navbar-menu a').forEach(a => {
    const href = a.getAttribute('href');
    if (href === path || (path === '' && href === 'index.html')) {
      a.classList.add('active');
    }
  });
}

// ───── 초기화 ─────
document.addEventListener('DOMContentLoaded', () => {
  initNavActive();
  initCatTabs();

  // 프로모션 카운트다운 (임시 날짜 — admin에서 수정 예정)
  const promoEnd = document.getElementById('promo-end-date');
  if (promoEnd) {
    updateCountdown(promoEnd.dataset.date, 'countdown-timer');
  }
});
