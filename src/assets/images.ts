/**
 * Centralized Image Assets Configuration
 * Uses Vite's official asset URL resolver so images are bundled properly in production (Vercel).
 */

export const ASSETS = {
  HERO: {
    BACKGROUND: new URL('./images/modern1.png', import.meta.url).href,
    MOBILE_BACKGROUND: new URL('./images/hero mob.png', import.meta.url).href,
    BADGE: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&q=80',
    ACTION_CARD_1: new URL('./images/skill_development_1783920238862.jpg', import.meta.url).href,
    ACTION_CARD_2: new URL('./images/team_training_huddle_1783920253600.jpg', import.meta.url).href,
    ACTION_CARD_3: new URL('./images/personal_coaching_1783920294194.jpg', import.meta.url).href,
    ACTION_CARD_4: new URL('./images/volleyball_hero_1783920221366.jpg', import.meta.url).href,
    TEXTURE_BG: new URL('./images/volleyball_texture_bg_1784054546480.jpg', import.meta.url).href,
  },
  EXPERTISE: {
    FOUNDATIONAL: new URL('./images/skill_development_1783920238862.jpg', import.meta.url).href,
    TACTICAL: new URL('./images/team_training_huddle_1783920253600.jpg', import.meta.url).href,
    ELITE: new URL('./images/personal_coaching_1783920294194.jpg', import.meta.url).href,
  },
  MOODBOARD: [
    'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1592656631147-f1aa2112bf7c?auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1593787467001-7394837e5814?auto=format&fit=crop&q=80',
  ],
  JOURNEY: {
    STEP_1: new URL('./images/journey_phase_1_foundations_1784052995126.jpg', import.meta.url).href,
    STEP_2: new URL('./images/journey_phase_2_specialization_1784053013443.jpg', import.meta.url).href,
    STEP_3: new URL('./images/journey_phase_3_performance_1784053031683.jpg', import.meta.url).href,
    STEP_4: new URL('./images/journey_phase_4_mastery_1784053049057.jpg', import.meta.url).href,
    STYLIZED_BG: new URL('./images/stylized_volleyball_background_1784054225034.jpg', import.meta.url).href,
  },
  ABOUT: {
    ARTISTIC_BG: new URL('./images/about_artistic_bg.png', import.meta.url).href,
    COACH_PORTRAIT: new URL('./images/coach_wilson_portrait_1783920268527.jpg', import.meta.url).href,
    COACH_SARAH: new URL('./images/coach_sarah_jenkins_headshot_1784039862809.jpg', import.meta.url).href,
    COACH_MICHAEL: new URL('./images/coach_michael_chen_headshot_1784039879618.jpg', import.meta.url).href,
    COACH_WILSON_ABOUT: new URL('./images/wilson about.jpg', import.meta.url).href,
  },
  PERFORMANCE: {
    ANALYTICS_HERO: new URL('./images/performance_analytics_visual_1785509230519.jpg', import.meta.url).href,
    DASHBOARD_BG: new URL('./images/performance_analytics_visual_1785509230519.jpg', import.meta.url).href,
  },
  LOGOS: {
    FIVB: new URL('./logo/fivb.jpg', import.meta.url).href,
    USAV: new URL('./logo/usav.png', import.meta.url).href,
    AAU: new URL('./logo/aau.png', import.meta.url).href,
    NFHS: new URL('./logo/nfhs.png', import.meta.url).href,
  },
  CAMPS: {
    DAY_7: new URL('./images/camp_7day_intensive.jpg', import.meta.url).href,
    DAY_10: new URL('./images/camp_10day_elite.jpg', import.meta.url).href,
    DAY_15: new URL('./images/camp_15day_master.jpg', import.meta.url).href,
    PRIVATE: new URL('./images/camp_private_coaching.jpg', import.meta.url).href,
    JUNIOR: new URL('./images/camp_junior_spikers.jpg', import.meta.url).href,
    HERO: new URL('./images/camp_overview_hero.jpg', import.meta.url).href,
  },
};
