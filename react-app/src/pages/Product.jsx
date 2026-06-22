import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import AnnouncementBar from '../components/AnnouncementBar'
import Header from '../components/Header'
import Footer from '../components/Footer'
import WhatsAppFab from '../components/WhatsAppFab'
import ProductCard from '../components/ProductCard'
import { formatPrice } from '../lib/format'
import { fixWhatsappLinksForDesktop } from '../lib/effects'
import { useCart } from '../context/CartContext'
import { useProducts } from '../context/ProductsContext'

export default function Product() {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const prodId = parseInt(searchParams.get('id'))
    const { products, getProductById, loading } = useProducts()
    const product = useMemo(() => getProductById(prodId), [prodId, getProductById])

    const [qty, setQty] = useState(1)
    const [mainSrc, setMainSrc] = useState('')
    const [activeThumb, setActiveThumb] = useState('img0')
    const mainImgRef = useRef(null)
    const customImageB64Ref = useRef(null)

    const isUpload = !!product && (product.category === 'personalized' || product.category === 'Photomagnet')

    useEffect(() => {
        document.title = product ? `${product.name} — Sajigaz Designs` : 'Product Details — Sajigaz Designs | Beyond Imagination'
    }, [product])

    // Sync the main gallery image once the product is loaded / changes.
    useEffect(() => {
        if (product) { setMainSrc(product.image); setActiveThumb('img0') }
    }, [product])

    // Build the thumbnail list (real images + the two filtered variants).
    const thumbs = useMemo(() => {
        if (!product) return []
        return [
            ...product.images.map((img, i) => ({ key: `img${i}`, src: img, filter: undefined })),
            { key: 'sepia', src: product.image, filter: 'sepia(0.4)' },
            { key: 'saturate', src: product.image, filter: 'saturate(1.5)' },
        ]
    }, [product])

    const related = useMemo(
        () => (product ? products.filter(p => p.category === product.category && p.id !== product.id).slice(0, 4) : []),
        [product, products]
    )

    const switchImg = (thumb) => {
        setActiveThumb(thumb.key)
        if (window.gsap && mainImgRef.current) {
            window.gsap.from(mainImgRef.current, { opacity: 0, scale: 0.95, duration: 0.4, ease: 'power2.out' })
        }
        setMainSrc(thumb.src)
    }

    const dec = () => {
        setQty(q => (q > 1 ? q - 1 : q))
        if (window.gsap) window.gsap.from('#qtyNum', { scale: 0.8, duration: 0.2, ease: 'back.out(2)' })
    }
    const inc = () => {
        setQty(q => q + 1)
        if (window.gsap) window.gsap.from('#qtyNum', { scale: 1.3, duration: 0.2, ease: 'back.out(2)' })
    }

    const cart = useCart()

    const addToCart = () => {
        if (isUpload && !customImageB64Ref.current) {
            if (typeof window.Swal !== 'undefined') {
                window.Swal.fire({
                    title: 'Proceed Without Image?',
                    text: 'You have not uploaded an image for your custom product. Are you sure you want to proceed without an image?',
                    icon: 'question',
                    showCancelButton: true,
                    confirmButtonColor: '#e0a96d',
                    cancelButtonColor: '#7a7a7a',
                    confirmButtonText: 'Yes, proceed',
                    cancelButtonText: 'No, cancel'
                }).then((result) => {
                    if (result.isConfirmed) cart.add(product.id, qty, customImageB64Ref.current)
                })
            } else {
                cart.add(product.id, qty, customImageB64Ref.current)
            }
        } else {
            cart.add(product.id, qty, customImageB64Ref.current)
        }
    }

    // GSAP entrance + desktop WhatsApp link fix (ported from product.html).
    useEffect(() => {
        if (!product) return
        let ctx
        if (window.gsap) {
            ctx = window.gsap.context(() => {
                window.gsap.from('.product-gallery', { opacity: 0, x: -60, duration: 0.9, ease: 'power3.out', delay: 0.1 })
                window.gsap.from('.product-detail-info > *', { opacity: 0, y: 30, duration: 0.6, ease: 'power3.out', stagger: 0.08, delay: 0.2 })
            })
        }
        fixWhatsappLinksForDesktop()
        return () => { if (ctx) ctx.revert() }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [product])

    // Uploadcare widget wiring (ported 1:1 from product.html).
    useEffect(() => {
        if (!product || product.category !== 'Photomagnet') return
        const input = document.getElementById('customImageUcare')
        if (!input || !window.uploadcare) return
        if (input.dataset.ucInited) return // guard against StrictMode double-invoke
        input.dataset.ucInited = '1'

        const previewDiv = document.getElementById('customImagePreview')
        const waBtn = document.getElementById('btn-wa-direct')
        const photoCountSelect = document.getElementById('photoCountSelect')
        const uploadcare = window.uploadcare
        const cropRatio = product.cropRatio || null
        if (cropRatio) input.setAttribute('data-crop', cropRatio)

        let widgetInstance = uploadcare.Widget(input)

        const onCountChange = (e) => {
            const val = parseInt(e.target.value)
            if (widgetInstance) widgetInstance.destroy()
            input.setAttribute('data-multiple', 'true')
            input.setAttribute('data-multiple-max', val)
            input.setAttribute('data-multiple-min', val)
            if (cropRatio) input.setAttribute('data-crop', cropRatio)
            widgetInstance = uploadcare.Widget(input)
        }
        if (photoCountSelect) photoCountSelect.addEventListener('change', onCountChange)

        uploadcare.plugin(function (core) {
            core.settings.effects = 'crop,rotate,enhance,sharp,grayscale'
        })

        const widget = uploadcare.MultipleWidget('#customImageUcare')
        window.widgetInstance = widget

        widget.onUploadComplete(function (info) {
            const expectedCount = parseInt(photoCountSelect.value)
            if (info.count !== expectedCount) {
                if (typeof window.Swal !== 'undefined') {
                    window.Swal.fire({
                        title: 'Photos Count Mismatch',
                        text: `Please upload exactly ${expectedCount} photos based on your selection. You uploaded ${info.count}.`,
                        icon: 'warning',
                        confirmButtonColor: '#e0a96d'
                    })
                }
                widget.value(null)
                return
            }

            const cdnUrls = []
            previewDiv.innerHTML = ''
            const p = uploadcare.loadFileGroup(info.uuid)
            p.done(function (fileGroup) {
                const promises = fileGroup.files()
                Promise.all(promises).then(function (filesArr) {
                    filesArr.forEach(f => {
                        cdnUrls.push(f.cdnUrl)
                        const img = document.createElement('img')
                        img.src = f.cdnUrl + '-/preview/100x100/'
                        img.style.cssText = 'max-width:80px;border-radius:8px;border:1px solid var(--gray-300);'
                        previewDiv.appendChild(img)
                    })
                    customImageB64Ref.current = cdnUrls.join(',')
                    previewDiv.style.display = 'flex'

                    if (waBtn) {
                        const isMob = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
                        let baseText = `Hi Sajigaz! I want to order *${product.name}* (₹${product.price}). \n\n*My Custom Images (${cdnUrls.length}):*\n`
                        cdnUrls.forEach(u => baseText += u + '\\n')
                        if (isMob) waBtn.href = `https://wa.me/919944466434?text=${encodeURIComponent(baseText)}`
                        else waBtn.href = `https://web.whatsapp.com/send?phone=919944466434&text=${encodeURIComponent(baseText)}`
                    }
                })
            })
        })

        widget.onDialogOpen(function (dialog) {
            const val = parseInt(photoCountSelect.value)
            dialog.settings.multipleMax = val
            dialog.settings.multipleMin = val
            if (cropRatio) dialog.settings.crop = cropRatio
            dialog.fileColl.onRemove.add(function () {
                if (dialog.fileColl.length() === 0) {
                    customImageB64Ref.current = null
                    previewDiv.style.display = 'none'
                    previewDiv.innerHTML = ''
                }
            })
        })

        return () => {
            if (photoCountSelect) photoCountSelect.removeEventListener('change', onCountChange)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [product])

    return (
        <>
            <AnnouncementBar variant="compact" />
            <Header />

            <div className="product-detail-page">
                <div className="container">
                    {/* Breadcrumb */}
                    <nav className="breadcrumb" style={{ padding: '16px 0 24px', display: 'flex', gap: '8px', fontSize: '.85rem' }} aria-label="Breadcrumb">
                        <a href="/" style={{ color: 'var(--text-muted)' }} onClick={(e) => { e.preventDefault(); navigate('/') }}>Home</a>
                        <span style={{ color: 'var(--gray-400)' }}>/</span>
                        <a
                            href="/category"
                            id="catBreadcrumb"
                            style={{ color: 'var(--text-muted)' }}
                            onClick={(e) => { e.preventDefault(); navigate(product ? `/category?cat=${product.category}` : '/category') }}
                        >
                            {product ? product.categoryName : 'Shop'}
                        </a>
                        <span style={{ color: 'var(--gray-400)' }}>/</span>
                        <span style={{ color: 'var(--purple)', fontWeight: 600 }} id="nameBreadcrumb">{product ? product.name : 'Product'}</span>
                    </nav>

                    <div className="product-detail-grid" id="productDetailGrid">
                        {loading ? (
                            <div style={{ textAlign: 'center', padding: '80px', color: 'var(--text-muted)', gridColumn: '1/-1' }}>
                                <span className="material-symbols-outlined" style={{ fontSize: '3rem', color: 'var(--gray-200)', display: 'block', marginBottom: '12px' }}>hourglass_empty</span>
                                <p>Loading product…</p>
                            </div>
                        ) : !product ? (
                            <div style={{ textAlign: 'center', padding: '80px', gridColumn: '1/-1' }}>
                                <span className="material-symbols-outlined" style={{ fontSize: '3.5rem', color: 'var(--gray-200)', display: 'block', marginBottom: '16px' }}>sentiment_dissatisfied</span>
                                <h2 style={{ fontFamily: 'var(--ff-display)', color: 'var(--purple-dark)', marginBottom: '8px' }}>Product Not Found</h2>
                                <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>This product doesn't exist or has been removed.</p>
                                <a href="/category" className="btn btn-primary" onClick={(e) => { e.preventDefault(); navigate('/category') }}>Browse All Gifts</a>
                            </div>
                        ) : (
                            <>
                                {/* Gallery */}
                                <div className="product-gallery">
                                    <div className="main-img-wrap" id="mainImgWrap">
                                        <img src={mainSrc} alt={product.name} id="mainImg" ref={mainImgRef} />
                                    </div>
                                    <div className="thumb-row">
                                        {thumbs.map(t => (
                                            <div
                                                key={t.key}
                                                className={`thumb ${activeThumb === t.key ? 'active' : ''}`}
                                                data-img={t.src}
                                                onClick={() => switchImg(t)}
                                            >
                                                <img src={t.src} alt="thumb" style={t.filter ? { filter: t.filter } : undefined} />
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Info */}
                                <div className="product-detail-info">
                                    <span className="detail-cat">{product.categoryName}</span>
                                    <h1 className="detail-title">{product.name}</h1>
                                    <div className="detail-price-row">
                                        <span className="detail-price-current">{formatPrice(product.price)}</span>
                                    </div>
                                    <p className="detail-desc">{product.description}</p>

                                    <div className="detail-highlights">
                                        <h4>What's Included</h4>
                                        <ul>
                                            {product.details.map((d, i) => <li key={i}>{d}</li>)}
                                        </ul>
                                    </div>

                                    <div className="qty-row">
                                        <span className="qty-label">Quantity:</span>
                                        <div className="qty-control">
                                            <button className="qty-btn" id="qtyMinus" onClick={dec}>−</button>
                                            <input type="number" className="qty-num" id="qtyNum" value={qty} min="1" max="99" readOnly />
                                            <button className="qty-btn" id="qtyPlus" onClick={inc}>+</button>
                                        </div>
                                    </div>

                                    {product.category === 'Photomagnet' && (
                                        <div className="custom-image-upload" style={{ marginTop: '20px', marginBottom: '20px', background: 'var(--gray-50)', padding: '16px', borderRadius: '12px', border: '1px dashed var(--gray-300)' }}>
                                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, marginBottom: '12px', color: 'var(--purple-dark)' }}>
                                                <span className="material-symbols-outlined" style={{ fontSize: '1.2rem', color: 'var(--purple)' }}>upload_file</span>
                                                Upload Images for Photo Magnet
                                            </label>

                                            <div style={{ marginBottom: '12px' }}>
                                                <span style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--gray-600)', display: 'block', marginBottom: '6px' }}>Select Number of Photos:</span>
                                                <select id="photoCountSelect" className="form-control" style={{ width: '100px', cursor: 'pointer', padding: '8px' }} defaultValue="1">
                                                    <option value="1">1</option>
                                                    <option value="2">2</option>
                                                    <option value="4">4</option>
                                                    <option value="6">6</option>
                                                    <option value="8">8</option>
                                                    <option value="12">12</option>
                                                </select>
                                            </div>

                                            <input type="hidden" role="uploadcare-uploader" id="customImageUcare" data-images-only="true" data-multiple="true" data-multiple-min="1" data-multiple-max="12" />
                                            <div id="customImagePreview" style={{ marginTop: '12px', display: 'none', flexWrap: 'wrap', gap: '8px' }}></div>
                                            <small style={{ color: 'var(--text-muted)', fontSize: '0.8rem', display: 'block', marginTop: '8px' }}>Upload multiple photos. Crop, rotate, and enhance colors after selecting!</small>
                                        </div>
                                    )}

                                    <div className="detail-cta">
                                        <button id="btn-add-to-cart" className="btn btn-primary btn-lg" data-product-id={product.id} onClick={addToCart}>
                                            <i className="ri-shopping-bag-line"></i> Add to Cart
                                        </button>
                                    </div>

                                    <div className="detail-trust">
                                        <div className="trust-item">
                                            <span className="material-symbols-outlined ms-trust" style={{ color: 'var(--purple)' }}>redeem</span>
                                            Free Gift Wrapping
                                        </div>
                                        <div className="trust-item">
                                            <span className="material-symbols-outlined ms-trust" style={{ color: 'var(--purple)' }}>local_shipping</span>
                                            Fast Delivery
                                        </div>
                                        <div className="trust-item">
                                            <span className="material-symbols-outlined ms-trust" style={{ color: 'var(--purple)' }}>lock</span>
                                            Secure Payment
                                        </div>
                                        <div className="trust-item">
                                            <span className="material-symbols-outlined ms-trust" style={{ color: 'var(--purple)' }}>eco</span>
                                            Eco-friendly
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Related Products */}
                    <div style={{ marginTop: '80px' }}>
                        <div className="section-header" style={{ marginBottom: '32px' }}>
                            <span className="section-tag">More Gifts</span>
                            <h2 className="section-title">You Might Also <span>Love</span></h2>
                        </div>
                        <div className="products-grid" id="relatedGrid">
                            {related.map(p => <ProductCard key={p.id} product={p} variant="related" />)}
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
            <WhatsAppFab />
        </>
    )
}
