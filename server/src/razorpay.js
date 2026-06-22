import Razorpay from 'razorpay'

// Lazy singleton so the server still boots (for health checks / admin) even if
// Razorpay keys aren't configured yet — payment endpoints will 503 instead.
let instance = null

export function getRazorpay() {
    if (instance) return instance
    const key_id = process.env.RAZORPAY_KEY_ID
    const key_secret = process.env.RAZORPAY_KEY_SECRET
    if (!key_id || !key_secret) {
        const err = new Error('Razorpay keys are not configured (RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET)')
        err.statusCode = 503
        throw err
    }
    instance = new Razorpay({ key_id, key_secret })
    return instance
}

export function isConfigured() {
    return !!(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET)
}
