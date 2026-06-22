import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useWishlist } from '../context/WishlistContext'
import { formatPrice, getDiscountPercent } from '../lib/format'
import Stars from './Stars'

// One card component covering every variant used across the original pages:
//  - 'default'    : home grid (always Add to Cart)
//  - 'category'   : shop page (Photomagnet items show no action)
//  - 'photomagnet': photo-magnet page (Photomagnet items show an Upload button)
//  - 'related'    : product page related grid (no category label, rating w/o reviews, 1rem stars)
//  - 'favorite'   : favorites page (heart filled/active, removal handled by parent)
export default function ProductCard({ product: p, variant = 'default', onRemove, style, cardRef }) {
    const navigate = useNavigate()
    const cart = useCart()
    const wishlist = useWishlist()

    const off = getDiscountPercent(p.originalPrice, p.price)
    const isPhoto = p.category === 'Photomagnet'
    const isFav = variant === 'favorite' || wishlist.has(p.id)
    const showCat = variant !== 'related'
    const starSize = variant === 'related' ? '1rem' : '0.9rem'
    const ratingText = variant === 'related' ? `${p.rating}` : `${p.rating} (${p.reviews})`

    const goProduct = () => navigate(`/product?id=${p.id}`)

    const onWishlistClick = (e) => {
        e.stopPropagation()
        if (variant === 'favorite' && onRemove) onRemove(p.id, e)
        else wishlist.toggle(p.id)
    }

    const addToCart = (e) => {
        e.stopPropagation()
        cart.add(p.id)
    }
    const goUpload = (e) => {
        e.stopPropagation()
        navigate(`/product?id=${p.id}`)
    }

    // Decide which action block (if any) to render for this variant.
    let actions = null
    if (variant === 'default' || variant === 'related') {
        actions = (
            <div className="product-actions">
                <button className="btn-add-cart" onClick={addToCart}>
                    <i className="ri-shopping-bag-line"></i> Add to Cart
                </button>
            </div>
        )
    } else if (variant === 'category' || variant === 'favorite') {
        actions = !isPhoto ? (
            <div className="product-actions">
                <button className="btn-add-cart" onClick={addToCart}>
                    <i className="ri-shopping-bag-line"></i> Add to Cart
                </button>
            </div>
        ) : null
    } else if (variant === 'photomagnet') {
        actions = !isPhoto ? (
            <div className="product-actions">
                <button className="btn-add-cart" onClick={addToCart}>
                    <i className="ri-shopping-bag-line"></i> Add to Cart
                </button>
            </div>
        ) : (
            <div className="product-actions">
                <button className="btn-add-cart" onClick={goUpload}>
                    <i className="ri-upload-line"></i> Upload
                </button>
            </div>
        )
    }

    return (
        <div
            className="product-card"
            data-product-id={p.id}
            onClick={goProduct}
            style={style}
            ref={cardRef}
        >
            <div className="product-img-wrap">
                <img src={p.image} alt={p.name} className="product-img" loading="lazy" />
                <span className={`product-badge badge-${p.badgeType}`}>{p.badge}</span>
                <button
                    className={`wishlist-btn${isFav ? ' active' : ''}`}
                    onClick={onWishlistClick}
                    aria-label="Wishlist"
                >
                    <span className={`material-symbols-outlined${isFav ? ' ms-fill' : ''}`}>
                        {isFav ? 'favorite' : 'favorite_border'}
                    </span>
                </button>
                {actions}
            </div>
            <div className="product-info">
                {showCat && <div className="product-cat">{p.categoryName}</div>}
                <div className="product-name">{p.name}</div>
                <div className="product-rating">
                    <div className="stars"><Stars rating={p.rating} size={starSize} /></div>
                    <span className="rating-num">{ratingText}</span>
                </div>
                <div className="product-price">
                    <span className="price-current">{formatPrice(p.price)}</span>
                    <span className="price-original">{formatPrice(p.originalPrice)}</span>
                    <span className="price-off">{off}% off</span>
                </div>
            </div>
        </div>
    )
}
