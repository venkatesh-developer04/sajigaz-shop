import { useEffect, useMemo, useState, useCallback } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { adminListOrders, adminUpdateOrder } from '../../lib/api'
import { formatPrice } from '../../lib/format'
import { ADMIN_TOKEN_KEY } from './AdminLogin'
import Pagination from './Pagination'
import './admin.css'

export default function AdminOrders() {
    const navigate = useNavigate()
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [statusFilter, setStatusFilter] = useState('')
    const [search, setSearch] = useState('')
    const [sort, setSort] = useState('newest')
    const [view, setView] = useState('table')
    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const [selected, setSelected] = useState(null)
    const [updatingId, setUpdatingId] = useState(null)

    const token = typeof localStorage !== 'undefined' ? localStorage.getItem(ADMIN_TOKEN_KEY) : null

    const logout = useCallback(() => {
        localStorage.removeItem(ADMIN_TOKEN_KEY)
        navigate('/admin', { replace: true })
    }, [navigate])

    const load = useCallback(async () => {
        if (!token) { navigate('/admin', { replace: true }); return }
        setLoading(true)
        setError('')
        try {
            const { orders } = await adminListOrders(token, statusFilter || undefined)
            setOrders(orders)
        } catch (err) {
            if (err.status === 401) { logout(); return }
            setError(err.message || 'Failed to load orders')
        } finally {
            setLoading(false)
        }
    }, [token, statusFilter, navigate, logout])

    useEffect(() => { document.title = 'Orders — Admin — Sajigaz Designs' }, [])
    useEffect(() => { load() }, [load])
    // Reset to first page whenever the result set changes shape.
    useEffect(() => { setPage(1) }, [search, sort, statusFilter, pageSize])

    const setStatus = async (order, status) => {
        setUpdatingId(order.id)
        try {
            const { order: updated } = await adminUpdateOrder(token, order.id, status)
            setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)))
            setSelected((s) => (s && s.id === updated.id ? updated : s))
        } catch (err) {
            if (err.status === 401) { logout(); return }
            setError(err.message || 'Update failed')
        } finally {
            setUpdatingId(null)
        }
    }

    // Search + sort happen client-side over the loaded set (status is server-side).
    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase()
        let list = orders
        if (q) {
            list = orders.filter((o) =>
                String(o.id).includes(q) ||
                (o.receipt || '').toLowerCase().includes(q) ||
                (o.customer_name || '').toLowerCase().includes(q) ||
                (o.customer_phone || '').toLowerCase().includes(q)
            )
        }
        const sorted = [...list]
        if (sort === 'newest') sorted.sort((a, b) => b.id - a.id)
        if (sort === 'oldest') sorted.sort((a, b) => a.id - b.id)
        if (sort === 'total-desc') sorted.sort((a, b) => b.total - a.total)
        if (sort === 'total-asc') sorted.sort((a, b) => a.total - b.total)
        return sorted
    }, [orders, search, sort])

    const total = filtered.length
    const paged = useMemo(() => filtered.slice((page - 1) * pageSize, page * pageSize), [filtered, page, pageSize])
    const itemCount = (o) => o.items.reduce((n, i) => n + i.qty, 0)

    return (
        <div className="admin-wrap">
            <div className="admin-header">
                <h1>
                    <span className="material-symbols-outlined" style={{ color: 'var(--purple)' }}>receipt_long</span>
                    Orders
                </h1>
                <div className="admin-toolbar">
                    <nav className="admin-nav">
                        <Link to="/admin/orders" className="active">Orders</Link>
                        <Link to="/admin/products">Products</Link>
                    </nav>
                    <button className="admin-btn ghost sm" onClick={load}>
                        <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>refresh</span> Refresh
                    </button>
                    <button className="admin-btn ghost sm" onClick={logout}>Logout</button>
                </div>
            </div>

            {/* Controls: search, status filter, sort, view toggle */}
            <div className="admin-controls">
                <div className="admin-search">
                    <span className="material-symbols-outlined">search</span>
                    <input
                        type="text"
                        placeholder="Search id, receipt, name, phone…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                    <option value="">All statuses</option>
                    <option value="lead">Lead (unpaid)</option>
                    <option value="paid">Paid</option>
                    <option value="failed">Failed</option>
                    <option value="fulfilled">Fulfilled</option>
                </select>
                <select value={sort} onChange={(e) => setSort(e.target.value)}>
                    <option value="newest">Newest first</option>
                    <option value="oldest">Oldest first</option>
                    <option value="total-desc">Total: high → low</option>
                    <option value="total-asc">Total: low → high</option>
                </select>
                <span className="admin-spacer" />
                <span className="admin-count">{total} order{total !== 1 ? 's' : ''}</span>
                <div className="view-toggle">
                    <button className={view === 'table' ? 'active' : ''} title="Table view" onClick={() => setView('table')}>
                        <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>table_rows</span>
                    </button>
                    <button className={view === 'cards' ? 'active' : ''} title="Card view" onClick={() => setView('cards')}>
                        <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>grid_view</span>
                    </button>
                </div>
            </div>

            {error && <div className="admin-error" style={{ maxWidth: '1200px', margin: '0 auto 12px' }}>{error}</div>}

            {loading ? (
                <div className="admin-table-wrap"><div className="admin-loading">Loading orders…</div></div>
            ) : total === 0 ? (
                <div className="admin-table-wrap"><div className="admin-empty">No orders match.</div></div>
            ) : view === 'table' ? (
                <div className="admin-table-wrap">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>#</th><th>Date</th><th>Customer</th><th>Items</th><th>Total</th><th>Payment</th><th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {paged.map((o) => (
                                <tr key={o.id}>
                                    <td>{o.id}</td>
                                    <td className="muted">{o.lead_at}</td>
                                    <td>{o.customer_name || '—'}<div className="muted">{o.customer_phone || ''}</div></td>
                                    <td>{itemCount(o)} item(s)</td>
                                    <td>{formatPrice(o.total)}</td>
                                    <td><span className={`status-badge status-${o.status}`}>{o.status}</span></td>
                                    <td><button className="admin-btn ghost sm" onClick={() => setSelected(o)}>View</button></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="admin-cards">
                    {paged.map((o) => (
                        <div className="order-card" key={o.id}>
                            <div className="oc-top">
                                <span className="oc-id">#{o.id}</span>
                                <span className={`status-badge status-${o.status}`}>{o.status}</span>
                            </div>
                            <div className="oc-row"><span className="k">Date</span><span>{o.lead_at}</span></div>
                            <div className="oc-row"><span className="k">Customer</span><span>{o.customer_name || '—'}</span></div>
                            <div className="oc-row"><span className="k">Phone</span><span>{o.customer_phone || '—'}</span></div>
                            <div className="oc-row"><span className="k">Items</span><span>{itemCount(o)}</span></div>
                            <div className="oc-row"><span className="k">Total</span><span style={{ fontWeight: 700 }}>{formatPrice(o.total)}</span></div>
                            <div className="oc-actions"><button className="admin-btn ghost sm" onClick={() => setSelected(o)}>View details</button></div>
                        </div>
                    ))}
                </div>
            )}

            {!loading && total > 0 && (
                <Pagination total={total} page={page} pageSize={pageSize} onPage={setPage} onPageSize={setPageSize} />
            )}

            {selected && (
                <div className="admin-modal-overlay" onClick={() => setSelected(null)}>
                    <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
                        <h2>Order #{selected.id} <span className={`status-badge status-${selected.status}`}>{selected.status}</span></h2>
                        <div className="row"><span className="k">Receipt</span><span className="v">{selected.receipt}</span></div>
                        <div className="row"><span className="k">Date</span><span className="v">{selected.lead_at}</span></div>
                        <div className="row"><span className="k">Customer</span><span className="v">{selected.customer_name || '—'}</span></div>
                        <div className="row"><span className="k">Phone</span><span className="v">{selected.customer_phone || '—'}</span></div>
                        <div className="row"><span className="k">Address</span><span className="v">{selected.customer_address || '—'}</span></div>
                        <div className="row"><span className="k">Pincode</span><span className="v">{selected.customer_pincode || '—'}</span></div>
                        {selected.occasion && <div className="row"><span className="k">Occasion</span><span className="v">{selected.occasion}</span></div>}
                        {selected.delivery_date && <div className="row"><span className="k">Delivery date</span><span className="v">{selected.delivery_date}</span></div>}
                        <div className="row"><span className="k">Razorpay order</span><span className="v">{selected.razorpay_order_id || '—'}</span></div>
                        <div className="row"><span className="k">Razorpay payment</span><span className="v">{selected.razorpay_payment_id || '—'}</span></div>

                        <div className="items">
                            <strong>Items</strong>
                            {selected.items.map((it, idx) => (
                                <div className="item" key={idx}>
                                    <span>
                                        {it.name} × {it.qty}
                                        {it.customImageB64 && (
                                            <div className="muted">
                                                {it.customImageB64.split(',').map((u, i) => (
                                                    <div key={i}><a href={u} target="_blank" rel="noreferrer">{u}</a></div>
                                                ))}
                                            </div>
                                        )}
                                    </span>
                                    <span>{formatPrice(it.price * it.qty)}</span>
                                </div>
                            ))}
                        </div>

                        <div className="row"><span className="k">Subtotal</span><span className="v">{formatPrice(selected.subtotal)}</span></div>
                        <div className="row"><span className="k">Delivery</span><span className="v">{selected.delivery === 0 ? 'FREE' : formatPrice(selected.delivery)}</span></div>
                        <div className="row"><span className="k">Total</span><span className="v">{formatPrice(selected.total)}</span></div>

                        <div className="admin-modal-actions">
                            {selected.status === 'paid' && (
                                <button className="admin-btn" disabled={updatingId === selected.id} onClick={() => setStatus(selected, 'fulfilled')}>
                                    Mark Fulfilled
                                </button>
                            )}
                            {selected.status === 'fulfilled' && (
                                <button className="admin-btn ghost" disabled={updatingId === selected.id} onClick={() => setStatus(selected, 'paid')}>
                                    Revert to Paid
                                </button>
                            )}
                            <button className="admin-btn ghost" onClick={() => setSelected(null)}>Close</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
