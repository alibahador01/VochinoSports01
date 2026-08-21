el.textContent = `${appLinks[index].name} علامتش ↗`;/* =========================================
   VOCHINO⁰¹ Dashboard Script
   Production Ready - Vanilla JS
   ========================================= */

// Initialize Telegram WebApp
const tg = window.Telegram?.WebApp;
if (tg) {
    tg.ready();
    tg.expand();
}

/* --- Global State --- */
const state = {
    allConfigs: [
        {
            country: "Germany",
            city: "Berlin",
            flag: "🇩🇪",
            protocol: "V2Ray",
            link: "vless://eyJhZGQiOiIxMjMuNDUuNjcuODkiLCJhaWQiOiIwIiwiYWxnIjoibm9uZSIsImhvc3QiOiIiLCJpZCI6IjEyMzQ1Njc4LTkwYWItYzRkZS1mZzEyMzQ1Njc4OTBhYiIsInBhdGgiOiIvIiwicG9ydCI6IjQ0MyIsInBzeSI6Im5vbmUiLCJzY3kiOiJhdXRvIiwic25pIjoiIiwidGxzIjoiIiwidHlwZSI6Im5vbmUiLCJ2IjoiMiJ9",
            status: "green"
        },
        {
            country: "Japan",
            city: "Tokyo",
            flag: "🇯🇵",
            protocol: "VLESS",
            link: "vless://b128f6a7-7e3a-4a2b-9c0d-1e2f3a4b5c6d@45.67.89.10:443?security=auto&type=ws&host=example.com&path=/ws#Japan-Tokyo",
            status: "yellow"
        },
        {
            country: "USA",
            city: "New York",
            flag: "🇺🇸",
            protocol: "Trojan",
            link: "trojan://password@45.76.98.12:443?security=tls&sni=example.com#USA-New-York",
            status: "purple"
        },
        {
            country: "Singapore",
            city: "Singapore",
            flag: "🇸🇬",
            protocol: "Shadowsocks",
            link: "ss://YWVzLTI1Ni1nY206cGFzc3dvcmQ@45.76.98.13:443#Singapore",
            status: "cyan"
        },
        {
            country: "France",
            city: "Paris",
            flag: "🇫🇷",
            protocol: "V2Ray",
            link: "vless://eyJhZGQiOiI4OC45OS4xMC4xMSIsImFpZCI6IjAiLCJhbGciOiJub25lIiwiaG9zdCI6IiIsImlkIjoiOTg3NjU0MzItMTBhYi1jZGVmLWYxMjM0NTY3ODkwYWIiLCJwYXRoIjoiLyIsInBvcnQiOiI0NDMiLCJwc3kiOiJub25lIiwic2N5IjoiYXV0byIsInNuaSI6IiIsInRscyI6IiIsInR5cGUiOiJub25lIiwidiI6IjIifQ==",
            status: "green"
        }
    ],
    shownCount: 5,
    ripples: true
};

/* --- DOM Elements --- */
const elements = {
    menuBtn: document.getElementById('menuBtn'),
    sidebar: document.getElementById('sidebar'),
    sidebarOverlay: document.getElementById('sidebarOverlay'),
    marqueeText: document.getElementById('marqueeText'),
    configList: document.getElementById('configList'),
    showMoreBtn: document.getElementById('showMoreBtn'),
    copyAllBtn: document.getElementById('copyAllBtn'),
    qrModal: document.getElementById('qrModal'),
};

/* --- 1. Sidebar Toggle --- */
function toggleSidebar(open) {
    if (open) {
        elements.sidebar.classList.add('open');
        elements.sidebarOverlay.classList.add('open');
    } else {
        elements.sidebar.classList.remove('open');
        elements.sidebarOverlay.classList.remove('open');
    }
}

elements.menuBtn.addEventListener('click', () => toggleSidebar(true));
elements.sidebarOverlay.addEventListener('click', () => toggleSidebar(false));

/* --- 2. Marquee Text Rotation --- */
const marqueeMessages = [
    "خاص بودن انتخاب شماست | Vochino⁰¹",
    "امنیت پایدار، انتخابی هوشمند.",
    "سرعت تحویل بی‌نهایت",
    "کارمزد رقابتی و نرخ منصفانه",
    "پشتیبانی ویژه : 7/24"
];
let marqueeIndex = 0;
let isFading = false;

function rotateMarquee() {
    if (isFading) return;
    isFading = true;
    
    // Fade out
    elements.marqueeText.style.opacity = '0';
    elements.marqueeText.style.transform = 'translateY(10px)';
    
    setTimeout(() => {
        marqueeIndex = (marqueeIndex + 1) % marqueeMessages.length;
        elements.marqueeText.textContent = marqueeMessages[marqueeIndex];
        
        // Fade in
        elements.marqueeText.style.opacity = '1';
        elements.marqueeText.style.transform = 'translateY(0)';
        isFading = false;
    }, 500);
}
setInterval(rotateMarquee, 5000); // Change every 5 seconds

/* --- 3. Ripple Effect --- */
function createRipple(event) {
    const button = event.currentTarget;
    const circle = document.createElement('span');
    const diameter = Math.max(button.clientWidth, button.clientHeight);
    const radius = diameter / 2;
    const rect = button.getBoundingClientRect();
    
    circle.style.width = circle.style.height = `${diameter}px`;
    circle.style.left = `${event.clientX - rect.left - radius}px`;
    circle.style.top = `${event.clientY - rect.top - radius}px`;
    circle.classList.add('ripple');
    
    const existingRipple = button.querySelector('.ripple');
    if (existingRipple) {
        existingRipple.remove();
    }
    
    button.appendChild(circle);
}

document.querySelectorAll('button').forEach(btn => {
    btn.addEventListener('click', createRipple);
});

/* --- 4. Config Rendering --- */
function renderConfigList(data) {
    elements.configList.innerHTML = '';
    const shownData = data.slice(0, state.shownCount);
    
    shownData.forEach(config => {
        const item = document.createElement('div');
        item.className = 'config-item';
        item.innerHTML = `
            <button class="copy-btn" onclick="copyConfig(this, '${config.link}')">کپی 📋</button>
            <span class="flag">${config.flag}</span>
            <span class="server-name">${config.country} - ${config.city}</span>
            <span class="protocol ${config.protocol.toLowerCase()}">${config.protocol}</span>
            <span class="config-link" title="${config.link}">${config.link.substring(0, 20)}...</span>
            <button class="qr-btn" onclick="showQR('${config.link}')">📱</button>
            <span class="status-dot ${config.status}"></span>
        `;
        elements.configList.appendChild(item);
    });
    
    // Hide "Show More" if all configs are shown
    if (data.length <= state.shownCount) {
        elements.showMoreBtn.style.display = 'none';
    } else {
        elements.showMoreBtn.style.display = 'block';
    }
}

function copyConfig(btn, link) {
    navigator.clipboard.writeText(link).then(() => {
        const originalText = btn.innerHTML;
        btn.innerHTML = '✓';
        btn.style.color = 'green';
        setTimeout(() => {
            btn.innerHTML = originalText;
            btn.style.color = '';
        }, 1500);
    });
}

elements.showMoreBtn.addEventListener('click', () => {
    state.shownCount = state.allConfigs.length;
    renderConfigList(state.allConfigs);
});

elements.copyAllBtn.addEventListener('click', () => {
    const allLinks = state.allConfigs.map(c => c.link).join('\n');
    navigator.clipboard.writeText(allLinks).then(() => {
        const originalText = elements.copyAllBtn.innerHTML;
        elements.copyAllBtn.innerHTML = '✓ کپی شد!';
        elements.copyAllBtn.style.color = 'green';
        setTimeout(() => {
            elements.copyAllBtn.innerHTML = originalText;
            elements.copyAllBtn.style.color = '';
        }, 1500);
    });
});

/* --- 5. QR Modal --- */
function showQR(link) {
    const modal = elements.qrModal;
    modal.classList.add('open');
    // TODO: نیاز به تأیید (استفاده از کتابخانه QR واقعی مثل qrcode.js)
    const qrDiv = modal.querySelector('.qr-code');
    qrDiv.textContent = "QR";
    qrDiv.title = link;
}

function closeQR() {
    elements.qrModal.classList.remove('open');
}

document.querySelector('.close-btn').addEventListener('click', closeQR);
elements.qrModal.addEventListener('click', (e) => {
    if (e.target === elements.qrModal) closeQR();
});

/* --- 6. Progress Ring Animation --- */
function animateProgressRing(ringElement, targetPercent) {
    // Start from 0
    ringElement.style.background = `conic-gradient(var(--neon-blue) 0% 0%, #222 0% 100%)`;
    
    let current = 0;
    const interval = setInterval(() => {
        current++;
        if (current > targetPercent) {
            clearInterval(interval);
            return;
        }
        if (ringElement.classList.contains('ring-orange')) {
            ringElement.style.background = `conic-gradient(#ffb300 0% ${current}%, #222 ${current}% 100%)`;
        } else {
            ringElement.style.background = `conic-gradient(var(--neon-blue) 0% ${current}%, #222 ${current}% 100%)`;
        }
    }, 15); // Fast animation to look smooth
}

/* --- 7. Dynamic Data Rendering (renderDashboard) --- */
function renderDashboard(data) {
    // Profile
    document.getElementById('profileName').textContent = data.user.name || 'کارلن ووچینو⁰¹';
    document.getElementById('profileUsername').textContent = data.user.username || 'نام کاربر';
    document.getElementById('profileId').textContent = data.user.id || 'شناسه کاربر';
    if (data.user.avatar) {
        document.querySelector('.avatar').src = data.user.avatar;
    }
    
    // Subscription Status
    document.getElementById('daysLeft').textContent = data.subscription.daysLeft;
    document.getElementById('totalDays').textContent = `${data.subscription.totalDays} روز`;
    document.getElementById('expiryDate').textContent = `${data.subscription.expiryDate} تاریخ انقضا`;
    const subPercent = (data.subscription.daysLeft / data.subscription.totalDays) * 100;
    animateProgressRing(document.querySelector('.ring-orange'), subPercent);
    
    // Volume Status
    document.getElementById('percentUsed').textContent = data.volume.percent + '%';
    document.getElementById('totalUsed').textContent = `${data.volume.used} / ${data.volume.total} GB`;
    document.getElementById('remainingTraffic').textContent = `${data.volume.remaining} GB ترافیک باقی‌مانده`;
    animateProgressRing(document.querySelector('.ring-blue'), data.volume.percent);
    
    // Configs
    state.allConfigs = data.configs;
    state.shownCount = 5;
    renderConfigList(state.allConfigs);
    
    // App Links
    const appLinks = data.apps;
    const appLinkElements = document.querySelectorAll('.app-list .app-link');
    appLinkElements.forEach((el, index) => {
        if (appLinks[index]) {
            el.href = appLinks[index].url;
            el.textContent = `${appLinks[index].name} ↗`;
        }
    });
}

/* --- Initial Load --- */
document.addEventListener('DOMContentLoaded', () => {
    // Placeholder Data (Simulating backend response)
    const mockData = {
        user: {
            name: 'کارلن ووچینو⁰¹',
            username: 'کاربر نمونه',
            id: '123456789',
            avatar: null
        },
        subscription: {
            daysLeft: 76,
            totalDays: 90,
            expiryDate: '1403/07/20'
        },
        volume: {
            percent: 65,
            used: '65.2',
            total: '100',
            remaining: '34.8'
        },
        configs: state.allConfigs,
        apps: [
            { name: 'Happ', url: '#' }, // TODO: نیاز به تأیید (لینک مستقیم Happ.apk)
            { name: 'Vitore', url: '#' }, // TODO: نیاز به تأیید (لینک مستقیم Vitore)
            { name: 'VitoreX', url: '#' }, // TODO: نیاز به تأیید (لینک مستقیم VitoreX)
            { name: 'Npester', url: '#' } // TODO: نیاز به تأیید (لینک مستقیم Npester)
        ]
    };
    
    renderDashboard(mockData);
});
