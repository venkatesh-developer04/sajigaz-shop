import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { useProducts } from './ProductsContext'
import { showToast, cartBurst } from '../lib/effects'

// Same localStorage key + item shape as the original cart.js singleton.
const CART_KEY = 'sajigaz_cart'

const CartContext = createContext(null)

function loadCart() {
    try {
        const saved = localStorage.getItem(CART_KEY)
        return saved ? JSON.parse(saved) : []
    } catch {
        return []
    }
}

export function CartProvider({ children }) {
    const { getProductById } = useProducts()
    const [items, setItems] = useState(loadCart)

    useEffect(() => {
        localStorage.setItem(CART_KEY, JSON.stringify(items))
    }, [items])

    // add(productId, qty = 1, customImageB64 = null) — same merge rules as before.
    const add = useCallback((productId, qty = 1, customImageB64 = null) => {
        const product = getProductById(productId)
        if (!product) return
        setItems(prev => {
            const next = prev.map(i => ({ ...i }))
            const existing = next.find(i => i.id === product.id && i.customImageB64 === customImageB64)
            if (existing && !customImageB64) {
                existing.qty += qty
            } else if (existing && existing.customImageB64 === customImageB64) {
                existing.qty += qty
            } else {
                next.push({ id: product.id, name: product.name, price: product.price, image: product.image, qty, customImageB64 })
            }
            return next
        })
        // Defer the burst so the (possibly newly rendered) target button exists.
        requestAnimationFrame(() => cartBurst(productId))
        showToast('Added to cart!')
    }, [getProductById])

    const remove = useCallback((productId) => {
        setItems(prev => prev.filter(i => i.id !== parseInt(productId)))
    }, [])

    const updateQty = useCallback((productId, qty) => {
        setItems(prev => {
            const id = parseInt(productId)
            const q = parseInt(qty)
            if (q <= 0) return prev.filter(i => i.id !== id)
            return prev.map(i => i.id === id ? { ...i, qty: q } : i)
        })
    }, [])

    const clear = useCallback(() => setItems([]), [])

    const getTotal = useCallback(() => items.reduce((sum, i) => sum + (i.price * i.qty), 0), [items])
    const getCount = useCallback(() => items.reduce((sum, i) => sum + i.qty, 0), [items])

    const value = { items, add, remove, updateQty, clear, getTotal, getCount, showToast }
    return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
    const ctx = useContext(CartContext)
    if (!ctx) throw new Error('useCart must be used within CartProvider')
    return ctx
}
