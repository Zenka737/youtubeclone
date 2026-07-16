// ============================================================
// YouTube Clone — script.js (без console методов)
// ============================================================

// ===== ХРАНИЛИЩЕ =====
const STORAGE_KEYS = {
    customVideos: 'ytclone_custom_videos',
    likesPrefix: 'ytclone_likes_',
    viewsPrefix: 'ytclone_views_',
    theme: 'ytclone_theme',
    viewedVideos: 'ytclone_viewed_videos',
    authorPrefix: 'ytclone_author_'
};

// ===== БАЗОВЫЕ ВИДЕО =====
const defaultVideos = [
    {
        id: '1',
        title: 'Как сделать клон YouTube за час',
        author: 'Канал разработчика',
        category: 'programming',
        emoji: '▶️',
        color: '#6c5ce7',
        youtubeId: null,
        views: 1250
    },
    {
        id: '2',
        title: 'JavaScript с нуля: полный курс',
        author: 'Школа программиста',
        category: 'programming',
        emoji: '🎯',
        color: '#00b894',
        youtubeId: null,
        views: 3400
    },
    {
        id: '3',
        title: 'Figma за 30 минут: основы дизайна',
        author: 'UX/UI дизайнер',
        category: 'design',
        emoji: '🎨',
        color: '#fdcb6e',
        youtubeId: null,
        views: 890
    },
    {
        id: '4',
        title: 'React Hooks: полное руководство',
        author: 'Frontend-блогер',
        category: 'programming',
        emoji: '⚛️',
        color: '#e17055',
        youtubeId: null,
        views: 2100
    },
    {
        id: '5',
        title: 'Лучшие лоу-фай биты для учёбы',
        author: 'Music Lounge',
        category: 'music',
        emoji: '🎵',
        color: '#0984e3',
        youtubeId: null,
        views: 5600
    },
    {
        id: '6',
        title: 'Смешные моменты со съёмок',
        author: 'Bloopers Channel',
        category: 'entertainment',
        emoji: '😂',
        color: '#d63031',
        youtubeId: null,
        views: 4200
    }
];

// ===== ФУНКЦИИ РАБОТЫ С ХРАНИЛИЩЕМ =====
function loadCustomVideos() {
    try {
        const raw = localStorage.getItem(STORAGE_KEYS.customVideos);
        return raw ? JSON.parse(raw) : [];
    } catch (e) {
        // console.warn('Не удалось прочитать сохранённые видео:', e);
        return [];
    }
}

function saveCustomVideos(videos) {
    localStorage.setItem(STORAGE_KEYS.customVideos, JSON.stringify(videos));
}

function getLikes(videoId) {
    return parseInt(localStorage.getItem(STORAGE_KEYS.likesPrefix + videoId) || '0', 10);
}

function setLikes(videoId, count) {
    localStorage.setItem(STORAGE_KEYS.likesPrefix + videoId, String(count));
}

function getViews(videoId, fallback) {
    const raw = localStorage.getItem(STORAGE_KEYS.viewsPrefix + videoId);
    return raw !== null ? parseInt(raw, 10) : fallback;
}

function setViews(videoId, count) {
    localStorage.setItem(STORAGE_KEYS.viewsPrefix + videoId, String(count));
}

function getVideoAuthor(videoId) {
    return localStorage.getItem(STORAGE_KEYS.authorPrefix + videoId) || null;
}

function setVideoAuthor(videoId, author) {
    localStorage.setItem(STORAGE_KEYS.authorPrefix + videoId, author);
}

function hasUserViewed(videoId) {
    const viewed = JSON.parse(localStorage.getItem(STORAGE_KEYS.viewedVideos) || '[]');
    return viewed.includes(videoId);
}

function markAsViewed(videoId) {
    const viewed = JSON.parse(localStorage.getItem(STORAGE_KEYS.viewedVideos) || '[]');
    if (!viewed.includes(videoId)) {
        viewed.push(videoId);
        localStorage.setItem(STORAGE_KEYS.viewedVideos, JSON.stringify(viewed));
    }
}

function removeFromViewed(videoId) {
    let viewed = JSON.parse(localStorage.getItem(STORAGE_KEYS.viewedVideos) || '[]');
    viewed = viewed.filter(id => id !== videoId);
    localStorage.setItem(STORAGE_KEYS.viewedVideos, JSON.stringify(viewed));
}

// ===== ИНИЦИАЛИЗАЦИЯ =====
defaultVideos.forEach(video => {
    if (!localStorage.getItem(STORAGE_KEYS.authorPrefix + video.id)) {
        setVideoAuthor(video.id, video.author);
    }
});

defaultVideos.forEach(video => {
    if (!localStorage.getItem(STORAGE_KEYS.viewsPrefix + video.id)) {
        setViews(video.id, video.views);
    }
});

function getAllVideos() {
    return [...defaultVideos, ...loadCustomVideos()];
}

let videos = getAllVideos();

// ===== УТИЛИТЫ =====
function extractYouTubeId(url) {
    if (!url) return null;
    const patterns = [
        /(?:youtube\.com\/watch\?v=)([\w-]{11})/,
        /(?:youtu\.be\/)([\w-]{11})/,
        /(?:youtube\.com\/embed\/)([\w-]{11})/,
        /(?:youtube\.com\/shorts\/)([\w-]{11})/
    ];
    for (const re of patterns) {
        const match = url.match(re);
        if (match) return match[1];
    }
    return null;
}

function formatViews(n) {
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace('.0', '') + ' млн просмотров';
    if (n >= 1_000) return (n / 1_000).toFixed(1).replace('.0', '') + ' тыс. просмотров';
    return n + ' просмотров';
}

function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

function generateId() {
    return 'custom_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
}

// ===== УВЕДОМЛЕНИЯ =====
function showNotification(message, type = 'success') {
    const oldNotification = document.querySelector('.notification');
    if (oldNotification) oldNotification.remove();
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        padding: 12px 24px;
        background: ${type === 'success' ? '#4CAF50' : '#ff4444'};
        color: white;
        border-radius: 8px;
        z-index: 9999;
        font-size: 16px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        animation: slideIn 0.3s ease-out;
        max-width: 300px;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transition = 'opacity 0.3s';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

if (!document.querySelector('#notification-style')) {
    const style = document.createElement('style');
    style.id = 'notification-style';
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
    `;
    document.head.appendChild(style);
}

// ===== РЕНДЕР ГРИДА =====
const videoGrid = document.getElementById('videoGrid');
const emptyState = document.getElementById('emptyState');

let activeCategory = 'all';
let searchQuery = '';

function getVideoWithStats(video) {
    const likes = getLikes(video.id);
    const views = getViews(video.id, video.views || 0);
    const author = getVideoAuthor(video.id) || video.author || 'Аноним';
    return { ...video, likes, views, author };
}

function renderVideos() {
    videos = getAllVideos();
    
    const filtered = videos.filter(v => {
        const matchesCategory = activeCategory === 'all' || v.category === activeCategory;
        const matchesSearch = v.title.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    videoGrid.innerHTML = '';
    emptyState.style.display = filtered.length === 0 ? 'block' : 'none';

    filtered.forEach(video => {
        const videoData = getVideoWithStats(video);
        const liked = localStorage.getItem(STORAGE_KEYS.likesPrefix + video.id + '_liked') === '1';
        const isViewed = hasUserViewed(video.id);

        const card = document.createElement('div');
        card.className = 'video-card';
        card.dataset.id = video.id;

        card.innerHTML = `
            <div class="thumbnail" style="background:${video.color};">${video.emoji}</div>
            <div class="video-info">
                <h3>${escapeHtml(video.title)}${isViewed ? ' <span style="color:#999;font-size:12px;">✓ просмотрено</span>' : ''}</h3>
                <p>${escapeHtml(videoData.author)} • ${formatViews(videoData.views)}</p>
                <div class="video-actions">
                    <button class="like-btn ${liked ? 'liked' : ''}" data-id="${video.id}">❤️ <span class="like-count">${videoData.likes}</span></button>
                    <button class="views-btn" data-id="${video.id}">👁️ <span class="views-count">${videoData.views}</span></button>
                    ${video.id.startsWith('custom_') ? `<button class="delete-btn" data-id="${video.id}">🗑️</button>` : ''}
                </div>
            </div>
        `;

        card.addEventListener('click', (e) => {
            if (e.target.closest('.like-btn') || e.target.closest('.views-btn') || e.target.closest('.delete-btn')) return;
            openPlayer(video);
        });

        videoGrid.appendChild(card);
    });

    attachCardButtonHandlers();
}

function attachCardButtonHandlers() {
    document.querySelectorAll('.like-btn').forEach(btn => {
        btn.removeEventListener('click', btn._listener);
        btn._listener = (e) => {
            e.stopPropagation();
            const id = btn.dataset.id;
            const likedKey = STORAGE_KEYS.likesPrefix + id + '_liked';
            const alreadyLiked = localStorage.getItem(likedKey) === '1';
            let likes = getLikes(id);

            if (alreadyLiked) {
                likes = Math.max(0, likes - 1);
                localStorage.removeItem(likedKey);
                btn.classList.remove('liked');
            } else {
                likes += 1;
                localStorage.setItem(likedKey, '1');
                btn.classList.add('liked');
            }
            setLikes(id, likes);
            btn.querySelector('.like-count').textContent = likes;
            
            if (currentVideo && currentVideo.id === id) {
                modalLikeBtn.querySelector('.like-count').textContent = likes;
                modalLikeBtn.classList.toggle('liked', localStorage.getItem(likedKey) === '1');
            }
        };
        btn.addEventListener('click', btn._listener);
    });

    document.querySelectorAll('.views-btn').forEach(btn => {
        btn.removeEventListener('click', btn._listener);
        btn._listener = (e) => e.stopPropagation();
        btn.addEventListener('click', btn._listener);
    });

    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.removeEventListener('click', btn._listener);
        btn._listener = (e) => {
            e.stopPropagation();
            const id = btn.dataset.id;
            if (confirm('Удалить это видео?')) {
                deleteVideo(id);
            }
        };
        btn.addEventListener('click', btn._listener);
    });
}

// ===== УДАЛЕНИЕ ВИДЕО =====
function deleteVideo(videoId) {
    let custom = loadCustomVideos();
    custom = custom.filter(v => v.id !== videoId);
    saveCustomVideos(custom);
    
    localStorage.removeItem(STORAGE_KEYS.likesPrefix + videoId);
    localStorage.removeItem(STORAGE_KEYS.viewsPrefix + videoId);
    localStorage.removeItem(STORAGE_KEYS.likesPrefix + videoId + '_liked');
    localStorage.removeItem(STORAGE_KEYS.authorPrefix + videoId);
    
    removeFromViewed(videoId);
    
    videos = getAllVideos();
    renderVideos();
    showNotification('🗑️ Видео удалено');
}

// ===== КАТЕГОРИИ =====
document.querySelectorAll('.category-chip').forEach(chip => {
    chip.removeEventListener('click', chip._listener);
    chip._listener = () => {
        document.querySelectorAll('.category-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        activeCategory = chip.dataset.category;
        
        searchInput.value = '';
        searchQuery = '';
        
        renderVideos();
    };
    chip.addEventListener('click', chip._listener);
});

// ===== ПОИСК =====
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');

function runSearch() {
    searchQuery = searchInput.value.trim();
    renderVideos();
}

searchBtn.removeEventListener('click', searchBtn._listener);
searchBtn._listener = runSearch;
searchBtn.addEventListener('click', searchBtn._listener);

searchInput.removeEventListener('input', searchInput._listener);
searchInput._listener = runSearch;
searchInput.addEventListener('input', searchInput._listener);

// ===== ТЁМНАЯ ТЕМА =====
const themeBtn = document.getElementById('themeBtn');
let themeTimeout = null;

function applyTheme(isDark) {
    document.body.classList.toggle('dark-theme', isDark);
    themeBtn.textContent = isDark ? '☀️ Светлая тема' : '🌙 Тёмная тема';
}

themeBtn.removeEventListener('click', themeBtn._listener);
themeBtn._listener = () => {
    if (themeTimeout) return;
    
    const isDark = !document.body.classList.contains('dark-theme');
    applyTheme(isDark);
    localStorage.setItem(STORAGE_KEYS.theme, isDark ? 'dark' : 'light');
    
    themeTimeout = setTimeout(() => {
        themeTimeout = null;
    }, 300);
};
themeBtn.addEventListener('click', themeBtn._listener);

(function initTheme() {
    const saved = localStorage.getItem(STORAGE_KEYS.theme);
    if (saved) {
        applyTheme(saved === 'dark');
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        applyTheme(true);
    }
})();

// ===== ПЛЕЕР =====
const videoPlayer = document.getElementById('videoPlayer');
const videoTitle = document.getElementById('videoTitle');
const videoMeta = document.getElementById('videoMeta');
const videoFrame = document.getElementById('videoFrame');
const closePlayerBtn = document.getElementById('closePlayer');
const modalLikeBtn = document.getElementById('modalLikeBtn');
const modalViewsBtn = document.getElementById('modalViewsBtn');

let currentVideo = null;

function openPlayer(video) {
    if (!video || !video.id) {
        showNotification('⚠️ Ошибка загрузки видео', 'error');
        return;
    }
    
    currentVideo = video;
    videoTitle.textContent = video.title || 'Без названия';
    videoMeta.textContent = video.author || 'Неизвестный автор';

    if (video.youtubeId && video.youtubeId.length === 11) {
        videoFrame.innerHTML = `
            <iframe
                width="100%" height="100%"
                src="https://www.youtube.com/embed/${video.youtubeId}"
                title="${escapeHtml(video.title)}"
                frameborder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowfullscreen>
            </iframe>`;
    } else {
        videoFrame.innerHTML = `
            <div class="placeholder-frame" style="background:${video.color || '#333'}22;">
                <div style="font-size:64px;">${video.emoji || '🎬'}</div>
                <p>${video.youtubeId ? '⚠️ Неверный ID видео' : 'Демо-видео без ссылки на YouTube'}</p>
                <p class="hint">Добавьте своё видео с реальной ссылкой через кнопку «➕ Добавить видео».</p>
            </div>`;
    }

    if (!hasUserViewed(video.id)) {
        const views = getViews(video.id, video.views || 0) + 1;
        setViews(video.id, views);
        markAsViewed(video.id);
    }

    const likes = getLikes(video.id);
    const liked = localStorage.getItem(STORAGE_KEYS.likesPrefix + video.id + '_liked') === '1';

    modalLikeBtn.querySelector('.like-count').textContent = likes;
    modalLikeBtn.classList.toggle('liked', liked);
    modalViewsBtn.querySelector('.views-count').textContent = getViews(video.id, video.views || 0);

    videoPlayer.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    renderVideos();
}

modalLikeBtn.removeEventListener('click', modalLikeBtn._listener);
modalLikeBtn._listener = () => {
    if (!currentVideo) return;
    const id = currentVideo.id;
    const likedKey = STORAGE_KEYS.likesPrefix + id + '_liked';
    const alreadyLiked = localStorage.getItem(likedKey) === '1';
    let likes = getLikes(id);

    if (alreadyLiked) {
        likes = Math.max(0, likes - 1);
        localStorage.removeItem(likedKey);
        modalLikeBtn.classList.remove('liked');
    } else {
        likes += 1;
        localStorage.setItem(likedKey, '1');
        modalLikeBtn.classList.add('liked');
    }
    setLikes(id, likes);
    modalLikeBtn.querySelector('.like-count').textContent = likes;
    renderVideos();
};
modalLikeBtn.addEventListener('click', modalLikeBtn._listener);

function closePlayer() {
    videoPlayer.style.display = 'none';
    document.body.style.overflow = 'auto';
    videoFrame.innerHTML = '';
    renderVideos();
    currentVideo = null;
}

closePlayerBtn.removeEventListener('click', closePlayerBtn._listener);
closePlayerBtn._listener = closePlayer;
closePlayerBtn.addEventListener('click', closePlayerBtn._listener);

videoPlayer.removeEventListener('click', videoPlayer._listener);
videoPlayer._listener = (e) => {
    if (e.target === videoPlayer) closePlayer();
};
videoPlayer.addEventListener('click', videoPlayer._listener);

// ===== ДОБАВЛЕНИЕ СВОЕГО ВИДЕО =====
const addVideoBtn = document.getElementById('addVideoBtn');
const addVideoModal = document.getElementById('addVideoModal');
const closeAddVideoBtn = document.getElementById('closeAddVideo');
const addVideoForm = document.getElementById('addVideoForm');

const emojiByCategory = {
    programming: '💻',
    design: '🎨',
    music: '🎵',
    entertainment: '🎬',
    other: '📌'
};
const colorByCategory = {
    programming: '#6c5ce7',
    design: '#fdcb6e',
    music: '#0984e3',
    entertainment: '#d63031',
    other: '#636e72'
};

addVideoBtn.removeEventListener('click', addVideoBtn._listener);
addVideoBtn._listener = () => {
    addVideoModal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
};
addVideoBtn.addEventListener('click', addVideoBtn._listener);

closeAddVideoBtn.removeEventListener('click', closeAddVideoBtn._listener);
closeAddVideoBtn._listener = closeAddVideoModal;
closeAddVideoBtn.addEventListener('click', closeAddVideoBtn._listener);

addVideoModal.removeEventListener('click', addVideoModal._listener);
addVideoModal._listener = (e) => {
    if (e.target === addVideoModal) closeAddVideoModal();
};
addVideoModal.addEventListener('click', addVideoModal._listener);

function closeAddVideoModal() {
    addVideoModal.style.display = 'none';
    document.body.style.overflow = 'auto';
    addVideoForm.reset();
    document.getElementById('newTitle').style.borderColor = '';
}

addVideoForm.removeEventListener('submit', addVideoForm._listener);
addVideoForm._listener = (e) => {
    e.preventDefault();

    const title = document.getElementById('newTitle').value.trim();
    const url = document.getElementById('newUrl').value.trim();
    const category = document.getElementById('newCategory').value;
    const author = document.getElementById('newAuthor').value.trim() || 'Аноним';

    if (!title) {
        const titleInput = document.getElementById('newTitle');
        titleInput.style.borderColor = '#ff0000';
        titleInput.focus();
        showNotification('⚠️ Введите название видео', 'error');
        return;
    }

    if (title.length < 2) {
        showNotification('⚠️ Название должно быть минимум 2 символа', 'error');
        return;
    }

    const allVideos = getAllVideos();
    if (allVideos.some(v => v.title.toLowerCase() === title.toLowerCase())) {
        showNotification('⚠️ Видео с таким названием уже есть', 'error');
        return;
    }

    const youtubeId = extractYouTubeId(url);
    
    if (url && !youtubeId) {
        if (!confirm('⚠️ Ссылка на YouTube не распознана. Видео будет добавлено без плеера. Продолжить?')) {
            return;
        }
    }

    const newVideo = {
        id: generateId(),
        title,
        author,
        category,
        emoji: emojiByCategory[category] || '📌',
        color: colorByCategory[category] || '#636e72',
        youtubeId,
        views: 0
    };

    const custom = loadCustomVideos();
    custom.unshift(newVideo);
    saveCustomVideos(custom);
    
    setVideoAuthor(newVideo.id, author);

    videos = getAllVideos();
    closeAddVideoModal();
    activeCategory = 'all';
    document.querySelectorAll('.category-chip').forEach(c => c.classList.remove('active'));
    document.querySelector('.category-chip[data-category="all"]').classList.add('active');
    renderVideos();
    
    showNotification('✅ Видео "' + title + '" добавлено!');
};
addVideoForm.addEventListener('submit', addVideoForm._listener);

// ===== ЗАКРЫТИЕ ПО ESC =====
document.removeEventListener('keydown', document._listener);
document._listener = (e) => {
    if (e.key === 'Escape') {
        if (videoPlayer.style.display === 'flex') closePlayer();
        if (addVideoModal.style.display === 'flex') closeAddVideoModal();
    }
};
document.addEventListener('keydown', document._listener);

// ===== СТАРТ =====
renderVideos();
// console.log('🎬 YouTube Clone успешно загружен! (полностью исправленная версия)');