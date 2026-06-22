import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useWishlist } from '../context/WishlistContext'

// Site header: logo, desktop nav (active link by route), favorites + cart
// buttons with live count badges, and the mobile slide-out nav (two layouts,
// matching the original pages). Replaces main.js scroll + hamburger handlers.
export default function Header() {
    const { pathname } = useLocation()
    const cart = useCart()
    const wishlist = useWishlist()
    const [scrolled, setScrolled] = useState(false)
    const [menuOpen, setMenuOpen] = useState(false)

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 20)
        window.addEventListener('scroll', onScroll)
        onScroll()
        return () => window.removeEventListener('scroll', onScroll)
    }, [])

    // Close the mobile menu whenever the route changes.
    useEffect(() => { setMenuOpen(false) }, [pathname])

    const isActive = (path) => pathname === path
    const cartCount = cart.getCount()
    const wishCount = wishlist.getCount()

    // Mobile nav layout 'a' (home / cart / favorites) vs 'b' (everything else).
    const mobileA = ['/', '/cart', '/favorites'].includes(pathname)
    const closeMenu = () => setMenuOpen(false)

    return (
        <header className={`site-header${scrolled ? ' scrolled' : ''}`}>
            <div className="container header-inner">
                {/* Logo */}
                <div className="logo">
                    <Link to="/">
                        <img src="/assets/img/new-logo.png" alt="Sajigaz Designs" />
                    </Link>
                </div>

                {/* Desktop Nav */}
                <nav className="main-nav">
                    <ul className="nav-links">
                        <li><Link to="/" className={isActive('/') ? 'active' : undefined}>Home</Link></li>
                        <li><Link to="/category" className={isActive('/category') ? 'active' : undefined}>Shop All</Link></li>
                        <li><Link to="/photo-magnet?cat=Photomagnet" className={isActive('/photo-magnet') ? 'active' : undefined}>Photo Magnet</Link></li>
                        <li><Link to="/bulk-order" className={isActive('/bulk-order') ? 'active' : undefined}>Bulk Order</Link></li>
                        <li><Link to="/contact" className={isActive('/contact') ? 'active' : undefined}>Contact Us</Link></li>
                    </ul>
                </nav>

                {/* Cart + Hamburger */}
                <div className="header-actions">
                    <Link
                        to="/favorites"
                        className="cart-btn"
                        id="headerFavoritesBtn"
                        style={{ background: 'transparent', color: 'var(--purple)', border: '1.5px solid var(--purple)', boxShadow: 'none', padding: 0, marginRight: '4px', width: '40px', height: '40px', textAlign: 'center', display: 'flex', justifyContent: 'center' }}
                        title="Favorites"
                    >
                        <i className={isActive('/favorites') ? 'ri-heart-fill' : 'ri-heart-line'} style={{ fontSize: '1.15rem', verticalAlign: 'middle' }}></i>
                        <span className="cart-count wishlist-count" id="wishlistCountBadge" style={{ background: 'var(--magenta)', top: '-6px', right: '-6px', display: wishCount > 0 ? 'flex' : 'none' }}>{wishCount}</span>
                    </Link>
                    <Link to="/cart" className="cart-btn" id="headerCartBtn">
                        <i className="ri-shopping-bag-line"></i>
                        <span>Cart</span>
                        <span className="cart-count" id="cartCountBadge" style={{ display: cartCount > 0 ? 'flex' : 'none' }}>{cartCount}</span>
                    </Link>
                    <button className={`hamburger${menuOpen ? ' open' : ''}`} id="hamburger" aria-label="Menu" onClick={() => setMenuOpen(o => !o)}>
                        <span></span>
                        <span></span>
                        <span></span>
                    </button>
                </div>
            </div>

            {/* Mobile Nav */}
            <nav className={`mobile-nav${menuOpen ? ' open' : ''}`} id="mobileNav">
                {mobileA ? (
                    <>
                        <Link to="/" onClick={closeMenu}><span className="material-symbols-outlined ms-sm">home</span> Home</Link>
                        <Link to="/category" onClick={closeMenu}><span className="material-symbols-outlined ms-sm">shopping_bag</span> Shop All</Link>
                        <Link to="/category?cat=hampers" onClick={closeMenu}><span className="material-symbols-outlined ms-sm">redeem</span> Gift Hampers</Link>
                        <Link to="/category?cat=gift-boxes" onClick={closeMenu}><span className="material-symbols-outlined ms-sm">inventory_2</span> Gift Boxes</Link>
                        <Link to="/category?cat=personalized" onClick={closeMenu}><span className="material-symbols-outlined ms-sm">auto_awesome</span> Personalized</Link>
                        <Link to="/favorites" onClick={closeMenu}><span className="material-symbols-outlined ms-sm">favorite</span> Favorites</Link>
                        <Link to="/cart" onClick={closeMenu}><span className="material-symbols-outlined ms-sm">shopping_cart</span> My Cart</Link>
                    </>
                ) : (
                    <>
                        <Link to="/" onClick={closeMenu}><span className="material-symbols-outlined ms-sm">home</span> Home</Link>
                        <Link to="/category" onClick={closeMenu}><span className="material-symbols-outlined ms-sm">shopping_bag</span> Shop All</Link>
                        <Link to="/product" onClick={closeMenu}><span className="material-symbols-outlined ms-sm">redeem</span> Products</Link>
                        <Link to="/bulk-order" onClick={closeMenu}><span className="material-symbols-outlined ms-sm">inventory_2</span> Bulk Order</Link>
                        <Link to="/contact" onClick={closeMenu}><span className="material-symbols-outlined ms-sm">auto_awesome</span> Contact Us</Link>
                        <Link to="/favorites" onClick={closeMenu}><span className="material-symbols-outlined ms-sm">favorite</span> Favorites</Link>
                        <Link to="/cart" onClick={closeMenu}><span className="material-symbols-outlined ms-sm">shopping_cart</span> My Cart</Link>
                    </>
                )}
            </nav>
        </header>
    )
}
