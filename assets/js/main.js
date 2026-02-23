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
    gsap.registerPlugin(ScrollTrigger);

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
    const inputs = document.querySelectorAll('.search-input');
    inputs.forEach(input => {
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const q = input.value.trim();
                if (q) {
                    window.location.href = `category.html?search=${encodeURIComponent(q)}`;
                }
            }
        });
    });
    const btns = document.querySelectorAll('.search-btn');
    btns.forEach((btn, i) => {
        btn.addEventListener('click', () => {
            const q = inputs[i]?.value.trim();
            if (q) window.location.href = `category.html?search=${encodeURIComponent(q)}`;
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
});
