import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { api, getUser } from "../api";
import { useToast } from "../context/ToastContext";

export default function EditPost() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [categoryName, setCategoryName] = useState("");
  const [tagName, setTagName] = useState("");
  const [tagCaption, setTagCaption] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const user = getUser();

  useEffect(() => {
    api.get(`/blogs/${slug}`)
      .then((data) => {
        const blog = data?.data?.blog;
        if (!blog) throw new Error("Post not found");
        if (user?.id !== blog.author?.id && user?.role !== "ADMIN") {
          showToast("You don't have permission to edit this post.", "error");
          navigate(`/post/${slug}`);
          return;
        }
        setTitle(blog.title);
        setContent(blog.content);
        setCategoryName(blog.category?.name || "");
        setTagName(blog.tag?.name || "");
        setTagCaption(blog.tag?.caption || "");
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [slug]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const body = {};
      if (title.trim()) body.title = title.trim();
      if (content.trim()) body.content = content.trim();
      if (categoryName.trim()) body.category = { categoryName: categoryName.trim() };
      if (tagName.trim()) {
        body.tag = { name: tagName.trim(), caption: tagCaption.trim() || tagName.trim() };
      } else {
        body.tag = null;
      }
      await api.patch(`/blogs/${slug}`, body);
      showToast("Post updated!", "success");
      navigate(`/post/${slug}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <main className="container"><div className="loading">Loading post...</div></main>;
  if (error) return (
    <main className="container">
      <div className="error-state">
        <p>{error}</p>
        <Link to="/" className="read-more">← Back to Home</Link>
      </div>
    </main>
  );

  return (
    <main className="container">
      <section className="page-title">
        <h1>Edit Post</h1>
      </section>
      <section className="content form-container wide">
        {error && <div className="form-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <label htmlFor="title">Title</label>
          <input id="title" type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />

          <label htmlFor="categoryName">Category</label>
          <input id="categoryName" type="text" value={categoryName} onChange={(e) => setCategoryName(e.target.value)} required />

          <label htmlFor="tagName">Tag name</label>
          <input id="tagName" type="text" value={tagName} onChange={(e) => setTagName(e.target.value)} placeholder="e.g. nollywood, netflix" />

          <label htmlFor="tagCaption">Tag caption</label>
          <input id="tagCaption" type="text" value={tagCaption} onChange={(e) => setTagCaption(e.target.value)} placeholder="e.g. Nollywood, Netflix picks" />

          <label htmlFor="content">Content</label>
          <textarea id="content" rows="12" value={content} onChange={(e) => setContent(e.target.value)} required />

          <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
            <button type="submit" disabled={submitting}>
              {submitting ? "Saving..." : "Save Changes"}
            </button>
            <Link to={`/post/${slug}`} className="auth-btn" style={{ textDecoration: "none", textAlign: "center", padding: "12px 18px" }}>
              Cancel
            </Link>
          </div>
        </form>
      </section>
    </main>
  );
}
