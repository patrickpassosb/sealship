// Sealship — Hash Utilities
// Provides keccak256 hashing for repository identification

import { keccak256, toHex, encodePacked } from 'viem';

/**
 * Generate a unique repository hash using keccak256.
 * Hash = keccak256(repoURL + commitSHA)
 *
 * This ensures each analysis is tied to a specific snapshot.
 * If the repo changes, the hash changes.
 */
export function generateRepoHash(repoUrl: string, commitSha: string): `0x${string}` {
    const packed = encodePacked(
        ['string', 'string'],
        [repoUrl, commitSha]
    );
    return keccak256(packed);
}

/**
 * Shorten a hash for display purposes.
 * Example: 0x1234abcd5678ef90... → 0x1234...ef90
 */
export function shortenHash(hash: string, chars: number = 4): string {
    if (hash.length <= chars * 2 + 2) return hash;
    return `${hash.slice(0, chars + 2)}...${hash.slice(-chars)}`;
}

/**
 * Shorten a commit SHA for display.
 * Example: 7f1a2b3c4d5e6f → 7f1a2b3
 */
export function shortenCommitSha(sha: string, length: number = 7): string {
    return sha.slice(0, length);
}
