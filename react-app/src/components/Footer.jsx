import { WhatsappGlyph, InstagramGlyph, FacebookGlyph } from '../lib/icons'

// Site footer. The white circular logo wrapper that main.js injected at runtime
// is baked directly into the markup here (same inline styles), so it renders
// identically without any DOM manipulation.
export default function Footer() {
    return (
        <footer className="site-footer">
            <div className="container">
                <div className="footer-grid">
                    {/* Brand */}
                    <div className="footer-brand">
                        <div style={{ width: '92px', height: '92px', background: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '16px auto', padding: '0px 6px 5px 12px' }}>
                            <img src="/assets/img/new-logo.png" alt="Sajigaz Designs" style={{ height: '72px', margin: 0 }} />
                        </div>
                        <p>Thank you for Shopping Small !</p>
                        <div className="footer-socials">
                            <a href="https://wa.me/919944466434" target="_blank" rel="noreferrer" className="social-btn" title="WhatsApp">
                                <WhatsappGlyph width={18} height={18} />
                            </a>
                            <a href="https://www.instagram.com/sajigazdesigns/" target="_blank" rel="noreferrer" className="social-btn" title="Instagram">
                                <InstagramGlyph width={18} height={18} />
                            </a>
                            <a href="#" className="social-btn" title="Facebook">
                                <FacebookGlyph width={18} height={18} />
                            </a>
                        </div>
                    </div>
                </div>

                <div className="footer-bottom">
                    <p>&copy; 2026 <a href="#">Sajigaz Designs</a>. All rights reserved.</p>
                    <div className="footer-badges">
                        <span className="footer-badge">
                            <span className="material-symbols-outlined">lock</span> Secure
                        </span>
                        <span className="footer-badge">
                            <span className="material-symbols-outlined">grade</span> Trusted
                        </span>
                        <span className="footer-badge">
                            <span className="material-symbols-outlined">eco</span> Eco-friendly
                        </span>
                    </div>
                </div>
            </div>
        </footer>
    )
}
