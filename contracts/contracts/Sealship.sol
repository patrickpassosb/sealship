// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/**
 * @title Sealship
 * @dev Core smart contract for recording verifiable GitHub repository scores on Polkadot Hub.
 */
contract Sealship {
    
    struct RepoScore {
        bytes32 repoHash;     // keccak256(repoUrl + commitSha)
        uint256 score;        // 0-100 score
        string reportCID;     // IPFS hash of the JSON report
        address submitter;    // Wallet that submitted the analysis
        uint256 timestamp;    // Block timestamp
        string repoUrl;       // Full URL, e.g., https://github.com/owner/repo
    }

    // Mapping to store scores by Repo Hash
    mapping(bytes32 => RepoScore) public scores;

    // Mapping to store the history of hashes submitted by a specific user
    mapping(address => bytes32[]) public userSubmissions;

    // Leaderboard support (storing all hashes to allow fetching ranking off-chain or via views)
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
     * @param _repoHash The keccak256 hash identifying the repo snapshot.
     * @param _score The 0-100 calculated score.
     * @param _reportCID IPFS CID of the generated report.
     * @param _repoUrl The original GitHub URL.
     */
    function recordScore(
        bytes32 _repoHash,
        uint256 _score,
        string memory _reportCID,
        string memory _repoUrl
    ) external {
        require(_score <= 100, "Score must be between 0 and 100");
        require(bytes(_reportCID).length > 0, "Report CID cannot be empty");
        require(bytes(_repoUrl).length > 0, "Repo URL cannot be empty");

        // Allow updates to the same repoHash (e.g., if re-analyzed with same commit but updated rules)
        // Usually, a new commit means a new repoHash anyway.
        bool isNew = scores[_repoHash].timestamp == 0;

        scores[_repoHash] = RepoScore({
            repoHash: _repoHash,
            score: _score,
            reportCID: _reportCID,
            submitter: msg.sender,
            timestamp: block.timestamp,
            repoUrl: _repoUrl
        });

        if (isNew) {
            userSubmissions[msg.sender].push(_repoHash);
            allVerifiedHashes.push(_repoHash);
        }

        emit ScoreRecorded(_repoHash, msg.sender, _score, _reportCID, _repoUrl, block.timestamp);
    }

    /**
     * @dev Retrieves a score assigned to a specific repoHash.
     */
    function getScore(bytes32 _repoHash) external view returns (RepoScore memory) {
        require(scores[_repoHash].timestamp != 0, "Score not found");
        return scores[_repoHash];
    }

    /**
     * @dev Retrieves all scores submitted by a specific wallet address.
     */
    function getScoresBySubmitter(address _submitter) external view returns (RepoScore[] memory) {
        bytes32[] memory hashes = userSubmissions[_submitter];
        RepoScore[] memory submitterScores = new RepoScore[](hashes.length);
        
        for (uint256 i = 0; i < hashes.length; i++) {
            submitterScores[i] = scores[hashes[i]];
        }
        
        return submitterScores;
    }

    /**
     * @dev Gets the total count of verified repositories.
     */
    function getTotalVerifiedCount() external view returns (uint256) {
        return allVerifiedHashes.length;
    }
}
