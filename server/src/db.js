import { DatabaseSync } from 'node:sqlite'

// Uses Node's built-in SQLite (node:sqlite, Node >= 22.5) — real SQLite with no
// native build step. API mirrors better-sqlite3: prepare/run/get/all.
const db = new DatabaseSync(process.env.DB_PATH || './sajigaz.db')
db.exec('PRAGMA journal_mode = WAL;')

db.exec(`
CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    receipt TEXT UNIQUE,
    razorpay_order_id TEXT,
    razorpay_payment_id TEXT,
    razorpay_signature TEXT,
    amount INTEGER NOT NULL,            -- in paise
    currency TEXT NOT NULL DEFAULT 'INR',
    status TEXT NOT NULL DEFAULT 'lead', -- lead | paid | failed | fulfilled
    customer_name TEXT,
    customer_phone TEXT,
    customer_address TEXT,
    customer_pincode TEXT,
    occasion TEXT,
    delivery_date TEXT,
    items_json TEXT NOT NULL,
    subtotal INTEGER NOT NULL,          -- in rupees
    delivery INTEGER NOT NULL,          -- in rupees
    total INTEGER NOT NULL,             -- in rupees
    lead_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_orders_rzp ON orders(razorpay_order_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);

CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    category_name TEXT NOT NULL,
    crop_ratio TEXT,
    price INTEGER NOT NULL,
    original_price INTEGER NOT NULL,
    rating REAL NOT NULL DEFAULT 4.8,
    reviews INTEGER NOT NULL DEFAULT 0,
    image TEXT NOT NULL,
    images_json TEXT NOT NULL DEFAULT '[]',
    badge TEXT,
    badge_type TEXT,
    description TEXT,
    details_json TEXT NOT NULL DEFAULT '[]',
    tags_json TEXT NOT NULL DEFAULT '[]',
    featured INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
`)

// ── Migration: legacy 'created' status / created_at column → 'lead' / lead_at ──
const orderCols = db.prepare('PRAGMA table_info(orders)').all().map((c) => c.name)
if (orderCols.includes('created_at') && !orderCols.includes('lead_at')) {
    db.exec('ALTER TABLE orders RENAME COLUMN created_at TO lead_at')
}
db.exec("UPDATE orders SET status = 'lead' WHERE status = 'created'")

export default db
