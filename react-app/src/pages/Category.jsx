import ShopPage from '../components/ShopPage'

const TABS = [
    { cat: 'all', label: 'All' },
    { cat: 'hampers', label: 'Hampers', icon: 'redeem' },
    { cat: 'gift-boxes', label: 'Gift Boxes', icon: 'inventory_2' },
    { cat: 'Photomagnet', label: 'Photo Magnet', icon: 'auto_awesome' },
]

const CAT_MAP = { hampers: 'Gift Hampers', 'gift-boxes': 'Gift Boxes', personalized: 'Photo Magnet', all: 'All Gifts' }

export default function Category() {
    return (
        <ShopPage
            tabs={TABS}
            catMap={CAT_MAP}
            defaultTitle="All Gifts"
            breadcrumbDefault="Shop"
            cardVariant="category"
            docTitle="Shop All — Sajigaz Designs | Beyond Imagination"
        />
    )
}
