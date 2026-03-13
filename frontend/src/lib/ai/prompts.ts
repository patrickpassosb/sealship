// Sealship — AI Prompt Templates for Repository Analysis
//
// PROMPT ENGINEERING STRATEGY:
// 
// SYSTEM PROMPT:
// - Defines the AI's persona as an expert code reviewer
// - Sets boundaries: no markdown, clear tone, specific feedback
// - The tone-adjustment based on score creates emotional intelligence
//
// USER PROMPT:
// - Provides the actual scoring data in a structured format
// - Asks for specific outputs: summary, strengths, improvements
// - Enforces length constraints to keep responses useful
//
// WHY NO MARKDOWN?
// The raw text is easier to display in various UIs without parsing.
// We handle formatting in our frontend components instead.

import { ScoringResult, CategoryScore, Signal } from '@/types';

/**
 * System prompt that sets the AI's role and output guidelines.
 * 
 * This establishes the "persona" of the AI reviewer.
 * Key constraints:
 * - No markdown formatting (plain text output)
 * - Specific, metric-referenced feedback
 * - Constructive tone (even for low scores)
 * - Word count limits for consistency
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
 * 
 * This formats the scoring result into a readable prompt for the LLM.
 * Each category shows:
 * - Category name and score
 * - Each individual signal (found/not found, points)
 * - Any additional details
 * 
 * @param result - The complete scoring result
 * @param repoFullName - "owner/repo" format
 * @returns Formatted prompt string for the LLM
 */
export function buildAnalysisPrompt(result: ScoringResult, repoFullName: string): string {
    // Format each category as a readable section
    const categoryLines = Object.entries(result.categories)
        .map(([, cat]: [string, CategoryScore]) => {
            // List each signal with its status and point value
            const signalDetails = cat.signals
                .map((s: Signal) => `  - ${s.name}: ${s.found ? 'Found' : 'Not found'} (${s.points}/${s.maxPoints} pts)${s.details ? ` — ${s.details}` : ''}`)
                .join('\n');

            return `${cat.category.toUpperCase()} (${cat.score}/${cat.maxScore}):\n${signalDetails}`;
        })
        .join('\n\n');

    // Assemble the complete prompt
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
