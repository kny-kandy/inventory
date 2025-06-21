// PlusMore Admin - Reusable Components
class ComponentManager {
    constructor() {
        this.components = new Map();
        this.init();
    }

    init() {
        this.registerComponents();
    }

    registerComponents() {
        // 모달 컴포넌트
        this.components.set('modal', ModalComponent);
        
        // 토스트 컴포넌트
        this.components.set('toast', ToastComponent);
        
        // 데이터 테이블 컴포넌트
        this.components.set('datatable', DataTableComponent);
        
        // 검색 폼 컴포넌트
        this.components.set('searchform', SearchFormComponent);
    }

    create(componentName, options = {}) {
        const ComponentClass = this.components.get(componentName);
        if (ComponentClass) {
            return new ComponentClass(options);
        }
        throw new Error(`Component '${componentName}' not found`);
    }
}

// 모달 컴포넌트
class ModalComponent {
    constructor(options) {
        this.options = {
            title: '알림',
            content: '',
            showCancel: true,
            onConfirm: null,
            onCancel: null,
            ...options
        };
        this.modal = null;
        this.create();
    }

    create() {
        this.modal = document.createElement('div');
        this.modal.className = 'modal-overlay';
        this.modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>${this.options.title}</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    ${this.options.content}
                </div>
                <div class="modal-footer">
                    ${this.options.showCancel ? '<button class="btn btn-cancel">취소</button>' : ''}
                    <button class="btn btn-confirm">확인</button>
                </div>
            </div>
        `;

        this.setupEvents();
        this.addStyles();
    }

    setupEvents() {
        // 닫기 버튼
        const closeBtn = this.modal.querySelector('.modal-close');
        closeBtn.addEventListener('click', () => this.close());

        // 취소 버튼
        const cancelBtn = this.modal.querySelector('.btn-cancel');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                if (this.options.onCancel) this.options.onCancel();
                this.close();
            });
        }

        // 확인 버튼
        const confirmBtn = this.modal.querySelector('.btn-confirm');
        confirmBtn.addEventListener('click', () => {
            if (this.options.onConfirm) this.options.onConfirm();
            this.close();
        });

        // 오버레이 클릭 시 닫기
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) this.close();
        });
    }

    addStyles() {
        if (!document.querySelector('#modal-styles')) {
            const styles = document.createElement('style');
            styles.id = 'modal-styles';
            styles.textContent = `
                .modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.5);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 10000;
                }
                .modal-content {
                    background: white;
                    border-radius: 12px;
                    max-width: 500px;
                    width: 90%;
                    max-height: 80vh;
                    overflow-y: auto;
                }
                .modal-header {
                    padding: 20px 24px 0;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .modal-header h3 {
                    margin: 0;
                    font-size: 18px;
                    font-weight: 600;
                }
                .modal-close {
                    background: none;
                    border: none;
                    font-size: 24px;
                    cursor: pointer;
                    color: #6b7280;
                }
                .modal-body {
                    padding: 20px 24px;
                    color: #374151;
                    line-height: 1.6;
                }
                .modal-footer {
                    padding: 0 24px 24px;
                    display: flex;
                    gap: 10px;
                    justify-content: flex-end;
                }
                .modal-footer .btn {
                    padding: 10px 20px;
                    border-radius: 6px;
                    border: none;
                    cursor: pointer;
                    font-weight: 500;
                }
                .btn-cancel {
                    background: #f3f4f6;
                    color: #374151;
                }
                .btn-confirm {
                    background: #3b82f6;
                    color: white;
                }
            `;
            document.head.appendChild(styles);
        }
    }

    show() {
        document.body.appendChild(this.modal);
        // 애니메이션을 위해 약간의 지연
        setTimeout(() => {
            this.modal.style.opacity = '1';
        }, 10);
    }

    close() {
        this.modal.style.opacity = '0';
        setTimeout(() => {
            if (this.modal && this.modal.parentNode) {
                this.modal.parentNode.removeChild(this.modal);
            }
        }, 200);
    }
}

// 토스트 컴포넌트
class ToastComponent {
    constructor(options) {
        this.options = {
            message: '',
            type: 'info', // success, error, warning, info
            duration: 3000,
            position: 'top-right',
            ...options
        };
        this.create();
    }

    create() {
        this.toast = document.createElement('div');
        this.toast.className = `toast toast-${this.options.type}`;
        this.toast.textContent = this.options.message;

        this.addStyles();
        this.show();
        this.autoHide();
    }

    addStyles() {
        if (!document.querySelector('#toast-styles')) {
            const styles = document.createElement('style');
            styles.id = 'toast-styles';
            styles.textContent = `
                .toast {
                    position: fixed;
                    padding: 12px 20px;
                    border-radius: 8px;
                    color: white;
                    font-weight: 500;
                    z-index: 10001;
                    opacity: 0;
                    transition: all 0.3s ease;
                    min-width: 250px;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                }
                .toast.show {
                    opacity: 1;
                    transform: translateY(0);
                }
                .toast-success { background: #10b981; }
                .toast-error { background: #ef4444; }
                .toast-warning { background: #f59e0b; }
                .toast-info { background: #3b82f6; }
                .toast-top-right {
                    top: 20px;
                    right: 20px;
                    transform: translateY(-20px);
                }
                .toast-top-left {
                    top: 20px;
                    left: 20px;
                    transform: translateY(-20px);
                }
                .toast-bottom-right {
                    bottom: 20px;
                    right: 20px;
                    transform: translateY(20px);
                }
                .toast-bottom-left {
                    bottom: 20px;
                    left: 20px;
                    transform: translateY(20px);
                }
            `;
            document.head.appendChild(styles);
        }

        this.toast.classList.add(`toast-${this.options.position}`);
    }

    show() {
        document.body.appendChild(this.toast);
        setTimeout(() => {
            this.toast.classList.add('show');
        }, 10);
    }

    hide() {
        this.toast.classList.remove('show');
        setTimeout(() => {
            if (this.toast && this.toast.parentNode) {
                this.toast.parentNode.removeChild(this.toast);
            }
        }, 300);
    }

    autoHide() {
        if (this.options.duration > 0) {
            setTimeout(() => {
                this.hide();
            }, this.options.duration);
        }
    }
}

// 데이터 테이블 컴포넌트
class DataTableComponent {
    constructor(options) {
        this.options = {
            container: null,
            columns: [],
            data: [],
            pagination: true,
            pageSize: 50,
            sortable: true,
            selectable: true,
            ...options
        };
        this.currentPage = 1;
        this.sortColumn = null;
        this.sortDirection = 'asc';
        this.selectedRows = new Set();
        
        if (this.options.container) {
            this.create();
        }
    }

    create() {
        this.container = typeof this.options.container === 'string' 
            ? document.querySelector(this.options.container)
            : this.options.container;

        if (!this.container) {
            throw new Error('Container not found');
        }

        this.render();
        this.setupEvents();
    }

    render() {
        this.container.innerHTML = `
            <div class="table-container">
                <table class="data-table">
                    <thead>
                        ${this.renderHeader()}
                    </thead>
                    <tbody>
                        ${this.renderBody()}
                    </tbody>
                </table>
                ${this.options.pagination ? this.renderPagination() : ''}
            </div>
        `;
    }

    renderHeader() {
        let html = '<tr>';
        
        if (this.options.selectable) {
            html += '<th><input type="checkbox" class="select-all"></th>';
        }
        
        this.options.columns.forEach(column => {
            const sortIcon = this.getSortIcon(column.key);
            html += `<th data-column="${column.key}" class="${this.options.sortable ? 'sortable' : ''}">
                ${column.title} ${sortIcon}
            </th>`;
        });
        
        html += '</tr>';
        return html;
    }

    renderBody() {
        const startIndex = (this.currentPage - 1) * this.options.pageSize;
        const endIndex = startIndex + this.options.pageSize;
        const pageData = this.options.data.slice(startIndex, endIndex);

        if (pageData.length === 0) {
            const colSpan = this.options.columns.length + (this.options.selectable ? 1 : 0);
            return `<tr><td colspan="${colSpan}" class="loading">데이터가 없습니다.</td></tr>`;
        }

        let html = '';
        pageData.forEach((row, index) => {
            html += '<tr>';
            
            if (this.options.selectable) {
                const isSelected = this.selectedRows.has(startIndex + index);
                html += `<td><input type="checkbox" class="row-select" data-index="${startIndex + index}" ${isSelected ? 'checked' : ''}></td>`;
            }
            
            this.options.columns.forEach(column => {
                const value = this.getCellValue(row, column);
                html += `<td>${value}</td>`;
            });
            
            html += '</tr>';
        });
        
        return html;
    }

    getCellValue(row, column) {
        const value = row[column.key];
        if (column.render && typeof column.render === 'function') {
            return column.render(value, row);
        }
        return value || '-';
    }

    getSortIcon(columnKey) {
        if (!this.options.sortable) return '';
        
        if (this.sortColumn === columnKey) {
            return this.sortDirection === 'asc' ? ' ↑' : ' ↓';
        }
        return '';
    }

    renderPagination() {
        const totalPages = Math.ceil(this.options.data.length / this.options.pageSize);
        
        return `
            <div class="pagination">
                <div class="pagination-info">
                    Showing ${this.options.data.length} rows
                </div>
                <div class="pagination-controls">
                    <label>Page Size</label>
                    <select class="page-size-select">
                        <option value="25" ${this.options.pageSize === 25 ? 'selected' : ''}>25</option>
                        <option value="50" ${this.options.pageSize === 50 ? 'selected' : ''}>50</option>
                        <option value="100" ${this.options.pageSize === 100 ? 'selected' : ''}>100</option>
                        <option value="200" ${this.options.pageSize === 200 ? 'selected' : ''}>200</option>
                    </select>
                    <button class="page-btn" data-page="1" ${this.currentPage === 1 ? 'disabled' : ''}>First</button>
                    <button class="page-btn" data-page="${this.currentPage - 1}" ${this.currentPage === 1 ? 'disabled' : ''}>Prev</button>
                    <button class="page-btn active">${this.currentPage}</button>
                    <button class="page-btn" data-page="${this.currentPage + 1}" ${this.currentPage === totalPages ? 'disabled' : ''}>Next</button>
                    <button class="page-btn" data-page="${totalPages}" ${this.currentPage === totalPages ? 'disabled' : ''}>Last</button>
                </div>
            </div>
        `;
    }

    setupEvents() {
        // 정렬 이벤트
        if (this.options.sortable) {
            const sortableHeaders = this.container.querySelectorAll('th.sortable');
            sortableHeaders.forEach(header => {
                header.addEventListener('click', (e) => {
                    const column = e.target.dataset.column;
                    this.sort(column);
                });
            });
        }

        // 선택 이벤트
        if (this.options.selectable) {
            const selectAllCheckbox = this.container.querySelector('.select-all');
            if (selectAllCheckbox) {
                selectAllCheckbox.addEventListener('change', (e) => {
                    this.selectAll(e.target.checked);
                });
            }

            const rowCheckboxes = this.container.querySelectorAll('.row-select');
            rowCheckboxes.forEach(checkbox => {
                checkbox.addEventListener('change', (e) => {
                    this.selectRow(parseInt(e.target.dataset.index), e.target.checked);
                });
            });
        }

        // 페이지네이션 이벤트
        if (this.options.pagination) {
            const pageButtons = this.container.querySelectorAll('.page-btn[data-page]');
            pageButtons.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const page = parseInt(e.target.dataset.page);
                    this.goToPage(page);
                });
            });

            const pageSizeSelect = this.container.querySelector('.page-size-select');
            if (pageSizeSelect) {
                pageSizeSelect.addEventListener('change', (e) => {
                    this.changePageSize(parseInt(e.target.value));
                });
            }
        }
    }

    sort(column) {
        if (this.sortColumn === column) {
            this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            this.sortColumn = column;
            this.sortDirection = 'asc';
        }

        this.options.data.sort((a, b) => {
            const aVal = a[column] || '';
            const bVal = b[column] || '';
            
            if (this.sortDirection === 'asc') {
                return aVal.toString().localeCompare(bVal.toString());
            } else {
                return bVal.toString().localeCompare(aVal.toString());
            }
        });

        this.render();
        this.setupEvents();
    }

    selectAll(checked) {
        if (checked) {
            for (let i = 0; i < this.options.data.length; i++) {
                this.selectedRows.add(i);
            }
        } else {
            this.selectedRows.clear();
        }
        this.render();
        this.setupEvents();
    }

    selectRow(index, checked) {
        if (checked) {
            this.selectedRows.add(index);
        } else {
            this.selectedRows.delete(index);
        }
    }

    goToPage(page) {
        const totalPages = Math.ceil(this.options.data.length / this.options.pageSize);
        if (page >= 1 && page <= totalPages) {
            this.currentPage = page;
            this.render();
            this.setupEvents();
        }
    }

    changePageSize(newSize) {
        this.options.pageSize = newSize;
        this.currentPage = 1;
        this.render();
        this.setupEvents();
    }

    updateData(newData) {
        this.options.data = newData;
        this.currentPage = 1;
        this.selectedRows.clear();
        this.render();
        this.setupEvents();
    }

    getSelectedRows() {
        return Array.from(this.selectedRows).map(index => this.options.data[index]);
    }
}

// 검색 폼 컴포넌트
class SearchFormComponent {
    constructor(options) {
        this.options = {
            container: null,
            fields: [],
            onSearch: null,
            onReset: null,
            ...options
        };
        
        if (this.options.container) {
            this.create();
        }
    }

    create() {
        this.container = typeof this.options.container === 'string' 
            ? document.querySelector(this.options.container)
            : this.options.container;

        if (!this.container) {
            throw new Error('Container not found');
        }

        this.render();
        this.setupEvents();
    }

    render() {
        let html = '<div class="search-section"><div class="search-form">';
        
        this.options.fields.forEach((field, index) => {
            if (index % 3 === 0) {
                html += '<div class="search-row">';
            }
            
            html += this.renderField(field);
            
            if (index % 3 === 2 || index === this.options.fields.length - 1) {
                html += '</div>';
            }
        });
        
        html += `
            <div class="search-actions">
                <button class="search-btn" type="button">검색</button>
                <button class="reset-btn" type="button">초기화</button>
            </div>
        `;
        
        html += '</div></div>';
        
        this.container.innerHTML = html;
    }

    renderField(field) {
        let inputHtml = '';
        
        switch (field.type) {
            case 'text':
                inputHtml = `<input type="text" class="search-input" name="${field.name}" placeholder="${field.placeholder || ''}">`;
                break;
            case 'select':
                inputHtml = `<select class="search-select" name="${field.name}">`;
                field.options.forEach(option => {
                    inputHtml += `<option value="${option.value}">${option.label}</option>`;
                });
                inputHtml += '</select>';
                break;
            case 'date':
                inputHtml = `<input type="date" class="date-input" name="${field.name}">`;
                break;
            case 'daterange':
                inputHtml = `
                    <input type="date" class="date-input" name="${field.name}_start">
                    <span>~</span>
                    <input type="date" class="date-input" name="${field.name}_end">
                `;
                break;
        }
        
        return `
            <div class="search-field">
                <label class="search-label">${field.label}</label>
                ${inputHtml}
            </div>
        `;
    }

    setupEvents() {
        const searchBtn = this.container.querySelector('.search-btn');
        if (searchBtn) {
            searchBtn.addEventListener('click', () => this.handleSearch());
        }

        const resetBtn = this.container.querySelector('.reset-btn');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => this.handleReset());
        }

        // Enter 키로 검색
        const inputs = this.container.querySelectorAll('input, select');
        inputs.forEach(input => {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.handleSearch();
                }
            });
        });
    }

    handleSearch() {
        const formData = this.getFormData();
        if (this.options.onSearch) {
            this.options.onSearch(formData);
        }
    }

    handleReset() {
        const inputs = this.container.querySelectorAll('input, select');
        inputs.forEach(input => {
            if (input.type === 'checkbox' || input.type === 'radio') {
                input.checked = false;
            } else {
                input.value = '';
            }
        });

        if (this.options.onReset) {
            this.options.onReset();
        }
    }

    getFormData() {
        const formData = {};
        const inputs = this.container.querySelectorAll('input, select');
        
        inputs.forEach(input => {
            if (input.name) {
                if (input.type === 'checkbox' || input.type === 'radio') {
                    if (input.checked) {
                        formData[input.name] = input.value;
                    }
                } else {
                    formData[input.name] = input.value;
                }
            }
        });
        
        return formData;
    }

    setFormData(data) {
        Object.keys(data).forEach(key => {
            const input = this.container.querySelector(`[name="${key}"]`);
            if (input) {
                if (input.type === 'checkbox' || input.type === 'radio') {
                    input.checked = input.value === data[key];
                } else {
                    input.value = data[key];
                }
            }
        });
    }
}

// 전역 컴포넌트 매니저 초기화
window.componentManager = new ComponentManager();

// 헬퍼 함수들
window.showModal = function(options) {
    const modal = new ModalComponent(options);
    modal.show();
    return modal;
};

window.showToast = function(message, type = 'info', duration = 3000) {
    const toast = new ToastComponent({ message, type, duration });
    return toast;
};

window.createDataTable = function(container, options) {
    return new DataTableComponent({ container, ...options });
};

window.createSearchForm = function(container, options) {
    renderPageNumbers(totalPages) {
        const pages = [];
        const maxVisible = 5;
        
        if (totalPages <= maxVisible) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            if (this.currentPage <= 3) {
                for (let i = 1; i <= 4; i++) {
                    pages.push(i);
                }
                pages.push('...');
                pages.push(totalPages);
            } else if (this.currentPage >= totalPages - 2) {
                pages.push(1);
                pages.push('...');
                for (let i = totalPages - 3; i <= totalPages; i++) {
                    pages.push(i);
                }
            } else {
                pages.push(1);
                pages.push('...');
                for (let i = this.currentPage - 1; i <= this.currentPage + 1; i++) {
                    pages.push(i);
                }
                pages.push('...');
                pages.push(totalPages);
            }
        }
        
        return pages.map(page => {
            if (page === '...') {
                return '<span class="pagination-ellipsis">...</span>';
            }
            return `
                <button class="pagination-btn ${page === this.currentPage ? 'active' : ''}" 
                        data-page="${page}">${page}</button>
            `;
        }).join('');
    }

    setupEventListeners() {
        // Search functionality
        const searchInput = this.element.querySelector('.search-input');
        if (searchInput) {
            searchInput.addEventListener('input', this.debounce((e) => {
                this.filterData(e.target.value);
            }, 300));
        }

        // Sorting
        const sortableHeaders = this.element.querySelectorAll('th.sortable');
        sortableHeaders.forEach(header => {
            header.addEventListener('click', () => {
                const column = header.getAttribute('data-column');
                this.sortData(column);
            });
        });

        // Pagination
        const paginationButtons = this.element.querySelectorAll('.pagination-btn');
        paginationButtons.forEach(button => {
            button.addEventListener('click', () => {
                const page = button.getAttribute('data-page');
                this.goToPage(page);
            });
        });
    }

    filterData(searchTerm) {
        this.filteredData = this.config.data.filter(row => {
            return Object.values(row).some(value => 
                String(value).toLowerCase().includes(searchTerm.toLowerCase())
            );
        });
        this.currentPage = 1;
        this.render();
    }

    sortData(column) {
        if (this.sortColumn === column) {
            this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            this.sortColumn = column;
            this.sortDirection = 'asc';
        }

        this.filteredData.sort((a, b) => {
            const aVal = a[column];
            const bVal = b[column];
            
            if (aVal < bVal) return this.sortDirection === 'asc' ? -1 : 1;
            if (aVal > bVal) return this.sortDirection === 'asc' ? 1 : -1;
            return 0;
        });

        this.render();
    }

    goToPage(page) {
        if (page === 'prev') {
            this.currentPage = Math.max(1, this.currentPage - 1);
        } else if (page === 'next') {
            const totalPages = Math.ceil(this.filteredData.length / this.config.pageSize);
            this.currentPage = Math.min(totalPages, this.currentPage + 1);
        } else {
            this.currentPage = parseInt(page);
        }
        
        this.render();
    }

    updateData(newData) {
        this.config.data = newData;
        this.filteredData = [...newData];
        this.currentPage = 1;
        this.render();
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

// Modal Component
class ModalComponent {
    constructor(element, config = {}) {
        this.config = {
            title: 'Modal',
            content: '',
            size: 'medium', // small, medium, large
            closable: true,
            backdrop: true,
            ...config
        };
        this.element = element;
        this.modalElement = null;
        
        this.init();
    }

    init() {
        this.createModal();
        this.setupEventListeners();
    }

    createModal() {
        this.modalElement = document.createElement('div');
        this.modalElement.className = 'modal-backdrop';
        this.modalElement.innerHTML = `
            <div class="modal modal-${this.config.size}">
                <div class="modal-header">
                    <h3 class="modal-title">${this.config.title}</h3>
                    ${this.config.closable ? '<button class="modal-close">&times;</button>' : ''}
                </div>
                <div class="modal-body">
                    ${this.config.content}
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary modal-cancel">취소</button>
                    <button class="btn btn-primary modal-confirm">확인</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(this.modalElement);
    }

    setupEventListeners() {
        const closeBtn = this.modalElement.querySelector('.modal-close');
        const cancelBtn = this.modalElement.querySelector('.modal-cancel');
        const confirmBtn = this.modalElement.querySelector('.modal-confirm');
        
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.close());
        }
        
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => this.close());
        }
        
        if (confirmBtn) {
            confirmBtn.addEventListener('click', () => this.confirm());
        }
        
        if (this.config.backdrop) {
            this.modalElement.addEventListener('click', (e) => {
                if (e.target === this.modalElement) {
                    this.close();
                }
            });
        }
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen()) {
                this.close();
            }
        });
    }

    open() {
        this.modalElement.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    close() {
        this.modalElement.classList.remove('active');
        document.body.style.overflow = '';
    }

    confirm() {
        // Trigger confirm event
        const event = new CustomEvent('modalConfirm', { detail: this });
        document.dispatchEvent(event);
        this.close();
    }

    isOpen() {
        return this.modalElement.classList.contains('active');
    }

    setContent(content) {
        const modalBody = this.modalElement.querySelector('.modal-body');
        modalBody.innerHTML = content;
    }

    setTitle(title) {
        const modalTitle = this.modalElement.querySelector('.modal-title');
        modalTitle.textContent = title;
    }
}

// Form Component
class FormComponent {
    constructor(element, config = {}) {
        this.element = element;
        this.config = {
            fields: [],
            submitUrl: '',
            method: 'POST',
            validation: true,
            ...config
        };
        this.formData = {};
        
        this.init();
    }

    init() {
        this.render();
        this.setupEventListeners();
    }

    render() {
        this.element.innerHTML = `
            <form class="form-component">
                ${this.config.fields.map(field => this.renderField(field)).join('')}
                <div class="form-actions">
                    <button type="submit" class="btn btn-primary">제출</button>
                    <button type="reset" class="btn btn-secondary">초기화</button>
                </div>
            </form>
        `;
    }

    renderField(field) {
        const fieldId = `field-${field.name}`;
        let inputHTML = '';
        
        switch (field.type) {
            case 'text':
            case 'email':
            case 'password':
            case 'number':
                inputHTML = `<input type="${field.type}" id="${fieldId}" name="${field.name}" 
                                   class="form-control" ${field.required ? 'required' : ''}>`;
                break;
            case 'textarea':
                inputHTML = `<textarea id="${fieldId}" name="${field.name}" 
                                       class="form-control" ${field.required ? 'required' : ''}></textarea>`;
                break;
            case 'select':
                inputHTML = `
                    <select id="${fieldId}" name="${field.name}" class="form-control" ${field.required ? 'required' : ''}>
                        <option value="">선택하세요</option>
                        ${field.options.map(option => 
                            `<option value="${option.value}">${option.label}</option>`
                        ).join('')}
                    </select>
                `;
                break;
            case 'checkbox':
                inputHTML = `
                    <div class="checkbox-group">
                        ${field.options.map(option => `
                            <label class="checkbox-item">
                                <input type="checkbox" name="${field.name}" value="${option.value}">
                                <span>${option.label}</span>
                            </label>
                        `).join('')}
                    </div>
                `;
                break;
            case 'radio':
                inputHTML = `
                    <div class="radio-group">
                        ${field.options.map(option => `
                            <label class="radio-item">
                                <input type="radio" name="${field.name}" value="${option.value}">
                                <span>${option.label}</span>
                            </label>
                        `).join('')}
                    </div>
                `;
                break;
        }
        
        return `
            <div class="form-field">
                <label for="${fieldId}" class="form-label">${field.label}</label>
                ${inputHTML}
                ${field.helpText ? `<small class="form-help">${field.helpText}</small>` : ''}
                <div class="form-error"></div>
            </div>
        `;
    }

    setupEventListeners() {
        const form = this.element.querySelector('form');
        
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSubmit();
        });
        
        form.addEventListener('reset', () => {
            this.clearErrors();
        });
    }

    handleSubmit() {
        if (this.config.validation && !this.validateForm()) {
            return;
        }
        
        this.collectFormData();
        this.submitForm();
    }

    validateForm() {
        this.clearErrors();
        let isValid = true;
        
        this.config.fields.forEach(field => {
            const element = this.element.querySelector(`[name="${field.name}"]`);
            if (!element) return;
            
            const value = this.getElementValue(element);
            
            if (field.required && !value) {
                this.showFieldError(field.name, '이 필드는 필수입니다.');
                isValid = false;
            } else if (field.validation) {
                const validationResult = field.validation(value);
                if (validationResult !== true) {
                    this.showFieldError(field.name, validationResult);
                    isValid = false;
                }
            }
        });
        
        return isValid;
    }

    getElementValue(element) {
        if (element.type === 'checkbox') {
            return Array.from(this.element.querySelectorAll(`[name="${element.name}"]:checked`))
                       .map(cb => cb.value);
        } else if (element.type === 'radio') {
            const checked = this.element.querySelector(`[name="${element.name}"]:checked`);
            return checked ? checked.value : '';
        } else {
            return element.value;
        }
    }

    showFieldError(fieldName, message) {
        const field = this.element.querySelector(`[name="${fieldName}"]`).closest('.form-field');
        const errorDiv = field.querySelector('.form-error');
        errorDiv.textContent = message;
        field.classList.add('has-error');
    }

    clearErrors() {
        this.element.querySelectorAll('.form-field').forEach(field => {
            field.classList.remove('has-error');
            field.querySelector('.form-error').textContent = '';
        });
    }

    collectFormData() {
        this.formData = {};
        
        this.config.fields.forEach(field => {
            const element = this.element.querySelector(`[name="${field.name}"]`);
            if (element) {
                this.formData[field.name] = this.getElementValue(element);
            }
        });
    }

    async submitForm() {
        try {
            const response = await fetch(this.config.submitUrl, {
                method: this.config.method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(this.formData)
            });
            
            if (response.ok) {
                const result = await response.json();
                this.handleSuccess(result);
            } else {
                this.handleError('제출에 실패했습니다.');
            }
        } catch (error) {
            this.handleError('네트워크 오류가 발생했습니다.');
        }
    }

    handleSuccess(result) {
        // Trigger success event
        const event = new CustomEvent('formSuccess', { detail: { result, formData: this.formData } });
        document.dispatchEvent(event);
    }

    handleError(message) {
        // Trigger error event
        const event = new CustomEvent('formError', { detail: { message, formData: this.formData } });
        document.dispatchEvent(event);
    }
}

// Initialize component manager
document.addEventListener('DOMContentLoaded', () => {
    window.componentManager = new ComponentManager();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ComponentManager, DataTableComponent, ModalComponent, FormComponent };
} 