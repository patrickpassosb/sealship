// Sealship — Database Client (Supabase/PostgreSQL)
// Handles all persistent storage using Supabase JS client
//
// DATABASE DESIGN:
// - repositories: Stores unique GitHub repositories
// - analyses: Stores each analysis run with scores, status, and references
// - leaderboard: View for ranking repositories
//
// WHY SUPABASE?
// - Production ready: Scalable PostgreSQL on the cloud
// - Vercel Friendly: SQLite is not persistent on serverless environments
// - Real-time: Built-in support for real-time listeners (optional)

import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/lib/supabase';
import { ScoringResult, AnalysisStatus } from '@/types';

// ============================================================================
// Database Interfaces
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

export interface LeaderboardEntry {
    owner: string;
    name: string;
    url: string;
    commit_sha: string;
    total_score: number;
    report_cid?: string;
    analyzed_at: string;
    id: string; 
}

// ============================================================================
// Database Operations
// ============================================================================

/**
 * Get or create a repository by URL.
 */
export async function getOrCreateRepository(owner: string, name: string): Promise<DbRepository> {
    const url = `https://github.com/${owner}/${name}`;

    const { data: existing, error: getError } = await supabase
        .from('repositories')
        .select('*')
        .eq('url', url)
        .single();

    if (existing) return existing as DbRepository;
    if (getError && getError.code !== 'PGRST116') { // PGRST116 is code for "no rows found"
        console.error('Supabase getOrCreateRepository error:', getError);
    }

    const id = uuidv4();
    const { data: inserted, error: insertError } = await supabase
        .from('repositories')
        .insert([{ id, owner, name, url }])
        .select()
        .single();

    if (insertError) {
        throw new Error(`Failed to create repository: ${insertError.message}`);
    }

    return inserted as DbRepository;
}

/**
 * Create a new analysis record.
 */
export async function createAnalysis(repositoryId: string, commitSha: string, repoHash: string): Promise<DbAnalysis> {
    const id = uuidv4();
    
    const { data, error } = await supabase
        .from('analyses')
        .insert([{
            id,
            repository_id: repositoryId,
            commit_sha: commitSha,
            repo_hash: repoHash,
            total_score: 0,
            documentation_score: 0,
            testing_score: 0,
            architecture_score: 0,
            hygiene_score: 0,
            security_score: 0,
            status: 'analyzing'
        }])
        .select()
        .single();

    if (error) {
        throw new Error(`Failed to create analysis: ${error.message}`);
    }

    return data as DbAnalysis;
}

/**
 * Update analysis scoring results.
 */
export async function updateAnalysisScores(id: string, result: ScoringResult): Promise<void> {
    const { error } = await supabase
        .from('analyses')
        .update({
            total_score: result.totalScore,
            documentation_score: result.categories.documentation.score,
            testing_score: result.categories.testing.score,
            architecture_score: result.categories.architecture.score,
            hygiene_score: result.categories.hygiene.score,
            security_score: result.categories.security.score,
            status: 'scoring'
        })
        .eq('id', id);

    if (error) {
        console.error('Supabase updateAnalysisScores error:', error);
    }
}

/**
 * Update analysis AI report.
 */
export async function updateAnalysisAI(id: string, aiAnalysis: string): Promise<void> {
    const { error } = await supabase
        .from('analyses')
        .update({
            ai_analysis: aiAnalysis,
            status: 'ai_analysis'
        })
        .eq('id', id);

    if (error) {
        console.error('Supabase updateAnalysisAI error:', error);
    }
}

/**
 * Update IPFS CID.
 */
export async function updateAnalysisIPFS(id: string, cid: string): Promise<void> {
    const { error } = await supabase
        .from('analyses')
        .update({
            report_cid: cid,
            status: 'uploading_ipfs'
        })
        .eq('id', id);

    if (error) {
        console.error('Supabase updateAnalysisIPFS error:', error);
    }
}

/**
 * Update blockchain transaction hash (finalize).
 */
export async function finalizeAnalysis(id: string, txHash: string): Promise<void> {
    const { error } = await supabase
        .from('analyses')
        .update({
            tx_hash: txHash,
            status: 'completed'
        })
        .eq('id', id);

    if (error) {
        console.error('Supabase finalizeAnalysis error:', error);
    }
}

/**
 * Mark analysis as failed.
 */
export async function failAnalysis(id: string): Promise<void> {
    const { error } = await supabase
        .from('analyses')
        .update({ status: 'failed' })
        .eq('id', id);

    if (error) {
        console.error('Supabase failAnalysis error:', error);
    }
}

/**
 * Get an analysis by ID.
 */
export async function getAnalysis(id: string): Promise<(DbAnalysis & { repo_url?: string }) | null> {
    const { data, error } = await supabase
        .from('analyses')
        .select('*, repositories(url)')
        .eq('id', id)
        .single();

    if (error) {
        if (error.code !== 'PGRST116') {
            console.error('Supabase getAnalysis error:', error);
        }
        return null;
    }

    const { repositories, ...analysis } = data as DbAnalysis & { repositories?: { url: string } };
    return { ...analysis, repo_url: repositories?.url ?? null };
}

/**
 * Get the global leaderboard.
 */
export async function getLeaderboard(limit = 50): Promise<LeaderboardEntry[]> {
    const { data, error } = await supabase
        .from('leaderboard')
        .select('*')
        .limit(limit);

    if (error) {
        console.error('Supabase getLeaderboard error:', error);
        return [];
    }

    return data as LeaderboardEntry[];
}

/**
 * Get analysis history for a repository.
 */
export async function getRepositoryHistory(repositoryId: string): Promise<DbAnalysis[]> {
    const { data, error } = await supabase
        .from('analyses')
        .select('*')
        .eq('repository_id', repositoryId)
        .eq('status', 'completed')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Supabase getRepositoryHistory error:', error);
        return [];
    }

    return data as DbAnalysis[];
}

// Export the underlying supabase instance for custom queries
export default supabase;
