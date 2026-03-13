import { defineConfig } from "hardhat/config";
import hardhatToolboxViem from "@nomicfoundation/hardhat-toolbox-viem";

// Try to load variables from the root .env file
import * as dotenv from "dotenv";
import * as path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const RAW_KEY = process.env.POLKADOT_PRIVATE_KEY ?? "";
// Accept keys with or without 0x prefix; normalize to bare hex for Hardhat
const PRIVATE_KEY = RAW_KEY.startsWith("0x") ? RAW_KEY.slice(2) : RAW_KEY;
const POLKADOT_RPC_URL = process.env.POLKADOT_RPC_URL || "https://eth-rpc-testnet.polkadot.io";
const hasPrivateKey = /^[0-9a-fA-F]{64}$/.test(PRIVATE_KEY);

const config = defineConfig({
    plugins: [hardhatToolboxViem],
    solidity: "0.8.28",
    networks: {
        // Polkadot Hub TestNet parameters
        polkadotHubTestNet: {
            type: "http",
            chainType: "l1", // Default since it's an EVM compatible chain
            url: POLKADOT_RPC_URL,
            accounts: hasPrivateKey ? [PRIVATE_KEY] : []
        },
        // Useful for local testing before deploying to testnet
        hardhat: {
            type: "edr-simulated",
            chainType: "l1"
        }
    }
});

export default config;
