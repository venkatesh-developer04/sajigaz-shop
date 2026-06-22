import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import AnnouncementBar from '../components/AnnouncementBar'
import Header from '../components/Header'
import Footer from '../components/Footer'
import WhatsAppFab from '../components/WhatsAppFab'
import ProductCard from '../components/ProductCard'
import { useWishlist } from '../context/WishlistContext'

export default function Favorites() {
    const navigate = useNavigate()
    const wishlist = useWishlist()
    const items = wishlist.getItems()

    useEffect(() => { document.title = 'My Favorites — Sajigaz Designs | Beyond Imagination' }, [])

    // Entrance animation (cards start hidden via inline style, then animate in).
    useEffect(() => {
        if (!items.length) return
        if (window.gsap) {
            window.gsap.to('#favoritesGrid .product-card', { opacity: 1, y: 0, duration: 0.5, stagger: 0.08, ease: 'power2.out' })
        } else {
            document.querySelectorAll('#favoritesGrid .product-card').forEach(card => {
                card.style.opacity = '1'
                card.style.transform = 'none'
            })
        }
    }, [items])

    const removeFavorite = (id, e) => {
        const card = e.target.closest('.product-card')
        if (card && window.gsap) {
            window.gsap.to(card, {
                opacity: 0, scale: 0.8, y: 30, duration: 0.4, ease: 'power2.in',
                onComplete: () => wishlist.toggle(id)
            })
        } else {
            wishlist.toggle(id)
        }
    }

    const count = items.length

    return (
        <>
            <AnnouncementBar variant="compact" />
            <Header />

            {/* Page Hero */}
            <section className="page-hero">
                <div className="container page-hero-inner">
                    <div>
                        <h1>My Favorites</h1>
                        <nav className="breadcrumb" aria-label="Breadcrumb">
                            <a href="/" onClick={(e) => { e.preventDefault(); navigate('/') }}>Home</a>
                            <span>/</span>
                            <span className="current">Favorites</span>
                        </nav>
                    </div>
                    <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }} id="wishlistSubtitle">
                        {count === 0 ? '0 items found' : `${count} item${count !== 1 ? 's' : ''} found`}
                    </div>
                </div>
            </section>

            {/* Favorites Content */}
            <section className="section products-section" style={{ paddingTop: '48px', minHeight: '50vh' }}>
                <div className="container">
                    {count === 0 && (
                        <div className="cart-empty" id="wishlistEmpty" style={{ textAlign: 'center', padding: '80px 20px' }}>
                            <div className="cart-empty-icon" style={{ marginBottom: '24px' }}>
                                <span className="material-symbols-outlined" style={{ fontSize: '4rem', color: 'var(--gray-300)', fontVariationSettings: "'FILL' 0" }}>heart_broken</span>
                            </div>
                            <h2 style={{ fontFamily: 'var(--ff-display)', color: 'var(--purple-dark)', marginBottom: '8px' }}>Your Favorites List is Empty</h2>
                            <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>Heart some gifts from our collections to save them here!</p>
                            <a href="/category" className="btn btn-primary btn-lg" onClick={(e) => { e.preventDefault(); navigate('/category') }}>
                                <span className="material-symbols-outlined ms-sm">redeem</span> Browse Gifts
                            </a>
                        </div>
                    )}

                    <div className="products-grid" id="favoritesGrid">
                        {items.map(p => (
                            <ProductCard
                                key={p.id}
                                product={p}
                                variant="favorite"
                                onRemove={removeFavorite}
                                style={{ opacity: 0, transform: 'translateY(20px)' }}
                            />
                        ))}
                    </div>
                </div>
            </section>

            <Footer />
            <WhatsAppFab />
        </>
    )
}
