import jwt from 'jsonwebtoken'

const JWT_SECRET = () => process.env.JWT_SECRET || 'dev-insecure-secret-change-me'

export function signAdminToken() {
    return jwt.sign({ role: 'admin' }, JWT_SECRET(), { expiresIn: '8h' })
}

// Express middleware — requires a valid admin bearer token.
export function requireAdmin(req, res, next) {
    const header = req.headers.authorization || ''
    const token = header.startsWith('Bearer ') ? header.slice(7) : null
    if (!token) return res.status(401).json({ error: 'Missing admin token' })
    try {
        const payload = jwt.verify(token, JWT_SECRET())
        if (payload.role !== 'admin') throw new Error('not admin')
        req.admin = payload
        next()
    } catch {
        return res.status(401).json({ error: 'Invalid or expired token' })
    }
}
