// src/services/fetchService.js
import { db } from '../firebase';
import { collection, addDoc, doc, updateDoc, getDocs, query, where, orderBy, serverTimestamp } from 'firebase/firestore';

class FetchService {
  constructor() {
    this.collectionName = 'fetchRequests';
  }

  // Generate unique fetch code
  generateFetchCode() {
    const prefix = 'FETCH';
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `${prefix}_${timestamp}_${random}`;
  }

  // Create a new fetch request in Firestore (or return existing one)
  async createFetchRequest(sessionData, userEmail) {
    try {
      // First, check if a fetch request already exists for this CID
      const existingRequest = await this.getFetchRequestByCID(sessionData.cid);
      
      if (existingRequest.success) {
        // Update the existing request with latest timestamp
        await updateDoc(doc(db, this.collectionName, existingRequest.data.id), {
          updatedAt: serverTimestamp(),
          lastAccessedAt: serverTimestamp(),
          accessCount: (existingRequest.data.accessCount || 0) + 1,
          // Update session data in case it has changed
          sessionData: {
            description: sessionData.description,
            memorySize: sessionData.memorySize,
            conversations: sessionData.conversations,
            lastActive: sessionData.lastActive
          }
        });

        console.log('✅ Existing fetch request found and updated:', {
          fetchCode: existingRequest.data.fetchCode,
          cid: sessionData.cid,
          accessCount: (existingRequest.data.accessCount || 0) + 1
        });

        return {
          success: true,
          fetchCode: existingRequest.data.fetchCode,
          requestId: existingRequest.data.id,
          data: existingRequest.data,
          isExisting: true
        };
      }

      // If no existing request found, create a new one
      const fetchCode = this.generateFetchCode();
      
      const fetchRequest = {
        fetchCode: fetchCode,
        fileName: sessionData.name,
        cid: sessionData.cid,
        userEmail: userEmail,
        status: 'pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        lastAccessedAt: serverTimestamp(),
        accessCount: 1,
        sessionData: {
          description: sessionData.description,
          memorySize: sessionData.memorySize,
          conversations: sessionData.conversations,
          lastActive: sessionData.lastActive
        }
      };

      const docRef = await addDoc(collection(db, this.collectionName), fetchRequest);
      
      console.log('✅ New fetch request created:', {
        id: docRef.id,
        fetchCode: fetchCode,
        fileName: sessionData.name,
        cid: sessionData.cid
      });

      return {
        success: true,
        fetchCode: fetchCode,
        requestId: docRef.id,
        data: fetchRequest,
        isExisting: false
      };
    } catch (error) {
      console.error('❌ Error creating/updating fetch request:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get fetch request by CID
  async getFetchRequestByCID(cid) {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('cid', '==', cid)
      );
      
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        return {
          success: false,
          error: 'No fetch request found for this CID'
        };
      }

      // Get the first (and should be only) document for this CID
      const doc = querySnapshot.docs[0];
      return {
        success: true,
        data: {
          id: doc.id,
          ...doc.data()
        }
      };
    } catch (error) {
      console.error('❌ Error getting fetch request by CID:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get fetch request by code
  async getFetchRequestByCode(fetchCode) {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('fetchCode', '==', fetchCode)
      );
      
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        return {
          success: false,
          error: 'Fetch code not found'
        };
      }

      const doc = querySnapshot.docs[0];
      return {
        success: true,
        data: {
          id: doc.id,
          ...doc.data()
        }
      };
    } catch (error) {
      console.error('❌ Error getting fetch request:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Update fetch request status
  async updateFetchStatus(requestId, status, additionalData = {}) {
    try {
      const docRef = doc(db, this.collectionName, requestId);
      
      await updateDoc(docRef, {
        status: status,
        updatedAt: serverTimestamp(),
        ...additionalData
      });

      return {
        success: true,
        message: `Status updated to ${status}`
      };
    } catch (error) {
      console.error('❌ Error updating fetch status:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get all fetch requests for a user
  async getUserFetchRequests(userEmail) {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('userEmail', '==', userEmail),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const requests = [];
      
      querySnapshot.forEach((doc) => {
        requests.push({
          id: doc.id,
          ...doc.data()
        });
      });

      return {
        success: true,
        data: requests
      };
    } catch (error) {
      console.error('❌ Error getting user fetch requests:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Copy text to clipboard
  async copyToClipboard(text) {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return { success: true };
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);
        
        return { success: successful };
      }
    } catch (error) {
      console.error('❌ Error copying to clipboard:', error);
      return { success: false, error: error.message };
    }
  }
}

export default new FetchService();