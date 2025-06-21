// 네비게이션 관리 모듈
class NavigationManager {
    constructor() {
        this.currentPage = '';
        this.init();
    }

    init() {
        this.setupNavigationEvents();
        this.updateCurrentPage();
    }

    setupNavigationEvents() {
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.addEventListener('click', (e) => this.handleNavigation(e));
        });
    }

    handleNavigation(e) {
        const clickedItem = e.target;
        const href = clickedItem.getAttribute('href');
        
        // 외부 링크가 아닌 경우에만 처리
        if (href && !href.startsWith('http') && href !== '#') {
            // 현재 페이지에서 내용만 변경하는 경우
            if (href.startsWith('#') || this.isSamePage(href)) {
                e.preventDefault();
                this.loadPageContent(href);
            }
        }
        
        this.updateActiveNav(clickedItem);
    }

    isSamePage(href) {
        const currentPath = window.location.pathname;
        return currentPath.includes(href.split('/').pop().split('.')[0]);
    }

    loadPageContent(href) {
        const pageName = this.getPageNameFromHref(href);
        const pageTitle = document.querySelector('.page-title');
        
        // 페이지 제목 업데이트
        if (pageTitle) {
            pageTitle.innerHTML = `${this.getDisplayName(pageName)} <div class="help-icon">?</div>`;
        }
        
        // 페이지별 컨텐츠 로드
        this.loadPageSpecificContent(pageName);
    }

    getPageNameFromHref(href) {
        const fileName = href.split('/').pop().split('.')[0];
        return fileName || 'dashboard';
    }

    getDisplayName(pageName) {
        const displayNames = {
            'product-list': '상품목록',
            'purchase-history': '발주 내역',
            'purchase-request': '발주 요청',
            'purchase-orders': '발주목록',
            'sales-collection': '판매처 주문수집',
            'order-list': '주문목록',
            'invoice-reply': '송장번호 회신',
            'matching-manager': '매칭 관리',
            'stock-list': '재고목록',
            'location-manager': '로케이션 관리',
            'dashboard': '대시보드'
        };
        return displayNames[pageName] || pageName;
    }

    loadPageSpecificContent(pageName) {
        // 상태 카드 업데이트
        this.updateStatusCards(pageName);
        
        // 테이블 데이터 로드
        if (window.PlusMore && window.PlusMore.loadTableData) {
            window.PlusMore.loadTableData(pageName);
        }
        
        // 페이지별 특수 기능 로드
        this.loadPageFeatures(pageName);
    }

    updateStatusCards(pageName) {
        const container = document.querySelector('.container');
        let cardsHTML = '';
        
        // 기존 상태 카드 제거
        const existingCards = document.querySelector('.status-cards');
        if (existingCards) {
            existingCards.remove();
        }
        
        // 페이지별 상태 카드 생성
        if (this.needsStatusCards(pageName)) {
            cardsHTML = this.generateStatusCards(pageName);
            
            if (cardsHTML) {
                const searchSection = document.querySelector('.search-section');
                if (searchSection) {
                    searchSection.insertAdjacentHTML('afterend', cardsHTML);
                }
            }
        }
    }

    needsStatusCards(pageName) {
        return ['purchase-orders', 'order-list', 'purchase-history'].includes(pageName);
    }

    generateStatusCards(pageName) {
        const cardConfigs = {
            'purchase-orders': [
                { title: '입고대기', value: '0건 / 0' },
                { title: '신규주문', value: '0건 / 0', active: true },
                { title: '발주확인', value: '0건 / 0' },
                { title: '구매완료', value: '0건 / 0' },
                { title: '현지배송중', value: '0건 / 0' },
                { title: '배치송', value: '0건 / 0' },
                { title: '선적대기', value: '0건 / 0' },
                { title: '국내배송중', value: '0건 / 0' },
                { title: '가태원료', value: '0건 / 0' },
                { title: '바른출', value: '0건 / 0' }
            ],
            'order-list': [
                { title: '매칭처리', value: '0' },
                { title: '협조처리', value: '0' },
                { title: '취조처리', value: '0' },
                { title: '송장처리', value: '0' },
                { title: '출고처리', value: '0' },
                { title: '배송중', value: '0' }
            ]
        };
        
        const cards = cardConfigs[pageName] || [];
        if (cards.length === 0) return '';
        
        let html = '<div class="status-cards">';
        cards.forEach(card => {
            html += `
                <div class="status-card ${card.active ? 'active' : ''}">
                    <div class="status-card-title">${card.title}</div>
                    <div class="status-card-value">${card.value}</div>
                </div>
            `;
        });
        html += '</div>';
        
        return html;
    }

    loadPageFeatures(pageName) {
        // 페이지별 특수 기능들
        switch(pageName) {
            case 'purchase-orders':
                this.loadPurchaseOrderFeatures();
                break;
            case 'stock-list':
                this.loadStockManagementFeatures();
                break;
            case 'product-list':
                this.loadProductManagementFeatures();
                break;
        }
    }

    loadPurchaseOrderFeatures() {
        // 발주 관련 특수 기능들
        console.log('발주 관리 기능 로드됨');
    }

    loadStockManagementFeatures() {
        // 재고 관리 특수 기능들
        console.log('재고 관리 기능 로드됨');
    }

    loadProductManagementFeatures() {
        // 상품 관리 특수 기능들
        console.log('상품 관리 기능 로드됨');
    }

    updateActiveNav(activeItem) {
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => item.classList.remove('active'));
        activeItem.classList.add('active');
    }

    updateCurrentPage() {
        const path = window.location.pathname;
        this.currentPage = this.getPageNameFromPath(path);
        
        // 현재 페이지에 맞는 네비게이션 활성화
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            const href = item.getAttribute('href');
            if (href && path.includes(href)) {
                item.classList.add('active');
            }
        });
    }

    getPageNameFromPath(path) {
        const fileName = path.split('/').pop().split('.')[0];
        return fileName || 'dashboard';
    }
}

// 네비게이션 매니저 초기화
document.addEventListener('DOMContentLoaded', () => {
    window.navigationManager = new NavigationManager();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NavigationManager;
} 