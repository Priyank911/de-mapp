// src/components/DashboardPrivateSection.jsx
import React, { useState, useEffect } from "react";
import { Plus, Brain, Database, ArrowUpRight, Loader2, ExternalLink, CheckCircle, XCircle } from "lucide-react";
import { useUser } from '@clerk/clerk-react';
import avaxVaultService from '../services/avaxVaultService';
import avaxTransactionService from '../services/avaxTransactionService';
import TransactionStatusIndicator from './TransactionStatusIndicator';
import '../styles/avax-upload.css';

const DashboardPrivateSection = () => {
  const { user, isLoaded } = useUser();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uploadingSession, setUploadingSession] = useState(null);
  const [transactionStatus, setTransactionStatus] = useState({}); // Track transaction status per session

  // Session action handler
  const handleSessionAction = async (session) => {
    if (session.needsUpload) {
      await handleAvaxUpload(session);
    } else {
      console.log('Managing session:', session);
    }
  };

  // AVAX Upload handler
  const handleAvaxUpload = async (session) => {
    try {
      setUploadingSession(session.id);
      setTransactionStatus(prev => ({
        ...prev,
        [session.id]: { status: 'preparing', message: 'Preparing transaction...' }
      }));
      
      // Check for wallet availability
      if (!window.ethereum) {
        throw new Error('No wallet detected. Please install Core Wallet or MetaMask extension.');
      }

      console.log('🚀 Starting AVAX upload for session:', session);
      console.log('🔍 Wallet provider info:', {
        isMetaMask: window.ethereum.isMetaMask,
        isCoreWallet: window.ethereum.isCoreWallet,
        chainId: window.ethereum.chainId
      });
      
      // Prepare user data
      const userData = {
        name: user?.fullName || user?.firstName || 'Unknown User',
        email: user?.primaryEmailAddress?.emailAddress || session.emails?.[0] || 'unknown@email.com',
        hashId: session.cid || `hash_${Date.now()}`,
        cid: session.cid || 'no-cid',
        address: null // Will be filled by wallet connection
      };

      setTransactionStatus(prev => ({
        ...prev,
        [session.id]: { status: 'wallet', message: 'Connecting to wallet...' }
      }));

      // Perform the complete AVAX upload flow
      const result = await avaxTransactionService.performAvaxUpload(userData, session);
      
      console.log('✅ AVAX upload completed:', result);
      
      setTransactionStatus(prev => ({
        ...prev,
        [session.id]: { 
          status: 'completed', 
          message: 'Transaction completed successfully!',
          transactionHash: result.transactionHash,
          explorerUrl: result.explorerUrl,
          vaultAddress: result.vaultAddress
        }
      }));
      
      // Update session state
      await updateSessionAfterUpload(session, result);
      
    } catch (error) {
      console.error('❌ AVAX upload failed:', error);
      
      setTransactionStatus(prev => ({
        ...prev,
        [session.id]: { 
          status: 'failed', 
          message: `Upload failed: ${error.message}`,
          error: error.message
        }
      }));
      
    } finally {
      setUploadingSession(null);
    }
  };

  const updateSessionAfterUpload = async (session, transactionResult) => {
    try {
      const updatedSessions = dashboardData.mySessions.map(s => {
        if (s.id === session.id) {
          return {
            ...s,
            status: 'completed',
            isNew: false,
            needsUpload: false,
            transactionHash: transactionResult.transactionHash,
            explorerUrl: transactionResult.explorerUrl,
            uploadedAt: new Date().toISOString()
          };
        }
        return s;
      });
      
      setDashboardData(prev => ({
        ...prev,
        mySessions: updatedSessions
      }));
      
      console.log('✅ Session updated after successful upload');
      
    } catch (error) {
      console.error('❌ Error updating session after upload:', error);
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      if (!isLoaded || !user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        console.log('🔍 Fetching avaxvault data for user:', user.primaryEmailAddress?.emailAddress);
        
        let avaxVaultData = await avaxVaultService.getUserAvaxVaultData(user.id);
        
        if (!avaxVaultData && user.primaryEmailAddress?.emailAddress) {
          avaxVaultData = await avaxVaultService.getUserAvaxVaultDataByEmail(user.primaryEmailAddress.emailAddress);
        }
        
        const transformedData = avaxVaultService.transformDataForDashboard(avaxVaultData);
        setDashboardData(transformedData);
        
        console.log('✅ Dashboard data loaded:', transformedData);
        
      } catch (error) {
        console.error('❌ Error fetching user data:', error);
        setError(error.message);
        setDashboardData(avaxVaultService.getDefaultDashboardData());
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user, isLoaded]);

  if (loading) {
    return (
      <div className="dashboard-section">
        <div className="dashboard-section-content">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600">Loading your memory vaults...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error && !dashboardData) {
    return (
      <div className="dashboard-section">
        <div className="dashboard-section-content">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <p className="text-red-600 mb-4">Error loading data: {error}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="primary-button"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const {
    memoryData = avaxVaultService.getDefaultDashboardData().memoryData,
    mySessions = avaxVaultService.getDefaultDashboardData().mySessions,
    myVaults = avaxVaultService.getDefaultDashboardData().myVaults,
    userData
  } = dashboardData || {};

  return (
    <div className="dashboard-section">
      <div className="dashboard-section-content">
        <div className="section-page-header">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="section-page-title">Private Memory Vaults</h1>
              <p className="section-page-description">
                {userData ? 
                  `Welcome back, ${userData.profile?.email || user?.primaryEmailAddress?.emailAddress || 'User'}! Your personal memory sessions and encrypted storage` :
                  'Your personal memory sessions and encrypted storage'
                }
              </p>
            </div>
            <div className="flex space-x-3">
              <button className="primary-button">
                <Plus className="w-5 h-5" />
                <span>Deploy Memory</span>
              </button>
            </div>
          </div>
        </div>

        {userData && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <p className="text-green-800 text-sm">
                ✅ Connected to AVAX Vault • Last scan: {userData.metadata?.lastUpdated ? 
                  avaxVaultService.getRelativeTime(userData.metadata.lastUpdated) : 'Unknown'}
              </p>
            </div>
            {userData.wallet?.address && (
              <p className="text-green-700 text-xs mt-1">
                Wallet: {userData.wallet.address.slice(0, 8)}...{userData.wallet.address.slice(-6)}
              </p>
            )}
          </div>
        )}

        {!userData && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <p className="text-yellow-800 text-sm">
                🔄 No AVAX Vault data found yet. The auto-scan service will create your vault when email data is detected.
              </p>
            </div>
          </div>
        )}

        <div className="overview-grid">
          <div className="overview-card featured">
            <div className="overview-card-header">
              <div className="overview-card-main">
                <p className="overview-card-subtitle">Total Memory Sessions</p>
                <h2 className="overview-card-value">{memoryData.totalSessions}</h2>
              </div>
              <div className="overview-card-icon">
                <Database className="w-6 h-6" />
              </div>
            </div>
            <div className="overview-card-growth">
              <span className="overview-growth-value">{memoryData.growth}</span>
              <span className="overview-growth-value">({memoryData.growthPercent})</span>
              <span className="overview-growth-period">this week</span>
            </div>
          </div>
          
          <div className="overview-card">
            <div className="overview-card-header">
              <div className="overview-card-main">
                <p className="overview-card-subtitle">Active Sessions</p>
                <h2 className="overview-card-value">{memoryData.activeSessions}</h2>
              </div>
              <div className="overview-card-icon">
                <Brain className="w-6 h-6" />
              </div>
            </div>
            <p className="overview-growth-value">+2 this week</p>
          </div>

          <div className="overview-card">
            <div className="overview-card-header">
              <div className="overview-card-main">
                <p className="overview-card-subtitle">Memory Size</p>
                <h2 className="overview-card-value">{memoryData.memorySize}</h2>
              </div>
              <div className="overview-card-icon">
                <Database className="w-6 h-6" />
              </div>
            </div>
            <p className="overview-card-subtitle">3 private vaults</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8">
          <div className="space-y-8">
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="section-heading">My Memory Sessions</h2>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => window.location.reload()} 
                    className="secondary-button text-sm"
                  >
                    Refresh Data
                  </button>
                  <button className="secondary-button">
                    View all
                  </button>
                </div>
              </div>
              
              <div className="memory-session-grid">
                {mySessions.map((session, index) => {
                  const sessionTransactionStatus = transactionStatus[session.id];
                  const isIncompleteTransaction = !sessionTransactionStatus || 
                    (sessionTransactionStatus.status !== 'completed' && sessionTransactionStatus.status !== 'confirmed');
                  
                  return (
                    <div 
                      key={session.id} 
                      className={`memory-session-card ${session.isNew ? 'new-conversation light-theme' : ''} ${isIncompleteTransaction ? 'incomplete-transaction' : ''}`}
                    >
                      {isIncompleteTransaction && (
                        <div className="ongoing-status-overlay">
                          <div className="loading-spinner">⟳</div>
                          Pending AVAX Storage
                        </div>
                      )}
                    <div className="memory-session-header">
                      <div className="memory-session-icon-wrapper">
                        <div 
                          className={`memory-session-icon ${
                            session.isNew ? 'new-ongoing' : (index === 0 ? 'lime' : '')
                          }`}
                        >
                          <Brain 
                            className="w-6 h-6" 
                            style={{ 
                              color: session.isNew ? "#f59e0b" : (index === 0 ? "#111" : "#fff") 
                            }} 
                          />
                        </div>
                        <div className="memory-session-details">
                          <h3>{session.name}</h3>
                          <p>{session.description}</p>
                          {session.cid && (
                            <p className="text-xs text-gray-500 mt-1">
                              CID: {session.cid.slice(0, 12)}...{session.cid.slice(-8)}
                            </p>
                          )}
                          {session.isNew && (
                            <p className="text-xs text-amber-600 mt-1 font-medium">
                              🆕 New conversation detected!
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="memory-session-stats">
                        <p className="memory-session-count">
                          {session.sessions} session{session.sessions !== 1 ? 's' : ''}
                        </p>
                        <p className="memory-session-size">{session.memorySize}</p>
                      </div>
                    </div>
                    
                    <div className="memory-session-footer">
                      <div className="memory-session-meta">
                        <span className={`memory-status-badge ${session.status} ${session.isNew ? 'light-theme' : ''}`}>
                          {session.status}
                        </span>
                        <span>{session.conversations} conversation{session.conversations !== 1 ? 's' : ''}</span>
                        <span>Last: {session.lastActive}</span>
                      </div>
                      
                      {/* Transaction Status Display */}
                      <div className="transaction-status-container">
                        <TransactionStatusIndicator
                          cid={session.cid}
                          email={user?.primaryEmailAddress?.emailAddress || session.emails?.[0] || 'unknown@email.com'}
                          uuid={user?.id || `user_${Date.now()}`}
                          onStatusChange={(status) => {
                            setTransactionStatus(prev => ({
                              ...prev,
                              [session.id]: status
                            }));
                          }}
                        />
                      </div>
                      
                      {/* Management button - simplified since TransactionStatusIndicator handles AVAX storage */}
                      <button 
                        className="memory-manage-button"
                        onClick={() => console.log('Managing session:', session)}
                      >
                        <span className="text-sm">Manage</span>
                        <ArrowUpRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  );
                })}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="section-heading">My Private Vaults</h2>
                <button className="primary-button">
                  Create New Vault
                </button>
              </div>

              <div className="vault-showcase-grid">
                {myVaults.map((vault, index) => (
                  <div key={vault.id} className="vault-showcase-card">
                    <div className="vault-showcase-info">
                      <div className="flex items-center space-x-3 mb-4">
                        <div 
                          className={`memory-session-icon ${index === 0 ? 'lime' : ''}`}
                        >
                          <Database className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="memory-session-name">{vault.name}</h3>
                          <p className="memory-session-description">{vault.description}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm mb-4">
                        <div>
                          <p className="memory-session-size">{vault.size}</p>
                          <p className="memory-session-count">{vault.sessions} sessions</p>
                        </div>
                        <div className="text-right">
                          <p className="memory-session-time">{vault.lastUpdated}</p>
                          <p className="memory-session-meta">Last update</p>
                        </div>
                      </div>
                      
                      <button className="vault-access-button">
                        Access Vault
                      </button>
                    </div>
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

export default DashboardPrivateSection;