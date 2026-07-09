import { Link } from "react-router-dom";

export default function BlogCard({ blog }) {
  const date = blog.publishedAt
    ? new Date(blog.publishedAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

  const stripHtml = (html) => {
    const div = document.createElement("div");
    div.innerHTML = html;
    return div.textContent || div.innerText || "";
  };

  return (
    <article className="card">
      <div className="body">
        <div className="date">{date}</div>
        <h2>
          <Link to={`/post/${blog.slug}`}>{blog.title}</Link>
        </h2>
        <p>{stripHtml(blog.content).slice(0, 150)}...</p>
        <Link to={`/post/${blog.slug}`} className="read-more">
          Read More →
        </Link>
        <div className="meta">
          <span className="cat">{blog.category?.name || "Uncategorized"}</span>
          <span className="comment-count">
            💬 {blog._count?.comments || 0}
          </span>
          <span className="like-count">❤️ {blog.likeCount || 0}</span>
        </div>
      </div>
    </article>
  );
}
