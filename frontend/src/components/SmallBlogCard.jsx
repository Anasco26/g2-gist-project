import { Link } from "react-router-dom";

function extractFirstImage(html) {
  const div = document.createElement("div");
  div.innerHTML = html;
  const img = div.querySelector("img");
  return img?.getAttribute("src") || null;
}

export default function SmallBlogCard({ blog }) {
  const date = blog.publishedAt
    ? new Date(blog.publishedAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "";

  const image = extractFirstImage(blog.content);

  return (
    <article className="small-card">
      {image && <img src={image} alt="" className="small-card-thumb" />}
      <div className="small-card-body">
        <div className="small-card-meta">
          <span className="small-card-cat">{blog.category?.name || "Uncategorized"}</span>
          <span>{date}</span>
        </div>
        <h4>
          <Link to={`/post/${blog.slug}`}>{blog.title}</Link>
        </h4>
        <div className="small-card-stats">
          <span>❤️ {blog.likeCount || 0}</span>
          <span>👁️ {blog.viewCount || 0}</span>
        </div>
      </div>
    </article>
  );
}
