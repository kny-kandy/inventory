// PlusMore Admin - Reusable Components
class ComponentManager {
    constructor() {
        this.components = new Map();
        this.init();
    }

    init() {
        this.registerComponents();
        this.initializeComponents();
    }

    registerComponents() {
        // Register all available components
        this.registerComponent('DataTable', DataTableComponent);
        this.registerComponent('Modal', ModalComponent);
        this.registerComponent('Form', FormComponent);
        this.registerComponent('Chart', ChartComponent);
        this.registerComponent('Pagination', PaginationComponent);
        this.registerComponent('Dropdown', DropdownComponent);
        this.registerComponent('Tabs', TabsComponent);
        this.registerComponent('Accordion', AccordionComponent);
        this.registerComponent('Toast', ToastComponent);
        this.registerComponent('Loading', LoadingComponent);
    }

    registerComponent(name, componentClass) {
        this.components.set(name, componentClass);
    }

    initializeComponents() {
        // Initialize components based on data attributes
        document.querySelectorAll('[data-component]').forEach(element => {
            const componentName = element.getAttribute('data-component');
            const componentClass = this.components.get(componentName);
            
            if (componentClass) {
                const config = this.parseComponentConfig(element);
                new componentClass(element, config);
            }
        });
    }

    parseComponentConfig(element) {
        const config = {};
        const configAttr = element.getAttribute('data-config');
        
        if (configAttr) {
            try {
                Object.assign(config, JSON.parse(configAttr));
            } catch (e) {
                console.warn('Invalid component config:', configAttr);
            }
        }
        
        return config;
    }

    createComponent(name, config = {}) {
        const componentClass = this.components.get(name);
        if (componentClass) {
            return new componentClass(null, config);
        }
        throw new Error(`Component '${name}' not found`);
    }
}

// Data Table Component
class DataTableComponent {
    constructor(element, config = {}) {
        this.element = element;
        this.config = {
            columns: [],
            data: [],
            pageSize: 10,
            sortable: true,
            searchable: true,
            ...config
        };
        this.currentPage = 1;
        this.sortColumn = null;
        this.sortDirection = 'asc';
        this.filteredData = [];
        
        this.init();
    }

    init() {
        if (this.element) {
            this.render();
            this.setupEventListeners();
        }
    }

    render() {
        this.element.innerHTML = `
            <div class="data-table-container">
                ${this.config.searchable ? this.renderSearch() : ''}
                <div class="data-table-wrapper">
                    <table class="data-table">
                        <thead>
                            <tr>
                                ${this.config.columns.map(col => `
                                    <th class="${col.sortable !== false ? 'sortable' : ''}" 
                                        data-column="${col.key}">
                                        ${col.label}
                                        ${col.sortable !== false ? '<i class="fas fa-sort"></i>' : ''}
                                    </th>
                                `).join('')}
                            </tr>
                        </thead>
                        <tbody>
                            ${this.renderRows()}
                        </tbody>
                    </table>
                </div>
                ${this.renderPagination()}
            </div>
        `;
    }

    renderSearch() {
        return `
            <div class="data-table-search">
                <input type="text" class="search-input" placeholder="검색...">
                <i class="fas fa-search"></i>
            </div>
        `;
    }

    renderRows() {
        const startIndex = (this.currentPage - 1) * this.config.pageSize;
        const endIndex = startIndex + this.config.pageSize;
        const pageData = this.filteredData.slice(startIndex, endIndex);

        return pageData.map(row => `
            <tr>
                ${this.config.columns.map(col => `
                    <td>${this.formatCell(row[col.key], col)}</td>
                `).join('')}
            </tr>
        `).join('');
    }

    formatCell(value, column) {
        if (column.formatter) {
            return column.formatter(value);
        }
        
        if (column.type === 'date') {
            return new Date(value).toLocaleDateString('ko-KR');
        }
        
        if (column.type === 'currency') {
            return new Intl.NumberFormat('ko-KR', {
                style: 'currency',
                currency: 'KRW'
            }).format(value);
        }
        
        return value;
    }

    renderPagination() {
        const totalPages = Math.ceil(this.filteredData.length / this.config.pageSize);
        
        if (totalPages <= 1) return '';
        
        return `
            <div class="data-table-pagination">
                <button class="pagination-btn" data-page="prev" ${this.currentPage === 1 ? 'disabled' : ''}>
                    <i class="fas fa-chevron-left"></i>
                </button>
                ${this.renderPageNumbers(totalPages)}
                <button class="pagination-btn" data-page="next" ${this.currentPage === totalPages ? 'disabled' : ''}>
                    <i class="fas fa-chevron-right"></i>
                </button>
            </div>
        `;
    }

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