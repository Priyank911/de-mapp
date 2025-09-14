// src/pages/Documentation.jsx
import React from "react";

// Utility: shared inline styles for consistency
const sectionStyle = {
  padding: "4rem 2rem",
  maxWidth: "1000px",
  margin: "0 auto",
  lineHeight: "1.7",
};

const titleStyle = {
  fontSize: "2.2rem",
  fontWeight: "700",
  marginBottom: "1rem",
  color: "#111",
};

const subtitleStyle = {
  fontSize: "1.6rem",
  fontWeight: "600",
  marginTop: "2rem",
  marginBottom: "1rem",
  color: "#111",
};

const textStyle = {
  fontSize: "1rem",
  color: "#333",
};

const codeBlockStyle = {
  background: "#111",
  color: "#fff",
  padding: "1.2rem",
  borderRadius: "8px",
  margin: "1rem 0",
  fontFamily: "monospace",
  fontSize: "0.95rem",
  overflowX: "auto",
};

const cardStyle = {
  background: "#f9f9f9",
  border: "1px solid #e5e5e5",
  borderRadius: "10px",
  padding: "1.5rem",
  margin: "1rem 0",
};

const limeHighlight = { color: "#d7f25a", fontWeight: "600" };

// Floating nav (small curved buttons)
const floatingNavStyle = {
  position: "fixed",
  top: "20%",
  left: "1rem",
  display: "flex",
  flexDirection: "column",
  gap: "1rem",
  zIndex: "100",
};
const navButtonStyle = {
  background: "#d7f25a",
  color: "#111",
  padding: "0.7rem 1.4rem",
  borderRadius: "50px",
  fontWeight: "600",
  border: "none",
  cursor: "pointer",
  boxShadow: "0 4px 6px rgba(0,0,0,0.15)",
  transition: "all 0.2s ease",
};

export default function Documentation() {
  // Smooth scroll navigation
  const handleScroll = (id) => {
    const section = document.getElementById(id);
    if (section) {
      section.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <main style={{ background: "#fff" }}>
      {/* Floating Nav */}
      <div style={floatingNavStyle}>
        {[
          "overview",
          "quickstart",
          "architecture",
          "vaults",
          "sdk",
          "api-reference",
          "advanced-guides",
          "examples",
          "best-practices",
          "faqs",
        ].map((id) => (
          <button
            key={id}
            style={navButtonStyle}
            onClick={() => handleScroll(id)}
          >
            {id.replace("-", " ").replace(/\b\w/g, (c) => c.toUpperCase())}
          </button>
        ))}
      </div>

      {/* Hero */}
      <section style={{ ...sectionStyle, textAlign: "center", marginTop: "5rem" }}>
        <h1 style={{ fontSize: "2.8rem", fontWeight: "700" }}>
          De-MAPP <span style={limeHighlight}>Documentation</span>
        </h1>
        <p style={{ ...textStyle, fontSize: "1.2rem", marginTop: "1rem" }}>
          Everything you need to integrate persistent AI memory into your stack.  
          Learn about our architecture, SDKs, blockchain integration, and advanced workflows.
        </p>
      </section>

      {/* Overview */}
      <section id="overview" style={sectionStyle}>
        <h2 style={titleStyle}>Overview</h2>
        <p style={textStyle}>
          Today’s AI agents are powerful but forgetful. Once a session ends, context is lost.  
          Switching between agents requires manual copy-paste, breaking collaboration.  
          <br />
          <br />
          <span style={limeHighlight}>De-MAPP</span> introduces{" "}
          <b>MCX (Memory Context Exchange)</b> for AI-to-AI collaboration.  
          Memory persists via <b>Web3 Vaults</b>, distributed over <b>IPFS</b>,  
          and secured with <b>Avalanche blockchain logs</b>.
        </p>
      </section>

      {/* Quickstart */}
      <section id="quickstart" style={sectionStyle}>
        <h2 style={titleStyle}>Quickstart</h2>
        <p style={textStyle}>
          Install the SDK or call our REST API to persist AI memory in seconds.
        </p>

        <h3 style={subtitleStyle}>Installation</h3>
        <pre style={codeBlockStyle}>
{`# Using npm
npm install demapp-sdk

# Using yarn
yarn add demapp-sdk`}
        </pre>

        <h3 style={subtitleStyle}>cURL Example</h3>
        <pre style={codeBlockStyle}>
{`curl -X POST https://api.demapp.ai/v1/vaults/persist \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "sessionId": "abc123",
    "data": {
      "agent": "Copilot",
      "context": "Build summary of user notes",
      "memory": "saved securely"
    }
  }'`}
        </pre>

        <h3 style={subtitleStyle}>JavaScript Example</h3>
        <pre style={codeBlockStyle}>
{`import Demapp from "demapp-sdk";

const client = new Demapp({ apiKey: process.env.DEMAPP_KEY });

await client.sessions.persist({
  sessionId: "abc123",
  data: { agent: "Copilot", context: "Build summary of notes" },
});`}
        </pre>

        <h3 style={subtitleStyle}>Python Example</h3>
        <pre style={codeBlockStyle}>
{`from demapp_sdk import Demapp

client = Demapp(api_key="YOUR_KEY")

client.persist_memory(
  session_id="abc123",
  data={"agent": "Copilot", "context": "Research + save"}
)`}
        </pre>
      </section>

      {/* Architecture */}
      <section id="architecture" style={sectionStyle}>
        <h2 style={titleStyle}>Architecture</h2>
        <div style={cardStyle}>
          <h3 style={subtitleStyle}>Agent Layer</h3>
          <p style={textStyle}>
            Works with any LLM-based agent. Agents save/recall memory using{" "}
            <b>MCX</b>. Supports solo agents or multi-agent clusters.
          </p>
        </div>

        <div style={cardStyle}>
          <h3 style={subtitleStyle}>Vault Layer</h3>
          <p style={textStyle}>
            Stores context + summaries. Avalanche blockchain ensures ownership,  
            IPFS/Arweave handles large logs. Smart contracts store references and keys.
          </p>
        </div>

        <div style={cardStyle}>
          <h3 style={subtitleStyle}>Protocol Layer (MCX)</h3>
          <pre style={codeBlockStyle}>
{`save_memory(conversation)
recall_memory(session_id)
list_sessions()`}
          </pre>
          <p style={textStyle}>
            Handles wallet-based permissions, requiring Avalanche wallet connection + AVAX fees.
          </p>
        </div>
      </section>

      {/* Vault Types */}
      <section id="vaults" style={sectionStyle}>
        <h2 style={titleStyle}>Vault Types</h2>
        <div style={cardStyle}>
          <h3 style={subtitleStyle}>Public Vaults</h3>
          <p style={textStyle}>Accessible to anyone. Ideal for open datasets & research.</p>
        </div>
        <div style={cardStyle}>
          <h3 style={subtitleStyle}>Private Vaults</h3>
          <p style={textStyle}>Encrypted, owner-only access. Grant permissions selectively.</p>
        </div>
        <div style={cardStyle}>
          <h3 style={subtitleStyle}>Enterprise Vaults</h3>
          <p style={textStyle}>Shared across teams. Agents collaboratively build memory ecosystems.</p>
        </div>
      </section>

      {/* SDK Section */}
      <section id="sdk" style={sectionStyle}>
        <h2 style={titleStyle}>SDK for Developers</h2>
        <p style={textStyle}>
          The SDK provides high-level APIs to integrate MCX into your agents.
        </p>
        <pre style={codeBlockStyle}>
{`import Demapp from "demapp-sdk";

const client = new Demapp({ apiKey: process.env.KEY });

// Save
await client.memory.save({ sessionId: "dev1", notes: "agent state" });

// Recall
const mem = await client.memory.recall("dev1");
console.log(mem);`}
        </pre>
      </section>

      {/* API Reference */}
      <section id="api-reference" style={sectionStyle}>
        <h2 style={titleStyle}>API Reference</h2>
        <h3 style={subtitleStyle}>POST /vaults/persist</h3>
        <pre style={codeBlockStyle}>
{`Request:
{
  "sessionId": "abc123",
  "data": { "context": "notes" }
}

Response:
{ "status": "ok", "vault": "0xAVAX123..." }`}
        </pre>
      </section>

      {/* Advanced Guides */}
      <section id="advanced-guides" style={sectionStyle}>
        <h2 style={titleStyle}>Advanced Guides</h2>
        <h3 style={subtitleStyle}>Integrating Avalanche Wallet</h3>
        <pre style={codeBlockStyle}>
{`import { connectWallet } from "demapp-sdk/wallet";

const wallet = await connectWallet("avalanche");
console.log(wallet.address);`}
        </pre>
      </section>

      {/* Examples */}
      <section id="examples" style={sectionStyle}>
        <h2 style={titleStyle}>Examples</h2>
        <h3 style={subtitleStyle}>Cross-Agent Recall</h3>
        <pre style={codeBlockStyle}>
{`// Agent A saves memory
await client.memory.save({ sessionId: "a1", context: "draft code" });

// Agent B recalls memory
const mem = await client.memory.recall("a1");`}
        </pre>
      </section>

      {/* Best Practices */}
      <section id="best-practices" style={sectionStyle}>
        <h2 style={titleStyle}>Best Practices</h2>
        <div style={cardStyle}>
          <h3 style={subtitleStyle}>✅ Be Specific</h3>
          <p style={textStyle}>Always define context clearly before saving memory.</p>
        </div>
        <div style={cardStyle}>
          <h3 style={subtitleStyle}>❌ Avoid Overwrites</h3>
          <p style={textStyle}>Use unique sessionIds to prevent data loss.</p>
        </div>
      </section>

      {/* FAQs */}
      <section id="faqs" style={sectionStyle}>
        <h2 style={titleStyle}>FAQs</h2>
        <div style={cardStyle}>
          <h3 style={subtitleStyle}>Is memory encrypted?</h3>
          <p style={textStyle}>Yes, AES-256 encryption before persisting to IPFS/Avalanche.</p>
        </div>
        <div style={cardStyle}>
          <h3 style={subtitleStyle}>How do I pay for vault storage?</h3>
          <p style={textStyle}>Each operation requires a small AVAX fee.</p>
        </div>
      </section>
    </main>
  );
}