import { useEffect, useState, useCallback } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { adminListOrders, adminUpdateOrder } from '../../lib/api'
import { formatPrice } from '../../lib/format'
import { ADMIN_TOKEN_KEY } from './AdminLogin'
import './admin.css'

const STATUSES = ['', 'created', 'paid', 'failed', 'fulfilled']

export default function AdminOrders() {
    const navigate = useNavigate()
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [statusFilter, setStatusFilter] = useState('')
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
                    <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                        <option value="">All statuses</option>
                        <option value="created">Created (unpaid)</option>
                        <option value="paid">Paid</option>
                        <option value="failed">Failed</option>
                        <option value="fulfilled">Fulfilled</option>
                    </select>
                    <button className="admin-btn ghost sm" onClick={load}>
                        <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>refresh</span> Refresh
                    </button>
                    <button className="admin-btn ghost sm" onClick={logout}>Logout</button>
                </div>
            </div>

            {error && <div className="admin-error" style={{ maxWidth: '1200px', margin: '0 auto 12px' }}>{error}</div>}

            <div className="admin-table-wrap">
                {loading ? (
                    <div className="admin-loading">Loading orders…</div>
                ) : orders.length === 0 ? (
                    <div className="admin-empty">No orders yet.</div>
                ) : (
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Date</th>
                                <th>Customer</th>
                                <th>Items</th>
                                <th>Total</th>
                                <th>Payment</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map((o) => (
                                <tr key={o.id}>
                                    <td>{o.id}</td>
                                    <td className="muted">{o.created_at}</td>
                                    <td>
                                        {o.customer_name || '—'}
                                        <div className="muted">{o.customer_phone || ''}</div>
                                    </td>
                                    <td>{o.items.reduce((n, i) => n + i.qty, 0)} item(s)</td>
                                    <td>{formatPrice(o.total)}</td>
                                    <td><span className={`status-badge status-${o.status}`}>{o.status}</span></td>
                                    <td>
                                        <button className="admin-btn ghost sm" onClick={() => setSelected(o)}>View</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {selected && (
                <div className="admin-modal-overlay" onClick={() => setSelected(null)}>
                    <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
                        <h2>Order #{selected.id} <span className={`status-badge status-${selected.status}`}>{selected.status}</span></h2>
                        <div className="row"><span className="k">Receipt</span><span className="v">{selected.receipt}</span></div>
                        <div className="row"><span className="k">Date</span><span className="v">{selected.created_at}</span></div>
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
