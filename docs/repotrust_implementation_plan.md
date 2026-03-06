# RepoTrust — Implementation Plan

> **Hackathon:** Polkadot Solidity Hackathon 2026
> **Deadline:** March 20, 2026
> **Track:** EVM Smart Contract Track — AI-powered decentralized applications
> **Idea:** #1560121 — Decentralized Identity and Reputation System
> **Chain:** Polkadot Hub TestNet (Chain ID: 420420417)

---

## Confirmed Decisions

| Decision | Choice |
|----------|--------|
| Blockchain | Polkadot Hub TestNet |
| Frontend | Next.js + React + TypeScript |
| Smart Contracts | Solidity + Hardhat |
| IPFS | Pinata (free tier) |
| Cache | In-memory Map + SQLite (no Redis) |
| LLM | Generic OpenAI-compatible interface |
| Database | SQLite (full schema) |
| Theme | Dark + Light mode, Polkadot brand colors |
| CSS | Vanilla CSS (custom design system) |
| Wallet | wagmi + viem |
| Testing | Unit (Vitest) + Contract (Hardhat) + E2E (Playwright) |

---

## 1. Project Structure

```
repotrust/
├── docs/                          # Project documentation (existing)
│   ├── hackathon/
│   ├── project.md
│   └── enhanced-features.md
│
├── frontend/                      # Next.js application
│   ├── public/                    # Static assets (logos, icons)
│   ├── src/
│   │   ├── app/                   # Next.js App Router pages
│   │   │   ├── layout.tsx         # Root layout (theme provider)
│   │   │   ├── page.tsx           # Landing page
│   │   │   ├── analyze/
│   │   │   │   └── page.tsx       # Repository analysis page
│   │   │   ├── results/
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx   # Analysis results page
│   │   │   ├── leaderboard/
│   │   │   │   └── page.tsx       # Public leaderboard
│   │   │   └── api/               # Next.js API routes (backend)
│   │   │       ├── analyze/
│   │   │       │   └── route.ts   # POST: Start analysis
│   │   │       ├── results/
│   │   │       │   └── [id]/
│   │   │       │       └── route.ts
│   │   │       ├── leaderboard/
│   │   │       │   └── route.ts
│   │   │       └── verify/
│   │   │           └── route.ts   # POST: Trigger on-chain verification
│   │   ├── components/            # Reusable UI components
│   │   │   ├── layout/
│   │   │   │   ├── Header.tsx
│   │   │   │   ├── Footer.tsx
│   │   │   │   └── ThemeToggle.tsx
│   │   │   ├── analysis/
│   │   │   │   ├── RepoInput.tsx
│   │   │   │   ├── ScoreCard.tsx
│   │   │   │   ├── ScoreBreakdown.tsx
│   │   │   │   └── AIAnalysis.tsx
│   │   │   ├── blockchain/
│   │   │   │   ├── ConnectWallet.tsx
│   │   │   │   ├── VerifyButton.tsx
│   │   │   │   └── TransactionStatus.tsx
│   │   │   └── leaderboard/
│   │   │       ├── LeaderboardTable.tsx
│   │   │       └── LeaderboardEntry.tsx
│   │   ├── hooks/                 # Custom React hooks
│   │   │   ├── useAnalysis.ts
│   │   │   ├── useContract.ts
│   │   │   └── useTheme.ts
│   │   ├── lib/                   # Core business logic
│   │   │   ├── github/
│   │   │   │   ├── client.ts      # GitHub API client
│   │   │   │   ├── types.ts       # GitHub API types
│   │   │   │   └── extractor.ts   # Metric extraction
│   │   │   ├── scoring/
│   │   │   │   ├── engine.ts      # Deterministic scoring algorithm
│   │   │   │   ├── categories.ts  # Category definitions & weights
│   │   │   │   └── types.ts
│   │   │   ├── ai/
│   │   │   │   ├── provider.ts    # Generic OpenAI-compatible interface
│   │   │   │   ├── prompts.ts     # System/user prompt templates
│   │   │   │   └── types.ts
│   │   │   ├── ipfs/
│   │   │   │   ├── pinata.ts      # Pinata SDK wrapper
│   │   │   │   └── types.ts
│   │   │   ├── cache/
│   │   │   │   ├── memory.ts      # In-memory cache (Map-based)
│   │   │   │   ├── interface.ts   # Cache interface (easy to swap Redis)
│   │   │   │   └── types.ts
│   │   │   ├── db/
│   │   │   │   ├── client.ts      # SQLite client (better-sqlite3)
│   │   │   │   ├── schema.ts      # Table definitions
│   │   │   │   ├── migrations.ts  # Schema migrations
│   │   │   │   └── queries.ts     # Prepared queries
│   │   │   ├── blockchain/
│   │   │   │   ├── config.ts      # Chain config (Polkadot Hub TestNet)
│   │   │   │   ├── abi.ts         # Contract ABI
│   │   │   │   └── client.ts      # viem client setup
│   │   │   └── utils/
│   │   │       ├── hash.ts        # keccak256 hashing
│   │   │       └── report.ts      # Report generation
│   │   ├── styles/
│   │   │   ├── globals.css        # Global styles + design tokens
│   │   │   ├── theme.css          # Dark/light theme variables
│   │   │   └── components.css     # Component-specific styles
│   │   └── types/
│   │       └── index.ts           # Shared TypeScript types
│   ├── next.config.ts
│   ├── tsconfig.json
│   └── package.json
│
├── contracts/                     # Solidity smart contracts
│   ├── contracts/
│   │   └── RepoTrust.sol          # Main contract
│   ├── scripts/
│   │   └── deploy.ts              # Deployment script
│   ├── test/
│   │   └── RepoTrust.test.ts      # Contract unit tests
│   ├── hardhat.config.ts
│   ├── tsconfig.json
│   └── package.json
│
├── tests/                         # E2E tests
│   ├── e2e/
│   │   ├── analysis.spec.ts       # Full analysis flow
│   │   ├── verification.spec.ts   # Blockchain verification flow
│   │   └── leaderboard.spec.ts    # Leaderboard display
│   ├── playwright.config.ts
│   └── package.json
│
├── .env.example                   # Environment variable template
├── .gitignore
├── README.md
└── package.json                   # Root workspace config
```

### Why This Structure Is Best Practice

> [!NOTE]
> **This is a monorepo pattern** — one of the most widely adopted structures for full-stack dApps. Here's why:

| Pattern | Why It's Best Practice |
|---------|----------------------|
| **Separate `frontend/` and `contracts/`** | Clear separation of concerns. Frontend and contracts have different build tools (Next.js vs Hardhat), different dependencies, and different deployment targets. |
| **Shared root `package.json`** | npm/yarn workspaces allow shared dependencies and single `npm install` from root. |
| **`tests/` at root level** | E2E tests span both frontend and contracts — they belong at the root, not inside either package. |
| **`lib/` inside `src/`** | Core business logic (scoring, GitHub API, AI) is co-located with the frontend but separated from UI components. This makes it easy to extract into its own package later. |
| **`cache/interface.ts`** | Coding to an interface makes it trivial to swap in Redis later without changing any consuming code. |

**Alternatives considered:**
- `packages/` folder (enterprise monorepo with Turborepo) — overkill for hackathon
- Single Next.js app with contracts inside — messy, harder to deploy contracts independently
- Separate repositories — harder to manage, no shared types

---

## 2. Development Milestones

### Milestone 1 — Repository Scoring Engine
**Est. Time: 4-6 hours**

| Task | Description |
|------|-------------|
| 1.1 | Initialize Next.js project with TypeScript in `frontend/` |
| 1.2 | Set up design system (CSS variables, dark/light theme, Polkadot colors) |
| 1.3 | Build GitHub API client (`lib/github/client.ts`) |
| 1.4 | Build metric extractor (`lib/github/extractor.ts`) |
| 1.5 | Build deterministic scoring engine (`lib/scoring/engine.ts`) |
| 1.6 | Set up SQLite database with schema (`lib/db/`) |
| 1.7 | Build API route `POST /api/analyze` |
| 1.8 | Build frontend: landing page + repo input + score display |
| 1.9 | Write unit tests for scoring engine |

### Milestone 2 — AI Explanation Layer
**Est. Time: 2-3 hours**

| Task | Description |
|------|-------------|
| 2.1 | Build generic LLM provider interface (`lib/ai/provider.ts`) |
| 2.2 | Create prompt templates (`lib/ai/prompts.ts`) |
| 2.3 | Integrate AI analysis into the analysis pipeline |
| 2.4 | Build AI analysis display component |
| 2.5 | Write unit tests for AI provider + prompts |

### Milestone 3 — IPFS Storage
**Est. Time: 1-2 hours**

| Task | Description |
|------|-------------|
| 3.1 | Set up Pinata SDK (`lib/ipfs/pinata.ts`) |
| 3.2 | Generate structured JSON report |
| 3.3 | Upload report to IPFS, receive CID |
| 3.4 | Display IPFS CID + link in results page |
| 3.5 | Write unit tests for IPFS integration |

### Milestone 4 — Blockchain Verification
**Est. Time: 3-4 hours**

| Task | Description |
|------|-------------|
| 4.1 | Write Solidity smart contract (`RepoTrust.sol`) |
| 4.2 | Write contract tests (`RepoTrust.test.ts`) |
| 4.3 | Configure Hardhat for Polkadot Hub TestNet |
| 4.4 | Deploy contract to TestNet |
| 4.5 | Build wagmi/viem integration (`lib/blockchain/`) |
| 4.6 | Build ConnectWallet + VerifyButton components |
| 4.7 | Build transaction status display |

### Milestone 5 — Leaderboard + Polish
**Est. Time: 2-3 hours**

| Task | Description |
|------|-------------|
| 5.1 | Build leaderboard API route |
| 5.2 | Build leaderboard page + table component |
| 5.3 | Add animations and micro-interactions |
| 5.4 | Write E2E tests (Playwright) |
| 5.5 | Create README.md with setup instructions |
| 5.6 | Final polish: responsive design, error handling, loading states |

---

## 3. Smart Contract Design

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract RepoTrust {
    struct RepoScore {
        bytes32 repoHash;        // keccak256(repoURL + commitSHA)
        uint256 score;           // 0-100
        string reportCID;        // IPFS CID
        address submitter;       // User who submitted
        uint256 timestamp;       // Block timestamp
        string repoUrl;          // Original repo URL
    }

    mapping(bytes32 => RepoScore) public scores;
    bytes32[] public allRepoHashes;
    mapping(address => bytes32[]) public submitterRepos;

    event ScoreRecorded(
        bytes32 indexed repoHash,
        uint256 score,
        string reportCID,
        address indexed submitter,
        uint256 timestamp
    );

    function recordScore(
        bytes32 repoHash,
        uint256 score,
        string calldata reportCID,
        string calldata repoUrl
    ) external {
        require(score <= 100, "Score must be 0-100");
        require(bytes(reportCID).length > 0, "CID required");

        scores[repoHash] = RepoScore({
            repoHash: repoHash,
            score: score,
            reportCID: reportCID,
            submitter: msg.sender,
            timestamp: block.timestamp,
            repoUrl: repoUrl
        });

        allRepoHashes.push(repoHash);
        submitterRepos[msg.sender].push(repoHash);

        emit ScoreRecorded(repoHash, score, reportCID, msg.sender, block.timestamp);
    }

    function getScore(bytes32 repoHash) external view returns (RepoScore memory) {
        return scores[repoHash];
    }

    function getScoresBySubmitter(address submitter) external view returns (bytes32[] memory) {
        return submitterRepos[submitter];
    }

    function getLeaderboard(uint256 limit) external view returns (RepoScore[] memory) {
        uint256 count = allRepoHashes.length < limit ? allRepoHashes.length : limit;
        RepoScore[] memory result = new RepoScore[](count);
        // Return most recent entries (sorted by client)
        for (uint256 i = 0; i < count; i++) {
            result[i] = scores[allRepoHashes[allRepoHashes.length - 1 - i]];
        }
        return result;
    }

    function getTotalScores() external view returns (uint256) {
        return allRepoHashes.length;
    }
}
```

---

## 4. Scoring Algorithm

| Category | Weight | Signals |
|----------|--------|---------|
| **Documentation** (20pts) | 20% | README presence (3), README length >500 chars (3), installation section (3), usage examples (3), API docs (2), CHANGELOG (2), screenshots/demo (2), badges (2) |
| **Testing** (20pts) | 20% | Test directory (4), test files count (4), test framework detected (4), CI config (4), coverage config (4) |
| **Architecture** (20pts) | 20% | Modular structure (4), separation of concerns (4), number of modules >3 (4), config files (4), meaningful directory names (4) |
| **Project Hygiene** (20pts) | 20% | LICENSE (4), .gitignore (4), CONTRIBUTING.md (4), CODE_OF_CONDUCT.md (4), issue templates (4) |
| **Security** (20pts) | 20% | Lock file (4), no .env committed (4), SECURITY.md (4), dependency audit config (4), env.example (4) |

**Total: 0-100 points**

---

## 5. Generic LLM Provider Interface

```typescript
// lib/ai/provider.ts — supports ANY OpenAI-compatible API

interface LLMConfig {
  provider: string;       // "mistral" | "cerebras" | "openrouter" | "grok" | "openai" | custom
  apiKey: string;
  baseUrl: string;        // e.g., "https://api.mistral.ai/v1"
  model: string;          // e.g., "mistral-large-latest"
  maxTokens?: number;
}

// All providers use the same /v1/chat/completions format
// Just change baseUrl + model + apiKey
const PROVIDER_DEFAULTS: Record<string, Partial<LLMConfig>> = {
  mistral:    { baseUrl: "https://api.mistral.ai/v1",         model: "mistral-large-latest" },
  cerebras:   { baseUrl: "https://api.cerebras.ai/v1",        model: "llama-4-scout-17b-16e-instruct" },
  openrouter: { baseUrl: "https://openrouter.ai/api/v1",      model: "mistralai/mistral-large-latest" },
  grok:       { baseUrl: "https://api.x.ai/v1",               model: "grok-3" },
  openai:     { baseUrl: "https://api.openai.com/v1",          model: "gpt-4o" },
};
```

---

## 6. Database Schema (SQLite)

```sql
-- Repositories table
CREATE TABLE repositories (
  id TEXT PRIMARY KEY,
  url TEXT NOT NULL UNIQUE,
  owner TEXT NOT NULL,
  name TEXT NOT NULL,
  default_branch TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Analyses table
CREATE TABLE analyses (
  id TEXT PRIMARY KEY,
  repository_id TEXT NOT NULL REFERENCES repositories(id),
  commit_sha TEXT NOT NULL,
  repo_hash TEXT NOT NULL,
  total_score INTEGER NOT NULL,
  documentation_score INTEGER NOT NULL,
  testing_score INTEGER NOT NULL,
  architecture_score INTEGER NOT NULL,
  hygiene_score INTEGER NOT NULL,
  security_score INTEGER NOT NULL,
  ai_analysis TEXT,
  report_cid TEXT,
  tx_hash TEXT,
  status TEXT DEFAULT 'pending',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Cache entries table (replaces Redis)
CREATE TABLE cache_entries (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  expires_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Leaderboard view
CREATE VIEW leaderboard AS
  SELECT
    r.url,
    r.owner,
    r.name,
    a.total_score,
    a.commit_sha,
    a.report_cid,
    a.tx_hash,
    a.created_at
  FROM analyses a
  JOIN repositories r ON r.id = a.repository_id
  WHERE a.status = 'completed'
  ORDER BY a.total_score DESC;
```

---

## 7. Design System — Polkadot Brand Colors

```css
/* Theme tokens */
:root {
  /* Polkadot brand */
  --polkadot-pink: #E6007A;
  --polkadot-pink-light: #FF2D9B;
  --polkadot-purple: #552BBF;
  --polkadot-cyan: #00B2FF;
  --polkadot-green: #56F39A;
  --polkadot-lime: #D3FF33;

  /* Score colors */
  --score-excellent: #56F39A;    /* 80-100 */
  --score-good: #D3FF33;         /* 60-79 */
  --score-fair: #FFB800;         /* 40-59 */
  --score-poor: #E6007A;         /* 0-39 */
}

[data-theme="dark"] {
  --bg-primary: #0D0D0D;
  --bg-secondary: #1A1A2E;
  --bg-card: #16213E;
  --text-primary: #FFFFFF;
  --text-secondary: #A0A0B8;
  --border: #2A2A3E;
}

[data-theme="light"] {
  --bg-primary: #FAFAFA;
  --bg-secondary: #FFFFFF;
  --bg-card: #FFFFFF;
  --text-primary: #1A1A2E;
  --text-secondary: #6B6B80;
  --border: #E0E0E8;
}
```

---

## 8. Environment Variables

```env
# GitHub
GITHUB_TOKEN=your_github_personal_access_token

# LLM (Generic OpenAI-compatible)
LLM_PROVIDER=mistral
LLM_API_KEY=your_api_key
LLM_BASE_URL=https://api.mistral.ai/v1
LLM_MODEL=mistral-large-latest

# IPFS (Pinata)
PINATA_API_KEY=your_pinata_api_key
PINATA_SECRET_KEY=your_pinata_secret_key

# Blockchain (Polkadot Hub TestNet)
DEPLOYER_PRIVATE_KEY=your_wallet_private_key
POLKADOT_HUB_RPC=https://eth-rpc-testnet.polkadot.io/
POLKADOT_HUB_CHAIN_ID=420420417
CONTRACT_ADDRESS=deployed_contract_address

# Database
DATABASE_URL=file:./repotrust.db
```

---

## 9. Testing Strategy

| Layer | Framework | What to Test |
|-------|-----------|-------------|
| **Scoring Engine** | Vitest | All 5 categories, edge cases, score boundaries |
| **GitHub Client** | Vitest + MSW (mock) | API responses, error handling, rate limits |
| **AI Provider** | Vitest + MSW | Provider switching, error fallback, prompt formatting |
| **IPFS Upload** | Vitest + mock | Upload success, CID validation, error handling |
| **Cache** | Vitest | Set/get/expire, SQLite fallback |
| **Smart Contract** | Hardhat + Chai | recordScore, getScore, getLeaderboard, edge cases |
| **E2E** | Playwright | Full analysis flow, wallet connection, verification |

---

## 10. What I Need From You Before Building

| Item | Status |
|------|--------|
| GitHub Personal Access Token | ⏳ Pending |
| LLM API Key (any provider) | ⏳ Pending |
| Pinata API Key | ⏳ Pending |
| MetaMask wallet private key | ⏳ Pending |
| Approval of this plan | ⏳ Pending |

> [!IMPORTANT]
> I can start building Milestones 1-2 **without any API keys** by using mocked responses. You can provide the keys when ready, and I'll wire them in.
