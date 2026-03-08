import { network } from "hardhat";
import { keccak256, stringToHex } from "viem";

async function main() {
  const { viem } = await network.connect();
  const sealship = await viem.deployContract("Sealship");

  const repoHash = keccak256(stringToHex("https://github.com/foo/bar#abc123"));
  const score = 87n;
  const reportCID = "bafybeigdyrzt4examplecid";
  const repoUrl = "https://github.com/foo/bar";

  await sealship.write.recordScore([repoHash, score, reportCID, repoUrl]);

  const stored = await sealship.read.getScore([repoHash]);
  const total = await sealship.read.getTotalVerifiedCount();
  const storedScore = (stored as any).score ?? (stored as any)[1];

  if (storedScore !== score) {
    throw new Error(`Smoke test failed: expected score ${score}, got ${storedScore}`);
  }

  if (total !== 1n) {
    throw new Error(`Smoke test failed: expected total 1, got ${total}`);
  }

  console.log("Smoke test passed: deploy + recordScore + getScore + getTotalVerifiedCount");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
