import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "../api";
import BlogCard from "../components/BlogCard";
import Sidebar from "../components/Sidebar";

export default function Home() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchParams] = useSearchParams();
  const categoryFilter = searchParams.get("category");

  useEffect(() => {
    setLoading(true);
    setError(null);
    api.get("/blogs")
      .then((data) => {
        setBlogs(data?.data?.blogs || []);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  let filtered = blogs;
  if (categoryFilter) {
    filtered = blogs.filter(
      (b) => b.category?.name?.toLowerCase() === categoryFilter.toLowerCase()
    );
  }

  return (
    <>
      <section className="page-title container">
        <h1>The movie Blog</h1>
        {categoryFilter && <p>Filtered by: {categoryFilter}</p>}
      </section>

      <main className="container layout">
        <section className="posts" id="posts">
          {loading && <div className="loading" style={{ gridColumn: "1 / -1" }}>Loading posts...</div>}
          {error && (
            <div className="error-state" style={{ gridColumn: "1 / -1" }}>
              <p>Failed to load posts: {error}</p>
            </div>
          )}
          {!loading && !error && filtered.length === 0 && (
            <p style={{ gridColumn: "1 / -1", padding: 20, color: "var(--muted)" }}>No posts found.</p>
          )}
          {!loading && filtered.map((b) => <BlogCard key={b.id} blog={b} />)}
        </section>
        <Sidebar />
      </main>
    </>
  );
}
