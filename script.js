class UserManager {
    constructor() {
        this.currentUser = this.getCurrentUser();
        this.initializeUserSelection();
    }

    getCurrentUser() {
        return this.getCookie('shopping_user');
    }

    setCookie(name, value, days = 30) {
        const expires = new Date();
        expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
        document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
    }

    getCookie(name) {
        const nameEQ = name + "=";
        const cookies = document.cookie.split(';');
        for (let cookie of cookies) {
            cookie = cookie.trim();
            if (cookie.indexOf(nameEQ) === 0) {
                return cookie.substring(nameEQ.length);
            }
        }
        return null;
    }

    selectUser(username) {
        this.setCookie('shopping_user', username);
        this.currentUser = username;
        this.showApp();
    }

    showUserSelection() {
        this.clearUserCookie();
        this.currentUser = null;

        // Reset the shopping list instance so it gets new user context
        if (this.shoppingList) {
            this.shoppingList = null;
        }

        document.getElementById('userSelection').style.display = 'flex';
        document.getElementById('appContainer').style.display = 'none';
    }

    clearUserCookie() {
        // Multiple approaches to ensure cookie is cleared
        document.cookie = 'shopping_user=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        document.cookie = 'shopping_user=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=' + window.location.hostname + ';';
        document.cookie = 'shopping_user=; max-age=0; path=/;';
        document.cookie = 'shopping_user=; max-age=0; path=/; domain=' + window.location.hostname + ';';
    }

    showApp() {
        document.getElementById('userSelection').style.display = 'none';
        document.getElementById('appContainer').style.display = 'block';
        document.getElementById('currentUser').textContent = this.currentUser;

        const avatarMap = {
            'Dad': '👨',
            'Mom': '👩',
            'Declan': '👦',
            'Leia': '👧'
        };

        const avatarElement = document.getElementById('currentUserAvatar');
        avatarElement.textContent = avatarMap[this.currentUser] || '👤';
        avatarElement.setAttribute('data-user', this.currentUser);

        // Always create a new ShoppingList instance to ensure fresh user context
        this.shoppingList = new ShoppingList();
    }

    initializeUserSelection() {
        const userButtons = document.querySelectorAll('.user-button');
        userButtons.forEach(button => {
            button.addEventListener('click', () => {
                const username = button.getAttribute('data-user');
                this.selectUser(username);
            });
        });

        const switchUserBtn = document.getElementById('switchUser');
        if (switchUserBtn) {
            switchUserBtn.addEventListener('click', () => this.showUserSelection());
        }

        if (this.currentUser) {
            this.showApp();
        } else {
            this.showUserSelection();
        }
    }
}

class ShoppingList {
    constructor() {
        this.items = [];
        this.sortType = 'date';
        this.sortReverse = false;
        this.currentUser = this.getCurrentUser();
        this.initializeElements();
        this.bindEvents();
        this.loadItems();
    }

    getCurrentUser() {
        const nameEQ = 'shopping_user=';
        const cookies = document.cookie.split(';');
        for (let cookie of cookies) {
            cookie = cookie.trim();
            if (cookie.indexOf(nameEQ) === 0) {
                return cookie.substring(nameEQ.length);
            }
        }
        return 'Unknown';
    }

    initializeElements() {
        this.itemInput = document.getElementById('itemInput');
        this.addBtn = document.getElementById('addBtn');
        this.shoppingList = document.getElementById('shoppingList');
        this.itemCount = document.getElementById('itemCount');
        this.clearBtn = document.getElementById('clearBtn');
        this.sortAlphaBtn = document.getElementById('sortAlpha');
        this.sortDateBtn = document.getElementById('sortDate');
    }

    bindEvents() {
        this.addBtn.addEventListener('click', () => this.addItem());
        this.itemInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addItem();
        });
        this.clearBtn.addEventListener('click', () => this.clearAll());
        this.sortAlphaBtn.addEventListener('click', () => this.toggleSort('alpha'));
        this.sortDateBtn.addEventListener('click', () => this.toggleSort('date'));
    }

    async loadItems() {
        try {
            const response = await fetch('api.php');
            this.items = await response.json();
            this.render();
        } catch (error) {
            console.error('Error loading items:', error);
            this.items = [];
            this.render();
        }
    }

    async addItem() {
        const text = this.itemInput.value.trim();
        if (text === '') return;

        try {
            const response = await fetch('api.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'add',
                    text: text,
                    addedBy: this.currentUser
                })
            });
            this.items = await response.json();
            this.itemInput.value = '';
            this.render();
        } catch (error) {
            console.error('Error adding item:', error);
        }
    }

    async toggleItem(id) {
        try {
            const response = await fetch('api.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'toggle', id: id })
            });
            this.items = await response.json();
            this.render();
        } catch (error) {
            console.error('Error toggling item:', error);
        }
    }

    async deleteItem(id) {
        try {
            const response = await fetch('api.php', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: id })
            });
            this.items = await response.json();
            this.render();
        } catch (error) {
            console.error('Error deleting item:', error);
        }
    }

    async clearAll() {
        if (this.items.length === 0) return;

        if (confirm('Are you sure you want to clear all items?')) {
            for (const item of this.items) {
                await this.deleteItem(item.id);
            }
        }
    }

    toggleSort(type) {
        if (this.sortType === type) {
            this.sortReverse = !this.sortReverse;
        } else {
            this.sortType = type;
            this.sortReverse = false;
        }
        this.updateSortButtons();
        this.render();
    }

    updateSortButtons() {
        this.sortAlphaBtn.classList.toggle('active', this.sortType === 'alpha');
        this.sortDateBtn.classList.toggle('active', this.sortType === 'date');

        this.sortAlphaBtn.classList.toggle('reverse', this.sortType === 'alpha' && this.sortReverse);
        this.sortDateBtn.classList.toggle('reverse', this.sortType === 'date' && this.sortReverse);

        this.sortAlphaBtn.textContent = this.sortType === 'alpha' && this.sortReverse ? '📝 Z-A' : '📝 A-Z';
        this.sortDateBtn.textContent = this.sortType === 'date' && this.sortReverse ? '🕒 Oldest' : '🕒 Newest';
    }

    getSortedItems() {
        const sorted = [...this.items];

        if (this.sortType === 'alpha') {
            sorted.sort((a, b) => a.text.localeCompare(b.text));
        } else {
            sorted.sort((a, b) => b.id - a.id);
        }

        if (this.sortReverse) {
            sorted.reverse();
        }

        return sorted;
    }

    render() {
        this.shoppingList.innerHTML = '';
        this.updateSortButtons();

        const sortedItems = this.getSortedItems();

        if (sortedItems.length === 0) {
            this.showEmptyState();
        } else {
            sortedItems.forEach(item => {
                const li = this.createItemElement(item);
                this.shoppingList.appendChild(li);
            });
        }

        this.updateItemCount();
    }

    createItemElement(item) {
        const li = document.createElement('li');
        li.className = `shopping-item ${item.completed ? 'completed' : ''}`;

        const timeAgo = this.getTimeAgo(item.addedAt || item.id / 1000);
        const addedBy = item.addedBy || 'Unknown';

        li.innerHTML = `
            <input type="checkbox" class="item-checkbox" ${item.completed ? 'checked' : ''}>
            <div class="item-content">
                <span class="item-text">${this.escapeHtml(item.text)}</span>
                <div class="item-meta">
                    <span class="item-user">${this.escapeHtml(addedBy)}</span>
                    <span class="item-time">${timeAgo}</span>
                </div>
            </div>
            <button class="delete-btn">×</button>
        `;

        const checkbox = li.querySelector('.item-checkbox');
        const deleteBtn = li.querySelector('.delete-btn');

        checkbox.addEventListener('change', () => this.toggleItem(item.id));
        deleteBtn.addEventListener('click', () => this.deleteItem(item.id));

        return li;
    }

    getTimeAgo(timestamp) {
        const now = Date.now() / 1000;
        const diff = now - timestamp;

        if (diff < 60) return 'just now';
        if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
        if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;

        const date = new Date(timestamp * 1000);
        return date.toLocaleDateString();
    }

    showEmptyState() {
        const emptyDiv = document.createElement('div');
        emptyDiv.className = 'empty-state';
        emptyDiv.innerHTML = `
            <p>📝 Your shopping list is empty</p>
            <span>Add some items to get started!</span>
        `;
        this.shoppingList.appendChild(emptyDiv);
    }

    updateItemCount() {
        const total = this.items.length;
        const completed = this.items.filter(item => item.completed).length;
        const remaining = total - completed;

        if (total === 0) {
            this.itemCount.textContent = '0 items';
        } else {
            this.itemCount.textContent = `${remaining} of ${total} items`;
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new UserManager();
});