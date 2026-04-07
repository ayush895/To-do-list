// Todo App
class TodoApp {
    constructor() {
        this.todos = [];
        this.currentFilter = 'all';
        this.currentSort = 'created-new';
        this.searchQuery = '';
        this.editingId = null;

        this.initElements();
        this.loadTodos();
        this.attachEventListeners();
        this.render();
    }

    initElements() {
        this.todoTitle = document.getElementById('todoTitle');
        this.todoDescription = document.getElementById('todoDescription');
        this.todoDueDate = document.getElementById('todoDueDate');
        this.addBtn = document.getElementById('addBtn');
        this.todosList = document.getElementById('todosList');
        this.emptyState = document.getElementById('emptyState');
        this.searchInput = document.getElementById('searchInput');
        this.sortSelect = document.getElementById('sortSelect');
        this.filterBtns = document.querySelectorAll('.filter-btn');

        this.editModal = document.getElementById('editModal');
        this.deleteModal = document.getElementById('deleteModal');
        this.editTitle = document.getElementById('editTitle');
        this.editDescription = document.getElementById('editDescription');
        this.editDueDate = document.getElementById('editDueDate');
        this.saveBtn = document.getElementById('saveBtn');
        this.cancelBtn = document.getElementById('cancelBtn');
        this.closeModal = document.getElementById('closeModal');
        this.confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
        this.cancelDeleteBtn = document.getElementById('cancelDeleteBtn');

        this.totalCount = document.getElementById('totalCount');
        this.activeCount = document.getElementById('activeCount');
        this.completedCount = document.getElementById('completedCount');
    }

    attachEventListeners() {
        this.addBtn.addEventListener('click', () => this.addTodo());
        this.todoTitle.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTodo();
        });

        this.searchInput.addEventListener('input', (e) => {
            this.searchQuery = e.target.value.toLowerCase();
            this.render();
        });

        this.sortSelect.addEventListener('change', (e) => {
            this.currentSort = e.target.value;
            this.render();
        });

        this.filterBtns.forEach((btn) => {
            btn.addEventListener('click', (e) => {
                this.filterBtns.forEach((b) => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentFilter = e.target.dataset.filter;
                this.render();
            });
        });

        this.saveBtn.addEventListener('click', () => this.saveEdit());
        this.cancelBtn.addEventListener('click', () => this.closeEditModal());
        this.closeModal.addEventListener('click', () => this.closeEditModal());

        this.confirmDeleteBtn.addEventListener('click', () => this.confirmDelete());
        this.cancelDeleteBtn.addEventListener('click', () => this.closeDeleteModal());

        // Close modals when clicking outside
        this.editModal.addEventListener('click', (e) => {
            if (e.target === this.editModal) this.closeEditModal();
        });

        this.deleteModal.addEventListener('click', (e) => {
            if (e.target === this.deleteModal) this.closeDeleteModal();
        });
    }

    addTodo() {
        const title = this.todoTitle.value.trim();
        const description = this.todoDescription.value.trim();
        const dueDate = this.todoDueDate.value;

        if (!title) {
            alert('Please enter a todo title');
            return;
        }

        const todo = {
            id: Date.now(),
            title,
            description,
            dueDate: dueDate || null,
            completed: false,
            createdAt: new Date().toISOString(),
        };

        this.todos.unshift(todo);
        this.saveTodos();
        this.clearInputs();
        this.render();
    }

    clearInputs() {
        this.todoTitle.value = '';
        this.todoDescription.value = '';
        this.todoDueDate.value = '';
        this.todoTitle.focus();
    }

    toggleComplete(id) {
        const todo = this.todos.find((t) => t.id === id);
        if (todo) {
            todo.completed = !todo.completed;
            this.saveTodos();
            this.render();
        }
    }

    deleteTodo(id) {
        this.editingId = id;
        this.deleteModal.style.display = 'flex';
    }

    confirmDelete() {
        this.todos = this.todos.filter((t) => t.id !== this.editingId);
        this.saveTodos();
        this.closeDeleteModal();
        this.render();
    }

    closeDeleteModal() {
        this.deleteModal.style.display = 'none';
        this.editingId = null;
    }

    editTodo(id) {
        const todo = this.todos.find((t) => t.id === id);
        if (todo) {
            this.editingId = id;
            this.editTitle.value = todo.title;
            this.editDescription.value = todo.description;
            this.editDueDate.value = todo.dueDate || '';
            this.editModal.style.display = 'flex';
            this.editTitle.focus();
        }
    }

    saveEdit() {
        const todo = this.todos.find((t) => t.id === this.editingId);
        if (todo) {
            todo.title = this.editTitle.value.trim();
            todo.description = this.editDescription.value.trim();
            todo.dueDate = this.editDueDate.value || null;
            this.saveTodos();
            this.closeEditModal();
            this.render();
        }
    }

    closeEditModal() {
        this.editModal.style.display = 'none';
        this.editingId = null;
    }

    getFilteredAndSortedTodos() {
        let filtered = this.todos;

        // Apply filter
        if (this.currentFilter === 'active') {
            filtered = filtered.filter((t) => !t.completed);
        } else if (this.currentFilter === 'completed') {
            filtered = filtered.filter((t) => t.completed);
        }

        // Apply search
        if (this.searchQuery) {
            filtered = filtered.filter((t) => {
                const titleMatch = t.title.toLowerCase().includes(this.searchQuery);
                const descMatch = t.description.toLowerCase().includes(this.searchQuery);
                return titleMatch || descMatch;
            });
        }

        // Apply sort
        filtered.sort((a, b) => {
            if (this.currentSort === 'created-new') {
                return new Date(b.createdAt) - new Date(a.createdAt);
            } else if (this.currentSort === 'created-old') {
                return new Date(a.createdAt) - new Date(b.createdAt);
            } else if (this.currentSort === 'due-date') {
                const aDate = a.dueDate ? new Date(a.dueDate) : new Date(9999, 0, 1);
                const bDate = b.dueDate ? new Date(b.dueDate) : new Date(9999, 0, 1);
                return aDate - bDate;
            }
            return 0;
        });

        return filtered;
    }

    updateStats() {
        const total = this.todos.length;
        const completed = this.todos.filter((t) => t.completed).length;
        const active = total - completed;

        this.totalCount.textContent = total;
        this.activeCount.textContent = active;
        this.completedCount.textContent = completed;
    }

    formatDate(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    }

    render() {
        this.updateStats();
        const filtered = this.getFilteredAndSortedTodos();

        if (filtered.length === 0) {
            this.todosList.innerHTML = '';
            this.emptyState.style.display = 'block';
            return;
        }

        this.emptyState.style.display = 'none';

        this.todosList.innerHTML = filtered
            .map(
                (todo) => `
                <div class="todo-item ${todo.completed ? 'completed' : ''}">
                    <div class="todo-checkbox">
                        <input 
                            type="checkbox" 
                            ${todo.completed ? 'checked' : ''}
                            aria-label="Mark ${todo.title} as complete"
                            onchange="app.toggleComplete(${todo.id})"
                        >
                    </div>
                    <div class="todo-content">
                        <h3 class="todo-title">${this.escapeHtml(todo.title)}</h3>
                        ${
                            todo.description
                                ? `<p class="todo-description">${this.escapeHtml(
                                      todo.description
                                  )}</p>`
                                : ''
                        }
                        <div class="todo-meta">
                            <span class="todo-date">Created: ${this.formatDate(
                                todo.createdAt
                            )}</span>
                            ${
                                todo.dueDate
                                    ? `<span class="todo-due-date">Due: ${this.formatDate(
                                          todo.dueDate
                                      )}</span>`
                                    : ''
                            }
                        </div>
                    </div>
                    <div class="todo-actions">
                        <button 
                            class="btn-icon edit-btn" 
                            onclick="app.editTodo(${todo.id})"
                            aria-label="Edit ${todo.title}"
                            title="Edit"
                        >
                            ✎
                        </button>
                        <button 
                            class="btn-icon delete-btn" 
                            onclick="app.deleteTodo(${todo.id})"
                            aria-label="Delete ${todo.title}"
                            title="Delete"
                        >
                            ✕
                        </button>
                    </div>
                </div>
            `
            )
            .join('');
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    saveTodos() {
        localStorage.setItem('todos', JSON.stringify(this.todos));
    }

    loadTodos() {
        const stored = localStorage.getItem('todos');
        this.todos = stored ? JSON.parse(stored) : [];
    }
}

// Initialize app when DOM is ready
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new TodoApp();
});
