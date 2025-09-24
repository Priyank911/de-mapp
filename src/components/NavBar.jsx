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
          <li><Link to="/">Home</Link></li>
          <li><Link to="/about">About Us</Link></li>
          <li><Link to="/documentation">Documentation</Link></li>
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