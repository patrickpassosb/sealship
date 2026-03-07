# AGENTS.md

This file provides guidance to Agents when working with code in this repository.

## Project Overview

**Sealship** is a decentralized developer reputation system built for the Polkadot Solidity Hackathon. It analyzes GitHub repositories, scores them deterministically across 5 categories, generates AI explanations, stores reports on IPFS, and records verification on-chain via a Solidity smart contract on Polkadot Hub TestNet.

Tagline: *"Seal your code. Ship your trust."*

## Commands

All commands run from `frontend/`:

```bash
npm run dev      # Start Next.js dev server
npm run build    # Production build
npm run lint     # ESLint
```

There are no automated tests currently configured.

## Architecture

The entire application lives in `frontend/` as a Next.js 16 app with API routes as the backend. There is no separate backend service.

### Analysis Pipeline (`src/app/api/analyze/route.ts`)

The core flow is triggered by `POST /api/analyze`:
1. Parse GitHub URL → fetch repo metadata + latest commit SHA
2. Create analysis record in Supabase (status: `analyzing`)
3. Return `analysisId` immediately to the client
4. Run pipeline asynchronously in the background:
   - Fetch file tree + README from GitHub API
   - Score repository deterministically (`src/lib/scoring/engine.ts`)
   - Generate AI explanation via LLM (`src/lib/ai/provider.ts`)
   - Upload JSON report to IPFS via Pinata (`src/lib/ipfs/pinata.ts`)
   - Update Supabase through status transitions: `scoring` → `ai_analysis` → `uploading_ipfs`
5. On-chain verification (`recordScore`) happens **client-side** using the user's wallet (wagmi/viem), not in the API route

### Scoring Engine (`src/lib/scoring/engine.ts`)

Deterministic, 5-category scoring (20 pts each = 100 total):
- **Documentation**: README presence/length, install instructions, usage examples, docs/, CHANGELOG, screenshots, badges
- **Testing**: test directories, test files, framework config, CI, coverage
- **Architecture**: modular dirs, separation of concerns, source file count, config files, language diversity
- **Hygiene**: LICENSE, .gitignore, CONTRIBUTING.md, CODE_OF_CONDUCT, issue/PR templates
- **Security**: lock file, no committed .env, SECURITY.md, Dependabot/Renovate, .env.example

### Database (`src/lib/db/client.ts`)

Uses **Supabase** (PostgreSQL). Tables: `repositories`, `analyses`. A `leaderboard` view joins them and returns the highest-scoring completed analysis per repo. The `schema.sql` file documents the schema in SQLite syntax for reference, but production uses Supabase.

### Blockchain (`src/lib/blockchain/config.ts`)

- **Network**: Polkadot Hub TestNet (Chain ID: 420420417)
- **RPC**: `https://eth-rpc-testnet.polkadot.io/`
- **Wallet**: wagmi + viem with injected browser wallet connector
- Contract address set via `NEXT_PUBLIC_CONTRACT_ADDRESS` env var
- Key contract function: `recordScore(bytes32 repoHash, uint256 score, string reportCID, string repoUrl)`

### AI Provider (`src/lib/ai/provider.ts`)

Generic OpenAI-compatible interface. Provider selected via `LLM_PROVIDER` env var. Supported out-of-the-box: `mistral` (default), `cerebras`, `openrouter`, `grok`, `openai`, `groq`, `together`, `deepseek`. Falls back to mock analysis if `LLM_API_KEY` is not set.

## Environment Variables

Required in `frontend/.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_CONTRACT_ADDRESS=   # Deployed Solidity contract address
GITHUB_TOKEN=                   # GitHub API token (avoids rate limits)
LLM_PROVIDER=mistral            # AI provider name
LLM_API_KEY=                    # Provider API key (optional — falls back to mock)
LLM_MODEL=                      # Override default model (optional)
PINATA_JWT=                      # Pinata IPFS JWT for uploads
```

## Key File Locations

| Concern | Path |
|---|---|
| API routes | `src/app/api/` |
| Scoring logic | `src/lib/scoring/engine.ts` |
| Database client | `src/lib/db/client.ts` |
| Supabase client | `src/lib/supabase.ts` |
| AI provider | `src/lib/ai/provider.ts` |
| AI prompts | `src/lib/ai/prompts.ts` |
| IPFS upload | `src/lib/ipfs/pinata.ts` |
| Blockchain config + ABI | `src/lib/blockchain/config.ts` |
| GitHub API client | `src/lib/github/client.ts` |
| All TypeScript types | `src/types/index.ts` |
| Pages | `src/app/page.tsx`, `src/app/analysis/[id]/page.tsx`, `src/app/leaderboard/page.tsx` |
| Wallet/Web3 providers | `src/app/providers.tsx` |

## Analysis Status Flow

```
analyzing → scoring → ai_analysis → uploading_ipfs → completed
                                                    → failed
```

The `completed` status is only set after the client calls `recordScore` on-chain and then calls `PATCH /api/analysis/[id]` with the `txHash`.
