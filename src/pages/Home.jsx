import React from "react";
import Hero from "../components/Hero";
import "../index.css";

const Home = () => {
  return (
    <main className="home">
      {/* HERO */}
      <Hero />

      {/* SMART TECH */}
      <section className="section smart-tech container">
        <div className="section-header">
          <h2 className="display">
            Smart Memory <br /><span>Faster Recall</span>
          </h2>
          <p className="lede">
            De-MAPP powers persistent, portable memory for AI agents — giving
            your tools long-term context that moves with you.
          </p>
          <a className="pill-btn" href="#about">About Us <span>➜</span></a>
        </div>

        <div className="stats-grid">
          <article className="stat-card stat-a">
            <div className="stat-value">+50%</div>
            <div className="stat-label">Agent Memory Adoption</div>
          </article>
          <article className="stat-card stat-b">
            <div className="stat-value">+16,211</div>
            <div className="stat-label">Sessions Persisted in Vaults</div>
          </article>
        </div>
      </section>

      {/* SUSTAINABILITY */}
      <section className="section sustainability container">
        <article className="sustain-hero">
          <img src="/pmgimg.png" alt="Persistent Memory Visual" />
          <div className="sustain-overlay">
            <h3>PERSISTENT MEMORY GOAL</h3>
            <p>
              Aiming for a fully decentralized, user-owned memory network for a cleaner,
              more ethical AI ecosystem.
            </p>
          </div>
        </article>

        <aside className="sustain-card">
          <h3>POWERED BY: MCX</h3>
          <p>
            We commit to transparent, privacy-first AI memory that is portable across
            tools and protected by Web3.
          </p>
        </aside>
      </section>

      {/* TECHNOLOGIES */}
      <section className="section charging-tech container" id="tech">
        <div className="section-header">
          <h2 className="display">
            Agent Technologies <br />
            <span>Built for Tomorrow’s</span>
          </h2>
          <p className="lede">
            Explore our developer-friendly products built for speed, safety and
            seamless multi-agent collaboration via MCX.
          </p>
        </div>

        <ul className="tech-list">
          <li className="tech-item">
            <h4>VaultSync</h4>
            <p>Seamless persistence for any LLM/agent.</p>
          </li>
          <li className="tech-item">
            <h4>FlexRecall</h4>
            <p>Granular recall by session or full history.</p>
          </li>
          <li className="tech-item">
            <h4>PowerHub</h4>
            <p>High-throughput persistence for agent clusters.</p>
          </li>
        </ul>

        <figure className="tech-figure">
          <img src="/product_showcase.png" alt="Product showcase" />
        </figure>
      </section>

      {/* FUTURE */}
      <section className="section future container">
        <h2 className="display">
          AI Agents: <span>Sustainable Future</span>
        </h2>
        <p className="lede">
          De-MAPP blends cutting-edge AI orchestration with a sustainability-first
          mindset to deliver fast, portable and privacy-preserving memory.
        </p>

        <ul className="feature-list">
          <li>Smart Persistence for Any Agent</li>
          <li>Fast & Reliable Memory Recall</li>
          <li>Encrypted, User-Owned Vaults on Avalanche</li>
        </ul>
      </section>

      {/* MCX */}
      <section className="section mcx container dark-section">
        <h2 className="display">What is <span>MCX?</span></h2>
        <div className="mcx-grid">
          <div className="mcx-copy">
            <p className="lede light-text">
              MCX (Memory Context Exchange) manages how contextual memory is synchronized,
              updated, and reused across agents. It ensures workflows never lose context
              whether you’re in Copilot, Cursor or ChatGPT.
            </p>
            <ul className="mcx-points light-text">
              <li>Decouples memory logic from raw storage (MTP)</li>
              <li>Enables shared memory across agents</li>
              <li>Supports version control & context reuse</li>
            </ul>
          </div>
          <div className="mcx-flowcard lime-bg">
            <h4 className="dark-text">Lifecycle Flow</h4>
            <ol className="mcx-steps">
              <li>Check thread (.mtp_context.json)</li>
              <li>Fetch from IPFS</li>
              <li>Append new slice</li>
              <li>Re-commit → CID</li>
              <li>Update vault</li>
            </ol>
          </div>
        </div>
      </section>

      {/* COMPARISON */}
      <section className="section comparison container">
        <h2 className="display">Comparison: <span>AI Memory Systems</span></h2>
        <p className="lede">How De-MAPP stacks up vs. popular tools.</p>

        <div className="compare-grid">
          <div className="compare-card danger">
            <h4>Persistent Memory</h4>
            <ul>
              <li>Copilot ✖</li>
              <li>ChatGPT: Limited</li>
              <li>LangChain: Limited</li>
              <li><strong className="highlight">De-MAPP: Web3 Vaults</strong></li>
            </ul>
          </div>
          <div className="compare-card warning">
            <h4>Cross-Agent Portability</h4>
            <ul>
              <li>Copilot ✖</li>
              <li>ChatGPT ✖</li>
              <li>LangChain: Partial</li>
              <li><strong className="highlight">De-MAPP: Native MCX</strong></li>
            </ul>
          </div>
          <div className="compare-card danger">
            <h4>Web3 Ownership</h4>
            <ul>
              <li>Copilot ✖</li>
              <li>ChatGPT ✖</li>
              <li>LangChain ✖</li>
              <li><strong className="highlight">De-MAPP: Avalanche Wallet</strong></li>
            </ul>
          </div>
          <div className="compare-card success">
            <h4>Granular Recall</h4>
            <ul>
              <li>Copilot ✖</li>
              <li>ChatGPT: Limited</li>
              <li>LangChain: Limited</li>
              <li><strong className="highlight">De-MAPP: Slice / Session</strong></li>
            </ul>
          </div>
        </div>
      </section>

      {/* FAQ (always last) */}
      <section className="section faq container">
        <div className="faq-title">
          <h2 className="display">
            De-MAPP Basics: <span>FAQs</span>
          </h2>
          <p className="lede">
            Find quick answers about persistent memory, MCX and how agents use it.
          </p>
        </div>

        <div className="faq-list">
          <details>
            <summary>What makes De-MAPP different from cloud AI?</summary>
            <p>
              You own your memory. De-MAPP stores encrypted sessions in Web3
              vaults, portable across agents and tools.
            </p>
          </details>
          <details>
            <summary>Can I use De-MAPP with multiple agents?</summary>
            <p>
              Yes. Any MCX-aware agent can save, list and recall sessions from the same vault.
            </p>
          </details>
          <details>
            <summary>How secure is my data?</summary>
            <p>
              All sessions are end-to-end encrypted; access is gated by your Avalanche wallet.
            </p>
          </details>
          <details>
            <summary>Do I pay per operation?</summary>
            <p>
              Vault operations use small AVAX fees; batching is supported for bulk writes.
            </p>
          </details>
        </div>
      </section>
    </main>
  );
};

export default Home;