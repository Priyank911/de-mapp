// src/components/UserHandler.jsx
import { useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import { db } from "../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { v4 as uuidv4 } from "uuid";
import userProfileService from "../services/userProfileService";

export default function UserHandler() {
  const { isSignedIn, user } = useUser();

  useEffect(() => {
    const storeUser = async () => {
      if (!isSignedIn || !user) return;

      const email = user.primaryEmailAddress?.emailAddress;
      const clerkId = user.id;

      if (!email || !clerkId) return;

      try {
        // Check if user profile exists in new structure
        const existingProfile = await userProfileService.profileExists(email);
        let uuid;

        if (!existingProfile) {
          uuid = uuidv4();

          // Create profile in userProfiles collection
          const profileData = {
            email,
            uuid,
            userId: clerkId,
            displayName: user.fullName || null,
            createdAt: new Date().toISOString(),
            lastActive: new Date().toISOString(),
            status: 'active',
            profileVersion: '2.0'
          };

          await userProfileService.createUserProfile(profileData);
          console.log("✅ User profile stored in userProfiles collection:", { email, uuid });

          // Also keep basic data in users collection for backwards compatibility
          const userRef = doc(db, "users", clerkId);
          await setDoc(userRef, {
            email,
            uuid,
            createdAt: new Date().toISOString(),
          });

          localStorage.setItem("userUUID", uuid); // ✅ Save to local storage
          console.log("✅ Stored new user in both collections:", { email, uuid });
        } else {
          // Get UUID from existing profile
          const profile = await userProfileService.getUserProfile(email);
          uuid = profile.uuid;
          
          // Update last active
          await userProfileService.updateLastActive(email);
          
          localStorage.setItem("userUUID", uuid); // ✅ Save existing
          console.log("ℹ️ User profile already exists, updated last active:", { email, uuid });
        }
      } catch (err) {
        console.error("❌ User storage error:", err);
      }
    };

    storeUser();
  }, [isSignedIn, user]);

  return null;
}