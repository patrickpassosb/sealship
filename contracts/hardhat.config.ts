import { HardhatUserConfig } from "hardhat/config";

// Try to load variables from the root .env file
import * as dotenv from "dotenv";
import * as path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const PRIVATE_KEY = process.env.POLKADOT_PRIVATE_KEY || "0000000000000000000000000000000000000000000000000000000000000000";


const config: HardhatUserConfig = {
    solidity: "0.8.28",
    networks: {
        // Polkadot Hub TestNet parameters
        polkadotHubTestNet: {
            type: "http",
            chainType: "l1", // Default since it's an EVM compatible chain
            url: process.env.POLKADOT_RPC_URL || "https://eth-rpc-testnet.polkadot.io",
            accounts: [PRIVATE_KEY]
        },
        // Useful for local testing before deploying to testnet
        hardhat: {
            type: "edr-simulated",
            chainType: "l1"
        }
    }
};

export default config;
