// Sealship — Hash Utilities
// Provides keccak256 hashing for repository identification
//
// WHY KECCAK256?
// Keccak256 (the algorithm behind Ethereum's SHA-3) is:
// - Collision-resistant: Two different inputs won't produce the same hash
// - One-way: Can't derive input from hash
// - Fixed-size output: Always 32 bytes
// - Native to Solidity: Very cheap to compute on-chain
//
// HASH DESIGN:
// repoHash = keccak256(repoUrl + commitSha)
// 
// This creates a unique identifier for each repository snapshot:
// - Same repo, same commit → same hash (idempotent)
// - Same repo, different commit → different hash (tracks evolution)
// - Different repo → always different hash

import { keccak256, encodePacked } from 'viem';

/**
 * Generate a unique repository hash using keccak256.
 * 
 * Combines the repository URL and commit SHA into a single hash.
 * This is the key used throughout the system:
 * - In the database to identify analyses
 * - In IPFS for report filenames
 * - On-chain for score records
 * 
 * @param repoUrl - Full GitHub URL (e.g., https://github.com/owner/repo)
 * @param commitSha - The specific commit being analyzed
 * @returns Hex string starting with 0x (32 bytes)
 */
export function generateRepoHash(repoUrl: string, commitSha: string): `0x${string}` {
    // encodePacked combines values without padding - cheaper than ABI encoding
    const packed = encodePacked(
        ['string', 'string'],
        [repoUrl, commitSha]
    );
    // keccak256 is the Ethereum hash function
    return keccak256(packed);
}

/**
 * Shorten a hash for display purposes.
 * 
 * Full hashes are too long for UI - we show prefix and suffix.
 * This is safe because we're just displaying, not using it for verification.
 * 
 * @param hash - Full 0x-prefixed hash
 * @param chars - Number of chars to show on each end (default 4)
 * @returns Shortened string like "0x1234...abcd"
 */
export function shortenHash(hash: string, chars: number = 4): string {
    if (hash.length <= chars * 2 + 2) return hash;
    return `${hash.slice(0, chars + 2)}...${hash.slice(-chars)}`;
}

/**
 * Shorten a commit SHA for display.
 * 
 * Git commit SHAs are 40 characters (SHA-1), but 7 is enough
 * to uniquely identify a commit in most repositories.
 * 
 * @param sha - Full 40-character commit SHA
 * @param length - Number of characters to show (default 7)
 * @returns Shortened SHA
 */
export function shortenCommitSha(sha: string, length: number = 7): string {
    return sha.slice(0, length);
}
