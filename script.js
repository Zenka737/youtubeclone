// ============================================================
// YouTube Clone — script.js (исправленная версия)
// ============================================================

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

// ===== ХРАНИЛИЩЕ =====
const STORAGE_KEYS = {
    customVideos: 'ytclone_custom_videos',
    likesPrefix: 'ytclone_likes_',
    viewsPrefix: 'ytclone_views_',
    theme: 'ytclone_theme'
};

function loadCustomVideos() {
    try {
        const raw = localStorage.getItem(STORAGE_KEYS.customVideos);
        return raw ? JSON.parse(raw) : [];
    } catch (e) {
        console.warn('Не удалось прочитать сохранённые видео:', e);
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

// Все видео = базовые + добавленные пользователем
let videos = [...defaultVideos, ...loadCustomVideos()];

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

// ===== РЕНДЕР ГРИДА =====
const videoGrid = document.getElementById('videoGrid');
const emptyState = document.getElementById('emptyState');

let activeCategory = 'all';
let searchQuery = '';

// Функция для получения актуальных данных видео (синхронизация)
function getVideoWithStats(video) {
    const likes = getLikes(video.id);
    const views = getViews(video.id, video.views);
    return { ...video, likes, views };
}

function renderVideos() {
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

        const card = document.createElement('div');
        card.className = 'video-card';
        card.dataset.id = video.id;

        card.innerHTML = `
            <div class="thumbnail" style="background:${video.color};">${video.emoji}</div>
            <div class="video-info">
                <h3>${escapeHtml(video.title)}</h3>
                <p>${escapeHtml(video.author)} • ${formatViews(videoData.views)}</p>
                <div class="video-actions">
                    <button class="like-btn ${liked ? 'liked' : ''}" data-id="${video.id}">❤️ <span class="like-count">${videoData.likes}</span></button>
                    <button class="views-btn" data-id="${video.id}">👁️ <span class="views-count">${videoData.views}</span></button>
                </div>
            </div>
        `;

        card.addEventListener('click', (e) => {
            if (e.target.closest('.like-btn') || e.target.closest('.views-btn')) return;
            openPlayer(video);
        });

        videoGrid.appendChild(card);
    });

    attachCardButtonHandlers();
}

function attachCardButtonHandlers() {
    document.querySelectorAll('.like-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
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
            
            // Обновляем лайк в модалке, если она открыта
            if (currentVideo && currentVideo.id === id) {
                modalLikeBtn.querySelector('.like-count').textContent = likes;
                modalLikeBtn.classList.toggle('liked', localStorage.getItem(likedKey) === '1');
            }
        });
    });

    document.querySelectorAll('.views-btn').forEach(btn => {
        btn.addEventListener('click', (e) => e.stopPropagation());
    });
}

// ===== КАТЕГОРИИ =====
document.querySelectorAll('.category-chip').forEach(chip => {
    chip.addEventListener('click', () => {
        document.querySelectorAll('.category-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        activeCategory = chip.dataset.category;
        renderVideos();
    });
});

// ===== ПОИСК =====
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');

function runSearch() {
    searchQuery = searchInput.value.trim();
    renderVideos();
}

searchBtn.addEventListener('click', runSearch);
searchInput.addEventListener('input', runSearch);

// ===== ТЁМНАЯ ТЕМА =====
const themeBtn = document.getElementById('themeBtn');

function applyTheme(isDark) {
    document.body.classList.toggle('dark-theme', isDark);
    themeBtn.textContent = isDark ? '☀️ Светлая тема' : '🌙 Тёмная тема';
}

themeBtn.addEventListener('click', () => {
    const isDark = !document.body.classList.contains('dark-theme');
    applyTheme(isDark);
    localStorage.setItem(STORAGE_KEYS.theme, isDark ? 'dark' : 'light');
});

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
    currentVideo = video;
    videoTitle.textContent = video.title;
    videoMeta.textContent = video.author;

    if (video.youtubeId) {
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
            <div class="placeholder-frame" style="background:${video.color}22;">
                <div style="font-size:64px;">${video.emoji}</div>
                <p>Демо-видео без ссылки на YouTube.</p>
                <p class="hint">Добавьте своё видео с реальной ссылкой через кнопку «➕ Добавить видео».</p>
            </div>`;
    }

    // Увеличиваем просмотры при открытии
    const views = getViews(video.id, video.views) + 1;
    setViews(video.id, views);

    const likes = getLikes(video.id);
    const liked = localStorage.getItem(STORAGE_KEYS.likesPrefix + video.id + '_liked') === '1';

    modalLikeBtn.querySelector('.like-count').textContent = likes;
    modalLikeBtn.classList.toggle('liked', liked);
    modalViewsBtn.querySelector('.views-count').textContent = views;

    videoPlayer.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    renderVideos(); // обновить все карточки
}

modalLikeBtn.addEventListener('click', () => {
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
    renderVideos(); // синхронизация с карточками
});

function closePlayer() {
    videoPlayer.style.display = 'none';
    document.body.style.overflow = 'auto';
    videoFrame.innerHTML = ''; // остановить видео
    // Обновляем просмотры в карточках после закрытия
    renderVideos();
    currentVideo = null;
}

closePlayerBtn.addEventListener('click', closePlayer);
videoPlayer.addEventListener('click', (e) => {
    if (e.target === videoPlayer) closePlayer();
});

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

addVideoBtn.addEventListener('click', () => {
    addVideoModal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
});

closeAddVideoBtn.addEventListener('click', closeAddVideoModal);
addVideoModal.addEventListener('click', (e) => {
    if (e.target === addVideoModal) closeAddVideoModal();
});

function closeAddVideoModal() {
    addVideoModal.style.display = 'none';
    document.body.style.overflow = 'auto';
    addVideoForm.reset();
    // Сбрасываем ошибки валидации
    const titleInput = document.getElementById('newTitle');
    titleInput.style.borderColor = '';
}

addVideoForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const title = document.getElementById('newTitle').value.trim();
    const url = document.getElementById('newUrl').value.trim();
    const category = document.getElementById('newCategory').value;
    const author = document.getElementById('newAuthor').value.trim() || 'Аноним';

    // Усиленная валидация
    if (!title) {
        const titleInput = document.getElementById('newTitle');
        titleInput.style.borderColor = '#ff0000';
        titleInput.focus();
        alert('Пожалуйста, введите название видео');
        return;
    }

    if (title.length < 2) {
        alert('Название должно содержать минимум 2 символа');
        return;
    }

    const youtubeId = extractYouTubeId(url);
    const newVideo = {
        id: 'custom_' + Date.now(),
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

    videos = [...defaultVideos, ...custom];
    closeAddVideoModal();
    activeCategory = 'all';
    document.querySelectorAll('.category-chip').forEach(c => c.classList.remove('active'));
    document.querySelector('.category-chip[data-category="all"]').classList.add('active');
    renderVideos();
    
    // Уведомление об успехе
    console.log('✅ Видео добавлено:', newVideo.title);
});

// ===== ЗАКРЫТИЕ ПО ESC =====
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        if (videoPlayer.style.display === 'flex') closePlayer();
        if (addVideoModal.style.display === 'flex') closeAddVideoModal();
    }
});

// ===== СТАРТ =====
renderVideos();
console.log('🎬 YouTube Clone успешно загружен!');