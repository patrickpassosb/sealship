# Sealship

**Seal your code. Ship your trust.** 🦭🚢

Sealship is a **Decentralized Developer Identity & Code Reputation System** built for the **Polkadot Solidity Hackathon 2026**. It analyzes GitHub repositories and produces a structured quality score (0-100) based on objective metrics, generates AI-powered analysis reports, stores reports on IPFS for decentralized storage, and records cryptographic verification on-chain as verifiable proof of quality.

---

## Project Overview

Sealship evaluates repositories across 5 categories, each worth 20 points (total: 100):

| Category | Weight | What It Measures |
|----------|--------|------------------|
| **Documentation** | 20 pts | README presence, installation/usage guides, CHANGELOG, badges |
| **Testing** | 20 pts | Test directories, test files, frameworks, CI configuration |
| **Architecture** | 20 pts | Modular structure, separation of concerns, config files |
| **Project Hygiene** | 20 pts | LICENSE, .gitignore, CONTRIBUTING, Code of Conduct |
| **Security** | 20 pts | Lock files, .env handling, SECURITY.md, dependency auditing |

### Architecture

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  GitHub API │───▶│  Sealship   │───▶│    IPFS    │───▶│  Polkadot  │
│  (Analysis) │    │  Backend    │    │  (Storage) │    │  (On-chain)│
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
       │                  │                  │                  │
       ▼                  ▼                  ▼                  ▼
  Repository        SQLite DB         Report CID         tx_hash for
  metadata &       (analyses)         (permanent)        verification
  file tree
```

---

## Repository Structure

```
sealship/
├── .env.example              # Environment variables template
├── .gitignore                # Git ignore patterns
├── README.md                  # This file
│
├── contracts/                 # Smart contracts (Solidity + Hardhat)
│   ├── contracts/
│   │   └── Sealship.sol     # Main smart contract
│   ├── hardhat.config.ts     # Hardhat configuration
│   ├── package.json
│   └── scripts/
│       └── deploy.ts         # Deployment script
│
├── frontend/                 # Next.js web application
│   ├── src/
│   │   ├── app/              # Next.js App Router pages
│   │   │   ├── page.tsx           # Home page (analyze form + leaderboard)
│   │   │   ├── layout.tsx         # Root layout
│   │   │   ├── providers.tsx      # React providers (wagmi, query)
│   │   │   ├── globals.css        # Global styles
│   │   │   ├── api/
│   │   │   │   ├── analyze/route.ts       # POST - Start analysis
│   │   │   │   ├── leaderboard/route.ts    # GET - Fetch leaderboard
│   │   │   │   └── analysis/[id]/route.ts  # GET - Poll analysis status
│   │   │   ├── analysis/[id]/
│   │   │   │   └── page.tsx       # Analysis results page
│   │   │   └── leaderboard/
│   │   │       └── page.tsx       # Full leaderboard page
│   │   │
│   │   ├── components/        # React components
│   │   │   ├── analyzer/
│   │   │   │   ├── AnalyzeForm.tsx
│   │   │   │   └── AnalysisProgress.tsx
│   │   │   ├── blockchain/
│   │   │   │   ├── ConnectButton.tsx
│   │   │   │   └── VerifyOnChain.tsx
│   │   │   └── layout/
│   │   │
│   │   ├── hooks/             # React hooks
│   │   │   └── useTheme.tsx
│   │   │
│   │   ├── lib/               # Core business logic
│   │   │   ├── ai/
│   │   │   │   ├── provider.ts    # Generic LLM provider
│   │   │   │   └── prompts.ts     # AI prompt templates
│   │   │   ├── blockchain/
│   │   │   │   └── config.ts      # Wagmi + Viem config
│   │   │   ├── db/
│   │   │   │   ├── client.ts      # SQLite operations
│   │   │   │   └── schema.sql      # Database schema
│   │   │   ├── github/
│   │   │   │   └── client.ts      # GitHub API client
│   │   │   ├── ipfs/
│   │   │   │   └── pinata.ts      # IPFS upload
│   │   │   ├── scoring/
│   │   │   │   └── engine.ts      # Deterministic scoring
│   │   │   └── utils/
│   │   │       ├── hash.ts        # Keccak256 utilities
│   │   │       └── report.ts      # Report generation
│   │   │
│   │   └── types/
│   │       └── index.ts           # TypeScript definitions
│   │
│   ├── data/                     # SQLite database
│   ├── public/                   # Static assets
│   ├── package.json               # Dependencies
│   ├── tailwind.config.ts        # Tailwind config
│   ├── next.config.ts            # Next.js config
│   └── tsconfig.json             # TypeScript config
│
└── tests/                        # Test directory (placeholder)
    └── package.json
```

---

## Major Folders/Modules Explained

### `contracts/` — Smart Contract
- **Sealship.sol**: The main Solidity contract that stores repository scores on-chain. Uses a `mapping(bytes32 => RepoScore)` to associate a unique hash (keccak256 of repo URL + commit SHA) with its score, IPFS report CID, and submitter wallet address.

### `frontend/src/lib/` — Core Backend Logic
- **scoring/engine.ts**: The heart of Sealship — a deterministic algorithm that evaluates repositories. It runs locally without AI, making scores reproducible and objective.
- **github/client.ts**: Wraps the GitHub REST API. Fetches repo metadata, file trees, and file content (base64 decoded).
- **ai/provider.ts**: A generic OpenAI-compatible LLM provider supporting Mistral, Cerebras, OpenRouter, Grok, and more. Uses the standard `/v1/chat/completions` endpoint.
- **ipfs/pinata.ts**: Uploads JSON reports to IPFS via Pinata. Includes a mock mode for testing without API keys.
- **db/client.ts**: SQLite database operations using `better-sqlite3`. Stores repositories and analysis records.

### `frontend/src/app/api/` — API Routes
- **POST /api/analyze**: Accepts a GitHub URL, starts an async analysis pipeline, returns an `analysisId` for polling.
- **GET /api/leaderboard**: Returns top-scoring repositories.
- **GET /api/analysis/[id]**: Polls the status and results of an analysis.

---

## Setup Instructions

### Prerequisites
- **Node.js** 18+ (LTS recommended)
- **npm** or **yarn**
- **Git**
- (Optional) **MetaMask** browser extension for on-chain verification

### 1. Clone the Repository

```bash
git clone https://github.com/your-org/sealship.git
cd sealship
```

### 2. Install Dependencies

```bash
# Install frontend dependencies
cd frontend && npm install && cd ..

# Install contract dependencies
cd contracts && npm install && cd ..
```

### 3. Environment Configuration

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example frontend/.env
```

#### Environment Variables (from `.env.example`)

| Variable | Description | Required |
|----------|-------------|----------|
| `GITHUB_TOKEN` | GitHub Personal Access Token (for higher rate limits) | Recommended |
| `LLM_PROVIDER` | AI provider: `mistral`, `cerebras`, `openrouter`, `grok`, `openai`, `groq`, `together`, `deepseek` | Yes |
| `LLM_API_KEY` | API key for your chosen LLM provider | Yes |
| `LLM_BASE_URL` | Base URL for the LLM API (defaults provided per provider) | No |
| `LLM_MODEL` | Model name to use | No |
| `LLM_MAX_TOKENS` | Max tokens for AI response (default: 2048) | No |
| `PINATA_API_KEY` | Pinata API key for IPFS uploads | For production |
| `PINATA_SECRET_API_KEY` | Pinata secret key | For production |
| `MOCK_IPFS` | Set to `true` to simulate IPFS uploads | Yes (for testing) |
| `POLKADOT_PRIVATE_KEY` | Wallet private key for on-chain transactions | For verification |
| `POLKADOT_RPC_URL` | RPC URL for Polkadot Hub TestNet | Optional |
| `DB_PATH` | SQLite database path (default: `./data/sealship.db`) | Optional |
| `NEXT_PUBLIC_APP_URL` | Your app's URL (for OpenRouter headers) | Recommended |

---

## Run Instructions

### Development Mode

```bash
cd frontend
npm run dev
```

The app will be available at **http://localhost:3000**

### Production Build

```bash
cd frontend
npm run build
npm start
```

---

## API Endpoints Summary

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/analyze` | Submit a GitHub repo for analysis. Body: `{ "repoUrl": "https://github.com/owner/repo" }` |
| `GET` | `/api/leaderboard` | Get top repositories. Query: `?limit=10` |
| `GET` | `/api/analysis/[id]` | Poll analysis status and results |

### Example Usage

```bash
# Start analysis
curl -X POST http://localhost:3000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"repoUrl": "https://github.com/facebook/react"}'

# Poll for results (replace ANALYSIS_ID)
curl http://localhost:3000/api/analysis/ANALYSIS_ID

# Get leaderboard
curl http://localhost:3000/api/leaderboard?limit=10
```

---

## Smart Contract Deployment

### Deploy to Polkadot Hub TestNet

1. Configure deploy secrets in root `.env`:
   ```
   POLKADOT_RPC_URL=https://eth-rpc-testnet.polkadot.io
   POLKADOT_PRIVATE_KEY=your_private_key_here   # 64 hex chars, no 0x
   ```

2. Install contract deps and run readiness checks:
   ```bash
   cd contracts
   npm ci
   npm test
   ```

3. Get free PAS tokens from the faucet: https://faucet.polkadot.io/

4. Deploy the contract (from `contracts/`):
   ```bash
   npm run deploy:polkadot
   ```

5. Copy the deployed contract address to your frontend `.env`:
   ```
   NEXT_PUBLIC_CONTRACT_ADDRESS=0x...
   ```

### Contract Functions

| Function | Description |
|----------|-------------|
| `recordScore(bytes32 _repoHash, uint256 _score, string _reportCID, string _repoUrl)` | Records a score on-chain |
| `getScore(bytes32 _repoHash)` | Retrieves a score by repo hash |
| `getScoresBySubmitter(address _submitter)` | Gets all scores submitted by a wallet |
| `getTotalVerifiedCount()` | Returns total verified count |

### Network Details

| Property | Value |
|----------|-------|
| Network | Polkadot Hub TestNet |
| Chain ID | 420420417 |
| RPC | `https://eth-rpc-testnet.polkadot.io` |
| Explorer | `https://blockscout-testnet.polkadot.io` |
| Token | PAS (free from faucet) |

---

## Data Flow Walkthrough

This section walks through what happens when a user analyzes a repository — from URL submission to on-chain verification.

### Step 1: User Submits Repository URL

The user enters a GitHub repository URL (e.g., `https://github.com/owner/repo`) on the Sealship web interface and clicks "Analyze".

### Step 2: API Creates Analysis Record

The frontend calls `POST /api/analyze` with the repo URL. The backend:

1. **Parses the URL** → Extracts `owner` and `name`
2. **Fetches metadata** → Calls GitHub API to get default branch, stars, languages
3. **Gets latest commit** → Fetches the HEAD commit SHA of the default branch
4. **Generates repo hash** → Creates `keccak256(repoUrl + commitSha)` for unique identification
5. **Creates DB record** → Inserts a new analysis record with status `analyzing`
6. **Returns immediately** → Sends back an `analysisId` for polling

### Step 3: Background Pipeline Runs

After returning the `analysisId`, the server runs the analysis pipeline asynchronously:

```
┌─────────────────────────────────────────────────────────────┐
│  Pipeline (runAnalysisPipeline)                            │
├─────────────────────────────────────────────────────────────┤
│  1. Fetch File Tree                                        │
│     └─> GET /repos/{owner}/{name}/git/trees/{sha}?recursive=1
│                                                             │
│  2. Fetch README Content                                   │
│     └─> GET /repos/{owner}/{name}/contents/README.md      │
│                                                             │
│  3. Run Scoring Algorithm (engine.ts)                      │
│     ├─> Documentation: README presence, length, guides    │
│     ├─> Testing: test dirs, files, frameworks, CI         │
│     ├─> Architecture: modularity, separation of concerns   │
│     ├─> Hygiene: LICENSE, .gitignore, CONTRIBUTING        │
│     └─> Security: lock files, .env handling, audits      │
│                                                             │
│  4. Generate AI Analysis                                   │
│     └─> Call LLM with scoring results + prompts.ts        │
│                                                             │
│  5. Upload Report to IPFS                                  │
│     └─> POST to Pinata → returns IPFS CID                  │
│                                                             │
│  6. Update DB with results                                  │
│     └─> status → "completed"                               │
└─────────────────────────────────────────────────────────────┘
```

### Step 4: User Polls for Results

The frontend polls `GET /api/analysis/[id]` every few seconds. Once status is `completed`, the user sees:

- **Total Score**: 0-100
- **Category Breakdown**: Scores per category
- **Signals**: What was found/missing in each category
- **AI Analysis**: Natural language explanation
- **IPFS Report**: Link to the immutable report

### Step 5: On-Chain Verification (Optional)

If the user connects their wallet (MetaMask), they can verify the score on-chain:

1. Frontend calls `recordScore()` on the Sealship contract
2. The transaction includes:
   - `_repoHash`: keccak256(repoUrl + commitSha)
   - `_score`: The 0-100 score
   - `_reportCID`: IPFS hash of the report
   - `_repoUrl`: The GitHub URL

3. Once mined, the score is permanently recorded on Polkadot Hub TestNet
4. Anyone can query `getScore(_repoHash)` to verify the score is authentic

---

## License

MIT
