import { useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'

import Home from './pages/Home.jsx'
import Category from './pages/Category.jsx'
import PhotoMagnet from './pages/PhotoMagnet.jsx'
import Product from './pages/Product.jsx'
import CartPage from './pages/CartPage.jsx'
import Checkout from './pages/Checkout.jsx'
import Favorites from './pages/Favorites.jsx'
import Contact from './pages/Contact.jsx'
import BulkOrder from './pages/BulkOrder.jsx'
import AdminLogin from './pages/admin/AdminLogin.jsx'
import AdminOrders from './pages/admin/AdminOrders.jsx'
import AdminProducts from './pages/admin/AdminProducts.jsx'

// Reset scroll position on every navigation (the original was a multi-page
// site, so each click started at the top of a fresh document).
function ScrollToTop() {
    const { pathname, search } = useLocation()
    useEffect(() => { window.scrollTo(0, 0) }, [pathname, search])
    return null
}

// App-upgrade flow, ported from main.js checkAppVersion().
function useAppVersionCheck() {
    useEffect(() => {
        const CURRENT_VERSION = '2.0'
        const savedVer = localStorage.getItem('sajigaz_app_version')
        if (savedVer && savedVer !== CURRENT_VERSION) {
            setTimeout(() => {
                if (typeof window.Swal !== 'undefined') {
                    window.Swal.fire({
                        title: 'New Version Available!',
                        text: 'A new version of Sajigaz Designs is available! Upgrade now to get the latest features and designs.',
                        icon: 'info',
                        showCancelButton: true,
                        confirmButtonColor: '#e0a96d',
                        cancelButtonColor: '#7a7a7a',
                        confirmButtonText: 'Upgrade Now',
                        cancelButtonText: 'Later'
                    }).then((result) => {
                        if (result.isConfirmed) {
                            localStorage.setItem('sajigaz_app_version', CURRENT_VERSION)
                            location.reload(true)
                        }
                    })
                } else {
                    const shouldUpgrade = confirm('A new version of Sajigaz Designs is available! Upgrade now to get the latest features and designs.')
                    if (shouldUpgrade) {
                        localStorage.setItem('sajigaz_app_version', CURRENT_VERSION)
                        location.reload(true)
                    }
                }
            }, 500)
        } else if (!savedVer) {
            localStorage.setItem('sajigaz_app_version', CURRENT_VERSION)
        }
    }, [])
}

export default function App() {
    useAppVersionCheck()
    return (
        <>
            <ScrollToTop />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/category" element={<Category />} />
                <Route path="/photo-magnet" element={<PhotoMagnet />} />
                <Route path="/product" element={<Product />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/favorites" element={<Favorites />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/bulk-order" element={<BulkOrder />} />
                <Route path="/admin" element={<AdminLogin />} />
                <Route path="/admin/orders" element={<AdminOrders />} />
                <Route path="/admin/products" element={<AdminProducts />} />
            </Routes>
        </>
    )
}
