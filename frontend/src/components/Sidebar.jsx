import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";

export default function Sidebar() {
  const [recent, setRecent] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    api.get("/blogs").then((data) => {
      const blogs = data?.data?.blogs || [];
      setRecent(blogs.slice(0, 5));
      const seen = new Set();
      const cats = [];
      blogs.forEach((b) => {
        if (b.category && !seen.has(b.category.name)) {
          seen.add(b.category.name);
          cats.push(b.category);
        }
      });
      setCategories(cats);
    }).catch(() => {});
  }, []);

  return (
    <aside className="sidebar">
      <div className="widget">
        <h3>Recent Posts</h3>
        {recent.length === 0 ? (
          <ul><li style={{ padding: "14px", color: "var(--muted)" }}>No posts yet.</li></ul>
        ) : (
          <ul>
            {recent.map((b) => (
              <li key={b.slug}>
                <Link to={`/post/${b.slug}`}>{b.title}</Link>
              </li>
            ))}
          </ul>
        )}
      </div>
      {categories.length > 0 && (
        <div className="widget">
          <h3>Categories</h3>
          <div className="tags">
            {categories.map((c) => (
              <Link key={c.name} to={`/?category=${c.name}`} className="tag">
                {c.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
}
