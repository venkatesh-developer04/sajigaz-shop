import { useEffect, useState } from 'react'
import AnnouncementBar from '../components/AnnouncementBar'
import Header from '../components/Header'
import Footer from '../components/Footer'
import WhatsAppFab from '../components/WhatsAppFab'

export default function Contact() {
    const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' })

    useEffect(() => { document.title = 'Contact Us — Sajigaz Designs | Beyond Imagination' }, [])

    const update = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

    const onSubmit = (e) => {
        e.preventDefault()
        const name = form.name.trim()
        const email = form.email.trim()
        const phone = form.phone.trim()
        const message = form.message.trim()

        if (!name || !email || !phone || !message) {
            if (typeof window.Swal !== 'undefined') {
                window.Swal.fire({ title: 'Missing Fields', text: 'Please fill in all fields.', icon: 'warning', confirmButtonColor: '#e0a96d' })
            }
            return
        }

        const whatsappMessage = `Hello Sajigaz Designs! I would like to place a bulk order. Here are my details:\n\nName: ${name}\nEmail: ${email}\nPhone: ${phone}\nMessage: ${message}`
        const whatsappUrl = `https://wa.me/919944466434?text=${encodeURIComponent(whatsappMessage)}`
        window.open(whatsappUrl, '_blank')
    }

    return (
        <>
            <AnnouncementBar variant="compact" />
            <Header />

            {/* contact us form with matching existing style */}
            <section className="contact-section">
                <div className="container">
                    <div className="mx-auto w-fit">
                        <h2 className="section-title">Get in Touch</h2>
                        <p className="section-subtitle">Have questions or want to place a custom order? We're here to help!</p>
                        <form className="contact-form" id="contactForm" onSubmit={onSubmit}>
                            <div className="form-group">
                                <input type="text" id="name" name="name" placeholder="Your Name" required value={form.name} onChange={update} />
                            </div>
                            <div className="form-group">
                                <input type="email" id="email" name="email" placeholder="Your Email" required value={form.email} onChange={update} />
                            </div>
                            <div className="form-group">
                                <input type="tel" id="phone" name="phone" placeholder="Your Phone Number" required value={form.phone} onChange={update} />
                            </div>
                            <div className="form-group">
                                <textarea id="message" name="message" rows="5" placeholder="Your Message Here..." required value={form.message} onChange={update}></textarea>
                            </div>
                            <button type="submit" className="btn-add-cart">Send Message</button>
                        </form>
                    </div>
                </div>
            </section>

            <Footer />
            <WhatsAppFab />
        </>
    )
}
