# Zemstbos Cycling Club - Claude AI Agents

Specialized Claude AI agents for building and maintaining the cycling club management system.

## Overview

This project uses the Claude Agent SDK to provide specialized agents that assist with different aspects of the application development:

- **Database Manager**: Prisma queries, migrations, data operations
- **API Developer**: Next.js API routes, business logic, authentication
- **UI Builder**: Accessible React components for older users
- **Deployment Specialist**: Kubernetes deployment and monitoring
- **Testing Specialist**: Automated testing and accessibility audits

## Project Structure

```
agents/
├── lib/
│   ├── mcp-servers/           # Custom MCP tool servers
│   │   ├── database-server.ts # Database operations
│   │   └── prisma-server.ts   # Schema analysis
│   └── agent-config.ts        # Agent definitions
├── index.ts                   # Main entry point
├── package.json
└── tsconfig.json

.claude/
├── agents/                    # Agent definition files
│   ├── database-manager.md
│   ├── api-developer.md
│   ├── ui-component-builder.md
│   ├── deployment-specialist.md
│   └── testing-specialist.md
└── skills/                    # Reusable skills
    ├── cycling-data-analysis/
    ├── member-management/
    ├── event-scheduling/
    ├── route-planning/
    └── payment-processing/
```

## Installation

```bash
cd agents
npm install
```

## Building

```bash
npm run build
```

## Usage

### Importing Agents

```typescript
import {
  runAgent,
  getMemberStats,
  analyzePrismaSchema,
  createAPIRoute,
  createUIComponent,
  deployToKubernetes,
  runAccessibilityAudit
} from '@zemstbos/cycling-agents';
```

### Running an Agent

```typescript
// General agent execution
const result = await runAgent({
  agentType: "databaseManager",
  prompt: "List all active members and their payment status",
  maxTurns: 5
});

console.log(result.result);
```

### Helper Functions

```typescript
// Get member statistics
const stats = await getMemberStats("user-uuid-here");

// Analyze Prisma schema
const schemaAnalysis = await analyzePrismaSchema();

// Create API route
const apiRoute = await createAPIRoute({
  path: "/api/members/[id]",
  method: "GET",
  description: "Retrieve member details by ID"
});

// Create UI component
const component = await createUIComponent({
  name: "MemberCard",
  description: "Display member information in a card format",
  accessibility: true
});

// Deploy to Kubernetes
const deployment = await deployToKubernetes({
  version: "1.0.0",
  environment: "production"
});

// Run accessibility audit
const audit = await runAccessibilityAudit();
```

## Available Agents

### 1. Database Manager

**Purpose**: Database operations and Prisma management

**Capabilities**:
- Execute Prisma queries
- Manage migrations
- Validate data integrity
- Optimize performance
- Handle transformations

**MCP Tools**:
- `get_member` - Retrieve member by ID or email
- `list_members` - List members with filters
- `update_payment_status` - Update payment info
- `get_route` - Retrieve route details
- `list_routes` - List routes with filters
- `get_next_ride` - Get upcoming ride
- `list_scheduled_rides` - List scheduled rides
- `get_member_statistics` - Member stats
- `get_route_statistics` - Route stats

**Example**:
```typescript
const result = await runAgent({
  agentType: "databaseManager",
  prompt: "Update payment status for member john@example.com to 'paid' for year 2025"
});
```

### 2. API Developer

**Purpose**: Create Next.js API routes and business logic

**Capabilities**:
- Create API routes (App Router)
- Implement authentication/authorization
- Add input validation
- Handle errors (Dutch messages)
- Integrate with Prisma

**Example**:
```typescript
const result = await createAPIRoute({
  path: "/api/rides/upcoming",
  method: "GET",
  description: "Get list of upcoming scheduled rides"
});
```

### 3. UI Builder

**Purpose**: Create accessible React components

**Capabilities**:
- Build accessible components
- Implement responsive layouts
- Ensure WCAG AA compliance
- Optimize for older users
- Use Tailwind CSS

**Design Requirements**:
- 18px minimum font size
- 48x48px minimum touch targets
- High contrast colors
- Dutch language
- Clear navigation

**Example**:
```typescript
const result = await createUIComponent({
  name: "RideCalendar",
  description: "Display season calendar with all scheduled rides",
  accessibility: true
});
```

### 4. Deployment Specialist

**Purpose**: Kubernetes deployment and infrastructure

**Capabilities**:
- Manage K8s manifests
- Docker containerization
- Deployment pipelines
- Health monitoring
- Secret management

**Example**:
```typescript
const result = await deployToKubernetes({
  version: "1.0.0",
  environment: "production"
});
```

### 5. Testing Specialist

**Purpose**: Quality assurance and testing

**Capabilities**:
- Write automated tests
- Accessibility audits
- API endpoint validation
- WCAG AA compliance checking
- User flow testing

**Example**:
```typescript
const result = await runAccessibilityAudit();
```

## Skills

Skills are model-invoked capabilities that agents can use automatically.

### Cycling Data Analysis

Analyze member ride statistics, performance metrics, and participation trends.

**Use Cases**:
- Monthly board reports
- Season planning insights
- Member engagement campaigns
- Route selection

### Member Management

Handle member lifecycle from registration through renewal.

**Use Cases**:
- Process new registrations
- Update profiles
- Handle renewals
- Manage status changes

### Event Scheduling

Create and manage cycling events, routes, and logistics.

**Use Cases**:
- Schedule Sunday rides
- Plan special events
- Manage participants
- Route planning

### Route Planning

Design, upload, and manage cycling routes with GPX processing.

**Use Cases**:
- Upload GPX files
- Calculate distance/elevation
- Assess difficulty
- Manage route library

### Payment Processing

Track membership fees and payment status.

**Use Cases**:
- Update payment status
- Generate payment reports
- Handle renewals
- Track revenue

## MCP Servers

Custom MCP servers provide tools for agents to interact with the application.

### Database Tools Server

**Name**: `database-tools`

**Tools**:
- Member operations (get, list, update payment)
- Route operations (get, list)
- Scheduled ride operations (get next, list)
- Analytics (member stats, route stats)

### Prisma Tools Server

**Name**: `prisma-tools`

**Tools**:
- get_schema - Retrieve Prisma schema
- analyze_schema - Analyze models and relationships
- validate_schema - Validate syntax and structure

## Configuration

### .claude/settings.json

```json
{
  "permissions": {
    "allow": [
      "Read",
      "Write",
      "Edit",
      "Bash",
      "Grep",
      "Glob"
    ]
  }
}
```

### Agent Model Selection

- **Opus**: Complex operations (database, deployment)
- **Sonnet**: Standard development (API, UI)
- **Haiku**: Simple tasks (testing, validation)

## Integration with Next.js

### API Route Example

```typescript
// app/api/agents/analyze/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getMemberStats } from "@/agents";

export async function POST(request: NextRequest) {
  const { memberId } = await request.json();

  const result = await getMemberStats(memberId);

  if (result.success) {
    return NextResponse.json({ analysis: result.result });
  } else {
    return NextResponse.json(
      { error: result.error },
      { status: 500 }
    );
  }
}
```

## Development Workflow

### 1. Define Task

Identify which agent is best suited for the task:
- Database operations → Database Manager
- API development → API Developer
- UI components → UI Builder
- Deployment → Deployment Specialist
- Testing → Testing Specialist

### 2. Craft Prompt

Provide clear, specific instructions:

```typescript
const result = await runAgent({
  agentType: "apiDeveloper",
  prompt: `Create an API route that:
- Path: /api/admin/members/export
- Method: GET
- Exports member list to Excel
- Requires admin authentication
- Includes all member fields except password
- Returns downloadable file`,
  maxTurns: 8
});
```

### 3. Review Output

Agents return structured results:

```typescript
if (result.success) {
  console.log("Generated code:", result.result);
} else {
  console.error("Error:", result.error);
}
```

### 4. Iterate

Refine prompts based on output, add context as needed.

## Best Practices

### Prompt Engineering

1. **Be Specific**: Clearly state requirements
2. **Provide Context**: Reference related code/files
3. **Set Constraints**: Mention accessibility, language, etc.
4. **Define Success**: Specify acceptance criteria

### Agent Selection

- Use **Database Manager** for data operations
- Use **API Developer** for backend logic
- Use **UI Builder** for frontend components
- Use **Deployment Specialist** for infrastructure
- Use **Testing Specialist** for quality assurance

### Security

- Never commit secrets in agent prompts
- Validate all agent-generated code
- Review database operations before execution
- Test in development before production

### Accessibility

All UI components must meet:
- WCAG AA standards
- 18px minimum font size
- 48x48px minimum touch targets
- Keyboard navigation
- Screen reader compatibility
- Dutch language labels

## Troubleshooting

### Agent Not Found

```typescript
// Error: Unknown agent type
// Solution: Check agentType matches available agents
const result = await runAgent({
  agentType: "databaseManager", // Correct spelling
  prompt: "..."
});
```

### Tool Access Denied

```bash
# Error: Tool 'Bash' not allowed
# Solution: Check .claude/settings.json permissions
```

### Schema Not Found

```bash
# Error: Cannot find Prisma schema
# Solution: Ensure prisma/schema.prisma exists
```

## Environment Variables

Required for agents to function:

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/cycling_club"

# NextAuth
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# Google OAuth (for authentication agent)
GOOGLE_CLIENT_ID="your-client-id"
GOOGLE_CLIENT_SECRET="your-client-secret"
```

## Contributing

When adding new agents or skills:

1. Create agent definition in `.claude/agents/`
2. Add to `agentDefinitions` in `lib/agent-config.ts`
3. Create MCP tools if needed in `lib/mcp-servers/`
4. Document in this README
5. Add example usage

## License

Apache 2.0

## Support

For issues or questions about the cycling club management system or agents, see the main project README.
