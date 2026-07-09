import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export default function AdminDashboard() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    if (!user || user.role !== "ADMIN") {
      navigate("/");
      return;
    }
    fetchAll();
  }, []);

  const fetchAll = () => {
    setLoading(true);
    api.get("/blogs/admin")
      .then((data) => {
        setBlogs(data?.data?.blogs || []);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  };

  const handlePublish = async (slug, currentlyPublished) => {
    try {
      await api.patch(`/blogs/${slug}`, { published: !currentlyPublished });
      showToast(currentlyPublished ? "Post unpublished." : "Post published!", "success");
      fetchAll();
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  const handleDelete = async (slug, title) => {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/blogs/${slug}`);
      showToast("Post deleted.", "success");
      fetchAll();
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  const q = search.toLowerCase();
  const filtered = blogs.filter((b) => {
    const matchSearch =
      !q ||
      b.title.toLowerCase().includes(q) ||
      b.category?.name?.toLowerCase().includes(q) ||
      b.author?.name?.toLowerCase().includes(q) ||
      b.author?.username?.toLowerCase().includes(q);
    const matchStatus =
      statusFilter === "all" ||
      (statusFilter === "published" && b.published) ||
      (statusFilter === "draft" && !b.published);
    return matchSearch && matchStatus;
  });

  if (loading) return <main className="container"><div className="loading">Loading...</div></main>;
  if (error) return (
    <main className="container">
      <div className="error-state"><p>{error}</p></div>
    </main>
  );

  return (
    <main className="container">
      <section className="page-title" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1>Admin Panel</h1>
          <p>{blogs.length} total posts</p>
        </div>
        <Link to="/post/new" className="auth-btn" style={{ padding: "10px 20px", fontSize: 14, textDecoration: "none" }}>
          + New Post
        </Link>
      </section>

      <section className="admin-filters">
        <div className="admin-search">
          <span className="admin-search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search by title, category, author..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button className="admin-search-clear" onClick={() => setSearch("")}>✕</button>
          )}
        </div>
        <div className="admin-status-filter">
          <button
            className={statusFilter === "all" ? "active" : ""}
            onClick={() => setStatusFilter("all")}
          >
            All ({blogs.length})
          </button>
          <button
            className={statusFilter === "published" ? "active" : ""}
            onClick={() => setStatusFilter("published")}
          >
            Published ({blogs.filter((b) => b.published).length})
          </button>
          <button
            className={statusFilter === "draft" ? "active" : ""}
            onClick={() => setStatusFilter("draft")}
          >
            Drafts ({blogs.filter((b) => !b.published).length})
          </button>
        </div>
      </section>

      {filtered.length === 0 ? (
        <p style={{ color: "var(--muted)", padding: "32px 0", textAlign: "center" }}>
          {search ? "No posts match your search." : "No posts yet."}
        </p>
      ) : (
        <div className="admin-table">
          <div className="admin-table-header">
            <span className="col-title">Title</span>
            <span className="col-author">Author</span>
            <span className="col-cat">Category</span>
            <span className="col-status">Status</span>
            <span className="col-date">Date</span>
            <span className="col-actions">Actions</span>
          </div>
          {filtered.map((b) => (
            <div key={b.id} className="admin-table-row">
              <span className="col-title">
                <Link to={`/post/${b.slug}`} style={{ fontWeight: 600 }}>{b.title}</Link>
              </span>
              <span className="col-author">{b.author?.name || b.author?.username || "—"}</span>
              <span className="col-cat">{b.category?.name || "—"}</span>
              <span className="col-status">
                <span className={`admin-status-badge ${b.published ? "published" : "draft"}`}>
                  {b.published ? "Published" : "Draft"}
                </span>
              </span>
              <span className="col-date">
                {b.publishedAt
                  ? new Date(b.publishedAt).toLocaleDateString()
                  : new Date(b.createdAt).toLocaleDateString()}
              </span>
              <span className="col-actions">
                {b.published ? (
                  <button className="admin-btn admin-btn-unpublish" onClick={() => handlePublish(b.slug, true)}>
                    Unpublish
                  </button>
                ) : (
                  <button className="admin-btn admin-btn-publish" onClick={() => handlePublish(b.slug, false)}>
                    Publish
                  </button>
                )}
                <Link to={`/post/${b.slug}/edit`} className="admin-btn admin-btn-edit">
                  Edit
                </Link>
                <button className="admin-btn admin-btn-delete" onClick={() => handleDelete(b.slug, b.title)}>
                  {b.published ? "Delete" : "Drop"}
                </button>
              </span>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
