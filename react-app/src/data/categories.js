// Static category config (presentation metadata: icon/color/description).
// Product counts are derived from the live products at render time.
export const CATEGORIES = [
    { id: 'hampers', name: 'Gift Hampers', icon: 'redeem', description: 'Curated hampers for every occasion', color: '#5C2D91' },
    { id: 'gift-boxes', name: 'Gift Boxes', icon: 'inventory_2', description: 'Premium boxes wrapped to impress', color: '#E1173F' },
    { id: 'personalized', name: 'Personalized Gifts', icon: 'auto_awesome', description: 'Made with your personal touch', color: '#F5A623' },
]

// Category choices offered in the admin product form (includes Photo Magnet).
export const CATEGORY_OPTIONS = [
    { id: 'hampers', name: 'Gift Hampers' },
    { id: 'gift-boxes', name: 'Gift Boxes' },
    { id: 'Photomagnet', name: 'Photo Magnet' },
    { id: 'personalized', name: 'Personalized Gifts' },
]
