import { useState } from "react";
import { useToast } from "../context/ToastContext";

export default function Contact() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { showToast } = useToast();

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      showToast("Thanks for reaching out! We'll get back to you.", "success");
      setName("");
      setEmail("");
      setMessage("");
      setSubmitting(false);
    }, 500);
  };

  return (
    <main className="container">
      <section className="page-title">
        <h1>Contact Us</h1>
        <p>Send us a message — we'd love to hear from you.</p>
      </section>

      <section className="content form-container">
        <form onSubmit={handleSubmit}>
          <label htmlFor="name">Full name</label>
          <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} required />

          <label htmlFor="email">Email</label>
          <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />

          <label htmlFor="message">Message</label>
          <textarea id="message" rows="6" value={message} onChange={(e) => setMessage(e.target.value)} required />

          <button type="submit" disabled={submitting}>
            {submitting ? "Sending..." : "Send Message"}
          </button>
        </form>
      </section>
    </main>
  );
}
