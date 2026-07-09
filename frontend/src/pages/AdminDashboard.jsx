import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import AdminNav from "../components/AdminNav";
import Pagination from "../components/Pagination";
import ConfirmModal from "../components/ConfirmModal";

const PER_PAGE = 10;

export default function AdminDashboard() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [confirmDelete, setConfirmDelete] = useState(null);

  useEffect(() => {
    if (!user || user.role !== "ADMIN") {
      navigate("/");
      return;
    }
    fetchPosts(1);
  }, []);

  const fetchPosts = (p) => {
    setLoading(true);
    api.get(`/blogs/admin?page=${p}&limit=${PER_PAGE}`)
      .then((data) => {
        setBlogs(data?.data?.blogs || []);
        setPagination(data?.pagination || null);
        setPage(p);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  const handlePublish = async (slug, currentlyPublished) => {
    try {
      await api.patch(`/blogs/${slug}`, { published: !currentlyPublished });
      showToast(currentlyPublished ? "Post unpublished." : "Post published!", "success");
      fetchPosts(page);
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  const handleDelete = async (slug, title) => {
    setConfirmDelete({ slug, title });
  };

  const confirmDeletePost = async () => {
    if (!confirmDelete) return;
    try {
      await api.delete(`/blogs/${confirmDelete.slug}`);
      showToast("Post deleted.", "success");
      fetchPosts(page);
    } catch (err) {
      showToast(err.message, "error");
    }
    setConfirmDelete(null);
  };

  const q = search.toLowerCase();
  const filtered = blogs.filter((b) => {
    const matchSearch =
      !q ||
      b.title.toLowerCase().includes(q) ||
      b.category?.name?.toLowerCase().includes(q) ||
      b.author?.name?.toLowerCase().includes(q);
    const matchStatus =
      statusFilter === "all" ||
      (statusFilter === "published" && b.published) ||
      (statusFilter === "draft" && !b.published);
    return matchSearch && matchStatus;
  });

  if (loading && !blogs.length) return <main className="container"><div className="loading">Loading...</div></main>;

  return (
    <main className="container">
      <section className="page-title" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1>Admin Panel</h1>
          {pagination && <p>{pagination.total} total posts</p>}
        </div>
        <Link to="/post/new" className="auth-btn" style={{ padding: "10px 20px", fontSize: 14, textDecoration: "none" }}>
          + New Post
        </Link>
      </section>

      <AdminNav />

      <section className="admin-filters">
        <div className="admin-search">
          <span className="admin-search-icon">🔍</span>
          <input type="text" placeholder="Search by title, category, or author..." value={search} onChange={(e) => setSearch(e.target.value)} />
          {search && <button className="admin-search-clear" onClick={() => setSearch("")}>✕</button>}
        </div>
        <div className="admin-status-filter">
          <button className={statusFilter === "all" ? "active" : ""} onClick={() => setStatusFilter("all")}>
            All ({pagination?.total || 0})
          </button>
          <button className={statusFilter === "published" ? "active" : ""} onClick={() => setStatusFilter("published")}>
            Published ({blogs.filter((b) => b.published).length})
          </button>
          <button className={statusFilter === "draft" ? "active" : ""} onClick={() => setStatusFilter("draft")}>
            Drafts ({blogs.filter((b) => !b.published).length})
          </button>
        </div>
      </section>

      {filtered.length === 0 ? (
        <p style={{ color: "var(--muted)", padding: "32px 0", textAlign: "center" }}>
          {search ? "No posts match." : "No posts yet."}
        </p>
      ) : (
        <>
          <div className="admin-table">
            <div className="admin-table-header">
              <span className="col-title">Post</span>
              <span className="col-status">Status</span>
              <span className="col-date">Date</span>
              <span className="col-actions">Actions</span>
            </div>
            {filtered.map((b) => (
              <div key={b.id} className="admin-table-row">
                <span className="col-title">
                  <Link to={`/post/${b.slug}`} className="admin-post-title">{b.title}</Link>
                  <span className="admin-post-meta">
                    {b.category?.name} — {b.author?.name || b.author?.username || "Unknown"}
                  </span>
                </span>
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
                  <Link to={`/post/${b.slug}/edit`} className="admin-btn admin-btn-edit">Edit</Link>
                  <button className="admin-btn admin-btn-delete" onClick={() => handleDelete(b.slug, b.title)}>
                    {b.published ? "Delete" : "Drop"}
                  </button>
                </span>
              </div>
            ))}
          </div>
          {pagination && pagination.totalPages > 1 && (
            <Pagination page={page} totalPages={pagination.totalPages} onPage={fetchPosts} />
          )}
        </>
      )}
      {confirmDelete && (
        <ConfirmModal
          open
          title="Delete post?"
          message={`Delete "${confirmDelete.title}"? This cannot be undone.`}
          onConfirm={confirmDeletePost}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </main>
  );
}
