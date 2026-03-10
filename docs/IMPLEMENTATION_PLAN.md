# Sealship Implementation Plan

**Created**: 2026-03-10
**Status**: Pending Review
**Contract Address**: `0xafcdfc86e0f0076dbce64c0f034310b2efe79589` (Polkadot Hub TestNet)

---

## Scope Summary

This plan covers all non-UI tasks from the MVP roadmap. UI/UX enhancements and SEO are deferred to a later phase.

| # | Work Item | Est. Files Changed | New Files |
|---|-----------|-------------------|-----------|
| A | Supabase GitHub OAuth Setup | 5 | 3 |
| B | Playwright E2E Test Suite (14 tests) | 1 | 4 |
| C | Hardhat Smart Contract Unit Tests (6 tests) | 1 | 1 |
| D | Environment & Config Fixes | 2 | 0 |

---

## A. Supabase GitHub OAuth Integration

### A.0 Prerequisites (Manual steps required by you)

Before I can implement the frontend code, you need to configure the GitHub OAuth App in two places:

#### Step 1: Create a GitHub OAuth App

1. Go to **GitHub** > **Settings** > **Developer settings** > **OAuth Apps** > **New OAuth App**
   - URL: https://github.com/settings/developers
2. Fill in the form:
   - **Application name**: `Sealship`
   - **Homepage URL**: `http://localhost:3000` (or your Vercel URL)
   - **Authorization callback URL**: `https://<YOUR_SUPABASE_PROJECT_REF>.supabase.co/auth/v1/callback`
     - Find your project ref in the Supabase Dashboard URL (e.g., `abcdefghij` from `supabase.com/dashboard/project/abcdefghij`)
3. Click **Register application**
4. Copy the **Client ID**
5. Click **Generate a new client secret** and copy the **Client Secret**

#### Step 2: Configure Supabase

1. Go to **Supabase Dashboard** > Your Project > **Authentication** > **Providers**
2. Find **GitHub** in the list and enable it
3. Paste the **Client ID** and **Client Secret** from Step 1
4. Save

#### Step 3: Set Redirect URL

1. In **Supabase Dashboard** > **Authentication** > **URL Configuration**
2. Set **Site URL** to: `http://localhost:3000` (for dev) or your production Vercel URL
3. Add to **Redirect URLs**: `http://localhost:3000/auth/callback`

Once these 3 steps are done, tell me and I will implement the code below.

---

### A.1 Auth Callback Route

**New file**: `frontend/src/app/auth/callback/route.ts`

Creates the server-side OAuth callback handler that Supabase redirects to after GitHub login.

```
What it does:
- Receives the `code` query parameter from Supabase after GitHub OAuth
- Exchanges it for a session using Supabase SSR `exchangeCodeForSession()`
- Redirects the user back to the homepage (or the page they came from)
```

**Dependencies**: `@supabase/ssr` (new package to install)

---

### A.2 Supabase Server/Browser Clients

**New file**: `frontend/src/lib/supabase-server.ts`

Creates a server-side Supabase client that can read cookies (for Server Components and API Routes).

```
What it does:
- Uses @supabase/ssr createServerClient() with Next.js cookies
- Allows server components and API routes to check if a user is authenticated
- Returns the current user session
```

**Modified file**: `frontend/src/lib/supabase.ts`

The existing browser client stays as-is (it already uses `createClient` from `@supabase/supabase-js`). No changes needed.

---

### A.3 Auth Provider & Hook

**New file**: `frontend/src/hooks/useAuth.ts`

Creates a React context + hook for auth state management on the client side.

```
What it does:
- AuthProvider wraps the app and listens to supabase.auth.onAuthStateChange()
- Exposes: user, session, isLoading, signInWithGitHub(), signOut()
- signInWithGitHub() calls supabase.auth.signInWithOAuth({ provider: 'github' })
  with redirectTo pointing to /auth/callback
- Re-exports as useAuth() hook for any component to consume
```

---

### A.4 Update Providers

**Modified file**: `frontend/src/app/providers.tsx`

```
What changes:
- Import and wrap with AuthProvider inside the existing provider tree
- Provider order: WagmiProvider > QueryClientProvider > ThemeProvider > AuthProvider
```

---

### A.5 Login/Logout Button in Header

**Modified file**: `frontend/src/components/layout/Header.tsx`

```
What changes:
- Import useAuth hook
- Add a "Sign in with GitHub" button (or user avatar + dropdown when authenticated)
- When signed in: show GitHub avatar thumbnail + username + "Sign Out" option
- Position: between ThemeToggle and ConnectButton in the header
- Keep it minimal - no dropdown menu for MVP, just avatar + sign out
```

---

### A.6 Protect "Seal on Chain" Behind Auth

**Modified file**: `frontend/src/components/blockchain/VerifyOnChain.tsx`

```
What changes:
- Import useAuth hook
- If user is NOT authenticated via GitHub, show a message:
  "Sign in with GitHub to verify repository ownership before sealing on-chain"
  with a "Sign in with GitHub" button
- If user IS authenticated, show the existing Seal button flow
- This ensures only GitHub-authenticated users can seal scores
```

---

### A.7 Profile Page (Basic Scaffold)

**New file**: `frontend/src/app/profile/page.tsx`

```
What it does:
- Server component that checks if user is authenticated
- If not authenticated: redirect to home or show "Sign in to view profile"
- If authenticated: display:
  - GitHub avatar + username (from Supabase user metadata)
  - Connected wallet address (if any)
  - List of analyses the user has sealed (query from Supabase where tx_hash is not null)
  - Total "On-Chain Rep" count
- This is a basic scaffold - detailed design deferred per your request
```

**Note**: This requires linking GitHub identity to analyses. For the MVP scaffold, we'll show analyses based on wallet address (querying the smart contract via `getScoresBySubmitter`). A more complete version would link the GitHub user ID to the analysis records in Supabase.

---

## B. Playwright E2E Test Suite (14 Tests)

### B.0 Setup

**New packages** (devDependencies in `frontend/package.json`):
- `@playwright/test`

**New config file**: `frontend/playwright.config.ts`
```
Configuration:
- baseURL: http://localhost:3000
- webServer: { command: 'npm run dev', port: 3000 }
- Projects: chromium, firefox (2 browsers)
- Timeout: 30s per test
- Screenshots on failure
- HTML reporter for results
```

**New script** in `frontend/package.json`:
```json
"test:e2e": "npx playwright test",
"test:e2e:ui": "npx playwright test --ui"
```

---

### B.1 Test File: `frontend/tests/e2e/homepage.spec.ts` (5 tests)

#### Test 1: Homepage loads with hero section
```
- Navigate to /
- Assert page title contains "Sealship" or relevant text
- Assert hero heading "Code Speaks" is visible
- Assert the AnalyzeForm input is visible
- Assert the "Dive In" button exists
```

#### Test 2: Feature cards render correctly
```
- Navigate to /
- Assert 3 feature cards are visible ("Deterministic Scoring", "AI Deep Dive", "Web3 Verified")
- Assert each card has a heading and description text
```

#### Test 3: Navigation links work
```
- Navigate to /
- Assert "Analyzer" and "Leaderboard" nav links exist in header
- Click "Leaderboard" link
- Assert URL changed to /leaderboard
- Click "Analyzer" (or logo) link
- Assert URL is back to /
```

#### Test 4: Theme toggle switches modes
```
- Navigate to /
- Record the initial background color of <body> or root element
- Click the theme toggle button
- Assert the background color has changed
- Click again to toggle back
- Assert it reverts to the initial color
```

#### Test 5: Header renders with logo and controls
```
- Navigate to /
- Assert "Sealship" text is visible in header
- Assert "TESTNET" badge is visible
- Assert theme toggle button exists
- Assert "Connect Wallet" button exists
```

---

### B.2 Test File: `frontend/tests/e2e/analyze-form.spec.ts` (4 tests)

#### Test 6: Rejects invalid GitHub URL
```
- Navigate to /
- Fill the input with "https://example.com/not-github"
- Click "Dive In"
- Assert error message "Please enter a valid GitHub repository URL" is visible
```

#### Test 7: Rejects empty input
```
- Navigate to /
- Assert the "Dive In" button is disabled when input is empty
```

#### Test 8: Accepts valid GitHub URL and redirects
```
- Navigate to /
- Fill input with "https://github.com/vercel/next.js"
- Mock the POST /api/analyze endpoint to return { success: true, data: { analysisId: 'test-123' } }
- Click "Dive In"
- Assert loading spinner appears ("Diving..." text)
- Assert navigation to /analysis/test-123
```

#### Test 9: Handles API error gracefully
```
- Navigate to /
- Fill input with "https://github.com/nonexistent/repo"
- Mock the POST /api/analyze endpoint to return { success: false, error: 'Repository not found' }
- Click "Dive In"
- Assert error message "Repository not found" is displayed
- Assert the form is still usable (not in permanent loading state)
```

---

### B.3 Test File: `frontend/tests/e2e/analysis.spec.ts` (3 tests)

#### Test 10: Analysis progress page shows steps
```
- Navigate to /analysis/test-id
- Mock GET /api/analysis/test-id to return { success: true, data: { status: 'analyzing' }, pollingComplete: false }
- Assert "Diving Deep" heading is visible
- Assert step list shows all 6 steps
- Assert "Fetching GitHub Data" step is highlighted/active
```

#### Test 11: Completed analysis shows score breakdown
```
- Navigate to /analysis/test-id
- Mock GET /api/analysis/test-id to return completed analysis data:
  { success: true, pollingComplete: true, data: {
    status: 'completed', total_score: 85, commit_sha: 'abc1234567',
    documentation_score: 17, testing_score: 18, architecture_score: 16,
    hygiene_score: 18, security_score: 16, repo_hash: '0xabc...',
    report_cid: 'bafybeigtest', ai_analysis: '### Summary\nGreat repo.',
    tx_hash: null, repo_url: 'https://github.com/test/repo'
  }}
- Assert "Score Report" heading is visible
- Assert score circle shows "85"
- Assert all 5 category score bars are present (Documentation, Testing, Architecture, Hygiene, Security)
- Assert AI analysis section renders with "Summary" heading
- Assert "Seal on Polkadot Hub" button is visible (since tx_hash is null)
```

#### Test 12: Verified analysis shows transaction link
```
- Same as Test 11 but with tx_hash: '0xdeadbeef...'
- Assert "Web3 Verified" badge is visible
- Assert "Sealed on Polkadot Hub" text is visible
- Assert "View Transaction" link points to Blockscout with correct tx hash
```

---

### B.4 Test File: `frontend/tests/e2e/leaderboard.spec.ts` (2 tests)

#### Test 13: Leaderboard page loads with table
```
- Navigate to /leaderboard
- Mock GET /api/leaderboard to return 3 entries
- Assert "The Global Leaderboard" heading is visible
- Assert table headers exist (Rank, Repository, Commit, Seal Score, Status)
- Assert 3 rows are rendered
- Assert first row has gold medal emoji
- Assert scores are displayed correctly
```

#### Test 14: Leaderboard empty state
```
- Navigate to /leaderboard
- Mock GET /api/leaderboard to return empty array
- Assert seal emoji and "No repositories have been sealed yet" message
- Assert "Be the First" link points to /
```

---

## C. Hardhat Smart Contract Unit Tests (6 Tests)

### C.0 Setup

The contract tests use the existing Hardhat + Viem + Chai setup in `/contracts`.

**New file**: `contracts/test/Sealship.test.ts`

**New script** in `contracts/package.json`:
```json
"test": "npx hardhat test"
```

All tests deploy a fresh `Sealship` contract instance on the local Hardhat network before each test.

---

### C.1 Test Descriptions

#### Test 1: Should record a valid score and emit ScoreRecorded event
```
- Deploy contract
- Call recordScore(repoHash, 85, "bafybeigexample", "https://github.com/test/repo")
- Assert the transaction emits ScoreRecorded event with correct parameters
- Call getScore(repoHash) and verify all fields match:
  - score === 85
  - reportCID === "bafybeigexample"
  - submitter === caller address
  - repoUrl === "https://github.com/test/repo"
  - timestamp > 0
```

#### Test 2: Should reject score greater than 100
```
- Deploy contract
- Call recordScore(repoHash, 101, "bafybeigexample", "https://github.com/test/repo")
- Assert transaction reverts with "Score must be between 0 and 100"
```

#### Test 3: Should reject empty CID and empty repo URL
```
- Deploy contract
- Call recordScore(repoHash, 50, "", "https://github.com/test/repo")
- Assert revert: "Report CID cannot be empty"
- Call recordScore(repoHash, 50, "bafybeigexample", "")
- Assert revert: "Repo URL cannot be empty"
```

#### Test 4: Should update existing score without increasing total count
```
- Deploy contract
- Call recordScore(repoHash, 50, "cid1", "https://github.com/test/repo")
- Assert getTotalVerifiedCount() === 1
- Call recordScore(repoHash, 90, "cid2", "https://github.com/test/repo") (same hash)
- Assert getTotalVerifiedCount() === 1 (not 2)
- Assert getScore(repoHash).score === 90 (updated)
- Assert getScore(repoHash).reportCID === "cid2" (updated)
```

#### Test 5: Should return all scores by submitter
```
- Deploy contract
- Call recordScore(hash1, 80, "cid1", "url1")
- Call recordScore(hash2, 60, "cid2", "url2")
- Call getScoresBySubmitter(callerAddress)
- Assert returned array length === 2
- Assert first entry has score 80, second has score 60
```

#### Test 6: Should handle zero score and return correct total count
```
- Deploy contract
- Call recordScore(hash1, 0, "cid1", "url1") (minimum valid score)
- Assert getScore(hash1).score === 0
- Call recordScore(hash2, 100, "cid2", "url2") (maximum valid score)
- Assert getTotalVerifiedCount() === 2
- Call getScore(hash2).score === 100
```

---

## D. Environment & Config Fixes

### D.1 Update .env.example

**Modified file**: `.env.example`

```
What changes:
- Add NEXT_PUBLIC_CONTRACT_ADDRESS=0xafcdfc86e0f0076dbce64c0f034310b2efe79589
- Add Supabase env vars section:
  NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
  NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
- Remove legacy DB_PATH=./data/sealship.db (no longer used after Supabase migration)
```

### D.2 Update Contract Address Default

**Modified file**: `frontend/src/lib/blockchain/config.ts`

```
What changes:
- Update CONTRACT_ADDRESS fallback from '0x0000...' to the deployed address:
  '0xafcdfc86e0f0076dbce64c0f034310b2efe79589'
- This ensures the app works even without .env.local set
```

---

## Execution Order

```
Step 1: Environment & Config Fixes (D)
        Quick wins — update .env.example and contract address fallback

Step 2: Hardhat Unit Tests (C)
        Independent of frontend, can run in isolation

Step 3: Playwright E2E Setup + Tests (B)
        Install dependencies, configure Playwright, write all 14 tests

Step 4: Supabase GitHub Auth (A)
        Requires your manual setup first (GitHub OAuth App + Supabase config)
        Then I implement: callback route, auth hook, header login, profile page
```

---

## Files Summary

### New Files (8)
| File | Purpose |
|------|---------|
| `frontend/playwright.config.ts` | Playwright configuration |
| `frontend/tests/e2e/homepage.spec.ts` | 5 homepage E2E tests |
| `frontend/tests/e2e/analyze-form.spec.ts` | 4 analyze form E2E tests |
| `frontend/tests/e2e/analysis.spec.ts` | 3 analysis page E2E tests |
| `frontend/tests/e2e/leaderboard.spec.ts` | 2 leaderboard E2E tests |
| `contracts/test/Sealship.test.ts` | 6 smart contract unit tests |
| `frontend/src/app/auth/callback/route.ts` | OAuth callback handler |
| `frontend/src/hooks/useAuth.ts` | Auth context + hook |

### Modified Files (5)
| File | Change |
|------|--------|
| `.env.example` | Add contract address, Supabase vars, remove legacy DB_PATH |
| `frontend/src/lib/blockchain/config.ts` | Update default contract address |
| `frontend/src/app/providers.tsx` | Add AuthProvider |
| `frontend/src/components/layout/Header.tsx` | Add GitHub login/logout button |
| `frontend/src/components/blockchain/VerifyOnChain.tsx` | Gate behind GitHub auth |

### New Dependencies
| Package | Location | Purpose |
|---------|----------|---------|
| `@playwright/test` | frontend (devDep) | E2E testing framework |
| `@supabase/ssr` | frontend (dep) | Server-side Supabase auth for Next.js |

---

## Blocked Items

| Item | Blocked By | Action Required |
|------|-----------|-----------------|
| Auth implementation (A) | GitHub OAuth App not created yet | Follow steps in A.0 |
| Profile page (A.7) | Depends on auth working | Complete after A.0-A.6 |

---

## Deferred Items (Not in this plan)

| Item | Reason |
|------|--------|
| "Dark Ocean" UI Overhaul | Deferred by user — will address later |
| Logo redesign | Deferred by user |
| SEO / Meta tags / Social Share | Deferred by user |
| Leaderboard 2.0 (avatars) | Depends on auth — can add after A is complete |
| Mainnet preparation | Future phase |
