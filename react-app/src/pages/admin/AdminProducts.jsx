import { useCallback, useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { getProducts, adminCreateProduct, adminUpdateProduct, adminDeleteProduct } from '../../lib/api'
import { formatPrice } from '../../lib/format'
import { CATEGORY_OPTIONS } from '../../data/categories'
import { ADMIN_TOKEN_KEY } from './AdminLogin'
import './admin.css'

const BADGE_TYPES = ['bestseller', 'new', 'toppick', 'sale', 'special', 'festival']

const EMPTY = {
    name: '', category: 'hampers', categoryName: 'Gift Hampers', cropRatio: '',
    price: '', originalPrice: '', image: '', images: '', badge: '', badgeType: 'new',
    description: '', details: '', tags: '', rating: '4.8', reviews: '0', featured: false,
}

function toForm(p) {
    return {
        name: p.name || '', category: p.category || '', categoryName: p.categoryName || '',
        cropRatio: p.cropRatio || '', price: String(p.price ?? ''), originalPrice: String(p.originalPrice ?? ''),
        image: p.image || '', images: (p.images || []).join(', '), badge: p.badge || '',
        badgeType: p.badgeType || 'new', description: p.description || '',
        details: (p.details || []).join('\n'), tags: (p.tags || []).join(', '),
        rating: String(p.rating ?? '4.8'), reviews: String(p.reviews ?? '0'), featured: !!p.featured,
    }
}

function toPayload(f) {
    const image = f.image.trim()
    const images = f.images.split(',').map((s) => s.trim()).filter(Boolean)
    return {
        name: f.name.trim(),
        category: f.category.trim(),
        categoryName: f.categoryName.trim(),
        cropRatio: f.cropRatio.trim() || undefined,
        price: Number(f.price),
        originalPrice: Number(f.originalPrice || f.price),
        image,
        images: images.length ? images : [image],
        badge: f.badge.trim(),
        badgeType: f.badgeType.trim(),
        description: f.description.trim(),
        details: f.details.split('\n').map((s) => s.trim()).filter(Boolean),
        tags: f.tags.split(',').map((s) => s.trim()).filter(Boolean),
        rating: Number(f.rating || 4.8),
        reviews: Number(f.reviews || 0),
        featured: !!f.featured,
    }
}

export default function AdminProducts() {
    const navigate = useNavigate()
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [editing, setEditing] = useState(null) // null = closed; {} or product = open
    const [form, setForm] = useState(EMPTY)
    const [saving, setSaving] = useState(false)

    const token = typeof localStorage !== 'undefined' ? localStorage.getItem(ADMIN_TOKEN_KEY) : null

    const logout = useCallback(() => {
        localStorage.removeItem(ADMIN_TOKEN_KEY)
        navigate('/admin', { replace: true })
    }, [navigate])

    const load = useCallback(async () => {
        if (!token) { navigate('/admin', { replace: true }); return }
        setLoading(true); setError('')
        try {
            setProducts(await getProducts())
        } catch (err) {
            setError(err.message || 'Failed to load products')
        } finally {
            setLoading(false)
        }
    }, [token, navigate])

    useEffect(() => { document.title = 'Products — Admin — Sajigaz Designs' }, [])
    useEffect(() => { load() }, [load])

    const openCreate = () => { setForm(EMPTY); setEditing({}) }
    const openEdit = (p) => { setForm(toForm(p)); setEditing(p) }
    const close = () => setEditing(null)

    const update = (field) => (e) => {
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value
        setForm((f) => ({ ...f, [field]: value }))
    }

    const onCategoryChange = (e) => {
        const id = e.target.value
        const opt = CATEGORY_OPTIONS.find((o) => o.id === id)
        setForm((f) => ({ ...f, category: id, categoryName: opt ? opt.name : f.categoryName }))
    }

    const save = async (e) => {
        e.preventDefault()
        const payload = toPayload(form)
        if (!payload.name || !payload.image || !payload.price) {
            setError('Name, image and price are required')
            return
        }
        setSaving(true); setError('')
        try {
            if (editing && editing.id) await adminUpdateProduct(token, editing.id, payload)
            else await adminCreateProduct(token, payload)
            close()
            await load()
        } catch (err) {
            if (err.status === 401) { logout(); return }
            setError(err.message || 'Save failed')
        } finally {
            setSaving(false)
        }
    }

    const remove = async (p) => {
        if (!window.confirm(`Delete "${p.name}"? This cannot be undone.`)) return
        try {
            await adminDeleteProduct(token, p.id)
            await load()
        } catch (err) {
            if (err.status === 401) { logout(); return }
            setError(err.message || 'Delete failed')
        }
    }

    return (
        <div className="admin-wrap">
            <div className="admin-header">
                <h1>
                    <span className="material-symbols-outlined" style={{ color: 'var(--purple)' }}>inventory_2</span>
                    Products
                </h1>
                <div className="admin-toolbar">
                    <nav className="admin-nav">
                        <Link to="/admin/orders">Orders</Link>
                        <Link to="/admin/products" className="active">Products</Link>
                    </nav>
                    <button className="admin-btn sm" onClick={openCreate}>
                        <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>add</span> Add Product
                    </button>
                    <button className="admin-btn ghost sm" onClick={logout}>Logout</button>
                </div>
            </div>

            {error && <div className="admin-error" style={{ maxWidth: '1200px', margin: '0 auto 12px' }}>{error}</div>}

            <div className="admin-table-wrap">
                {loading ? (
                    <div className="admin-loading">Loading products…</div>
                ) : products.length === 0 ? (
                    <div className="admin-empty">No products. Click “Add Product”.</div>
                ) : (
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>#</th><th></th><th>Name</th><th>Category</th><th>Price</th><th>Featured</th><th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map((p) => (
                                <tr key={p.id}>
                                    <td>{p.id}</td>
                                    <td className="thumb-cell"><img src={p.image} alt="" /></td>
                                    <td>{p.name}</td>
                                    <td>{p.categoryName}<div className="muted">{p.category}</div></td>
                                    <td>{formatPrice(p.price)}<div className="muted" style={{ textDecoration: 'line-through' }}>{formatPrice(p.originalPrice)}</div></td>
                                    <td>{p.featured ? 'Yes' : '—'}</td>
                                    <td style={{ whiteSpace: 'nowrap' }}>
                                        <button className="admin-btn ghost sm" onClick={() => openEdit(p)}>Edit</button>{' '}
                                        <button className="admin-btn ghost sm" style={{ color: 'var(--magenta)', borderColor: 'var(--magenta)' }} onClick={() => remove(p)}>Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {editing && (
                <div className="admin-modal-overlay" onClick={close}>
                    <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
                        <h2>{editing.id ? `Edit Product #${editing.id}` : 'Add Product'}</h2>
                        <form className="admin-form" onSubmit={save}>
                            <div className="field full">
                                <label>Name *</label>
                                <input value={form.name} onChange={update('name')} required />
                            </div>
                            <div className="field">
                                <label>Category *</label>
                                <select value={form.category} onChange={onCategoryChange}>
                                    {CATEGORY_OPTIONS.map((o) => <option key={o.id} value={o.id}>{o.name} ({o.id})</option>)}
                                </select>
                            </div>
                            <div className="field">
                                <label>Category label</label>
                                <input value={form.categoryName} onChange={update('categoryName')} />
                            </div>
                            <div className="field">
                                <label>Price (₹) *</label>
                                <input type="number" min="0" value={form.price} onChange={update('price')} required />
                            </div>
                            <div className="field">
                                <label>Original price (₹)</label>
                                <input type="number" min="0" value={form.originalPrice} onChange={update('originalPrice')} />
                            </div>
                            <div className="field full">
                                <label>Image URL *</label>
                                <input value={form.image} onChange={update('image')} placeholder="/assets/img/products/... or https://..." required />
                            </div>
                            <div className="field full">
                                <label>Extra image URLs (comma-separated, optional)</label>
                                <input value={form.images} onChange={update('images')} placeholder="defaults to the main image" />
                            </div>
                            <div className="field">
                                <label>Badge text</label>
                                <input value={form.badge} onChange={update('badge')} placeholder="e.g. Best Seller" />
                            </div>
                            <div className="field">
                                <label>Badge type</label>
                                <select value={form.badgeType} onChange={update('badgeType')}>
                                    {BADGE_TYPES.map((b) => <option key={b} value={b}>{b}</option>)}
                                </select>
                            </div>
                            <div className="field">
                                <label>Rating</label>
                                <input type="number" step="0.1" min="0" max="5" value={form.rating} onChange={update('rating')} />
                            </div>
                            <div className="field">
                                <label>Reviews</label>
                                <input type="number" min="0" value={form.reviews} onChange={update('reviews')} />
                            </div>
                            <div className="field">
                                <label>Crop ratio (Photo Magnet, e.g. 1:1)</label>
                                <input value={form.cropRatio} onChange={update('cropRatio')} placeholder="optional" />
                            </div>
                            <div className="field check">
                                <input id="pf-featured" type="checkbox" checked={form.featured} onChange={update('featured')} />
                                <label htmlFor="pf-featured" style={{ margin: 0 }}>Featured</label>
                            </div>
                            <div className="field full">
                                <label>Description</label>
                                <textarea rows="3" value={form.description} onChange={update('description')} />
                            </div>
                            <div className="field full">
                                <label>Details / What's included (one per line)</label>
                                <textarea rows="4" value={form.details} onChange={update('details')} />
                            </div>
                            <div className="field full">
                                <label>Tags (comma-separated)</label>
                                <input value={form.tags} onChange={update('tags')} placeholder="birthday, luxury" />
                            </div>

                            <div className="admin-modal-actions field full">
                                <button type="button" className="admin-btn ghost" onClick={close}>Cancel</button>
                                <button type="submit" className="admin-btn" disabled={saving}>
                                    {saving ? 'Saving…' : (editing.id ? 'Save changes' : 'Create product')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
