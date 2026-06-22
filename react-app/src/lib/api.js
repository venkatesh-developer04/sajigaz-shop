// Thin client for the Sajigaz backend (Express + SQLite + Razorpay).
// Base URL comes from VITE_API_URL (see .env files); defaults to local dev.
const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:8787').replace(/\/$/, '')

async function request(path, { method = 'GET', body, token } = {}) {
    const headers = {}
    if (body) headers['Content-Type'] = 'application/json'
    if (token) headers['Authorization'] = `Bearer ${token}`
    const res = await fetch(`${API_BASE}${path}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
    })
    let data = null
    try { data = await res.json() } catch { /* no body */ }
    if (!res.ok) {
        const err = new Error((data && data.error) || `Request failed (${res.status})`)
        err.status = res.status
        throw err
    }
    return data
}

// --- Catalog (public) ---
export async function getProducts() {
    const data = await request('/api/products')
    return data.products
}

// --- Storefront ---
export function createOrder(payload) {
    return request('/api/orders', { method: 'POST', body: payload })
}
export function verifyPayment(payload) {
    return request('/api/payments/verify', { method: 'POST', body: payload })
}

// --- Admin ---
export function adminLogin(password) {
    return request('/api/admin/login', { method: 'POST', body: { password } })
}
export function adminListOrders(token, status) {
    const q = status ? `?status=${encodeURIComponent(status)}` : ''
    return request(`/api/admin/orders${q}`, { token })
}
export function adminGetOrder(token, id) {
    return request(`/api/admin/orders/${id}`, { token })
}
export function adminUpdateOrder(token, id, status) {
    return request(`/api/admin/orders/${id}`, { method: 'PATCH', token, body: { status } })
}

// --- Admin: products ---
export function adminCreateProduct(token, data) {
    return request('/api/admin/products', { method: 'POST', token, body: data })
}
export function adminUpdateProduct(token, id, data) {
    return request(`/api/admin/products/${id}`, { method: 'PUT', token, body: data })
}
export function adminDeleteProduct(token, id) {
    return request(`/api/admin/products/${id}`, { method: 'DELETE', token })
}

export { API_BASE }
