import { Link, useLocation } from "react-router-dom";

export default function AdminNav() {
  const { pathname } = useLocation();

  return (
    <nav className="admin-nav">
      <Link to="/admin" className={`admin-nav-link ${pathname === "/admin" ? "active" : ""}`}>
        Posts
      </Link>
      <Link to="/admin/messages" className={`admin-nav-link ${pathname === "/admin/messages" ? "active" : ""}`}>
        Messages
      </Link>
    </nav>
  );
}
