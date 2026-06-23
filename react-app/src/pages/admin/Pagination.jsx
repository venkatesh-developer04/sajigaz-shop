// Reusable client-side pagination control for the admin tables.
export default function Pagination({ total, page, pageSize, onPage, onPageSize, pageSizeOptions = [10, 25, 50] }) {
    const totalPages = Math.max(1, Math.ceil(total / pageSize))
    const start = total === 0 ? 0 : (page - 1) * pageSize + 1
    const end = Math.min(total, page * pageSize)

    // Build a compact page-number window (with ellipses for many pages).
    let pages = []
    if (totalPages <= 7) {
        pages = Array.from({ length: totalPages }, (_, i) => i + 1)
    } else {
        const set = new Set([1, 2, totalPages - 1, totalPages, page - 1, page, page + 1])
        const sorted = [...set].filter((n) => n >= 1 && n <= totalPages).sort((a, b) => a - b)
        let prev = 0
        for (const n of sorted) {
            if (n - prev > 1) pages.push('…')
            pages.push(n)
            prev = n
        }
    }

    return (
        <div className="admin-pagination">
            <div className="info">
                {total === 0 ? 'No results' : `Showing ${start}–${end} of ${total}`}
                {onPageSize && (
                    <>
                        {'  ·  '}
                        <select value={pageSize} onChange={(e) => onPageSize(Number(e.target.value))} style={{ padding: '3px 6px', borderRadius: '6px', border: '1.5px solid var(--border, #e3e3e8)' }}>
                            {pageSizeOptions.map((n) => <option key={n} value={n}>{n} / page</option>)}
                        </select>
                    </>
                )}
            </div>
            <div className="pages">
                <button onClick={() => onPage(page - 1)} disabled={page <= 1}>‹ Prev</button>
                {pages.map((p, i) =>
                    p === '…'
                        ? <button key={`e${i}`} disabled>…</button>
                        : <button key={p} className={p === page ? 'active' : ''} onClick={() => onPage(p)}>{p}</button>
                )}
                <button onClick={() => onPage(page + 1)} disabled={page >= totalPages}>Next ›</button>
            </div>
        </div>
    )
}
