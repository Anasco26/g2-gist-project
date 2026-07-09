import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <main className="container" style={{ textAlign: "center", paddingTop: 80, paddingBottom: 80 }}>
      <h1 style={{ fontSize: 80, fontWeight: 900, color: "var(--red)", lineHeight: 1, marginBottom: 8 }}>404</h1>
      <p style={{ fontSize: 18, color: "var(--muted)", marginBottom: 24 }}>
        This page took a wrong turn — like a plot twist nobody asked for.
      </p>
      <Link to="/" className="auth-btn" style={{ display: "inline-block", padding: "12px 28px", fontSize: 14, textDecoration: "none" }}>
        ← Back to Home
      </Link>
    </main>
  );
}
