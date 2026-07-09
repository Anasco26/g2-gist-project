import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../api";
import { useToast } from "../context/ToastContext";
import RichEditor from "../components/RichEditor";

export default function CreatePost() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [categoryName, setCategoryName] = useState("");
  const [tagName, setTagName] = useState("");
  const [tagCaption, setTagCaption] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { showToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!title.trim() || !content.trim() || !categoryName.trim()) {
      setError("Title, content, and category are required.");
      return;
    }
    setSubmitting(true);
    try {
      const body = {
        title: title.trim(),
        content: content.trim(),
        category: { categoryName: categoryName.trim() },
      };
      if (tagName.trim()) {
        body.tag = { name: tagName.trim(), caption: tagCaption.trim() || tagName.trim() };
      }
      const data = await api.post("/blogs", body);
      const slug = data?.data?.blog?.slug;
      showToast("Post created!", "success");
      navigate(slug ? `/post/${slug}` : "/");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="container">
      <section className="page-title">
        <h1>New Post</h1>
        <p>Write a new story for the blog.</p>
      </section>
      <section className="content form-container wide">
        {error && <div className="form-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <label htmlFor="title">Title</label>
          <input id="title" type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />

          <label htmlFor="categoryName">Category</label>
          <input id="categoryName" type="text" value={categoryName} onChange={(e) => setCategoryName(e.target.value)} placeholder="e.g. Reviews, Rankings, Lists, Deep Dive" required />

          <label htmlFor="tagName">Tag name (optional)</label>
          <input id="tagName" type="text" value={tagName} onChange={(e) => setTagName(e.target.value)} placeholder="e.g. nollywood, netflix" />

          <label htmlFor="tagCaption">Tag caption (optional)</label>
          <input id="tagCaption" type="text" value={tagCaption} onChange={(e) => setTagCaption(e.target.value)} placeholder="e.g. Nollywood, Netflix picks" />

          <label>Content</label>
          <RichEditor value={content} onChange={setContent} />

          <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
            <button type="submit" disabled={submitting}>
              {submitting ? "Publishing..." : "Publish Post"}
            </button>
            <Link to="/" className="auth-btn" style={{ textDecoration: "none", textAlign: "center", padding: "12px 18px" }}>
              Cancel
            </Link>
          </div>
        </form>
      </section>
    </main>
  );
}
