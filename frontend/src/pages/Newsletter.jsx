import { useState } from "react";
import { useToast } from "../context/ToastContext";

export default function Newsletter() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { showToast } = useToast();

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      showToast("Subscribed! Welcome to the G2-gist newsletter.", "success");
      setName("");
      setEmail("");
      setSubmitting(false);
    }, 500);
  };

  return (
    <main className="container">
      <section className="page-title">
        <h1>Subscribe to our Newsletter</h1>
        <p>Get the latest movie reviews and lists delivered to your inbox.</p>
      </section>

      <section className="content form-container">
        <form onSubmit={handleSubmit}>
          <label htmlFor="name">Name</label>
          <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} required />

          <label htmlFor="email">Email</label>
          <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />

          <button type="submit" disabled={submitting}>
            {submitting ? "Subscribing..." : "Subscribe"}
          </button>
          <p className="note">
            No spam, ever. Unsubscribe anytime.
          </p>
        </form>
      </section>
    </main>
  );
}
