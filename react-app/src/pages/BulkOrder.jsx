import { useEffect } from 'react'
import AnnouncementBar from '../components/AnnouncementBar'
import Header from '../components/Header'
import Footer from '../components/Footer'
import WhatsAppFab from '../components/WhatsAppFab'

export default function BulkOrder() {
    useEffect(() => { document.title = 'Bulk Order — Sajigaz Designs | Beyond Imagination' }, [])

    // Send bulk enquiry details to WhatsApp (ported verbatim from bulk-order.html).
    const onSubmit = (e) => {
        e.preventDefault()
        const form = e.currentTarget
        const fld = (name) => (form.elements[name] ? form.elements[name].value.trim() : '')
        const name = fld('name') || '—'
        const email = fld('email') || '—'
        const phone = fld('phone') || '—'
        const comment = fld('comment') || '—'

        let message = `Hi Little Reminder! I have a bulk order enquiry.%0A%0A`
        message += `Name: ${name}%0A`
        message += `Email: ${email}%0A`
        message += `Phone: ${phone}%0A%0A`
        message += `Comment: ${comment}`

        const waNumber = '919944466434'
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
        const url = isMobile
            ? `https://wa.me/${waNumber}?text=${encodeURIComponent(decodeURIComponent(message))}`
            : `https://web.whatsapp.com/send?phone=${waNumber}&text=${encodeURIComponent(decodeURIComponent(message))}`

        window.open(url, '_blank')
    }

    return (
        <>
            <AnnouncementBar variant="compact" />
            <Header />

            {/* Bulk Order hero + enquiry form */}
            <section className="bulk-hero">
                <div className="container">
                    <div className="bulk-hero-inner">
                        <h1 className="bulk-hero-title">BULK ORDER</h1>
                        <p className="bulk-hero-lead">Turn Moments into Memories with Little Reminder</p>

                        <div className="bulk-hero-copy">
                            <p>Want to gift something that won't end up in a drawer?</p>
                            <p>At <strong>Little Reminder</strong>, we turn your stories into keepsakes—thoughtfully designed photo
                                magnets, memory prints, and personalized gifts made to be seen, felt, and remembered.</p>
                            <p>Whether it's a thank-you to your team, a celebration for your clients, or a token of appreciation for
                                partners, we help you gift emotions—not just items.</p>
                        </div>

                        <div className="bulk-hero-cta">
                            <button className="btn btn-outline bulk-hero-btn">Fill out the enquiry below &amp; We'll Contact You</button>
                        </div>
                    </div>
                </div>
            </section>

            <section className="enquiry-section">
                <div className="container">
                    <h2 className="enquiry-heading">Bulk Order Enquiry</h2>

                    <form className="bulk-form" id="bulkEnquiryForm" onSubmit={onSubmit}>
                        <div className="form-row">
                            <input type="text" name="name" className="form-input" placeholder="Name" required />
                            <input type="email" name="email" className="form-input" placeholder="Email *" required />
                        </div>

                        <div className="form-row single">
                            <input type="tel" name="phone" className="form-input" placeholder="Phone number" />
                        </div>

                        <div className="form-row single">
                            <textarea name="comment" className="form-textarea" placeholder="Comment"></textarea>
                        </div>

                        <div className="form-row single">
                            <button type="submit" className="btn btn-magenta btn-send">Send</button>
                        </div>
                    </form>
                </div>
            </section>

            <Footer />
            <WhatsAppFab />
        </>
    )
}
