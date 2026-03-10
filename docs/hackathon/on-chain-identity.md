# Polkadot On-Chain Identity: The Winner's Guide 🏆

To win the **Polkadot Solidity Hackathon 2026**, "Sealship" and its team members must have a **Verified On-Chain Identity**. This guide explains what it is, how much it costs, and the exact steps to get that "Green Checkmark."

---

## 1. What is On-Chain Identity?
Polkadot replaces anonymous addresses (like `0x123...`) with a decentralized naming system. It allows you to link your account to:
- **Display Name** (e.g., `Sealship_Team`)
- **Email** (for verification)
- **Website/X (Twitter)** (for social proof)

### The "People Chain"
Identity doesn't live on the main Polkadot Relay Chain anymore. It lives on a specialized "System Parachain" called the **People Chain**. Think of it as the "Address Book" for the entire Polkadot ecosystem.

---

## 2. Can I use MetaMask? 🦊
**The short answer: No (for Identity), but Yes (for Coding).**

- **Coding (Polkadot Hub):** Yes! You use MetaMask to deploy your Solidity contracts.
- **Identity (People Chain):** No. MetaMask uses "Ethereum-style" cryptography. The People Chain uses "Substrate-style" cryptography.
- **The Best Strategy:** Use a wallet like **Talisman** or **SubWallet**. These extensions support both EVM (MetaMask) and Substrate (Polkadot) addresses in one place. You can "import" your MetaMask seed into them if you want to keep the same private keys.

---

## 3. How much will it cost? (March 2026 Estimates)
Costs are split between a **Bond** (locked money) and a **Fee** (spent money).

| Item | Cost (DOT) | Cost (USD @ $1.45) | Type |
| :--- | :--- | :--- | :--- |
| **Base Identity Bond** | ~20.26 DOT | **~$29.38** | **Refundable** (Locked) |
| **Registrar Fee** | 0.1 - 1.0 DOT | **~$0.15 - $1.45** | **Spent** |
| **Transaction Fees** | < 0.01 DOT | **~$0.01** | **Spent** |
| **Total Initial Outlay** | **~21.26 DOT** | **~$30.84** | — |

*Note: The **Bond** is returned to you if you ever "clear" or delete your identity.*

---

## 4. Step-by-Step Instructions

### Step 1: Fund Your Wallet
1. Get at least **22 DOT**.
2. Transfer it to your **Polkadot People Chain** address. (Most wallets have a "Teleport" or "Cross-chain transfer" button to move DOT from the Relay Chain to the People Chain).

### Step 2: Register Your Info
1. Go to **[Polkassembly](https://polkassembly.io/)** or **[PolkaIdentity](https://polkaidentity.com/)**.
2. Connect your Substrate wallet (Talisman/SubWallet).
3. Select **"Set Identity"**.
4. Fill in:
   - **Display Name:** `Sealship` (or your team name).
   - **Email:** (Required for verification).
   - **Twitter/X:** (Highly recommended for judges).
5. Sign the transaction (this locks the ~20.26 DOT bond).

### Step 3: Request "Judgement" (Verification)
Your identity is now "Unverified" (no checkmark). To get the **Green Checkmark**:
1. Choose an active **Registrar** (e.g., Registrar 1 or 3).
2. Click **"Request Judgement"** and pay their small fee (~0.1 - 0.5 DOT).
3. The Registrar will send a verification code to your email/X.
4. Follow their instructions to provide the code back to them.
5. Once they verify, a **Green Checkmark** will appear next to your name!

---

## 5. Why do this?
- **Prize Requirement:** Hackathon rules explicitly state winners must be verified.
- **Trust:** Judges trust a "Verified" project more than an anonymous one.
- **Governance:** You'll need this to participate in Polkadot OpenGov or apply for larger ecosystem grants later.

---
*Last Updated: Tuesday, March 10, 2026*
