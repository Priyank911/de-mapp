import React from "react";
import { Link } from "react-router-dom";

export default function NavBar() {
  return (
    <div className="topnav-wrap">
      <nav className="topnav">
        {/* Brand */}
        <div className="brand">
          <div className="brand-logo-container">
            <img src="/logo.png" alt="De-MAPP Logo" className="brand-logo" />
          </div>
          <div className="brand-text">
            <span className="brand-name">De-MAPP</span>
            <span className="brand-subtitle">Memory Hub</span>
          </div>
        </div>

        {/* Links */}
        <ul className="links">
          <li><a href="/">Home</a></li>
          <li><a href="/about">About Us</a></li>
          <li><a href="/documentation">Documentation</a></li>
        </ul>

        {/* CTA */}
       <Link to="/contact" className="cta">
  Contact
  <span className="dot">➜</span>
</Link>
      </nav>
    </div>
  );
}