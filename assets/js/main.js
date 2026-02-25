// Sajigaz Designs — Main JavaScript (GSAP + interactions)

// ── Page Loader ──
window.addEventListener('load', () => {
    setTimeout(() => {
        const loader = document.querySelector('.page-loader');
        if (loader) loader.classList.add('hidden');
    }, 1800);
});

// ── Header scroll effect ──
const header = document.querySelector('.site-header');
if (header) {
    window.addEventListener('scroll', () => {
        header.classList.toggle('scrolled', window.scrollY > 20);
    });
}

// ── Hamburger nav toggle ──
const hamburger = document.querySelector('.hamburger');
const mobileNav = document.querySelector('.mobile-nav');
if (hamburger && mobileNav) {
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('open');
        mobileNav.classList.toggle('open');
    });
}

// ── Scroll reveal (IntersectionObserver) ──
function initScrollReveal() {
    const els = document.querySelectorAll('.reveal, .reveal-l, .reveal-r');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, i) => {
            if (entry.isIntersecting) {
                const el = entry.target;
                const delay = parseFloat(el.dataset.delay || 0);
                setTimeout(() => el.classList.add('visible'), delay * 1000);
                observer.unobserve(el);
            }
        });
    }, { threshold: 0.12 });
    els.forEach(el => observer.observe(el));
}

// ── GSAP animations ──
function initGSAP() {
    if (!window.gsap) return;
    if (typeof ScrollTrigger !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);
    }

    // Hero text entrance
    const heroTitle = document.querySelector('.hero-title');
    if (heroTitle) {
        gsap.from('.hero-tag', { opacity: 0, y: 30, duration: 0.8, ease: 'power3.out', delay: 0.2 });
        gsap.from('.hero-title', { opacity: 0, y: 50, duration: 0.9, ease: 'power3.out', delay: 0.4 });
        gsap.from('.hero-subtitle', { opacity: 0, y: 30, duration: 0.8, ease: 'power3.out', delay: 0.6 });
        gsap.from('.hero-actions', { opacity: 0, y: 30, duration: 0.8, ease: 'power3.out', delay: 0.8 });
        gsap.from('.hero-stats', { opacity: 0, y: 20, duration: 0.7, ease: 'power3.out', delay: 1.0 });
        gsap.from('.hero-visual', { opacity: 0, x: 60, duration: 1.0, ease: 'power3.out', delay: 0.5 });
    }

    // Product cards stagger on scroll
    document.querySelectorAll('.product-card').forEach((card, i) => {
        gsap.from(card, {
            scrollTrigger: { trigger: card, start: 'top 90%', toggleActions: 'play none none none' },
            opacity: 0, y: 60, scale: 0.92,
            duration: 0.7, ease: 'power3.out',
            delay: (i % 4) * 0.1
        });
    });

    // Category cards
    document.querySelectorAll('.category-card').forEach((card, i) => {
        gsap.from(card, {
            scrollTrigger: { trigger: card, start: 'top 90%' },
            opacity: 0, y: 50, scale: 0.9,
            duration: 0.6, ease: 'back.out(1.5)',
            delay: i * 0.12
        });
    });

    // Featured scroll track — vertical-scroll scrub (desktop only)
    const track = document.querySelector('.featured-scroll-track');
    if (track) {
        let mm = gsap.matchMedia();
        mm.add("(min-width: 769px)", () => {
            gsap.to(track, {
                scrollTrigger: {
                    trigger: track,
                    start: 'top 80%',
                    end: 'bottom 20%',
                    scrub: 1
                },
                x: -120,
                ease: 'none'
            });
        });
        // Also initialize auto-scroll (drag/swipe)
        initFeaturedAutoScroll(track);
    }

    // Testimonials
    document.querySelectorAll('.testimonial-card').forEach((card, i) => {
        gsap.from(card, {
            scrollTrigger: { trigger: card, start: 'top 90%' },
            opacity: 0, y: 50,
            duration: 0.7, ease: 'power3.out',
            delay: i * 0.15
        });
    });

    // Custom gift wrap (formerly CTA/promo)
    const customGift = document.querySelector('.custom-gift-wrap');
    if (customGift) {
        gsap.from(customGift, {
            scrollTrigger: { trigger: customGift, start: 'top 85%' },
            opacity: 0, scale: 0.95,
            duration: 0.8, ease: 'back.out(1.4)'
        });
    }
}

// ── Featured products auto-scroll ──
function initFeaturedAutoScroll(track) {
    if (!track) return;
    let isDown = false, startX, scrollLeft;

    track.style.overflowX = 'auto';
    track.style.scrollbarWidth = 'none';
    track.style.cursor = 'grab';

    track.addEventListener('mousedown', (e) => {
        isDown = true;
        track.style.cursor = 'grabbing';
        startX = e.pageX - track.offsetLeft;
        scrollLeft = track.scrollLeft;
    });
    document.addEventListener('mouseup', () => { isDown = false; track.style.cursor = 'grab'; });
    track.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - track.offsetLeft;
        track.scrollLeft = scrollLeft - (x - startX) * 1.5;
    });
}

// ── Particles on Hero — geometric CSS shapes (no emojis) ──
function initParticles() {
    const container = document.querySelector('.particles');
    if (!container) return;
    const colors = [
        'rgba(245,166,35,0.55)',  // gold
        'rgba(225,23,63,0.4)',    // magenta
        'rgba(92,45,145,0.4)',    // purple
        'rgba(255,209,102,0.5)',  // gold light
        'rgba(255,180,210,0.45)' // pink
    ];
    const shapes = ['circle', 'diamond', 'square'];
    for (let i = 0; i < 16; i++) {
        const p = document.createElement('div');
        p.className = 'particle';
        const size = Math.random() * 12 + 6;
        const color = colors[Math.floor(Math.random() * colors.length)];
        const shape = shapes[Math.floor(Math.random() * shapes.length)];
        let borderRadius = '50%';
        if (shape === 'square') borderRadius = '3px';
        if (shape === 'diamond') borderRadius = '3px';
        p.style.cssText = `
            width:${size}px; height:${size}px;
            background:${color};
            border-radius:${borderRadius};
            left:${Math.random() * 100}%;
            animation-duration:${Math.random() * 12 + 8}s;
            animation-delay:${Math.random() * 10}s;
            ${shape === 'diamond' ? 'transform:rotate(45deg);' : ''}
        `;
        container.appendChild(p);
    }
}

// ── Search functionality ──
function initSearch() {
    const searchWraps = document.querySelectorAll('.search-wrap-suggest');

    // Add global click listener to close suggestions
    document.addEventListener('click', (e) => {
        searchWraps.forEach(wrap => {
            if (!wrap.contains(e.target)) {
                const sugg = wrap.querySelector('.search-suggestions');
                if (sugg) sugg.style.display = 'none';
            }
        });
    });

    searchWraps.forEach(wrap => {
        const input = wrap.querySelector('.search-input');
        const btn = wrap.querySelector('.search-btn');
        if (!input) return;

        // wrap.style.position = 'relative';
        wrap.classList.contains('search-wrap') ? wrap.style.position = 'relative' : null;

        // Create suggestion container
        const suggList = document.createElement('div');
        suggList.className = 'search-suggestions';
        suggList.style.cssText = 'position:absolute;top:100%;left:0;right:0;background:white;box-shadow:0 4px 15px rgba(0,0,0,0.1);border-radius:8px;margin-top:8px;z-index:1000;max-height:300px;overflow-y:auto;display:none;';
        wrap.appendChild(suggList);

        if (btn) {
            btn.addEventListener('click', () => {
                const q = input.value.trim();
                if (q) window.location.href = `category.html?search=${encodeURIComponent(q)}`;
            });
        }

        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const q = input.value.trim();
                if (q) window.location.href = `category.html?search=${encodeURIComponent(q)}`;
            }
        });

        // Autocomplete on typing
        input.addEventListener('input', () => {
            const q = input.value.trim().toLowerCase();
            if (!q) {
                suggList.style.display = 'none';
                return;
            }

            // Search in PRODUCTS
            let results = [];
            if (typeof PRODUCTS !== 'undefined') {
                results = PRODUCTS.filter(p =>
                    p.name.toLowerCase().includes(q) ||
                    (p.categoryName && p.categoryName.toLowerCase().includes(q)) ||
                    (p.tags && p.tags.join(' ').toLowerCase().includes(q))
                ).slice(0, 5);
            }

            suggList.innerHTML = '';
            if (results.length > 0) {
                results.forEach(p => {
                    const item = document.createElement('div');
                    item.style.cssText = 'display:flex;align-items:center;gap:12px;padding:10px 16px;cursor:pointer;border-bottom:1px solid #f0f0f0;transition:background 0.2s;';
                    item.onmouseover = () => item.style.background = '#f9f9f9';
                    item.onmouseout = () => item.style.background = 'transparent';
                    item.onclick = (e) => {
                        e.stopPropagation();
                        window.location.href = `product.html?id=${p.id}`;
                    };
                    item.innerHTML = `
                        <img src="${p.image}" style="width:40px;height:40px;object-fit:cover;border-radius:4px;">
                        <div style="flex:1;">
                            <div style="font-size:0.9rem;font-weight:600;color:#333;">${p.name}</div>
                            <div style="font-size:0.8rem;color:var(--text-muted);">${p.categoryName}</div>
                        </div>
                    `;
                    suggList.appendChild(item);
                });
            } else {
                suggList.innerHTML = `<div style="padding:10px 16px;font-size:0.9rem;color:var(--text-muted);text-align:center;">No gifts found matching "${q}"</div>`;
            }
            suggList.style.display = 'block';
        });
    });
}

// ── Wishlist toggle — Material Symbols favorite / favorite_border ──
document.addEventListener('click', (e) => {
    const btn = e.target.closest('.wishlist-btn');
    if (btn) {
        btn.classList.toggle('active');
        const icon = btn.querySelector('.material-symbols-outlined');
        if (icon) {
            if (btn.classList.contains('active')) {
                icon.textContent = 'favorite';
                icon.classList.add('ms-fill');
            } else {
                icon.textContent = 'favorite_border';
                icon.classList.remove('ms-fill');
            }
        }
        if (window.gsap) {
            gsap.from(btn, { scale: 0.5, duration: 0.4, ease: 'back.out(3)' });
        }
    }
});

// ── Init on DOM ready ──
document.addEventListener('DOMContentLoaded', () => {
    initScrollReveal();
    initGSAP();
    initParticles();
    initSearch();
    checkAppVersion();
});

// ── App Upgrade Flow ──
function checkAppVersion() {
    const CURRENT_VERSION = '2.0';
    const savedVer = localStorage.getItem('sajigaz_app_version');

    if (savedVer && savedVer !== CURRENT_VERSION) {
        setTimeout(() => {
            const shouldUpgrade = confirm("A new version of Sajigaz Designs is available! Upgrade now to get the latest features and designs.");
            if (shouldUpgrade) {
                localStorage.setItem('sajigaz_app_version', CURRENT_VERSION);
                location.reload(true);
            }
        }, 500);
    } else if (!savedVer) {
        localStorage.setItem('sajigaz_app_version', CURRENT_VERSION);
    }
}
