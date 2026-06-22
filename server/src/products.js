import db from './db.js'

// ── Initial catalog used to seed an empty DB (the original 8 products). ──
const SEED = [
    { name: 'Luxury Gift Hamper', category: 'hampers', categoryName: 'Gift Hampers', price: 1299, originalPrice: 1699, rating: 4.8, reviews: 124, image: '/assets/img/products/gift_hamper.png', images: ['/assets/img/products/gift_hamper.png'], badge: 'Best Seller', badgeType: 'bestseller', description: 'A stunning luxury gift hamper curated with premium chocolates, scented candles, and surprises wrapped in our signature purple-gold packaging. Perfect for birthdays, anniversaries, and celebrations.', details: ['Premium quality items', 'Signature Sajigaz packaging', 'Customizable message card', 'Free gift wrapping', 'Same-day delivery available'], tags: ['birthday', 'anniversary', 'luxury'], featured: true },
    { name: 'Birthday Surprise Box', category: 'gift-boxes', categoryName: 'Gift Boxes', price: 1299, originalPrice: 1599, rating: 4.7, reviews: 89, image: '/assets/img/products/birthday_box.png', images: ['/assets/img/products/birthday_box.png'], badge: 'New', badgeType: 'new', description: 'Make every birthday unforgettable with our signature surprise box. Filled with goodies and wrapped in our magical purple-magenta theme that screams celebration!', details: ['Surprise assortment inside', 'Vibrant themed packaging', 'Add-on balloon option', 'Personalized name print', 'Eco-friendly materials'], tags: ['birthday', 'celebration', 'surprise'], featured: true },
    { name: 'Photo Magnet 2*2', category: 'Photomagnet', categoryName: 'Photo Magnet', cropRatio: '1:1', price: 320, originalPrice: 400, rating: 4.9, reviews: 203, image: '/assets/img/products/photo_frame.png', images: ['/assets/img/products/photo_frame.png'], badge: 'Top Pick', badgeType: 'toppick', description: 'The best photo magnet for your fridge. Customize it with your favorite photo and make it special.', details: ['High quality print on premium', 'Custom Photo', 'Available in multiple images', 'Perfect gift', 'Best for fridge'], tags: ['Photomagnet', 'photo', 'memories'], featured: true },
    { name: 'Luxury Candle Gift Set', category: 'hampers', categoryName: 'Gift Hampers', price: 749, originalPrice: 999, rating: 4.6, reviews: 67, image: '/assets/img/products/candle_set.png', images: ['/assets/img/products/candle_set.png'], badge: 'Sale', badgeType: 'sale', description: 'Indulge the senses with our premium scented candle set. Presented in elegant glass jars with dried flowers, this set makes the perfect self-care or gifting package.', details: ['Premium natural wax candles', '3 signature fragrances', 'Dried flower decoration', 'Gold packaging box', 'Burns for 40+ hours'], tags: ['candle', 'wellness', 'luxury'], featured: false },
    { name: 'Premium Chocolate Box', category: 'gift-boxes', categoryName: 'Gift Boxes', price: 649, originalPrice: 849, rating: 4.8, reviews: 156, image: '/assets/img/products/chocolate_box.png', images: ['/assets/img/products/chocolate_box.png'], badge: 'Love Special', badgeType: 'special', description: 'Sweeten every special moment with our premium heart-shaped chocolate box. Crafted with artisan chocolates and dressed in our signature red-bow packaging.', details: ['16 premium chocolate pieces', 'Heart-shaped arrangement', 'Signature red ribbon bow', 'Comes in gift bag', 'Shelf life: 30 days'], tags: ['chocolate', 'valentine', 'love'], featured: true },
    { name: 'Photo Magnet 3*3', category: 'Photomagnet', categoryName: 'Photo Magnet', cropRatio: '1:1', price: 550, originalPrice: 600, rating: 4.9, reviews: 203, image: '/assets/img/products/photo_frame.png', images: ['/assets/img/products/photo_frame.png'], badge: 'Top Pick', badgeType: 'toppick', description: 'The best photo magnet for your fridge. Customize it with your favorite photo and make it special.', details: ['High quality print on premium', 'Custom Photo', 'Available in multiple images', 'Perfect gift', 'Best for fridge'], tags: ['Photomagnet', 'photo', 'memories'], featured: true },
    { name: 'Photo Magnet 3*2', category: 'Photomagnet', categoryName: 'Photo Magnet', cropRatio: '3:2', price: 420, originalPrice: 500, rating: 4.9, reviews: 203, image: '/assets/img/products/photo_frame.png', images: ['/assets/img/products/photo_frame.png'], badge: 'Top Pick', badgeType: 'toppick', description: 'The best photo magnet for your fridge. Customize it with your favorite photo and make it special.', details: ['High quality print on premium', 'Custom Photo', 'Available in multiple images', 'Perfect gift', 'Best for fridge'], tags: ['Photomagnet', 'photo', 'memories'], featured: true },
    { name: 'Festive Gift Combo', category: 'hampers', categoryName: 'Gift Hampers', price: 1599, originalPrice: 2199, rating: 4.9, reviews: 78, image: '/assets/img/products/gift_hamper.png', images: ['/assets/img/products/gift_hamper.png'], badge: 'Festival Edition', badgeType: 'festival', description: 'The ultimate festive combo! Packed with sweets, chocolates, candles, a photo frame, and our signature greeting card. The most complete celebratory package Sajigaz offers.', details: ['8 curated items inside', 'Festival themed packaging', 'Free greeting card', 'Customizable contents', 'Bulk order discounts available'], tags: ['festival', 'combo', 'diwali'], featured: true },
]

const INSERT_SQL = `
INSERT INTO products
    (name, category, category_name, crop_ratio, price, original_price, rating, reviews,
     image, images_json, badge, badge_type, description, details_json, tags_json, featured, updated_at)
VALUES
    (@name, @category, @categoryName, @cropRatio, @price, @originalPrice, @rating, @reviews,
     @image, @imagesJson, @badge, @badgeType, @description, @detailsJson, @tagsJson, @featured, datetime('now'))
`

// Normalize an incoming product payload to bound DB params (with defaults).
function toParams(p) {
    const images = Array.isArray(p.images) && p.images.length ? p.images : [p.image].filter(Boolean)
    return {
        name: String(p.name || '').trim(),
        category: String(p.category || '').trim(),
        categoryName: String(p.categoryName || '').trim(),
        cropRatio: p.cropRatio ? String(p.cropRatio) : null,
        price: parseInt(p.price),
        originalPrice: parseInt(p.originalPrice != null ? p.originalPrice : p.price),
        rating: p.rating != null ? Number(p.rating) : 4.8,
        reviews: p.reviews != null ? parseInt(p.reviews) : 0,
        image: String(p.image || '').trim(),
        imagesJson: JSON.stringify(images),
        badge: p.badge ? String(p.badge) : null,
        badgeType: p.badgeType ? String(p.badgeType) : null,
        description: p.description ? String(p.description) : '',
        detailsJson: JSON.stringify(Array.isArray(p.details) ? p.details : []),
        tagsJson: JSON.stringify(Array.isArray(p.tags) ? p.tags : []),
        featured: p.featured ? 1 : 0,
    }
}

function validate(params) {
    if (!params.name) throw new Error('Name is required')
    if (!params.category) throw new Error('Category is required')
    if (!params.image) throw new Error('Image is required')
    if (!Number.isInteger(params.price) || params.price < 0) throw new Error('Valid price is required')
    if (!Number.isInteger(params.originalPrice) || params.originalPrice < 0) throw new Error('Valid original price is required')
    if (!params.categoryName) params.categoryName = params.category
}

export function seedProducts() {
    const { c } = db.prepare('SELECT COUNT(*) AS c FROM products').get()
    if (c > 0) return
    const insert = db.prepare(INSERT_SQL)
    for (const p of SEED) insert.run(toParams(p))
    console.log(`Seeded ${SEED.length} products`)
}

export function serializeProduct(row) {
    return {
        id: row.id,
        name: row.name,
        category: row.category,
        categoryName: row.category_name,
        cropRatio: row.crop_ratio || undefined,
        price: row.price,
        originalPrice: row.original_price,
        rating: row.rating,
        reviews: row.reviews,
        image: row.image,
        images: JSON.parse(row.images_json),
        badge: row.badge || '',
        badgeType: row.badge_type || '',
        description: row.description || '',
        details: JSON.parse(row.details_json),
        tags: JSON.parse(row.tags_json),
        featured: !!row.featured,
    }
}

export function getAllProducts() {
    return db.prepare('SELECT * FROM products ORDER BY id ASC').all().map(serializeProduct)
}

export function getProduct(id) {
    const row = db.prepare('SELECT * FROM products WHERE id = ?').get(parseInt(id))
    return row ? serializeProduct(row) : null
}

export function createProduct(data) {
    const params = toParams(data)
    validate(params)
    const info = db.prepare(INSERT_SQL).run(params)
    return getProduct(Number(info.lastInsertRowid))
}

export function updateProduct(id, data) {
    const existing = db.prepare('SELECT * FROM products WHERE id = ?').get(parseInt(id))
    if (!existing) return null
    const params = toParams(data)
    validate(params)
    db.prepare(`
        UPDATE products SET
            name=@name, category=@category, category_name=@categoryName, crop_ratio=@cropRatio,
            price=@price, original_price=@originalPrice, rating=@rating, reviews=@reviews,
            image=@image, images_json=@imagesJson, badge=@badge, badge_type=@badgeType,
            description=@description, details_json=@detailsJson, tags_json=@tagsJson,
            featured=@featured, updated_at=datetime('now')
        WHERE id=@id
    `).run({ ...params, id: parseInt(id) })
    return getProduct(id)
}

export function deleteProduct(id) {
    const info = db.prepare('DELETE FROM products WHERE id = ?').run(parseInt(id))
    return info.changes > 0
}

// Authoritative amount computation — prices come from the DB, never the client.
// Mirrors the cart/checkout rule: free delivery over ₹999, otherwise ₹80.
export function computeTotals(items) {
    if (!Array.isArray(items) || items.length === 0) {
        throw new Error('Cart is empty')
    }
    const stmt = db.prepare('SELECT id, name, price FROM products WHERE id = ?')
    const lineItems = items.map((raw) => {
        const id = parseInt(raw.id)
        const qty = parseInt(raw.qty)
        const product = stmt.get(id)
        if (!product) throw new Error(`Unknown product id: ${raw.id}`)
        if (!Number.isInteger(qty) || qty < 1) throw new Error(`Invalid qty for product ${id}`)
        return {
            id,
            name: product.name,
            price: product.price,
            qty,
            customImageB64: typeof raw.customImageB64 === 'string' ? raw.customImageB64 : null,
        }
    })
    const subtotal = lineItems.reduce((sum, i) => sum + i.price * i.qty, 0)
    const delivery = subtotal >= 999 ? 0 : 80
    const total = subtotal + delivery
    return { lineItems, subtotal, delivery, total }
}
