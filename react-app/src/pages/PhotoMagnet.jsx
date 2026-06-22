import ShopPage from '../components/ShopPage'

const TABS = [
    { cat: 'Photomagnet', label: 'Photo Magnet', icon: 'auto_awesome' },
]

// Note: 'photomagent' key preserved verbatim from the original photo-magnet.html catMap.
const CAT_MAP = { hampers: 'Gift Hampers', 'gift-boxes': 'Gift Boxes', photomagent: 'Photo Magnet', all: 'All Gifts' }

export default function PhotoMagnet() {
    return (
        <ShopPage
            tabs={TABS}
            catMap={CAT_MAP}
            defaultTitle="Photo Magnet"
            breadcrumbDefault="Photo Magnet"
            cardVariant="photomagnet"
            docTitle="Photo Magnets — Sajigaz Designs | Beyond Imagination"
        />
    )
}
