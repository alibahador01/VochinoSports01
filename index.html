// adapter.js
// لایه‌ی اتصال داده — تنها جایی که باید موقع وصل کردن ربات واقعی تغییر کند.
// اگر API واقعی در دسترس نباشد (یا خطا بدهد)، به‌صورت خودکار از داده‌ی نمونه استفاده می‌کند
// تا صفحه هیچ‌وقت خالی/خراب نمایش داده نشود.

const VochinoAdapter = (function () {

  function getTelegramUser() {
    try {
      const tg = window.Telegram && window.Telegram.WebApp;
      if (tg && tg.initDataUnsafe && tg.initDataUnsafe.user) {
        return tg.initDataUnsafe.user;
      }
    } catch (e) {}
    return null;
  }

  function getUserId() {
    const tgUser = getTelegramUser();
    if (tgUser && tgUser.id) return String(tgUser.id);
    const params = new URLSearchParams(window.location.search);
    if (params.get('user_id')) return params.get('user_id');
    return null;
  }

  // داده‌ی نمونه — دقیقاً همان ساختاری که سند اتصال ربات مشخص کرده (بخش ۶)
  function mockData() {
    return {
      user: {
        username: 'کارلن ووچینو⁰¹',
        id: '123456789',
        hash: '—',
        avatar: null
      },
      subscription: {
        remainingDays: 76,
        totalDays: 90,
        expireDate: '1403/07/20',
        status: 'active'
      },
      traffic: {
        used: '65.2 GB',
        total: '100 GB',
        remaining: '34.8 GB',
        percentage: 65
      },
      configs: [
        { country: 'Germany', city: 'Berlin', flag: '🇩🇪', protocol: 'V2Ray', url: 'vless://eyJhZGQiOiIxMjMuNDUuNjcuODki...', status: 'online' },
        { country: 'Japan', city: 'Tokyo', flag: '🇯🇵', protocol: 'VLESS', url: 'vless://b128f6a7-7e3a-4a2b-9c0d...', status: 'online' },
        { country: 'USA', city: 'New York', flag: '🇺🇸', protocol: 'Trojan', url: 'trojan://password@45.76.98.12:443', status: 'online' },
        { country: 'Singapore', city: 'Singapore', flag: '🇸🇬', protocol: 'Shadowsocks', url: 'ss://YWVzLTI1Ni1nY206cGFzc3dvcmQ...', status: 'online' },
        { country: 'France', city: 'Paris', flag: '🇫🇷', protocol: 'V2Ray', url: 'vless://eyJhZGQiOiI4OC45OS4xMC4xMSi...', status: 'online' }
      ]
    };
  }

  async function fetchDashboardData() {
    const cfg = window.VOCHINO_CONFIG;
    const userId = getUserId();

    if (!cfg.API_BASE || !userId) {
      return mockData();
    }

    try {
      const res = await fetch(`${cfg.API_BASE}${cfg.API_ENDPOINT_DASHBOARD}/${userId}`, {
        headers: { 'Accept': 'application/json' }
      });
      if (!res.ok) throw new Error('bad status ' + res.status);
      const data = await res.json();
      return normalizeData(data);
    } catch (e) {
      console.warn('VochinoAdapter: خطا در دریافت داده واقعی، استفاده از داده نمونه', e.message);
      return mockData();
    }
  }

  // تضمین می‌کند حتی اگر بک‌اند فیلدی را نفرستد، صفحه خطا ندهد
  function normalizeData(raw) {
    raw = raw || {};
    return {
      user: {
        username: (raw.user && raw.user.username) || '—',
        id: (raw.user && raw.user.id) || '—',
        hash: (raw.user && raw.user.hash) || '—',
        avatar: (raw.user && raw.user.avatar) || null
      },
      subscription: {
        remainingDays: (raw.subscription && raw.subscription.remainingDays) ?? 0,
        totalDays: (raw.subscription && raw.subscription.totalDays) ?? 0,
        expireDate: (raw.subscription && raw.subscription.expireDate) || '—',
        status: (raw.subscription && raw.subscription.status) || 'unknown'
      },
      traffic: {
        used: (raw.traffic && raw.traffic.used) || '0 GB',
        total: (raw.traffic && raw.traffic.total) || '0 GB',
        remaining: (raw.traffic && raw.traffic.remaining) || '0 GB',
        percentage: (raw.traffic && raw.traffic.percentage) ?? 0
      },
      configs: Array.isArray(raw.configs) ? raw.configs : []
    };
  }

  return { fetchDashboardData, getUserId, getTelegramUser };
})();
