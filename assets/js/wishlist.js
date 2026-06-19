// Sajigaz Designs — Wishlist (Favorites) Management

const WISHLIST_KEY = 'sajigaz_wishlist';

const Wishlist = {
    items: [], // list of product IDs (numbers)

    init() {
        const saved = localStorage.getItem(WISHLIST_KEY);
        this.items = saved ? JSON.parse(saved) : [];
        this.updateUI();
    },

    save() {
        localStorage.setItem(WISHLIST_KEY, JSON.stringify(this.items));
        this.updateUI();
    },

    toggle(productId) {
        const id = parseInt(productId);
        if (isNaN(id)) return;
        const index = this.items.indexOf(id);
        if (index === -1) {
            this.items.push(id);
            this.showAddedFeedback(id);
        } else {
            this.items.splice(index, 1);
        }
        this.save();

        // Pulse animation on the clicked button
        const btn = document.querySelector(`[data-product-id="${id}"] .wishlist-btn`);
        if (btn && window.gsap) {
            gsap.from(btn, { scale: 0.5, duration: 0.4, ease: 'back.out(3)' });
        }
    },

    has(productId) {
        return this.items.includes(parseInt(productId));
    },

    getItems() {
        if (typeof PRODUCTS === 'undefined') return [];
        return this.items.map(id => getProductById(id)).filter(p => p !== null && p !== undefined);
    },

    getCount() {
        return this.items.length;
    },

    clear() {
        this.items = [];
        this.save();
    },

    updateUI() {
        // Update all wishlist buttons on the current page
        document.querySelectorAll('.product-card').forEach(card => {
            const id = parseInt(card.dataset.productId);
            if (id) {
                const btn = card.querySelector('.wishlist-btn');
                if (btn) {
                    const icon = btn.querySelector('.material-symbols-outlined');
                    if (this.has(id)) {
                        btn.classList.add('active');
                        if (icon) {
                            icon.textContent = 'favorite';
                            icon.classList.add('ms-fill');
                        }
                    } else {
                        btn.classList.remove('active');
                        if (icon) {
                            icon.textContent = 'favorite_border';
                            icon.classList.remove('ms-fill');
                        }
                    }
                }
            }
        });

        // Update wishlist count badges in headers
        const countEls = document.querySelectorAll('.wishlist-count');
        countEls.forEach(el => {
            const count = this.getCount();
            el.textContent = count;
            el.style.display = count > 0 ? 'flex' : 'none';
        });
    },

    showAddedFeedback(productId) {
        const btn = document.querySelector(`[data-product-id="${productId}"] .wishlist-btn`);
        if (!btn) return;
        
        // Floating heart burst
        const rect = btn.getBoundingClientRect();
        const burst = document.createElement('div');
        burst.className = 'wishlist-burst';
        burst.style.cssText = `
            position:fixed;
            left:${rect.left + rect.width / 2}px;
            top:${rect.top}px;
            pointer-events:none;
            z-index:9999;
            transform:translateX(-50%);
            width:24px;
            height:24px;
            background:var(--magenta);
            border-radius:50%;
            display:flex;
            align-items:center;
            justify-content:center;
        `;
        
        const icon = document.createElement('span');
        icon.className = 'material-symbols-outlined';
        icon.textContent = 'favorite';
        icon.style.cssText = 'color:white;font-size:0.9rem;font-variation-settings:\'FILL\' 1,\'wght\' 100;';
        burst.appendChild(icon);
        document.body.appendChild(burst);
        
        if (window.gsap) {
            gsap.to(burst, {
                y: -60, opacity: 0, scale: 1.5, duration: 0.8, ease: 'power2.out',
                onComplete: () => burst.remove()
            });
        } else {
            setTimeout(() => burst.remove(), 800);
        }
    }
};

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    if (typeof getProductById === 'undefined') return;
    Wishlist.init();
});
