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

  if (loading) return <main className="container"><div className="loading">Loading...</div></main>;
  if (error) return (
    <main className="container">
      <div className="error-state"><p>{error}</p></div>
    </main>
  );

  const published = blogs.filter((b) => b.published);
  const drafts = blogs.filter((b) => !b.published);

  return (
    <main className="container">
      <section className="page-title" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1>Admin Panel</h1>
          <p>Review, publish, and manage all posts.</p>
        </div>
        <Link to="/post/new" className="auth-btn" style={{ padding: "10px 20px", fontSize: 14, textDecoration: "none" }}>
          + New Post
        </Link>
      </section>

      {drafts.length > 0 && (
        <section style={{ marginBottom: 36 }}>
          <h2 style={{ fontSize: 20, marginBottom: 16, fontWeight: 800 }}>
            ⏳ Pending Review ({drafts.length})
          </h2>
          <div className="admin-table">
            <div className="admin-table-header">
              <span className="col-title">Title</span>
              <span className="col-author">Author</span>
              <span className="col-cat">Category</span>
              <span className="col-date">Created</span>
              <span className="col-actions">Actions</span>
            </div>
            {drafts.map((b) => (
              <div key={b.id} className="admin-table-row">
                <span className="col-title">
                  <Link to={`/post/${b.slug}`} style={{ fontWeight: 600 }}>{b.title}</Link>
                </span>
                <span className="col-author">{b.author?.name || b.author?.username || "—"}</span>
                <span className="col-cat">{b.category?.name || "—"}</span>
                <span className="col-date">{new Date(b.createdAt).toLocaleDateString()}</span>
                <span className="col-actions">
                  <button className="admin-btn admin-btn-publish" onClick={() => handlePublish(b.slug, false)}>
                    Publish
                  </button>
                  <Link to={`/post/${b.slug}/edit`} className="admin-btn admin-btn-edit">
                    Edit
                  </Link>
                  <button className="admin-btn admin-btn-delete" onClick={() => handleDelete(b.slug, b.title)}>
                    Drop
                  </button>
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 style={{ fontSize: 20, marginBottom: 16, fontWeight: 800 }}>
          📰 Published ({published.length})
        </h2>
        {published.length === 0 ? (
          <p style={{ color: "var(--muted)" }}>No published posts yet.</p>
        ) : (
          <div className="admin-table">
            <div className="admin-table-header">
              <span className="col-title">Title</span>
              <span className="col-author">Author</span>
              <span className="col-cat">Category</span>
              <span className="col-date">Published</span>
              <span className="col-actions">Actions</span>
            </div>
            {published.map((b) => (
              <div key={b.id} className="admin-table-row">
                <span className="col-title">
                  <Link to={`/post/${b.slug}`} style={{ fontWeight: 600 }}>{b.title}</Link>
                </span>
                <span className="col-author">{b.author?.name || b.author?.username || "—"}</span>
                <span className="col-cat">{b.category?.name || "—"}</span>
                <span className="col-date">
                  {b.publishedAt ? new Date(b.publishedAt).toLocaleDateString() : "—"}
                </span>
                <span className="col-actions">
                  <button className="admin-btn admin-btn-unpublish" onClick={() => handlePublish(b.slug, true)}>
                    Unpublish
                  </button>
                  <Link to={`/post/${b.slug}/edit`} className="admin-btn admin-btn-edit">
                    Edit
                  </Link>
                  <button className="admin-btn admin-btn-delete" onClick={() => handleDelete(b.slug, b.title)}>
                    Delete
                  </button>
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
