// ============================================================
// YouTubeClone — script.js
// localStorage: лайки, просмотры, подписки, история, видео
// ============================================================

// ===== БАЗОВЫЕ ВИДЕО =====
const DEFAULT_VIDEOS = [
    {
        id: '1',
        title: 'Как сделать клон YouTube за час',
        author: 'Канал разработчика',
        category: 'programming',
        emoji: '▶️',
        color: '#6c5ce7',
        youtubeId: null,
        views: 1250,
        description: 'Полный туториал по созданию YouTube-клона на чистом HTML, CSS и JavaScript без фреймворков.',
        uploadedAt: Date.now() - 7 * 86400000
    },
    {
        id: '2',
        title: 'JavaScript с нуля: полный курс за 4 часа',
        author: 'Школа программиста',
        category: 'programming',
        emoji: '🎯',
        color: '#00b894',
        youtubeId: null,
        views: 3400,
        description: 'Изучи JavaScript с абсолютного нуля. Переменные, функции, массивы, объекты, асинхронность.',
        uploadedAt: Date.now() - 14 * 86400000
    },
    {
        id: '3',
        title: 'Figma за 30 минут: основы UI/UX дизайна',
        author: 'UX/UI дизайнер',
        category: 'design',
        emoji: '🎨',
        color: '#fdcb6e',
        youtubeId: null,
        views: 890,
        description: 'Быстрый старт в Figma: создание компонентов, автолейаут, прототипирование.',
        uploadedAt: Date.now() - 3 * 86400000
    },
    {
        id: '4',
        title: 'React Hooks: полное руководство 2024',
        author: 'Frontend-блогер',
        category: 'programming',
        emoji: '⚛️',
        color: '#e17055',
        youtubeId: null,
        views: 2100,
        description: 'useState, useEffect, useContext, useReducer, useMemo, useCallback — всё в одном видео.',
        uploadedAt: Date.now() - 21 * 86400000
    },
    {
        id: '5',
        title: 'Лучшие лоу-фай биты для учёбы 2024',
        author: 'Music Lounge',
        category: 'music',
        emoji: '🎵',
        color: '#0984e3',
        youtubeId: null,
        views: 5600,
        description: '3 часа расслабляющей музыки для концентрации и продуктивной работы.',
        uploadedAt: Date.now() - 2 * 86400000
    },
    {
        id: '6',
        title: 'Топ-10 смешных моментов со съёмок',
        author: 'Bloopers Channel',
        category: 'entertainment',
        emoji: '😂',
        color: '#d63031',
        youtubeId: null,
        views: 4200,
        description: 'Лучшие приколы и неловкие моменты за 2024 год. Смотреть всем!',
        uploadedAt: Date.now() - 5 * 86400000
    },
    {
        id: '7',
        title: 'Minecraft: строим мегагород с нуля',
        author: 'GameMaster Pro',
        category: 'gaming',
        emoji: '🎮',
        color: '#55a630',
        youtubeId: null,
        views: 7800,
        description: 'Эпический билд-таймлапс. 72 часа работы сжаты в 40 минут.',
        uploadedAt: Date.now() - 10 * 86400000
    },
    {
        id: '8',
        title: 'Лучшие голы Лиги Чемпионов 2024',
        author: 'Football Highlights',
        category: 'sport',
        emoji: '⚽',
        color: '#1e90ff',
        youtubeId: null,
        views: 12500,
        description: 'Все самые красивые голы групповой стадии Лиги Чемпионов этого сезона.',
        uploadedAt: Date.now() - 1 * 86400000
    }
];

// ===== STORAGE =====
const KEYS = {
    custom: 'ytc_custom',
    likes: 'ytc_likes_',
    liked: 'ytc_liked_',
    views: 'ytc_views_',
    subs: 'ytc_subs',
    history: 'ytc_history',
    theme: 'ytc_theme',
    viewed: 'ytc_viewed',
};

function store(key, val) {
    localStorage.setItem(key, JSON.stringify(val));
}
function load(key, fallback) {
    try {
        const raw = localStorage.getItem(key);
        return raw !== null ? JSON.parse(raw) : fallback;
    } catch (_e) {
        return fallback;
    }
}

function getLikes(id) { return load(KEYS.likes + id, 0); }
function setLikes(id, n) { store(KEYS.likes + id, n); }
function isLiked(id) { return load(KEYS.liked + id, false); }
function setLiked(id, v) { store(KEYS.liked + id, v); }
function getViews(id, fallback) { return load(KEYS.views + id, fallback); }
function setViews(id, n) { store(KEYS.views + id, n); }
function hasViewed(id) { return load(KEYS.viewed, []).indexOf(id) !== -1; }
function markViewed(id) {
    var v = load(KEYS.viewed, []);
    if (v.indexOf(id) === -1) { v.push(id); store(KEYS.viewed, v); }
}
function getSubscriptions() { return load(KEYS.subs, []); }
function isSubscribed(channel) { return getSubscriptions().includes(channel); }
function toggleSubscription(channel) {
    const subs = getSubscriptions();
    const idx = subs.indexOf(channel);
    if (idx === -1) { subs.push(channel); }
    else { subs.splice(idx, 1); }
    store(KEYS.subs, subs);
    return idx === -1;
}
function getHistory() { return load(KEYS.history, []); }
function addToHistory(id) {
    const h = getHistory().filter(function(x) { return x !== id; });
    h.unshift(id);
    store(KEYS.history, h.slice(0, 100));
}
function loadCustomVideos() { return load(KEYS.custom, []); }
function saveCustomVideos(arr) { store(KEYS.custom, arr); }

// ===== СОСТОЯНИЕ =====
var allVideos = DEFAULT_VIDEOS.concat(loadCustomVideos());
var activeCategory = 'all';
var searchQuery = '';
var activeSection = 'home';
var currentVideo = null;

// ===== УТИЛИТЫ =====
function escapeHtml(str) {
    var d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
}

function extractYouTubeId(url) {
    if (!url) return null;
    var patterns = [
        /[?&]v=([\w-]{11})/,
        /youtu\.be\/([\w-]{11})/,
        /embed\/([\w-]{11})/,
        /shorts\/([\w-]{11})/,
    ];
    for (var i = 0; i < patterns.length; i++) {
        var m = url.match(patterns[i]);
        if (m) return m[1];
    }
    return null;
}

function formatViews(n) {
    if (n >= 1000000) return (n / 1000000).toFixed(1).replace('.0', '') + ' млн';
    if (n >= 1000) return (n / 1000).toFixed(1).replace('.0', '') + ' тыс.';
    return String(n);
}

function timeAgo(ts) {
    var diff = Date.now() - ts;
    var min = Math.floor(diff / 60000);
    var hr = Math.floor(diff / 3600000);
    var day = Math.floor(diff / 86400000);
    var mo = Math.floor(day / 30);
    var yr = Math.floor(day / 365);
    if (yr >= 1) return yr + ' ' + plural(yr, 'год', 'года', 'лет') + ' назад';
    if (mo >= 1) return mo + ' ' + plural(mo, 'месяц', 'месяца', 'месяцев') + ' назад';
    if (day >= 1) return day + ' ' + plural(day, 'день', 'дня', 'дней') + ' назад';
    if (hr >= 1) return hr + ' ' + plural(hr, 'час', 'часа', 'часов') + ' назад';
    if (min >= 1) return min + ' мин. назад';
    return 'только что';
}

function plural(n, a, b, c) {
    var m = n % 100;
    if (m >= 11 && m <= 19) return c;
    var d = n % 10;
    if (d === 1) return a;
    if (d >= 2 && d <= 4) return b;
    return c;
}

function avatarColor(name) {
    var colors = ['#e17055','#6c5ce7','#00b894','#0984e3','#d63031','#fd79a8','#fdcb6e','#00cec9'];
    var h = 0;
    for (var i = 0; i < name.length; i++) { h = (h * 31 + name.charCodeAt(i)) >>> 0; }
    return colors[h % colors.length];
}

function showToast(msg) {
    var t = document.getElementById('toast');
    t.textContent = msg;
    t.classList.add('show');
    setTimeout(function() { t.classList.remove('show'); }, 2500);
}

// ===== РЕНДЕР КАРТОЧЕК =====
function getFiltered() {
    if (activeSection === 'history') {
        var hist = getHistory();
        return hist.map(function(id) {
            return allVideos.find(function(v) { return v.id === id; });
        }).filter(Boolean);
    }
    if (activeSection === 'liked') {
        return allVideos.filter(function(v) { return isLiked(v.id); });
    }
    if (activeSection === 'my-channel') {
        var custom = loadCustomVideos();
        var ids = {};
        custom.forEach(function(v) { ids[v.id] = true; });
        return allVideos.filter(function(v) { return ids[v.id]; });
    }
    if (activeSection === 'subscriptions') {
        var subs = getSubscriptions();
        return allVideos.filter(function(v) { return subs.indexOf(v.author) !== -1; });
    }
    return allVideos.filter(function(v) {
        var cat = activeCategory === 'all' || v.category === activeCategory;
        var q = !searchQuery ||
            v.title.toLowerCase().indexOf(searchQuery.toLowerCase()) !== -1 ||
            v.author.toLowerCase().indexOf(searchQuery.toLowerCase()) !== -1;
        return cat && q;
    });
}

function renderVideos() {
    var grid = document.getElementById('videoGrid');
    var empty = document.getElementById('emptyState');
    var filtered = getFiltered();

    grid.innerHTML = '';

    if (filtered.length === 0) {
        empty.style.display = 'flex';
        empty.innerHTML = '<span class="empty-icon">🔎</span><span>Ничего не найдено</span>';
        return;
    }
    empty.style.display = 'none';

    var isMyChannel = activeSection === 'my-channel';

    filtered.forEach(function(video) {
        var views = getViews(video.id, video.views);
        var likes = getLikes(video.id);
        var liked = isLiked(video.id);
        var ago = timeAgo(video.uploadedAt || Date.now());
        var avatarBg = avatarColor(video.author);
        var initial = video.author[0].toUpperCase();

        var card = document.createElement('div');
        card.className = 'video-card';
        card.dataset.id = video.id;

        var watched = hasViewed(video.id);

        card.innerHTML =
            '<div class="card-thumb" style="background:' + video.color + ';">' +
                '<span>' + video.emoji + '</span>' +
                (watched ? '<div class="card-watched">✓</div>' : '') +
                '<div class="card-duration">▶ демо</div>' +
            '</div>' +
            '<div class="card-body">' +
                '<div class="card-avatar" style="background:' + avatarBg + ';">' + initial + '</div>' +
                '<div class="card-info">' +
                    '<div class="card-title">' + escapeHtml(video.title) + '</div>' +
                    '<div class="card-channel">' + escapeHtml(video.author) + '</div>' +
                    '<div class="card-meta">' + formatViews(views) + ' просмотров · ' + ago + '</div>' +
                '</div>' +
            '</div>' +
            '<div class="card-actions-row">' +
                '<button class="card-like-btn' + (liked ? ' liked' : '') + '" data-id="' + video.id + '">' +
                    '👍 <span class="like-count">' + likes + '</span>' +
                '</button>' +
                '<button class="card-views-btn" data-id="' + video.id + '">' +
                    '👁 ' + formatViews(views) +
                '</button>' +
                (isMyChannel ? '<button class="card-delete-btn" data-id="' + video.id + '" title="Удалить">🗑</button>' : '') +
            '</div>';

        (function(v) {
            card.querySelector('.card-thumb').addEventListener('click', function() { openPlayer(v); });
            card.querySelector('.card-title').addEventListener('click', function() { openPlayer(v); });
            card.querySelector('.card-like-btn').addEventListener('click', function(e) {
                e.stopPropagation();
                toggleLike(v.id, card.querySelector('.card-like-btn'), card.querySelector('.like-count'));
            });
            if (isMyChannel) {
                card.querySelector('.card-delete-btn').addEventListener('click', function(e) {
                    e.stopPropagation();
                    deleteVideo(v.id);
                });
            }
        })(video);

        grid.appendChild(card);
    });
}

function toggleLike(id, btn, countEl) {
    var liked = isLiked(id);
    var n = getLikes(id);
    if (liked) {
        n = Math.max(0, n - 1);
        setLiked(id, false);
        btn.classList.remove('liked');
    } else {
        n += 1;
        setLiked(id, true);
        btn.classList.add('liked');
    }
    setLikes(id, n);
    if (countEl) countEl.textContent = n;

    if (currentVideo && currentVideo.id === id) {
        document.getElementById('modalLikeCount').textContent = n;
        document.getElementById('modalLikeBtn').classList.toggle('liked', !liked);
    }
}

function deleteVideo(id) {
    if (!confirm('Удалить видео? Это действие нельзя отменить.')) return;
    var custom = loadCustomVideos().filter(function(v) { return v.id !== id; });
    saveCustomVideos(custom);
    allVideos = DEFAULT_VIDEOS.concat(custom);
    localStorage.removeItem(KEYS.likes + id);
    localStorage.removeItem(KEYS.liked + id);
    localStorage.removeItem(KEYS.views + id);
    renderVideos();
    showToast('Видео удалено');
}

// ===== ПЛЕЕР =====
var playerOverlay = document.getElementById('playerOverlay');

function openPlayer(video) {
    currentVideo = video;
    var views = getViews(video.id, video.views);
    if (!hasViewed(video.id)) {
        views += 1;
        setViews(video.id, views);
        markViewed(video.id);
    }
    addToHistory(video.id);

    document.getElementById('playerTitle').textContent = video.title;
    document.getElementById('playerChannel').textContent = video.author;
    document.getElementById('playerSubs').textContent =
        allVideos.filter(function(v) { return v.author === video.author; }).length + ' видео';

    var avatarEl = document.getElementById('playerAvatar');
    avatarEl.textContent = video.author[0].toUpperCase();
    avatarEl.style.background = avatarColor(video.author);

    var subBtn = document.getElementById('subscribeBtn');
    var subbed = isSubscribed(video.author);
    subBtn.textContent = subbed ? 'Отписаться' : 'Подписаться';
    subBtn.classList.toggle('subscribed', subbed);

    document.getElementById('playerDescription').textContent = video.description || '';
    document.getElementById('playerViews').textContent = formatViews(views) + ' просмотров';
    document.getElementById('playerDate').textContent = timeAgo(video.uploadedAt || Date.now());

    var likes = getLikes(video.id);
    document.getElementById('modalLikeCount').textContent = likes;
    document.getElementById('modalLikeBtn').classList.toggle('liked', isLiked(video.id));

    var isOwn = loadCustomVideos().some(function(v) { return v.id === video.id; });
    document.getElementById('modalDeleteBtn').style.display = isOwn ? '' : 'none';

    var frame = document.getElementById('videoFrame');
    if (video.youtubeId) {
        frame.innerHTML = '<iframe src="https://www.youtube.com/embed/' + video.youtubeId + '?autoplay=1"' +
            ' title="' + escapeHtml(video.title) + '" frameborder="0"' +
            ' allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"' +
            ' allowfullscreen></iframe>';
    } else {
        frame.innerHTML = '<div class="placeholder-frame" style="background:' + video.color + '22;">' +
            '<div class="ph-emoji">' + video.emoji + '</div>' +
            '<p>Демо-видео. Добавьте YouTube-ссылку при загрузке.</p>' +
            '</div>';
    }

    playerOverlay.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    renderVideos();
}

function closePlayer() {
    playerOverlay.style.display = 'none';
    document.body.style.overflow = '';
    document.getElementById('videoFrame').innerHTML = '';
    currentVideo = null;
    renderVideos();
}

document.getElementById('closePlayer').addEventListener('click', closePlayer);
playerOverlay.addEventListener('click', function(e) { if (e.target === playerOverlay) closePlayer(); });

document.getElementById('modalLikeBtn').addEventListener('click', function() {
    if (!currentVideo) return;
    toggleLike(currentVideo.id,
        document.getElementById('modalLikeBtn'),
        document.getElementById('modalLikeCount'));
});

document.getElementById('modalDislikeBtn').addEventListener('click', function() { showToast('👎 Отмечено'); });

document.getElementById('modalShareBtn').addEventListener('click', function() {
    if (!currentVideo) return;
    var link = currentVideo.youtubeId
        ? 'https://youtu.be/' + currentVideo.youtubeId
        : window.location.href;
    document.getElementById('shareLink').value = link;
    document.getElementById('shareToast').classList.remove('visible');
    document.getElementById('shareOverlay').style.display = 'flex';
});

document.getElementById('modalDeleteBtn').addEventListener('click', function() {
    if (!currentVideo) return;
    var id = currentVideo.id;
    closePlayer();
    deleteVideo(id);
});

document.getElementById('subscribeBtn').addEventListener('click', function() {
    if (!currentVideo) return;
    var now = toggleSubscription(currentVideo.author);
    var btn = document.getElementById('subscribeBtn');
    btn.textContent = now ? 'Отписаться' : 'Подписаться';
    btn.classList.toggle('subscribed', now);
    showToast(now
        ? 'Вы подписались на "' + currentVideo.author + '"'
        : 'Вы отписались от "' + currentVideo.author + '"');
});

// ===== ЗАГРУЗКА ВИДЕО =====
var uploadOverlay = document.getElementById('uploadOverlay');
var selectedEmoji = '🎬';
var selectedColor = '#6c5ce7';

document.getElementById('uploadBtn').addEventListener('click', openUpload);
document.getElementById('cancelUpload').addEventListener('click', closeUpload);
document.getElementById('closeUpload').addEventListener('click', closeUpload);
uploadOverlay.addEventListener('click', function(e) { if (e.target === uploadOverlay) closeUpload(); });

function openUpload() {
    selectedEmoji = '🎬';
    selectedColor = '#6c5ce7';
    updateThumbPreview();
    document.getElementById('uploadForm').reset();
    document.getElementById('titleCount').textContent = '0/100';
    document.getElementById('descCount').textContent = '0/500';
    document.getElementById('uploadTitle').classList.remove('error');
    document.querySelectorAll('.emoji-opt').forEach(function(b) { b.classList.remove('selected'); });
    document.querySelectorAll('.color-opt').forEach(function(b) { b.classList.remove('selected'); });
    document.querySelector('.emoji-opt[data-emoji="🎬"]').classList.add('selected');
    document.querySelector('.color-opt[data-color="#6c5ce7"]').classList.add('selected');
    uploadOverlay.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function closeUpload() {
    uploadOverlay.style.display = 'none';
    document.body.style.overflow = '';
}

function updateThumbPreview() {
    document.getElementById('thumbEmoji').textContent = selectedEmoji;
    document.getElementById('thumbPreview').style.background = selectedColor;
}

document.getElementById('emojiGrid').addEventListener('click', function(e) {
    var btn = e.target.closest('.emoji-opt');
    if (!btn) return;
    selectedEmoji = btn.dataset.emoji;
    document.querySelectorAll('.emoji-opt').forEach(function(b) { b.classList.remove('selected'); });
    btn.classList.add('selected');
    updateThumbPreview();
});

document.getElementById('colorGrid').addEventListener('click', function(e) {
    var btn = e.target.closest('.color-opt');
    if (!btn) return;
    selectedColor = btn.dataset.color;
    document.querySelectorAll('.color-opt').forEach(function(b) { b.classList.remove('selected'); });
    btn.classList.add('selected');
    updateThumbPreview();
});

var titleInput = document.getElementById('uploadTitle');
var descInput = document.getElementById('uploadDesc');
titleInput.addEventListener('input', function() {
    document.getElementById('titleCount').textContent = titleInput.value.length + '/100';
    titleInput.classList.remove('error');
});
descInput.addEventListener('input', function() {
    document.getElementById('descCount').textContent = descInput.value.length + '/500';
});

document.getElementById('uploadForm').addEventListener('submit', function(e) {
    e.preventDefault();
    var title = titleInput.value.trim();
    if (!title || title.length < 2) {
        titleInput.classList.add('error');
        titleInput.focus();
        showToast('Введите название (минимум 2 символа)');
        return;
    }

    var titleLower = title.toLowerCase();
    if (allVideos.some(function(v) { return v.title.toLowerCase() === titleLower; })) {
        titleInput.classList.add('error');
        titleInput.focus();
        showToast('Видео с таким названием уже существует');
        return;
    }

    var url = document.getElementById('uploadUrl').value.trim();
    var category = document.getElementById('uploadCategory').value;
    var author = document.getElementById('uploadAuthor').value.trim() || 'Мой канал';
    var description = descInput.value.trim();
    var youtubeId = extractYouTubeId(url);

    if (url && !youtubeId) {
        if (!confirm('Ссылка на YouTube не распознана. Видео будет добавлено без плеера. Продолжить?')) {
            return;
        }
    }

    var newVideo = {
        id: 'c_' + Date.now(),
        title: title,
        author: author,
        category: category,
        emoji: selectedEmoji,
        color: selectedColor,
        youtubeId: youtubeId,
        views: 0,
        description: description,
        uploadedAt: Date.now(),
    };

    var custom = loadCustomVideos();
    custom.unshift(newVideo);
    saveCustomVideos(custom);
    allVideos = DEFAULT_VIDEOS.concat(custom);

    closeUpload();
    activeSection = 'home';
    activeCategory = 'all';
    searchQuery = '';
    updateSidebarActive('all');
    updateChips('all');
    renderVideos();
    showToast('✅ Видео опубликовано!');
});

// ===== ПОДЕЛИТЬСЯ =====
document.getElementById('closeShare').addEventListener('click', function() {
    document.getElementById('shareOverlay').style.display = 'none';
});
document.getElementById('shareOverlay').addEventListener('click', function(e) {
    if (e.target === document.getElementById('shareOverlay'))
        document.getElementById('shareOverlay').style.display = 'none';
});
document.getElementById('copyLinkBtn').addEventListener('click', function() {
    var inp = document.getElementById('shareLink');
    navigator.clipboard.writeText(inp.value).catch(function() {
        inp.select();
        document.execCommand('copy');
    });
    var t = document.getElementById('shareToast');
    t.classList.add('visible');
    setTimeout(function() { t.classList.remove('visible'); }, 2000);
});

// ===== КАТЕГОРИИ / ЧИПСЫ =====
document.getElementById('chipsBar').addEventListener('click', function(e) {
    var chip = e.target.closest('.chip');
    if (!chip) return;
    activeCategory = chip.dataset.category;
    activeSection = 'home';
    searchQuery = '';
    document.getElementById('searchInput').value = '';
    updateChips(activeCategory);
    updateSidebarActive('all');
    renderVideos();
});

function updateChips(cat) {
    document.querySelectorAll('.chip').forEach(function(c) {
        c.classList.toggle('active', c.dataset.category === cat);
    });
}

// ===== SIDEBAR =====
document.querySelectorAll('.sidebar-item').forEach(function(item) {
    item.addEventListener('click', function(e) {
        e.preventDefault();
        var cat = item.dataset.category;
        var sec = item.dataset.section;

        document.querySelectorAll('.sidebar-item').forEach(function(i) { i.classList.remove('active'); });
        item.classList.add('active');

        if (cat) {
            activeCategory = cat;
            activeSection = 'home';
            searchQuery = '';
            document.getElementById('searchInput').value = '';
            updateChips(cat);
        } else if (sec) {
            activeSection = sec;
            activeCategory = 'all';
            searchQuery = '';
            document.getElementById('searchInput').value = '';
            updateChips('all');
        }

        renderVideos();

        if (window.innerWidth <= 900) {
            document.getElementById('sidebar').classList.remove('open');
        }
    });
});

function updateSidebarActive(key) {
    document.querySelectorAll('.sidebar-item').forEach(function(i) {
        i.classList.toggle('active',
            i.dataset.category === key ||
            (key === 'all' && i.dataset.category === 'all'));
    });
}

// ===== МЕНЮ БУРГЕР =====
document.getElementById('menuBtn').addEventListener('click', function() {
    var sb = document.getElementById('sidebar');
    if (window.innerWidth <= 900) {
        sb.classList.toggle('open');
    } else {
        sb.classList.toggle('collapsed');
        var ml = sb.classList.contains('collapsed') ? '0' : '';
        document.querySelector('.main-content').style.marginLeft = ml;
        document.querySelector('.footer').style.marginLeft = ml;
    }
});

// ===== ПОИСК =====
var searchInput = document.getElementById('searchInput');
searchInput.addEventListener('input', function() {
    searchQuery = searchInput.value.trim();
    activeSection = 'home';
    renderVideos();
});
document.getElementById('searchBtn').addEventListener('click', function() {
    searchQuery = searchInput.value.trim();
    activeSection = 'home';
    renderVideos();
});

// ===== ТЕМА =====
(function initTheme() {
    var saved = load(KEYS.theme, null);
    var prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    var isDark = saved !== null ? saved : prefersDark;
    if (isDark) document.body.classList.add('dark');
    document.getElementById('themeBtn').textContent = isDark ? '☀️' : '🌙';
})();

document.getElementById('themeBtn').addEventListener('click', function() {
    var isDark = document.body.classList.toggle('dark');
    store(KEYS.theme, isDark);
    document.getElementById('themeBtn').textContent = isDark ? '☀️' : '🌙';
});

// ===== ESC =====
document.addEventListener('keydown', function(e) {
    if (e.key !== 'Escape') return;
    if (playerOverlay.style.display === 'flex') { closePlayer(); return; }
    if (uploadOverlay.style.display === 'flex') { closeUpload(); return; }
    if (document.getElementById('shareOverlay').style.display === 'flex') {
        document.getElementById('shareOverlay').style.display = 'none';
    }
});

// ===== СТАРТ =====
renderVideos();
console.log('🎬 YouTubeClone загружен');
