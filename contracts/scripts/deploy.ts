import { network } from "hardhat";

function assertPolkadotEnv() {
    const required = ["POLKADOT_RPC_URL", "POLKADOT_PRIVATE_KEY"] as const;
    const missing = required.filter((key) => !process.env[key]);

    if (missing.length > 0) {
        throw new Error(
            `Missing required env vars for testnet deploy: ${missing.join(", ")}. ` +
            "Set them in ../.env before deploying to polkadotHubTestNet."
        );
    }
}

async function main() {
    const { viem } = await network.connect();
    const networkName = process.env.HARDHAT_NETWORK || "hardhat";

    console.log(`Deploying Sealship contract on network: ${networkName}`);

    if (networkName === "polkadotHubTestNet") {
        assertPolkadotEnv();
    }

    const sealship = await viem.deployContract("Sealship");
    const address = sealship.address;

    console.log(`Sealship deployed to: ${address}`);

    console.log("");
    console.log("To use this contract in the frontend:");
    console.log(`1. Copy the address: ${address}`);
    console.log(`2. Update NEXT_PUBLIC_CONTRACT_ADDRESS in /.env`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
