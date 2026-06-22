// Top announcement bar. The original pages used 4 slightly different texts;
// `variant` selects the exact one for each page.
const ms = { fontSize: '1rem', verticalAlign: 'middle' }

export default function AnnouncementBar({ variant = 'compact' }) {
    if (variant === 'home') {
        return (
            <div className="announcement-bar">
                <span className="material-symbols-outlined" style={ms}>redeem</span>
                &nbsp;Free Gift Wrapping on orders above ₹999!&nbsp;|&nbsp;
                <span className="material-symbols-outlined" style={ms}>local_shipping</span>
                Fast Delivery Available&nbsp;|&nbsp;
                <span className="material-symbols-outlined" style={ms}>auto_awesome</span>
                <strong>Call: 99444 66434</strong>
            </div>
        )
    }
    if (variant === 'shop') {
        return (
            <div className="announcement-bar">
                <span className="material-symbols-outlined" style={ms}>redeem</span>
                &nbsp;Free Gift Wrapping on orders above ₹999!&nbsp;|&nbsp;
                <span className="material-symbols-outlined" style={ms}>local_shipping</span>
                Fast Delivery&nbsp;|&nbsp;
                <span className="material-symbols-outlined" style={ms}>auto_awesome</span>
                <strong>WhatsApp: 99444 66434</strong>
            </div>
        )
    }
    if (variant === 'checkout') {
        return (
            <div className="announcement-bar">
                <span className="material-symbols-outlined" style={ms}>redeem</span>
                &nbsp;Free Gift Wrapping on ₹999+&nbsp;|&nbsp;Orders confirmed via WhatsApp
                <span className="material-symbols-outlined" style={ms}>check_circle</span>
            </div>
        )
    }
    // 'compact' — product / cart / favorites / contact / bulk-order
    return (
        <div className="announcement-bar">
            <span className="material-symbols-outlined" style={ms}>redeem</span>
            &nbsp;Free Gift Wrapping on ₹999+&nbsp;|&nbsp;
            <span className="material-symbols-outlined" style={ms}>local_shipping</span>
            Fast Delivery&nbsp;|&nbsp;
            <strong>WhatsApp: 99444 66434</strong>
        </div>
    )
}
