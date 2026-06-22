// Pure formatting helpers (no product data). Ported from the original products.js.
export function formatPrice(price) {
    return '₹' + Number(price || 0).toLocaleString('en-IN')
}

export function getDiscountPercent(original, current) {
    if (!original || original <= 0) return 0
    return Math.round(((original - current) / original) * 100)
}
