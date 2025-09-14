<div align="center">
  
# 🧠 De-MAPP
## Decentralized Multi-Agent Persistent Protocol

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Web3](https://img.shields.io/badge/Web3-Enabled-blue.svg)](https://web3.foundation/)
[![AVAX](https://img.shields.io/badge/Avalanche-Fuji%20Testnet-red.svg)](https://testnet.snowtrace.io/)
[![IPFS](https://img.shields.io/badge/IPFS-Decentralized-green.svg)](https://ipfs.io/)

*🌐 Your AI memory, truly decentralized and eternally persistent*

</div>

---

## 💡 The Vision

> **"What if your AI conversations never had to start from zero again?"**

In today's fragmented AI landscape, every interaction begins with a blank slate. ChatGPT doesn't remember your previous sessions, Claude can't recall your preferences from last week, and GitHub Copilot has no context about your project history across different workspaces.

**De-MAPP changes everything.**

We're building the world's first **decentralized memory protocol** that enables AI agents to share persistent, user-owned memory across any platform, application, or service.

---

## 🎯 Core Problems We Solve

### 🔄 **Memory Fragmentation**
Every AI tool operates in isolation, forcing users to repeatedly provide context and preferences.

### 🔒 **Data Ownership Crisis**  
Your conversations and memories are trapped in corporate silos, controlled by tech giants.

### 🚫 **Zero Interoperability**
No standardized way for AI agents to share context across different platforms and services.

### ⚡ **Context Loss**
Valuable insights and learning from AI interactions disappear into the void.

---

## �️ System Architecture

```mermaid
graph TB
    subgraph "User Layer"
        U[👤 User] --> W[🔐 Web3 Wallet]
        U --> CL[🔑 Clerk Auth]
    end

    subgraph "Frontend Layer"
        LP[🏠 Landing Page] --> D[📊 Dashboard]
        D --> PS[🌍 Public Section]
        D --> PR[🔒 Private Section]
        D --> E[🏢 Enterprise Section]
    end

    subgraph "Authentication & Identity"
        CL --> FS[🔥 Firestore]
        W --> SC[📋 Smart Contract]
        FS --> UUID[🆔 UUID Generation]
    end

    subgraph "Decentralized Storage"
        SC --> IPFS[🌐 IPFS Network]
        SC --> AR[📚 Arweave]
        IPFS --> LIT[🔐 Lit Protocol]
        AR --> LIT
    end

    subgraph "Blockchain Layer"
        SC --> AVAX[🏔️ Avalanche Fuji]
        AVAX --> VF[🗃️ Vault Factory]
        VF --> VM[💾 Memory Vaults]
    end

    subgraph "AI Integration"
        API[🤖 AI Agents API] --> GPT[💬 ChatGPT]
        API --> CLAUDE[🧠 Claude]
        API --> COPILOT[👨‍💻 GitHub Copilot]
        API --> GEMINI[💎 Gemini]
    end

    D --> API
    VM --> API
    LIT --> API

    style U fill:#e1f5fe
    style AVAX fill:#ff5722,color:#fff
    style IPFS fill:#65c5db,color:#fff
    style AR fill:#9c27b0,color:#fff
    style LIT fill:#4caf50,color:#fff
```

---

## ✨ Revolutionary Features

### 🧠 **Persistent AI Memory**
Your conversations, preferences, and context persist across all AI interactions, forever.

### 🔗 **Cross-Agent Recall**
One unified memory accessible by ChatGPT, Claude, Copilot, and any AI service you choose.

### � **True Decentralization**
Built on Avalanche blockchain with IPFS storage - no single point of failure.

### 👑 **Complete Data Ownership**
You control your data with Web3 wallet authentication and cryptographic keys.

### 🚀 **Seamless Integration**
Plugin ecosystem for VS Code, Chrome, and major AI platforms.

### 🔍 **Full Transparency**
Every memory interaction is auditable on the blockchain.

---

## �️ Technology Stack

<div align="center">

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Frontend** | React + TypeScript + Vite | Modern, type-safe UI development |
| **Styling** | Tailwind CSS | Utility-first responsive design |
| **Authentication** | Clerk + Google OAuth | Secure, scalable user management |
| **Database** | Firebase Firestore | Real-time NoSQL data storage |
| **Blockchain** | Avalanche (Fuji Testnet) | Smart contract deployment |
| **Storage** | IPFS + Arweave | Decentralized, permanent data storage |
| **Security** | Lit Protocol | Decentralized key management |
| **Identity** | Web3 Wallets | User-controlled authentication |

</div>

---

## 🔐 User Journey Flow

```mermaid
sequenceDiagram
    participant U as 👤 User
    participant LP as 🏠 Landing Page
    participant C as 🔑 Clerk Auth
    participant FS as 🔥 Firestore
    participant D as 📊 Dashboard
    participant W as 🔐 Wallet
    participant SC as 📋 Smart Contract
    participant IPFS as 🌐 IPFS

    U->>LP: Clicks "Explore Protocol"
    LP->>C: Initiates authentication
    C->>U: Google OAuth flow
    U->>C: Signs in with Google
    C->>FS: Stores user data + UUID
    
    Note over FS: User Record Created
    FS-->>FS: Generate UUID: 1ce60864-f5eb...
    
    C->>D: Redirect to /dashboard/:uuid
    D->>FS: Fetch user context
    FS-->>D: Return user data
    
    D->>U: Prompt wallet connection
    U->>W: Connect Web3 wallet
    W->>SC: Initialize user vault
    SC->>IPFS: Store encrypted memory
    
    Note over U,IPFS: Memory persistence activated! 🎉
```

---

## 📊 Dashboard Architecture

### 🎛️ **Navigation System**
- **Header**: Global controls, user profile, wallet status
- **Sidebar**: Quick access to all memory sections

### 🏗️ **Memory Sections**

#### 🌍 **Public Memory Vault**
- Shared knowledge and collaborative insights
- Community-driven AI training data
- Open-source memory contributions

#### 🔒 **Private Memory Vault**  
- Personal AI interaction history
- Private preferences and configurations
- Encrypted with your wallet keys

#### 🏢 **Enterprise Memory Vault**
- Organization-specific knowledge base
- Team collaboration memory
- Role-based access controls

### 📈 **Advanced Features** *(Coming Soon)*
- Interactive memory graph visualizations
- Comprehensive audit trails and analytics  
- Extensible plugin integration system

---

## ⚡ Competitive Advantage Matrix

<div align="center">

| **Capability** | **🧠 De-MAPP** | **🤖 ChatGPT** | **🧠 Claude** | **👨‍💻 Copilot** | **💎 Gemini** |
|:---|:---:|:---:|:---:|:---:|:---:|
| **Persistent Memory** | ✅ Permanent | ❌ Session-only | ❌ Session-only | ❌ Session-only | ❌ Session-only |
| **Decentralized Storage** | ✅ IPFS/Arweave | ❌ Centralized | ❌ Centralized | ❌ Centralized | ❌ Centralized |
| **User Data Ownership** | ✅ Web3 Wallet | ❌ Corporate | ❌ Corporate | ❌ Corporate | ❌ Corporate |
| **Cross-Platform Recall** | ✅ Universal | ❌ Isolated | ❌ Isolated | ❌ Isolated | ❌ Isolated |
| **Plugin Ecosystem** | ✅ Extensible | 🟡 Limited | 🟡 Limited | 🟡 Limited | 🟡 Limited |
| **Blockchain Auditability** | ✅ Transparent | ❌ Opaque | ❌ Opaque | ❌ Opaque | ❌ Opaque |
| **Interoperability** | ✅ Protocol-based | ❌ Proprietary | ❌ Proprietary | ❌ Proprietary | ❌ Proprietary |

</div>

---

## 🌍 Vision

De-MAPP is more than a dashboard. It’s an AI-native protocol that:
- Enables multi-agent collaboration
- Ensures memory ownership by users
- Creates a persistent intelligence layer for the AI economy

> Think of it as the *“file system for AI memory”* — open, decentralized, and portable.

---

## 📌 Roadmap

- ✅ Landing page + Clerk Auth
- ✅ Firestore UUID integration
- 🚧 Dashboard integration
- 🚧 Wallet + Avalanche contract linking
- 🔜 IPFS/Arweave storage
- 🔜 Lit Protocol key management
- 🔜 Plugins (VS Code, Chrome)

---

## 🤝 Contributing

We welcome contributions!  
Open issues, suggest features, or submit PRs to help build the future of decentralized AI memory.

---

## 📄 License

MIT

---

## 📬 Contact

For questions, reach out via [GitHub Issues](https://github.com/Priyank911/DEmapp/issues)

---

<p align="center"><b>De-MAPP = Your AI memory, decentralized.</b></p>