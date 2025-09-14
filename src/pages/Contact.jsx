import React from "react";

export default function Contact() {
  return (
    <main style={{ fontFamily: "Inter, sans-serif", background: "#fff" }}>
      {/* Hero Section */}
      <section style={{ textAlign: "center", padding: "6rem 2rem 3rem 2rem" }}>
        <h1 style={{ fontSize: "2.5rem", fontWeight: "700", color: "#111" }}>
          Let’s Connect And{" "}
          <span style={{ color: "#d7f25a" }}>Power What’s Next</span>
        </h1>
        <p style={{ marginTop: "1rem", color: "#555", fontSize: "1.1rem" }}>
          Our team is here to help you charge forward with the right solutions
          reach out and let’s start the conversation.
        </p>
      </section>

      {/* Contact Options + Form */}
      <section
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "2.5rem",
          maxWidth: "1100px",
          margin: "0 auto",
          padding: "2rem",
          alignItems: "flex-start",
        }}
      >
        {/* Contact Options */}
        <div style={{ display: "grid", gap: "1.5rem" }}>
          {[
            {
              title: "Support",
              text: "Need help integrating De-MAPP or using our SDK? Our team is here to assist.",
            },
            {
              title: "Partnerships",
              text: "Collaborate with us to shape the future of decentralized AI memory.",
            },
            {
              title: "Feedback",
              text: "Share your thoughts — your ideas help us improve De-MAPP for everyone.",
            },
            {
              title: "Media & Press",
              text: "Covering our story? Reach out for interviews, assets, and deeper insights.",
            },
          ].map((item, idx) => (
            <div
              key={idx}
              style={{
                background: "linear-gradient(135deg, #f9f9f9, #eef1e0)",
                border: "1px solid #d7f25a",
                padding: "1.5rem",
                borderRadius: "12px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "scale(1.02)";
                e.currentTarget.style.boxShadow =
                  "0 6px 16px rgba(0,0,0,0.12)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1)";
                e.currentTarget.style.boxShadow =
                  "0 2px 8px rgba(0,0,0,0.08)";
              }}
            >
              <h3
                style={{
                  color: "#111",
                  fontWeight: "700",
                  fontSize: "1.2rem",
                  marginBottom: "0.5rem",
                }}
              >
                {item.title}
              </h3>
              <p style={{ color: "#333", lineHeight: "1.5" }}>{item.text}</p>
            </div>
          ))}
        </div>

        {/* Contact Form */}
        <div
          style={{
            background: "#111",
            padding: "2rem",
            borderRadius: "12px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          }}
        >
          <form>
            <label
              style={{
                display: "block",
                fontWeight: "600",
                marginBottom: "0.5rem",
                color: "#fff",
              }}
            >
              Name *
            </label>
            <input
              type="text"
              placeholder="Your Name"
              style={{
                width: "100%",
                padding: "0.75rem",
                marginBottom: "1.5rem",
                borderRadius: "8px",
                border: "1px solid #ccc",
              }}
              required
            />

            <label
              style={{
                display: "block",
                fontWeight: "600",
                marginBottom: "0.5rem",
                color: "#fff",
              }}
            >
              Email *
            </label>
            <input
              type="email"
              placeholder="you@mail.com"
              style={{
                width: "100%",
                padding: "0.75rem",
                marginBottom: "1.5rem",
                borderRadius: "8px",
                border: "1px solid #ccc",
              }}
              required
            />

            <label
              style={{
                display: "block",
                fontWeight: "600",
                marginBottom: "0.5rem",
                color: "#fff",
              }}
            >
              Message *
            </label>
            <textarea
              placeholder="Type your message..."
              rows="5"
              style={{
                width: "100%",
                padding: "0.75rem",
                marginBottom: "1.5rem",
                borderRadius: "8px",
                border: "1px solid #ccc",
              }}
              required
            />

            <button
              type="submit"
              style={{
                background: "#d7f25a",
                color: "#111",
                padding: "0.9rem 1.5rem",
                borderRadius: "10px",
                border: "none",
                fontWeight: "600",
                cursor: "pointer",
                width: "100%",
                fontSize: "1rem",
              }}
            >
              Send Message
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}