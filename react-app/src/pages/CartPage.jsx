import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import AnnouncementBar from '../components/AnnouncementBar'
import Header from '../components/Header'
import Footer from '../components/Footer'
import WhatsAppFab from '../components/WhatsAppFab'
import { useCart } from '../context/CartContext'
import { formatPrice } from '../lib/format'

export default function CartPage() {
    const navigate = useNavigate()
    const cart = useCart()
    const items = cart.items

    useEffect(() => { document.title = 'My Cart — Sajigaz Designs | Beyond Imagination' }, [])

    // Re-run the entrance animation whenever the items change (matches the
    // original renderCartPage() which re-animated on every re-render).
    useEffect(() => {
        if (items.length && window.gsap) {
            const ctx = window.gsap.context(() => {
                window.gsap.from('.cart-item', { opacity: 0, x: -40, duration: 0.5, stagger: 0.1, ease: 'power3.out' })
            })
            return () => ctx.revert()
        }
    }, [items])

    const subtotal = cart.getTotal()
    const delivery = subtotal >= 999 ? 0 : 80
    const count = cart.getCount()

    const changeQty = (id, delta) => {
        const item = items.find(i => i.id === id)
        if (!item) return
        const newQty = item.qty + delta
        if (newQty <= 0) removeItem(id)
        else cart.updateQty(id, newQty)
    }

    const removeItem = (id) => {
        const el = document.getElementById(`cartItem-${id}`)
        if (el && window.gsap) {
            window.gsap.to(el, {
                opacity: 0, x: 60, height: 0, padding: 0, marginBottom: 0, duration: 0.4, ease: 'power2.in',
                onComplete: () => cart.remove(id)
            })
        } else {
            cart.remove(id)
        }
    }

    const clearCart = () => {
        if (typeof window.Swal !== 'undefined') {
            window.Swal.fire({
                title: 'Clear Cart?',
                text: 'Are you sure you want to remove all items from your cart?',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#e0a96d',
                cancelButtonColor: '#7a7a7a',
                confirmButtonText: 'Yes, clear it',
                cancelButtonText: 'No, keep it'
            }).then((result) => {
                if (result.isConfirmed) cart.clear()
            })
        } else {
            cart.clear()
        }
    }

    return (
        <>
            <AnnouncementBar variant="compact" />
            <Header />

            <section className="cart-page">
                <div className="container">
                    <div style={{ marginBottom: '32px' }}>
                        <h1 style={{ fontFamily: 'var(--ff-display)', fontSize: '2rem', fontWeight: 900, color: 'var(--purple-dark)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <span className="material-symbols-outlined" style={{ fontSize: '2rem', color: 'var(--purple)' }}>shopping_cart</span>
                            My Cart
                        </h1>
                        <p style={{ color: 'var(--text-muted)', marginTop: '4px' }} id="cartSubtitle">
                            {items.length === 0 ? 'Your bag is empty' : `${count} item${count !== 1 ? 's' : ''} in your cart`}
                        </p>
                    </div>

                    {/* Empty state */}
                    {items.length === 0 ? (
                        <div className="cart-empty" id="cartEmpty">
                            <div className="cart-empty-icon">
                                <span className="material-symbols-outlined" style={{ fontSize: '4rem', color: 'var(--gray-200)' }}>shopping_bag</span>
                            </div>
                            <h2>Your cart is empty!</h2>
                            <p>Looks like you haven't added any gifts yet. Start exploring!</p>
                            <a href="/category" className="btn btn-primary btn-lg" onClick={(e) => { e.preventDefault(); navigate('/category') }}>
                                <span className="material-symbols-outlined ms-sm">redeem</span> Browse Gifts
                            </a>
                        </div>
                    ) : (
                        <div className="cart-grid" id="cartContent">
                            {/* Items */}
                            <div>
                                <div className="cart-items-wrap" id="cartItemsList">
                                    {items.map(item => (
                                        <div className="cart-item" id={`cartItem-${item.id}`} key={item.id}>
                                            <div className="cart-item-img">
                                                <img src={item.image} alt={item.name} />
                                            </div>
                                            <div>
                                                <div className="cart-item-name">{item.name}</div>
                                                <div className="cart-item-price">{formatPrice(item.price)} each</div>
                                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                                                    Total: <strong style={{ color: 'var(--purple)' }}>{formatPrice(item.price * item.qty)}</strong>
                                                </div>
                                            </div>
                                            <div className="cart-item-actions">
                                                <div className="qty-control" style={{ borderColor: 'var(--border)' }}>
                                                    <button className="qty-btn" onClick={() => changeQty(item.id, -1)}>−</button>
                                                    <span className="qty-num">{item.qty}</span>
                                                    <button className="qty-btn" onClick={() => changeQty(item.id, 1)}>+</button>
                                                </div>
                                                <button className="remove-btn" onClick={() => removeItem(item.id)} title="Remove">
                                                    <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>delete</span>
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                                    <a href="/category" className="btn btn-outline" onClick={(e) => { e.preventDefault(); navigate('/category') }}>
                                        <i className="ri-arrow-left-line"></i> Continue Shopping
                                    </a>
                                    <button className="btn btn-sm" style={{ color: 'var(--magenta)', border: '1.5px solid var(--magenta)', borderRadius: '99px', padding: '8px 20px', background: 'rgba(225,23,63,0.06)', display: 'inline-flex', alignItems: 'center', gap: '6px' }} id="clearCartBtn" onClick={clearCart}>
                                        <span className="material-symbols-outlined ms-sm">delete</span> Clear Cart
                                    </button>
                                </div>
                            </div>

                            {/* Summary */}
                            <div className="cart-summary">
                                <div className="summary-title">Order Summary</div>
                                <div className="summary-row"><span>Subtotal</span><span id="summarySubtotal">{formatPrice(subtotal)}</span></div>
                                <div className="summary-row">
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <span className="material-symbols-outlined" style={{ fontSize: '0.9rem', color: 'var(--purple)' }}>redeem</span>
                                        Gift Wrapping
                                    </span>
                                    <span style={{ color: 'var(--purple)', fontWeight: 700 }}>FREE</span>
                                </div>
                                <div className="summary-row">
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <span className="material-symbols-outlined" style={{ fontSize: '0.9rem', color: 'var(--purple)' }}>local_shipping</span>
                                        Delivery
                                    </span>
                                    <span id="summaryDelivery">{delivery === 0 ? 'FREE' : formatPrice(delivery)}</span>
                                </div>
                                <div className="summary-row total"><span>Total</span><span id="summaryTotal">{formatPrice(subtotal + delivery)}</span></div>
                                <a href="/checkout" className="btn btn-primary btn-checkout" id="checkoutBtn" onClick={(e) => { e.preventDefault(); navigate('/checkout') }}>
                                    <i className="ri-secure-payment-line"></i> Proceed to Checkout
                                </a>
                                <div style={{ marginTop: '20px', display: 'flex', gap: '16px', justifyContent: 'center' }}>
                                    <div style={{ textAlign: 'center', fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px' }}>
                                        <span className="material-symbols-outlined" style={{ fontSize: '1.1rem', color: 'var(--purple)' }}>lock</span> Secure
                                    </div>
                                    <div style={{ textAlign: 'center', fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px' }}>
                                        <span className="material-symbols-outlined" style={{ fontSize: '1.1rem', color: 'var(--purple)' }}>redeem</span> Gift Wrap
                                    </div>
                                    <div style={{ textAlign: 'center', fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px' }}>
                                        <span className="material-symbols-outlined" style={{ fontSize: '1.1rem', color: 'var(--purple)' }}>local_shipping</span> Fast Ship
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </section>

            <Footer />
            <WhatsAppFab />
        </>
    )
}
