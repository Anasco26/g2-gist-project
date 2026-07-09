import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import AdminNav from "../components/AdminNav";
import Pagination from "../components/Pagination";

const PER_PAGE = 10;

export default function AdminMessages() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [readFilter, setReadFilter] = useState("all");
  const [searchInput, setSearchInput] = useState("");

  useEffect(() => {
    if (!user || user.role !== "ADMIN") {
      navigate("/");
      return;
    }
    fetchMessages(1);
  }, []);

  const fetchMessages = useCallback((p, s = search, rf = readFilter) => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(p), limit: String(PER_PAGE) });
    if (s) params.set("search", s);
    if (rf !== "all") params.set("read", rf);

    api.get(`/contact?${params}`)
      .then((data) => {
        setMessages(data?.data?.messages || []);
        setPagination(data?.pagination || null);
        setPage(p);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [search, readFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput);
    fetchMessages(1, searchInput, readFilter);
  };

  const handleFilter = (f) => {
    setReadFilter(f);
    fetchMessages(1, search, f);
  };

  const handleMarkRead = async (id) => {
    try {
      await api.patch(`/contact/${id}/read`);
      setMessages((prev) =>
        prev.map((m) => (m.id === id ? { ...m, isRead: true } : m)),
      );
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this message?")) return;
    try {
      await api.delete(`/contact/${id}`);
      showToast("Message deleted.", "success");
      fetchMessages(page);
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  if (loading && !messages.length) return <main className="container"><div className="loading">Loading...</div></main>;

  return (
    <main className="container">
      <section className="page-title">
        <h1>Messages</h1>
        {pagination && <p>{pagination.total} total</p>}
      </section>

      <AdminNav />

      <section className="admin-filters">
        <form className="admin-search" onSubmit={handleSearch}>
          <span className="admin-search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search by name, email, or message..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          {searchInput && (
            <button type="button" className="admin-search-clear" onClick={() => { setSearchInput(""); setSearch(""); fetchMessages(1, "", readFilter); }}>✕</button>
          )}
        </form>
        <div className="admin-status-filter">
          <button className={readFilter === "all" ? "active" : ""} onClick={() => handleFilter("all")}>
            All{pagination ? ` (${pagination.total})` : ""}
          </button>
          <button className={readFilter === "unread" ? "active" : ""} onClick={() => handleFilter("unread")}>
            Unread
          </button>
          <button className={readFilter === "read" ? "active" : ""} onClick={() => handleFilter("read")}>
            Read
          </button>
        </div>
      </section>

      {messages.length === 0 ? (
        <p style={{ color: "var(--muted)", padding: "32px 0", textAlign: "center" }}>
          {search ? "No messages match your search." : "No messages yet."}
        </p>
      ) : (
        <>
          <div className="message-list">
            {messages.map((m) => (
              <div key={m.id} className={`message-card ${!m.isRead ? "unread" : ""}`}>
                <div className="message-head">
                  <div className="message-sender">
                    <span className="message-name">{m.name}</span>
                    <span className="message-email">{m.email}</span>
                    {!m.isRead && <span className="unread-dot">New</span>}
                  </div>
                  <div className="message-date">
                    {new Date(m.createdAt).toLocaleDateString("en-US", {
                      year: "numeric", month: "short", day: "numeric",
                      hour: "2-digit", minute: "2-digit",
                    })}
                  </div>
                </div>
                <div className="message-body">{m.message}</div>
                <div className="message-actions">
                  {!m.isRead && (
                    <button className="admin-btn admin-btn-publish" onClick={() => handleMarkRead(m.id)}>
                      Mark Read
                    </button>
                  )}
                  <button className="admin-btn admin-btn-delete" onClick={() => handleDelete(m.id)}>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
          {pagination && pagination.totalPages > 1 && (
            <Pagination page={page} totalPages={pagination.totalPages} onPage={(p) => fetchMessages(p)} />
          )}
        </>
      )}
    </main>
  );
}
