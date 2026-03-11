# Sealship: Protocol & UI/UX Specification
**Version:** 1.0.0
**Status:** Strategic Blueprint
**Inspired by:** Uniswap Labs & Uniswap Protocol

---

## 1. Vision & Identity
**Tagline:** *"Seal your code. Ship your trust."* 🦭🚢

Sealship is a **Decentralized Developer Identity & Code Reputation System**. It transforms the "black box" of GitHub code into a **Verifiable On-Chain Asset**.

### The Uniswap Analogy
| Feature | Uniswap (DeFi) | Sealship (Reputation) |
| :--- | :--- | :--- |
| **The Protocol** | On-chain AMM math ($x*y=k$) | On-chain Scoring Math (Deterministic Engine) |
| **The Gateway** | Uniswap Labs Website/App | Sealship Frontend (Next.js) |
| **The Goal** | Permissionless Swapping | Permissionless Trust/Reputation |
| **The Trust** | Non-custodial code | Cryptographic proof of quality |

---

## 2. The Protocol Architecture (The "Math")
To achieve Uniswap-level credibility, Sealship follows **"Approach B"**:

### A. The Deterministic Ground Truth (On-Chain)
The 0-100 score is calculated via a transparent, mathematical engine. No "AI black box" determines the on-chain number.
*   **Categories (20 pts each):**
    1.  **Documentation:** README presence, length, installation guides, badges.
    2.  **Testing:** Test directories, file counts, frameworks, CI configs.
    3.  **Architecture:** Modularity, separation of concerns, config file presence.
    4.  **Project Hygiene:** LICENSE, .gitignore, CONTRIBUTING, Code of Conduct.
    5.  **Security:** Lock files, .env handling, SECURITY.md, dependency audits.
*   **Rule:** The same repository commit SHA + the same scoring engine = **The exact same score, every time.**

### B. The AI Interpretation (Off-Chain/IPFS)
The AI acts as the **"Captain's Report."**
*   It generates a natural language explanation of the mathematical score.
*   It provides actionable advice on how to improve the code.
*   This report is stored on **IPFS** (permanent) and linked to the on-chain score via its CID (Content ID).

---

## 3. UI/UX Specification (The "Beautiful" Interface)
The interface is designed to be **Action-First, Minimalist, and Immersive**.

### A. Visual Language (The "Dark Ocean" Aesthetic)
*   **Palette:** Deep Navy (#0D0D2B), Cyan (#00B2FF), and Polkadot Pink (#E6007A) for highlights.
*   **Effects:** Glassmorphism (blurry backgrounds, translucent cards), Glowing borders, and Wave animations.
*   **Typography:** Inter (UI), JetBrains Mono (Data/Scores).

### B. The Character: The Seal Mascot
The mascot (Captain Salty/Sealio) is a **Full Character** that drives the narrative UI.
*   **Home State:** Floating playfully near the "Analyze" box.
*   **Analysis State ("The Dive"):** When a user enters a URL, the UI transitions. The Seal dives into the background. As the "Math Engine" runs, he swims past file-folders and "inspects" them.
*   **Sealing State:** He surfaces with a "Seal of Approval" when the user confirms the blockchain transaction.
*   **Result State:** He sits proudly next to the score, holding a "Treasure Chest" that reveals the AI Analysis.

### C. Key Components
1.  **The "Hero Box" (Uniswap Style):** A large, centered card for GitHub URL input. High-contrast "Connect & Seal" button.
2.  **The Radar Chart:** A pentagon-shaped graph showing the 5-category breakdown. This provides an instant visual of the "Balance" of the repository.
3.  **The "Seal" Transaction Flow:** A smooth popup that explains the "Free" transaction (0 PAS + Gas) as an act of "Minting your Reputation."

---

## 4. Business & Sales Strategy
*   **Model:** Decentralized Organization (DAO-first infrastructure).
*   **Onboarding:** **100% Free** for the hackathon/launch phase to maximize user acquisition.
*   **Identity:** Users link their **GitHub Profile** to their **Polkadot Wallet**.
*   **Revenue (Future):** Protocol fees for "Priority Analysis" or "Continuous Monitoring" for enterprises.

---

## 5. Technical Implementation Roadmap

### Phase 1: Infrastructure Polish
- [ ] Finalize `scoring/engine.ts` as the "Deterministic Ground Truth."
- [ ] Deploy `Sealship.sol` with `recordScore` functions to Polkadot Hub TestNet.
- [ ] Connect Pinata for permanent IPFS storage of the AI Captain's Report.

### Phase 2: Narrative UI Implementation
- [ ] Build the "Uniswap-style" Glassmorphic Hero Box.
- [ ] Integrate the Seal Mascot animations into the `AnalysisProgress.tsx` component.
- [ ] Create the Radar Chart visualization for scores.

### Phase 3: Identity & Leaderboard
- [ ] Implement GitHub OAuth to verify repository ownership before sealing.
- [ ] Create `/profile/{wallet}` pages showing the "Verified Developer" status.
- [ ] Launch the "Sealship Leaderboard" 2.0.

---

**Next Steps for Gemini CLI:**
1.  Start CSS implementation of the Glassmorphic Hero Box.
2.  Draft the SVG/CSS for the "Dive" animation.
3.  Refine the Smart Contract to store both the Score and the IPFS CID.
