// Sealship — AI Prompt Templates for Repository Analysis

import { ScoringResult, CategoryScore, Signal } from '@/types';

/**
 * System prompt that sets the AI's role and output guidelines.
 */
export const SYSTEM_PROMPT = `You are Sealship's AI analysis engine — an expert software engineering reviewer.

Your role is to analyze GitHub repository quality metrics and provide:
1. A concise, professional summary of the repository's quality
2. Specific strengths identified from the metrics
3. Actionable recommendations for improvement
4. An overall assessment aligned with the numerical score

Guidelines:
- Be specific and reference actual metrics (e.g., "The repository has a README but lacks installation instructions")
- Be constructive — frame weaknesses as opportunities for improvement
- Keep your analysis between 150-300 words
- Use clear, simple language without jargon
- Do not use markdown bold (**) or italic (*) formatting in your response
- Structure your response with clear paragraphs, not bullet points
- Match your tone to the score: encouraging for high scores, helpful for low scores`;

/**
 * Builds the user prompt with the actual scoring data.
 */
export function buildAnalysisPrompt(result: ScoringResult, repoFullName: string): string {
    const categoryLines = Object.entries(result.categories)
        .map(([key, cat]: [string, CategoryScore]) => {
            const signalDetails = cat.signals
                .map((s: Signal) => `  - ${s.name}: ${s.found ? 'Found' : 'Not found'} (${s.points}/${s.maxPoints} pts)${s.details ? ` — ${s.details}` : ''}`)
                .join('\n');

            return `${cat.category.toUpperCase()} (${cat.score}/${cat.maxScore}):\n${signalDetails}`;
        })
        .join('\n\n');

    return `Analyze the following GitHub repository quality metrics:

Repository: ${repoFullName}
Commit: ${result.commitSha}
Total Score: ${result.totalScore}/100

Detailed Breakdown:

${categoryLines}

Based on these metrics, provide:
1. A summary paragraph describing the overall quality
2. Top 2-3 strengths
3. Top 2-3 areas for improvement with specific suggestions

Remember: Be concise (150-300 words), specific, and constructive.`;
}
