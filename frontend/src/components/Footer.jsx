export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-links">
          <a href="/">Home</a>
          <a href="/reviews">Reviews</a>
          <a href="/rankings">Rankings</a>
          <a href="/lists">Lists</a>
          <a href="/specials">Specials</a>
          <a href="/contact">Contact</a>
        </div>
        <p>&copy; {new Date().getFullYear()} G2-gist movie Blog. All rights reserved.</p>
      </div>
    </footer>
  );
}
