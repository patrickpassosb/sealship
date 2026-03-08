# Sealship MVP Roadmap 🦭🚢

This document outlines the strategic path from a technical prototype to a market-ready **Decentralized Developer Reputation System**.

---

## Phase 1: Core Infrastructure (Complete ✅)
- [x] **Database Migration**: Shifted from SQLite to Supabase for cloud scalability.
- [x] **Production Hosting**: Successful deployment to Vercel with CI/CD.
- [x] **Scoring Engine**: Implemented deterministic repository analysis logic.
- [x] **AI Integration**: Mistral-powered analysis reports (Ready for keys).

---

## Phase 2: Web3 & On-Chain Trust (Current ⚡)
**Goal**: Move from "local scores" to "verifiable trust."

### 1. Smart Contract Deployment
- **Deployment**: Launch `Sealship.sol` on Polkadot Hub TestNet.
- **Verification**: Ensure the contract is indexed on Blockscout.
- **Gas Management**: Setup a dedicated developer wallet with PAS tokens.

### 2. Frontend Integration
- **Wagmi Config**: Update `config.ts` with the live contract address.
- **Verification UI**: Enable the "Seal on Polkadot Hub" button.
- **Transaction Feedback**: Show real-time mining status and Explorer links to the user.

---

## Phase 3: Premium UI/UX & Identity
**Goal**: Create a "WOW" factor and verify user ownership.

### 1. "Dark Ocean" Aesthetic
- **Visual Language**: Implement a deep navy/cyan color palette with "Glassmorphism" effects.
- **Micro-Animations**: Add subtle wave patterns and hover glows to cards.
- **Typography**: Switch to high-end fonts (e.g., *Inter* for UI, *JetBrains Mono* for data).

### 2. Supabase Authentication (GitHub)
- **Verified Ownership**: Users must Login via GitHub to "Seal" a repository.
- **User Profiles**: Create a ` /profile` page showing a user's total "On-Chain Rep" and history.
- **Leaderboard 2.0**: Show the developer's avatar next to their scores.

---

## Phase 4: Quality Assurance & Testing
**Goal**: Zero-bug consistency and regression prevention.

### 1. Playwright E2E Testing
- **User Flow Testing**: Automate the process of:
    1. Landing on the home page.
    2. Entering a GitHub URL.
    3. Waiting for AI analysis completion.
    4. Connecting a wallet and simulating a transaction.
- **Cross-Browser Verification**: Ensure layout parity on Chrome, Firefox, and Safari.

### 2. Smart Contract Unit Tests
- **Hardhat/Chai**: Test the Solidity logic for edge cases (0 score, duplicate hashes, empty CIDs).

---

## Phase 5: Market Readiness
- [ ] **IPFS Persistence**: Move from "Mock IPFS" to real Pinata storage.
- [ ] **SEO Optimization**: Professional Meta tags and Social Share previews.
- [ ] **Mainnet Prep**: Audit gas costs and prepare for Polkadot Hub Mainnet.
