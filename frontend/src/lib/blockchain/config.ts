// Sealship — Web3 Configuration (Wagmi + Viem)
// Configures connection to Polkadot Hub TestNet
//
// STACK CHOICES:
// - Wagmi: React hooks for Ethereum - simplifies wallet connections
// - Viem: Low-level Ethereum library - lighter than ethers.js
// - Injected connector: Uses browser wallet (MetaMask, Rabby, etc.)
//
// WHY POLKADOT HUB?
// Polkadot Hub is an Ethereum Layer-2 scaling solution built on Polkadot.
// It offers:
// - EVM compatibility (same tools as Ethereum)
// - Very low fees (compared to mainnet)
// - Testnet with free tokens from faucet
// - Built on Polkadot's security
//
// CHAIN ID: 420420417 (Polkadot Hub TestNet)

import { http, createConfig } from 'wagmi';
import { injected } from 'wagmi/connectors';

// Import from viem to define the custom chain
import { defineChain } from 'viem';

/**
 * Polkadot Hub TestNet chain definition
 * 
 * Note: This is the TESTNET, not mainnet.
 * Tokens are free from the faucet - do NOT use real funds.
 * 
 * Key properties:
 * - id: 420420417 - unique identifier for this chain
 * - nativeCurrency: PAS (Polkadot Anonymous Stash) - the test token
 * - rpcUrls: How to communicate with the network
 * - blockExplorers: Blockscout for viewing transactions
 * - testnet: true - tells libraries this is not production
 */
export const polkadotHubTestNet = defineChain({
    id: 420420417,
    name: 'Polkadot Hub TestNet',
    nativeCurrency: { name: 'Polkadot', symbol: 'PAS', decimals: 18 },
    rpcUrls: {
        default: { http: ['https://eth-rpc-testnet.polkadot.io'] },
        public: { http: ['https://eth-rpc-testnet.polkadot.io'] },
    },
    blockExplorers: {
        default: { name: 'Blockscout', url: 'https://blockscout-testnet.polkadot.io' },
    },
    testnet: true,
});

// Create Wagmi Config
// This initializes the Web3 connection manager
export const config = createConfig({
    chains: [polkadotHubTestNet],
    connectors: [
        // "injected" connector uses the browser's wallet extension
        // (MetaMask, Coinbase Wallet, Rabby, etc.)
        injected(),
    ],
    transports: {
        // HTTP transport for RPC calls
        // In production, you might add WebSocket for real-time updates
        [polkadotHubTestNet.id]: http(),
    },
});

// Contract address - set after deployment
// In production, this MUST be updated to the actual deployed address
export const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '0xafcdfc86e0f0076dbce64c0f034310b2efe79589';

/**
 * Contract ABI (Application Binary Interface)
 * 
 * This tells JavaScript how to call the Solidity contract functions.
 * We only include what we need - minimal ABI.
 * 
 * Functions:
 * - recordScore: Submit a new verification
 * - getScore: Query a repo's score
 * - getScoresBySubmitter: Get all scores from a wallet
 * - getTotalVerifiedCount: Get total verifications
 * 
 * Events:
 * - ScoreRecorded: Emitted when score is recorded (for indexing)
 */
export const CONTRACT_ABI = [
    "function recordScore(bytes32 _repoHash, uint256 _score, string memory _reportCID, string memory _repoUrl) external",
    "function getScore(bytes32 _repoHash) external view returns (tuple(bytes32 repoHash, uint256 score, string reportCID, address submitter, uint256 timestamp, string repoUrl))",
    "function getScoresBySubmitter(address _submitter) external view returns (tuple(bytes32 repoHash, uint256 score, string reportCID, address submitter, uint256 timestamp, string repoUrl)[])",
    "function getTotalVerifiedCount() external view returns (uint256)",
    "event ScoreRecorded(bytes32 indexed repoHash, address indexed submitter, uint256 score, string reportCID, string repoUrl, uint256 timestamp)"
];
