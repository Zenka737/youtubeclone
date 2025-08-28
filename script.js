class YouTubeClone {
    constructor() {
        this.currentUser = null;
        this.currentVideo = null;
        this.init();
    }

    init() {
        this.loadUsers();
        this.loadVideos();
        this.setupEventListeners();
        this.showPage('mainPage');
    }

    // LocalStorage management
    loadUsers() {
        if (!localStorage.getItem('users')) {
            localStorage.setItem('users', JSON.stringify({}));
        }
    }

    loadVideos() {
        if (!localStorage.getItem('videos')) {
            localStorage.setItem('videos', JSON.stringify([]));
        }
        if (!localStorage.getItem('likes')) {
            localStorage.setItem('likes', JSON.stringify({}));
        }
        if (!localStorage.getItem('comments')) {
            localStorage.setItem('comments', JSON.stringify({}));
        }
        if (!localStorage.getItem('views')) {
            localStorage.setItem('views', JSON.stringify({}));
        }
        if (!localStorage.getItem('videoAuthors')) {
            localStorage.setItem('videoAuthors', JSON.stringify({}));
        }
    }

    // User management
    registerUser(username, password, avatarFile) {
        const users = JSON.parse(localStorage.getItem('users'));
        if (users[username]) {
            this.showMessage('Username already exists!', 'error');
            return false;
        }

        // Хэширование пароля
        const hashedPassword = CryptoJS.SHA256(password).toString();
        users[username] = { password: hashedPassword };

        // Сохранение аватарки
        if (avatarFile) {
            this.saveAvatar(username, avatarFile);
        }

        localStorage.setItem('users', JSON.stringify(users));
        this.showMessage('Registration successful! Please login.', 'success');
        return true;
    }

    loginUser(username, password) {
        const users = JSON.parse(localStorage.getItem('users'));
        const hashedPassword = CryptoJS.SHA256(password).toString();
        
        if (users[username] && users[username].password === hashedPassword) {
            this.currentUser = username;
            localStorage.setItem('currentUser', username);
            this.updateUI();
            this.showMessage('Login successful!', 'success');
            return true;
        }
        
        this.showMessage('Invalid username or password!', 'error');
        return false;
    }

    logout() {
        this.currentUser = null;
        localStorage.removeItem('currentUser');
        this.updateUI();
        this.showMessage('You have been logged out.', 'success');
    }

    // Video management
    uploadVideo(videoFile) {
        const videoName = videoFile.name.split('.')[0];
        const videos = JSON.parse(localStorage.getItem('videos'));
        
        // Проверяем, существует ли видео
        if (videos.includes(videoName)) {
            this.showMessage('Video already exists!', 'error');
            return false;
        }

        // Сохраняем видео информацию
        videos.push(videoName);
        localStorage.setItem('videos', JSON.stringify(videos));

        // Сохраняем автора
        const videoAuthors = JSON.parse(localStorage.getItem('videoAuthors'));
        videoAuthors[videoName] = this.currentUser;
        localStorage.setItem('videoAuthors', JSON.stringify(videoAuthors));

        // Сохраняем файл видео
        this.saveVideo(videoFile);

        this.showMessage('Video uploaded successfully!', 'success');
        this.loadVideosList();
        return true;
    }

    likeVideo(videoName) {
        const likes = JSON.parse(localStorage.getItem('likes'));
        if (!likes[videoName]) {
            likes[videoName] = 0;
        }
        likes[videoName]++;
        localStorage.setItem('likes', JSON.stringify(likes));
        this.showMessage('Liked!', 'success');
        this.updateVideoStats();
    }

    addComment(videoName, comment) {
        const comments = JSON.parse(localStorage.getItem('comments'));
        if (!comments[videoName]) {
            comments[videoName] = [];
        }
        comments[videoName].push(`${this.currentUser}: ${comment}`);
        localStorage.setItem('comments', JSON.stringify(comments));
        this.showMessage('Comment added!', 'success');
        this.loadComments(videoName);
    }

    incrementViews(videoName) {
        const views = JSON.parse(localStorage.getItem('views'));
        if (!views[videoName]) {
            views[videoName] = 0;
        }
        views[videoName]++;
        localStorage.setItem('views', JSON.stringify(views));
    }

    // File handling
    saveAvatar(username, file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            localStorage.setItem(`avatar_${username}`, e.target.result);
        }
        reader.readAsDataURL(file);
    }

    saveVideo(file) {
        // В реальном приложении здесь бы было сохранение на сервер
        // Для демонстрации сохраняем только имя файла
        console.log('Video file would be saved:', file.name);
    }

    getAvatar(username) {
        const avatar = localStorage.getItem(`avatar_${username}`);
        return avatar || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAiIGhlaWdodD0iMzAiIHZpZXdCb3g9IjAgMCAzMCAzMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTUiIGN5PSIxNSIgcj0iMTUiIGZpbGw9IiM2NjYiLz4KPHBhdGggZD0iTTE1IDhDMTMuMzQzMSA4IDEyIDkuMzQzMTUgMTIgMTFDMTIgMTIuNjU2OSAxMy4zNDMxIDE0IDE1IDE0QzE2LjY1NjkgMTQgMTggMTIuNjU2OSAxOCAxMUMxOCA5LjM0MzE1IDE2LjY1NjkgOCAxNSA4Wk0xNSAxNS41QzEyLjUxMTUgMTUuNSAxMC41IDE3LjAxMTUgMTAuNSAxOUMxMC41IDE5LjgyODQgMTEuMTcxNiAyMC41IDEyIDIwLjVIMThDMTguODI4NCAyMC41IDE5LjUgMTkuODI4NCAxOS41IDE5QzE5LjUgMTcuMDExNSAxNy40ODg1IDE1LjUgMTUgMTUuNVoiIGZpbGw9IndoaXRlIi8+Cjwvc3ZnPgo=';
    }

    // UI management
    showPage(pageId) {
        document.querySelectorAll('[id$="Page"]').forEach(page => {
            page.style.display = 'none';
        });
        document.getElementById(pageId).style.display = 'block';
    }

    showMessage(message, type) {
        const messagesDiv = document.getElementById('messages');
        const messageDiv = document.createElement('div');
        messageDiv.className = type;
        messageDiv.textContent = message;
        messagesDiv.appendChild(messageDiv);
        
        setTimeout(() => {
            messageDiv.remove();
        }, 3000);
    }

    updateUI() {
        const userInfo = document.getElementById('userInfo');
        const usernameSpan = document.getElementById('username');
        const userAvatar = document.getElementById('userAvatar');
        const loginLink = document.getElementById('loginLink');
        const registerLink = document.getElementById('registerLink');
        const logoutLink = document.getElementById('logoutLink');
        const uploadLink = document.getElementById('uploadLink');

        if (this.currentUser) {
            userInfo.style.display = 'flex';
            usernameSpan.textContent = this.currentUser;
            userAvatar.src = this.getAvatar(this.currentUser);
            loginLink.style.display = 'none';
            registerLink.style.display = 'none';
            logoutLink.style.display = 'block';
            uploadLink.style.display = 'block';
        } else {
            userInfo.style.display = 'none';
            loginLink.style.display = 'block';
            registerLink.style.display = 'block';
            logoutLink.style.display = 'none';
            uploadLink.style.display = 'none';
        }
    }

    loadVideosList() {
        const videoGrid = document.getElementById('videoGrid');
        const videos = JSON.parse(localStorage.getItem('videos'));
        const likes = JSON.parse(localStorage.getItem('likes'));
        const comments = JSON.parse(localStorage.getItem('comments'));
        const views = JSON.parse(localStorage.getItem('views'));
        const videoAuthors = JSON.parse(localStorage.getItem('videoAuthors'));

        videoGrid.innerHTML = '';

        videos.forEach(videoName => {
            const videoCard = document.createElement('div');
            videoCard.className = 'video-card';
            videoCard.onclick = () => this.showVideo(videoName);

            videoCard.innerHTML = `
                <div class="video-thumbnail">
                    <video muted>
                        <source src="#" type="video/mp4">
                    </video>
                </div>
                <div class="video-info">
                    <div class="video-title">${videoName}</div>
                    <div class="video-stats">
                        <span>👁️ ${views[videoName] || 0}</span> | 
                        <span>👍 ${likes[videoName] || 0}</span> | 
                        <span>💬 ${comments && comments[videoName] ? comments[videoName].length : 0}</span>
                    </div>
                    ${videoAuthors[videoName] ? `
                        <div class="video-author">
                            <img src="${this.getAvatar(videoAuthors[videoName])}" class="avatar" style="width:20px;height:20px;">
                            ${videoAuthors[videoName]}
                        </div>
                    ` : ''}
                </div>
            `;

            videoGrid.appendChild(videoCard);
        });
    }

    showVideo(videoName) {
        this.currentVideo = videoName;
        this.incrementViews(videoName);
        
        const videoTitle = document.getElementById('videoTitle');
        const videoPlayer = document.getElementById('videoPlayer');
        const likeButton = document.getElementById('likeButton');
        const commentsCount = document.getElementById('commentsCount');
        const videoAuthor = document.getElementById('videoAuthor');
        const videoViews = document.getElementById('videoViews');

        const likes = JSON.parse(localStorage.getItem('likes'));
        const views = JSON.parse(localStorage.getItem('views'));
        const videoAuthors = JSON.parse(localStorage.getItem('videoAuthors'));
        const comments = JSON.parse(localStorage.getItem('comments'));

        videoTitle.textContent = videoName;
        videoPlayer.innerHTML = `<source src="#" type="video/mp4">`;
        likeButton.textContent = `👍 Like (${likes[videoName] || 0})`;
        likeButton.onclick = (e) => {
            e.preventDefault();
            this.likeVideo(videoName);
            likeButton.textContent = `👍 Like (${likes[videoName] || 0})`;
        };
        
        videoViews.textContent = `👁️ ${views[videoName] || 0} views`;
        commentsCount.textContent = comments && comments[videoName] ? comments[videoName].length : 0;

        if (videoAuthors[videoName]) {
            videoAuthor.innerHTML = `
                <img src="${this.getAvatar(videoAuthors[videoName])}" class="avatar" style="width:30px;height:30px;">
                <span>Posted by: ${videoAuthors[videoName]}</span>
            `;
            videoAuthor.style.display = 'flex';
        } else {
            videoAuthor.style.display = 'none';
        }

        this.loadComments(videoName);
        this.showPage('videoPage');
    }

    loadComments(videoName) {
        const commentsList = document.getElementById('commentsList');
        const comments = JSON.parse(localStorage.getItem('comments'));
        const commentsCount = document.getElementById('commentsCount');

        commentsList.innerHTML = '';
        if (comments && comments[videoName]) {
            comments[videoName].forEach(comment => {
                const commentDiv = document.createElement('div');
                commentDiv.textContent = comment;
                commentsList.appendChild(commentDiv);
            });
            commentsCount.textContent = comments[videoName].length;
        } else {
            commentsCount.textContent = '0';
        }
    }

    updateVideoStats() {
        // Обновляем статистику на странице видео
        const likes = JSON.parse(localStorage.getItem('likes'));
        const likeButton = document.getElementById('likeButton');
        if (likeButton && this.currentVideo) {
            likeButton.textContent = `👍 Like (${likes[this.currentVideo] || 0})`;
        }
    }

    // Event listeners
    setupEventListeners() {
        // Проверяем авторизацию при загрузке
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
            this.currentUser = savedUser;
        }
        this.updateUI();
        this.loadVideosList();

        // Навигация
        document.querySelector('.logo').addEventListener('click', (e) => {
            e.preventDefault();
            this.showPage('mainPage');
        });

        document.getElementById('loginLink').addEventListener('click', (e) => {
            e.preventDefault();
            this.showPage('loginPage');
        });

        document.getElementById('registerLink').addEventListener('click', (e) => {
            e.preventDefault();
            this.showPage('registerPage');
        });

        document.getElementById('logoutLink').addEventListener('click', (e) => {
            e.preventDefault();
            this.logout();
            this.showPage('mainPage');
        });

        document.getElementById('uploadLink').addEventListener('click', (e) => {
            e.preventDefault();
            if (!this.currentUser) {
                this.showMessage('Please login to upload videos', 'error');
                this.showPage('loginPage');
            } else {
                this.showPage('uploadPage');
            }
        });

        document.getElementById('backToVideos').addEventListener('click', (e) => {
            e.preventDefault();
            this.showPage('mainPage');
        });

        // Формы
        document.getElementById('registerForm').addEventListener('submit', (e) => {
            e.preventDefault();
            const username = e.target.username.value;
            const password = e.target.password.value;
            const avatar = e.target.avatar.files[0];
            
            if (this.registerUser(username, password, avatar)) {
                e.target.reset();
                this.showPage('loginPage');
            }
        });

        document.getElementById('loginForm').addEventListener('submit', (e) => {
            e.preventDefault();
            const username = e.target.username.value;
            const password = e.target.password.value;
            
            if (this.loginUser(username, password)) {
                e.target.reset();
                this.showPage('mainPage');
                this.loadVideosList();
            }
        });

        document.getElementById('uploadForm').addEventListener('submit', (e) => {
            e.preventDefault();
            const video = e.target.video.files[0];
            
            if (this.uploadVideo(video)) {
                e.target.reset();
                this.showPage('mainPage');
            }
        });

        document.getElementById('commentForm').addEventListener('submit', (e) => {
            e.preventDefault();
            if (!this.currentUser) {
                this.showMessage('Please login to comment', 'error');
                this.showPage('loginPage');
                return;
            }
            
            const comment = e.target.comment.value;
            if (comment.trim()) {
                this.addComment(this.currentVideo, comment);
                e.target.comment.value = '';
            }
        });
    }
}

// Инициализация приложения
document.addEventListener('DOMContentLoaded', () => {
    new YouTubeClone();
});