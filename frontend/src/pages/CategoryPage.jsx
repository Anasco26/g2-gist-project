import { useState, useEffect } from "react";
import { api } from "../api";
import BlogCard from "../components/BlogCard";
import Sidebar from "../components/Sidebar";

const titles = {
  reviews: { title: "Reviews", desc: "Our latest reviews of films and series." },
  rankings: { title: "Rankings", desc: "Our curated rankings and top lists." },
  lists: { title: "Lists", desc: "Curated movie lists and thematic watchlists." },
  specials: { title: "Specials", desc: "Long-form features and special coverage." },
};

export default function CategoryPage({ section }) {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const info = titles[section] || { title: "Section", desc: "" };

  useEffect(() => {
    setLoading(true);
    setError(null);
    api.get("/blogs")
      .then((data) => {
        const all = data?.data?.blogs || [];
        const filtered = all.filter((b) => {
          const cat = (b.category?.name || "").toLowerCase();
          const tag = (b.tag?.name || "").toLowerCase();
          return cat.includes(section) || tag.includes(section);
        });
        setBlogs(filtered);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [section]);

  return (
    <>
      <section className="page-title container">
        <h1>{info.title}</h1>
        <p>{info.desc}</p>
      </section>

      <main className="container layout">
        <section className="posts">
          {loading && <div className="loading" style={{ gridColumn: "1 / -1" }}>Loading posts...</div>}
          {error && (
            <div className="error-state" style={{ gridColumn: "1 / -1" }}>
              <p>Failed to load posts: {error}</p>
            </div>
          )}
          {!loading && !error && blogs.length === 0 && (
            <p style={{ gridColumn: "1 / -1", padding: 20, color: "var(--muted)" }}>No posts found in this section.</p>
          )}
          {!loading && blogs.map((b) => <BlogCard key={b.id} blog={b} />)}
        </section>
        <Sidebar />
      </main>
    </>
  );
}
