import { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import SearchModal from "./SearchModal";

export default function Header() {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  const isActive = (path) =>
    location.pathname === path ? "active" : "";

  useEffect(() => {
    function handleClick(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleLogout = async () => {
    await logout();
    setDropdownOpen(false);
    navigate("/");
  };

  const closeMobileMenu = () => setMenuOpen(false);

  return (
    <>
      <header className="site-header">
        <div className="container nav">
          <Link to="/" className="logo">
            G2<span>-gist</span>
          </Link>
          <nav className={`nav-menu ${menuOpen ? "open" : ""}`}>
            <ul className="menu">
              <li>
                <Link to="/" className={isActive("/")} onClick={closeMobileMenu}>
                  Home
                </Link>
              </li>
              <li>
                <Link to="/reviews" className={isActive("/reviews")} onClick={closeMobileMenu}>
                  Reviews
                </Link>
              </li>
              <li>
                <Link to="/rankings" className={isActive("/rankings")} onClick={closeMobileMenu}>
                  Rankings
                </Link>
              </li>
              <li>
                <Link to="/lists" className={isActive("/lists")} onClick={closeMobileMenu}>
                  Lists
                </Link>
              </li>
              <li>
                <Link to="/specials" className={isActive("/specials")} onClick={closeMobileMenu}>
                  Specials
                </Link>
              </li>
              <li>
                <Link to="/contact" className={isActive("/contact")} onClick={closeMobileMenu}>
                  Contact
                </Link>
              </li>
            </ul>
          </nav>
          <div className="header-controls">
            <button className="search-btn" aria-label="Search" onClick={() => setSearchOpen(true)}>
              <span className="search-icon">🔍</span>
            </button>
            {user ? (
              <>
                <Link to="/post/new" className="header-create-btn">+ Create</Link>
                <div className="user-menu" ref={dropdownRef}>
                  <button className="user-btn-trigger" onClick={() => setDropdownOpen((o) => !o)}>
                    <span>{user.name || user.username || user.email}</span>
                  </button>
                  <div className={`user-dropdown ${dropdownOpen ? "open" : ""}`}>
                    <div className="dropdown-header">
                      <strong>{user.name || "User"}</strong>
                      <span>{user.email}</span>
                      <span style={{ fontSize: 11, color: "var(--muted)", display: "block", marginTop: 2 }}>
                        Role: {user.role}
                      </span>
                    </div>
                    <div className="dropdown-divider" />
                    <Link to="/post/new" onClick={() => setDropdownOpen(false)}>
                      ✏️ New Post
                    </Link>
                    {user.role === "ADMIN" && (
                      <Link to="/admin" onClick={() => setDropdownOpen(false)}>
                        📋 Admin Panel
                      </Link>
                    )}
                    <Link to="/" onClick={() => setDropdownOpen(false)}>
                      Home
                    </Link>
                    <div className="dropdown-divider" />
                    <button onClick={handleLogout}>Log Out</button>
                  </div>
                </div>
              </>
            ) : (
              <Link to="/auth" className="auth-btn">
                Log In
              </Link>
            )}
            <button
              className={`mobile-menu-btn ${menuOpen ? "active" : ""}`}
              aria-label="Toggle menu"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((o) => !o)}
            >
              <span />
              <span />
              <span />
            </button>
          </div>
        </div>
      </header>
      {searchOpen && <SearchModal onClose={() => setSearchOpen(false)} />}
    </>
  );
}
