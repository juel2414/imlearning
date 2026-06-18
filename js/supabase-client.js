// ───── Supabase 연동 설정 ─────
// 이 파일은 모든 페이지에서 Supabase 데이터를 가져오는 공통 함수예요.

const SUPABASE_URL = 'https://lvglkxjzraznwnfilxvy.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx2Z2xreGp6cmF6bnduZmlseHZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE3MTMyOTgsImV4cCI6MjA5NzI4OTI5OH0.FGsNDbX_XQuVyJfJbFH2wuDLH21EhV7MSJvi6_Lu_tk';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ───── 강좌 목록 가져오기 ─────
async function fetchCourses(filter = {}) {
  let query = supabase.from('courses').select('*').order('created_at', { ascending: false });

  if (filter.category) query = query.eq('category', filter.category);
  if (filter.featured) query = query.eq('featured', true);
  if (filter.status !== false) query = query.eq('status', 'active'); // 기본적으로 판매중만

  const { data, error } = await query;
  if (error) {
    console.error('강좌 불러오기 실패:', error);
    return [];
  }
  return data;
}

// ───── 강좌 1개 가져오기 ─────
async function fetchCourseById(id) {
  const { data, error } = await supabase.from('courses').select('*').eq('id', id).single();
  if (error) {
    console.error('강좌 불러오기 실패:', error);
    return null;
  }
  return data;
}

// ───── 강사 목록 가져오기 ─────
async function fetchInstructors() {
  const { data, error } = await supabase.from('instructors').select('*').order('created_at', { ascending: true });
  if (error) {
    console.error('강사 불러오기 실패:', error);
    return [];
  }
  return data;
}

// ───── 공지사항 목록 가져오기 ─────
async function fetchNotices(limit = null) {
  let query = supabase.from('notices').select('*').order('notice_date', { ascending: false });
  if (limit) query = query.limit(limit);

  const { data, error } = await query;
  if (error) {
    console.error('공지사항 불러오기 실패:', error);
    return [];
  }
  return data;
}

// ───── 현재 가격 계산 (할인 기간 자동 체크) ─────
function getCurrentPrice(course) {
  const now = new Date();
  const hasDiscount = course.discount_price &&
    course.discount_start && course.discount_end &&
    now >= new Date(course.discount_start) &&
    now <= new Date(course.discount_end);

  return {
    isDiscounted: hasDiscount,
    currentPrice: hasDiscount ? course.discount_price : course.price,
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

// ───── 강좌 카드 HTML 생성 ─────
function renderCourseCard(course) {
  const { isDiscounted, currentPrice, originalPrice } = getCurrentPrice(course);
  const thumb = course.thumbnail_url
    ? `<img src="${course.thumbnail_url}" style="width:100%;height:100%;object-fit:cover;">`
    : '📚';

  return `
    <a href="course-detail.html?id=${course.id}" class="course-card" data-cat="${course.category || ''}">
      <div class="course-thumb" style="background:linear-gradient(135deg,#e8f5ee,#c8eada);overflow:hidden;">
        ${thumb}
        ${isDiscounted ? '<span class="course-badge">🎯 할인중</span>' : ''}
      </div>
      <div class="course-body">
        <div class="course-cat">${CATEGORY_LABELS[course.category] || ''}</div>
        <div class="course-title">${course.title}</div>
        <div class="course-instructor">강사: ${course.instructor || '미정'}</div>
        <div class="course-footer">
          <span class="course-students">👥 ${course.students || 0}명</span>
          <span class="course-price">
            ${isDiscounted ? `<span class="course-price-original">₩${Number(originalPrice).toLocaleString()}</span>` : ''}
            ₩${Number(currentPrice || 0).toLocaleString()}
          </span>
        </div>
      </div>
    </a>
  `;
}
