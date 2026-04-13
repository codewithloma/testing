// DearBUP - Frontend Script
// IT 112 - 2A | AlSor Co | AY 2025-2026
// LOADER ANIMATION
document.body.classList.add('loading');

window.addEventListener('load', () => {
    setTimeout(() => {
        const loader = document.getElementById('loader-wrapper');

        loader.style.opacity = '0';
        document.body.classList.remove('loading');

        setTimeout(() => {
            loader.style.display = 'none';
        }, 1500);
    }, 5000);
});
// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    authModal = new bootstrap.Modal(document.getElementById('authModal'));
    createPostModal = new bootstrap.Modal(document.getElementById('createPostModal'));
    
    loadUser();
    renderPosts();
    setupEventListeners();
});

// Event Listeners
function setupEventListeners() {
    // Auth form
    document.getElementById('authForm').addEventListener('submit', handleAuth);
    document.getElementById('createPostForm').addEventListener('submit', handleCreatePost);
    
    // Smooth scrolling for navbar links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
}

// User Authentication
function handleAuth(e) {
    e.preventDefault();
    const email = document.getElementById('authEmail').value;
    const password = document.getElementById('authPassword').value;
    const isLogin = document.getElementById('authModalTitle').textContent.includes('Welcome');
    
    // Mock authentication
    const users = {
        login: [
            { email: 'student@bup.edu.ph', password: '123456', name: 'Maria Santos', role: 'Student' },
            { email: 'admin@bup.edu.ph', password: 'admin123', name: 'Library Admin', role: 'Admin' }
        ],
        register: []
    };
    
    const user = users[isLogin ? 'login' : 'register'].find(u => u.email === email && u.password === password);
    
    if (user || !isLogin) {
        currentUser = {
            id: Date.now(),
            name: user?.name || email.split('@')[0],
            email: email,
            role: user?.role || 'Student',
            avatar: email[0].toUpperCase() + email[1].toUpperCase()
        };
        saveUser();
        updateUI();
        authModal.hide();
        showToast(`${isLogin ? 'Welcome back' : 'Account created'}!`, 'success');
    } else {
        showToast('Invalid credentials', 'error');
    }
}

function toggleAuthMode() {
    const title = document.getElementById('authModalTitle');
    const toggleLink = document.getElementById('toggleAuthLink');
    
    if (title.textContent.includes('Welcome')) {
        title.textContent = 'Create Account';
        toggleLink.textContent = 'Sign in instead';
    } else {
        title.textContent = 'Welcome Back';
        toggleLink.textContent = 'Create account';
    }
}

// User Management
function loadUser() {
    const userData = localStorage.getItem('dearbup_user');
    if (userData) {
        currentUser = JSON.parse(userData);
        updateUI();
    }
}

function saveUser() {
    localStorage.setItem('dearbup_user', JSON.stringify(currentUser));
}

function logout() {
    localStorage.removeItem('dearbup_user');
    currentUser = null;
    updateUI();
    showToast('Logged out successfully', 'info');
}

function updateUI() {
    const userNav = document.getElementById('userNav');
    const userProfile = document.getElementById('userProfile');
    const userName = document.getElementById('userName');
    const profileName = document.getElementById('profileName');
    const userRole = document.getElementById('userRole');
    
    if (currentUser) {
        userNav.innerHTML = `
            <div class="dropdown">
                <button class="btn btn-primary dropdown-toggle btn-sm rounded-pill px-3" type="button" data-bs-toggle="dropdown">
                    <i class="fas fa-user me-1"></i>
                    <span>${currentUser.name}</span>
                </button>
                <ul class="dropdown-menu dropdown-menu-end">
                    <li><a class="dropdown-item" href="#" onclick="showCreatePostModal()"><i class="fas fa-feather me-2"></i>Create Post</a></li>
                    <li><a class="dropdown-item" href="#"><i class="fas fa-cog me-2"></i>Settings</a></li>
                    <li><hr class="dropdown-divider"></li>
                    <li><a class="dropdown-item text-danger" href="#" onclick="logout()"><i class="fas fa-sign-out-alt me-2"></i>Logout</a></li>
                </ul>
            </div>
        `;
        if (userProfile) {
            userProfile.classList.remove('d-none');
            profileName.textContent = `Welcome back, ${currentUser.name}!`;
            userRole.textContent = currentUser.role;
        }
    } else {
        userNav.innerHTML = `
            <button class="btn btn-outline-primary btn-sm login-btn" onclick="showAuthModal('login')">
                <i class="fas fa-sign-in-alt me-1"></i>Login
            </button>
        `;
        if (userProfile) userProfile.classList.add('d-none');
    }
}

// Posts Management
function renderPosts() {
    const container = document.getElementById('posts-container');
    container.innerHTML = posts.map(post => createPostHTML(post)).join('');
    
    // Add event listeners to like buttons
    document.querySelectorAll('.like-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            toggleLike(this.dataset.postId);
        });
    });
}

function createPostHTML(post) {
    const imageContent = post.image ? 
        `<div class="post-image"><i class="fas fa-camera fa-3x"></i></div>` : 
        `<div class="post-image"><i class="fas fa-heart fa-3x"></i></div>`;
    
    return `
        <div class="col-lg-6 col-xl-4 fade-in-up">
            <div class="post-card h-100">
                <div class="post-header">
                    <div class="post-author">
                        <div class="author-avatar">${post.author.avatar}</div>
                        <div>
                            <div class="fw-bold">${post.author.name}</div>
                            <small class="opacity-75">${post.author.role} • ${post.date}</small>
                        </div>
                    </div>
                </div>
                <div class="post-content">
                    <h5 class="fw-bold mb-3">${post.title}</h5>
                    <p class="text-muted mb-0">${post.content}</p>
                </div>
                ${imageContent}
                <div class="post-actions">
                    <div class="d-flex justify-content-between align-items-center">
                        <div class="d-flex gap-3">
                            <button class="action-btn like-btn ${post.liked ? 'liked' : ''}" data-post-id="${post.id}">
                                <i class="fas ${post.liked ? 'fas fa-heart' : 'far fa-heart'} me-1"></i>
                                ${post.likes}
                            </button>
                            <button class="action-btn">
                                <i class="far fa-comment me-1"></i>${post.comments}
                            </button>
                        </div>
                        <small class="text-muted">${formatTime(post.date)}</small>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function handleCreatePost(e) {
    e.preventDefault();
    
    if (!currentUser) {
        showToast('Please login to create a post', 'error');
        authModal.show();
        return;
    }
    
    const title = document.getElementById('postTitle').value;
    const content = document.getElementById('postContent').value;
    const image = document.getElementById('postImage').files[0];
    const music = document.getElementById('postMusic').value;
    
    const newPost = {
        id: Date.now(),
        title,
        content,
        author: {
            name: currentUser.name,
            avatar: currentUser.avatar,
            role: currentUser.role
        },
        image: image ? 'image' : null,
        musicLink: music || null,
        likes: 0,
        comments: 0,
        liked: false,
        date: 'Just now'
    };
    
    posts.unshift(newPost);
    renderPosts();
    
    // Reset form
    e.target.reset();
    createPostModal.hide();
    
    showToast('Story shared successfully! ✨', 'success');
    scrollToPosts();
}

// Post Interactions
function toggleLike(postId) {
    const post = posts.find(p => p.id == postId);
    if (!post) return;
    
    if (post.liked) {
        post.likes--;
        post.liked = false;
    } else {
        post.likes++;
        post.liked = true;
    }
    
    renderPosts();
    savePosts();
}

function savePosts() {
    localStorage.setItem('dearbup_posts', JSON.stringify(posts));
}

// UI Utilities
function showAuthModal(mode) {
    document.getElementById('authEmail').value = '';
    document.getElementById('authPassword').value = '';
    if (mode === 'register') toggleAuthMode();
    authModal.show();
}

function showCreatePostModal() {
    if (!currentUser) {
        showToast('Please login to create posts', 'error');
        authModal.show();
        return;
    }
    createPostModal.show();
}

function scrollToPosts() {
    document.getElementById('posts').scrollIntoView({ behavior: 'smooth' });
}

function formatTime(dateString) {
    const now = new Date();
    const postTime = new Date(dateString);
    const diff = Math.floor((now - postTime) / 1000 / 60);
    
    if (diff < 1) return 'Just now';
    if (diff < 60) return `${diff}m ago`;
    if (diff < 1440) return `${Math.floor(diff/60)}h ago`;
    return `${Math.floor(diff/1440)}d ago`;
}

function showToast(message, type = 'info') {
    const toastHtml = `
        <div class="toast-container position-fixed bottom-0 end-0 p-3" style="z-index: 9999">
            <div class="toast align-items-center text-white bg-${type === 'success' ? 'success' : type === 'error' ? 'danger' : 'primary'} border-0" role="alert">
                <div class="d-flex">
                    <div class="toast-body">${message}</div>
                    <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', toastHtml);
    const toastEl = document.querySelector('.toast');
    const toast = new bootstrap.Toast(toastEl);
    toast.show();
    
    toastEl.addEventListener('hidden.bs.toast', () => toastEl.remove());
}

// Load posts from localStorage on init
function initPosts() {
    const savedPosts = localStorage.getItem('dearbup_posts');
    if (savedPosts) {
        posts = JSON.parse(savedPosts);
        renderPosts();
    }
}

// Initialize everything
initPosts();