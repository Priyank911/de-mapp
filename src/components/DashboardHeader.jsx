// src/components/DashboardHeader.jsx
import React, { useState } from "react";
import { Search, Wallet, User } from "lucide-react";
import { UserButton, useUser } from "@clerk/clerk-react";
import WalletSelectionModal from "./WalletSelectionModal";
import "./WalletSelectionModal.css";

const DashboardHeader = ({ walletStatus, onConnectWallet }) => {
  const { user, isLoaded } = useUser();
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState("");

  const handleWalletButtonClick = () => {
    if (walletStatus?.isConnected) {
      // Already connected - could show wallet details or disconnect option
      console.log("Wallet already connected:", walletStatus.address);
    } else {
      // Reset error and show wallet selection modal
      setConnectionError("");
      setShowWalletModal(true);
    }
  };

  const handleWalletSelect = async (wallet) => {
    setIsConnecting(true);
    setConnectionError("");
    
    try {
      console.log(`🔗 Connecting to ${wallet.name}...`);
      
      // The actual wallet connection is handled inside WalletSelectionModal
      // This function is just called when the connection succeeds
      
      // Call the original connect wallet function if provided
      if (onConnectWallet) {
        await onConnectWallet(wallet);
      }
      
      // Success - close modal
      setShowWalletModal(false);
      console.log(`✅ Successfully connected to ${wallet.name}`);
    } catch (error) {
      console.error("❌ Wallet connection failed:", error);
      setConnectionError(`Failed to connect ${wallet.name}. Please try again.`);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleCloseModal = () => {
    if (!isConnecting) {
      setShowWalletModal(false);
      setConnectionError("");
    }
  };

  const getWalletButtonText = () => {
    if (walletStatus?.isConnecting || isConnecting) {
      return "Connecting...";
    }
    if (walletStatus?.isConnected) {
      return `Connected (${walletStatus.address?.slice(0, 6)}...${walletStatus.address?.slice(-4)})`;
    }
    return "Connect Wallet";
  };

  const getWalletButtonStyle = () => {
    const baseStyle = {
      padding: "0.625rem 1.25rem",
      borderRadius: "8px",
      border: "none",
      fontSize: "0.875rem",
      fontWeight: "500",
      cursor: (walletStatus?.isConnecting || isConnecting) ? "not-allowed" : "pointer",
      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      display: "flex",
      alignItems: "center",
      gap: "0.5rem",
      position: "relative",
      overflow: "hidden",
      transform: "translateY(0)",
      opacity: (walletStatus?.isConnecting || isConnecting) ? 0.7 : 1,
      fontFamily: "inherit"
    };

    if (walletStatus?.isConnected) {
      // Connected state - matches the lime theme
      return {
        ...baseStyle,
        background: "var(--lime, #d7f25a)", // Lime green theme color
        color: "var(--black, #000000)",
        boxShadow: "0 2px 8px rgba(215, 242, 90, 0.3), 0 1px 3px rgba(0, 0, 0, 0.1)",
        border: "1px solid rgba(215, 242, 90, 0.5)"
      };
    }

    // Not connected state - subtle theme-matching design
    return {
      ...baseStyle,
      background: "var(--bg-card, #ffffff)",
      color: "var(--text-primary, #000000)",
      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.05)",
      border: "1px solid var(--border-medium, #e5e7eb)"
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
              disabled={walletStatus?.isConnecting || isConnecting}
              onMouseOver={(e) => {
                if (!walletStatus?.isConnecting && !isConnecting) {
                  if (walletStatus?.isConnected) {
                    // Connected hover - enhanced lime glow
                    e.target.style.boxShadow = "0 4px 16px rgba(215, 242, 90, 0.4), 0 2px 8px rgba(0, 0, 0, 0.1)";
                    e.target.style.transform = "translateY(-1px)";
                    e.target.style.borderColor = "rgba(215, 242, 90, 0.8)";
                  } else {
                    // Not connected hover - subtle lift
                    e.target.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.12), 0 2px 6px rgba(0, 0, 0, 0.08)";
                    e.target.style.transform = "translateY(-1px)";
                    e.target.style.borderColor = "var(--lime, #d7f25a)";
                  }
                }
              }}
              onMouseOut={(e) => {
                if (!walletStatus?.isConnecting && !isConnecting) {
                  if (walletStatus?.isConnected) {
                    // Connected normal - lime theme
                    e.target.style.boxShadow = "0 2px 8px rgba(215, 242, 90, 0.3), 0 1px 3px rgba(0, 0, 0, 0.1)";
                    e.target.style.transform = "translateY(0)";
                    e.target.style.borderColor = "rgba(215, 242, 90, 0.5)";
                  } else {
                    // Not connected normal - subtle
                    e.target.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.05)";
                    e.target.style.transform = "translateY(0)";
                    e.target.style.borderColor = "var(--border-medium, #e5e7eb)";
                  }
                }
              }}
            >
              <Wallet style={{ 
                width: "1rem", 
                height: "1rem",
                opacity: (walletStatus?.isConnecting || isConnecting) ? 0.6 : 1,
                animation: (walletStatus?.isConnecting || isConnecting) ? "spin 2s linear infinite" : "none",
                transition: "opacity 0.3s ease"
              }} />
              <span 
                className="wallet-button-text"
                style={{
                  background: "none",
                  backgroundColor: "transparent",
                  color: "inherit",
                  border: "none",
                  padding: "0",
                  margin: "0"
                }}
              >
                {getWalletButtonText()}
              </span>
              {walletStatus?.isConnected && (
                <div style={{
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  background: "var(--black, #000000)",
                  opacity: 0.7,
                  animation: "pulse 3s ease-in-out infinite"
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

      {/* Wallet Selection Modal */}
      <WalletSelectionModal
        isOpen={showWalletModal}
        onClose={handleCloseModal}
        onWalletSelect={handleWalletSelect}
        isConnecting={isConnecting}
        user={user}
      />
    </header>
  );
};

export default DashboardHeader;