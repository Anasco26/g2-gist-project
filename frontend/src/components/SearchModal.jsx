import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { api } from "../api";

export default function SearchModal({ onClose }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await api.get("/blogs");
        const blogs = data?.data?.blogs || [];
        const matches = blogs.filter(
          (b) =>
            b.title.toLowerCase().includes(query.toLowerCase()) ||
            (b.category?.name || "").toLowerCase().includes(query.toLowerCase())
        );
        setResults(matches.slice(0, 8));
      } catch {
        setResults([]);
      }
      setLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (slug) => {
    navigate(`/post/${slug}`);
    onClose();
  };

  return (
    <div className="search-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="search-modal">
        <input
          type="text"
          placeholder="Search posts..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
          onKeyDown={(e) => e.key === "Escape" && onClose()}
        />
        <div className="search-results">
          {loading && <div className="loading">Searching...</div>}
          {!loading && query.length >= 2 && results.length === 0 && (
            <div className="no-results">No posts found.</div>
          )}
          {!loading &&
            results.map((b) => (
              <div key={b.slug} className="search-result-item" onClick={() => handleSelect(b.slug)}>
                <div className="result-title">{b.title}</div>
                <div className="result-category">{b.category?.name || ""}</div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
