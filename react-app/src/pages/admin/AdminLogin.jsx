import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { adminLogin } from '../../lib/api'
import './admin.css'

export const ADMIN_TOKEN_KEY = 'sajigaz_admin_token'

export default function AdminLogin() {
    const navigate = useNavigate()
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [busy, setBusy] = useState(false)

    useEffect(() => {
        document.title = 'Admin — Sajigaz Designs'
        if (localStorage.getItem(ADMIN_TOKEN_KEY)) navigate('/admin/orders', { replace: true })
    }, [navigate])

    const onSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setBusy(true)
        try {
            const { token } = await adminLogin(password)
            localStorage.setItem(ADMIN_TOKEN_KEY, token)
            navigate('/admin/orders', { replace: true })
        } catch (err) {
            setError(err.message || 'Login failed')
        } finally {
            setBusy(false)
        }
    }

    return (
        <div className="admin-login-screen">
            <form className="admin-login-card" onSubmit={onSubmit}>
                <span className="material-symbols-outlined" style={{ fontSize: '2.5rem', color: 'var(--purple)' }}>lock</span>
                <h1>Admin Panel</h1>
                <p>Sajigaz Designs — order &amp; payment management</p>
                {error && <div className="admin-error">{error}</div>}
                <input
                    type="password"
                    className="admin-input"
                    placeholder="Admin password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoFocus
                />
                <button type="submit" className="admin-btn" style={{ width: '100%', justifyContent: 'center' }} disabled={busy}>
                    {busy ? 'Signing in…' : 'Sign In'}
                </button>
            </form>
        </div>
    )
}
