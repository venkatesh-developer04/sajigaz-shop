import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import AnnouncementBar from './AnnouncementBar'
import Header from './Header'
import Footer from './Footer'
import WhatsAppFab from './WhatsAppFab'
import ProductCard from './ProductCard'
import { useProducts } from '../context/ProductsContext'

// Shared implementation for the Shop All (category) and Photo Magnet pages.
// They share identical structure and differ only by tabs / labels / card variant.
export default function ShopPage({ tabs, catMap, defaultTitle, breadcrumbDefault, cardVariant, docTitle }) {
    const navigate = useNavigate()
    const [searchParams, setSearchParams] = useSearchParams()
    const [sort, setSort] = useState('default')
    const { getProductsByCategory, loading } = useProducts()

    const activeCat = searchParams.get('cat') || 'all'
    const activeSearch = searchParams.get('search') || ''

    useEffect(() => { if (docTitle) document.title = docTitle }, [docTitle])

    const pageHeroTitle = activeSearch ? `Search: "${activeSearch}"` : (catMap[activeCat] || defaultTitle)
    const breadcrumbCurrent = catMap[activeCat] || breadcrumbDefault

    const products = useMemo(() => {
        let list = getProductsByCategory(activeCat === 'all' ? null : activeCat)
        if (activeSearch) {
            const q = activeSearch.toLowerCase()
            list = list.filter(p => p.name.toLowerCase().includes(q) || p.tags.some(t => t.includes(q)))
        }
        let sorted = [...list]
        if (sort === 'price-asc') sorted.sort((a, b) => a.price - b.price)
        if (sort === 'price-desc') sorted.sort((a, b) => b.price - a.price)
        if (sort === 'rating') sorted.sort((a, b) => b.rating - a.rating)
        return sorted
    }, [activeCat, activeSearch, sort, getProductsByCategory])

    const resultCount = `${products.length} product${products.length !== 1 ? 's' : ''} found`

    const onTab = (cat) => {
        const next = new URLSearchParams(searchParams)
        if (cat === 'all') next.delete('cat')
        else next.set('cat', cat)
        setSearchParams(next, { replace: true })
    }

    return (
        <>
            <AnnouncementBar variant="shop" />
            <Header />

            {/* Page Hero */}
            <section className="page-hero">
                <div className="container page-hero-inner">
                    <div>
                        <h1 id="pageHeroTitle">{pageHeroTitle}</h1>
                        <nav className="breadcrumb" aria-label="Breadcrumb">
                            <a href="/" onClick={(e) => { e.preventDefault(); navigate('/') }}>Home</a>
                            <span>/</span>
                            <span className="current" id="breadcrumbCurrent">{breadcrumbCurrent}</span>
                        </nav>
                    </div>
                    <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }} id="resultCount">{resultCount}</div>
                </div>
            </section>

            {/* Shop Content */}
            <section className="section products-section" style={{ paddingTop: '48px' }}>
                <div className="container">
                    <div className="products-filter-bar">
                        <div className="filter-tabs" id="filterTabs">
                            {tabs.map(t => (
                                <button
                                    key={t.cat}
                                    className={`filter-tab${activeCat === t.cat ? ' active' : ''}`}
                                    data-cat={t.cat}
                                    onClick={() => onTab(t.cat)}
                                >
                                    {t.icon && <span className="material-symbols-outlined ms-sm">{t.icon}</span>}
                                    {t.icon ? ' ' : ''}{t.label}
                                </button>
                            ))}
                        </div>
                        <select className="sort-select" id="sortSelect" value={sort} onChange={(e) => setSort(e.target.value)}>
                            <option value="default">Sort: Featured</option>
                            <option value="price-asc">Price: Low to High</option>
                            <option value="price-desc">Price: High to Low</option>
                            <option value="rating">Top Rated</option>
                        </select>
                    </div>

                    <div className="products-grid" id="productsGrid">
                        {loading ? (
                            <div className="no-products">
                                <div className="icon"><span className="material-symbols-outlined">hourglass_empty</span></div>
                                <h3>Loading…</h3>
                            </div>
                        ) : products.length === 0 ? (
                            <div className="no-products">
                                <div className="icon"><span className="material-symbols-outlined">search_off</span></div>
                                <h3>No products found</h3>
                                <p>Try a different filter</p>
                            </div>
                        ) : (
                            products.map(p => <ProductCard key={p.id} product={p} variant={cardVariant} />)
                        )}
                    </div>
                </div>
            </section>

            <Footer />
            <WhatsAppFab />
        </>
    )
}
