// ===== ТЁМНАЯ ТЕМА =====
const themeBtn = document.getElementById('themeBtn');
themeBtn.addEventListener('click', () => {
    document.body.classList.toggle('dark-theme');
    themeBtn.textContent = document.body.classList.contains('dark-theme') 
        ? '☀️ Светлая тема' 
        : '🌙 Тёмная тема';
});

// ===== ПОИСК =====
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const videoCards = document.querySelectorAll('.video-card');

function filterVideos() {
    const query = searchInput.value.toLowerCase().trim();
    videoCards.forEach(card => {
        const title = card.dataset.title.toLowerCase();
        card.style.display = title.includes(query) ? 'block' : 'none';
    });
}

searchBtn.addEventListener('click', filterVideos);
searchInput.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') filterVideos();
});

// ===== ЛАЙКИ (хранятся в localStorage) =====
document.querySelectorAll('.like-btn').forEach(btn => {
    const videoId = btn.closest('.video-card').dataset.id;
    const countSpan = btn.querySelector('.like-count');
    
    // Восстанавливаем лайки
    const savedLikes = localStorage.getItem(`likes_${videoId}`);
    if (savedLikes) {
        countSpan.textContent = savedLikes;
    }

    btn.addEventListener('click', (e) => {
        e.stopPropagation(); // Чтобы не открывался плеер
        let count = parseInt(countSpan.textContent);
        count += 1;
        countSpan.textContent = count;
        localStorage.setItem(`likes_${videoId}`, count);
        btn.classList.add('liked');
    });
});

// ===== ОТКРЫТИЕ ПЛЕЕРА =====
const videoPlayer = document.getElementById('videoPlayer');
const videoTitle = document.getElementById('videoTitle');
const videoFrame = document.getElementById('videoFrame');
const closePlayerBtn = document.getElementById('closePlayer');

videoCards.forEach(card => {
    card.addEventListener('click', () => {
        const title = card.querySelector('h3').textContent;
        const thumbnail = card.querySelector('.thumbnail').textContent;
        
        videoTitle.textContent = title;
        // Здесь можно вставить iframe с YouTube, если есть ссылка
        videoFrame.innerHTML = `
            <div style="text-align:center; padding: 20px;">
                <div style="font-size: 64px; margin-bottom: 10px;">${thumbnail}</div>
                <p style="color: #aaa;">Сюда можно вставить iframe с YouTube-видео</p>
                <p style="color: #666; font-size: 14px;">Например: <br>
                &lt;iframe src="https://www.youtube.com/embed/ID"&gt;&lt;/iframe&gt;</p>
            </div>
        `;
        videoPlayer.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    });
});

// Закрытие плеера
closePlayerBtn.addEventListener('click', closePlayer);
videoPlayer.addEventListener('click', (e) => {
    if (e.target === videoPlayer) closePlayer();
});

function closePlayer() {
    videoPlayer.style.display = 'none';
    document.body.style.overflow = 'auto';
}

// ===== СЧЁТЧИКИ ПРОСМОТРОВ (добавляем при открытии) =====
document.querySelectorAll('.views-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const countSpan = btn.querySelector('.views-count');
        let count = parseInt(countSpan.textContent);
        count += 1;
        countSpan.textContent = count;
        // Можно сохранять в localStorage
    });
});

console.log('🎬 YouTube Clone успешно загружен!');