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

  SUPPORT_LINK: 'https://t.me/Vochino_bh01',
  BOT_LINK: 'https://t.me/Vochino_bh01_bot',
  BOT_HANDLE: '@Vochino_bh01_bot',

  DOWNLOAD_LINKS: {
    android: '#',
    ios: '#',
    windows: '#'
  },

  MARQUEE_MESSAGES: [
    'خاص بودن انتخاب شماست | Vochino⁰¹',
    'امنیت کامل، دقیق و بی‌نقص',
    'هوشمند، تحویل سریع',
    'کارمزد رقابتی، نرخ منصفانه',
    'بونوس جذاب و سرگرمی',
    'پشتیبانی ویژه ۷/۲۴'
  ],
  MARQUEE_INTERVAL_MS: 6000,

  RING_ANIMATION_DURATION_MS: 6000,
  CONFIGS_COLLAPSED_COUNT: 5,

  SUGGESTED_APPS: [
    { name: 'Happ', icon: '🟢', url: '#' },
    { name: 'V2RayNG', icon: '🅥', url: '#' },
    { name: 'V2RayX', icon: '🛡️', url: '#' },
    { name: 'Npester', icon: '🅽', url: '#' }
  ],
  VOUCHER_TYPES: [
    { name: 'U Voucher', icon: '💎' },
    { name: 'Hot Voucher', icon: '🔥' },
    { name: 'Premium Voucher', icon: '👑' },
    { name: 'PS Voucher', icon: '🎮' }
  ]
};
