-- Sealship Database Schema (SQLite)

-- Repositories table stores metadata about analyzed repositories
CREATE TABLE IF NOT EXISTS repositories (
    id TEXT PRIMARY KEY,
    owner TEXT NOT NULL,
    name TEXT NOT NULL,
    url TEXT NOT NULL UNIQUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Analyses table stores individual scoring runs and AI reports
CREATE TABLE IF NOT EXISTS analyses (
    id TEXT PRIMARY KEY,
    repository_id TEXT NOT NULL,
    commit_sha TEXT NOT NULL,
    repo_hash TEXT NOT NULL,
    total_score INTEGER NOT NULL,
    documentation_score INTEGER NOT NULL,
    testing_score INTEGER NOT NULL,
    architecture_score INTEGER NOT NULL,
    hygiene_score INTEGER NOT NULL,
    security_score INTEGER NOT NULL,
    ai_analysis TEXT,
    report_cid TEXT,
    tx_hash TEXT,
    status TEXT NOT NULL, -- 'analyzing', 'completed', 'failed'
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(repository_id) REFERENCES repositories(id)
);

-- Index for faster lookups based on repo hash and status
CREATE INDEX IF NOT EXISTS idx_analyses_repo_hash ON analyses(repo_hash);
CREATE INDEX IF NOT EXISTS idx_analyses_status ON analyses(status);

-- Leaderboard view for easy querying of Top repositories
CREATE VIEW IF NOT EXISTS leaderboard AS
SELECT 
    r.owner,
    r.name,
    r.url,
    a.commit_sha,
    a.total_score,
    a.report_cid,
    a.created_at as analyzed_at
FROM repositories r
JOIN analyses a ON r.id = a.repository_id
WHERE a.status = 'completed'
  AND a.id = (
      -- Only get the latest successful analysis for each repository
      SELECT id FROM analyses a2 
      WHERE a2.repository_id = r.id AND a2.status = 'completed'
      ORDER BY created_at DESC LIMIT 1
  )
ORDER BY a.total_score DESC, a.created_at DESC;
