'use strict';

const tg = window.Telegram?.WebApp;
if (tg) { tg.ready(); tg.expand(); }

const API_BASE = window.VOCHINO_API_BASE || '/api';

function getUserId() {
  const path = window.location.pathname.split('/').filter(Boolean);
  const fromPath = path[path.length - 1];
  if (fromPath && /^\d+$/.test(fromPath)) return fromPath;
  const params = new URLSearchParams(window.location.search);
  if (params.get('id')) return params.get('id');
  if (tg?.initDataUnsafe?.user?.id) return String(tg.initDataUnsafe.user.id);
  return null;
}

const USER_ID = getUserId();

const RING_CIRC = 2 * Math.PI * 60;

const SLOGANS = [
  'خاص بودن انتخاب شماست | ووچینو⁰۱',
  'امنیت پایدار، سرعت بی‌نهایت و بدون قطعی',
  'پشتیبانی ویژه، کارمزد رقابتی و نرخ منصفانه'
];

function initMarquee() {
  const el = document.getElementById('marqueeText');
  if (!el) return;
  let i = 0;
  setInterval(() => {
    el.classList.add('fade');
    setTimeout(() => {
      i = (i + 1) % SLOGANS.length;
      el.textContent = SLOGANS[i];
      el.classList.remove('fade');
    }, 600);
  }, 8000);
}

function initSidebar() {
  const toggle = document.getElementById('menuToggle');
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebarOverlay');
  if (!toggle || !sidebar || !overlay) return;

  function open() {
    sidebar.classList.add('open');
    overlay.classList.add('show');
  }
  function close() {
    sidebar.classList.remove('open');
    overlay.classList.remove('show');
  }
  toggle.addEventListener('click', () => {
    sidebar.classList.contains('open') ? close() : open();
  });
  overlay.addEventListener('click', close);

  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
      item.classList.add('active');
      close();
      const tab = item.dataset.tab;
      const target = document.querySelector(`[data-section="${tab}"]`);
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
}

function showToast(msg) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2200);
}

function copyText(text) {
  if (navigator.clipboard?.writeText) {
    return navigator.clipboard.writeText(text);
  }
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.style.position = 'fixed';
  ta.style.opacity = '0';
  document.body.appendChild(ta);
  ta.select();
  try { document.execCommand('copy'); } catch (e) {}
  document.body.removeChild(ta);
  return Promise.resolve();
}

function setRing(circleEl, percent) {
  if (!circleEl) return;
  const clamped = Math.max(0, Math.min(100, percent));
  const offset = RING_CIRC - (clamped / 100) * RING_CIRC;
  circleEl.style.strokeDasharray = RING_CIRC;
  circleEl.style.strokeDashoffset = offset;
}

function formatBytes(bytes) {
  if (!bytes || bytes <= 0) return '0 MB';
  const gb = bytes / (1024 ** 3);
  if (gb >= 1) return gb.toFixed(1) + ' GB';
  const mb = bytes / (1024 ** 2);
  return mb.toFixed(0) + ' MB';
}

function renderProfile(data) {
  const nameEl = document.getElementById('profileName');
  const idEl = document.getElementById('profileId');
  const avatarEl = document.getElementById('avatarImg');
  if (nameEl && data.name) nameEl.textContent = data.name;
  if (idEl) idEl.textContent = data.userId || USER_ID || '--';
  if (avatarEl && data.avatarUrl) avatarEl.src = data.avatarUrl;
}

function renderSubscription(data) {
  const daysLeftEl = document.getElementById('daysLeft');
  const daysTotalEl = document.getElementById('daysTotal');
  const expireDateEl = document.getElementById('expireDate');
  const ring = document.getElementById('ringDays');

  const daysLeft = Math.max(0, data.daysLeft ?? 0);
  const daysTotal = data.daysTotal ?? 0;

  if (daysLeftEl) daysLeftEl.textContent = daysLeft;
  if (daysTotalEl) daysTotalEl.textContent = daysTotal;
  if (expireDateEl) expireDateEl.textContent = data.expireDate || '--';

  const percent = daysTotal > 0 ? (daysLeft / daysTotal) * 100 : 0;
  setRing(ring, percent);
}

function renderTraffic(data) {
  const percentEl = document.getElementById('volumePercent');
  const usedEl = document.getElementById('volumeUsed');
  const totalEl = document.getElementById('volumeTotal');
  const remainEl = document.getElementById('volumeRemain');
  const ring = document.getElementById('ringVolume');

  const usedBytes = data.usedBytes ?? 0;
  const totalBytes = data.totalBytes ?? 0;
  const percent = totalBytes > 0 ? Math.min(100, (usedBytes / totalBytes) * 100) : 0;
  const remainBytes = Math.max(0, totalBytes - usedBytes);

  if (percentEl) percentEl.textContent = Math.round(percent) + '%';
  if (usedEl) usedEl.textContent = formatBytes(usedBytes);
  if (totalEl) totalEl.textContent = formatBytes(totalBytes);
  if (remainEl) remainEl.textContent = formatBytes(remainBytes);

  setRing(ring, percent);
}

const FLAG_MAP = {
  germany: '🇩🇪', japan: '🇯🇵', usa: '🇺🇸', us: '🇺🇸',
  singapore: '🇸🇬', france: '🇫🇷', uk: '🇬🇧', netherlands: '🇳🇱',
  turkey: '🇹🇷', uae: '🇦🇪', canada: '🇨🇦', default: '🌐'
};

const PROTO_DOT_COLOR = {
  v2ray: '#ff2d75', vless: '#ffb020', trojan: '#a855f7',
  shadowsocks: '#22d3ee', default: '#22d3ee'
};

function buildConfigRow(cfg, index) {
  const row = document.createElement('div');
  row.className = 'config-row';

  const flag = FLAG_MAP[(cfg.flagKey || '').toLowerCase()] || FLAG_MAP.default;
  const dotColor = PROTO_DOT_COLOR[(cfg.protocol || '').toLowerCase()] || PROTO_DOT_COLOR.default;

  row.innerHTML = `
    <button class="config-copy-btn" data-uri="${escapeHtml(cfg.uri || '')}" aria-label="کپی">
      <svg viewBox="0 0 24 24"><rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/></svg>
    </button>
    <span class="config-flag">${flag}</span>
    <div>
      <div class="config-name">${escapeHtml(cfg.name || 'کانفیگ')}</div>
      <div class="config-uri">${escapeHtml(cfg.uri || '')}</div>
    </div>
    <span class="config-proto">${escapeHtml(cfg.protocol || '-')}</span>
    <button class="config-qr-btn" data-uri="${escapeHtml(cfg.uri || '')}" data-name="${escapeHtml(cfg.name || '')}" aria-label="QR">
      <svg viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><path d="M14 14h3v3h-4v4M21 14v3M14 21h3M18 18h3v3"/></svg>
    </button>
    <span class="config-dot" style="color:${dotColor}"></span>
  `;

  const copyBtn = row.querySelector('.config-copy-btn');
  copyBtn.addEventListener('click', (e) => {
    ripple(copyBtn, e);
    copyText(cfg.uri || '').then(() => showToast('کانفیگ کپی شد ✅'));
  });

  const qrBtn = row.querySelector('.config-qr-btn');
  qrBtn.addEventListener('click', () => openQrModal(cfg.uri || '', cfg.name || ''));

  return row;
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function ripple(el, event) {
  const r = document.createElement('span');
  r.className = 'ripple';
  const rect = el.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);
  r.style.width = r.style.height = size + 'px';
  r.style.left = (event.clientX - rect.left - size / 2) + 'px';
  r.style.top = (event.clientY - rect.top - size / 2) + 'px';
  el.appendChild(r);
  setTimeout(() => r.remove(), 500);
}

let allConfigs = [];
let showingAll = false;
const INITIAL_COUNT = 5;

function renderConfigs(configs) {
  allConfigs = configs || [];
  const list = document.getElementById('configList');
  const showAllBtn = document.getElementById('showAllBtn');
  if (!list) return;

  list.innerHTML = '';
  const visible = showingAll ? allConfigs : allConfigs.slice(0, INITIAL_COUNT);
  visible.forEach((cfg, i) => list.appendChild(buildConfigRow(cfg, i)));

  if (showAllBtn) {
    showAllBtn.style.display = allConfigs.length > INITIAL_COUNT ? 'flex' : 'none';
  }
}

function initShowAll() {
  const btn = document.getElementById('showAllBtn');
  if (!btn) return;
  btn.addEventListener('click', () => {
    showingAll = !showingAll;
    btn.classList.toggle('open', showingAll);
    btn.firstChild.textContent = showingAll ? 'نمایش کمتر ' : 'نمایش همه کانفیگ‌ها ';
    renderConfigs(allConfigs);
  });
}

function initCopyAll() {
  const btn = document.getElementById('copyAllBtn');
  if (!btn) return;
  btn.addEventListener('click', () => {
    const all = allConfigs.map(c => c.uri).filter(Boolean).join('\n');
    if (!all) { showToast('کانفیگی برای کپی نیست'); return; }
    copyText(all).then(() => showToast('همه کانفیگ‌ها کپی شد ✅'));
  });
}

function openQrModal(text, label) {
  const modal = document.getElementById('qrModal');
  const canvas = document.getElementById('qrModalCanvas');
  const labelEl = document.getElementById('qrModalLabel');
  if (!modal || !canvas) return;

  canvas.innerHTML = '';
  const img = document.createElement('img');
  img.width = 200;
  img.height = 200;
  img.style.borderRadius = '8px';
  img.src = 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=' + encodeURIComponent(text);
  canvas.appendChild(img);

  if (labelEl) labelEl.textContent = label || '';
  modal.classList.add('open');
}

function initQrModal() {
  const modal = document.getElementById('qrModal');
  const closeBtn = document.getElementById('qrModalClose');
  if (!modal || !closeBtn) return;
  closeBtn.addEventListener('click', () => modal.classList.remove('open'));
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.remove('open');
  });
}

function initInstallLinks(data) {
  const map = {
    dlAndroid: data.androidUrl,
    dlIos: data.iosUrl,
    dlWindows: data.windowsUrl
  };
  Object.entries(map).forEach(([id, url]) => {
    const el = document.getElementById(id);
    if (el && url) el.href = url;
    if (el) el.addEventListener('click', function (e) {
      if (!this.getAttribute('href') || this.getAttribute('href') === '#') e.preventDefault();
    });
  });
}

function sampleData() {
  return {
    profile: { name: 'کاربر ووچینو⁰۱', userId: USER_ID || '------', avatarUrl: '' },
    subscription: { daysLeft: 0, daysTotal: 30, expireDate: '--' },
    traffic: { usedBytes: 0, totalBytes: 5 * 1024 ** 3 },
    configs: [],
    downloads: { androidUrl: '', iosUrl: '', windowsUrl: '' }
  };
}

async function fetchDashboardData() {
  if (!USER_ID) return sampleData();
  try {
    const res = await fetch(`${API_BASE}/sub-info/${USER_ID}`, { headers: { 'Accept': 'application/json' } });
    if (!res.ok) throw new Error('bad status');
    const json = await res.json();
    return {
      profile: json.profile || {},
      subscription: json.subscription || {},
      traffic: json.traffic || {},
      configs: json.configs || [],
      downloads: json.downloads || {}
    };
  } catch (err) {
    console.warn('خطا در دریافت اطلاعات، نمایش داده نمونه', err);
    return sampleData();
  }
}

async function boot() {
  initMarquee();
  initSidebar();
  initShowAll();
  initCopyAll();
  initQrModal();

  const data = await fetchDashboardData();
  renderProfile(data.profile);
  renderSubscription(data.subscription);
  renderTraffic(data.traffic);
  renderConfigs(data.configs);
  initInstallLinks(data.downloads);
}

document.addEventListener('DOMContentLoaded', boot);
