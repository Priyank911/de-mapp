// src/components/DashboardSidebar.jsx
import React from "react";
import { Plus, Database, Settings, Brain, Shield, Building, Home } from "lucide-react";
import SecretCodeGenerator from './SecretCodeGenerator';

const DashboardSidebar = ({ activeSection, onSectionChange }) => {
  const navigationItems = [
    { id: "public", icon: Home, label: "Public Vaults", description: "Community shared vaults" },
    { id: "private", icon: Shield, label: "Private Vaults", description: "Your personal vaults" },
    { id: "enterprise", icon: Building, label: "Enterprise", description: "Team collaboration" }
  ];

  return (
    <aside className="dashboard-sidebar">
      <div className="sidebar-content">
        {/* Logo/Brand */}
        <div className="sidebar-brand">
          <div style={{ 
            display: "flex", 
            alignItems: "center", 
            gap: "0.75rem", 
            marginBottom: "2rem",
            paddingBottom: "1rem",
            borderBottom: "1px solid var(--border-light)"
          }}>
            <div className="sidebar-logo-container">
              <img 
                src="/logo.png" 
                alt="De-MAPP Logo"
                style={{
                  width: "1.5rem",
                  height: "1.5rem",
                  objectFit: "contain",
                  filter: "brightness(1.1) contrast(1.1)"
                }}
              />
            </div>
            <div>
              <h2 style={{ 
                color: "#6b7280", 
                fontSize: "1.125rem", 
                fontWeight: "700",
                margin: 0
              }}>
                De-MAPP
              </h2>
              <p style={{ 
                color: "#9ca3af", 
                fontSize: "0.75rem",
                margin: 0,
                fontWeight: "600",
                textTransform: "uppercase",
                letterSpacing: "0.04em"
              }}>
                Memory Hub
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="sidebar-section">
          <h3 className="sidebar-heading">Navigation</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => onSectionChange(item.id)}
                  style={{
                    width: "100%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                    padding: "0.875rem 1rem",
                    borderRadius: "var(--radius-lg)",
                    border: isActive ? "2px solid var(--lime)" : "1px solid transparent",
                    cursor: "pointer",
                    fontSize: "0.875rem",
                    fontWeight: "500",
                    transition: "all 0.2s",
                    background: isActive ? "var(--lime)" : "transparent",
                    color: isActive ? "#111" : "var(--text-primary)",
                    textAlign: "left"
                  }}
                  onMouseOver={(e) => {
                    if (!isActive) {
                      e.target.style.background = "rgba(215, 242, 90, 0.1)";
                      e.target.style.borderColor = "var(--lime)";
                      e.target.style.transform = "translateY(-1px)";
                    }
                  }}
                  onMouseOut={(e) => {
                    if (!isActive) {
                      e.target.style.background = "transparent";
                      e.target.style.borderColor = "transparent";
                      e.target.style.transform = "translateY(0)";
                    }
                  }}
                >
                  <div style={{ 
                    display: "flex", 
                    alignItems: "center", 
                    gap: "0.75rem",
                    marginBottom: "0.25rem" 
                  }}>
                    <Icon style={{ 
                      width: "1.25rem", 
                      height: "1.25rem", 
                      color: isActive ? "#111" : "var(--lime)" 
                    }} />
                    <span style={{ fontWeight: "600" }}>{item.label}</span>
                  </div>
                  <span style={{ 
                    fontSize: "0.75rem",
                    color: isActive ? "#333" : "var(--text-muted)",
                    marginLeft: "2rem"
                  }}>
                    {item.description}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="sidebar-section">
          <h3 className="sidebar-heading">Quick Actions</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <button 
              className="action-button primary"
              style={{
                background: "var(--lime)",
                color: "#111",
                padding: "0.875rem 1rem",
                borderRadius: "var(--radius-lg)",
                border: "none",
                fontSize: "0.875rem",
                fontWeight: "600",
                cursor: "pointer",
                transition: "all 0.2s",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
                boxShadow: "var(--shadow-md)"
              }}
              onMouseOver={(e) => {
                e.target.style.background = "var(--lime-dark)";
                e.target.style.transform = "translateY(-1px)";
              }}
              onMouseOut={(e) => {
                e.target.style.background = "var(--lime)";
                e.target.style.transform = "translateY(0)";
              }}
            >
              <Plus style={{ width: "1rem", height: "1rem" }} />
              Create New Vault
            </button>
            
            <button 
              style={{
                background: "transparent",
                color: "var(--text-primary)",
                padding: "0.875rem 1rem",
                borderRadius: "var(--radius-lg)",
                border: "1px solid var(--lime)",
                fontSize: "0.875rem",
                fontWeight: "500",
                cursor: "pointer",
                transition: "all 0.2s",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem"
              }}
              onMouseOver={(e) => {
                e.target.style.background = "rgba(215, 242, 90, 0.1)";
                e.target.style.borderColor = "var(--lime)";
                e.target.style.transform = "translateY(-1px)";
              }}
              onMouseOut={(e) => {
                e.target.style.background = "transparent";
                e.target.style.borderColor = "var(--lime)";
                e.target.style.transform = "translateY(0)";
              }}
            >
              <Database style={{ width: "1rem", height: "1rem" }} />
              Import Data
            </button>
          </div>
        </div>

        {/* Secret Key Generator */}
        <div style={{ marginTop: "1.5rem" }}>
          <SecretCodeGenerator />
        </div>

        {/* Settings */}
        <div style={{ marginTop: "auto", paddingTop: "2rem" }}>
          <button 
            style={{
              background: "transparent",
              color: "var(--text-muted)",
              padding: "0.75rem 1rem",
              borderRadius: "var(--radius-lg)",
              border: "1px solid var(--border-light)",
              fontSize: "0.875rem",
              fontWeight: "500",
              cursor: "pointer",
              transition: "all 0.2s",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
              width: "100%"
            }}
            onMouseOver={(e) => {
              e.target.style.background = "rgba(215, 242, 90, 0.1)";
              e.target.style.color = "var(--text-primary)";
              e.target.style.borderColor = "var(--lime)";
              e.target.style.transform = "translateY(-1px)";
            }}
            onMouseOut={(e) => {
              e.target.style.background = "transparent";
              e.target.style.color = "var(--text-muted)";
              e.target.style.borderColor = "var(--border-light)";
              e.target.style.transform = "translateY(0)";
            }}
          >
            <Settings style={{ width: "1rem", height: "1rem" }} />
            Settings
          </button>
        </div>
      </div>
    </aside>
  );
};

export default DashboardSidebar;