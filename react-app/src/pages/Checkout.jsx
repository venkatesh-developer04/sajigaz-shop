import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AnnouncementBar from '../components/AnnouncementBar'
import Header from '../components/Header'
import Footer from '../components/Footer'
import WhatsAppFab from '../components/WhatsAppFab'
import { WhatsappGlyph } from '../lib/icons'
import { useCart } from '../context/CartContext'
import { formatPrice } from '../lib/format'
import { showToast, launchConfetti, fixWhatsappLinksForDesktop } from '../lib/effects'
import { createOrder, verifyPayment } from '../lib/api'

const OWNER_WHATSAPP = '919944466434'
const PONDY_COORDS = { lat: 11.9416, lon: 79.8083 }

function deg2rad(deg) { return deg * (Math.PI / 180) }
function getDistInKm(lat1, lon1, lat2, lon2) {
    const R = 6371
    const dLat = deg2rad(lat2 - lat1)
    const dLon = deg2rad(lon2 - lon1)
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

// The bespoke confetti / success-overlay CSS that lived inline in checkout.html.
const CHECKOUT_CSS = `
.confetti-piece { position: fixed; pointer-events: none; z-index: 99999; border-radius: 2px; animation: confettiFall 1.4s ease-out forwards; }
@keyframes confettiFall { 0% { transform: translateY(-20px) rotate(0deg) scale(1); opacity: 1; } 100% { transform: translateY(80vh) rotate(720deg) scale(0.5); opacity: 0; } }
.success-overlay { position: fixed; inset: 0; background: rgba(92, 45, 145, 0.92); display: flex; flex-direction: column; align-items: center; justify-content: center; z-index: 9999; opacity: 0; pointer-events: none; transition: opacity 0.4s; text-align: center; padding: 40px; }
.success-overlay.show { opacity: 1; pointer-events: all; }
.success-icon { margin-bottom: 24px; animation: successPop 0.6s cubic-bezier(0.34, 1.56, 0.64, 1); }
.success-icon .material-symbols-outlined { font-size: 5rem; color: var(--gold-light); font-variation-settings: 'FILL' 1, 'wght' 100, 'GRAD' 0, 'opsz' 48; }
@keyframes successPop { from { transform: scale(0) } to { transform: scale(1) } }
.success-title { font-family: var(--ff-display); font-size: 2rem; font-weight: 900; color: white; margin-bottom: 12px; }
.success-sub { color: rgba(255, 255, 255, 0.8); font-size: 1rem; margin-bottom: 32px; line-height: 1.6; }
.success-wa-btn { background: #25D366; color: white; padding: 16px 36px; border-radius: 99px; font-size: 1.1rem; font-weight: 800; display: inline-flex; align-items: center; gap: 12px; cursor: pointer; text-decoration: none; margin-bottom: 16px; transition: transform 0.2s; box-shadow: 0 8px 24px rgba(37, 211, 102, 0.4); border: none; font-family: inherit; }
.success-wa-btn:hover { transform: scale(1.05); }
.success-close-btn { background: rgba(255, 255, 255, 0.15); color: white; padding: 12px 28px; border-radius: 99px; font-weight: 600; cursor: pointer; border: none; font-family: inherit; transition: background 0.2s; margin-top: 8px; }
.success-close-btn:hover { background: rgba(255, 255, 255, 0.25); }
`

export default function Checkout() {
    const navigate = useNavigate()
    const cart = useCart()
    const items = cart.items
    const isEmpty = items.length === 0

    const [form, setForm] = useState({ firstName: '', lastName: '', phone: '', address: '', pincode: '', occasion: '', deliveryDate: '' })
    const [estimate, setEstimate] = useState({ text: '', color: '' })
    const [overlayShow, setOverlayShow] = useState(false)
    const [successHref, setSuccessHref] = useState('#')
    const pincodeTimeout = useRef(null)

    const subtotal = cart.getTotal()
    const delivery = subtotal >= 999 ? 0 : 80
    const total = subtotal + delivery

    const minDate = useMemo(() => {
        const t = new Date()
        t.setDate(t.getDate() + 1)
        return t.toISOString().split('T')[0]
    }, [])

    useEffect(() => { document.title = 'Checkout — Sajigaz Designs | Beyond Imagination' }, [])

    // GSAP entrance + desktop WhatsApp fix (ported from checkout.html).
    useEffect(() => {
        if (isEmpty) return
        let ctx
        if (window.gsap) {
            ctx = window.gsap.context(() => {
                window.gsap.from('.checkout-form-wrap', { opacity: 0, x: -50, duration: 0.8, ease: 'power3.out' })
                window.gsap.from('.cart-summary', { opacity: 0, x: 50, duration: 0.8, ease: 'power3.out', delay: 0.15 })
            })
        }
        fixWhatsappLinksForDesktop()
        return () => { if (ctx) ctx.revert() }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    // Success overlay entrance animation.
    useEffect(() => {
        if (overlayShow && window.gsap) {
            window.gsap.from('.success-icon', { scale: 0, duration: 0.6, ease: 'back.out(3)', delay: 0.1 })
            window.gsap.from('.success-title', { opacity: 0, y: 20, duration: 0.5, ease: 'power3.out', delay: 0.3 })
            window.gsap.from('.success-sub', { opacity: 0, y: 20, duration: 0.5, ease: 'power3.out', delay: 0.4 })
            window.gsap.from('.success-wa-btn', { opacity: 0, y: 20, duration: 0.5, ease: 'power3.out', delay: 0.5 })
        }
    }, [overlayShow])

    const update = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }))

    const onPincodeChange = (e) => {
        const value = e.target.value
        setForm(f => ({ ...f, pincode: value }))
        const pin = value.trim()
        clearTimeout(pincodeTimeout.current)
        if (pin.length === 6 && /^\d+$/.test(pin)) {
            setEstimate({ text: 'Calculating distance...', color: 'var(--text-muted)' })
            pincodeTimeout.current = setTimeout(async () => {
                let text
                try {
                    const res = await fetch(`https://api.zippopotam.us/in/${pin}`)
                    if (!res.ok) throw new Error('Not found')
                    const data = await res.json()
                    if (data.places && data.places.length > 0) {
                        const place = data.places[0]
                        const dist = Math.round(getDistInKm(PONDY_COORDS.lat, PONDY_COORDS.lon, parseFloat(place.latitude), parseFloat(place.longitude)))
                        const days = dist < 50 ? '1-2 days' : dist < 500 ? '2-3 days' : dist < 1200 ? '3-5 days' : '5-7 days'
                        text = `Distance: ${dist} km — Est. Delivery: ${days}`
                    } else {
                        throw new Error('Not found')
                    }
                } catch (err) {
                    const days = pin.startsWith('605') ? '1-2 days (Local)' : pin.startsWith('6') || pin.startsWith('5') ? '3-4 days (South India)' : '5-7 days (Rest of India)'
                    text = `Est. Delivery: ${days}`
                }
                setEstimate({ text, color: 'var(--purple)' })
                if (window.gsap) window.gsap.from('#deliveryEstimate', { opacity: 0, y: -5, duration: 0.3 })
            }, 600)
        } else {
            setEstimate({ text: '', color: '' })
        }
    }

    const showFieldError = (fieldId, msg) => {
        const field = document.getElementById(fieldId)
        if (!field) return
        field.style.borderColor = 'var(--magenta)'
        field.style.boxShadow = '0 0 0 3px rgba(225,23,63,0.15)'
        field.focus()
        showToast(msg)
        if (window.gsap) window.gsap.from(field, { x: -8, duration: 0.25, ease: 'elastic.out(4,0.5)', repeat: 3, yoyo: true })
        setTimeout(() => { field.style.borderColor = ''; field.style.boxShadow = '' }, 3000)
    }

    // Build the WhatsApp confirmation URL (sent AFTER a successful payment).
    const buildWhatsAppUrl = ({ firstName, lastName, phone, address, pincode, occasion, deliveryDate, paymentId }) => {
        let msg = `*New Order — Sajigaz Designs*\n`
        msg += `━━━━━━━━━━━━━━━━━━\n`
        msg += `*Customer Details*\n`
        msg += `Name: ${firstName} ${lastName}\n`
        msg += `Phone: ${phone}\n`
        msg += `Address: ${address}\n`
        msg += `Pincode: ${pincode}\n`
        if (occasion) msg += `Occasion: ${occasion}\n`
        if (deliveryDate) msg += `Delivery Date: ${deliveryDate}\n`
        msg += `\n*Order Items*\n`
        msg += `━━━━━━━━━━━━━━━━━━\n`
        let hasCustomImage = false
        const customImageLinks = []
        items.forEach(item => {
            msg += `• ${item.name} x${item.qty} = ${formatPrice(item.price * item.qty)}\n`
            if (item.customImageB64) { hasCustomImage = true; customImageLinks.push(item.customImageB64) }
        })
        msg += `━━━━━━━━━━━━━━━━━━\n`
        msg += `Subtotal: ${formatPrice(subtotal)}\n`
        msg += `Delivery: ${delivery === 0 ? 'FREE' : formatPrice(delivery)}\n`
        msg += `*Total: ${formatPrice(total)}*\n`
        msg += `Payment: PAID ✅ (Ref: ${paymentId})\n`
        if (hasCustomImage) msg += `\n*My Custom Images:*\n${customImageLinks.join('\\n')}\n`
        msg += `\nPlease confirm my order. Thank you!`

        const isMob = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
        return isMob
            ? `https://wa.me/${OWNER_WHATSAPP}?text=${encodeURIComponent(msg)}`
            : `https://web.whatsapp.com/send?phone=${OWNER_WHATSAPP}&text=${encodeURIComponent(msg)}`
    }

    const swalError = (text) => {
        if (typeof window.Swal !== 'undefined') {
            window.Swal.fire({ title: 'Payment Error', text, icon: 'error', confirmButtonColor: '#e0a96d' })
        } else {
            alert(text)
        }
    }

    const onSubmit = async (e) => {
        e.preventDefault()
        const firstName = form.firstName.trim()
        const lastName = form.lastName.trim()
        const phone = form.phone.trim()
        const address = form.address.trim()
        const pincode = form.pincode.trim()
        const occasion = form.occasion
        const deliveryDate = form.deliveryDate

        if (!firstName) { showFieldError('firstName', 'Please enter your first name'); return }
        if (!phone || phone.replace(/\D/g, '').length < 10) { showFieldError('phone', 'Please enter a valid phone number'); return }
        if (!address) { showFieldError('address', 'Please enter your delivery address'); return }
        if (!pincode || !/^\d{6}$/.test(pincode)) { showFieldError('pincode', 'Please enter a valid 6-digit pincode'); return }

        if (!window.Razorpay) { swalError('Payment library failed to load. Please refresh and try again.'); return }

        const customer = { name: `${firstName} ${lastName}`.trim(), phone, address, pincode, occasion, deliveryDate }
        const cartItems = items.map(i => ({ id: i.id, qty: i.qty, customImageB64: i.customImageB64 }))

        let order
        try {
            order = await createOrder({ items: cartItems, customer })
        } catch (err) {
            swalError(err.message || 'Could not start payment. Please try again.')
            return
        }

        const rzp = new window.Razorpay({
            key: order.key_id,
            amount: order.amount,
            currency: order.currency,
            name: 'Sajigaz Designs',
            description: 'Order payment',
            order_id: order.order_id,
            prefill: { name: customer.name, contact: phone },
            notes: { address, pincode },
            theme: { color: '#5C2D91' },
            // Wallet hidden for now — set to true (or remove) to re-enable later.
            method: { wallet: false },
            handler: async (resp) => {
                try {
                    await verifyPayment({
                        razorpay_order_id: resp.razorpay_order_id,
                        razorpay_payment_id: resp.razorpay_payment_id,
                        razorpay_signature: resp.razorpay_signature,
                    })
                } catch (err) {
                    swalError(err.message || 'We could not verify your payment. If money was deducted, contact us on WhatsApp.')
                    return
                }
                // Payment confirmed → fire the WhatsApp confirmation + success UI.
                const waUrl = buildWhatsAppUrl({ ...customer, firstName, lastName, paymentId: resp.razorpay_payment_id })
                launchConfetti()
                setSuccessHref(waUrl)
                setOverlayShow(true)
                setTimeout(() => cart.clear(), 3000)
            },
        })
        rzp.on('payment.failed', (resp) => {
            swalError((resp?.error?.description) || 'Payment failed. Please try again.')
        })
        rzp.open()
    }

    const closeSuccess = () => {
        setOverlayShow(false)
        navigate('/')
    }

    return (
        <>
            <style>{CHECKOUT_CSS}</style>
            <AnnouncementBar variant="checkout" />
            <Header />

            <div className="checkout-page">
                <div className="container">
                    {/* Page Title */}
                    <div style={{ marginBottom: '32px' }}>
                        <nav className="breadcrumb" style={{ fontSize: '.85rem', display: 'flex', gap: '8px', marginBottom: '12px' }}>
                            <a href="/" style={{ color: 'var(--text-muted)' }} onClick={(e) => { e.preventDefault(); navigate('/') }}>Home</a>
                            <span style={{ color: 'var(--gray-400)' }}>/</span>
                            <a href="/cart" style={{ color: 'var(--text-muted)' }} onClick={(e) => { e.preventDefault(); navigate('/cart') }}>Cart</a>
                            <span style={{ color: 'var(--gray-400)' }}>/</span>
                            <span style={{ color: 'var(--purple)', fontWeight: 600 }}>Checkout</span>
                        </nav>
                        <h1 style={{ fontFamily: 'var(--ff-display)', fontSize: '2rem', fontWeight: 900, color: 'var(--purple-dark)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <span className="material-symbols-outlined" style={{ fontSize: '2rem', color: 'var(--purple)' }}>assignment</span>
                            Complete Your Order
                        </h1>
                        <p style={{ color: 'var(--text-muted)', marginTop: '4px' }}>
                            Fill in your details — we'll send your order directly to WhatsApp for confirmation!
                        </p>
                    </div>

                    {isEmpty ? (
                        <div id="emptyCheckout" style={{ textAlign: 'center', padding: '80px 20px' }}>
                            <span className="material-symbols-outlined" style={{ fontSize: '3.5rem', color: 'var(--gray-200)', display: 'block', marginBottom: '16px' }}>shopping_cart</span>
                            <h2 style={{ fontFamily: 'var(--ff-display)', color: 'var(--purple-dark)', marginBottom: '8px' }}>Your Cart is Empty</h2>
                            <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>Add some gifts first before checking out!</p>
                            <a href="/category" className="btn btn-primary btn-lg" onClick={(e) => { e.preventDefault(); navigate('/category') }}>
                                <span className="material-symbols-outlined ms-sm">redeem</span> Browse Gifts
                            </a>
                        </div>
                    ) : (
                        <div className="checkout-grid" id="checkoutContent">
                            {/* Form */}
                            <div className="checkout-form-wrap">
                                <div className="form-title">Your Details</div>
                                <p className="form-subtitle" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <WhatsappGlyph width={18} height={18} fill="#25D366" />
                                    We'll use these to confirm your order on WhatsApp
                                </p>

                                <form id="checkoutForm" noValidate onSubmit={onSubmit}>
                                    <div className="form-grid-2">
                                        <div className="form-group">
                                            <label htmlFor="firstName">First Name *</label>
                                            <input type="text" id="firstName" className="form-control" placeholder="e.g. Priya" required value={form.firstName} onChange={update('firstName')} />
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="lastName">Last Name</label>
                                            <input type="text" id="lastName" className="form-control" placeholder="e.g. Kumar" value={form.lastName} onChange={update('lastName')} />
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="phone" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                            <span className="material-symbols-outlined" style={{ fontSize: '0.9rem', color: 'var(--purple)' }}>phone_android</span>
                                            WhatsApp / Phone Number *
                                        </label>
                                        <input type="tel" id="phone" className="form-control" placeholder="e.g. 9944466434" pattern="[0-9\+\-\s]{10,15}" maxLength="15" required value={form.phone} onChange={update('phone')} />
                                        <small style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <span className="material-symbols-outlined" style={{ fontSize: '0.85rem' }}>info</span>
                                            We'll send your order confirmation to this number
                                        </small>
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="address" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                            <span className="material-symbols-outlined" style={{ fontSize: '0.9rem', color: 'var(--purple)' }}>location_on</span>
                                            Delivery Address *
                                        </label>
                                        <textarea id="address" className="form-control" placeholder="House / Flat No., Street, Area, City" rows="3" required value={form.address} onChange={update('address')}></textarea>
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="pincode" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                            <span className="material-symbols-outlined" style={{ fontSize: '0.9rem', color: 'var(--purple)' }}>pin_drop</span>
                                            Pincode *
                                        </label>
                                        <input type="tel" id="pincode" className="form-control" placeholder="e.g. 605001" maxLength="6" pattern="\d{6}" required value={form.pincode} onChange={onPincodeChange} />
                                        <small id="deliveryEstimate" style={{ display: 'block', marginTop: '6px', fontSize: '0.85rem', fontWeight: 600, minHeight: '20px', color: estimate.color }}>{estimate.text}</small>
                                    </div>

                                    <div className="form-grid-2">
                                        <div className="form-group">
                                            <label htmlFor="occasion" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                <span className="material-symbols-outlined" style={{ fontSize: '0.9rem', color: 'var(--purple)' }}>celebration</span>
                                                Occasion
                                            </label>
                                            <select id="occasion" className="form-control" style={{ cursor: 'pointer' }} value={form.occasion} onChange={update('occasion')}>
                                                <option value="">Select occasion</option>
                                                <option value="Birthday">Birthday</option>
                                                <option value="Anniversary">Anniversary</option>
                                                <option value="Wedding">Wedding</option>
                                                <option value="Baby Shower">Baby Shower</option>
                                                <option value="Diwali">Diwali</option>
                                                <option value="Christmas">Christmas</option>
                                                <option value="Just Because">Just Because</option>
                                                <option value="Other">Other</option>
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="deliveryDate" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                <span className="material-symbols-outlined" style={{ fontSize: '0.9rem', color: 'var(--purple)' }}>calendar_today</span>
                                                Preferred Delivery Date
                                            </label>
                                            <input type="date" id="deliveryDate" className="form-control" min={minDate} value={form.deliveryDate} onChange={update('deliveryDate')} />
                                        </div>
                                    </div>

                                    <button type="submit" className="btn-whatsapp-order" id="placeOrderBtn">
                                        <i className="ri-secure-payment-line" style={{ fontSize: '1.25rem' }}></i>
                                        Pay {formatPrice(total)} Securely
                                    </button>

                                    <p style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
                                        <span className="material-symbols-outlined" style={{ fontSize: '0.9rem' }}>lock</span>
                                        Your details are only used to process your order. We never spam!
                                    </p>
                                </form>
                            </div>

                            {/* Order Summary */}
                            <div>
                                <div className="cart-summary" style={{ position: 'sticky', top: '100px' }}>
                                    <div className="summary-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span className="material-symbols-outlined" style={{ fontSize: '1.2rem', color: 'var(--purple)' }}>shopping_bag</span>
                                        Order Summary
                                    </div>
                                    <div className="order-items-list" id="orderItemsList" style={{ marginBottom: '20px', maxHeight: '360px', overflowY: 'auto' }}>
                                        {items.map((item, idx) => {
                                            if (item.customImageB64) {
                                                const cdnUrls = item.customImageB64.split(',')
                                                const mainImgSrc = cdnUrls[0] || item.image
                                                return (
                                                    <div className="order-item-row" key={`${item.id}-${idx}`}>
                                                        <img src={`${mainImgSrc}-/preview/100x100/`} alt={item.name} className="order-item-img" style={{ borderRadius: '6px', border: '1px solid var(--purple)' }} />
                                                        <div style={{ flex: 1, minWidth: 0 }}>
                                                            <div className="order-item-name">{item.name}</div>
                                                            <div className="order-item-qty">Qty: {item.qty}</div>
                                                            <div style={{ marginTop: '6px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--purple)', fontWeight: 600, flexWrap: 'wrap' }}>
                                                                <span className="material-symbols-outlined" style={{ fontSize: '0.9rem' }}>collections</span>
                                                                {cdnUrls.length} Photo{cdnUrls.length > 1 ? 's' : ''} Attached:
                                                                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginLeft: '4px' }}>
                                                                    {cdnUrls.map((url, i) => (
                                                                        <img key={i} src={`${url}-/preview/40x40/`} style={{ width: '24px', height: '24px', borderRadius: '4px', border: '1px solid var(--purple-light)', objectFit: 'cover' }} />
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="order-item-price">{formatPrice(item.price * item.qty)}</div>
                                                    </div>
                                                )
                                            }
                                            return (
                                                <div className="order-item-row" key={`${item.id}-${idx}`}>
                                                    <img src={item.image} alt={item.name} className="order-item-img" />
                                                    <div style={{ flex: 1, minWidth: 0 }}>
                                                        <div className="order-item-name">{item.name}</div>
                                                        <div className="order-item-qty">Qty: {item.qty}</div>
                                                    </div>
                                                    <div className="order-item-price">{formatPrice(item.price * item.qty)}</div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                    <div className="summary-row"><span>Subtotal</span><span id="coSubtotal">{formatPrice(subtotal)}</span></div>
                                    <div className="summary-row">
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                            <span className="material-symbols-outlined" style={{ fontSize: '0.85rem', color: 'var(--purple)' }}>redeem</span>
                                            Gift Wrapping
                                        </span>
                                        <span style={{ color: 'var(--purple)', fontWeight: 700 }}>FREE</span>
                                    </div>
                                    <div className="summary-row">
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                            <span className="material-symbols-outlined" style={{ fontSize: '0.85rem', color: 'var(--purple)' }}>local_shipping</span>
                                            Delivery
                                        </span>
                                        <span id="coDelivery">{delivery === 0 ? 'FREE' : formatPrice(delivery)}</span>
                                    </div>
                                    <div className="summary-row total"><span>Total Payable</span><span id="coTotal">{formatPrice(total)}</span></div>
                                    <div style={{ background: 'var(--gray-100)', borderRadius: 'var(--radius-sm)', padding: '12px 16px', marginTop: '16px', fontSize: '0.82rem', color: 'var(--gray-600)', lineHeight: 1.6, display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                                        <span className="material-symbols-outlined" style={{ fontSize: '1rem', color: 'var(--purple)', flexShrink: 0, marginTop: '1px' }}>info</span>
                                        Payment on delivery or via UPI — owner will confirm after WhatsApp message.
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <Footer />
            <WhatsAppFab />

            {/* Success Overlay */}
            <div className={`success-overlay${overlayShow ? ' show' : ''}`} id="successOverlay">
                <div className="success-icon">
                    <span className="material-symbols-outlined">celebration</span>
                </div>
                <div className="success-title">Order Sent!</div>
                <p className="success-sub">
                    Your order details have been prepared for WhatsApp.<br />
                    Click below to send it to <strong>Sajigaz Designs</strong> and we'll confirm it shortly!
                </p>
                <a className="success-wa-btn" id="successWaLink" href={successHref} target="_blank" rel="noreferrer">
                    <WhatsappGlyph width={22} height={22} fill="white" />
                    Open WhatsApp &amp; Send
                </a>
                <button className="success-close-btn" onClick={closeSuccess}>
                    <i className="ri-arrow-left-line"></i> Back to Shop
                </button>
            </div>
        </>
    )
}
