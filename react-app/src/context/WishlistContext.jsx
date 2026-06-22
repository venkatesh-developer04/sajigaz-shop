import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { useProducts } from './ProductsContext'
import { wishlistBurst } from '../lib/effects'

// Same localStorage key + shape (array of numeric product IDs) as wishlist.js.
const WISHLIST_KEY = 'sajigaz_wishlist'

const WishlistContext = createContext(null)

function loadWishlist() {
    try {
        const saved = localStorage.getItem(WISHLIST_KEY)
        return saved ? JSON.parse(saved) : []
    } catch {
        return []
    }
}

export function WishlistProvider({ children }) {
    const { getProductById } = useProducts()
    const [ids, setIds] = useState(loadWishlist)

    useEffect(() => {
        localStorage.setItem(WISHLIST_KEY, JSON.stringify(ids))
    }, [ids])

    const toggle = useCallback((productId) => {
        const id = parseInt(productId)
        if (isNaN(id)) return
        setIds(prev => {
            if (prev.indexOf(id) === -1) {
                requestAnimationFrame(() => {
                    wishlistBurst(id)
                    const btn = document.querySelector(`[data-product-id="${id}"] .wishlist-btn`)
                    if (btn && window.gsap) window.gsap.from(btn, { scale: 0.5, duration: 0.4, ease: 'back.out(3)' })
                })
                return [...prev, id]
            }
            return prev.filter(x => x !== id)
        })
    }, [])

    const has = useCallback((productId) => ids.includes(parseInt(productId)), [ids])
    const getItems = useCallback(
        () => ids.map(id => getProductById(id)).filter(p => p !== null && p !== undefined),
        [ids, getProductById]
    )
    const getCount = useCallback(() => ids.length, [ids])
    const clear = useCallback(() => setIds([]), [])

    const value = { ids, toggle, has, getItems, getCount, clear }
    return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>
}

export function useWishlist() {
    const ctx = useContext(WishlistContext)
    if (!ctx) throw new Error('useWishlist must be used within WishlistProvider')
    return ctx
}
