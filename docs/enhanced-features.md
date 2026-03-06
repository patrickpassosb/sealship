# Sealship — Enhanced Features Roadmap

> These features are designed to strengthen Sealship's position as a **Decentralized Developer Identity & Code Reputation System** for the Polkadot ecosystem. Features are categorized by implementation difficulty and priority.

---

## Phase 1 — Quick Wins (Include in MVP if time allows)

### ✅ Cross-dApp Queryable Reputation
**Effort: Minimal (already built into smart contract)**

Other dApps on Polkadot Hub can query the Sealship smart contract to check a developer's reputation score before interacting with them.

```solidity
// Already part of the core contract — just a public view function
function getScore(bytes32 repoHash) external view returns (RepoScore memory);
function getScoresBySubmitter(address submitter) external view returns (RepoScore[] memory);
```

**Why it matters:** This is what makes Sealship a true "reputation layer" — not just a standalone app, but infrastructure that other dApps can build on.

---

### ✅ Developer Profile Page
**Effort: Low-Medium (~2-4 hours)**

A public page that links a GitHub identity to a Polkadot wallet address, showing:
- GitHub username + avatar
- Connected wallet address
- All analyzed repositories
- Aggregate reputation score (average across repos)
- History of on-chain verifications

**URL pattern:** `/profile/{walletAddress}` or `/profile/{githubUsername}`

**Why it matters:** This transforms Sealship from "repo analysis tool" → "developer identity platform"

---

## Phase 2 — Post-MVP Enhancements

### 🔄 Multi-Repo Reputation Aggregation
**Effort: Medium (~4-6 hours)**

Aggregate scores across all repositories by a single developer to create a **Developer Trust Score** (not just per-repo scores).

```
Developer Trust Score = weighted_average(all_repo_scores)
  - Weight by: repo size, recency, language diversity
  - Bonus for: consistent quality across repos
```

Smart contract addition:
```solidity
struct DeveloperReputation {
    address developer;
    uint256 aggregateScore;
    uint256 repoCount;
    uint256 lastUpdated;
}
```

---

### 🏆 Reputation NFT / Soulbound Badge
**Effort: Medium (~3-5 hours)**

Mint a **soulbound (non-transferable) ERC-721 token** as a "Sealship Verified Developer" badge.

- Badge tiers: Bronze (60+), Silver (75+), Gold (90+)
- Non-transferable — tied to the developer's wallet
- Visual badge rendered as SVG on-chain (fully decentralized)
- Can be displayed in Polkadot wallets and other dApps

```solidity
contract SealshipBadge is ERC721 {
    // Soulbound: override transfer to revert
    function _beforeTokenTransfer(...) internal override {
        require(from == address(0), "Soulbound: non-transferable");
    }
}
```

---

### 📊 Reputation History & Trends
**Effort: Medium (~3-4 hours)**

Track how a repository's score changes over time. Show graphs of improvement or decline.

- Store historical scores in SQLite
- Chart component showing score trajectory
- "Score improved by X% since last analysis" badges

---

### 🔗 GitHub OAuth Integration
**Effort: Medium (~4-6 hours)**

Instead of manually entering a repo URL, let developers:
1. Log in with GitHub OAuth
2. See all their repositories listed
3. One-click analyze any repo
4. Auto-link GitHub identity to wallet

---

### 🌐 Cross-Chain Reputation Bridge
**Effort: High (~8-12 hours)**

Use Polkadot's XCM (Cross-Consensus Messaging) to make reputation scores queryable from other parachains (Moonbeam, Astar, etc.).

This would make Sealship the first **cross-chain developer reputation standard** in the Polkadot ecosystem.

---

### 🗳️ DAO Governance for Score Validation
**Effort: High (~10-15 hours)**

Allow the community to dispute or validate scores through a lightweight DAO:
- Stake tokens to challenge a score
- Community votes on whether the score is fair
- Challenger or validator is rewarded

---

### 📡 Continuous Monitoring & Webhooks
**Effort: High (~6-8 hours)**

- Set up GitHub webhooks to re-analyze repos on push
- Auto-update on-chain scores
- Email/notification alerts when score changes

---

## Priority Matrix

| Feature | Effort | Impact | MVP? |
|---------|--------|--------|------|
| Cross-dApp Queryability | Minimal | High | ✅ Yes |
| Developer Profile Page | Low | High | ✅ If time allows |
| Multi-Repo Aggregation | Medium | High | ❌ Post-MVP |
| Reputation NFT/Badge | Medium | Medium | ❌ Post-MVP |
| Reputation History | Medium | Medium | ❌ Post-MVP |
| GitHub OAuth | Medium | Medium | ❌ Post-MVP |
| Cross-Chain Bridge | High | Very High | ❌ Future |
| DAO Governance | High | High | ❌ Future |
| Continuous Monitoring | High | Medium | ❌ Future |
