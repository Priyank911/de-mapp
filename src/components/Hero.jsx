// src/components/Hero.jsx
import React, { useEffect } from "react";
import { SignInButton, useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { v4 as uuidv4 } from "uuid";
import userProfileService from "../services/userProfileService";

const Hero = () => {
  const { isSignedIn, user } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    const storeUserIfNew = async () => {
      if (isSignedIn && user) {
        const email = user.primaryEmailAddress?.emailAddress;
        if (!email) return;

        // Check if user profile already exists using new structure
        const existingProfile = await userProfileService.profileExists(email);
        let uuid;

        if (!existingProfile) {
          uuid = uuidv4();
          
          // Create basic profile data in userProfiles collection
          const profileData = {
            email,
            uuid,
            userId: email, // Using email as userId for consistency
            displayName: user.fullName || null,
            createdAt: new Date().toISOString(),
            lastActive: new Date().toISOString(),
            status: 'active',
            profileVersion: '2.0'
          };
          
          await userProfileService.createUserProfile(profileData);
          console.log("✅ User profile stored in userProfiles collection:", { email, uuid });
          
          // Also keep basic data in users collection for backwards compatibility
          const userRef = doc(db, "users", email);
          await setDoc(userRef, {
            email,
            uuid,
            createdAt: new Date().toISOString(),
          });
          console.log("✅ Basic user data stored in users collection for compatibility");
        } else {
          // Get UUID from existing profile
          const profile = await userProfileService.getUserProfile(email);
          uuid = profile.uuid;
          
          // Update last active
          await userProfileService.updateLastActive(email);
          console.log("ℹ️ User profile already exists, updated last active:", { email, uuid });
        }

        // ✅ Save UUID for later navigation
        localStorage.setItem("userUUID", uuid);

        // Redirect with UUID as query parameter
        navigate(`/dashboard?id=${uuid}`);
      }
    };

    storeUserIfNew();
  }, [isSignedIn, user, navigate]);

  return (
    <section className="hero">
      <div className="hero-content">
        <h1>
          Power Up with <span>Persistent Memory</span>
        </h1>
        <p>
          De-MAPP (Decentralized Multi-Agent Persistent Protocol) brings{" "}
          <strong>portable, Web3-native memory</strong> to your AI agents.
          Store conversations in secure vaults, recall them anywhere, and power
          truly connected intelligence.
        </p>

        {/* Clerk Sign-In Button */}
        {!isSignedIn && (
          <SignInButton mode="modal">
            <button className="cta-btn">Explore Protocol →</button>
          </SignInButton>
        )}
        {isSignedIn && (
          <button
            className="cta-btn"
            onClick={() => {
              const uuid = localStorage.getItem("userUUID");
              navigate(`/dashboard?id=${uuid}`);
            }}
          >
            Go to Dashboard →
          </button>
        )}
      </div>
    </section>
  );
};

export default Hero;