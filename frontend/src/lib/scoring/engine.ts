// Sealship — Deterministic Repository Scoring Engine
// Evaluates repositories across 5 categories, each worth 20 points (total: 100)

import { CategoryScore, ScoringResult, Signal, ScoreCategory, FileTreeEntry, RepositoryMetadata } from '@/types';

/**
 * Run the complete deterministic scoring algorithm.
 * This is the core of Sealship — producing reproducible, objective scores.
 */
export function scoreRepository(
    metadata: RepositoryMetadata,
    fileTree: FileTreeEntry[],
    commitSha: string,
    readmeContent: string | null
): ScoringResult {
    const filePaths = fileTree.filter((f) => f.type === 'blob').map((f) => f.path.toLowerCase());
    const dirPaths = fileTree.filter((f) => f.type === 'tree').map((f) => f.path.toLowerCase());

    const categories: Record<ScoreCategory, CategoryScore> = {
        documentation: scoreDocumentation(filePaths, readmeContent),
        testing: scoreTesting(filePaths, dirPaths),
        architecture: scoreArchitecture(filePaths, dirPaths, metadata),
        hygiene: scoreHygiene(filePaths),
        security: scoreSecurity(filePaths),
    };

    const totalScore = Object.values(categories).reduce((sum, cat) => sum + cat.score, 0);

    // Generate repo hash: keccak256(repoURL + commitSHA)
    // We'll use a simple hash here; the actual keccak256 is done in the blockchain module
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
function scoreDocumentation(filePaths: string[], readmeContent: string | null): CategoryScore {
    const signals: Signal[] = [];

    // README presence (3 pts)
    const hasReadme = filePaths.some((f) => f.match(/^readme(\.(md|txt|rst|adoc))?$/));
    signals.push({
        name: 'README file',
        description: 'Repository has a README file',
        found: hasReadme,
        points: hasReadme ? 3 : 0,
        maxPoints: 3,
    });

    // README length > 500 chars (3 pts)
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
    const hasChangelog = filePaths.some((f) => f.match(/^changelog(\.(md|txt|rst))?$/));
    signals.push({
        name: 'CHANGELOG',
        description: 'Has a CHANGELOG file',
        found: hasChangelog,
        points: hasChangelog ? 2 : 0,
        maxPoints: 2,
    });

    // Screenshots or demo (2 pts)
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

    const score = signals.reduce((sum, s) => sum + s.points, 0);

    return { category: 'documentation', score, maxScore: 20, signals };
}

// ================================================================
// TESTING (20 points)
// ================================================================
function scoreTesting(filePaths: string[], dirPaths: string[]): CategoryScore {
    const signals: Signal[] = [];

    // Test directory (4 pts)
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
function scoreArchitecture(
    filePaths: string[],
    dirPaths: string[],
    metadata: RepositoryMetadata
): CategoryScore {
    const signals: Signal[] = [];

    // Modular structure (4 pts) - has at least 3 meaningful top-level dirs
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

    // Separation of concerns (4 pts) - has recognizable separation patterns
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

    // Multiple source files (4 pts) - more than 5 source files
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
function scoreHygiene(filePaths: string[]): CategoryScore {
    const signals: Signal[] = [];

    // LICENSE (4 pts)
    const hasLicense = filePaths.some((f) => f.match(/^license(\.(md|txt))?$/));
    signals.push({
        name: 'LICENSE file',
        description: 'Has a license file',
        found: hasLicense,
        points: hasLicense ? 4 : 0,
        maxPoints: 4,
    });

    // .gitignore (4 pts)
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
    const hasCoc = filePaths.some((f) => f.match(/^code[_-]of[_-]conduct(\.(md|txt))?$/));
    signals.push({
        name: 'Code of Conduct',
        description: 'Has a CODE_OF_CONDUCT file',
        found: hasCoc,
        points: hasCoc ? 4 : 0,
        maxPoints: 4,
    });

    // Issue/PR templates (4 pts)
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
function scoreSecurity(filePaths: string[]): CategoryScore {
    const signals: Signal[] = [];

    // Lock file (4 pts)
    const lockFiles = ['package-lock.json', 'yarn.lock', 'pnpm-lock.yaml', 'poetry.lock', 'pipfile.lock', 'cargo.lock', 'go.sum', 'gemfile.lock', 'composer.lock'];
    const hasLockFile = filePaths.some((f) => lockFiles.some((lf) => f.endsWith(lf)));
    signals.push({
        name: 'Lock file',
        description: 'Has a dependency lock file for reproducible builds',
        found: hasLockFile,
        points: hasLockFile ? 4 : 0,
        maxPoints: 4,
    });

    // No .env committed (4 pts) — we check if .env is NOT in the tree
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
    const hasSecurity = filePaths.some((f) => f.match(/^security(\.(md|txt))?$/));
    signals.push({
        name: 'SECURITY policy',
        description: 'Has a SECURITY.md file',
        found: hasSecurity,
        points: hasSecurity ? 4 : 0,
        maxPoints: 4,
    });

    // Dependency audit config (4 pts)
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
