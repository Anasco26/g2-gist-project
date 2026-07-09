export default function Pagination({ page, totalPages, onPage }) {
  if (totalPages <= 1) return null;

  const pages = [];
  const start = Math.max(1, page - 2);
  const end = Math.min(totalPages, page + 2);

  for (let i = start; i <= end; i++) pages.push(i);

  return (
    <div className="pagination">
      <button disabled={page <= 1} onClick={() => onPage(page - 1)}>← Prev</button>
      {start > 1 && <><button onClick={() => onPage(1)}>1</button><span className="pagination-dots">…</span></>}
      {pages.map((p) => (
        <button key={p} className={p === page ? "active" : ""} onClick={() => onPage(p)}>{p}</button>
      ))}
      {end < totalPages && <><span className="pagination-dots">…</span><button onClick={() => onPage(totalPages)}>{totalPages}</button></>}
      <button disabled={page >= totalPages} onClick={() => onPage(page + 1)}>Next →</button>
    </div>
  );
}
