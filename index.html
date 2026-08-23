// script.js
document.addEventListener('DOMContentLoaded', init);

const state = { data: null, expanded: false };

async function init() {
  try { window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.ready(); } catch (e) {}
  try { window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.expand(); } catch (e) {}

  bindStaticLinks();
  renderExtras();
  bindSidebar();
  bindMarquee();
  bindCopyAll();
  bindShowAll();
  bindQrModal();
  bindRippleGlobal();

  state.data = await VochinoAdapter.fetchDashboardData();
  renderDashboard(state.data);
}

function bindStaticLinks() {
  const cfg = window.VOCHINO_CONFIG;
  const map = {
    socialTelegram: cfg.SOCIAL_LINKS.telegram,
    socialInstagram: cfg.SOCIAL_LINKS.instagram,
    socialYoutube: cfg.SOCIAL_LINKS.youtube,
    socialStore: cfg.SOCIAL_LINKS.store,
    dlAndroid: cfg.DOWNLOAD_LINKS.android,
    dlIos: cfg.DOWNLOAD_LINKS.ios,
    dlWindows: cfg.DOWNLOAD_LINKS.windows
  };
  Object.keys(map).forEach(id => {
    const el = document.getElementById(id);
    if (el && map[id]) el.href = map[id];
  });
  const bot = document.getElementById('footerBot');
  if (bot) { bot.href = cfg.BOT_LINK; bot.textContent = cfg.BOT_HANDLE; }

  document.querySelectorAll('.menu-item[data-tab="support"]').forEach(el => {
    el.addEventListener('click', (e) => { e.preventDefault(); window.open(cfg.SUPPORT_LINK, '_blank'); });
  });
}

function renderExtras() {
  const cfg = window.VOCHINO_CONFIG;

  const appsRow = document.getElementById('suggestedAppsRow');
  if (appsRow && cfg.SUGGESTED_APPS) {
    appsRow.innerHTML = cfg.SUGGESTED_APPS.map(a =>
      '<a href="' + a.url + '" target="_blank" rel="noopener" class="sa-item"><span class="sa-ic">' + a.icon + '</span><span>' + a.name + '</span></a>'
    ).join('');
  }

  const voucherRow = document.getElementById('voucherRow');
  if (voucherRow && cfg.VOUCHER_TYPES) {
    voucherRow.innerHTML = cfg.VOUCHER_TYPES.map(v =>
      '<div class="voucher-item"><span class="voucher-ic">' + v.icon + '</span><small>' + v.name + '</small></div>'
    ).join('');
  }
}

function bindSidebar() {
  const btn = document.getElementById('menuBtn');
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebarOverlay');
  function toggle(open) {
    sidebar.classList.toggle('open', open);
    overlay.classList.toggle('open', open);
  }
  btn.addEventListener('click', () => toggle(!sidebar.classList.contains('open')));
  overlay.addEventListener('click', () => toggle(false));
  document.querySelectorAll('.menu-item').forEach(item => {
    item.addEventListener('click', (e) => {
      if (item.dataset.tab === 'support') return;
      e.preventDefault();
      document.querySelectorAll('.menu-item').forEach(i => i.classList.remove('active'));
      item.classList.add('active');
      toggle(false);
      const target = document.querySelector('[data-section="' + item.dataset.tab + '"]');
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
}

function bindMarquee() {
  const el = document.getElementById('marqueeText');
  const msgs = window.VOCHINO_CONFIG.MARQUEE_MESSAGES;
  let i = 0;
  setInterval(() => {
    el.classList.add('fade');
    setTimeout(() => {
      i = (i + 1) % msgs.length;
      el.textContent = msgs[i];
      el.classList.remove('fade');
    }, 500);
  }, window.VOCHINO_CONFIG.MARQUEE_INTERVAL_MS);
}

function bindRippleGlobal() {
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('button, .install-item, .qr-btn');
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    const circle = document.createElement('span');
    const size = Math.max(rect.width, rect.height);
    circle.className = 'ripple';
    circle.style.width = circle.style.height = size + 'px';
    circle.style.left = (e.clientX - rect.left - size / 2) + 'px';
    circle.style.top = (e.clientY - rect.top - size / 2) + 'px';
    const prevPos = getComputedStyle(btn).position;
    if (prevPos === 'static') btn.style.position = 'relative';
    btn.style.overflow = btn.style.overflow || 'hidden';
    btn.appendChild(circle);
    setTimeout(() => circle.remove(), 650);
  });
}

function copyText(text) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    return navigator.clipboard.writeText(text);
  }
  const ta = document.createElement('textarea');
  ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
  document.body.appendChild(ta); ta.select();
  try { document.execCommand('copy'); } catch (e) {}
  document.body.removeChild(ta);
  return Promise.resolve();
}

function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove('show'), 1800);
}

function bindCopyAll() {
  document.getElementById('copyAllBtn').addEventListener('click', function () {
    if (!state.data || !state.data.configs.length) return;
    const allLinks = state.data.configs.map(c => c.url).join('\n');
    copyText(allLinks).then(() => {
      this.classList.add('copied');
      showToast('همه‌ی کانفیگ‌ها کپی شد');
      setTimeout(() => this.classList.remove('copied'), 1500);
    });
  });
}

function bindShowAll() {
  document.getElementById('showAllBtn').addEventListener('click', function () {
    state.expanded = !state.expanded;
    applyConfigVisibility();
  });
}

function applyConfigVisibility() {
  const wrap = document.getElementById('configListWrap');
  const limit = window.VOCHINO_CONFIG.CONFIGS_COLLAPSED_COUNT;
  const rows = document.querySelectorAll('.config-item');
  const btn = document.getElementById('showAllBtn');
  const label = document.getElementById('showAllLabel');
  const chevron = document.getElementById('showAllChevron');

  if (!state.data || state.data.configs.length <= limit) {
    btn.style.display = 'none';
    wrap.style.maxHeight = 'none';
    return;
  }
  btn.style.display = 'flex';

  if (state.expanded) {
    wrap.style.maxHeight = wrap.scrollHeight + 'px';
    label.textContent = 'بستن کانفیگ‌ها';
    chevron.classList.add('open');
  } else {
    let collapsedHeight = 0;
    rows.forEach((row, idx) => { if (idx < limit) collapsedHeight += row.offsetHeight + 10; });
    wrap.style.maxHeight = collapsedHeight + 'px';
    label.textContent = 'نمایش همه کانفیگ‌ها';
    chevron.classList.remove('open');
  }
}

function bindQrModal() {
  const modal = document.getElementById('qrModal');
  document.getElementById('qrModalClose').addEventListener('click', () => modal.classList.remove('open'));
  modal.addEventListener('click', (e) => { if (e.target === modal) modal.classList.remove('open'); });
}

function openQr(url, label) {
  const modal = document.getElementById('qrModal');
  const canvas = document.getElementById('qrModalCanvas');
  canvas.innerHTML = '';
  const el = document.createElement('canvas');
  canvas.appendChild(el);
  try {
    QRCode.toCanvas(el, url, { width: 210, margin: 1 }, function (err) {
      if (err) canvas.innerHTML = '<span style="color:#000">QR</span>';
    });
  } catch (e) {
    canvas.innerHTML = '<span style="color:#000">QR</span>';
  }
  document.getElementById('qrModalLabel').textContent = label || '';
  modal.classList.add('open');
}

const RING_CIRCUMFERENCE = 2 * Math.PI * 68;

function setRing(circleEl, percent) {
  const clamped = Math.max(0, Math.min(100, percent));
  const offset = RING_CIRCUMFERENCE - (clamped / 100) * RING_CIRCUMFERENCE;
  requestAnimationFrame(() => { circleEl.style.strokeDashoffset = offset; });
}

function protocolClass(protocol) {
  const p = (protocol || '').toLowerCase();
  if (p.indexOf('v2ray') > -1) return 'proto-v2ray';
  if (p.indexOf('vless') > -1) return 'proto-vless';
  if (p.indexOf('trojan') > -1) return 'proto-trojan';
  if (p.indexOf('shadowsocks') > -1) return 'proto-shadowsocks';
  return 'proto-v2ray';
}

function truncateUrl(url, n) {
  if (!url) return '';
  return url.length > n ? url.slice(0, n) + '…' : url;
}

function renderConfigs(configs) {
  const list = document.getElementById('configList');
  list.innerHTML = '';
  configs.forEach((c, idx) => {
    const row = document.createElement('div');
    row.className = 'config-item';
    row.innerHTML =
      '<button class="copy-row-btn" data-idx="' + idx + '">کپی</button>' +
      '<span class="config-flag">' + (c.flag || '') + '</span>' +
      '<span class="config-server">' + (c.country || '') + ' - ' + (c.city || '') + '</span>' +
      '<span class="config-protocol ' + protocolClass(c.protocol) + '">' + (c.protocol || '') + '</span>' +
      '<span class="config-url" title="' + (c.url || '') + '">' + truncateUrl(c.url, 22) + '</span>' +
      '<button class="qr-btn" data-idx="' + idx + '">▦</button>' +
      '<span class="status-dot ' + (c.status === 'online' ? 'online' : 'offline') + '"></span>';
    list.appendChild(row);
  });

  list.querySelectorAll('.copy-row-btn').forEach(btn => {
    btn.addEventListener('click', function () {
      const c = state.data.configs[this.dataset.idx];
      copyText(c.url).then(() => {
        this.classList.add('copied');
        const original = this.textContent;
        this.textContent = '✓';
        showToast('کانفیگ کپی شد');
        setTimeout(() => { this.classList.remove('copied'); this.textContent = original; }, 1400);
      });
    });
  });

  list.querySelectorAll('.qr-btn').forEach(btn => {
    btn.addEventListener('click', function () {
      const c = state.data.configs[this.dataset.idx];
      openQr(c.url, c.country + ' - ' + c.city);
    });
  });

  state.expanded = false;
  applyConfigVisibility();
}

function renderDashboard(data) {
  state.data = data;

  document.getElementById('profileUsername').textContent = data.user.username;
  document.getElementById('profileUserId').textContent = data.user.id;
  const avatarEl = document.getElementById('avatarImg');
  if (data.user.avatar) { avatarEl.src = data.user.avatar; avatarEl.style.display = 'block'; }
  else { avatarEl.style.display = 'none'; }

  document.getElementById('remainingDays').textContent = data.subscription.remainingDays;
  document.getElementById('totalDays').textContent = data.subscription.totalDays;
  document.getElementById('expireDate').textContent = data.subscription.expireDate;
  const subPercent = data.subscription.totalDays > 0
    ? (data.subscription.remainingDays / data.subscription.totalDays) * 100
    : 0;
  setRing(document.getElementById('ringSub'), subPercent);

  document.getElementById('usagePercent').textContent = data.traffic.percentage;
  document.getElementById('usedTraffic').textContent = data.traffic.used;
  document.getElementById('totalTraffic').textContent = data.traffic.total;
  document.getElementById('remainingTraffic').textContent = data.traffic.remaining;
  setRing(document.getElementById('ringVol'), data.traffic.percentage);

  renderConfigs(data.configs || []);
}

window.addEventListener('resize', () => { if (state.data) applyConfigVisibility(); });
