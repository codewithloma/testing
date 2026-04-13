// DearBUP Frontend - Main JavaScript
class DearBUP {
    constructor() {
        this.postsFeed = document.getElementById('postsFeed');
        this.createPostModal = document.getElementById('createPostModal');
        this.postForm = document.getElementById('postForm');
        this.postContent = document.getElementById('postContent');
        this.postSubmit = document.querySelector('.post-submit');
        this.charCount = document.getElementById('charCount');
        this.writePostBtn = document.getElementById('writePostBtn');
        this.closeModalBtn = document.getElementById('closeModal');
        this.startWriting = document.getElementById('startWriting');
        this.navItems = document.querySelectorAll('.nav-item[data-page]');
        
        this.init();
    }

    init() {
        // Bind event listeners
        this.bindEvents();
        
        // Load sample posts
        this.loadSamplePosts();
        
        // Initialize animations
        this.initAnimations();
        
        // API endpoints (ready for backend connection)
        this.apiBase = '/api'; // Change to your backend URL
    }

    bindEvents() {
        // Modal events
        this.writePostBtn.addEventListener('click', () => this.openModal());
        this.startWriting.addEventListener('click', () => this.openModal());
        this.closeModalBtn.addEventListener('click', () => this.closeModal());
        
        // Close modal on outside click
        this.createPostModal.addEventListener('click', (e) => {
            if (e.target === this.createPostModal) {
                this.closeModal();
            }
        });

        // Post form
        this.postForm.addEventListener('submit', (e) => this.handlePostSubmit(e));
        this.postContent.addEventListener('input', () => this.updateCharCount());
        
        // Navigation
        this.navItems.forEach(item => {
            item.addEventListener('click', (e) => this.handleNavigation(e));
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeydown(e));
    }

    initAnimations() {
        // Smooth scroll for feed
        this.postsFeed.style.scrollBehavior = 'smooth';
        
        // Intersection Observer for animations
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, observerOptions);

        // Observe all posts
        const posts = document.querySelectorAll('.post');
        posts.forEach(post => observer.observe(post));
    }

    openModal() {
        this.createPostModal.classList.add('active');
        document.body.style.overflow = 'hidden';
        this.postContent.focus();
        
        // Animate modal entrance
        setTimeout(() => {
            this.createPostModal.style.transform = 'scale(1)';
            this.createPostModal.style.opacity = '1';
        }, 10);
    }

    closeModal() {
        this.createPostModal.classList.remove('active');
        document.body.style.overflow = 'auto';
        this.postContent.value = '';
        this.updateCharCount();
        this.postSubmit.disabled = true;
    }

    updateCharCount() {
        const length = this.postContent.value.length;
        this.charCount.textContent = length;
        
        if (length > 0) {
            this.postSubmit.disabled = false;
        } else {
            this.postSubmit.disabled = true;
        }

        // Color coding for character count
        if (length > 240) {
            this.charCount.style.color = '#e06a72';
        } else if (length > 200) {
            this.charCount.style.color = '#d65d64';
        } else {
            this.charCount.style.color = '#999';
        }
    }

    async handlePostSubmit(e) {
        e.preventDefault();
        
        const content = this.postContent.value.trim();
        if (!content) return;

        // Show loading state
        this.postSubmit.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Posting...';
        this.postSubmit.disabled = true;

        try {
            // Backend API call (ready to connect)
            const newPost = await this.createPost({
                content: content,
                author: '@yourusername',
                authorName: 'John Doe',
                timestamp: new Date()
            });

            // Animate new post to top
            this.prependPost(newPost);
            
            // Reset form
            this.postContent.value = '';
            this.updateCharCount();
            
            // Close modal with animation
            this.closeModal();
            
        } catch (error) {
            console.error('Error posting:', error);
            alert('Failed to post. Please try again.');
        } finally {
            this.postSubmit.innerHTML = 'Post';
            this.postSubmit.disabled = false;
        }
    }

    async createPost(postData) {
        // Simulate API call - replace with real backend call
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    id: Date.now(),
                    ...postData,
                    likes: 0,
                    reposts: 0,
                    replies: 0,
                    views: 1
                });
            }, 1000);
        });

        // Real backend call (uncomment when ready):
        /*
        const response = await fetch(`${this.apiBase}/posts`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(postData)
        });
        
        if (!response.ok) throw new Error('Failed to create post');
        return response.json();
        */
    }

    prependPost(postData) {
        const postElement = this.createPostElement(postData);
        
        // Insert at top with animation
        this.postsFeed.insertBefore(postElement, this.postsFeed.firstChild);
        
        // Animate entrance
        postElement.style.opacity = '0';
        postElement.style.transform = 'translateY(-20px)';
        
        setTimeout(() => {
            postElement.style.transition = 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
            postElement.style.opacity = '1';
            postElement.style.transform = 'translateY(0)';
        }, 100);

        // Scroll to top smoothly
        this.postsFeed.scrollTop = 0;
    }

    createPostElement(post) {
        const postEl = document.createElement('div');
        postEl.className = 'post';
        postEl.style.opacity = '0';
        postEl.style.transform = 'translateY(20px)';
        postEl.style.transition = 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)';

        postEl.innerHTML = `
            <div class="post-header">
                <div class="post-avatar">${post.author.charAt(1)}</div>
                <div class="post-meta">
                    <div class="post-author">${post.authorName}</div>
                    <div class="post-handle">${post.author} • ${this.formatTime(post.timestamp)}</div>
                </div>
            </div>
            <div class="post-content">${this.formatContent(post.content)}</div>
            <div class="post-actions-bar">
                <div class="action-group" data-action="reply">
                    <i class="fas fa-reply"></i>
                    <span>${post.replies}</span>
                </div>
                <div class="action-group" data-action="repost">
                    <i class="fas fa-retweet"></i>
                    <span>${post.reposts}</span>
                </div>
                <div class="action-group" data-action="like">
                    <i class="far fa-heart"></i>
                    <span>${post.likes}</span>
                </div>
                <div class="action-group" data-action="share">
                    <i class="fas fa-share"></i>
                    <span>${post.views} views</span>
                </div>
            </div>
        `;

        // Add event listeners for actions
        postEl.querySelectorAll('.action-group').forEach(group => {
            group.addEventListener('click', (e) => this.handlePostAction(e, post));
        });

        return postEl;
    }

    loadSamplePosts() {
        const samplePosts = [
            {
                id: 1,
                content: "First day back at BUP Polangui! The campus is buzzing with energy. Can't wait to reconnect with everyone and dive into this semester! #BUP #PolanguiPride",
                author: '@jdoe',
                authorName: 'John Doe',
                timestamp: new Date(Date.now() - 1000 * 60 * 30),
                likes: 24,
                reposts: 3,
                replies: 5,
                views: 156
            },
            {
                id: 2,
                content: "Shoutout to the CSS department for organizing that amazing welcome event! The food was 🔥 and the games were so much fun. BUP fam never disappoints! 🎉",
                author: '@janedoe',
                authorName: 'Jane Doe',
                timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
                likes: 42,
                reposts: 8,
                replies: 12,
                views: 289
            },
            {
                id: 3,
                content: "Reminder: Library orientation tomorrow at 2PM! Perfect chance to get familiar with all the new resources. See you there! 📚 #BUPUpdates",
                author: '@bup_library',
                authorName: 'BUP Library',
                timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4),
                likes: 67,
                reposts: 15,
                replies: 3,
                views: 456
            }
        ];

        samplePosts.forEach(post => {
            const postEl = this.createPostElement(post);
            this.postsFeed.appendChild(postEl);
        });
    }

    handlePostAction(e, post) {
        const action = e.currentTarget.dataset.action;
        const icon = e.currentTarget.querySelector('i');
        const count = e.currentTarget.querySelector('span');

        // Simple interaction feedback
        e.currentTarget.style.transform = 'scale(0.95)';
        setTimeout(() => {
            e.currentTarget.style.transform = 'scale(1)';
        }, 150);

        switch(action) {
            case 'like':
                this.toggleLike(icon, count, post);
                break;
            case 'reply':
            case 'repost':
            case 'share':
                this.handleSecondaryAction(action);
                break;
        }
    }

    toggleLike(icon, countEl, post) {
        const isLiked = icon.classList.contains('fas');
        
        if (isLiked) {
            icon.classList.remove('fas');
            icon.classList.add('far');
            countEl.textContent = Math.max(0, parseInt(countEl.textContent) - 1);
        } else {
            icon.classList.remove('far');
            icon.classList.add('fas');
            icon.style.color = '#e06a72';
            countEl.textContent = parseInt(countEl.textContent) + 1;
        }
    }

    handleSecondaryAction(action) {
        // Show toast notification
        this.showToast(`${action.charAt(0).toUpperCase() + action.slice(1)}ed!`);
    }

    handleNavigation(e) {
        e.preventDefault();
        const page = e.currentTarget.dataset.page;
        
        // Update active nav
        document.querySelector('.nav-item.active')?.classList.remove('active');
        e.currentTarget.classList.add('active');
        
        // Handle page changes (ready for SPA routing)
        this.switchPage(page);
    }

    switchPage(page) {
        console.log('Switching to page:', page);
        // Implement page switching logic here
        // For now, just log the page change
    }

    handleKeydown(e) {
        // ESC to close modal
        if (e.key === 'Escape' && this.createPostModal.classList.contains('active')) {
            this.closeModal();
        }
        
        // Ctrl/Cmd + Enter to post
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && this.postForm.contains(document.activeElement)) {
            this.postForm.dispatchEvent(new Event('submit'));
        }
    }

    formatTime(timestamp) {
        const now = new Date();
        const postTime = new Date(timestamp);
        const diffMs = now - postTime;
        const diffMins = Math.floor(diffMs / 60000);
        
        if (diffMins < 1) return 'Just now';
        if (diffMins === 1) return '1m';
        if (diffMins < 60) return `${diffMins}m`;
        if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h`;
        return `${Math.floor(diffMins / 1440)}d`;
    }

    formatContent(content) {
        // Basic content formatting (hashtags, mentions)
        return content
            .replace(/#(\w+)/g, '<span class="hashtag">#$1</span>')
            .replace(/@(\w+)/g, '<span class="mention">@$1</span>');
    }

    showToast(message) {
        // Create toast element
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #e06a72, #d65d64);
            color: white;
            padding: 12px 20px;
            border-radius: 25px;
            font-weight: 500;
            z-index: 10000;
            transform: translateX(400px);
            transition: all 0.3s ease;
            box-shadow: 0 8px 25px rgba(214, 93, 100, 0.4);
        `;
        
        document.body.appendChild(toast);
        
        // Animate in
        requestAnimationFrame(() => {
            toast.style.transform = 'translateX(0)';
        });
        
        // Auto remove
        setTimeout(() => {
            toast.style.transform = 'translateX(400px)';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, 3000);
    }

    // API helper methods (ready for backend integration)
    async fetchPosts() {
        // return await fetch(`${this.apiBase}/posts`).then(r => r.json());
        return [];
    }

    async fetchUserPosts(username) {
        // return await fetch(`${this.apiBase}/posts/user/${username}`).then(r => r.json());
        return [];
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.dearBUP = new DearBUP();
});

// Additional global utilities
window.addEventListener('load', () => {
    // Preload animations
    document.body.classList.add('loaded');
    
    // Infinite scroll setup
    const feed = document.querySelector('.center-feed');
    let loading = false;
    
    feed.addEventListener('scroll', () => {
        if (feed.scrollTop + feed.clientHeight >= feed.scrollHeight - 100 && !loading) {
            loadMorePosts();
        }
    });
    
    async function loadMorePosts() {
        loading = true;
        // Simulate loading more posts
        setTimeout(() => {
            loading = false;
        }, 1000);
    }
});

// PWA readiness (optional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js');
    });
}