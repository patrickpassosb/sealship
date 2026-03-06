// Sealship — Deterministic Repository Scoring Engine
// Evaluates repositories across 5 categories, each worth 20 points (total: 100)
//
// DESIGN PRINCIPLES:
// 1. Deterministic: Same repository state always produces the same score
// 2. Objective: Based on verifiable file presence/absence, not subjective judgment
// 3. Comprehensive: Covers documentation, testing, architecture, hygiene, and security
// 4. Transparent: Each scoring signal is recorded and explainable

import { CategoryScore, ScoringResult, Signal, ScoreCategory, FileTreeEntry, RepositoryMetadata } from '@/types';

/**
 * Run the complete deterministic scoring algorithm.
 * This is the core of Sealship — producing reproducible, objective scores.
 * 
 * @param metadata - Repository metadata from GitHub API (stars, languages, etc.)
 * @param fileTree - Complete file tree from GitHub API (all files and directories)
 * @param commitSha - The specific commit being analyzed
 * @param readmeContent - Raw README content (fetched separately for analysis)
 * 
 * @returns Complete ScoringResult with category breakdowns and individual signals
 */
export function scoreRepository(
    metadata: RepositoryMetadata,
    fileTree: FileTreeEntry[],
    commitSha: string,
    readmeContent: string | null
): ScoringResult {
    // Normalize paths to lowercase for case-insensitive matching
    // This handles cross-platform differences (Windows uses case-insensitive paths)
    const filePaths = fileTree.filter((f) => f.type === 'blob').map((f) => f.path.toLowerCase());
    const dirPaths = fileTree.filter((f) => f.type === 'tree').map((f) => f.path.toLowerCase());

    // Run each category's scoring function and aggregate results
    const categories: Record<ScoreCategory, CategoryScore> = {
        documentation: scoreDocumentation(filePaths, readmeContent),
        testing: scoreTesting(filePaths, dirPaths),
        architecture: scoreArchitecture(filePaths, dirPaths, metadata),
        hygiene: scoreHygiene(filePaths),
        security: scoreSecurity(filePaths),
    };

    // Sum all category scores to get the total (max 100)
    const totalScore = Object.values(categories).reduce((sum, cat) => sum + cat.score, 0);

    // Construct repo identifier - combines URL and commit for unique identification
    // This same combo is used in the Solidity contract: keccak256(repoUrl + commitSha)
    const repoUrl = `https://github.com/${metadata.owner}/${metadata.name}`;
    const repoHash = `${repoUrl}:${commitSha}`;

    return {
        totalScore,
        categories,
        commitSha,
        repoHash,
        analyzedAt: new Date().toISOString(),
    };
}

// ================================================================
// DOCUMENTATION (20 points)
// ================================================================
//
// This category measures how well the project documents itself.
// Good documentation is crucial for adoption and collaboration.
//
// Scoring Strategy:
// - README is the bare minimum (3 pts) - no README = very low score
// - README needs substance, not just a title (3 pts more for 500+ chars)
// - Installation instructions show the project is user-friendly (3 pts)
// - Usage examples prove the code actually works (3 pts)
// - Dedicated docs/ folder shows serious documentation effort (2 pts)
// - CHANGELOG shows version history awareness (2 pts)
// - Visual elements (screenshots, badges) show professionalism (2+2 pts)
//
function scoreDocumentation(filePaths: string[], readmeContent: string | null): CategoryScore {
    const signals: Signal[] = [];

    // README presence (3 pts)
    // Common patterns: README.md, README.txt, README.rst, README.adoc
    // We match case-insensitively because filePaths are already lowercased
    const hasReadme = filePaths.some((f) => f.match(/^readme(\.(md|txt|rst|adoc))?$/));
    signals.push({
        name: 'README file',
        description: 'Repository has a README file',
        found: hasReadme,
        points: hasReadme ? 3 : 0,
        maxPoints: 3,
    });

    // README length > 500 chars (3 pts)
    // A README that's too short likely lacks useful information
    const readmeLong = readmeContent ? readmeContent.length > 500 : false;
    signals.push({
        name: 'README content',
        description: 'README has substantial content (>500 characters)',
        found: readmeLong,
        points: readmeLong ? 3 : 0,
        maxPoints: 3,
        details: readmeContent ? `${readmeContent.length} characters` : 'No README found',
    });

    // Installation instructions (3 pts)
    // Look for common patterns: "install", "getting started", "setup", "quick start"
    // The regex handles both "installation" and "installing"
    const hasInstall = readmeContent
        ? /install(ation)?|getting\s*started|setup|quick\s*start/i.test(readmeContent)
        : false;
    signals.push({
        name: 'Installation instructions',
        description: 'README contains installation or setup instructions',
        found: hasInstall,
        points: hasInstall ? 3 : 0,
        maxPoints: 3,
    });

    // Usage examples (3 pts)
    // Look for: "usage", "example", "demo", "how to use", or code blocks (```)
    const hasUsage = readmeContent
        ? /usage|example|demo|how\s*to\s*use|```/i.test(readmeContent)
        : false;
    signals.push({
        name: 'Usage examples',
        description: 'README contains usage examples or code snippets',
        found: hasUsage,
        points: hasUsage ? 3 : 0,
        maxPoints: 3,
    });

    // API docs or additional docs (2 pts)
    // Look for docs/ or documentation/ directories, or standalone API docs
    const hasDocs = filePaths.some((f) =>
        f.match(/^docs\//) || f.match(/^documentation\//) || f.match(/api\.(md|txt|rst)$/)
    );
    signals.push({
        name: 'Documentation folder',
        description: 'Has a docs/ or documentation/ folder, or API docs',
        found: hasDocs,
        points: hasDocs ? 2 : 0,
        maxPoints: 2,
    });

    // CHANGELOG (2 pts)
    // Shows the project maintains a version history
    const hasChangelog = filePaths.some((f) => f.match(/^changelog(\.(md|txt|rst))?$/));
    signals.push({
        name: 'CHANGELOG',
        description: 'Has a CHANGELOG file',
        found: hasChangelog,
        points: hasChangelog ? 2 : 0,
        maxPoints: 2,
    });

    // Screenshots or demo (2 pts)
    // Look for markdown image syntax (![]), screenshot mentions, or image extensions
    const hasMedia = readmeContent
        ? /!\[|screenshot|demo|\.gif|\.png|\.jpg|\.webp/i.test(readmeContent)
        : false;
    signals.push({
        name: 'Screenshots/Demo',
        description: 'README includes images, screenshots, or demo media',
        found: hasMedia,
        points: hasMedia ? 2 : 0,
        maxPoints: 2,
    });

    // Badges (2 pts)
    // Common badge services: shields.io, img.shields
    // Markdown image syntax with ! means it's likely a badge
    const hasBadges = readmeContent
        ? /\[!\[|shields\.io|badge|img\.shields/i.test(readmeContent)
        : false;
    signals.push({
        name: 'Badges',
        description: 'README includes status badges',
        found: hasBadges,
        points: hasBadges ? 2 : 0,
        maxPoints: 2,
    });

    // Sum all points in this category
    const score = signals.reduce((sum, s) => sum + s.points, 0);

    return { category: 'documentation', score, maxScore: 20, signals };
}

// ================================================================
// TESTING (20 points)
// ================================================================
//
// This category measures the project's testing maturity.
// Tests are crucial for code quality, bug prevention, and refactoring confidence.
//
// Scoring Strategy:
// - Test directory shows organizational commitment to testing (4 pts)
// - Actually having test files proves tests are written (4 pts)
// - Using a framework shows professional testing practices (4 pts)
// - CI configuration ensures tests run on every change (4 pts)
// - Coverage tools show emphasis on thorough testing (4 pts)
//
function scoreTesting(filePaths: string[], dirPaths: string[]): CategoryScore {
    const signals: Signal[] = [];

    // Test directory (4 pts)
    // Common patterns: tests/, test/, __tests__/, spec/, __spec__/
    // The regex handles both top-level and nested (e.g., src/tests/)
    const hasTestDir = dirPaths.some((d) =>
        d.match(/^(tests?|__tests__|spec|__spec__)$/) || d.match(/\/tests?$/) || d.match(/\/__tests__$/)
    );
    signals.push({
        name: 'Test directory',
        description: 'Has a test/ or __tests__/ directory',
        found: hasTestDir,
        points: hasTestDir ? 4 : 0,
        maxPoints: 4,
    });

    // Test files count (4 pts)
    // Detect various test file naming conventions across languages:
    // - JavaScript/TypeScript: *.test.js, *.spec.ts, *.test.jsx
    // - Python: test_*.py
    // - Go: *_test.go
    // - Ruby: test_*.rb
    // Capped at 4 points (1 point per file, max 4)
    const testFiles = filePaths.filter((f) =>
        f.match(/\.(test|spec)\.(js|ts|jsx|tsx|py|rb|go)$/) ||
        f.match(/test_\w+\.(py|rb)$/) ||
        f.match(/_test\.(go|rs)$/)
    );
    const hasTestFiles = testFiles.length > 0;
    signals.push({
        name: 'Test files',
        description: 'Has test files (*.test.*, *.spec.*, test_*)',
        found: hasTestFiles,
        points: hasTestFiles ? Math.min(4, testFiles.length) : 0,
        maxPoints: 4,
        details: `${testFiles.length} test file(s) found`,
    });

    // Test framework detected (4 pts)
    // Configuration files indicate a mature testing setup
    const testFrameworks = [
        'jest.config', 'vitest.config', 'pytest.ini', 'setup.cfg',
        'phpunit.xml', 'karma.conf', '.rspec', 'cypress.config',
        'playwright.config', 'mocha', 'jasmine',
    ];
    const hasFramework = filePaths.some((f) =>
        testFrameworks.some((fw) => f.includes(fw))
    );
    signals.push({
        name: 'Test framework',
        description: 'Has a testing framework configuration file',
        found: hasFramework,
        points: hasFramework ? 4 : 0,
        maxPoints: 4,
    });

    // CI configuration (4 pts)
    // Various CI systems GitHub Actions, GitLab CI, CircleCI, Jenkins, Travis, Azure Pipelines, Bitbucket Pipelines
    const ciPatterns = [
        '.github/workflows/', '.gitlab-ci.yml', '.circleci/',
        'Jenkinsfile', '.travis.yml', 'azure-pipelines.yml',
        'bitbucket-pipelines.yml',
    ];
    const hasCI = filePaths.some((f) =>
        ciPatterns.some((ci) => f.startsWith(ci) || f === ci)
    );
    signals.push({
        name: 'CI configuration',
        description: 'Has continuous integration setup (GitHub Actions, GitLab CI, etc.)',
        found: hasCI,
        points: hasCI ? 4 : 0,
        maxPoints: 4,
    });

    // Coverage config (4 pts)
    // Popular coverage tools: Codecov, Coveralls, NYC (Node), c8
    const hasCoverage = filePaths.some((f) =>
        f.includes('codecov') || f.includes('coveralls') ||
        f.includes('.nycrc') || f.includes('coverage') ||
        f.includes('.c8rc')
    );
    signals.push({
        name: 'Coverage configuration',
        description: 'Has code coverage tracking setup',
        found: hasCoverage,
        points: hasCoverage ? 4 : 0,
        maxPoints: 4,
    });

    const score = signals.reduce((sum, s) => sum + s.points, 0);

    return { category: 'testing', score, maxScore: 20, signals };
}

// ================================================================
// ARCHITECTURE (20 points)
// ================================================================
//
// This category measures the project's structural quality.
// Good architecture indicates maintainability and scalability.
//
// Scoring Strategy:
// - Modular structure: 3+ top-level dirs shows the project isn't monolithic (4 pts)
// - Separation of concerns: recognized patterns like src/, components/ (4 pts)
// - Multiple source files: 5+ files shows a real codebase, not a snippet (4 pts)
// - Config files: package.json, tsconfig, etc. show professional setup (4 pts)
// - Multi-language: 2+ languages indicates a complex, well-rounded project (4 pts)
//
function scoreArchitecture(
    filePaths: string[],
    dirPaths: string[],
    metadata: RepositoryMetadata
): CategoryScore {
    const signals: Signal[] = [];

    // Modular structure (4 pts)
    // Count top-level directories that aren't hidden (starting with .)
    // We filter out directories with "/" to get only immediate children of root
    const topLevelDirs = dirPaths.filter((d) => !d.includes('/') && !d.startsWith('.'));
    const isModular = topLevelDirs.length >= 3;
    signals.push({
        name: 'Modular structure',
        description: 'Has at least 3 meaningful top-level directories',
        found: isModular,
        points: isModular ? 4 : 0,
        maxPoints: 4,
        details: `${topLevelDirs.length} top-level directories`,
    });

    // Separation of concerns (4 pts)
    // These are standard directory names that indicate organized code
    const separationPatterns = ['src', 'lib', 'app', 'components', 'utils', 'services', 'models', 'controllers', 'views', 'helpers', 'middleware', 'routes', 'api', 'config', 'types', 'interfaces'];
    const matchedPatterns = separationPatterns.filter((p) =>
        dirPaths.some((d) => d === p || d.endsWith(`/${p}`))
    );
    const hasSeparation = matchedPatterns.length >= 2;
    signals.push({
        name: 'Separation of concerns',
        description: 'Has recognizable architectural patterns (src/, lib/, components/, etc.)',
        found: hasSeparation,
        points: hasSeparation ? 4 : 0,
        maxPoints: 4,
        details: matchedPatterns.length > 0 ? `Found: ${matchedPatterns.join(', ')}` : 'No common patterns found',
    });

    // Multiple source files (4 pts)
    // Count files with common source code extensions
    const sourceExtensions = /\.(js|ts|jsx|tsx|py|rb|go|rs|java|cpp|c|cs|php|swift|kt)$/;
    const sourceFiles = filePaths.filter((f) => sourceExtensions.test(f));
    const hasMultipleFiles = sourceFiles.length >= 5;
    signals.push({
        name: 'Multiple source files',
        description: 'Has 5+ source code files',
        found: hasMultipleFiles,
        points: hasMultipleFiles ? 4 : 0,
        maxPoints: 4,
        details: `${sourceFiles.length} source files`,
    });

    // Config files (4 pts)
    // Check for common build/config files across different languages
    const configPatterns = [
        'package.json', 'tsconfig.json', 'pyproject.toml', 'cargo.toml',
        'go.mod', 'pom.xml', 'build.gradle', 'gemfile', 'mix.exs',
        'makefile', 'dockerfile', 'docker-compose',
    ];
    const configFiles = configPatterns.filter((p) =>
        filePaths.some((f) => f.endsWith(p))
    );
    const hasConfigs = configFiles.length >= 1;
    signals.push({
        name: 'Configuration files',
        description: 'Has project configuration files (package.json, tsconfig.json, etc.)',
        found: hasConfigs,
        points: hasConfigs ? 4 : 0,
        maxPoints: 4,
        details: configFiles.length > 0 ? `Found: ${configFiles.join(', ')}` : 'None found',
    });

    // Multi-language (4 pts)
    // GitHub API returns language breakdown - check if 2+ languages
    const langCount = Object.keys(metadata.languages).length;
    const isMultiLang = langCount >= 2;
    signals.push({
        name: 'Language diversity',
        description: 'Uses 2+ programming languages',
        found: isMultiLang,
        points: isMultiLang ? 4 : 0,
        maxPoints: 4,
        details: `${langCount} language(s): ${Object.keys(metadata.languages).join(', ')}`,
    });

    const score = signals.reduce((sum, s) => sum + s.points, 0);

    return { category: 'architecture', score, maxScore: 20, signals };
}

// ================================================================
// PROJECT HYGIENE (20 points)
// ================================================================
//
// This category measures the project's community readiness.
// These files are essential for open-source collaboration.
//
// Scoring Strategy:
// - LICENSE: Legal clarity is essential for using the project (4 pts)
// - .gitignore: Shows the team knows what shouldn't be committed (4 pts)
// - CONTRIBUTING.md: Shows welcome to external contributors (4 pts)
// - CODE_OF_CONDUCT: Shows commitment to inclusive community (4 pts)
// - Issue/PR templates: Streamline collaboration (4 pts)
//
function scoreHygiene(filePaths: string[]): CategoryScore {
    const signals: Signal[] = [];

    // LICENSE (4 pts)
    // Could be LICENSE, LICENSE.md, or LICENSE.txt (case-insensitive)
    const hasLicense = filePaths.some((f) => f.match(/^license(\.(md|txt))?$/));
    signals.push({
        name: 'LICENSE file',
        description: 'Has a license file',
        found: hasLicense,
        points: hasLicense ? 4 : 0,
        maxPoints: 4,
    });

    // .gitignore (4 pts)
    // Standard git ignore file
    const hasGitignore = filePaths.some((f) => f === '.gitignore');
    signals.push({
        name: '.gitignore',
        description: 'Has a .gitignore file',
        found: hasGitignore,
        points: hasGitignore ? 4 : 0,
        maxPoints: 4,
    });

    // CONTRIBUTING.md (4 pts)
    const hasContributing = filePaths.some((f) => f.match(/^contributing(\.(md|txt))?$/));
    signals.push({
        name: 'CONTRIBUTING guide',
        description: 'Has a CONTRIBUTING.md file',
        found: hasContributing,
        points: hasContributing ? 4 : 0,
        maxPoints: 4,
    });

    // CODE_OF_CONDUCT (4 pts)
    // Handles both code-of-conduct and code_of_conduct naming
    const hasCoc = filePaths.some((f) => f.match(/^code[_-]of[_-]conduct(\.(md|txt))?$/));
    signals.push({
        name: 'Code of Conduct',
        description: 'Has a CODE_OF_CONDUCT file',
        found: hasCoc,
        points: hasCoc ? 4 : 0,
        maxPoints: 4,
    });

    // Issue/PR templates (4 pts)
    // GitHub special directories for templates
    const hasTemplates = filePaths.some((f) =>
        f.includes('.github/issue_template') ||
        f.includes('.github/pull_request_template') ||
        f.includes('.github/ISSUE_TEMPLATE')
    );
    signals.push({
        name: 'Issue/PR templates',
        description: 'Has GitHub issue or pull request templates',
        found: hasTemplates,
        points: hasTemplates ? 4 : 0,
        maxPoints: 4,
    });

    const score = signals.reduce((sum, s) => sum + s.points, 0);

    return { category: 'hygiene', score, maxScore: 20, signals };
}

// ================================================================
// SECURITY (20 points)
// ================================================================
//
// This category measures the project's security practices.
// Critical for projects that handle sensitive data or are widely used.
//
// Scoring Strategy:
// - Lock file: Ensures reproducible, secure builds (4 pts)
// - No .env: Secrets shouldn't be in version control (4 pts)
// - SECURITY.md: Shows process for reporting vulnerabilities (4 pts)
// - Dependency auditing: Proactive vulnerability detection (4 pts)
// - .env.example: Helps others set up without leaking secrets (4 pts)
//
function scoreSecurity(filePaths: string[]): CategoryScore {
    const signals: Signal[] = [];

    // Lock file (4 pts)
    // Lock files ensure exact dependency versions - prevents supply chain attacks
    // Covers: npm, yarn, pnpm, Python (poetry, pipenv), Rust (cargo), Go, Ruby, PHP
    const lockFiles = ['package-lock.json', 'yarn.lock', 'pnpm-lock.yaml', 'poetry.lock', 'pipfile.lock', 'cargo.lock', 'go.sum', 'gemfile.lock', 'composer.lock'];
    const hasLockFile = filePaths.some((f) => lockFiles.some((lf) => f.endsWith(lf)));
    signals.push({
        name: 'Lock file',
        description: 'Has a dependency lock file for reproducible builds',
        found: hasLockFile,
        points: hasLockFile ? 4 : 0,
        maxPoints: 4,
    });

    // No .env committed (4 pts)
    // SECURITY CRITICAL: .env files often contain API keys, passwords, secrets
    // This is a "negative" signal - we reward their absence, not presence
    const hasEnvFile = filePaths.some((f) => f === '.env' || f === '.env.local' || f === '.env.production');
    signals.push({
        name: 'No .env committed',
        description: 'No .env files committed to the repository',
        found: !hasEnvFile,
        points: !hasEnvFile ? 4 : 0,
        maxPoints: 4,
        details: hasEnvFile ? 'Warning: .env file found in repository' : 'Clean — no .env files committed',
    });

    // SECURITY.md (4 pts)
    // Standard location for security vulnerability disclosure policy
    const hasSecurity = filePaths.some((f) => f.match(/^security(\.(md|txt))?$/));
    signals.push({
        name: 'SECURITY policy',
        description: 'Has a SECURITY.md file',
        found: hasSecurity,
        points: hasSecurity ? 4 : 0,
        maxPoints: 4,
    });

    // Dependency audit config (4 pts)
    // Automated tools that check for known vulnerabilities
    const auditPatterns = ['.snyk', '.nsprc', 'audit-ci', '.dependabot/', '.github/dependabot.yml', 'renovate.json', '.renovaterc'];
    const hasAudit = filePaths.some((f) => auditPatterns.some((p) => f.includes(p)));
    signals.push({
        name: 'Dependency auditing',
        description: 'Has dependency audit/update configuration (Dependabot, Renovate, Snyk)',
        found: hasAudit,
        points: hasAudit ? 4 : 0,
        maxPoints: 4,
    });

    // .env.example (4 pts)
    // Provides a template for required environment variables without exposing secrets
    const hasEnvExample = filePaths.some((f) => f.match(/\.env\.(example|sample|template)$/));
    signals.push({
        name: '.env.example',
        description: 'Has an .env.example or .env.sample file',
        found: hasEnvExample,
        points: hasEnvExample ? 4 : 0,
        maxPoints: 4,
    });

    const score = signals.reduce((sum, s) => sum + s.points, 0);

    return { category: 'security', score, maxScore: 20, signals };
}
