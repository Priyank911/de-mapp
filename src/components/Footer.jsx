import React from "react";

export default function Footer() {
  return (
    <footer
      style={{
        backgroundColor: "#111",
        color: "#fff",
        padding: "3rem 2rem",
        marginTop: "4rem",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr 1fr",
          gap: "2rem",
          maxWidth: "1200px",
          margin: "0 auto",
        }}
      >
        {/* Logo + About */}
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <img
              src="/logo.png"
              alt="De-MAPP Logo"
              style={{ width: "40px", height: "40px" }}
            />
            <h3 style={{ fontSize: "1.2rem", fontWeight: "bold", color: "#d7f25a" }}>
              De-MAPP
            </h3>
          </div>
          <p style={{ marginTop: "1rem", color: "#bbb", fontSize: "0.9rem" }}>
            De-MAPP delivers smart, decentralized AI memory infrastructure for
            agents, teams, and enterprises.
          </p>
        </div>

        {/* Navigation */}
        <div>
          <h4 style={{ fontWeight: "bold", marginBottom: "1rem" }}>Navigation</h4>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, lineHeight: "2" }}>
            <li><a href="/" style={{ color: "#bbb", textDecoration: "none" }}>Home</a></li>
            <li><a href="/about" style={{ color: "#bbb", textDecoration: "none" }}>About Us</a></li>
            <li><a href="/documentation" style={{ color: "#bbb", textDecoration: "none" }}>Documentation</a></li>
            <li><a href="/contact" style={{ color: "#bbb", textDecoration: "none" }}>Contact</a></li>
          </ul>
        </div>

        {/* Legal */}
        <div>
          <h4 style={{ fontWeight: "bold", marginBottom: "1rem" }}>Legal & Policies</h4>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, lineHeight: "2" }}>
            <li><a href="#" style={{ color: "#bbb", textDecoration: "none" }}>Terms & Conditions</a></li>
            <li><a href="#" style={{ color: "#bbb", textDecoration: "none" }}>Privacy Policy</a></li>
          </ul>
        </div>

        {/* Social */}
        <div>
          <h4 style={{ fontWeight: "bold", marginBottom: "1rem" }}>Social</h4>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, lineHeight: "2" }}>
            <li><a href="#" style={{ color: "#bbb", textDecoration: "none" }}>Instagram</a></li>
            <li><a href="#" style={{ color: "#bbb", textDecoration: "none" }}>LinkedIn</a></li>
            <li><a href="#" style={{ color: "#bbb", textDecoration: "none" }}>YouTube</a></li>
          </ul>
        </div>
      </div>

      {/* Bottom copyright */}
      <div
        style={{
          textAlign: "center",
          marginTop: "3rem",
          color: "#666",
          fontSize: "0.85rem",
        }}
      >
        © 2025 De-MAPP. All rights reserved.
      </div>
    </footer>
  );
}