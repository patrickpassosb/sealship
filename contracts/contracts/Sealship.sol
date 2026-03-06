// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/**
 * @title Sealship
 * @dev Core smart contract for recording verifiable GitHub repository scores on Polkadot Hub.
 *
 * HOW IT WORKS:
 * 1. Users analyze repos through the frontend → generates a deterministic score (0-100)
 * 2. Score + report is uploaded to IPFS → returns an immutable CID
 * 3. User calls recordScore() with: repoHash (keccak256), score, IPFS CID, repo URL
 * 4. Contract stores these permanently on-chain → anyone can verify authenticity later
 *
 * KEY DESIGN DECISIONS:
 * - repoHash = keccak256(repoUrl + commitSha) ensures each score is tied to a specific snapshot
 * - If the same repo is re-analyzed at a different commit, it gets a different hash (allows updates)
 * - We don't store the full score history per repo, just the latest for each unique hash
 * - All hashes are stored in allVerifiedHashes[] to support off-chain leaderboard queries
 */
contract Sealship {
    
    /**
     * @dev Storage structure for each verified repository score.
     * 
     * repoHash: The unique identifier - keccak256(repoURL + commitSHA)
     *         This means different commits of the same repo = different hashes
     *         This allows re-scoring without losing the original record
     * 
     * score: 0-100 quality score from the Sealship algorithm
     * 
     * reportCID: IPFS Content Identifier pointing to the full JSON report
     *          This report contains the detailed breakdown, signals, and AI analysis
     *          The CID makes the report permanently accessible without a central server
     * 
     * submitter: The wallet address that recorded this score - enables reputation tracking
     * 
     * timestamp: Block.timestamp when recorded - provides temporal ordering
     * 
     * repoUrl: The original GitHub URL for human verification
     */
    struct RepoScore {
        bytes32 repoHash;
        uint256 score;
        string reportCID;
        address submitter;
        uint256 timestamp;
        string repoUrl;
    }

    /**
     * @dev Primary lookup: maps a repo hash to its score record.
     * 
     * Using a hash (instead of repo URL) as the key serves two purposes:
     * 1. Fixed-size key (32 bytes) vs variable-length URL strings
     * 2. Ensures each unique commit snapshot has its own record
     * 
     * Note: This allows overwriting. If someone re-analyzes the same commit,
     * the new score replaces the old one. This is intentional for the MVP.
     */
    mapping(bytes32 => RepoScore) public scores;

    /**
     * @dev Tracks all submissions per wallet address.
     * 
     * This enables the "Developer Reputation" feature - users can see
     * all repositories they've verified, building their on-chain identity.
     */
    mapping(address => bytes32[]) public userSubmissions;

    /**
     * @dev Global array of all verified hashes for leaderboard queries.
     * 
     * Since Solidity doesn't support returning sorted data easily,
     * we store all hashes and let off-chain services build rankings.
     * The array length also serves as getTotalVerifiedCount().
     */
    bytes32[] public allVerifiedHashes;

    // Events
    event ScoreRecorded(
        bytes32 indexed repoHash,
        address indexed submitter,
        uint256 score,
        string reportCID,
        string repoUrl,
        uint256 timestamp
    );

    /**
     * @dev Records a new repository score on-chain.
     * 
     * IMPORTANT: This function trusts that the caller has already:
     * 1. Run the Sealship scoring algorithm locally
     * 2. Uploaded the report to IPFS
     * 
     * The contract doesn't verify the score - it trusts the caller.
     * This keeps the contract simple and cheap (no on-chain computation).
     * 
     * In a v2, we could add staking/bonding to disincentivize false scores.
     *
     * @param _repoHash The keccak256 hash identifying the repo snapshot
     * @param _score The 0-100 calculated score
     * @param _reportCID IPFS CID of the generated report
     * @param _repoUrl The original GitHub URL
     */
    function recordScore(
        bytes32 _repoHash,
        uint256 _score,
        string memory _reportCID,
        string memory _repoUrl
    ) external {
        // Input validation - basic sanity checks
        require(_score <= 100, "Score must be between 0 and 100");
        require(bytes(_reportCID).length > 0, "Report CID cannot be empty");
        require(bytes(_repoUrl).length > 0, "Repo URL cannot be empty");

        /**
         * @dev Check if this is a new submission or an update.
         * 
         * We detect "newness" by checking if timestamp is 0 (default value).
         * If timestamp > 0, this repoHash was already recorded.
         * 
         * Why allow updates? The scoring algorithm may improve over time.
         * A repo analyzed today might score differently with tomorrow's algorithm.
         * 
         * Trade-off: We lose the original score but keep things simple.
         * Alternative: Store an array of scores per hash (more gas, more complexity)
         */
        bool isNew = scores[_repoHash].timestamp == 0;

        // Store the score record - overwrites if it exists
        scores[_repoHash] = RepoScore({
            repoHash: _repoHash,
            score: _score,
            reportCID: _reportCID,
            submitter: msg.sender,
            timestamp: block.timestamp,
            repoUrl: _repoUrl
        });

        // Only track in global arrays if this is truly new
        // This prevents inflating the "total verified count" with updates
        if (isNew) {
            userSubmissions[msg.sender].push(_repoHash);
            allVerifiedHashes.push(_repoHash);
        }

        // Emit event for off-chain listeners (indexed fields allow filtering)
        emit ScoreRecorded(_repoHash, msg.sender, _score, _reportCID, _repoUrl, block.timestamp);
    }

    /**
     * @dev Retrieves a score assigned to a specific repoHash.
     * 
     * @param _repoHash The keccak256 hash to look up
     * @return The complete RepoScore struct
     * 
     * @notice Reverts if the hash has never been recorded.
     *         Frontends should handle this gracefully.
     */
    function getScore(bytes32 _repoHash) external view returns (RepoScore memory) {
        require(scores[_repoHash].timestamp != 0, "Score not found");
        return scores[_repoHash];
    }

    /**
     * @dev Retrieves all scores submitted by a specific wallet address.
     * 
     * This enables the "Developer Reputation" feature - showing all
     * repositories a wallet has verified on-chain.
     * 
     * Note: We're returning a dynamically-sized array, which has a
     * gas cost proportional to the number of submissions. For wallets
     * with many submissions, pagination might be needed in v2.
     *
     * @param _submitter The wallet address to query
     * @return Array of all RepoScores submitted by this address
     */
    function getScoresBySubmitter(address _submitter) external view returns (RepoScore[] memory) {
        bytes32[] memory hashes = userSubmissions[_submitter];
        
        // Create array of correct size (Solidity requires fixed size at compilation)
        RepoScore[] memory submitterScores = new RepoScore[](hashes.length);
        
        // Populate by looking up each hash in the scores mapping
        for (uint256 i = 0; i < hashes.length; i++) {
            submitterScores[i] = scores[hashes[i]];
        }
        
        return submitterScores;
    }

    /**
     * @dev Gets the total count of verified repositories.
     * 
     * This is simply the length of the allVerifiedHashes array.
     * Note: This counts UNIQUE repo snapshots, not unique repos.
     * The same repo at different commits counts multiple times.
     *
     * @return Total number of verification records in the contract
     */
    function getTotalVerifiedCount() external view returns (uint256) {
        return allVerifiedHashes.length;
    }
}
