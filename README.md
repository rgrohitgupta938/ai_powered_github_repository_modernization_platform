# AI-Powered GitHub Repository Modernization Platform

A comprehensive, local-first platform for auditing, modernizing, documenting, securing, and continuously improving GitHub repositories using deterministic rules and local LLM inference (Ollama).

## Project Overview

This platform eliminates the need for external LLM APIs by running entirely on local infrastructure. It combines:

- **Deterministic analysis**: Fast, rule-based repository audits
- **Stack detection**: Framework, language, database, and deployment platform identification
- **Local LLM integration**: Ollama-powered summaries, README generation, and classifications
- **Automated modernization**: Generated PRs with human approval gates
- **Historical analytics**: Track repository health improvements over time
- **Continuous monitoring**: Scheduled scans and automated issue creation

## Key Features

### 📊 Repository Health Scoring

Composite 0-100 health score across five dimensions:

- **Hygiene** (25pts): README, LICENSE, .gitignore presence
- **Security** (30pts): Secret exposure, environment variable leaks
- **Dependency Health** (20pts): Outdated and unused packages
- **Structure** (15pts): Large files, tracked dependencies
- **Freshness** (10pts): Last push recency

### 🔍 Stack Detection

Automatically identifies:

- Framework (Next.js, Django, Express, etc.)
- Language (via GitHub's linguist data)
- Database (PostgreSQL, MongoDB, etc.)
- Deployment target (Vercel, Heroku, AWS, etc.)

### 🤖 AI-Assisted Content

- Repository summaries (150-word factual overviews)
- Generated README files with structured sections
- Repository classification (web-app, api-service, library, etc.)
- Modernization roadmap generation

### 🔒 Security & Secret Scanning

- Pattern + entropy-based secret detection
- Named API key detection (AWS, Stripe, SendGrid, etc.)
- Environment variable leak detection
- Historical secret exposure tracking

### 📈 Historical Analytics

- Score trends over time (7-day, 30-day, all-time)
- Automation impact measurement
- Most-improved repositories leaderboard
- Portfolio-wide health dashboard

### 🚀 Continuous Monitoring

- GitHub Actions integration via composite action
- Scheduled scans (daily/weekly/monthly)
- Weekly digest reports
- Automated issue creation for unfixable findings

## Project Structure

```
ai_powered_github_repository_modernization_platform/
├── apps/
│   ├── dashboard/          # Next.js dashboard (React, Recharts, Tailwind)
│   └── api/                # Express/Fastify API + scheduler + webhooks
├── packages/
│   ├── core-types/         # Shared TypeScript types
│   ├── db/                 # Database & Prisma configuration
│   ├── github-client/      # GitHub API wrapper (Octokit)
│   ├── repo-scanner/       # Repository tree walking & metrics
│   ├── stack-detector/     # Framework/lang/db detection
│   ├── rule-engine/        # Deterministic + framework-specific rules
│   ├── llm-service/        # Ollama wrapper & prompt templates
│   ├── modernization-planner/  # Action items & roadmap generation
│   ├── cleanup-engine/     # ChangeSet generation
│   ├── security-agent/     # Secret scanning (Phase 8/11)
│   ├── dependency-agent/   # Outdated/unused deps (Phase 9/11)
│   ├── architecture-agent/ # Structural debt detection (Phase 11)
│   ├── documentation-agent/# README/ROADMAP generation (Phase 11)
│   ├── portfolio-agent/    # Showcase selection (Phase 10/11)
│   ├── agent-runner/       # Orchestration layer (Phase 11)
│   └── pr-manager/         # Branch/commit/PR automation (Phase 12)
├── docs/
│   ├── scope.md            # Goals and success metrics
│   ├── architecture.md     # System architecture diagram
│   └── implemenatation_doc_phase_wise/  # Phase-by-phase specifications
└── [Configuration files and root package.json]
```

## Technology Stack

| Layer         | Technology                 | Version              | Rationale                               |
| ------------- | -------------------------- | -------------------- | --------------------------------------- |
| Language      | TypeScript                 | 6.0.x (strict)       | Type safety across monorepo             |
| Runtime       | Node.js                    | 24.x LTS (min: 22.x) | Native fetch, ecosystem support         |
| Monorepo      | pnpm + Turborepo           | 11.x + 2.9.x         | Efficient workspaces, build caching     |
| Database      | PostgreSQL + Prisma        | 18.x + 7.x           | Relational integrity, type-safe queries |
| LLM Runtime   | Ollama (local)             | latest               | Zero external API key dependency        |
| LLM Models    | Qwen2.5-Coder, DeepSeek    | 3b–16b               | Local inference, no hosted dependency   |
| GitHub Access | Octokit                    | 22.x + 9.x           | Official, typed client                  |
| Dashboard     | Next.js + React + Recharts | 16.x + 19.x + latest | Fast iteration, good charting           |
| Testing       | Vitest + Playwright        | 4.x + 1.61.x         | Fast tests, E2E coverage                |

## Getting Started

### Prerequisites

- **Node.js** 22.x LTS or later (minimum 22.x)
- **pnpm** 11.x or later
- **PostgreSQL** 18.x (via Docker recommended)
- **Ollama** (installed locally, available at `http://localhost:11434`)
- **Git** 2.x or later

### Setup

1. **Clone the repository**

   ```bash
   git clone https://github.com/rgrohitgupta938/ai_powered_github_repository_modernization_platform.git
   cd ai_powered_github_repository_modernization_platform
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Set up the database**

   ```bash
   # Start PostgreSQL via Docker (or use existing instance)
   docker run --name repo-modernizer-postgres \
     -e POSTGRES_PASSWORD=postgres \
     -p 5432:5432 \
     -d postgres:18

   # Run migrations
   cd packages/database
   pnpm exec prisma migrate dev
   ```

4. **Configure Ollama**

   ```bash
   # Install Ollama from https://ollama.com
   # Pull required models
   ollama pull qwen2.5-coder:3b
   ollama pull qwen2.5-coder:7b
   ollama pull deepseek-coder-v2:16b

   # Verify it's running
   curl http://localhost:11434/api/tags
   ```

5. **Set up GitHub authentication**

   ```bash
   # Create .env.local in the root directory
   cat > .env.local << EOF
   GITHUB_TOKEN=ghp_your_personal_access_token_here
   # Or for org-wide GitHub App:
   GITHUB_APP_ID=12345
   GITHUB_APP_PRIVATE_KEY=-----BEGIN RSA PRIVATE KEY-----...
   EOF
   ```

6. **Build and run**

   ```bash
   # Build all packages
   pnpm build

   # Start the API server
   cd apps/api
   pnpm dev

   # In another terminal, start the dashboard
   cd apps/dashboard
   pnpm dev

   # Dashboard available at http://localhost:3000
   # API available at http://localhost:3001
   ```

## Development Phases

The platform is organized into 16 phases over **34–46 weeks** (part-time) or **16–20 weeks** (full-time):

| Phase | Name                              | Duration  | Status  |
| ----- | --------------------------------- | --------- | ------- |
| 0     | Research & Architecture           | 1 week    | Planned |
| 1     | Repository Discovery              | 1.5 weeks | Planned |
| 2     | Deterministic Repository Auditor  | 2 weeks   | Planned |
| 3     | Stack Detection Engine            | 2 weeks   | Planned |
| 4     | Rule Engine                       | 2.5 weeks | Planned |
| 5     | Local LLM Integration             | 2.5 weeks | Planned |
| 6     | Modernization Planner             | 2 weeks   | Planned |
| 7     | Cleanup Engine                    | 2 weeks   | Planned |
| 8     | Security Agent                    | 2 weeks   | Planned |
| 9     | Dependency Intelligence           | 2 weeks   | Planned |
| 10    | Portfolio Optimizer               | 1.5 weeks | Planned |
| 11    | Multi-Agent Architecture          | 3 weeks   | Planned |
| 12    | Pull Request Automation           | 2.5 weeks | Planned |
| 13    | Historical Analytics              | 2 weeks   | Planned |
| 14    | Continuous Monitoring             | 2 weeks   | Planned |
| 15    | Dissertation / Research Extension | 4–6 weeks | Planned |

**Note:** Phases 8 & 9 can run in parallel with 4–6 since they only depend on the stack detector.

## Quick Start: Try It Now

### 1. Scan Your User Repositories

```bash
cd apps/api
npx ts-node src/cli/discover-repos.ts --affiliation OWNER
```

### 2. Run the Full Audit

```bash
npx ts-node src/cli/full-scan.ts --owner your-username
```

### 3. View Results in Dashboard

```bash
# The dashboard is already running at http://localhost:3000
# Navigate to "Repositories" tab to see results
```

## Key APIs & Concepts

### RepoMetadata

Core repository information:

```typescript
interface Repository {
  id: string;
  nameWithOwner: string;
  owner: string;
  stars: number;
  forks: number;
  primaryLanguage?: string;
  topics: string[];
  pushedAt: DateTime;
}
```

### Finding

Audit findings (security, hygiene, dependencies):

```typescript
interface Finding {
  id: string;
  category: "hygiene" | "security" | "dependency" | "stack" | "structure";
  ruleId: string;
  severity: "Critical" | "High" | "Medium" | "Low" | "Info";
  confidence: number; // 0.0–1.0
  message: string;
  filePath?: string;
}
```

### HealthScore

Composite repository health:

```typescript
interface HealthScore {
  score: number; // 0–100
  breakdown: {
    hygiene: number;
    security: number;
    dependency: number;
    structure: number;
    freshness: number;
  };
  computedAt: DateTime;
}
```

### StackProfile

Detected technology stack:

```typescript
interface StackProfile {
  framework?: string;
  language?: string;
  database?: string;
  deployTarget?: string;
  rawSignals: Record<string, unknown>; // Debug trail
}
```

## Configuration

### Model Routing (`config/llm-routing.json`)

Choose which Ollama model to use for each task:

```json
{
  "classification": "qwen2.5-coder:3b",
  "summary": "qwen2.5-coder:7b",
  "readme": "deepseek-coder-v2:16b",
  "prDescription": "qwen2.5-coder:7b",
  "fallback": "qwen2.5-coder:3b"
}
```

### Repository Filters

Configured in `.env.local`:

```bash
SCAN_MIN_STARS=10
SCAN_EXCLUDE_FORKS=true
SCAN_EXCLUDE_ARCHIVED=true
SCAN_TOPICS_ALLOWLIST=typescript,nodejs
```

## Contributing

Contribution guidelines coming soon. For now:

- Follow the code style enforced by ESLint and Prettier
- Run `pnpm test` and `pnpm lint` before submitting changes
- Ensure all tests pass before opening a PR
- Each package should have its own test suite

## Testing

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run E2E tests (dashboard flows)
pnpm test:e2e

# Run specific package tests
cd packages/stack-detector
pnpm test
```

## Linting & Formatting

```bash
# Check linting
pnpm lint

# Format code
pnpm format

# Type checking
pnpm typecheck
```

## Deployment

### Local/Self-Hosted

**Docker Compose Setup:**

```bash
docker-compose up -d
```

**Environment Configuration:**
Create `.env.local` in the root directory with:

```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/repo_modernizer
GITHUB_TOKEN=ghp_...
OLLAMA_BASE_URL=http://localhost:11434
```

**GitHub App Registration:**

1. Go to GitHub Settings → Developer settings → GitHub Apps
2. Create new GitHub App with webhook URL pointing to your API
3. Store private key and app ID in `.env.local`

### Dashboard Hosting

The dashboard is a Next.js application and can be deployed to:

- Vercel
- Netlify
- Docker
- Self-hosted Node.js server

## Documentation

- **[docs/scope.md](docs/scope.md)** — Project goals, success metrics, and non-goals
- **[docs/architecture.md](docs/architecture.md)** — System architecture and module interactions
- **[docs/implementation_doc_phase_wise/](docs/implementation_doc_phase_wise/)** — Detailed phase specifications

## Security Considerations

✅ **What's Included:**

- Secret pattern detection with entropy analysis
- Environment variable leak detection
- No storage of actual secret values (redacted previews only)
- Optional historical secret scanning

⚠️ **What's Not (by design):**

- Automatic credential rotation (always requires human confirmation)
- Automatic history rewriting via `git filter-repo` (requires explicit user approval)
- Full static code analysis (uses heuristics and deterministic rules only)

**Important:** Always review generated PRs before merging. The system never auto-merges—human approval is mandatory.

## Known Limitations & Future Work

- **Scope:** Phase 15 (Dissertation) extends research validation; GitLab/Bitbucket support planned post-v1
- **Local LLM:** Model quality depends on hardware; larger models require 16GB+ VRAM
- **Secret Detection:** Combined pattern + entropy approach may miss novel secret formats
- **Effort Estimates:** Per-rule heuristics; refinement via historical cycle-time data in Phase 13

## License

MIT License — See [LICENSE](LICENSE) file for details.

## Citation

If you use this platform in research, cite as:

```bibtex
@software{repo_modernizer_2026,
  title = {AI-Powered GitHub Repository Modernization Platform},
  author = {Your Name},
  year = {2026},
  url = {https://github.com/rgrohitgupta938/ai_powered_github_repository_modernization_platform}
}
```

## Support & Contact

- **Issues:** [GitHub Issues](https://github.com/rgrohitgupta938/ai_powered_github_repository_modernization_platform/issues)
- **Discussions:** [GitHub Discussions](https://github.com/rgrohitgupta938/ai_powered_github_repository_modernization_platform/discussions)

---

**Last Updated:** June 23, 2026  
**Document Version:** 2.1 — Refined Master Plan with version-pinned stack
