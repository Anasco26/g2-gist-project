import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { api } from "../api";

export default function AdminNav() {
  const { pathname } = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    api.get("/contact?page=1&limit=1&read=unread")
      .then((data) => {
        setUnreadCount(data?.pagination?.total || 0);
      })
      .catch(() => {});
  }, [pathname]);

  return (
    <nav className="admin-nav">
      <Link to="/admin" className={`admin-nav-link ${pathname === "/admin" ? "active" : ""}`}>
        Posts
      </Link>
      <Link to="/admin/messages" className={`admin-nav-link ${pathname === "/admin/messages" ? "active" : ""}`}>
        Messages
        {unreadCount > 0 && <span className="admin-nav-badge">{unreadCount}</span>}
      </Link>
    </nav>
  );
}