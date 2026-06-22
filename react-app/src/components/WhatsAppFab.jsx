import { WhatsappGlyph } from '../lib/icons'

// Floating WhatsApp action button. `href` and `title` default to the plain
// number used on most pages; the Home page passes the prefilled-text variant.
export default function WhatsAppFab({
    href = 'https://wa.me/919944466434',
    title,
}) {
    return (
        <a href={href} target="_blank" rel="noreferrer" className="chat-fab" title={title} aria-label="WhatsApp">
            <WhatsappGlyph width={28} height={28} fill="white" />
        </a>
    )
}
