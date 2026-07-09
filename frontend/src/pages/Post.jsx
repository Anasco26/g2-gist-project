import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { api, getUser } from "../api";
import { useToast } from "../context/ToastContext";

export default function Post() {
  const { slug } = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [commentText, setCommentText] = useState("");
  const [replyTo, setReplyTo] = useState(null);
  const user = getUser();
  const { showToast } = useToast();

  const fetchPost = () => {
    setLoading(true);
    setError(null);
    api.get(`/blogs/${slug}`)
      .then((data) => {
        setBlog(data?.data?.blog);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchPost();
  }, [slug]);

  const handleLike = async () => {
    if (!user) return showToast("Please log in to like.", "error");
    try {
      const data = await api.post(`/blogs/${slug}/likes`);
      setBlog((prev) => ({
        ...prev,
        likeCount: data?.data?.blog?.likeCount ?? prev.likeCount,
      }));
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  const handleFavorite = async () => {
    if (!user) return showToast("Please log in to favorite.", "error");
    try {
      const data = await api.post(`/blogs/${slug}/favorites`);
      setBlog((prev) => ({
        ...prev,
        favoriteCount: data?.data?.blog?.favoriteCount ?? prev.favoriteCount,
      }));
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!user) return showToast("Please log in to comment.", "error");
    if (!commentText.trim()) return showToast("Please write a comment.", "error");
    try {
      const body = { content: commentText.trim() };
      if (replyTo) body.parentId = replyTo.id;
      await api.post(`/blogs/${slug}/comments`, body);
      setCommentText("");
      setReplyTo(null);
      showToast("Comment posted!", "success");
      fetchPost();
    } catch (err) {
      showToast(err.message, "error");
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
  if (!blog) return null;

  const date = blog.publishedAt
    ? new Date(blog.publishedAt).toLocaleDateString("en-US", {
        year: "numeric", month: "long", day: "numeric",
      })
    : "";

  const renderComments = (comments, depth = 0) => {
    if (!comments || comments.length === 0) return "";
    return comments.map((c) => {
      const cdate = new Date(c.createdAt).toLocaleDateString("en-US", {
        year: "numeric", month: "short", day: "numeric",
      });
      const initial = (c.author?.name || c.author?.username || "A")[0].toUpperCase();
      return (
        <div key={c.id} className="comment">
          <div className="comment-author">
            <div className="comment-avatar">{initial}</div>
            <div>
              <div className="comment-author-name">{c.author?.name || c.author?.username || "Anonymous"}</div>
              <div className="comment-date">{cdate}</div>
            </div>
          </div>
          <div className="comment-content">{c.content}</div>
          {depth < 2 && (
            <button className="comment-reply-btn" onClick={() => setReplyTo({ id: c.id, name: c.author?.name || c.author?.username || "Anonymous" })}>
              Reply
            </button>
          )}
          {c.replies?.length > 0 && (
            <div className="comment-replies">{renderComments(c.replies, depth + 1)}</div>
          )}
        </div>
      );
    });
  };

  return (
    <main className="container">
      <article className="post-detail-hero">
        <div className="post-detail-header">
          <h1>{blog.title}</h1>
          <div className="post-detail-meta">
            <span>{date}</span>
            <strong>{blog.category?.name || "Uncategorized"}</strong>
            {blog.tag && <span>#{blog.tag.name}</span>}
            <span>By {blog.author?.name || blog.author?.username || "Unknown"}</span>
          </div>
          <div className="post-detail-stats">
            <button onClick={handleLike}>
              ❤️ <span>{blog.likeCount || 0}</span>
            </button>
            <button onClick={handleFavorite}>
              ⭐ <span>{blog.favoriteCount || 0}</span>
            </button>
            <button className="secondary">
              💬 <span>{blog._count?.comments || 0}</span>
            </button>
          </div>
        </div>
      </article>

      <div className="post-detail-content" dangerouslySetInnerHTML={{ __html: blog.content }} />

      <div className="comments-section">
        <h3>Comments ({blog._count?.comments || 0})</h3>
        {blog.comments?.length > 0 ? (
          renderComments(blog.comments)
        ) : (
          <p style={{ color: "var(--muted)", marginBottom: 16 }}>No comments yet.</p>
        )}

        <form className="comment-form" onSubmit={handleComment}>
          {replyTo && (
            <div className="reply-indicator">
              <span>
                Replying to <strong>{replyTo.name}</strong>
              </span>
              <button type="button" onClick={() => setReplyTo(null)}>✕</button>
            </div>
          )}
          <textarea
            placeholder="Write a comment..."
            rows="3"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
          />
          <button type="submit">Post Comment</button>
        </form>
      </div>
    </main>
  );
}
