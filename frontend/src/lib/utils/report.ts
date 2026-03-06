// Sealship — Report Generator
// Creates structured JSON reports for IPFS storage

import { Report, ScoringResult, ScoreCategory, Signal } from '@/types';

/**
 * Generate a structured report from scoring results and AI analysis.
 * This report is what gets uploaded to IPFS.
 */
export function generateReport(
    repoFullName: string,
    scoringResult: ScoringResult,
    aiAnalysis: string
): Report {
    const breakdown: Record<ScoreCategory, number> = {
        documentation: scoringResult.categories.documentation.score,
        testing: scoringResult.categories.testing.score,
        architecture: scoringResult.categories.architecture.score,
        hygiene: scoringResult.categories.hygiene.score,
        security: scoringResult.categories.security.score,
    };

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
