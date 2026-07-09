// ───── Supabase 연동 설정 ─────
const SUPABASE_URL = 'https://lvglkxjzraznwnfilxvy.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx2Z2xreGp6cmF6bnduZmlseHZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE3MTMyOTgsImV4cCI6MjA5NzI4OTI5OH0.FGsNDbX_XQuVyJfJbFH2wuDLH21EhV7MSJvi6_Lu_tk';

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ───── 강좌 목록 가져오기 ─────
async function fetchCourses(filter = {}) {
  let query = supabaseClient.from('courses').select('*').order('created_at', { ascending: false });
  if (filter.category) query = query.eq('category', filter.category);
  if (filter.featured) query = query.eq('featured', true);
  if (filter.status !== false) query = query.eq('status', 'active');
  const { data, error } = await query;
  if (error) { console.error('강좌 불러오기 실패:', error); return []; }
  return data || [];
}

// ───── 강좌 1개 가져오기 ─────
async function fetchCourseById(id) {
  // id는 숫자 또는 문자열 모두 허용
  const { data, error } = await supabaseClient
    .from('courses')
    .select('*')
    .eq('id', Number(id))
    .single();
  if (error) { console.error('강좌 불러오기 실패:', error); return null; }
  return data;
}

// ───── 강사 목록 가져오기 ─────
async function fetchInstructors() {
  const { data, error } = await supabaseClient.from('instructors').select('*').order('created_at', { ascending: true });
  if (error) { console.error('강사 불러오기 실패:', error); return []; }
  return data || [];
}

// ───── 공지사항 목록 가져오기 ─────
async function fetchNotices(limit = null) {
  let query = supabaseClient.from('notices').select('*').order('notice_date', { ascending: false });
  if (limit) query = query.limit(limit);
  const { data, error } = await query;
  if (error) { console.error('공지사항 불러오기 실패:', error); return []; }
  return data || [];
}

// ───── 현재 가격 계산 (할인 기간 자동 체크) ─────
// discount_start / discount_end 가 없어도 discount_price 만 있으면 할인 적용
function getCurrentPrice(course) {
  const now = new Date();
  let isDiscounted = false;

  if (course.discount_price) {
    // discount_start/end 둘 다 있으면 기간 체크
    if (course.discount_start && course.discount_end) {
      isDiscounted = now >= new Date(course.discount_start) && now <= new Date(course.discount_end);
    } else {
      // 날짜 없이 discount_price만 있으면 항상 할인 적용
      isDiscounted = true;
    }
  }

  return {
    isDiscounted,
    currentPrice: isDiscounted ? course.discount_price : course.price,
    originalPrice: course.price,
  };
}

// ───── 카테고리 한글 라벨 ─────
const CATEGORY_LABELS = {
  faith: '신앙',
  edu: '교사·부모',
  mission: '캠프·사역',
  english: '영어·시험',
  freepass: '전강좌 무제한',
};

// ───── 주문(수강 신청) 생성 ─────
// PortOne 결제 성공 후 orders 테이블에 기록
async function createOrder(order) {
  const { data, error } = await supabaseClient.from('orders').insert(order).select().single();
  if (error) { console.error('주문 저장 실패:', error); return { error }; }
  return { data };
}

// ───── 특정 강좌 결제(구매) 여부 확인 ─────
async function hasPurchased(userId, courseId) {
  const { data, error } = await supabaseClient
    .from('orders')
    .select('id')
    .eq('user_id', userId)
    .eq('course_id', courseId)
    .eq('status', 'paid')
    .limit(1);
  if (error) { console.error('구매 확인 실패:', error); return false; }
  return !!(data && data.length > 0);
}

// ───── 로그아웃 (네비 공용) ─────
async function navLogout() {
  await supabaseClient.auth.signOut();
  window.location.href = 'index.html';
}

// 네비 로그인 상태 반영은 js/nav.js의 onAuthStateChange 리스너가 처리

// ───── 강좌 카드 HTML 생성 (강좌 목록에서 사용) ─────
function renderCourseCard(course) {
  const { isDiscounted, currentPrice, originalPrice } = getCurrentPrice(course);
  const thumb = course.thumbnail_url
    ? `<img src="${course.thumbnail_url}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;">`
    : '<span style="font-size:32px;position:relative;z-index:1;">📚</span>';

  const badgeHtml = isDiscounted
    ? '<span class="course-badge">🎯 할인중</span>'
    : (course.featured ? '<span class="course-badge">🔥 인기</span>' : '');

  const priceHtml = isDiscounted
    ? `<span class="course-price"><span style="text-decoration:line-through;color:var(--gray-300);font-size:11px;margin-right:4px;">₩${Number(originalPrice).toLocaleString()}</span>₩${Number(currentPrice).toLocaleString()}</span>`
    : `<span class="course-price">₩${Number(currentPrice || 0).toLocaleString()}</span>`;

  return `
    <a href="course-detail.html?id=${course.id}" class="course-card" data-cat="${course.category || ''}">
      <div class="course-thumb" style="background:linear-gradient(135deg,#e8f5ee,#c8eada);position:relative;overflow:hidden;">
        ${thumb}
        ${badgeHtml}
      </div>
      <div class="course-body">
        <div class="course-cat">${CATEGORY_LABELS[course.category] || ''}</div>
        <div class="course-title">${course.title}</div>
        <div class="course-instructor">강사: ${course.instructor || '미정'}</div>
        <div class="course-footer">
          <span class="course-students">👥 ${course.students || 0}명</span>
          ${priceHtml}
        </div>
      </div>
    </a>
  `;
}
