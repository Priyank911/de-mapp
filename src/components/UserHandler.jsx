// src/components/UserHandler.jsx
import { useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import { db } from "../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { v4 as uuidv4 } from "uuid";

export default function UserHandler() {
  const { isSignedIn, user } = useUser();

  useEffect(() => {
    const storeUser = async () => {
      if (!isSignedIn || !user) return;

      const email = user.primaryEmailAddress?.emailAddress;
      const clerkId = user.id;

      if (!email || !clerkId) return;

      try {
        const userRef = doc(db, "users", clerkId);
        const snap = await getDoc(userRef);

        if (!snap.exists()) {
          const newUuid = uuidv4();

          await setDoc(userRef, {
            email,
            uuid: newUuid,
            createdAt: new Date().toISOString(),
          });

          localStorage.setItem("userUUID", newUuid); // ✅ Save to local storage
          console.log("✅ Stored new user:", { email, uuid: newUuid });
        } else {
          const existingUuid = snap.data().uuid;
          localStorage.setItem("userUUID", existingUuid); // ✅ Save existing
          console.log("ℹ️ User already exists in Firestore");
        }
      } catch (err) {
        console.error("❌ Firestore error:", err);
      }
    };

    storeUser();
  }, [isSignedIn, user]);

  return null;
}