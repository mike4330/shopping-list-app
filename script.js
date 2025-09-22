class ShoppingList {
    constructor() {
        this.items = this.loadItems();
        this.initializeElements();
        this.bindEvents();
        this.render();
    }

    initializeElements() {
        this.itemInput = document.getElementById('itemInput');
        this.addBtn = document.getElementById('addBtn');
        this.shoppingList = document.getElementById('shoppingList');
        this.itemCount = document.getElementById('itemCount');
        this.clearBtn = document.getElementById('clearBtn');
    }

    bindEvents() {
        this.addBtn.addEventListener('click', () => this.addItem());
        this.itemInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addItem();
        });
        this.clearBtn.addEventListener('click', () => this.clearAll());
    }

    addItem() {
        const text = this.itemInput.value.trim();
        if (text === '') return;

        const item = {
            id: Date.now(),
            text: text,
            completed: false
        };

        this.items.push(item);
        this.itemInput.value = '';
        this.saveItems();
        this.render();
    }

    toggleItem(id) {
        const item = this.items.find(item => item.id === id);
        if (item) {
            item.completed = !item.completed;
            this.saveItems();
            this.render();
        }
    }

    deleteItem(id) {
        this.items = this.items.filter(item => item.id !== id);
        this.saveItems();
        this.render();
    }

    clearAll() {
        if (this.items.length === 0) return;

        if (confirm('Are you sure you want to clear all items?')) {
            this.items = [];
            this.saveItems();
            this.render();
        }
    }

    render() {
        this.shoppingList.innerHTML = '';

        if (this.items.length === 0) {
            this.showEmptyState();
        } else {
            this.items.forEach(item => {
                const li = this.createItemElement(item);
                this.shoppingList.appendChild(li);
            });
        }

        this.updateItemCount();
    }

    createItemElement(item) {
        const li = document.createElement('li');
        li.className = `shopping-item ${item.completed ? 'completed' : ''}`;

        li.innerHTML = `
            <input type="checkbox" class="item-checkbox" ${item.completed ? 'checked' : ''}>
            <span class="item-text">${this.escapeHtml(item.text)}</span>
            <button class="delete-btn">×</button>
        `;

        const checkbox = li.querySelector('.item-checkbox');
        const deleteBtn = li.querySelector('.delete-btn');

        checkbox.addEventListener('change', () => this.toggleItem(item.id));
        deleteBtn.addEventListener('click', () => this.deleteItem(item.id));

        return li;
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

    saveItems() {
        localStorage.setItem('shoppingList', JSON.stringify(this.items));
    }

    loadItems() {
        const stored = localStorage.getItem('shoppingList');
        return stored ? JSON.parse(stored) : [];
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new ShoppingList();
});