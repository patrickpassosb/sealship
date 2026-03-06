import { ethers } from "hardhat";

async function main() {
    console.log("Deploying Sealship contract...");

    const Sealship = await ethers.getContractFactory("Sealship");
    const sealship = await Sealship.deploy();

    await sealship.waitForDeployment();

    const address = await sealship.getAddress();
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
