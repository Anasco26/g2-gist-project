import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export default function Auth() {
  const [mode, setMode] = useState("login");
  const [identifier, setIdentifier] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { login, register } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      if (mode === "login") {
        await login(identifier, password);
        showToast("Logged in successfully!", "success");
      } else {
        await register({ email, password, confirmPassword, name: name || undefined, username: username || undefined });
        showToast("Account created!", "success");
      }
      setTimeout(() => navigate("/"), 500);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="container">
      <section className="page-title">
        <h1>{mode === "login" ? "Log In" : "Create Account"}</h1>
        <p>{mode === "login" ? "Access your account to save favorites." : "Join the G2-gist community."}</p>
      </section>

      <section className="content form-container">
        {error && <div className="form-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          {mode === "login" ? (
            <>
              <label htmlFor="identifier">Email or Username</label>
              <input id="identifier" type="text" value={identifier} onChange={(e) => setIdentifier(e.target.value)} required />
              <label htmlFor="password">Password</label>
              <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              <button type="submit" disabled={submitting}>
                {submitting ? "Loading..." : "Log In"}
              </button>
              <div className="form-link">
                Don't have an account?{" "}
                <a href="#" onClick={(e) => { e.preventDefault(); setMode("register"); setError(""); }}>
                  Sign up
                </a>
              </div>
            </>
          ) : (
            <>
              <label htmlFor="regEmail">Email</label>
              <input id="regEmail" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              <label htmlFor="regName">Name (optional)</label>
              <input id="regName" type="text" value={name} onChange={(e) => setName(e.target.value)} />
              <label htmlFor="regUsername">Username (optional)</label>
              <input id="regUsername" type="text" value={username} onChange={(e) => setUsername(e.target.value)} />
              <label htmlFor="regPassword">Password</label>
              <input id="regPassword" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} />
              <label htmlFor="regConfirmPassword">Confirm Password</label>
              <input id="regConfirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
              <button type="submit" disabled={submitting}>
                {submitting ? "Loading..." : "Create Account"}
              </button>
              <div className="form-link">
                Already have an account?{" "}
                <a href="#" onClick={(e) => { e.preventDefault(); setMode("login"); setError(""); }}>
                  Log in
                </a>
              </div>
            </>
          )}
        </form>
      </section>
    </main>
  );
}
