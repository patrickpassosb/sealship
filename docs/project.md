# Sealship — Decentralized Developer Identity & Code Reputation System

### Polkadot Solidity Hackathon Project

---

# 1. Project Background

This project is being developed as a submission to the **Polkadot Solidity Hackathon 2026**.

The objective of this hackathon is to encourage developers to build innovative applications using **Solidity smart contracts deployed on Polkadot Hub**.

Participants are expected to demonstrate:

* meaningful real-world applications
* integration with blockchain infrastructure
* working prototypes
* creative use of Web3 technologies

The project described in this document is designed specifically to align with these goals.

The system integrates:

* artificial intelligence
* GitHub repository analysis
* decentralized storage (IPFS)
* blockchain verification (Polkadot Hub)

The core idea is to create a **decentralized developer identity and reputation layer for the Polkadot ecosystem**.

---

# 2. Problem Statement

Open-source software repositories are widely used to evaluate developer skill and project quality. However, there is currently no standardized, verifiable system that can objectively evaluate the quality of a repository.

Today, developers are evaluated through signals such as:

* GitHub stars
* follower counts
* manual code review
* subjective recruiter judgments

These signals are incomplete and often unreliable.

Furthermore, repository evaluations can be manipulated or misrepresented.

There is no system that provides:

* standardized repository analysis
* reproducible scoring
* immutable verification of results
* decentralized developer identity

This project aims to address this problem.

---

# 3. Project Overview

**Sealship** analyzes a GitHub repository and produces a structured quality score based on observable software engineering signals.

The system then generates an AI-powered report explaining the analysis.

This report is stored in decentralized storage (IPFS via Pinata), and a cryptographic reference to the report is recorded on-chain on Polkadot Hub.

The blockchain transaction serves as **verifiable proof that the repository analysis existed at a specific moment and has not been modified**.

Developers can build a **decentralized reputation** by having their repositories analyzed, scored, and verified on-chain — creating a trust layer that other dApps in the Polkadot ecosystem can query.

---

# 4. Core Idea

The system performs the following process:

1. A user submits a GitHub repository URL.
2. The system retrieves repository metadata and file structure.
3. Deterministic metrics are extracted from the repository.
4. A scoring algorithm evaluates repository quality.
5. AI generates an explanation of the results.
6. The report is stored in decentralized storage (IPFS).
7. The report hash is recorded on-chain on Polkadot Hub.

This produces a **verifiable record of developer reputation and code quality**.

---

# 5. Project Name

The project name is:

**Sealship** 🦭🚢

The name carries multiple layers of meaning:

* **Seal** 🦭 — The ocean animal (mascot and visual theme)
* **Seal** 🔏 — A seal of approval for code quality
* **Ship** 🚀 — Developer culture of "shipping" products
* **Ship** 🚢 — Ocean/nautical journey theme
* **-ship** — Like "relationship" / "membership" — community & trust

Tagline: *"Seal your code. Ship your trust."*

---

# 6. Hackathon Idea Alignment

This project is built on hackathon idea **#1560121 — Decentralized Identity and Reputation System**:

> "A dApp that provides a decentralized identity and reputation system for users across the Polkadot ecosystem. It uses on-chain activities and interactions to build a trust score that can be leveraged in DeFi, governance, and other community-driven activities."

Sealship satisfies this by:

| Requirement | How Sealship Delivers |
|-------------|----------------------|
| Decentralized identity | GitHub profile → wallet → verified developer identity |
| Reputation system | Deterministic scoring + AI analysis = code reputation |
| On-chain activities | Smart contract records scores, queryable history |
| Trust score | 0-100 score across 5 categories, sealed on-chain |
| DeFi/governance leverage | Other dApps can query developer reputation on-chain |

---

# 7. System Workflow

## Step 1 — Repository Submission

The user provides a repository URL.

Example:

```
https://github.com/user/project
```

The system extracts:

* repository owner
* repository name
* default branch

---

## Step 2 — Repository Data Retrieval

The system retrieves repository information using the **GitHub API**.

Data collected includes:

* repository metadata
* commit SHA of the latest commit
* file tree structure
* language statistics
* presence of documentation files
* presence of test directories
* project configuration files

The commit SHA uniquely identifies the repository version being analyzed.

---

## Step 3 — Repository Hashing

The repository version is uniquely identified using a cryptographic hash.

```
repoHash = keccak256(repoURL + commitSHA)
```

This ensures that the score corresponds to a specific snapshot of the repository.

---

## Step 4 — Metric Extraction

The system analyzes repository structure to extract deterministic signals.

Documentation signals:
* README presence and length
* Installation instructions
* Usage examples

Testing signals:
* Test directory presence
* Test file patterns
* Detected testing frameworks

Architecture signals:
* Modular directory structure
* Separation of concerns
* Number of modules

Project hygiene signals:
* LICENSE file
* .gitignore
* CONTRIBUTING.md
* CODE_OF_CONDUCT.md

Security signals:
* Dependency lock files
* Environment configuration
* Security documentation

---

# 8. Deterministic Scoring Model

| Category           | Weight |
| ------------------ | ------ |
| Documentation      | 20     |
| Testing            | 20     |
| Architecture       | 20     |
| Project hygiene    | 20     |
| Security practices | 20     |

Total score: **0 – 100**

The same repository version always produces the same score.

---

# 9. AI Analysis Layer

AI generates a natural-language explanation of the score using a generic OpenAI-compatible interface supporting multiple providers (Mistral, Cerebras, OpenRouter, Grok, etc.).

The AI is used for explanation and recommendations, not primary scoring.

---

# 10. Decentralized Storage

Reports are stored using **IPFS** via **Pinata** (free tier).

Each stored file receives a **Content Identifier (CID)** — a cryptographic hash guaranteeing integrity.

---

# 11. Blockchain Verification

After generating the report, the system records the result on-chain on **Polkadot Hub**.

The smart contract records:

* repository hash
* repository score
* IPFS CID
* submitter address
* timestamp
* repository URL

---

# 12. Blockchain Network

**Polkadot Hub TestNet**

```
Network:     Polkadot Hub TestNet
Token:       PAS (free from faucet)
Chain ID:    420420417
RPC:         https://eth-rpc-testnet.polkadot.io/
Explorer:    https://blockscout-testnet.polkadot.io/
Faucet:      https://faucet.polkadot.io/
```

---

# 13. Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js, React, TypeScript |
| Wallet | wagmi, viem |
| Backend | Next.js API routes |
| Smart Contracts | Solidity, Hardhat |
| Database | Supabase (PostgreSQL) |
| Cache | In-memory Map (Redis-ready interface) |
| Decentralized Storage | IPFS via Pinata |
| AI | Generic OpenAI-compatible interface |
| Testing | Vitest, Hardhat/Chai, Playwright |

---

# 14. Design Theme

**Ocean / Seal Theme** with Polkadot brand colors:

* Deep ocean blues + Polkadot pink accents + seafoam greens
* Seal mascot 🦭
* Wave animations and water effects
* Dark mode + Light mode with theme toggle
* Depth-based scoring visualizations

---

# 15. Development Milestones

1. **Repository Scoring Engine** — GitHub API + metric extraction + deterministic scoring
2. **AI Explanation Layer** — Generic LLM provider + natural language analysis
3. **IPFS Storage** — Pinata integration + report upload
4. **Blockchain Verification** — Smart contract + wallet integration + on-chain recording
5. **Leaderboard + Polish** — Public rankings + animations + E2E tests

---

# 16. Vision

The long-term vision of Sealship is to create a **verifiable trust layer for open-source developers** in the Polkadot ecosystem.

Developers can:

* Have repositories automatically analyzed
* Build a cryptographically verified reputation
* Share publicly auditable code quality scores
* Be trusted by other dApps through on-chain reputation queries

*Seal your code. Ship your trust.* 🦭🚢
