import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { network } from "hardhat";
import { keccak256, stringToHex } from "viem";

describe("Sealship", function () {
    let viem: Awaited<ReturnType<typeof network.connect>>["viem"];
    let sealship: Awaited<ReturnType<typeof viem.deployContract<"Sealship">>>;

    beforeEach(async function () {
        const connection = await network.connect();
        viem = connection.viem;
        sealship = await viem.deployContract("Sealship");
    });

    it("Should record a valid score and emit ScoreRecorded event", async function () {
        const repoHash = keccak256(stringToHex("https://github.com/test/repo#abc1234"));
        const score = 85n;
        const reportCID = "bafybeigexample";
        const repoUrl = "https://github.com/test/repo";

        // Record score
        const txHash = await sealship.write.recordScore([repoHash, score, reportCID, repoUrl]);

        // Verify event was emitted by checking contract events
        const publicClient = await viem.getPublicClient();
        const events = await publicClient.getContractEvents({
            address: sealship.address,
            abi: sealship.abi,
            eventName: "ScoreRecorded",
            fromBlock: 0n,
            strict: true,
        });
        assert.equal(events.length, 1);
        assert.equal(events[0].args.repoHash, repoHash);
        assert.equal(events[0].args.score, score);
        assert.equal(events[0].args.reportCID, reportCID);
        assert.equal(events[0].args.repoUrl, repoUrl);

        // Verify stored data
        const stored = await sealship.read.getScore([repoHash]);
        assert.equal(stored.score, score);
        assert.equal(stored.reportCID, reportCID);
        assert.equal(stored.repoUrl, repoUrl);
        assert.equal(stored.repoHash, repoHash);
        assert.ok(stored.timestamp > 0n);
    });

    it("Should reject score greater than 100", async function () {
        const repoHash = keccak256(stringToHex("https://github.com/test/repo#abc1234"));

        await assert.rejects(
            sealship.write.recordScore([repoHash, 101n, "bafybeigexample", "https://github.com/test/repo"]),
            (error: Error) => {
                assert.ok(error.message.includes("Score must be between 0 and 100"));
                return true;
            }
        );
    });

    it("Should reject empty CID and empty repo URL", async function () {
        const repoHash = keccak256(stringToHex("https://github.com/test/repo#abc1234"));

        // Empty CID
        await assert.rejects(
            sealship.write.recordScore([repoHash, 50n, "", "https://github.com/test/repo"]),
            (error: Error) => {
                assert.ok(error.message.includes("Report CID cannot be empty"));
                return true;
            }
        );

        // Empty repo URL
        await assert.rejects(
            sealship.write.recordScore([repoHash, 50n, "bafybeigexample", ""]),
            (error: Error) => {
                assert.ok(error.message.includes("Repo URL cannot be empty"));
                return true;
            }
        );
    });

    it("Should update existing score without increasing total count", async function () {
        const repoHash = keccak256(stringToHex("https://github.com/test/repo#abc1234"));

        // First submission
        await sealship.write.recordScore([repoHash, 50n, "cid1", "https://github.com/test/repo"]);
        let total = await sealship.read.getTotalVerifiedCount();
        assert.equal(total, 1n);

        // Update same hash
        await sealship.write.recordScore([repoHash, 90n, "cid2", "https://github.com/test/repo"]);
        total = await sealship.read.getTotalVerifiedCount();
        assert.equal(total, 1n); // Should NOT increase

        // Verify updated values
        const stored = await sealship.read.getScore([repoHash]);
        assert.equal(stored.score, 90n);
        assert.equal(stored.reportCID, "cid2");
    });

    it("Should return all scores by submitter", async function () {
        const [client] = await viem.getWalletClients();
        const hash1 = keccak256(stringToHex("https://github.com/test/repo1#abc"));
        const hash2 = keccak256(stringToHex("https://github.com/test/repo2#def"));

        await sealship.write.recordScore([hash1, 80n, "cid1", "https://github.com/test/repo1"]);
        await sealship.write.recordScore([hash2, 60n, "cid2", "https://github.com/test/repo2"]);

        const scores = await sealship.read.getScoresBySubmitter([client.account.address]);
        assert.equal(scores.length, 2);
        assert.equal(scores[0].score, 80n);
        assert.equal(scores[1].score, 60n);
    });

    it("Should handle zero score and return correct total count", async function () {
        const hash1 = keccak256(stringToHex("https://github.com/test/repo1#abc"));
        const hash2 = keccak256(stringToHex("https://github.com/test/repo2#def"));

        // Minimum valid score
        await sealship.write.recordScore([hash1, 0n, "cid1", "https://github.com/test/repo1"]);
        const stored1 = await sealship.read.getScore([hash1]);
        assert.equal(stored1.score, 0n);

        // Maximum valid score
        await sealship.write.recordScore([hash2, 100n, "cid2", "https://github.com/test/repo2"]);
        const stored2 = await sealship.read.getScore([hash2]);
        assert.equal(stored2.score, 100n);

        const total = await sealship.read.getTotalVerifiedCount();
        assert.equal(total, 2n);
    });
});
