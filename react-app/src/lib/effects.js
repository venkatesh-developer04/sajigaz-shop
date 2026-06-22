// Imperative UI feedback ported 1:1 from the original cart.js / wishlist.js /
// checkout.html. These create transient DOM nodes appended to <body> and use
// the global GSAP (window.gsap) exactly as before, so the look/feel is identical.

export function showToast(msg) {
    let toast = document.getElementById('cart-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'cart-toast';
        document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(showToast._timer);
    showToast._timer = setTimeout(() => toast.classList.remove('show'), 2500);
}

export function cartBurst(productId) {
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
    const icon = document.createElement('span');
    icon.className = 'material-symbols-outlined';
    icon.textContent = 'shopping_bag';
    icon.style.cssText = "color:white;font-size:1rem;font-variation-settings:'FILL' 1,'wght' 100,'GRAD' 0,'opsz' 20;";
    burst.appendChild(icon);
    document.body.appendChild(burst);
    if (window.gsap) {
        window.gsap.to(burst, {
            y: -80, opacity: 0, scale: 1.5, duration: 0.9, ease: 'power2.out',
            onComplete: () => burst.remove()
        });
    } else {
        setTimeout(() => burst.remove(), 900);
    }

    // Sparkle on button
    btn.classList.add('added-pulse');
    setTimeout(() => btn.classList.remove('added-pulse'), 700);
}

export function wishlistBurst(productId) {
    const btn = document.querySelector(`[data-product-id="${productId}"] .wishlist-btn`);
    if (!btn) return;
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
    icon.style.cssText = "color:white;font-size:0.9rem;font-variation-settings:'FILL' 1,'wght' 100;";
    burst.appendChild(icon);
    document.body.appendChild(burst);

    if (window.gsap) {
        window.gsap.to(burst, {
            y: -60, opacity: 0, scale: 1.5, duration: 0.8, ease: 'power2.out',
            onComplete: () => burst.remove()
        });
    } else {
        setTimeout(() => burst.remove(), 800);
    }
}

export function launchConfetti() {
    const colors = ['#5C2D91', '#E1173F', '#F5A623', '#FFD166', '#FF6B9D', '#7B3FC7'];
    for (let i = 0; i < 60; i++) {
        const piece = document.createElement('div');
        piece.className = 'confetti-piece';
        piece.style.left = Math.random() * 100 + 'vw';
        piece.style.top = '-20px';
        piece.style.background = colors[Math.floor(Math.random() * colors.length)];
        piece.style.animationDelay = (Math.random() * 0.6) + 's';
        piece.style.animationDuration = (1 + Math.random() * 0.8) + 's';
        piece.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
        piece.style.width = (8 + Math.random() * 10) + 'px';
        piece.style.height = (8 + Math.random() * 10) + 'px';
        document.body.appendChild(piece);
        setTimeout(() => piece.remove(), 2000);
    }
}

// Desktop-only WhatsApp link rewrite, ported from product/checkout/bulk-order.
// Rewrites wa.me links to web.whatsapp.com on desktop (skips #btn-wa-direct).
export function fixWhatsappLinksForDesktop() {
    document.querySelectorAll('a[href^="https://wa.me/"]').forEach((a) => {
        const isMob = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        if (!isMob) {
            try {
                const url = new URL(a.href);
                const phone = url.pathname.replace('/', '');
                const text = url.searchParams.get('text') || '';
                let newHref = `https://web.whatsapp.com/send?phone=${phone}`;
                if (text) newHref += `&text=${encodeURIComponent(text)}`;
                if (a.id !== 'btn-wa-direct') {
                    a.href = newHref;
                }
            } catch (e) { /* noop */ }
        }
    });
}
