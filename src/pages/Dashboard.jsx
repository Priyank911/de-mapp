// src/pages/Dashboard.jsx
import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import DashboardHeader from "../components/DashboardHeader";
import DashboardSidebar from "../components/DashboardSidebar";
import DashboardPublicSection from "../components/DashboardPublicSection";
import DashboardPrivateSection from "../components/DashboardPrivateSection";
import DashboardEnterpriseSection from "../components/DashboardEnterpriseSection";
import walletService from "../services/walletService";
import "../dashboard.css";

const Dashboard = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [userId, setUserId] = useState(null);
  const [currentSection, setCurrentSection] = useState("public");
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [walletStatus, setWalletStatus] = useState({
    isConnected: false,
    isConnecting: false,
    address: null,
    error: null
  });
  const { user, isLoaded } = useUser();

  // Wallet connection effect
  useEffect(() => {
    const initializeWallet = async () => {
      if (!userId || !isLoaded || !user) return;

      try {
        // Clean up and migrate any old data structure first
        await walletService.cleanupAndMigrateUserData(userId, user.primaryEmailAddress?.emailAddress);
        
        // Only check if wallet is already connected, don't auto-trigger
        const isConnected = await walletService.isWalletConnected(userId, user.primaryEmailAddress?.emailAddress);
        
        if (isConnected) {
          const connectedWallet = walletService.getConnectedWallet();
          setWalletStatus({
            isConnected: true,
            isConnecting: false,
            address: connectedWallet?.address,
            error: null
          });
          console.log("✅ Wallet already connected:", connectedWallet?.address);
        } else {
          console.log("💡 Wallet not connected. User can manually connect via button.");
        }

        // Setup wallet listeners
        walletService.setupWalletListeners(
          (accounts) => {
            if (accounts.length === 0) {
              setWalletStatus(prev => ({
                ...prev,
                isConnected: false,
                address: null
              }));
            } else {
              setWalletStatus(prev => ({
                ...prev,
                address: accounts[0]
              }));
            }
          },
          (chainId) => {
            console.log("Chain changed:", chainId);
          }
        );

      } catch (error) {
        console.error("❌ Wallet initialization error:", error);
        setWalletStatus(prev => ({
          ...prev,
          error: error.message,
          isConnecting: false
        }));
      }
    };

    // Add a small delay to ensure Clerk session is fully loaded
    const timer = setTimeout(() => {
      initializeWallet();
    }, 1000);

    // Cleanup listeners and timer on unmount
    return () => {
      clearTimeout(timer);
      walletService.removeWalletListeners();
    };
  }, [userId, isLoaded, user]);

  // Connect wallet function with improved session handling
  const connectWallet = async () => {
    if (!user || !userId) {
      console.error("❌ User not loaded or no user ID");
      showNotification("❌ Please ensure you're logged in before connecting wallet.", "error");
      return;
    }

    // Double-check user session is stable
    if (!isLoaded) {
      console.error("❌ User session still loading");
      showNotification("⏳ Please wait for session to load completely.", "error");
      return;
    }

    setWalletStatus(prev => ({
      ...prev,
      isConnecting: true,
      error: null
    }));

    try {
      const userEmail = user.primaryEmailAddress?.emailAddress || user.username || "Unknown User";
      
      console.log("🚀 Initiating wallet connection for:", userEmail);
      console.log("👤 User session stable:", { isLoaded, userId: userId.slice(0, 8) + "..." });
      
      // Show connecting notification
      showNotification("🔗 Opening Core Wallet for signature...", "info");
      
      const result = await walletService.connectWallet(userId, userEmail);
      
      if (result.success) {
        setWalletStatus({
          isConnected: true,
          isConnecting: false,
          address: result.walletAddress,
          error: null
        });
        
        console.log("🎉 Wallet connected successfully!");
        
        // Show success message
        showNotification("🎉 Wallet connected successfully! Welcome to De-MAPP Memory Hub.", "success");
      }
    } catch (error) {
      console.error("❌ Wallet connection failed:", error);
      
      setWalletStatus(prev => ({
        ...prev,
        isConnecting: false,
        error: error.message
      }));

      // Show specific error messages
      if (error.message.includes("rejected")) {
        showNotification("❌ Wallet connection cancelled by user.", "error");
      } else if (error.message.includes("not detected")) {
        showNotification("❌ Core Wallet not found. Please install Core Wallet extension.", "error");
      } else {
        showNotification(`❌ Connection failed: ${error.message}`, "error");
      }
    }
  };

  // Enhanced notification helper
  const showNotification = (message, type) => {
    // Create a temporary notification element
    const notification = document.createElement('div');
    notification.innerHTML = message;
    
    const getNotificationStyle = (type) => {
      switch(type) {
        case 'success':
          return 'background: linear-gradient(135deg, #d7f25a, #c0f22a); color: #000;';
        case 'error':
          return 'background: linear-gradient(135deg, #ef4444, #dc2626); color: #fff;';
        case 'info':
          return 'background: linear-gradient(135deg, #3b82f6, #2563eb); color: #fff;';
        default:
          return 'background: linear-gradient(135deg, #6b7280, #4b5563); color: #fff;';
      }
    };
    
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      ${getNotificationStyle(type)}
      padding: 1rem 1.5rem;
      border-radius: 0.75rem;
      box-shadow: 0 10px 25px rgba(0,0,0,0.2);
      z-index: 9999;
      font-weight: 600;
      max-width: 400px;
      animation: slideInRight 0.3s ease-out;
      border: 2px solid rgba(255,255,255,0.2);
    `;
    
    document.body.appendChild(notification);
    
    // Remove after 5 seconds (longer for info messages)
    const duration = type === 'info' ? 3000 : 5000;
    setTimeout(() => {
      notification.style.animation = 'slideOutRight 0.3s ease-out';
      setTimeout(() => {
        if (document.body.contains(notification)) {
          document.body.removeChild(notification);
        }
      }, 300);
    }, duration);
  };

  useEffect(() => {
    const id = searchParams.get("id");
    const section = searchParams.get("section") || "public";
    
    if (id) {
      setUserId(id);
      console.log("Dashboard loaded with UUID:", id);
    }
    setCurrentSection(section);
  }, [searchParams]);

  const handleSectionChange = (section) => {
    if (section === currentSection) return;
    
    setIsTransitioning(true);
    
    // Add a small delay for smooth transition
    setTimeout(() => {
      setCurrentSection(section);
      const newParams = new URLSearchParams(searchParams);
      newParams.set("section", section);
      setSearchParams(newParams);
      
      setTimeout(() => {
        setIsTransitioning(false);
      }, 100);
    }, 150);
  };

  if (!userId) {
    return (
      <div className="dashboard-container">
        <div style={{ 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "center", 
          minHeight: "100vh",
          padding: "2rem" 
        }}>
          <div style={{ textAlign: "center", maxWidth: "500px" }}>
            <h2 
              className="text-3xl font-bold mb-4"
              style={{ 
                color: "var(--lime)",
                marginBottom: "1.5rem",
                fontSize: "2.25rem",
                fontWeight: "800"
              }}
            >
              De-MAPP Memory Hub
            </h2>
            <p style={{ 
              color: "#9ca3af", 
              marginBottom: "2rem",
              fontSize: "1.125rem",
              lineHeight: "1.75"
            }}>
              No user ID provided. Please sign in to access your dashboard.
            </p>
            <button 
              style={{
                backgroundColor: "var(--lime)",
                color: "#111",
                padding: "0.75rem 2rem",
                borderRadius: "1rem",
                fontWeight: "600",
                border: "none",
                cursor: "pointer",
                fontSize: "1rem",
                transition: "all 0.2s"
              }}
              onClick={() => window.location.href = "/"}
              onMouseOver={(e) => e.target.style.opacity = "0.9"}
              onMouseOut={(e) => e.target.style.opacity = "1"}
            >
              Return to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  const renderCurrentSection = () => {
    switch (currentSection) {
      case "private":
        return <DashboardPrivateSection />;
      case "enterprise":
        return <DashboardEnterpriseSection />;
      case "public":
      default:
        return <DashboardPublicSection />;
    }
  };

  return (
    <div className="dashboard-container">
      <DashboardSidebar 
        activeSection={currentSection}
        onSectionChange={handleSectionChange} 
      />
      <div className="dashboard-main">
        <DashboardHeader 
          walletStatus={walletStatus}
          onConnectWallet={connectWallet}
        />
        <div className="dashboard-content">
          <main className="section-content">
            {isTransitioning ? (
              <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: "200px",
                color: "var(--text-muted)"
              }}>
                <div style={{
                  width: "20px",
                  height: "20px",
                  border: "2px solid var(--border-light)",
                  borderTop: "2px solid var(--lime)",
                  borderRadius: "50%",
                  animation: "spin 1s linear infinite"
                }}></div>
              </div>
            ) : (
              renderCurrentSection()
            )}
          </main>
        </div>
      </div>
      
     
    </div>
  );
};

export default Dashboard;