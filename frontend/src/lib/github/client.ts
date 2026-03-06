// Sealship — GitHub API Client
// Retrieves repository metadata, file tree, and content via the GitHub REST API

import { RepositoryMetadata, FileTreeEntry } from '@/types';

const GITHUB_API_BASE = 'https://api.github.com';

/**
 * Parse a GitHub repository URL into owner and name.
 * Supports formats:
 *   - https://github.com/owner/repo
 *   - https://github.com/owner/repo.git
 *   - github.com/owner/repo
 *   - owner/repo
 */
export function parseRepoUrl(url: string): { owner: string; name: string } {
    // Remove trailing slashes and .git
    const cleaned = url.trim().replace(/\/+$/, '').replace(/\.git$/, '');

    // Try full URL pattern
    const urlMatch = cleaned.match(/(?:https?:\/\/)?(?:www\.)?github\.com\/([^/]+)\/([^/]+)/);
    if (urlMatch) {
        return { owner: urlMatch[1], name: urlMatch[2] };
    }

    // Try owner/repo pattern
    const shortMatch = cleaned.match(/^([^/]+)\/([^/]+)$/);
    if (shortMatch) {
        return { owner: shortMatch[1], name: shortMatch[2] };
    }

    throw new Error(`Invalid GitHub repository URL: ${url}`);
}

/**
 * Create GitHub API headers with optional authentication.
 */
function getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'Sealship/1.0',
    };

    const token = process.env.GITHUB_TOKEN;
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
}

/**
 * Make a request to the GitHub API with error handling.
 */
async function githubFetch<T>(path: string): Promise<T> {
    const url = `${GITHUB_API_BASE}${path}`;
    const response = await fetch(url, { headers: getHeaders() });

    if (!response.ok) {
        if (response.status === 404) {
            throw new Error(`Repository not found: ${path}`);
        }
        if (response.status === 403) {
            const remaining = response.headers.get('x-ratelimit-remaining');
            if (remaining === '0') {
                throw new Error('GitHub API rate limit exceeded. Please provide a GITHUB_TOKEN.');
            }
        }
        throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
    }

    return response.json() as Promise<T>;
}

/**
 * Fetch repository metadata.
 */
export async function getRepositoryMetadata(owner: string, name: string): Promise<RepositoryMetadata> {
    interface GHRepo {
        full_name: string;
        description: string | null;
        default_branch: string;
        language: string | null;
        stargazers_count: number;
        forks_count: number;
        open_issues_count: number;
        created_at: string;
        updated_at: string;
        pushed_at: string;
        size: number;
        has_wiki: boolean;
        has_pages: boolean;
        license: { spdx_id: string } | null;
        topics: string[];
    }

    const repo = await githubFetch<GHRepo>(`/repos/${owner}/${name}`);

    // Fetch language breakdown
    const languages = await githubFetch<Record<string, number>>(`/repos/${owner}/${name}/languages`);

    return {
        owner,
        name,
        fullName: repo.full_name,
        description: repo.description,
        defaultBranch: repo.default_branch,
        language: repo.language,
        languages,
        stars: repo.stargazers_count,
        forks: repo.forks_count,
        openIssues: repo.open_issues_count,
        createdAt: repo.created_at,
        updatedAt: repo.updated_at,
        pushedAt: repo.pushed_at,
        size: repo.size,
        hasWiki: repo.has_wiki,
        hasPages: repo.has_pages,
        license: repo.license?.spdx_id || null,
        topics: repo.topics || [],
    };
}

/**
 * Fetch the latest commit SHA for the default branch.
 */
export async function getLatestCommitSha(owner: string, name: string, branch: string): Promise<string> {
    interface GHCommit {
        sha: string;
    }

    const commit = await githubFetch<GHCommit>(`/repos/${owner}/${name}/commits/${branch}`);
    return commit.sha;
}

/**
 * Fetch the repository file tree (recursive).
 */
export async function getFileTree(owner: string, name: string, sha: string): Promise<FileTreeEntry[]> {
    interface GHTree {
        tree: Array<{
            path: string;
            type: string;
            size?: number;
        }>;
        truncated: boolean;
    }

    const tree = await githubFetch<GHTree>(`/repos/${owner}/${name}/git/trees/${sha}?recursive=1`);

    return tree.tree.map((entry) => ({
        path: entry.path,
        type: entry.type === 'blob' ? 'blob' : 'tree',
        size: entry.size,
    }));
}

/**
 * Fetch file content (decoded from base64).
 * Only use for small files (< 1MB).
 */
export async function getFileContent(owner: string, name: string, path: string): Promise<string | null> {
    try {
        interface GHContent {
            content: string;
            encoding: string;
            size: number;
        }

        const file = await githubFetch<GHContent>(`/repos/${owner}/${name}/contents/${path}`);

        if (file.encoding === 'base64') {
            return Buffer.from(file.content, 'base64').toString('utf-8');
        }

        return file.content;
    } catch {
        return null;
    }
}
