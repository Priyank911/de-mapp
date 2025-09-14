// src/components/Hero.jsx
import React, { useEffect } from "react";
import { SignInButton, useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { v4 as uuidv4 } from "uuid";

const Hero = () => {
  const { isSignedIn, user } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    const storeUserIfNew = async () => {
      if (isSignedIn && user) {
        const email = user.primaryEmailAddress?.emailAddress;
        if (!email) return;

        const userRef = doc(db, "users", email);
        const snapshot = await getDoc(userRef);
        let uuid;

        if (!snapshot.exists()) {
          uuid = uuidv4();
          await setDoc(userRef, {
            email,
            uuid,
            createdAt: new Date().toISOString(),
          });
          console.log("✅ User stored:", { email, uuid });
        } else {
          uuid = snapshot.data().uuid;
          console.log("ℹ️ User already exists:", { email, uuid });
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