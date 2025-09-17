// User Profile Service - Clean email/profile data only
import { db } from '../firebase';
import { collection, doc, addDoc, getDoc, getDocs, setDoc, updateDoc, query, where, orderBy } from 'firebase/firestore';

class UserProfileService {
  constructor() {
    this.collectionName = 'userProfiles'; // NEW: Dedicated collection for profiles
  }

  // Create or update user profile (basic info only)
  async createUserProfile(profileData) {
    try {
      console.log('👤 Creating user profile:', profileData);
      
      const sanitizedData = {
        // Core profile info only
        email: profileData.email,
        uuid: profileData.uuid,
        userId: profileData.userId,
        displayName: profileData.displayName || null,
        
        // Timestamps
        createdAt: profileData.createdAt || new Date().toISOString(),
        lastActive: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        
        // Status
        status: 'active',
        profileVersion: '1.0'
      };

      // Use email as document ID for easy lookup
      const profileRef = doc(db, this.collectionName, profileData.email);
      await setDoc(profileRef, sanitizedData);
      
      console.log('✅ User profile created:', profileData.email);
      return { success: true, profileId: profileData.email, ...sanitizedData };
      
    } catch (error) {
      console.error('❌ Failed to create user profile:', error);
      throw error;
    }
  }

  // Get user profile by email
  async getUserProfile(email) {
    try {
      console.log(`🔍 Fetching profile for: ${email}`);
      
      const profileRef = doc(db, this.collectionName, email);
      const profileDoc = await getDoc(profileRef);
      
      if (profileDoc.exists()) {
        const profile = { id: profileDoc.id, ...profileDoc.data() };
        console.log('✅ Profile found:', profile);
        return profile;
      }
      
      console.log('❌ Profile not found');
      return null;
      
    } catch (error) {
      console.error('❌ Failed to get user profile:', error);
      throw error;
    }
  }

  // Get user profile by UUID
  async getUserProfileByUuid(uuid) {
    try {
      console.log(`🔍 Searching profile by UUID: ${uuid}`);
      
      const q = query(
        collection(db, this.collectionName),
        where('uuid', '==', uuid)
      );
      
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        const profile = { id: doc.id, ...doc.data() };
        console.log('✅ Profile found by UUID:', profile);
        return profile;
      }
      
      console.log('❌ Profile not found by UUID');
      return null;
      
    } catch (error) {
      console.error('❌ Failed to get profile by UUID:', error);
      throw error;
    }
  }

  // Update user profile
  async updateUserProfile(email, updates) {
    try {
      console.log(`🔄 Updating profile for: ${email}`, updates);
      
      const profileRef = doc(db, this.collectionName, email);
      const updateData = {
        ...updates,
        lastActive: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      await updateDoc(profileRef, updateData);
      
      console.log('✅ Profile updated successfully');
      return { success: true };
      
    } catch (error) {
      console.error('❌ Failed to update user profile:', error);
      throw error;
    }
  }

  // Update last active timestamp
  async updateLastActive(email) {
    try {
      const profileRef = doc(db, this.collectionName, email);
      await updateDoc(profileRef, {
        lastActive: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      
      return { success: true };
      
    } catch (error) {
      console.error('❌ Failed to update last active:', error);
      return { success: false };
    }
  }

  // Get all active user profiles
  async getAllActiveProfiles() {
    try {
      console.log('📋 Fetching all active user profiles');
      
      const q = query(
        collection(db, this.collectionName),
        where('status', '==', 'active'),
        orderBy('lastActive', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const profiles = [];
      
      querySnapshot.forEach((doc) => {
        profiles.push({ id: doc.id, ...doc.data() });
      });
      
      console.log(`✅ Found ${profiles.length} active profiles`);
      return profiles;
      
    } catch (error) {
      console.error('❌ Failed to get all profiles:', error);
      throw error;
    }
  }

  // Check if profile exists
  async profileExists(email) {
    try {
      const profileRef = doc(db, this.collectionName, email);
      const profileDoc = await getDoc(profileRef);
      return profileDoc.exists();
    } catch (error) {
      console.error('❌ Failed to check profile existence:', error);
      return false;
    }
  }

  // Deactivate profile (soft delete)
  async deactivateProfile(email) {
    try {
      console.log(`🔒 Deactivating profile: ${email}`);
      
      const profileRef = doc(db, this.collectionName, email);
      await updateDoc(profileRef, {
        status: 'inactive',
        deactivatedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      
      console.log('✅ Profile deactivated');
      return { success: true };
      
    } catch (error) {
      console.error('❌ Failed to deactivate profile:', error);
      throw error;
    }
  }
}

// Export singleton instance
const userProfileService = new UserProfileService();
export default userProfileService;