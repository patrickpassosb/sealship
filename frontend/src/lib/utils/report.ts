// Sealship — Report Generator
// Creates structured JSON reports for IPFS storage
//
// REPORT STRUCTURE:
// The report is the complete artifact that gets permanently stored on IPFS.
// It contains everything needed to verify and understand a score:
// - Repository identification
// - Numerical scores and breakdowns
// - Individual signals (what was found/missing)
// - AI-generated analysis
// - Timestamps for provenance
//
// This report is:
// 1. Uploaded to IPFS → returns CID
// 2. CID stored on-chain in the Sealship contract
// 3. Anyone can retrieve full report via IPFS using CID

import { Report, ScoringResult, ScoreCategory, Signal } from '@/types';

/**
 * Generate a structured report from scoring results and AI analysis.
 * 
 * This assembles all the analysis data into a single JSON object
 * suitable for IPFS storage.
 * 
 * @param repoFullName - "owner/repo" format for display
 * @param scoringResult - The deterministic scoring output
 * @param aiAnalysis - The LLM-generated analysis text
 * @returns Complete report object ready for IPFS upload
 */
export function generateReport(
    repoFullName: string,
    scoringResult: ScoringResult,
    aiAnalysis: string
): Report {
    // Flatten category scores into a simple breakdown object
    const breakdown: Record<ScoreCategory, number> = {
        documentation: scoringResult.categories.documentation.score,
        testing: scoringResult.categories.testing.score,
        architecture: scoringResult.categories.architecture.score,
        hygiene: scoringResult.categories.hygiene.score,
        security: scoringResult.categories.security.score,
    };

    // Keep detailed signals for transparency and debugging
    const signals: Record<ScoreCategory, Signal[]> = {
        documentation: scoringResult.categories.documentation.signals,
        testing: scoringResult.categories.testing.signals,
        architecture: scoringResult.categories.architecture.signals,
        hygiene: scoringResult.categories.hygiene.signals,
        security: scoringResult.categories.security.signals,
    };

    return {
        repository: repoFullName,
        commit: scoringResult.commitSha,
        score: scoringResult.totalScore,
        breakdown,
        signals,
        analysis: aiAnalysis,
        timestamp: scoringResult.analyzedAt,
        version: '1.0.0',
    };
}
