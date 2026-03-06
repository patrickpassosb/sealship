// Sealship — Database Client (SQLite)
// Handles all persistent storage using better-sqlite3
//
// DATABASE DESIGN:
// - repositories: Stores unique GitHub repositories
// - analyses: Stores each analysis run with scores, status, and references
// - leaderboard: View for ranking repositories
//
// WHY SQLITE?
// - Zero configuration - no database server needed
// - Perfect for a hackathon/MVP
// - ACID compliant - reliable transactions
// - better-sqlite3 - synchronous, simple API, fast
//
// WAL MODE:
// Write-Ahead Logging improves concurrent read performance
// Important for the polling-based UI (many readers, occasional writers)

import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

import { ScoringResult, AnalysisStatus } from '@/types';

// Database file location - defaults to ./data/sealship.db
const DB_PATH = process.env.DB_PATH || path.join(process.cwd(), 'data', 'sealship.db');

// Ensure data directory exists before connecting
const dbDir = path.dirname(DB_PATH);
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

// Connect to database
const db = new Database(DB_PATH);
try {
    // WAL mode allows concurrent reads while writing
    // This is crucial for our polling-based frontend
    db.pragma('journal_mode = WAL');

    // Initialize schema from schema.sql if it exists
    // This creates tables if they don't exist on first run
    const schemaPath = path.join(process.cwd(), 'src', 'lib', 'db', 'schema.sql');
    if (fs.existsSync(schemaPath)) {
        const schema = fs.readFileSync(schemaPath, 'utf8');
        db.exec(schema);
    }
} catch (e: unknown) {
    // Ignore SQLITE_BUSY errors during Next.js parallel builds
    // This can happen when multiple server instances start simultaneously
    if ((e as { code?: string }).code !== 'SQLITE_BUSY') {
        console.warn('DB Init warning:', e);
    }
}

// ============================================================================
// Database Operations
// ============================================================================

export interface DbRepository {
    id: string;
    owner: string;
    name: string;
    url: string;
    created_at: string;
}

export interface DbAnalysis {
    id: string;
    repository_id: string;
    commit_sha: string;
    repo_hash: string;
    total_score: number;
    documentation_score: number;
    testing_score: number;
    architecture_score: number;
    hygiene_score: number;
    security_score: number;
    ai_analysis: string | null;
    report_cid: string | null;
    tx_hash: string | null;
    status: AnalysisStatus;
    created_at: string;
}

/**
 * Get or create a repository by URL.
 */
export function getOrCreateRepository(owner: string, name: string): DbRepository {
    const url = `https://github.com/${owner}/${name}`;

    const existing = db.prepare('SELECT * FROM repositories WHERE url = ?').get(url) as DbRepository;
    if (existing) return existing;

    const id = uuidv4();
    db.prepare('INSERT INTO repositories (id, owner, name, url) VALUES (?, ?, ?, ?)').run(id, owner, name, url);
    return db.prepare('SELECT * FROM repositories WHERE id = ?').get(id) as DbRepository;
}

/**
 * Create a new analysis record.
 */
export function createAnalysis(repositoryId: string, commitSha: string, repoHash: string): DbAnalysis {
    const id = uuidv4();
    const stmt = db.prepare(`
    INSERT INTO analyses (
      id, repository_id, commit_sha, repo_hash,
      total_score, documentation_score, testing_score, architecture_score, hygiene_score, security_score,
      status
    ) VALUES (
      ?, ?, ?, ?,
      0, 0, 0, 0, 0, 0,
      'analyzing'
    )
  `);

    stmt.run(id, repositoryId, commitSha, repoHash);
    return getAnalysis(id)!;
}

/**
 * Update analysis scoring results.
 */
export function updateAnalysisScores(id: string, result: ScoringResult): void {
    db.prepare(`
    UPDATE analyses SET
      total_score = ?,
      documentation_score = ?,
      testing_score = ?,
      architecture_score = ?,
      hygiene_score = ?,
      security_score = ?,
      status = 'scoring'
    WHERE id = ?
  `).run(
        result.totalScore,
        result.categories.documentation.score,
        result.categories.testing.score,
        result.categories.architecture.score,
        result.categories.hygiene.score,
        result.categories.security.score,
        id
    );
}

/**
 * Update analysis AI report.
 */
export function updateAnalysisAI(id: string, aiAnalysis: string): void {
    db.prepare("UPDATE analyses SET ai_analysis = ?, status = 'ai_analysis' WHERE id = ?").run(aiAnalysis, id);
}

/**
 * Update IPFS CID.
 */
export function updateAnalysisIPFS(id: string, cid: string): void {
    db.prepare("UPDATE analyses SET report_cid = ?, status = 'uploading_ipfs' WHERE id = ?").run(cid, id);
}

/**
 * Update blockchain transaction hash (finalize).
 */
export function finalizeAnalysis(id: string, txHash: string): void {
    db.prepare("UPDATE analyses SET tx_hash = ?, status = 'completed' WHERE id = ?").run(txHash, id);
}

/**
 * Mark analysis as failed.
 */
export function failAnalysis(id: string): void {
    db.prepare("UPDATE analyses SET status = 'failed' WHERE id = ?").run(id);
}

/**
 * Get an analysis by ID.
 */
export function getAnalysis(id: string): DbAnalysis | null {
    return db.prepare('SELECT * FROM analyses WHERE id = ?').get(id) as DbAnalysis | null;
}

export interface LeaderboardEntry {
    id: string;
    owner: string;
    name: string;
    total_score: number;
    report_cid?: string;
    commit_sha: string;
    tx_hash?: string;
}

/**
 * Get the global leaderboard.
 */
export function getLeaderboard(limit = 50): LeaderboardEntry[] {
    return db.prepare('SELECT * FROM leaderboard LIMIT ?').all(limit) as LeaderboardEntry[];
}

/**
 * Get analysis history for a repository.
 */
export function getRepositoryHistory(repositoryId: string): DbAnalysis[] {
    return db.prepare(`
    SELECT * FROM analyses 
    WHERE repository_id = ? AND status = 'completed'
    ORDER BY created_at DESC
  `).all(repositoryId) as DbAnalysis[];
}

// Export the underlying db instance for custom queries
export default db;
