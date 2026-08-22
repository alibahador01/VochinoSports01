// config.js
// نقطه‌ی مرکزی تنظیمات — همه‌ی لینک‌های ثابت اینجا تعریف می‌شوند تا موقع اتصال ربات فقط همین‌جا ویرایش شود.
window.VOCHINO_CONFIG = {
  API_BASE: '', // آدرس بک‌اند/ربات — مثلاً 'https://yourdomain.com/api'
  API_ENDPOINT_DASHBOARD: '/dashboard', // GET {API_BASE}{API_ENDPOINT_DASHBOARD}/{user_id}

  SOCIAL_LINKS: {
    telegram: 'https://t.me/Vochino01',
    instagram: '#',
    youtube: '#',
    store: '#'
  },

  SUPPORT_LINK: 'https://t.me/Vochino01',
  BOT_LINK: 'https://t.me/Vochino_bh01_bot',
  BOT_HANDLE: '@Vochino_bh01_bot',

  DOWNLOAD_LINKS: {
    android: '#',
    ios: '#',
    windows: '#'
  },

  MARQUEE_MESSAGES: [
    'خاص بودن انتخاب شماست | Vochino⁰¹',
    'امنیت کامل | دقیق و بی‌نقص',
    'انتخاب هوشمند | تحویل سریع',
    'کارمزد رقابتی | نرخ منصفانه',
    'بونوس جذاب | تجربه‌ای متفاوت',
    'پشتیبانی ویژه | ۷ روز هفته، ۲۴ ساعته'
  ],
  MARQUEE_INTERVAL_MS: 6000,

  RING_ANIMATION_DURATION_MS: 5000,
  CONFIGS_COLLAPSED_COUNT: 5
};
