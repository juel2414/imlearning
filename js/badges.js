// ─────────────────────────────────────────────────────────────────────────────
// js/badges.js  —  뱃지 시스템 유틸리티
// 다른 페이지에서도 사용 가능:  window.checkAndAwardBadges(supabaseClient, userId, options)
// ─────────────────────────────────────────────────────────────────────────────

const BADGE_DEFINITIONS = [
  { type: 'first_step',     icon: 'icons/badge-first-step.svg',    name: '첫 걸음',    desc: '첫 번째 강의를 완료했어요!' },
  { type: 'streak_3',       icon: 'icons/badge-streak-3.svg',      name: '3일 연속',   desc: '3일 연속 학습을 완료했어요!' },
  { type: 'streak_7',       icon: 'icons/badge-streak-7.svg',      name: '7일 연속',   desc: '7일 연속 학습을 완료했어요!' },
  { type: 'streak_30',      icon: 'icons/badge-streak-30.svg',     name: '30일 연속',  desc: '30일 연속 학습을 완료했어요!' },
  { type: 'lessons_10',     icon: 'icons/badge-lessons-10.svg',    name: '10강 달성',  desc: '10개 강의를 수강 완료했어요!' },
  { type: 'goal_achieved',  icon: 'icons/badge-goal-achieved.svg', name: '목표 달성',  desc: '오늘 학습 목표를 달성했어요!' },
  { type: 'graduate',       icon: 'icons/badge-graduate.svg',      name: '수료',       desc: '첫 강좌를 100% 완료했어요!' },
  { type: 'multi_graduate', icon: 'icons/badge-multi-graduate.svg',name: '멀티 수료',  desc: '2개 이상의 강좌를 수료했어요!' },
  { type: 'passion',        icon: 'icons/badge-passion.svg',       name: '열정왕',     desc: '30개 이상의 강의를 수강했어요!' },
  { type: 'above_avg',      icon: 'icons/badge-above-avg.svg',     name: '평균 초과',  desc: '전체 학습자 평균을 초과했어요!' },
  { type: 'top_10',         icon: 'icons/badge-top-10.svg',        name: '상위 10%',   desc: '상위 10% 학습자예요!' },
];

/**
 * 연속 학습 스트릭(일수)을 계산합니다.
 * @param {Array} studyLogs  studied_at 컬럼을 포함한 배열
 * @returns {number} 연속 학습 일수
 */
function calcLearningStreak(studyLogs) {
  if (!studyLogs || studyLogs.length === 0) return 0;

  const dateSet = new Set(
    studyLogs.map(l => new Date(l.studied_at).toISOString().split('T')[0])
  );

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let streak = 0;
  const check = new Date(today);

  while (true) {
    const checkStr = check.toISOString().split('T')[0];
    if (dateSet.has(checkStr)) {
      streak++;
      check.setDate(check.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}

/**
 * 뱃지 조건을 확인하고 미획득 뱃지를 DB에 저장합니다.
 *
 * @param {object} supabaseClient   - window.supabaseClient
 * @param {string} userId           - 사용자 UUID
 * @param {object} options
 *   @param {Array}  options.studyLogs        - study_logs 배열 (studied_at 포함)
 *   @param {number} options.completedCount   - 완료 강의 수
 *   @param {number} options.streak           - 연속 학습 일수
 *   @param {number} options.completedCourses - 수료 완료 강좌 수
 *   @param {number} options.todayCount       - 오늘 수강한 강의 수
 *   @param {number} options.dailyGoal        - 오늘 목표 강의 수 (0이면 체크 건너뜀)
 *   @param {number} options.weeklyCount      - 이번 주 수강 강의 수
 *   @param {number} options.avgWeeklyLessons - 전체 평균 주간 수강 강의 수
 * @returns {Array} 새로 획득한 뱃지 배열 (각 항목에 icon, name, desc 포함)
 */
async function checkAndAwardBadges(supabaseClient, userId, options = {}) {
  if (!supabaseClient || !userId) return [];

  // 기존 뱃지 로드
  const { data: existingBadges } = await supabaseClient
    .from('badges')
    .select('badge_type')
    .eq('user_id', userId);

  const earnedTypes = new Set((existingBadges || []).map(b => b.badge_type));
  const newBadges = [];

  const {
    studyLogs        = [],
    completedCount   = 0,
    streak           = 0,
    completedCourses = 0,
    todayCount       = 0,
    dailyGoal        = 0,
    weeklyCount      = 0,
    avgWeeklyLessons = 0,
  } = options;

  const conditions = {
    first_step:     completedCount >= 1 || studyLogs.length >= 1,
    streak_3:       streak >= 3,
    streak_7:       streak >= 7,
    streak_30:      streak >= 30,
    lessons_10:     completedCount >= 10,
    goal_achieved:  dailyGoal > 0 && todayCount >= dailyGoal,
    graduate:       completedCourses >= 1,
    multi_graduate: completedCourses >= 2,
    passion:        studyLogs.length >= 30 || completedCount >= 30,
    above_avg:      avgWeeklyLessons > 0 && weeklyCount > avgWeeklyLessons,
    top_10:         avgWeeklyLessons > 0 && weeklyCount >= avgWeeklyLessons * 1.5,
  };

  const now = new Date().toISOString();

  for (const [type, condition] of Object.entries(conditions)) {
    if (!earnedTypes.has(type) && condition) {
      const { data, error } = await supabaseClient
        .from('badges')
        .upsert(
          { user_id: userId, badge_type: type, earned_at: now },
          { onConflict: 'user_id,badge_type' }
        )
        .select()
        .single();

      if (!error && data) {
        const def = BADGE_DEFINITIONS.find(d => d.type === type);
        newBadges.push({ ...data, ...def });
        earnedTypes.add(type);
      }
    }
  }

  return newBadges;
}

// 전역 노출 (다른 페이지에서 window.checkAndAwardBadges(...) 로 호출)
window.BADGE_DEFINITIONS    = BADGE_DEFINITIONS;
window.checkAndAwardBadges  = checkAndAwardBadges;
window.calcLearningStreak   = calcLearningStreak;
