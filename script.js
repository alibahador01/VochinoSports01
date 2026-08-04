/* ============================================
   VOCHINO SPORTS - MAIN JAVASCRIPT
   Modern Football & Voucher Platform
   ============================================ */

// === Configuration ===
const CONFIG = {
    // API Keys - User can set their own keys
    API_FOOTBALL_KEY: localStorage.getItem('API_FOOTBALL_KEY') || '',
    NEWS_API_KEY: localStorage.getItem('NEWS_API_KEY') || '',
    GNEWS_API_KEY: localStorage.getItem('GNEWS_API_KEY') || '',
    
    // API Endpoints
    API_FOOTBALL_URL: 'https://v3.football.api-sports.io',
    NEWS_API_URL: 'https://newsapi.org/v2',
    GNEWS_URL: 'https://gnews.io/api/v4',
    
    // Cache Duration (in milliseconds)
    CACHE_DURATION: 30 * 60 * 1000, // 30 minutes
    
    // Refresh Intervals
    LIVE_REFRESH: 60000, // 1 minute for live matches
    
    // League IDs (API-Football)
    LEAGUES: {
        'premier-league': 39,
        'la-liga': 140,
        'bundesliga': 78,
        'serie-a': 135,
        'champions-league': 2,
        'iran-pro-league': 235,
        'ligue-1': 61,
        'eredivisie': 88
    },
    
    // Telegram Bot Links
    TELEGRAM_BOT: 'https://t.me/VochinoBot',
    TELEGRAM_SUPPORT: 'https://t.me/VochinoSupport'
};

// === Jalali Date Converter (Simple Implementation) ===
const JalaliDate = {
    g_days_in_month: [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31],
    j_days_in_month: [31, 31, 31, 31, 31, 31, 30, 30, 30, 30, 30, 29],
    
    gregorianToJalali(gy, gm, gd) {
        let g_d_m = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
        let jy = (gy <= 1600) ? 0 : 979;
        gy -= (gy <= 1600) ? 621 : 1600;
        let gy2 = (gm > 2) ? (gy + 1) : gy;
        let days = (365 * gy) + (parseInt((gy2 + 3) / 4)) - (parseInt((gy2 + 99) / 100)) 
                 + (parseInt((gy2 + 399) / 400)) - 80 + gd + g_d_m[gm - 1];
        jy += 33 * (parseInt(days / 12053));
        days %= 12053;
        jy += 4 * (parseInt(days / 1461));
        days %= 1461;
        if (days > 365) {
            jy += parseInt((days - 1) / 365);
            days = (days - 1) % 365;
        }
        let jm = (days < 186) ? 1 + parseInt(days / 31) : 7 + parseInt((days - 186) / 30);
        let jd = 1 + ((days < 186) ? (days % 31) : ((days - 186) % 30));
        return [jy, jm, jd];
    },
    
    toPersianNum(num) {
        const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
        return num.toString().replace(/\d/g, d => persianDigits[d]);
    },
    
    getMonthName(month) {
        const months = ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
                       'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'];
        return months[month - 1];
    }
};

// === Cache Manager ===
const Cache = {
    set(key, data, duration = CONFIG.CACHE_DURATION) {
        const item = {
            data: data,
            timestamp: Date.now(),
            expires: Date.now() + duration
        };
        try {
            localStorage.setItem(key, JSON.stringify(item));
        } catch (e) {
            console.warn('Cache storage failed:', e);
        }
    },
    
    get(key) {
        try {
            const item = JSON.parse(localStorage.getItem(key));
            if (!item) return null;
            if (Date.now() > item.expires) {
                localStorage.removeItem(key);
                return null;
            }
            return item.data;
        } catch (e) {
            return null;
        }
    },
    
    clear(key) {
        localStorage.removeItem(key);
    }
};

// === API Service ===
const APIService = {
    // API-Football Request
    async footballRequest(endpoint, params = {}) {
        if (!CONFIG.API_FOOTBALL_KEY) {
            console.warn('API-Football key not set. Using mock data.');
            return this.getMockData(endpoint, params);
        }
        
        const cacheKey = `football_${endpoint}_${JSON.stringify(params)}`;
        const cached = Cache.get(cacheKey);
        if (cached) return cached;
        
        try {
            const url = new URL(`${CONFIG.API_FOOTBALL_URL}/${endpoint}`);
            Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
            
            const response = await fetch(url, {
                headers: {
                    'x-apisports-key': CONFIG.API_FOOTBALL_KEY
                }
            });
            
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            
            const data = await response.json();
            Cache.set(cacheKey, data);
            return data;
        } catch (error) {
            console.error('API-Football error:', error);
            return this.getMockData(endpoint, params);
        }
    },
    
    // News API Request
    async newsRequest(endpoint, params = {}) {
        const apiKey = CONFIG.NEWS_API_KEY || CONFIG.GNEWS_API_KEY;
        if (!apiKey) {
            return this.getMockNews();
        }
        
        const cacheKey = `news_${endpoint}_${JSON.stringify(params)}`;
        const cached = Cache.get(cacheKey);
        if (cached) return cached;
        
        try {
            const url = CONFIG.NEWS_API_KEY 
                ? `${CONFIG.NEWS_API_URL}/${endpoint}?apiKey=${apiKey}&${new URLSearchParams(params)}`
                : `${CONFIG.GNEWS_URL}/${endpoint}?token=${apiKey}&${new URLSearchParams(params)}`;
            
            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            
            const data = await response.json();
            Cache.set(cacheKey, data);
            return data;
        } catch (error) {
            console.error('News API error:', error);
            return this.getMockNews();
        }
    },
    
    // Mock Data for Demo
    getMockData(endpoint, params) {
        const mockMatches = {
            live: this.generateMockMatches(6, 'live'),
            today: this.generateMockMatches(12, 'today'),
            tomorrow: this.generateMockMatches(10, 'tomorrow')
        };
        
        if (endpoint === 'fixtures' && params.live) return { response: mockMatches.live };
        if (endpoint === 'fixtures' && params.date) return { response: mockMatches.today };
        return { response: mockMatches.today };
    },
    
    generateMockMatches(count, type) {
        const teams = [
            { name: 'پرسپولیس', logo: 'https://media.api-sports.io/football/teams/576.png' },
            { name: 'استقلال', logo: 'https://media.api-sports.io/football/teams/577.png' },
            { name: 'سپاهان', logo: 'https://media.api-sports.io/football/teams/578.png' },
            { name: 'منچسترسیتی', logo: 'https://media.api-sports.io/football/teams/50.png' },
            { name: 'لیورپول', logo: 'https://media.api-sports.io/football/teams/40.png' },
            { name: 'رئال مادرید', logo: 'https://media.api-sports.io/football/teams/541.png' },
            { name: 'بارسلونا', logo: 'https://media.api-sports.io/football/teams/529.png' },
            { name: 'بایرن مونیخ', logo: 'https://media.api-sports.io/football/teams/157.png' },
            { name: 'یوونتوس', logo: 'https://media.api-sports.io/football/teams/496.png' },
            { name: 'پاری سن ژرمن', logo: 'https://media.api-sports.io/football/teams/85.png' }
        ];
        
        const leagues = [
            { name: 'لیگ برتر ایران', logo: 'https://media.api-sports.io/football/leagues/235.png' },
            { name: 'لیگ برتر انگلیس', logo: 'https://media.api-sports.io/football/leagues/39.png' },
            { name: 'لالیگا', logo: 'https://media.api-sports.io/football/leagues/140.png' },
            { name: 'بوندسلیگا', logo: 'https://media.api-sports.io/football/leagues/78.png' },
            { name: 'سری آ', logo: 'https://media.api-sports.io/football/leagues/135.png' }
        ];
        
        return Array.from({ length: count }, (_, i) => ({
            fixture: {
                id: 1000 + i,
                status: {
                    short: type === 'live' ? 'LIVE' : (type === 'tomorrow' ? 'NS' : 'FT'),
                    elapsed: type === 'live' ? Math.floor(Math.random() * 90) + 1 : null,
                    long: type === 'live' ? 'در حال برگزاری' : (type === 'tomorrow' ? 'برگزار نشده' : 'پایان یافته')
                },
                date: new Date().toISOString(),
                venue: { name: 'ورزشگاه آزادی' }
            },
            league: leagues[i % leagues.length],
            teams: {
                home: {
                    name: teams[i % teams.length].name,
                    logo: teams[i % teams.length].logo,
                    winner: Math.random() > 0.5
                },
                away: {
                    name: teams[(i + 1) % teams.length].name,
                    logo: teams[(i + 1) % teams.length].logo,
                    winner: Math.random() > 0.5
                }
            },
            goals: {
                home: type !== 'tomorrow' ? Math.floor(Math.random() * 4) : null,
                away: type !== 'tomorrow' ? Math.floor(Math.random() * 4) : null
            },
            score: {
                halftime: {
                    home: type !== 'tomorrow' ? Math.floor(Math.random() * 2) : null,
                    away: type !== 'tomorrow' ? Math.floor(Math.random() * 2) : null
                }
            }
        }));
    },
    
    getMockNews() {
        return {
            articles: [
                {
                    title: 'پیروزی پرگل پرسپولیس در دربی تهران',
                    description: 'پرسپولیس با نتیجه ۳ بر ۱ استقلال را شکست داد و صدرنشین لیگ شد.',
                    url: '#',
                    image: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=400',
                    publishedAt: new Date().toISOString(),
                    source: { name: 'ورزش سه' }
                },
                {
                    title: 'رئال مادرید قهرمان لیگ قهرمانان اروپا شد',
                    description: 'رئال مادرید با شکست منچسترسیتی در فینال، پانزدهمین قهرمانی خود را جشن گرفت.',
                    url: '#',
                    image: 'https://images.unsplash.com/photo-1574629810360-70bbe9d6474b?w=400',
                    publishedAt: new Date().toISOString(),
                    source: { name: 'ورزش ۱۱' }
                },
                {
                    title: 'مسی بهترین بازیکن ماه MLS شد',
                    description: 'لیونل مسی با ۸ گل و ۵ پاس گل، عنوان بهترین بازیکن ماه را از آن خود کرد.',
                    url: '#',
                    image: 'https://images.unsplash.com/photo-1551958219-acbc608c6377?w=400',
                    publishedAt: new Date().toISOString(),
                    source: { name: 'گل' }
                },
                {
                    title: 'انتقال بزرگ تابستانی: ستاره برزیلی به بارسلونا',
                    description: 'بارسلونا با پرداخت ۱۰۰ میلیون یورو، ستاره برزیلی را به خدمت گرفت.',
                    url: '#',
                    image: 'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=400',
                    publishedAt: new Date().toISOString(),
                    source: { name: 'اسپورت' }
                },
                {
                    title: 'تیم ملی ایران آماده جام جهانی ۲۰۲۶',
                    description: 'یوزپیران با برگزاری اردوی تدارکاتی، خود را برای جام جهانی آماده می‌کند.',
                    url: '#',
                    image: 'https://images.unsplash.com/photo-1508063615619-2965a4d004d1?w=400',
                    publishedAt: new Date().toISOString(),
                    source: { name: 'ایسنا' }
                },
                {
                    title: 'هالند بهترین گلزن فصل لیگ برتر انگلیس',
                    description: 'ارلینگ هالند با ۳۶ گل، رکورد جدیدی در لیگ برتر ثبت کرد.',
                    url: '#',
                    image: 'https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=400',
                    publishedAt: new Date().toISOString(),
                    source: { name: 'بی‌بی‌سی ورزشی' }
                }
            ]
        };
    }
};

// === UI Manager ===
const UI = {
    // Preloader
    initPreloader() {
        window.addEventListener('load', () => {
            const preloader = document.getElementById('preloader');
            setTimeout(() => {
                preloader.classList.add('hidden');
                setTimeout(() => preloader.style.display = 'none', 500);
            }, 1500);
        });
    },
    
    // Clock & Date
    initClock() {
        const updateClock = () => {
            const now = new Date();
            const clockEl = document.getElementById('clock');
            const dateEl = document.getElementById('date');
            
            if (clockEl) {
                const hours = String(now.getHours()).padStart(2, '0');
                const minutes = String(now.getMinutes()).padStart(2, '0');
                const seconds = String(now.getSeconds()).padStart(2, '0');
                clockEl.textContent = JalaliDate.toPersianNum(`${hours}:${minutes}:${seconds}`);
            }
            
            if (dateEl) {
                const [jy, jm, jd] = JalaliDate.gregorianToJalali(
                    now.getFullYear(), now.getMonth() + 1, now.getDate()
                );
                const monthName = JalaliDate.getMonthName(jm);
                dateEl.textContent = JalaliDate.toPersianNum(`${jy}/${jm}/${jd} ${monthName}`);
            }
        };
        
        updateClock();
        setInterval(updateClock, 1000);
    },
    
    // Header Scroll Effect
    initHeaderScroll() {
        const header = document.getElementById('header');
        if (!header) return;
        
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        });
    },
    
    // Mobile Menu
    initMobileMenu() {
        const toggle = document.getElementById('mobileMenuToggle');
        const nav = document.getElementById('mainNav');
        
        if (!toggle || !nav) return;
        
        toggle.addEventListener('click', () => {
            toggle.classList.toggle('active');
            nav.classList.toggle('active');
        });
        
        // Close menu on link click
        nav.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                toggle.classList.remove('active');
                nav.classList.remove('active');
            });
        });
    },
    
    // Active Navigation
    initActiveNav() {
        const sections = document.querySelectorAll('.section, .hero-section');
        const navLinks = document.querySelectorAll('.nav-link');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const id = entry.target.id;
                    navLinks.forEach(link => {
                        link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
                    });
                }
            });
        }, { threshold: 0.3 });
        
        sections.forEach(section => observer.observe(section));
    },
    
    // Hero Slider
    initHeroSlider() {
        const swiperEl = document.querySelector('.hero-swiper');
        if (!swiperEl || typeof Swiper === 'undefined') return;
        
        new Swiper('.hero-swiper', {
            loop: true,
            autoplay: {
                delay: 4000,
                disableOnInteraction: false
            },
            effect: 'fade',
            fadeEffect: { crossFade: true },
            speed: 800,
            pagination: {
                el: '.hero-pagination',
                clickable: true
            },
            navigation: {
                nextEl: '.hero-next',
                prevEl: '.hero-prev'
            }
        });
    },
    
    // Scroll to Top
    initScrollToTop() {
        const btn = document.getElementById('scrollToTop');
        if (!btn) return;
        
        window.addEventListener('scroll', () => {
            btn.classList.toggle('visible', window.scrollY > 300);
        });
        
        btn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    },
    
    // AOS Animations
    initAOS() {
        if (typeof AOS !== 'undefined') {
            AOS.init({
                duration: 800,
                easing: 'ease-out-cubic',
                once: true,
                offset: 50
            });
        }
    },
    
    // Counter Animation
    animateCounters() {
        const counters = document.querySelectorAll('.stat-number');
        
        const animateCounter = (counter) => {
            const target = parseFloat(counter.dataset.count);
            const isDecimal = counter.dataset.decimal === 'true';
            const suffix = counter.dataset.suffix || '';
            const duration = 2000;
            const steps = 60;
            const increment = target / steps;
            let current = 0;
            
            const timer = setInterval(() => {
                current += increment;
                if (current >= target) {
                    current = target;
                    clearInterval(timer);
                }
                
                if (isDecimal) {
                    counter.textContent = current.toFixed(1).replace('.', '/') + suffix;
                } else {
                    counter.textContent = JalaliDate.toPersianNum(Math.floor(current).toLocaleString()) + suffix;
                }
            }, duration / steps);
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateCounter(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });
        
        counters.forEach(counter => observer.observe(counter));
    },
    
    // Match Card Renderer
    renderMatchCard(match, type = 'normal') {
        const isLive = match.fixture?.status?.short === 'LIVE' || match.fixture?.status?.short === 'HT';
        const status = match.fixture?.status;
        
        let statusHTML = '';
        if (isLive) {
            statusHTML = `
                <div class="match-status live">
                    <span class="live-dot"></span>
                    ${status.elapsed}' زنده
                </div>
            `;
        } else if (status?.short === 'NS') {
            const matchTime = new Date(match.fixture.date);
            statusHTML = `
                <div class="match-status">
                    <i class="far fa-clock"></i>
                    ${JalaliDate.toPersianNum(matchTime.getHours().toString().padStart(2, '0'))}:${JalaliDate.toPersianNum(matchTime.getMinutes().toString().padStart(2, '0'))}
                </div>
            `;
        } else {
            statusHTML = `<div class="match-status">پایان</div>`;
        }
        
        return `
            <div class="match-card ${isLive ? 'live' : ''}" onclick="Football.showMatchDetail(${match.fixture.id})" data-aos="fade-up">
                <div class="match-header">
                    <div class="match-league">
                        <img src="${match.league?.logo || ''}" alt="${match.league?.name || 'لیگ'}" onerror="this.style.display='none'">
                        <span class="match-league-name">${match.league?.name || 'نامشخص'}</span>
                    </div>
                    ${statusHTML}
                </div>
                
                <div class="match-teams">
                    <div class="team">
                        <img src="${match.teams?.home?.logo || ''}" alt="${match.teams?.home?.name || 'تیم'}" class="team-logo" onerror="this.src='https://via.placeholder.com/60?text=Home'">
                        <div class="team-name">${match.teams?.home?.name || 'تیم میزبان'}</div>
                    </div>
                    
                    <div class="match-score">
                        <div class="score-display">
                            <span>${match.goals?.home !== null ? JalaliDate.toPersianNum(match.goals.home) : '-'}</span>
                            <span class="score-divider">-</span>
                            <span>${match.goals?.away !== null ? JalaliDate.toPersianNum(match.goals.away) : '-'}</span>
                        </div>
                        <div class="match-time">
                            <i class="fas fa-map-marker-alt"></i>
                            ${match.fixture?.venue?.name || ''}
                        </div>
                    </div>
                    
                    <div class="team">
                        <img src="${match.teams?.away?.logo || ''}" alt="${match.teams?.away?.name || 'تیم'}" class="team-logo" onerror="this.src='https://via.placeholder.com/60?text=Away'">
                        <div class="team-name">${match.teams?.away?.name || 'تیم مهمان'}</div>
                    </div>
                </div>
                
                <div class="match-stats">
                    <div class="match-stat">
                        <div class="match-stat-label">برد میزبان</div>
                        <div class="match-stat-value">${JalaliDate.toPersianNum(Math.floor(Math.random() * 40 + 30))}٪</div>
                    </div>
                    <div class="match-stat">
                        <div class="match-stat-label">مساوی</div>
                        <div class="match-stat-value">${JalaliDate.toPersianNum(Math.floor(Math.random() * 20 + 20))}٪</div>
                    </div>
                    <div class="match-stat">
                        <div class="match-stat-label">برد مهمان</div>
                        <div class="match-stat-value">${JalaliDate.toPersianNum(Math.floor(Math.random() * 30 + 20))}٪</div>
                    </div>
                </div>
            </div>
        `;
    },
    
    // News Card Renderer
    renderNewsCard(article) {
        const date = new Date(article.publishedAt);
        const [jy, jm, jd] = JalaliDate.gregorianToJalali(date.getFullYear(), date.getMonth() + 1, date.getDate());
        
        return `
            <div class="news-card glass-card" data-aos="fade-up">
                <img src="${article.image || article.urlToImage || 'https://via.placeholder.com/400x200?text=News'}" 
                     alt="${article.title}" class="news-image" 
                     onerror="this.src='https://via.placeholder.com/400x200?text=Vochino+Sports'">
                <div class="news-content">
                    <span class="news-category">${article.source?.name || 'خبر'}</span>
                    <h3 class="news-title">${article.title}</h3>
                    <p class="news-excerpt">${article.description || ''}</p>
                    <div class="news-meta">
                        <span class="news-source">
                            <i class="fas fa-newspaper"></i>
                            ${article.source?.name || 'نامشخص'}
                        </span>
                        <span class="news-date">
                            <i class="far fa-calendar"></i>
                            ${JalaliDate.toPersianNum(`${jy}/${jm}/${jd}`)}
                        </span>
                    </div>
                </div>
            </div>
        `;
    },
    
    // League Table Renderer
    renderLeagueTable(standings, leagueName) {
        const tbody = document.getElementById('leagueTableBody');
        if (!tbody) return;
        
        if (!standings || standings.length === 0) {
            tbody.innerHTML = '<tr><td colspan="10"><div class="loading-container"><p>اطلاعاتی یافت نشد</p></div></td></tr>';
            return;
        }
        
        const data = standings[0]?.standings || standings;
        
        tbody.innerHTML = data.map((team, index) => {
            let positionClass = '';
            if (index < 4) positionClass = 'champions';
            else if (index < 6) positionClass = 'europa';
            else if (index >= data.length - 3) positionClass = 'relegation';
            
            return `
                <tr>
                    <td><span class="position-indicator ${positionClass}"></span>${JalaliDate.toPersianNum(team.rank)}</td>
                    <td>
                        <div class="team-cell">
                            <img src="${team.team?.logo || ''}" alt="${team.team?.name || 'تیم'}" onerror="this.style.display='none'">
                            <span>${team.team?.name || 'نامشخص'}</span>
                        </div>
                    </td>
                    <td>${JalaliDate.toPersianNum(team.all?.played || 0)}</td>
                    <td>${JalaliDate.toPersianNum(team.all?.win || 0)}</td>
                    <td>${JalaliDate.toPersianNum(team.all?.draw || 0)}</td>
                    <td>${JalaliDate.toPersianNum(team.all?.lose || 0)}</td>
                    <td>${JalaliDate.toPersianNum(team.all?.goals?.for || 0)}</td>
                    <td>${JalaliDate.toPersianNum(team.all?.goals?.against || 0)}</td>
                    <td>${JalaliDate.toPersianNum(team.goalsDiff || 0)}</td>
                    <td><strong>${JalaliDate.toPersianNum(team.points || 0)}</strong></td>
                </tr>
            `;
        }).join('');
        
        document.getElementById('currentLeagueTitle').textContent = leagueName;
    },
    
    // Show Loading
    showLoading(containerId, message = 'در حال بارگذاری...') {
        const container = document.getElementById(containerId);
        if (!container) return;
        container.innerHTML = `
            <div class="loading-container">
                <div class="loader-spinner"></div>
                <p>${message}</p>
            </div>
        `;
    },
    
    // Show Error
    showError(containerId, message = 'خطا در دریافت اطلاعات') {
        const container = document.getElementById(containerId);
        if (!container) return;
        container.innerHTML = `
            <div class="loading-container">
                <i class="fas fa-exclamation-triangle" style="font-size: 3rem; color: var(--warning-color);"></i>
                <p>${message}</p>
                <button class="btn btn-hero" onclick="location.reload()" style="margin-top: 1rem;">
                    <i class="fas fa-sync"></i> تلاش مجدد
                </button>
            </div>
        `;
    }
};

// === Football Module ===
const Football = {
    liveRefreshInterval: null,
    
    // Initialize Football Section
    async init() {
        await this.loadLiveMatches();
        await this.loadTodayMatches();
        await this.loadTomorrowMatches();
        await this.loadLeagueStandings(39, 'لیگ برتر انگلیس');
        
        // Auto refresh live matches
        this.startLiveRefresh();
    },
    
    // Start Live Refresh
    startLiveRefresh() {
        let countdown = 60;
        const timerEl = document.getElementById('refreshTimer');
        
        this.liveRefreshInterval = setInterval(() => {
            countdown--;
            if (timerEl) timerEl.textContent = `${countdown}s`;
            
            if (countdown <= 0) {
                this.loadLiveMatches();
                countdown = 60;
            }
        }, 1000);
    },
    
    // Load Live Matches
    async loadLiveMatches() {
        UI.showLoading('liveMatchesGrid', 'در حال دریافت مسابقات زنده...');
        
        try {
            const data = await APIService.footballRequest('fixtures', { live: 'all' });
            const matches = data.response || [];
            
            const grid = document.getElementById('liveMatchesGrid');
            if (!grid) return;
            
            if (matches.length === 0) {
                grid.innerHTML = `
                    <div class="loading-container">
                        <i class="fas fa-futbol" style="font-size: 3rem; color: var(--text-muted); margin-bottom: 1rem;"></i>
                        <p>در حال حاضر مسابقه زنده‌ای در جریان نیست</p>
                    </div>
                `;
                return;
            }
            
            grid.innerHTML = matches.slice(0, 6).map(match => UI.renderMatchCard(match, 'live')).join('');
            
            // Update stats
            document.getElementById('liveCount').textContent = JalaliDate.toPersianNum(matches.length);
            document.getElementById('goalCount').textContent = JalaliDate.toPersianNum(
                matches.reduce((sum, m) => sum + (m.goals?.home || 0) + (m.goals?.away || 0), 0)
            );
            
        } catch (error) {
            UI.showError('liveMatchesGrid', 'خطا در دریافت مسابقات زنده');
        }
    },
    
    // Load Today Matches
    async loadTodayMatches() {
        UI.showLoading('todayMatchesGrid', 'در حال دریافت مسابقات امروز...');
        
        try {
            const today = new Date().toISOString().split('T')[0];
            const data = await APIService.footballRequest('fixtures', { date: today });
            const matches = data.response || [];
            
            const grid = document.getElementById('todayMatchesGrid');
            if (!grid) return;
            
            if (matches.length === 0) {
                grid.innerHTML = '<div class="loading-container"><p>مسابقاتی برای امروز یافت نشد</p></div>';
                return;
            }
            
            grid.innerHTML = matches.slice(0, 9).map(match => UI.renderMatchCard(match, 'today')).join('');
            this.setupFilterTabs(matches);
            
        } catch (error) {
            UI.showError('todayMatchesGrid', 'خطا در دریافت مسابقات امروز');
        }
    },
    
    // Load Tomorrow Matches
    async loadTomorrowMatches() {
        UI.showLoading('tomorrowMatchesGrid', 'در حال دریافت مسابقات فردا...');
        
        try {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            const dateStr = tomorrow.toISOString().split('T')[0];
            
            const data = await APIService.footballRequest('fixtures', { date: dateStr });
            const matches = data.response || [];
            
            const grid = document.getElementById('tomorrowMatchesGrid');
            if (!grid) return;
            
            if (matches.length === 0) {
                grid.innerHTML = '<div class="loading-container"><p>مسابقاتی برای فردا یافت نشد</p></div>';
                return;
            }
            
            grid.innerHTML = matches.slice(0, 9).map(match => UI.renderMatchCard(match, 'tomorrow')).join('');
            
        } catch (error) {
            UI.showError('tomorrowMatchesGrid', 'خطا در دریافت مسابقات فردا');
        }
    },
    
    // Setup Filter Tabs
    setupFilterTabs(allMatches) {
        const tabs = document.querySelectorAll('.filter-tab');
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                
                const league = tab.dataset.league;
                const grid = document.getElementById('todayMatchesGrid');
                
                if (league === 'all') {
                    grid.innerHTML = allMatches.slice(0, 9).map(m => UI.renderMatchCard(m)).join('');
                } else {
                    const leagueId = CONFIG.LEAGUES[league];
                    const filtered = allMatches.filter(m => m.league?.id === leagueId);
                    grid.innerHTML = filtered.length > 0 
                        ? filtered.map(m => UI.renderMatchCard(m)).join('')
                        : '<div class="loading-container"><p>مسابقی در این لیگ یافت نشد</p></div>';
                }
            });
        });
    },
    
    // Load League Standings
    async loadLeagueStandings(leagueId, leagueName) {
        UI.showLoading('leagueTableBody', 'در حال دریافت جدول...');
        
        try {
            const season = new Date().getFullYear();
            const data = await APIService.footballRequest('standings', { 
                league: leagueId, 
                season: season 
            });
            
            UI.renderLeagueTable(data.response, leagueName);
            
        } catch (error) {
            UI.showError('leagueTableBody', 'خطا در دریافت جدول');
        }
    },
    
    // Show Match Detail Modal
    async showMatchDetail(fixtureId) {
        const modal = document.getElementById('matchDetailModal');
        const body = document.getElementById('matchModalBody');
        
        if (!modal || !body) return;
        
        modal.classList.add('active');
        body.innerHTML = '<div class="loading-container"><div class="loader-spinner"></div><p>در حال دریافت اطلاعات...</p></div>';
        
        try {
            const data = await APIService.footballRequest('fixtures', { id: fixtureId });
            const match = data.response[0];
            
            if (!match) {
                body.innerHTML = '<p>اطلاعات مسابقه یافت نشد</p>';
                return;
            }
            
            body.innerHTML = `
                <div class="modal-match-detail">
                    <div class="modal-match-header">
                        <div class="match-league">
                            <img src="${match.league?.logo || ''}" alt="">
                            <span>${match.league?.name || ''}</span>
                        </div>
                        <span class="match-status ${match.fixture?.status?.short === 'LIVE' ? 'live' : ''}">
                            ${match.fixture?.status?.long || ''}
                        </span>
                    </div>
                    
                    <div class="modal-match-teams">
                        <div class="team">
                            <img src="${match.teams?.home?.logo || ''}" class="team-logo" style="width: 80px; height: 80px;">
                            <div class="team-name">${match.teams?.home?.name || ''}</div>
                        </div>
                        <div class="match-score" style="padding: 0 2rem;">
                            <div class="score-display" style="font-size: 3rem;">
                                <span>${match.goals?.home !== null ? JalaliDate.toPersianNum(match.goals.home) : '-'}</span>
                                <span>-</span>
                                <span>${match.goals?.away !== null ? JalaliDate.toPersianNum(match.goals.away) : '-'}</span>
                            </div>
                        </div>
                        <div class="team">
                            <img src="${match.teams?.away?.logo || ''}" class="team-logo" style="width: 80px; height: 80px;">
                            <div class="team-name">${match.teams?.away?.name || ''}</div>
                        </div>
                    </div>
                    
                    <div class="modal-match-info glass-card">
                        <h3>اطلاعات مسابقه</h3>
                        <div class="info-grid">
                            <div><i class="fas fa-map-marker-alt"></i> ${match.fixture?.venue?.name || ''}</div>
                            <div><i class="far fa-calendar"></i> ${new Date(match.fixture?.date).toLocaleDateString('fa-IR')}</div>
                            <div><i class="far fa-clock"></i> ${new Date(match.fixture?.date).toLocaleTimeString('fa-IR', {hour: '2-digit', minute:'2-digit'})}</div>
                        </div>
                    </div>
                    
                    <div class="modal-match-promo glass-card">
                        <i class="fab fa-telegram-plane"></i>
                        <p>برای شرط‌بندی روی این مسابقه، از ربات تلگرام ووچینو استفاده کنید!</p>
                        <a href="${CONFIG.TELEGRAM_BOT}" target="_blank" class="btn btn-hero">
                            ورود به ربات
                        </a>
                    </div>
                </div>
            `;
            
        } catch (error) {
            body.innerHTML = '<p>خطا در دریافت اطلاعات مسابقه</p>';
        }
    },
    
    // Initialize League Buttons
    initLeagueButtons() {
        document.querySelectorAll('.league-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.league-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                const leagueId = parseInt(btn.dataset.leagueId);
                const leagueName = btn.querySelector('span').textContent;
                this.loadLeagueStandings(leagueId, leagueName);
            });
        });
    }
};

// === News Module ===
const News = {
    async init() {
        await this.loadNews();
        this.setupNewsTabs();
    },
    
    async loadNews() {
        UI.showLoading('newsGrid', 'در حال دریافت اخبار...');
        
        try {
            const data = await APIService.newsRequest('everything', {
                q: 'football soccer',
                language: 'fa',
                sortBy: 'publishedAt'
            });
            
            const articles = data.articles || data.data || [];
            const grid = document.getElementById('newsGrid');
            
            if (!grid) return;
            
            if (articles.length === 0) {
                grid.innerHTML = '<div class="loading-container"><p>اخباری یافت نشد</p></div>';
                return;
            }
            
            grid.innerHTML = articles.slice(0, 6).map(article => UI.renderNewsCard(article)).join('');
            
        } catch (error) {
            UI.showError('newsGrid', 'خطا در دریافت اخبار');
        }
    },
    
    setupNewsTabs() {
        document.querySelectorAll('.news-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.news-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                // Could filter news by category here
            });
        });
    }
};

// === Rules Module ===
const Rules = {
    init() {
        // All rule items are already clickable via onclick in HTML
    }
};

// Global function for rule toggle (called from HTML)
function toggleRule(header) {
    const item = header.parentElement;
    const isActive = item.classList.contains('active');
    
    // Close all other rules
    document.querySelectorAll('.rule-item').forEach(i => i.classList.remove('active'));
    
    // Toggle current
    if (!isActive) {
        item.classList.add('active');
    }
}

// === Training Module ===
const Training = {
    trainingData: {
        'voucher': {
            title: 'آموزش کامل ووچر',
            icon: 'fas fa-ticket-alt',
            content: `
                <h3>ووچر چیست؟</h3>
                <p>ووچر یک کد دیجیتالی است که مانند پول نقد در سایت‌های شرط‌بندی استفاده می‌شود. شما می‌توانید ووچر را از ووچینو خریداری کرده و در سایت‌های مختلف شارژ کنید.</p>
                
                <h3>مراحل خرید ووچر</h3>
                <ol>
                    <li>وارد ربات تلگرام @VochinoBot شوید</li>
                    <li>گزینه «خرید ووچر» را انتخاب کنید</li>
                    <li>مبلغ مورد نظر را تعیین کنید</li>
                    <li>روش پرداخت را انتخاب کنید</li>
                    <li>پرداخت را تکمیل کنید</li>
                    <li>کد ووچر به صورت خودکار ارسال می‌شود</li>
                </ol>
                
                <h3>نکات مهم</h3>
                <ul>
                    <li>هر ووچر فقط یک بار قابل استفاده است</li>
                    <li>ووچرها تاریخ انقضا دارند (معمولاً ۶ ماه)</li>
                    <li>کد ووچر را در مکان امنی ذخیره کنید</li>
                    <li>از خرید ووچر برای سایت‌های نامعتبر خودداری کنید</li>
                </ul>
                
                <div class="api-note">
                    <i class="fas fa-info-circle"></i>
                    برای خرید ووچر با بهترین نرخ، از ربات تلگرام ووچینو استفاده کنید.
                </div>
            `
        },
        'hot-voucher': {
            title: 'آموزش هات ووچر',
            icon: 'fas fa-fire',
            content: `
                <h3>هات ووچر چیست؟</h3>
                <p>هات ووچر نسخه پیشرفته و سریع‌تر ووچر معمولی است. با هات ووچر، تحویل آنی و نرخ بهتری دریافت می‌کنید.</p>
                
                <h3>مزایای هات ووچر</h3>
                <ul>
                    <li>تحویل آنی (کمتر از ۱ دقیقه)</li>
                    <li>نرخ تبدیل بهتر از ووچر معمولی</li>
                    <li>پشتیبانی از سایت‌های بیشتر</li>
                    <li>بدون محدودیت مبلغ</li>
                    <li>اولویت در پشتیبانی</li>
                </ul>
                
                <h3>چگونه هات ووچر بخریم؟</h3>
                <ol>
                    <li>وارد ربات تلگرام شوید</li>
                    <li>گزینه «هات ووچر» را انتخاب کنید</li>
                    <li>مبلغ و سایت مقصد را مشخص کنید</li>
                    <li>پرداخت را انجام دهید</li>
                    <li>ووچر به صورت آنی تحویل داده می‌شود</li>
                </ol>
            `
        },
        'premium-voucher': {
            title: 'آموزش پریمیوم ووچر',
            icon: 'fas fa-crown',
            content: `
                <h3>پریمیوم ووچر چیست؟</h3>
                <p>پریمیوم ووچر مخصوص کاربران ویژه است که مزایای بیشتری نسبت به ووچرهای معمولی دارد.</p>
                
                <h3>مزایای کاربران پریمیوم</h3>
                <ul>
                    <li>کارمزد کمتر</li>
                    <li>اولویت در پشتیبانی</li>
                    <li>بونوس ۱۰٪ در خریدهای بالای ۱۰۰۰ دلار</li>
                    <li>دسترسی به جشنواره‌های ویژه</li>
                    <li>تخفیف‌های اختصاصی</li>
                </ul>
                
                <h3>نحوه ارتقا به پریمیوم</h3>
                <ol>
                    <li>خرید مجموع بالای ۵۰۰۰ دلار در ماه</li>
                    <li>یا عضویت ماهانه پریمیوم</li>
                    <li>یا دعوت ۱۰ کاربر جدید</li>
                </ol>
            `
        },
        'ps-voucher': {
            title: 'آموزش PS Voucher',
            icon: 'fab fa-playstation',
            content: `
                <h3>PS Voucher چیست؟</h3>
                <p>PS Voucher کارت هدیه رسمی پلی‌استیشن است که برای خرید بازی، اشتراک PS Plus و آیتم‌های درون بازی استفاده می‌شود.</p>
                
                <h3>مراحل استفاده</h3>
                <ol>
                    <li>PS Voucher را از ربات خریداری کنید</li>
                    <li>وارد حساب PSN خود شوید</li>
                    <li>به PlayStation Store بروید</li>
                    <li>گزینه «Redeem Codes» را انتخاب کنید</li>
                    <li>کد ۱۲ رقمی را وارد کنید</li>
                    <li>مبلغ به حساب شما اضافه می‌شود</li>
                </ol>
                
                <h3>نکات مهم</h3>
                <ul>
                    <li>ریجن ووچر باید با ریجن حساب شما یکی باشد</li>
                    <li>کدها به حروف بزرگ و کوچک حساس نیستند</li>
                    <li>از کد در مکان امن نگهداری کنید</li>
                </ul>
            `
        },
        'tron': {
            title: 'آموزش ترون (TRX)',
            icon: 'fab fa-bitcoin',
            content: `
                <h3>ترون چیست؟</h3>
                <p>ترون (TRX) یک ارز دیجیتال محبوب با کارمزد پایین و سرعت بالا برای انتقال وجه است.</p>
                
                <h3>پرداخت با ترون</h3>
                <ol>
                    <li>در ربات، گزینه «پرداخت با ترون» را انتخاب کنید</li>
                    <li>آدرس کیف پول ترون ووچینو را دریافت کنید</li>
                    <li>از کیف پول خود ترون ارسال کنید</li>
                    <li>شبکه TRC-20 را حتماً انتخاب کنید</li>
                    <li>پس از تأیید، ووچر ارسال می‌شود</li>
                </ol>
                
                <h3>نکات مهم</h3>
                <ul>
                    <li>حتماً از شبکه TRC-20 استفاده کنید</li>
                    <li>حداقل کارمزد شبکه ۱ TRX است</li>
                    <li>تأیید تراکنش ۱ تا ۳ دقیقه طول می‌کشد</li>
                    <li>از صحت آدرس قبل از ارسال مطمئن شوید</li>
                </ul>
            `
        },
        'ton': {
            title: 'آموزش تون (TON)',
            icon: 'fas fa-gem',
            content: `
                <h3>تون کوین چیست؟</h3>
                <p>TON (Toncoin) ارز دیجیتال رسمی تلگرام با سرعت بسیار بالا و کارمزد ناچیز است.</p>
                
                <h3>پرداخت با TON</h3>
                <ol>
                    <li>در ربات، گزینه «پرداخت با TON» را انتخاب کنید</li>
                    <li>آدرس کیف پول TON ووچینو را دریافت کنید</li>
                    <li>از کیف پول Tonkeeper یا Wallet in Telegram استفاده کنید</li>
                    <li>TON را به آدرس اعلام شده ارسال کنید</li>
                    <li>پس از تأیید، ووچر تحویل داده می‌شود</li>
                </ol>
                
                <h3>مزایای TON</h3>
                <ul>
                    <li>کارمزد تقریباً صفر</li>
                    <li>تأیید در چند ثانیه</li>
                    <li>ادغام کامل با تلگرام</li>
                    <li>امنیت بسیار بالا</li>
                </ul>
            `
        }
    },
    
    init() {
        // Training buttons are handled via onclick in HTML
    }
};

// Global function for training modal
function openTrainingModal(type) {
    const modal = document.getElementById('trainingModal');
    const body = document.getElementById('trainingModalBody');
    
    if (!modal || !body) return;
    
    const data = Training.trainingData[type];
    if (!data) return;
    
    modal.classList.add('active');
    body.innerHTML = `
        <div class="training-modal-header">
            <div class="training-icon">
                <i class="${data.icon}"></i>
            </div>
            <h2>${data.title}</h2>
        </div>
        <div class="training-modal-content">
            ${data.content}
        </div>
        <div class="training-modal-footer">
            <a href="${CONFIG.TELEGRAM_BOT}" target="_blank" class="btn btn-hero">
                <i class="fab fa-telegram-plane"></i>
                خرید از ربات
            </a>
        </div>
    `;
}

function closeTrainingModal() {
    const modal = document.getElementById('trainingModal');
    if (modal) modal.classList.remove('active');
}

function closeMatchModal() {
    const modal = document.getElementById('matchDetailModal');
    if (modal) modal.classList.remove('active');
}

// === FAQ Module ===
const FAQ = {
    init() {
        this.setupSearch();
        this.setupCategories();
    },
    
    setupSearch() {
        const searchInput = document.getElementById('faqSearch');
        const searchBtn = document.querySelector('.search-btn');
        
        const search = () => {
            const query = searchInput.value.toLowerCase().trim();
            const items = document.querySelectorAll('.faq-item');
            const noResults = document.getElementById('noResults');
            let found = false;
            
            items.forEach(item => {
                const question = item.querySelector('.faq-q-text').textContent.toLowerCase();
                const answer = item.querySelector('.faq-answer').textContent.toLowerCase();
                
                if (question.includes(query) || answer.includes(query)) {
                    item.style.display = '';
                    found = true;
                } else {
                    item.style.display = 'none';
                }
            });
            
            if (noResults) {
                noResults.style.display = found ? 'none' : 'block';
            }
        };
        
        if (searchInput) {
            searchInput.addEventListener('input', search);
        }
        
        if (searchBtn) {
            searchBtn.addEventListener('click', search);
        }
    },
    
    setupCategories() {
        const buttons = document.querySelectorAll('.faq-cat-btn');
        const items = document.querySelectorAll('.faq-item');
        
        buttons.forEach(btn => {
            btn.addEventListener('click', () => {
                buttons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                const category = btn.dataset.category;
                
                items.forEach(item => {
                    if (category === 'all' || item.dataset.category === category) {
                        item.style.display = '';
                    } else {
                        item.style.display = 'none';
                    }
                });
            });
        });
    }
};

// Global function for FAQ toggle
function toggleFaq(button) {
    const item = button.parentElement;
    const isActive = item.classList.contains('active');
    
    // Close all other FAQs
    document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('active'));
    
    if (!isActive) {
        item.classList.add('active');
    }
}

function searchFAQ() {
    const input = document.getElementById('faqSearch');
    if (input) {
        input.dispatchEvent(new Event('input'));
    }
}

// === Utility Functions ===
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
    }
}

// === API Key Setup (for users) ===
const APISetup = {
    init() {
        // Check if API keys are set
        if (!CONFIG.API_FOOTBALL_KEY) {
            this.showAPIPrompt();
        }
    },
    
    showAPIPrompt() {
        // Create a subtle notification
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 20px;
            background: rgba(26, 31, 58, 0.95);
            backdrop-filter: blur(20px);
            border: 1px solid var(--primary-color);
            border-radius: 12px;
            padding: 1rem;
            max-width: 300px;
            z-index: 10000;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        `;
        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
                <i class="fas fa-info-circle" style="color: var(--primary-color);"></i>
                <strong style="color: var(--text-primary);">حالت دمو</strong>
            </div>
            <p style="color: var(--text-secondary); font-size: 0.85rem; margin-bottom: 0.5rem;">
                سایت در حالت دمو است. برای اطلاعات واقعی، API Key خود را تنظیم کنید.
            </p>
            <button onclick="APISetup.promptAPIKey()" style="
                width: 100%;
                padding: 0.5rem;
                background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
                border: none;
                border-radius: 6px;
                color: white;
                cursor: pointer;
                font-family: inherit;
            ">تنظیم API Key</button>
        `;
        document.body.appendChild(notification);
        
        // Auto-hide after 10 seconds
        setTimeout(() => notification.remove(), 10000);
    },
    
    promptAPIKey() {
        const key = prompt('API-Football Key خود را وارد کنید:\n(از https://www.api-football.com/ دریافت کنید)');
        if (key) {
            CONFIG.API_FOOTBALL_KEY = key;
            localStorage.setItem('API_FOOTBALL_KEY', key);
            alert('API Key ذخیره شد! صفحه را رفرش کنید.');
            location.reload();
        }
    }
};

// === Main Initialization ===
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Vochino Sports Initializing...');
    
    // Initialize all modules
    UI.initPreloader();
    UI.initClock();
    UI.initHeaderScroll();
    UI.initMobileMenu();
    UI.initActiveNav();
    UI.initHeroSlider();
    UI.initScrollToTop();
    UI.initAOS();
    UI.animateCounters();
    
    // Initialize feature modules
    Football.init();
    Football.initLeagueButtons();
    News.init();
    Rules.init();
    Training.init();
    FAQ.init();
    APISetup.init();
    
    console.log('✅ Vochino Sports Ready!');
});

// Close modals on ESC key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeTrainingModal();
        closeMatchModal();
    }
});

// Close modals on outside click
window.addEventListener('click', (e) => {
    const matchModal = document.getElementById('matchDetailModal');
    const trainingModal = document.getElementById('trainingModal');
    
    if (e.target === matchModal) closeMatchModal();
    if (e.target === trainingModal) closeTrainingModal();
});
