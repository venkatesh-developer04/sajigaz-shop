import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { getProducts } from '../lib/api'

// Loads the catalog from the backend (replaces the old hardcoded products.js)
// and exposes the same helper API the components already used.
const ProductsContext = createContext(null)

export function ProductsProvider({ children }) {
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const reload = useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
            const list = await getProducts()
            setProducts(Array.isArray(list) ? list : [])
        } catch (err) {
            setError(err.message || 'Failed to load products')
            setProducts([])
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => { reload() }, [reload])

    const getProductById = useCallback(
        (id) => products.find((p) => p.id === parseInt(id)),
        [products]
    )
    const getProductsByCategory = useCallback(
        (cat) => (!cat || cat === 'all' ? products : products.filter((p) => p.category === cat)),
        [products]
    )
    const getFeaturedProducts = useCallback(
        () => products.filter((p) => p.featured),
        [products]
    )

    const value = { products, loading, error, reload, getProductById, getProductsByCategory, getFeaturedProducts }
    return <ProductsContext.Provider value={value}>{children}</ProductsContext.Provider>
}

export function useProducts() {
    const ctx = useContext(ProductsContext)
    if (!ctx) throw new Error('useProducts must be used within ProductsProvider')
    return ctx
}
