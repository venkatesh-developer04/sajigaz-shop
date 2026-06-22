// Renders 5 Material Symbols star glyphs (filled up to rounded rating),
// identical to the original renderStars() helper.
export default function Stars({ rating, size = '0.9rem' }) {
    const full = Math.round(rating)
    return (
        <>
            {Array(5).fill(0).map((_, i) => (
                <span
                    key={i}
                    className={`material-symbols-outlined${i < full ? ' ms-fill' : ''}`}
                    style={{ fontSize: size, color: 'var(--gold)' }}
                >
                    grade
                </span>
            ))}
        </>
    )
}
