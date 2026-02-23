// Sajigaz Designs — Cart Management

const CART_KEY = 'sajigaz_cart';

const Cart = {
    items: [],

    init() {
        const saved = localStorage.getItem(CART_KEY);
        this.items = saved ? JSON.parse(saved) : [];
        this.updateUI();
    },

    save() {
        localStorage.setItem(CART_KEY, JSON.stringify(this.items));
        this.updateUI();
    },

    add(productId, qty = 1) {
        const product = getProductById(productId);
        if (!product) return;
        const existing = this.items.find(i => i.id === product.id);
        if (existing) {
            existing.qty += qty;
        } else {
            this.items.push({ id: product.id, name: product.name, price: product.price, image: product.image, qty });
        }
        this.save();
        this.showAddedFeedback(productId);
    },

    remove(productId) {
        this.items = this.items.filter(i => i.id !== parseInt(productId));
        this.save();
    },

    updateQty(productId, qty) {
        const item = this.items.find(i => i.id === parseInt(productId));
        if (item) {
            item.qty = parseInt(qty);
            if (item.qty <= 0) this.remove(productId);
            else this.save();
        }
    },

    getTotal() {
        return this.items.reduce((sum, i) => sum + (i.price * i.qty), 0);
    },

    getCount() {
        return this.items.reduce((sum, i) => sum + i.qty, 0);
    },

    clear() {
        this.items = [];
        this.save();
    },

    updateUI() {
        const countEls = document.querySelectorAll('.cart-count');
        countEls.forEach(el => {
            const count = this.getCount();
            el.textContent = count;
            el.style.display = count > 0 ? 'flex' : 'none';
        });
    },

    showAddedFeedback(productId) {
        // Floating icon burst
        const btn = document.querySelector(`[data-product-id="${productId}"] .btn-add-cart, #btn-add-to-cart`);
        if (!btn) return;
        const rect = btn.getBoundingClientRect();
        const burst = document.createElement('div');
        burst.className = 'cart-burst';
        burst.style.cssText = `
            position:fixed;
            left:${rect.left + rect.width / 2}px;
            top:${rect.top}px;
            pointer-events:none;
            z-index:9999;
            transform:translateX(-50%);
            width:28px;
            height:28px;
            background:var(--magenta);
            border-radius:50%;
            display:flex;
            align-items:center;
            justify-content:center;
        `;
        // Inner icon
        const icon = document.createElement('span');
        icon.className = 'material-symbols-outlined';
        icon.textContent = 'shopping_bag';
        icon.style.cssText = 'color:white;font-size:1rem;font-variation-settings:\'FILL\' 1,\'wght\' 100,\'GRAD\' 0,\'opsz\' 20;';
        burst.appendChild(icon);
        document.body.appendChild(burst);
        if (window.gsap) {
            gsap.to(burst, {
                y: -80, opacity: 0, scale: 1.5, duration: 0.9, ease: 'power2.out',
                onComplete: () => burst.remove()
            });
        } else {
            setTimeout(() => burst.remove(), 900);
        }

        // Sparkle on button
        btn.classList.add('added-pulse');
        setTimeout(() => btn.classList.remove('added-pulse'), 700);

        // Toast
        this.showToast('Added to cart!');
    },

    showToast(msg) {
        let toast = document.getElementById('cart-toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'cart-toast';
            document.body.appendChild(toast);
        }
        toast.textContent = msg;
        toast.classList.add('show');
        clearTimeout(this._toastTimer);
        this._toastTimer = setTimeout(() => toast.classList.remove('show'), 2500);
    }
};

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    if (typeof getProductById === 'undefined') return; // products.js not loaded
    Cart.init();
});
