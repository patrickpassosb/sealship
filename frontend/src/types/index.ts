// Shared TypeScript types for Sealship

// ---- Repository Types ----
export interface Repository {
    id: string;
    url: string;
    owner: string;
    name: string;
    defaultBranch: string;
    createdAt: string;
}

export interface RepositoryMetadata {
    owner: string;
    name: string;
    fullName: string;
    description: string | null;
    defaultBranch: string;
    language: string | null;
    languages: Record<string, number>;
    stars: number;
    forks: number;
    openIssues: number;
    createdAt: string;
    updatedAt: string;
    pushedAt: string;
    size: number;
    hasWiki: boolean;
    hasPages: boolean;
    license: string | null;
    topics: string[];
}

export interface FileTreeEntry {
    path: string;
    type: 'blob' | 'tree';
    size?: number;
}

// ---- Scoring Types ----
export type ScoreCategory =
    | 'documentation'
    | 'testing'
    | 'architecture'
    | 'hygiene'
    | 'security';

export interface CategoryScore {
    category: ScoreCategory;
    score: number;
    maxScore: number;
    signals: Signal[];
}

export interface Signal {
    name: string;
    description: string;
    found: boolean;
    points: number;
    maxPoints: number;
    details?: string;
}

export interface ScoringResult {
    totalScore: number;
    categories: Record<ScoreCategory, CategoryScore>;
    commitSha: string;
    repoHash: string;
    analyzedAt: string;
}

export type ScoreTier = 'excellent' | 'good' | 'fair' | 'poor';

export function getScoreTier(score: number): ScoreTier {
    if (score >= 80) return 'excellent';
    if (score >= 60) return 'good';
    if (score >= 40) return 'fair';
    return 'poor';
}

export function getScoreTierLabel(tier: ScoreTier): string {
    const labels: Record<ScoreTier, string> = {
        excellent: 'Excellent',
        good: 'Good',
        fair: 'Fair',
        poor: 'Needs Improvement',
    };
    return labels[tier];
}

// ---- Analysis Types ----
export interface Analysis {
    id: string;
    repositoryId: string;
    commitSha: string;
    repoHash: string;
    totalScore: number;
    documentationScore: number;
    testingScore: number;
    architectureScore: number;
    hygieneScore: number;
    securityScore: number;
    aiAnalysis: string | null;
    reportCid: string | null;
    txHash: string | null;
    status: AnalysisStatus;
    createdAt: string;
}

export type AnalysisStatus =
    | 'pending'
    | 'analyzing'
    | 'scoring'
    | 'ai_analysis'
    | 'uploading_ipfs'
    | 'completed'
    | 'failed';

// ---- Report Types ----
export interface Report {
    repository: string;
    commit: string;
    score: number;
    breakdown: Record<ScoreCategory, number>;
    signals: Record<ScoreCategory, Signal[]>;
    analysis: string;
    timestamp: string;
    version: string;
}

// ---- Blockchain Types ----
export interface OnChainScore {
    repoHash: string;
    score: number;
    reportCID: string;
    submitter: string;
    timestamp: number;
    repoUrl: string;
}

export interface VerificationResult {
    txHash: string;
    blockNumber: number;
    repoHash: string;
    score: number;
    reportCID: string;
}

// ---- Leaderboard Types ----
export interface LeaderboardEntry {
    rank: number;
    repository: string;
    owner: string;
    name: string;
    score: number;
    commitSha: string;
    reportCid: string | null;
    txHash: string | null;
    verifiedAt: string | null;
    analyzedAt: string;
}

// ---- AI Types ----
export interface LLMConfig {
    provider: string;
    apiKey: string;
    baseUrl: string;
    model: string;
    maxTokens?: number;
    temperature?: number;
}

export interface LLMMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

export interface LLMResponse {
    content: string;
    model: string;
    usage?: {
        promptTokens: number;
        completionTokens: number;
        totalTokens: number;
    };
}

// ---- API Response Types ----
export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
}

export interface AnalyzeRequest {
    repoUrl: string;
}

export interface AnalyzeResponse {
    analysisId: string;
    status: AnalysisStatus;
}
