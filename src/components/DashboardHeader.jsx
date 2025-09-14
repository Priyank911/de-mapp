// src/components/DashboardHeader.jsx
import React from "react";
import { Search, Wallet, User } from "lucide-react";
import { UserButton, useUser } from "@clerk/clerk-react";

const DashboardHeader = ({ walletStatus, onConnectWallet }) => {
  const { user, isLoaded } = useUser();

  const handleWalletButtonClick = () => {
    if (walletStatus?.isConnected) {
      // Already connected - could show wallet details or disconnect option
      console.log("Wallet already connected:", walletStatus.address);
    } else {
      // Trigger wallet connection
      onConnectWallet && onConnectWallet();
    }
  };

  const getWalletButtonText = () => {
    if (walletStatus?.isConnecting) {
      return "Connecting...";
    }
    if (walletStatus?.isConnected) {
      return `Connected (${walletStatus.address?.slice(0, 6)}...${walletStatus.address?.slice(-4)})`;
    }
    return "Connect Avalanche";
  };

  const getWalletButtonStyle = () => {
    const baseStyle = {
      padding: "0.625rem 1.25rem",
      borderRadius: "9999px",
      border: "none",
      fontSize: "0.875rem",
      fontWeight: "600",
      cursor: walletStatus?.isConnecting ? "not-allowed" : "pointer",
      transition: "all 0.2s",
      display: "flex",
      alignItems: "center",
      gap: "0.5rem",
      opacity: walletStatus?.isConnecting ? 0.7 : 1
    };

    if (walletStatus?.isConnected) {
      return {
        ...baseStyle,
        background: "linear-gradient(135deg, #22c55e, #16a34a)",
        color: "#ffffff",
        boxShadow: "0 4px 12px rgba(34, 197, 94, 0.3)"
      };
    }

    return {
      ...baseStyle,
      background: "var(--lime)",
      color: "var(--black)",
      boxShadow: "var(--shadow-lime)"
    };
  };

  return (
    <header className="dashboard-header">
      <div className="header-content">
        <div className="header-main">
          {/* Logo */}
          <div className="dashboard-logo">
            <div className="dashboard-logo-container">
              <img 
                src="/logo.png" 
                alt="De-MAPP Logo" 
              />
            </div>
            <div className="dashboard-logo-text">
              {/* <span className="dashboard-brand-name">De-MAPP</span> */}
              <span className="dashboard-brand-subtitle">Dashboard</span>
            </div>
          </div>

          {/* Search Bar */}
          <div className="dashboard-search" style={{ flex: 1, maxWidth: "500px" }}>
            <div style={{ position: "relative" }}>
              <Search 
                style={{
                  position: "absolute",
                  left: "1rem",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "var(--text-muted)",
                  width: "1.25rem",
                  height: "1.25rem"
                }}
              />
              <input
                type="text"
                placeholder="Search memory, vaults, sessions..."
                className="search-input"
                style={{
                  width: "100%",
                  background: "var(--bg-card)",
                  border: "1px solid var(--border-medium)",
                  borderRadius: "9999px",
                  padding: "0.75rem 1.5rem 0.75rem 3rem",
                  color: "var(--text-primary)",
                  fontSize: "0.875rem",
                  transition: "all 0.2s",
                  boxShadow: "var(--shadow-sm)"
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "var(--lime)";
                  e.target.style.boxShadow = "0 0 0 3px rgba(215, 242, 90, 0.1), var(--shadow-md)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "var(--border-medium)";
                  e.target.style.boxShadow = "var(--shadow-sm)";
                }}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="dashboard-actions">
            <button 
              style={getWalletButtonStyle()}
              onClick={handleWalletButtonClick}
              disabled={walletStatus?.isConnecting}
              onMouseOver={(e) => {
                if (!walletStatus?.isConnecting) {
                  if (walletStatus?.isConnected) {
                    e.target.style.background = "linear-gradient(135deg, #16a34a, #15803d)";
                  } else {
                    e.target.style.background = "var(--lime-dark)";
                  }
                  e.target.style.transform = "translateY(-1px)";
                }
              }}
              onMouseOut={(e) => {
                if (!walletStatus?.isConnecting) {
                  if (walletStatus?.isConnected) {
                    e.target.style.background = "linear-gradient(135deg, #22c55e, #16a34a)";
                  } else {
                    e.target.style.background = "var(--lime)";
                  }
                  e.target.style.transform = "translateY(0)";
                }
              }}
            >
              <Wallet style={{ 
                width: "1rem", 
                height: "1rem",
                animation: walletStatus?.isConnecting ? "spin 1s linear infinite" : "none"
              }} />
              <span>{getWalletButtonText()}</span>
              {walletStatus?.isConnected && (
                <div style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  background: "#10b981",
                  boxShadow: "0 0 6px rgba(16, 185, 129, 0.6)"
                }} />
              )}
            </button>

            {/* User Profile */}
            <div className="user-profile-section">
              {isLoaded && user ? (
                <div style={{ 
                  display: "flex", 
                  alignItems: "center", 
                  gap: "0.75rem" 
                }}>
                  <div className="user-profile-info">
                    <span className="user-profile-name">
                      {user.firstName || user.username || "User"}
                    </span>
                    <span className="user-profile-email">
                      {user.primaryEmailAddress?.emailAddress}
                    </span>
                  </div>
                  <UserButton 
                    afterSignOutUrl="/"
                    appearance={{
                      elements: {
                        avatarBox: {
                          width: "2.5rem",
                          height: "2.5rem",
                          border: "2px solid var(--border-medium)",
                          boxShadow: "var(--shadow-md)",
                          transition: "all 0.2s"
                        },
                        userButtonPopoverCard: {
                          background: "var(--bg-card)",
                          border: "1px solid var(--border-medium)",
                          boxShadow: "var(--shadow-xl)",
                          borderRadius: "var(--radius-lg)"
                        },
                        userButtonPopoverActions: {
                          background: "var(--bg-card)"
                        },
                        userButtonPopoverActionButton: {
                          color: "var(--text-primary)",
                          "&:hover": {
                            background: "var(--bg-tertiary)"
                          }
                        },
                        userButtonPopoverActionButtonText: {
                          color: "var(--text-primary)"
                        },
                        userButtonPopoverFooter: {
                          background: "var(--bg-secondary)",
                          borderTop: "1px solid var(--border-light)"
                        }
                      },
                      variables: {
                        colorPrimary: "var(--lime)",
                        colorTextOnPrimaryBackground: "var(--black)",
                        colorBackground: "var(--bg-card)",
                        colorText: "var(--text-primary)",
                        colorTextSecondary: "var(--text-muted)",
                        colorNeutral: "var(--bg-tertiary)",
                        borderRadius: "var(--radius-lg)"
                      }
                    }}
                  />
                </div>
              ) : (
                <div className="user-profile-fallback">
                  <User style={{ 
                    width: "1.25rem", 
                    height: "1.25rem", 
                    color: "var(--text-muted)" 
                  }} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;