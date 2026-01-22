# Deep Diligence

An AI-powered due diligence platform that automates company research for investment, acquisition, and partnership decisions.

## Overview

Deep Diligence uses an orchestrated multi-agent system to conduct comprehensive research on target companies. The platform can:

- Research company information, corporate structure, and financials
- Investigate founders and key personnel
- Conduct outreach via email and phone calls
- Generate detailed due diligence reports

## Architecture

This is a monorepo managed with [pnpm](https://pnpm.io/) workspaces and [Turborepo](https://turbo.build/).

### Apps

| App | Description |
|-----|-------------|
| `apps/web` | Next.js 16 web application with AI agents and research UI |
| `apps/tunnel` | Cloudflare tunnel for exposing local webhooks |
| `apps/firecrawl` | Optional self-hosted [Firecrawl](https://firecrawl.dev/) instance (git submodule) |

### Tech Stack

- **Framework**: Next.js 16 with React 19
- **Database**: PostgreSQL with Drizzle ORM
- **AI**: Anthropic Claude via Vercel AI SDK
- **Background Jobs**: Trigger.dev
- **Web Scraping**: Firecrawl
- **Email**: Resend
- **Voice**: ElevenLabs
- **Styling**: Tailwind CSS 4
- **Linting**: Biome

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm 10.7.0+
- PostgreSQL database
- API keys for: Anthropic, Firecrawl, Resend, ElevenLabs (optional)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd deep-diligence

# Install dependencies
pnpm install

# Set up environment variables
cp apps/web/.env.example apps/web/.env.local
# Edit .env.local with your API keys
```

### Database Setup

```bash
# Generate migrations
pnpm --filter @deep-diligence/web db:generate

# Run migrations
pnpm --filter @deep-diligence/web db:migrate

# Or push schema directly (development)
pnpm --filter @deep-diligence/web db:push
```

### Development

```bash
# Start all services (web, trigger.dev, ai devtools)
pnpm dev

# Or run individual apps
pnpm --filter @deep-diligence/web dev
```

The web app will be available at [http://localhost:3000](http://localhost:3000).

### Tunnel Setup (for webhooks)

To receive webhooks locally (email replies, phone call completions):

```bash
# Login to Cloudflare
pnpm --filter @deep-diligence/tunnel cf:login

# Create tunnel
pnpm --filter @deep-diligence/tunnel cf:create

# Start tunnel
pnpm --filter @deep-diligence/tunnel dev
```

## Using Firecrawl

### Hosted Firecrawl (Recommended)

The simplest option is to use Firecrawl's hosted API. Just add your API key to `.env.local`:

```bash
FIRECRAWL_API_KEY=your-api-key-here
```

Get an API key at [firecrawl.dev](https://firecrawl.dev/).

### Self-Hosted Firecrawl (Optional)

If you prefer to run Firecrawl locally (e.g., for higher rate limits or privacy), this repo includes it as a git submodule:

```bash
# Initialize and clone the firecrawl submodule
git submodule update --init --recursive

# Follow setup instructions in apps/firecrawl/
cd apps/firecrawl
# See the Firecrawl README for Docker/local setup
```

Then update your `.env.local` to point to your local instance:

```bash
FIRECRAWL_API_URL=http://localhost:3002
FIRECRAWL_API_KEY=your-local-key  # if configured
```

## Project Structure

```
deep-diligence/
├── apps/
│   ├── web/                    # Main Next.js application
│   │   ├── app/                # Next.js app router pages
│   │   ├── components/         # React components
│   │   ├── lib/
│   │   │   ├── data/           # Database schema and queries
│   │   │   └── research/
│   │   │       ├── agents/     # AI agent definitions
│   │   │       ├── clients/    # External service clients
│   │   │       └── tools/      # Agent tools
│   │   ├── trigger/            # Trigger.dev background tasks
│   │   └── drizzle/            # Database migrations
│   ├── tunnel/                 # Cloudflare tunnel config
│   └── firecrawl/              # Optional self-hosted Firecrawl (submodule)
├── turbo.json                  # Turborepo configuration
├── pnpm-workspace.yaml         # pnpm workspace config
└── package.json                # Root package.json
```

## AI Agents

The research system uses a hierarchical agent architecture:

- **Orchestrator**: Plans and coordinates research, spawns sub-agents
- **Corporate Agent**: Researches company structure, financials, news
- **Founder Agent**: Investigates founders and leadership team
- **Contact Agent**: Handles email and phone outreach
- **General Agent**: Performs general web research tasks

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start all development servers |
| `pnpm build` | Build all apps |
| `pnpm --filter @deep-diligence/web db:studio` | Open Drizzle Studio |
| `pnpm --filter @deep-diligence/web lint` | Run Biome linter |
| `pnpm --filter @deep-diligence/web format` | Format code with Biome |

## License

Private
