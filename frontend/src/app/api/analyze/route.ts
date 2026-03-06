import { NextResponse } from 'next/server';
import { getRepositoryMetadata, getLatestCommitSha, getFileTree, getFileContent, parseRepoUrl } from '@/lib/github/client';
import { scoreRepository } from '@/lib/scoring/engine';
import { getOrCreateRepository, createAnalysis, updateAnalysisScores, updateAnalysisAI, updateAnalysisIPFS, failAnalysis, getAnalysis } from '@/lib/db/client';
import { getLLMConfigFromEnv, chatCompletion } from '@/lib/ai/provider';
import { SYSTEM_PROMPT, buildAnalysisPrompt } from '@/lib/ai/prompts';
import { generateReport } from '@/lib/utils/report';
import { uploadToIPFS } from '@/lib/ipfs/pinata';

// Set maximum duration for this API route (in seconds)
// Repository analysis can take a while (GitHub API ratelimits, AI completion, IPFS upload)
export const maxDuration = 60; // Next.js feature for Vercel

/**
 * Perform the full analysis pipeline asynchronously.
 * 
 * In a real-world high-scale app, this would be a message queue worker (e.g. BullMQ).
 * For the hackathon MVP, we run it asynchronously in the background so the user
 * doesn't wait for an HTTP timeout, while returning the `analysisId` immediately.
 */
async function runAnalysisPipeline(analysisId: string, owner: string, name: string, commitSha: string) {
    try {
        const analysis = getAnalysis(analysisId);
        if (!analysis) return;

        // 1. Fetch File Tree
        console.log(`[${analysisId}] Fetching file tree...`);
        const fileTree = await getFileTree(owner, name, commitSha);

        // 1b. Try to find and fetch README content
        let readmeContent: string | null = null;
        const readmeFile = fileTree.find(f => f.type === 'blob' && /^readme(\.(md|txt|rst|adoc))?$/i.test(f.path));
        if (readmeFile) {
            readmeContent = await getFileContent(owner, name, readmeFile.path);
        }

        // 2. Score Repository
        console.log(`[${analysisId}] Scoring repository...`);
        const metadata = await getRepositoryMetadata(owner, name);
        const scoringResult = scoreRepository(metadata, fileTree, commitSha, readmeContent);
        updateAnalysisScores(analysisId, scoringResult);

        // 3. AI Analysis
        console.log(`[${analysisId}] Generating AI analysis...`);
        const llmConfig = getLLMConfigFromEnv();
        const aiPrompt = buildAnalysisPrompt(scoringResult, `${owner}/${name}`);

        // Mock AI if not configured
        let aiAnalysisText = "";
        if (llmConfig.apiKey) {
            const llmResponse = await chatCompletion(llmConfig, [
                { role: 'system', content: SYSTEM_PROMPT },
                { role: 'user', content: aiPrompt }
            ]);
            aiAnalysisText = llmResponse.content;
        } else {
            console.log(`[${analysisId}] Warning: LLM_API_KEY not set. Using mock AI analysis.`);
            aiAnalysisText = `This is a mock analysis for ${owner}/${name} because the LLM API key wasn't provided. The repository scored ${scoringResult.totalScore}/100. It shows strong signals in Testing and Security, but could improve Documentation.`;
        }
        updateAnalysisAI(analysisId, aiAnalysisText);

        // 4. Generate & Upload Report to IPFS
        console.log(`[${analysisId}] Uploading report to IPFS...`);
        const report = generateReport(`${owner}/${name}`, scoringResult, aiAnalysisText);
        const ipfsCid = await uploadToIPFS(report as unknown as Record<string, unknown>, `sealship-report-${scoringResult.repoHash}`);
        updateAnalysisIPFS(analysisId, ipfsCid);

        console.log(`[${analysisId}] Analysis pipeline completed. CID: ${ipfsCid}`);

        // Step 5: On-chain Verification happens client-side, using the wallet!

    } catch (error) {
        console.error(`[${analysisId}] Pipeline failed:`, error);
        failAnalysis(analysisId);
    }
}

/**
 * POST /api/analyze
 * Body: { repoUrl: string }
 * Response: { analysisId: string, status: string }
 */
export async function POST(req: Request) {
    try {
        const { repoUrl } = await req.json();

        if (!repoUrl) {
            return NextResponse.json({ success: false, error: 'repoUrl is required' }, { status: 400 });
        }

        // Parse URL
        let owner: string;
        let name: string;
        try {
            ({ owner, name } = parseRepoUrl(repoUrl));
        } catch {
            return NextResponse.json({ success: false, error: 'Invalid GitHub URL format' }, { status: 400 });
        }

        // Record repository in DB
        const dbRepo = getOrCreateRepository(owner, name);

        // Fetch latest commit SHA
        // First need repo metadata to get default branch
        let metadata;
        try {
            metadata = await getRepositoryMetadata(owner, name);
        } catch (e: unknown) {
            return NextResponse.json({ success: false, error: e instanceof Error ? e.message : 'Unknown error' }, { status: 404 });
        }

        const commitSha = await getLatestCommitSha(owner, name, metadata.defaultBranch);

        // Calculate repoHash locally
        const repoHash = `${repoUrl}:${commitSha}`; // Will be keccak256 on chain

        // Initialize Analysis Record
        const analysis = createAnalysis(dbRepo.id, commitSha, repoHash);

        // Run the rest of the pipeline in the background
        // (Next.js serverless functions might kill background tasks, but for local/hackathon it works fine)
        runAnalysisPipeline(analysis.id, owner, name, commitSha).catch(console.error);

        return NextResponse.json({
            success: true,
            data: {
                analysisId: analysis.id,
                status: analysis.status
            }
        });

    } catch (error) {
        console.error('Analyze API Error:', error);
        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : 'Internal Server Error' },
            { status: 500 }
        );
    }
}
