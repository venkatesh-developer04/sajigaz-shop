import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AnnouncementBar from '../components/AnnouncementBar'
import Header from '../components/Header'
import Footer from '../components/Footer'
import WhatsAppFab from '../components/WhatsAppFab'
import ProductCard from '../components/ProductCard'
import { useProducts } from '../context/ProductsContext'
import { CATEGORIES } from '../data/categories'

const CAT_ICONS = { hampers: 'redeem', 'gift-boxes': 'inventory_2', personalized: 'auto_awesome' }

const FILTER_TABS = [
    { cat: 'all', label: 'All Gifts' },
    { cat: 'hampers', label: 'Hampers' },
    { cat: 'gift-boxes', label: 'Gift Boxes' },
    { cat: 'personalized', label: 'Personalized' },
]

export default function Home() {
    const navigate = useNavigate()
    const [activeCat, setActiveCat] = useState('all')
    const [sort, setSort] = useState('default')
    const [loaderHidden, setLoaderHidden] = useState(false)
    const particlesRef = useRef(null)
    const { products: allProducts, getProductsByCategory } = useProducts()

    useEffect(() => { document.title = 'Sajigaz Designs — Beyond Imagination | Customized Gifts in Pondicherry' }, [])

    // Page loader — hide after 1.8s (ported from main.js).
    useEffect(() => {
        const t = setTimeout(() => setLoaderHidden(true), 1800)
        return () => clearTimeout(t)
    }, [])

    const products = useMemo(() => {
        let list = getProductsByCategory(activeCat === 'all' ? null : activeCat)
        let sorted = [...list]
        if (sort === 'price-asc') sorted.sort((a, b) => a.price - b.price)
        if (sort === 'price-desc') sorted.sort((a, b) => b.price - a.price)
        if (sort === 'rating') sorted.sort((a, b) => b.rating - a.rating)
        return sorted
    }, [activeCat, sort, getProductsByCategory])

    // Particles (ported from main.js initParticles)
    useEffect(() => {
        const container = particlesRef.current
        if (!container) return
        const colors = [
            'rgba(245,166,35,0.55)',
            'rgba(225,23,63,0.4)',
            'rgba(92,45,145,0.4)',
            'rgba(255,209,102,0.5)',
            'rgba(255,180,210,0.45)'
        ]
        const shapes = ['circle', 'diamond', 'square']
        for (let i = 0; i < 16; i++) {
            const p = document.createElement('div')
            p.className = 'particle'
            const size = Math.random() * 12 + 6
            const color = colors[Math.floor(Math.random() * colors.length)]
            const shape = shapes[Math.floor(Math.random() * shapes.length)]
            let borderRadius = '50%'
            if (shape === 'square') borderRadius = '3px'
            if (shape === 'diamond') borderRadius = '3px'
            p.style.cssText = `
                width:${size}px; height:${size}px;
                background:${color};
                border-radius:${borderRadius};
                left:${Math.random() * 100}%;
                animation-duration:${Math.random() * 12 + 8}s;
                animation-delay:${Math.random() * 10}s;
                ${shape === 'diamond' ? 'transform:rotate(45deg);' : ''}
            `
            container.appendChild(p)
        }
        return () => { container.innerHTML = '' }
    }, [])

    // Scroll-reveal + GSAP entrance animations (ported from main.js)
    useEffect(() => {
        const els = document.querySelectorAll('.reveal, .reveal-l, .reveal-r')
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const el = entry.target
                    const delay = parseFloat(el.dataset.delay || 0)
                    setTimeout(() => el.classList.add('visible'), delay * 1000)
                    observer.unobserve(el)
                }
            })
        }, { threshold: 0.12 })
        els.forEach(el => observer.observe(el))

        const gsap = window.gsap
        let ctx
        if (gsap) {
            if (typeof window.ScrollTrigger !== 'undefined') gsap.registerPlugin(window.ScrollTrigger)
            // Wrap in a gsap.context so cleanup reverts the inline styles. Without
            // this, React StrictMode's double-mount makes a second gsap.from()
            // capture the mid-animation opacity as its target -> permanently faint text.
            ctx = gsap.context(() => {
                gsap.from('.hero-tag', { opacity: 0, y: 30, duration: 0.8, ease: 'power3.out', delay: 0.2 })
                gsap.from('.hero-title', { opacity: 0, y: 50, duration: 0.9, ease: 'power3.out', delay: 0.4 })
                gsap.from('.hero-subtitle', { opacity: 0, y: 30, duration: 0.8, ease: 'power3.out', delay: 0.6 })
                gsap.from('.hero-actions', { opacity: 0, y: 30, duration: 0.8, ease: 'power3.out', delay: 0.8 })
                gsap.from('.hero-stats', { opacity: 0, y: 20, duration: 0.7, ease: 'power3.out', delay: 1.0 })
                gsap.from('.hero-visual', { opacity: 0, x: 60, duration: 1.0, ease: 'power3.out', delay: 0.5 })
                document.querySelectorAll('.product-card').forEach((card, i) => {
                    gsap.from(card, {
                        scrollTrigger: { trigger: card, start: 'top 90%', toggleActions: 'play none none none' },
                        opacity: 0, y: 60, scale: 0.92, duration: 0.7, ease: 'power3.out', delay: (i % 4) * 0.1
                    })
                })
                document.querySelectorAll('.category-card').forEach((card, i) => {
                    gsap.from(card, {
                        scrollTrigger: { trigger: card, start: 'top 90%' },
                        opacity: 0, y: 50, scale: 0.9, duration: 0.6, ease: 'back.out(1.5)', delay: i * 0.12
                    })
                })
            })
        }
        return () => { observer.disconnect(); if (ctx) ctx.revert() }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
        <>
            {/* Page Loader */}
            <div className={`page-loader${loaderHidden ? ' hidden' : ''}`} id="pageLoader">
                <div className="loader-logo"><img src="/assets/img/new-logo.png" alt="Sajigaz" /></div>
                <div className="loader-bar">
                    <div className="loader-bar-fill"></div>
                </div>
            </div>

            <AnnouncementBar variant="home" />
            <Header />

            <main>
                {/* Hero */}
                <section className="hero">
                    <div className="particles" id="particles" ref={particlesRef}></div>
                    <div className="hero-orb hero-orb-1"></div>
                    <div className="hero-orb hero-orb-2"></div>
                    <div className="container">
                        <div className="hero-inner">
                            <div className="hero-content">
                                <span className="hero-tag">
                                    <span className="material-symbols-outlined" style={{ fontSize: '0.9em' }}>celebration</span>
                                    Gifting Made Magical
                                </span>
                                <h1 className="hero-title">
                                    Gifts That <span className="accent">Surprise,</span><br />
                                    Delight &amp; <span className="accent2">Inspire</span>
                                </h1>
                                <p className="hero-subtitle">Discover handpicked gift hampers, personalized treasures, and premium
                                    gift boxes— curated with love by Sajigaz Designs for every celebration.</p>
                                <div className="hero-actions">
                                    <a href="/category" className="btn btn-gold btn-lg" onClick={(e) => { e.preventDefault(); navigate('/category') }}>
                                        <i className="ri-gift-line"></i>
                                        Shop Now
                                    </a>
                                    <a href="/category?cat=hampers" className="btn btn-outline btn-lg" onClick={(e) => { e.preventDefault(); navigate('/category?cat=hampers') }}>View Hampers</a>
                                </div>
                                <div className="hero-stats">
                                    <div className="hero-stat">
                                        <span className="hero-stat-num">500+</span>
                                        <span className="hero-stat-label">Happy Customers</span>
                                    </div>
                                    <div className="hero-stat">
                                        <span className="hero-stat-num">50+</span>
                                        <span className="hero-stat-label">Gift Options</span>
                                    </div>
                                    <div className="hero-stat">
                                        <span className="hero-stat-num" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <span className="material-symbols-outlined ms-fill" style={{ color: 'var(--gold)', fontSize: '1.6rem' }}>grade</span>
                                            4.9
                                        </span>
                                        <span className="hero-stat-label">Avg Rating</span>
                                    </div>
                                </div>
                            </div>

                            <div className="hero-visual">
                                <div className="hero-img-wrap">
                                    <div className="hero-img-bg"></div>
                                    <img src="/assets/img/products/gift_hamper.png" alt="Sajigaz Gift Hamper" className="hero-product-img" />
                                    <div className="hero-badge">
                                        <span className="material-symbols-outlined ms-badge-icon">redeem</span>
                                        Free Wrapping
                                        <br />
                                        <small>on ₹999+</small>
                                    </div>
                                    <div className="hero-badge2">
                                        <span className="material-symbols-outlined ms-badge-icon">bolt</span>
                                        Same-day
                                        <br />
                                        Delivery
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Categories */}
                <section className="section categories-section">
                    <div className="container">
                        <div className="section-header reveal">
                            <span className="section-tag">Browse By</span>
                            <h2 className="section-title">Shop by <span>Category</span></h2>
                            <p className="section-subtitle">Find the perfect gift from our curated collections</p>
                        </div>
                        <div className="categories-grid" id="categoriesGrid">
                            {CATEGORIES.map(cat => (
                                <div
                                    key={cat.id}
                                    className="category-card"
                                    style={{ '--cat-color': cat.color }}
                                    onClick={() => navigate(`/category?cat=${cat.id}`)}
                                >
                                    <div className="cat-icon"><span className="material-symbols-outlined">{CAT_ICONS[cat.id] || 'redeem'}</span></div>
                                    <div className="cat-name">{cat.name}</div>
                                    <div className="cat-desc">{cat.description}</div>
                                    <span className="cat-count">{allProducts.filter(p => p.category === cat.id).length} products</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Products Grid */}
                <section className="section products-section">
                    <div className="container">
                        <div className="section-header reveal">
                            <span className="section-tag">Explore</span>
                            <h2 className="section-title">Our <span>Popular</span> Picks</h2>
                            <p className="section-subtitle">Every gift tells a story. Let yours be unforgettable.</p>
                        </div>
                        <div className="products-filter-bar">
                            <div className="filter-tabs" id="filterTabs">
                                {FILTER_TABS.map(t => (
                                    <button
                                        key={t.cat}
                                        className={`filter-tab${activeCat === t.cat ? ' active' : ''}`}
                                        data-cat={t.cat}
                                        onClick={() => setActiveCat(t.cat)}
                                    >
                                        {t.label}
                                    </button>
                                ))}
                            </div>
                            <select className="sort-select" id="sortSelect" value={sort} onChange={(e) => setSort(e.target.value)}>
                                <option value="default">Sort: Featured</option>
                                <option value="price-asc">Price: Low to High</option>
                                <option value="price-desc">Price: High to Low</option>
                                <option value="rating">Top Rated</option>
                            </select>
                        </div>
                        <div className="products-grid" id="productsGrid">
                            {products.length === 0 ? (
                                <div className="no-products">
                                    <div className="icon"><span className="material-symbols-outlined">search_off</span></div>
                                    <h3>No products found</h3>
                                    <p>Try a different filter or search term</p>
                                </div>
                            ) : (
                                products.map(p => <ProductCard key={p.id} product={p} variant="default" />)
                            )}
                        </div>
                    </div>
                </section>

                {/* Contact us */}
                <section className="section contact-section">
                    <div className="container">
                        <div className="section-header reveal">
                            <span className="section-tag">Let's Talk</span>
                            <h2 className="section-title"><span>Contact</span> Us</h2>
                            <p className="section-subtitle">Have a question? Contact us via whatsapp message and a member of our
                                support team will help you out.</p>
                        </div>
                        <div className="mx-auto w-fit">
                            <a href="/category" className="btn btn-gold btn-lg" onClick={(e) => { e.preventDefault(); navigate('/category') }}>
                                <svg style={{ width: '24px' }} viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"></path>
                                </svg>
                                Whatsapp Now
                            </a>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
            <WhatsAppFab
                href="https://wa.me/919944466434?text=Hi%20Sajigaz%20Designs!%20I%E2%80%99d%20like%20to%20order%20a%20gift."
                title="Chat with us on WhatsApp"
            />
        </>
    )
}
