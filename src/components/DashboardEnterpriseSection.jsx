// src/components/DashboardEnterpriseSection.jsx
import React from "react";
import { Plus, Brain, Database, Users, ArrowUpRight } from "lucide-react";

const DashboardEnterpriseSection = () => {
  const companyMetrics = {
    totalSessions: "47",
    sharedMemory: "+2.8 TB",
    changePercent: "+24.3%",
    activeTeams: "12"
  };

  const teamSessions = [
    {
      id: 1,
      name: "Engineering_Collective",
      description: "Shared coding knowledge and architectural decisions",
      sessions: 847,
      memorySize: "1.2 TB",
      status: "active",
      department: "Engineering",
      members: 24
    },
    {
      id: 2,
      name: "Research_Network", 
      description: "Collaborative research and knowledge synthesis",
      sessions: 423,
      memorySize: "856 GB",
      status: "learning",
      department: "Research",
      members: 18
    },
    {
      id: 3,
      name: "Product_Intelligence",
      description: "Product insights and user experience optimization",
      sessions: 634,
      memorySize: "432 GB", 
      status: "analyzing",
      department: "Product",
      members: 15
    }
  ];

  const corporateVaults = [
    {
      id: 1,
      name: "Engineering Knowledge Base",
      description: "Shared coding patterns, solutions, and best practices",
      sessions: 1247,
      size: "1.8 TB",
      teams: ["Frontend", "Backend", "DevOps"],
      access: "Team"
    },
    {
      id: 2,
      name: "Research Archive",
      description: "Collaborative research findings and methodologies", 
      sessions: 890,
      size: "1.2 TB",
      teams: ["AI/ML", "Data Science", "Blockchain"],
      access: "Department"
    },
    {
      id: 3,
      name: "Strategic Memory",
      description: "Executive decisions and strategic planning sessions",
      sessions: 342,
      size: "256 GB",
      teams: ["Leadership", "Strategy", "Operations"],
      access: "Executive"
    }
  ];

  return (
    <div className="dashboard-section">
      <div className="dashboard-section-content">
        {/* Header */}
        <div className="section-page-header">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="section-page-title">Enterprise Memory Hub</h1>
              <p className="section-page-description">Team collaboration and shared knowledge management</p>
            </div>
            <div className="flex space-x-3">
              <button className="primary-button">
                <Plus className="w-5 h-5" />
                <span>Deploy Team Session</span>
              </button>
            </div>
          </div>
        </div>

        {/* Corporate Memory Metrics */}
        <div className="overview-grid">
          <div className="overview-card featured">
            <div className="overview-card-header">
              <div className="overview-card-main">
                <p className="overview-card-subtitle">Enterprise Sessions</p>
                <h2 className="overview-card-value">{companyMetrics.totalSessions}</h2>
              </div>
              <div className="overview-card-icon">
                <Brain className="w-6 h-6" />
              </div>
            </div>
            <div className="overview-card-growth">
              <span className="overview-growth-value">
                {companyMetrics.sharedMemory}
              </span>
              <span className="overview-growth-value">
                ({companyMetrics.changePercent})
              </span>
              <span className="overview-growth-period">shared memory</span>
            </div>
          </div>

          <div className="overview-card">
            <div className="overview-card-header">
              <div className="overview-card-main">
                <p className="overview-card-subtitle">Active Teams</p>
                <h2 className="overview-card-value">{companyMetrics.activeTeams}</h2>
              </div>
              <div className="overview-card-icon">
                <Users className="w-6 h-6" />
              </div>
            </div>
            <p className="overview-growth-value">+3 this month</p>
          </div>

          <div className="overview-card">
            <div className="overview-card-header">
              <div className="overview-card-main">
                <p className="overview-card-subtitle">Memory Vaults</p>
                <h2 className="overview-card-value">18</h2>
              </div>
              <div className="overview-card-icon">
                <Database className="w-6 h-6" />
              </div>
            </div>
            <p className="overview-card-subtitle">Cross-team access</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8">
          {/* Main Content */}
          <div className="space-y-8">
            {/* Team Memory Sessions */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="section-heading">Team Memory Networks</h2>
                <button className="secondary-button">
                  View all teams
                </button>
              </div>
              
              <div className="memory-session-grid">
                {teamSessions.map((session, index) => (
                  <div key={session.id} className="memory-session-card">
                    <div className="memory-session-header">
                      <div className="memory-session-icon-wrapper">
                        <div 
                          className={`memory-session-icon ${index === 0 ? 'lime' : ''}`}
                        >
                          <Brain 
                            className="w-6 h-6" 
                            style={{ color: index === 0 ? "#111" : "#fff" }} 
                          />
                        </div>
                        <div className="memory-session-details">
                          <h3>{session.name}</h3>
                          <p>{session.description}</p>
                        </div>
                      </div>
                      <div className="memory-session-stats">
                        <p className="memory-session-size">{session.sessions} sessions</p>
                        <p className="memory-session-count">
                          {session.memorySize}
                        </p>
                      </div>
                    </div>
                    
                    <div className="memory-session-footer">
                      <div className="memory-session-meta">
                        <span className={`memory-status-badge ${session.status}`}>
                          {session.status}
                        </span>
                        <span>{session.department}</span>
                        <span>{session.members} members</span>
                      </div>
                      <button className="memory-manage-button">
                        <span className="text-sm">Manage</span>
                        <ArrowUpRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Corporate Vaults */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="section-heading">Shared Knowledge Vaults</h2>
                <button className="primary-button">
                  Create Enterprise Vault
                </button>
              </div>

              <div className="memory-session-grid">
                {corporateVaults.map((vault, index) => (
                  <div key={vault.id} className="memory-session-card">
                    <div className="memory-session-header">
                      <div className="memory-session-icon-wrapper">
                        <div 
                          className={`memory-session-icon ${index === 0 ? 'lime' : ''}`}
                        >
                          <Database 
                            className="w-5 h-5" 
                            style={{ color: index === 0 ? "#111" : "#fff" }} 
                          />
                        </div>
                        <div className="memory-session-details">
                          <h3>{vault.name}</h3>
                          <p>{vault.description}</p>
                        </div>
                      </div>
                      <span className={`memory-status-badge ${
                        vault.access === "Team" ? "active" : "idle"
                      }`}>
                        {vault.access} Access
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="text-center">
                        <span className="memory-session-size">{vault.size}</span>
                        <p className="memory-session-meta">Memory Size</p>
                      </div>
                      <div className="text-center">
                        <span className="memory-session-size">
                          {vault.sessions}
                        </span>
                        <p className="memory-session-meta">Sessions</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 mb-4">
                      <span className="memory-session-meta">Teams:</span>
                      {vault.teams.map((team, index) => (
                        <span key={index} className="vault-team-tag">
                          {team}
                        </span>
                      ))}
                    </div>
                    
                    <button className="vault-access-button">
                      Access Vault
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardEnterpriseSection;