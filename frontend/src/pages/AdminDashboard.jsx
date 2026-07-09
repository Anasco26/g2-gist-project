import { useState, useEffect, useCallback } from "react";
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
  const [searchInput, setSearchInput] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [confirmDelete, setConfirmDelete] = useState(null);

  useEffect(() => {
    if (!user || user.role !== "ADMIN") {
      navigate("/");
      return;
    }
    fetchPosts(1);
  }, []);

  const fetchPosts = useCallback((p, s = search, st = statusFilter) => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(p), limit: String(PER_PAGE) });
    if (s) params.set("search", s);
    if (st !== "all") params.set("status", st);

    api.get(`/blogs/admin?${params}`)
      .then((data) => {
        setBlogs(data?.data?.blogs || []);
        setPagination(data?.pagination || null);
        setPage(p);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [search, statusFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput);
    fetchPosts(1, searchInput, statusFilter);
  };

  const handleFilter = (st) => {
    setStatusFilter(st);
    fetchPosts(1, search, st);
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
        <div className="admin-status-filter">
          <button className={statusFilter === "all" ? "active" : ""} onClick={() => handleFilter("all")}>
            All ({pagination?.total || 0})
          </button>
          <button className={statusFilter === "published" ? "active" : ""} onClick={() => handleFilter("published")}>
            Published
          </button>
          <button className={statusFilter === "draft" ? "active" : ""} onClick={() => handleFilter("draft")}>
            Drafts
          </button>
        </div>
        <form className="admin-search" onSubmit={handleSearch}>
          <span className="admin-search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search by title, category, or author..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          {searchInput && (
            <button type="button" className="admin-search-clear" onClick={() => { setSearchInput(""); setSearch(""); fetchPosts(1, "", statusFilter); }}>✕</button>
          )}
        </form>
      </section>

      {blogs.length === 0 ? (
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
            {blogs.map((b) => (
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
            <Pagination page={page} totalPages={pagination.totalPages} onPage={(p) => fetchPosts(p)} />
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