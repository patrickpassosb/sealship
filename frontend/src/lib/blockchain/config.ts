// Sealship — Web3 Configuration (Wagmi + Viem)
// Configures connection to Polkadot Hub TestNet

import { http, createConfig } from 'wagmi';
import { injected } from 'wagmi/connectors';

// Import from viem to define the custom chain
import { defineChain } from 'viem';

// Define Polkadot Hub TestNet
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
export const config = createConfig({
    chains: [polkadotHubTestNet],
    connectors: [
        injected(),
    ],
    transports: {
        [polkadotHubTestNet.id]: http(),
    },
});

export const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000000'; // Will be updated after hardhat deployment

export const CONTRACT_ABI = [
    "function recordScore(bytes32 _repoHash, uint256 _score, string memory _reportCID, string memory _repoUrl) external",
    "function getScore(bytes32 _repoHash) external view returns (tuple(bytes32 repoHash, uint256 score, string reportCID, address submitter, uint256 timestamp, string repoUrl))",
    "function getScoresBySubmitter(address _submitter) external view returns (tuple(bytes32 repoHash, uint256 score, string reportCID, address submitter, uint256 timestamp, string repoUrl)[])",
    "function getTotalVerifiedCount() external view returns (uint256)",
    "event ScoreRecorded(bytes32 indexed repoHash, address indexed submitter, uint256 score, string reportCID, string repoUrl, uint256 timestamp)"
];
