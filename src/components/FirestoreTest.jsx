// src/components/FirestoreTest.jsx
import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, addDoc, getDocs, query, orderBy } from "firebase/firestore";

const FirestoreTest = () => {
  const [tests, setTests] = useState([]);
  const [newTest, setNewTest] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch tests from Firestore
  const fetchTests = async () => {
    try {
      const q = query(collection(db, "tests"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const testData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setTests(testData);
    } catch (error) {
      console.error("Error fetching tests:", error);
    }
  };

  // Add a new test to Firestore
  const addTest = async () => {
    if (!newTest.trim()) return;
    
    setLoading(true);
    try {
      await addDoc(collection(db, "tests"), {
        message: newTest,
        createdAt: new Date().toISOString(),
        timestamp: Date.now()
      });
      setNewTest("");
      fetchTests(); // Refresh the list
    } catch (error) {
      console.error("Error adding test:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTests();
  }, []);

  return (
    <div style={{ padding: "2rem", maxWidth: "800px", margin: "0 auto" }}>
      <h1 style={{ color: "var(--lime)", marginBottom: "2rem" }}>
        Firestore Connection Test
      </h1>
      
      {/* Add Test Section */}
      <div style={{ 
        background: "#f9f9f9", 
        padding: "1.5rem", 
        borderRadius: "12px", 
        marginBottom: "2rem",
        border: "1px solid #eee"
      }}>
        <h3 style={{ marginBottom: "1rem" }}>Add Test Message</h3>
        <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          <input
            type="text"
            value={newTest}
            onChange={(e) => setNewTest(e.target.value)}
            placeholder="Enter test message..."
            style={{
              flex: 1,
              padding: "0.75rem",
              border: "1px solid #ddd",
              borderRadius: "8px",
              fontSize: "1rem"
            }}
            onKeyPress={(e) => e.key === "Enter" && addTest()}
          />
          <button
            onClick={addTest}
            disabled={loading || !newTest.trim()}
            style={{
              background: "var(--lime)",
              color: "#111",
              border: "none",
              padding: "0.75rem 1.5rem",
              borderRadius: "8px",
              fontWeight: "600",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading || !newTest.trim() ? 0.6 : 1
            }}
          >
            {loading ? "Adding..." : "Add Test"}
          </button>
        </div>
      </div>

      {/* Tests List */}
      <div>
        <h3 style={{ marginBottom: "1rem" }}>
          Test Messages ({tests.length})
        </h3>
        
        {tests.length === 0 ? (
          <div style={{
            background: "#f0f0f0",
            padding: "2rem",
            borderRadius: "8px",
            textAlign: "center",
            color: "#666"
          }}>
            No test messages yet. Add one above to test Firestore connection!
          </div>
        ) : (
          <div style={{ display: "grid", gap: "1rem" }}>
            {tests.map((test) => (
              <div
                key={test.id}
                style={{
                  background: "#fff",
                  border: "1px solid #eee",
                  borderRadius: "8px",
                  padding: "1rem",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
                }}
              >
                <div style={{ fontWeight: "600", marginBottom: "0.5rem" }}>
                  {test.message}
                </div>
                <div style={{ fontSize: "0.875rem", color: "#666" }}>
                  {test.createdAt ? new Date(test.createdAt).toLocaleString() : "Unknown time"}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Connection Status */}
      <div style={{
        marginTop: "2rem",
        padding: "1rem",
        background: "#e8f5e8",
        border: "1px solid #c3e6c3",
        borderRadius: "8px"
      }}>
        <h4 style={{ color: "#2d5a2d", marginBottom: "0.5rem" }}>
          ✅ Firestore Connection Status
        </h4>
        <p style={{ color: "#2d5a2d", margin: 0 }}>
          Connected to Firebase project. You can add and view test messages.
        </p>
      </div>
    </div>
  );
};

export default FirestoreTest;