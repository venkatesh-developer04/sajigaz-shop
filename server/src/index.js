import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import crypto from 'node:crypto'

import db from './db.js'
import {
    computeTotals, seedProducts, getAllProducts, getProduct,
    createProduct, updateProduct, deleteProduct,
} from './products.js'
import { getRazorpay, isConfigured } from './razorpay.js'
import { signAdminToken, requireAdmin } from './auth.js'

seedProducts() // populate an empty DB with the initial catalog

const app = express()
const PORT = process.env.PORT || 8787

// ---- CORS ----
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5501')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
app.use(cors({
    origin(origin, cb) {
        // allow same-origin / curl (no origin) and any configured origin
        if (!origin || allowedOrigins.includes(origin)) return cb(null, true)
        cb(new Error(`Origin not allowed: ${origin}`))
    },
}))

// ---- Webhook needs the RAW body for signature verification; register it
// BEFORE express.json() so the body isn't parsed away. ----
app.post('/api/webhook', express.raw({ type: 'application/json' }), (req, res) => {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET
    if (!secret) return res.status(503).json({ error: 'Webhook secret not configured' })

    const signature = req.headers['x-razorpay-signature']
    const expected = crypto.createHmac('sha256', secret).update(req.body).digest('hex')
    if (signature !== expected) return res.status(400).json({ error: 'Invalid signature' })

    let event
    try {
        event = JSON.parse(req.body.toString('utf8'))
    } catch {
        return res.status(400).json({ error: 'Bad payload' })
    }

    const entity = event?.payload?.payment?.entity
    const rzpOrderId = entity?.order_id
    if (rzpOrderId) {
        if (event.event === 'payment.captured') {
            db.prepare(
                `UPDATE orders SET status = 'paid', razorpay_payment_id = ?, updated_at = datetime('now')
                 WHERE razorpay_order_id = ? AND status != 'fulfilled'`
            ).run(entity.id, rzpOrderId)
        } else if (event.event === 'payment.failed') {
            db.prepare(
                `UPDATE orders SET status = 'failed', updated_at = datetime('now')
                 WHERE razorpay_order_id = ? AND status = 'created'`
            ).run(rzpOrderId)
        }
    }
    res.json({ received: true })
})

app.use(express.json())

// ---- Health ----
app.get('/api/health', (req, res) => {
    res.json({ ok: true, razorpayConfigured: isConfigured() })
})

// ---- Public catalog ----
app.get('/api/products', (req, res) => {
    res.json({ products: getAllProducts() })
})
app.get('/api/products/:id', (req, res) => {
    const product = getProduct(req.params.id)
    if (!product) return res.status(404).json({ error: 'Not found' })
    res.json({ product })
})

// ---- Admin: product CRUD ----
app.post('/api/admin/products', requireAdmin, (req, res) => {
    try {
        res.json({ product: createProduct(req.body || {}) })
    } catch (err) {
        res.status(400).json({ error: err.message })
    }
})
app.put('/api/admin/products/:id', requireAdmin, (req, res) => {
    try {
        const product = updateProduct(req.params.id, req.body || {})
        if (!product) return res.status(404).json({ error: 'Not found' })
        res.json({ product })
    } catch (err) {
        res.status(400).json({ error: err.message })
    }
})
app.delete('/api/admin/products/:id', requireAdmin, (req, res) => {
    const ok = deleteProduct(req.params.id)
    if (!ok) return res.status(404).json({ error: 'Not found' })
    res.json({ success: true })
})

// ---- Create order (amount computed server-side) ----
app.post('/api/orders', async (req, res) => {
    try {
        const { items, customer = {} } = req.body || {}
        const { lineItems, subtotal, delivery, total } = computeTotals(items)
        const amountPaise = total * 100
        const receipt = 'sajigaz_' + Date.now() + '_' + crypto.randomBytes(3).toString('hex')

        const rzpOrder = await getRazorpay().orders.create({
            amount: amountPaise,
            currency: 'INR',
            receipt,
            notes: { customer_name: customer.name || '', customer_phone: customer.phone || '' },
        })

        const info = db.prepare(
            `INSERT INTO orders
                (receipt, razorpay_order_id, amount, currency, status,
                 customer_name, customer_phone, customer_address, customer_pincode, occasion, delivery_date,
                 items_json, subtotal, delivery, total)
             VALUES (?, ?, ?, 'INR', 'created', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        ).run(
            receipt, rzpOrder.id, amountPaise,
            customer.name || null, customer.phone || null, customer.address || null,
            customer.pincode || null, customer.occasion || null, customer.deliveryDate || null,
            JSON.stringify(lineItems), subtotal, delivery, total
        )

        res.json({
            id: Number(info.lastInsertRowid),
            key_id: process.env.RAZORPAY_KEY_ID,
            order_id: rzpOrder.id,
            amount: amountPaise,
            currency: 'INR',
            receipt,
        })
    } catch (err) {
        res.status(err.statusCode || 400).json({ error: err.message || 'Could not create order' })
    }
})

// ---- Verify payment signature ----
app.post('/api/payments/verify', (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body || {}
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
        return res.status(400).json({ error: 'Missing payment fields' })
    }
    const secret = process.env.RAZORPAY_KEY_SECRET
    if (!secret) return res.status(503).json({ error: 'Razorpay not configured' })

    const expected = crypto
        .createHmac('sha256', secret)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest('hex')

    if (expected !== razorpay_signature) {
        db.prepare(`UPDATE orders SET status = 'failed', updated_at = datetime('now') WHERE razorpay_order_id = ? AND status = 'created'`).run(razorpay_order_id)
        return res.status(400).json({ error: 'Payment verification failed' })
    }

    db.prepare(
        `UPDATE orders SET status = 'paid', razorpay_payment_id = ?, razorpay_signature = ?, updated_at = datetime('now')
         WHERE razorpay_order_id = ? AND status != 'fulfilled'`
    ).run(razorpay_payment_id, razorpay_signature, razorpay_order_id)

    res.json({ success: true })
})

// ---- Admin auth ----
app.post('/api/admin/login', (req, res) => {
    const { password } = req.body || {}
    const expected = process.env.ADMIN_PASSWORD
    if (!expected) return res.status(503).json({ error: 'Admin password not configured' })
    if (!password || password !== expected) return res.status(401).json({ error: 'Incorrect password' })
    res.json({ token: signAdminToken() })
})

function serializeOrder(row) {
    return { ...row, items: JSON.parse(row.items_json), items_json: undefined }
}

// ---- Admin: list orders ----
app.get('/api/admin/orders', requireAdmin, (req, res) => {
    const { status } = req.query
    const limit = Math.min(parseInt(req.query.limit) || 200, 1000)
    let rows
    if (status) {
        rows = db.prepare('SELECT * FROM orders WHERE status = ? ORDER BY id DESC LIMIT ?').all(status, limit)
    } else {
        rows = db.prepare('SELECT * FROM orders ORDER BY id DESC LIMIT ?').all(limit)
    }
    res.json({ orders: rows.map(serializeOrder) })
})

// ---- Admin: single order ----
app.get('/api/admin/orders/:id', requireAdmin, (req, res) => {
    const row = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id)
    if (!row) return res.status(404).json({ error: 'Not found' })
    res.json({ order: serializeOrder(row) })
})

// ---- Admin: update status (e.g. mark fulfilled) ----
app.patch('/api/admin/orders/:id', requireAdmin, (req, res) => {
    const { status } = req.body || {}
    const allowed = ['created', 'paid', 'failed', 'fulfilled']
    if (!allowed.includes(status)) return res.status(400).json({ error: 'Invalid status' })
    const result = db.prepare(`UPDATE orders SET status = ?, updated_at = datetime('now') WHERE id = ?`).run(status, req.params.id)
    if (result.changes === 0) return res.status(404).json({ error: 'Not found' })
    const row = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id)
    res.json({ order: serializeOrder(row) })
})

app.listen(PORT, () => {
    console.log(`Sajigaz server listening on :${PORT} (Razorpay configured: ${isConfigured()})`)
})
