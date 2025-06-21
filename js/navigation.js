// PlusMore Admin - Navigation Management
class NavigationManager {
    constructor() {
        this.currentPage = this.getCurrentPage();
        this.init();
    }

    init() {
        this.setupNavigation();
        this.setupBreadcrumbs();
        this.setupPageTransitions();
    }

    getCurrentPage() {
        const path = window.location.pathname;
        const page = path.split('/').pop() || 'index.html';
        return page;
    }

    setupNavigation() {
        const navLinks = document.querySelectorAll('.nav-link');
        
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                // Remove active class from all nav items
                document.querySelectorAll('.nav-item').forEach(item => {
                    item.classList.remove('active');
                });
                
                // Add active class to clicked item
                link.parentElement.classList.add('active');
                
                // Store current page in session storage
                sessionStorage.setItem('currentPage', link.getAttribute('href'));
            });
        });

        // Restore active state on page load
        this.restoreActiveState();
    }

    restoreActiveState() {
        const currentPage = sessionStorage.getItem('currentPage') || this.currentPage;
        const navLinks = document.querySelectorAll('.nav-link');
        
        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href === currentPage || 
                (currentPage === 'index.html' && href === 'index.html') ||
                (currentPage.endsWith('/') && href === 'index.html')) {
                link.parentElement.classList.add('active');
            }
        });
    }

    setupBreadcrumbs() {
        const breadcrumbContainer = document.querySelector('.breadcrumb');
        if (!breadcrumbContainer) return;

        const breadcrumbs = this.generateBreadcrumbs();
        breadcrumbContainer.innerHTML = breadcrumbs;
    }

    generateBreadcrumbs() {
        const path = window.location.pathname;
        const segments = path.split('/').filter(segment => segment);
        
        let breadcrumbHTML = '<a href="index.html">홈</a>';
        let currentPath = '';
        
        segments.forEach((segment, index) => {
            currentPath += '/' + segment;
            const isLast = index === segments.length - 1;
            
            if (isLast) {
                breadcrumbHTML += ` <span class="breadcrumb-separator">/</span> <span class="breadcrumb-current">${this.getPageTitle(segment)}</span>`;
            } else {
                breadcrumbHTML += ` <span class="breadcrumb-separator">/</span> <a href="${currentPath}">${this.getPageTitle(segment)}</a>`;
            }
        });
        
        return breadcrumbHTML;
    }

    getPageTitle(pageName) {
        const pageTitles = {
            'index.html': '대시보드',
            'purchase-history.html': '발주 내역',
            'product-list.html': '상품목록',
            'purchase-request.html': '발주 요청',
            'purchase-orders.html': '발주목록',
            'sales-collection.html': '판매처 주문수집',
            'order-list.html': '주문목록',
            'invoice-reply.html': '송장번호 회신',
            'matching-manager.html': '매칭 관리',
            'stock-list.html': '재고목록',
            'location-manager.html': '로케이션 관리'
        };
        
        return pageTitles[pageName] || pageName;
    }

    setupPageTransitions() {
        // Add loading state to navigation links
        const navLinks = document.querySelectorAll('.nav-link');
        
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                // Don't add loading for external links or same page
                const href = link.getAttribute('href');
                if (href.startsWith('http') || href === this.currentPage) {
                    return;
                }
                
                // Add loading state
                this.showPageLoading();
            });
        });

        // Hide loading when page is fully loaded
        window.addEventListener('load', () => {
            this.hidePageLoading();
        });
    }

    showPageLoading() {
        const loadingOverlay = document.createElement('div');
        loadingOverlay.className = 'page-loading-overlay';
        loadingOverlay.innerHTML = `
            <div class="loading-spinner">
                <div class="spinner"></div>
                <p>페이지를 불러오는 중...</p>
            </div>
        `;
        
        document.body.appendChild(loadingOverlay);
        
        // Show loading with animation
        setTimeout(() => {
            loadingOverlay.classList.add('active');
        }, 100);
    }

    hidePageLoading() {
        const loadingOverlay = document.querySelector('.page-loading-overlay');
        if (loadingOverlay) {
            loadingOverlay.classList.remove('active');
            setTimeout(() => {
                if (loadingOverlay.parentNode) {
                    loadingOverlay.remove();
                }
            }, 300);
        }
    }

    // Navigation helper methods
    navigateTo(page, params = {}) {
        const url = new URL(page, window.location.origin);
        
        // Add query parameters
        Object.keys(params).forEach(key => {
            url.searchParams.set(key, params[key]);
        });
        
        window.location.href = url.toString();
    }

    navigateBack() {
        if (window.history.length > 1) {
            window.history.back();
        } else {
            this.navigateTo('index.html');
        }
    }

    // Mobile navigation methods
    toggleMobileMenu() {
        const sidebar = document.getElementById('sidebar');
        const overlay = document.querySelector('.mobile-overlay');
        
        if (sidebar.classList.contains('active')) {
            this.closeMobileMenu();
        } else {
            this.openMobileMenu();
        }
    }

    openMobileMenu() {
        const sidebar = document.getElementById('sidebar');
        const overlay = this.createMobileOverlay();
        
        sidebar.classList.add('active');
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    closeMobileMenu() {
        const sidebar = document.getElementById('sidebar');
        const overlay = document.querySelector('.mobile-overlay');
        
        sidebar.classList.remove('active');
        if (overlay) {
            overlay.classList.remove('active');
            setTimeout(() => {
                if (overlay.parentNode) {
                    overlay.remove();
                }
            }, 300);
        }
        document.body.style.overflow = '';
    }

    createMobileOverlay() {
        let overlay = document.querySelector('.mobile-overlay');
        
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.className = 'mobile-overlay';
            document.body.appendChild(overlay);
            
            overlay.addEventListener('click', () => {
                this.closeMobileMenu();
            });
        }
        
        return overlay;
    }

    // Keyboard navigation
    setupKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            // Alt + N: Toggle navigation
            if (e.altKey && e.key === 'n') {
                e.preventDefault();
                this.toggleMobileMenu();
            }
            
            // Alt + H: Go home
            if (e.altKey && e.key === 'h') {
                e.preventDefault();
                this.navigateTo('index.html');
            }
            
            // Alt + B: Go back
            if (e.altKey && e.key === 'b') {
                e.preventDefault();
                this.navigateBack();
            }
        });
    }

    // Search functionality
    setupSearch() {
        const searchInput = document.querySelector('.search-input');
        if (!searchInput) return;

        const searchResults = document.querySelector('.search-results');
        
        searchInput.addEventListener('input', this.debounce((e) => {
            const query = e.target.value.trim();
            
            if (query.length < 2) {
                this.hideSearchResults();
                return;
            }
            
            this.performSearch(query);
        }, 300));

        // Close search results when clicking outside
        document.addEventListener('click', (e) => {
            if (!searchInput.contains(e.target) && !searchResults?.contains(e.target)) {
                this.hideSearchResults();
            }
        });
    }

    async performSearch(query) {
        try {
            // Simulate search API call
            const results = await this.searchAPI(query);
            this.displaySearchResults(results);
        } catch (error) {
            console.error('Search failed:', error);
        }
    }

    async searchAPI(query) {
        // Simulate API call
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve([
                    { title: '상품 검색 결과', url: 'pages/product-list.html?search=' + query },
                    { title: '주문 검색 결과', url: 'pages/order-list.html?search=' + query },
                    { title: '재고 검색 결과', url: 'pages/stock-list.html?search=' + query }
                ]);
            }, 500);
        });
    }

    displaySearchResults(results) {
        let searchResults = document.querySelector('.search-results');
        
        if (!searchResults) {
            searchResults = document.createElement('div');
            searchResults.className = 'search-results';
            document.querySelector('.search-container').appendChild(searchResults);
        }
        
        searchResults.innerHTML = results.map(result => `
            <a href="${result.url}" class="search-result-item">
                <i class="fas fa-search"></i>
                <span>${result.title}</span>
            </a>
        `).join('');
        
        searchResults.classList.add('active');
    }

    hideSearchResults() {
        const searchResults = document.querySelector('.search-results');
        if (searchResults) {
            searchResults.classList.remove('active');
        }
    }

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
}

// Initialize navigation manager
document.addEventListener('DOMContentLoaded', () => {
    window.navigationManager = new NavigationManager();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NavigationManager;
} 