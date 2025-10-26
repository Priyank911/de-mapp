// src/components/DashboardPublicSection.jsx
import React from "react";
import { ArrowUpRight, Brain, Database, Users, Clock, Wrench, Settings } from "lucide-react";

const DashboardPublicSection = () => {
  /* 
  // Sample trending memory vaults for De-MAPP
  const trendingVaults = [
    {
      id: "coding_001",
      title: "Advanced React Patterns",
      creator: "DevMemory_Pro",
      type: "CODING KNOWLEDGE",
      access: "Public",
      description: "Comprehensive React patterns and best practices from 500+ coding sessions",
      sessions: 127,
      featured: true
    },
    {
      id: "research_001", 
      title: "AI Research Compilation",
      creator: "ResearchBot_v2",
      type: "RESEARCH VAULT",
      access: "Open",
      description: "Latest AI/ML research papers with summaries and insights",
      sessions: 89,
      featured: true
    },
    {
      id: "blockchain_001",
      title: "DeFi Protocol Analysis", 
      creator: "CryptoAnalyst",
      type: "FINANCIAL INSIGHTS",
      access: "Public",
      description: "Deep analysis of DeFi protocols, risks, and opportunities",
      sessions: 156,
      featured: true
    },
    {
      id: "design_001",
      title: "UI/UX Design Patterns",
      creator: "DesignMemory_AI", 
      type: "DESIGN VAULT",
      access: "Community",
      description: "Modern design patterns and user experience insights",
      sessions: 203,
      featured: true
    }
  ];
  */

  return (
    <div className="dashboard-section">
      <div className="dashboard-section-content">
        {/* Header */}
        <div className="section-page-header">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="section-page-title">
                Public Knowledge Vaults
              </h1>
              <p className="section-page-description">
                Community-shared memory sessions and knowledge bases
              </p>
            </div>
          </div>
        </div>

        {/* Under Maintenance Section */}
        <div className="maintenance-container">
          <div className="maintenance-card">
            <div className="maintenance-icon-wrapper">
              <img 
                src="/maintenance.png" 
                alt="Under Maintenance" 
                className="maintenance-image"
              />
            </div>
            
            <div className="maintenance-content">
              <h2 className="maintenance-title">Under Maintenance</h2>
              <p className="maintenance-description">
                We're enhancing the public knowledge vault experience with exciting new features.
              </p>
              
              <div className="maintenance-status">
                <div className="maintenance-status-bar">
                  <div className="maintenance-status-progress"></div>
                </div>
                <p className="maintenance-status-text">Coming Soon</p>
              </div>
            </div>
          </div>
        </div>

        {/* 
        <div className="vault-showcase-grid">
          {trendingVaults.map((vault, index) => (
            <div key={vault.id} className="vault-showcase-card">
              <div 
                className={`vault-showcase-image ${index === 0 || index === 2 ? 'lime' : ''}`}
              >
                {vault.id === "coding_001" && (
                  <div className="text-center">
                    <div className="w-16 h-16 bg-black/20 backdrop-blur-sm rounded-2xl mx-auto mb-4 flex items-center justify-center">
                    </div>
                  </div>
                )}
                {vault.id === "research_001" && (
                  <div className="w-24 h-16 bg-white/10 backdrop-blur-sm rounded-lg flex items-center justify-center">
                  </div>
                )}
              </div>
              
              <div className="vault-showcase-info">
                <div className="vault-creator">
                  {vault.creator}
                </div>
                <h3 className="vault-showcase-title">
                  {vault.title}
                </h3>
                <div className="vault-tags">
                  <span className="vault-type-tag">
                    {vault.type}
                  </span>
                  <div className="vault-sessions">
                    <Clock className="w-3 h-3" />
                    {vault.sessions} sessions
                  </div>
                </div>
                {vault.description && (
                  <p className="vault-description-text">
                    {vault.description}
                  </p>
                )}
                
                <button className="vault-access-button">
                  Access Vault
                </button>
              </div>
            </div>
          ))}
        </div>
        */}
      </div>
    </div>
  );
};

export default DashboardPublicSection;