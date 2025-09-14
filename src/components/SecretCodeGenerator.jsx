import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import walletService from '../services/walletService';

const SecretCodeGenerator = () => {
  const { user } = useUser();
  const [secretCode, setSecretCode] = useState('');
  const [isRevealed, setIsRevealed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasExistingSecret, setHasExistingSecret] = useState(false);

  // Auto-generate secret key when component mounts (but keep hidden)
  useEffect(() => {
    const autoGenerateSecret = async () => {
      if (!user || !user.primaryEmailAddress?.emailAddress) return;
      
      try {
        // Clean up any incorrect structure first
        await walletService.cleanupIncorrectSecretKeyStructure(user.id);
        
        // Check if secret key already exists
        const existingSecret = await walletService.getSecretKey(
          user.id, 
          user.primaryEmailAddress.emailAddress
        );
        
        if (existingSecret) {
          // Secret already exists
          setSecretCode(existingSecret);
          setHasExistingSecret(true);
          console.log('🔐 Existing secret key found');
        } else {
          // Auto-generate new secret key (but keep it hidden)
          console.log('🔐 Auto-generating new secret key...');
          const newSecret = await walletService.generateAndStoreSecretKey(
            user.id,
            user.primaryEmailAddress.emailAddress
          );
          setSecretCode(newSecret);
          setHasExistingSecret(true);
          console.log('🔐 Secret key auto-generated and stored');
        }
      } catch (error) {
        console.error('Error auto-generating secret:', error);
      }
    };

    autoGenerateSecret();
  }, [user]);

  const handleRevealSecret = async () => {
    if (!user || !user.primaryEmailAddress?.emailAddress) {
      alert('Please ensure you are logged in');
      return;
    }

    if (isRevealed) {
      // Hide the secret
      setIsRevealed(false);
      return;
    }

    // Since secret is auto-generated on load, just reveal it
    if (secretCode) {
      setIsRevealed(true);
    } else {
      // Fallback: if somehow secret doesn't exist, generate it
      try {
        setIsLoading(true);
        const newSecret = await walletService.generateAndStoreSecretKey(
          user.id,
          user.primaryEmailAddress.emailAddress
        );
        setSecretCode(newSecret);
        setHasExistingSecret(true);
        setIsRevealed(true);
      } catch (error) {
        console.error('Error generating secret:', error);
        alert('Failed to generate secret key. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <button
      onClick={handleRevealSecret}
      disabled={isLoading}
      style={{
        background: "transparent",
        color: "var(--text-primary)",
        padding: "0.875rem 1rem",
        borderRadius: "var(--radius-lg)",
        border: "1px solid var(--lime)",
        fontSize: "0.875rem",
        fontWeight: "500",
        cursor: isLoading ? "not-allowed" : "pointer",
        transition: "all 0.2s",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "0.5rem",
        width: "100%",
        opacity: isLoading ? 0.6 : 1
      }}
      onMouseOver={(e) => {
        if (!isLoading) {
          e.target.style.background = "rgba(215, 242, 90, 0.1)";
          e.target.style.borderColor = "var(--lime)";
          e.target.style.transform = "translateY(-1px)";
        }
      }}
      onMouseOut={(e) => {
        if (!isLoading) {
          e.target.style.background = "transparent";
          e.target.style.borderColor = "var(--lime)";
          e.target.style.transform = "translateY(0)";
        }
      }}
    >
      <svg 
        style={{ width: "1rem", height: "1rem" }} 
        fill="currentColor" 
        viewBox="0 0 20 20"
      >
        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 616 0z" clipRule="evenodd" />
      </svg>
      
      {isLoading ? (
        <span>Loading...</span>
      ) : isRevealed ? (
        <span style={{ fontFamily: "monospace", fontSize: "1.1rem", fontWeight: "bold", color: "#8b5cf6" }}>
          {secretCode}
        </span>
      ) : (
        <span>
          Secret Key {hasExistingSecret ? 'Reveal' : 'Generate'}
        </span>
      )}
    </button>
  );
};

export default SecretCodeGenerator;