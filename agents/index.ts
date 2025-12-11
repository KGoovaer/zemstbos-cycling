/**
 * Main Agent Entry Point
 *
 * Provides functions to run different cycling club management agents.
 */

import { query } from "@anthropic-ai/claude-agent-sdk";
import { agentDefinitions } from "./lib/agent-config";
import { databaseServer } from "./lib/mcp-servers/database-server";
import { prismaServer } from "./lib/mcp-servers/prisma-server";

export type AgentType =
  | "databaseManager"
  | "apiDeveloper"
  | "uiBuilder"
  | "deploymentSpecialist"
  | "testingSpecialist";

export interface AgentRequest {
  agentType: AgentType;
  prompt: string;
  maxTurns?: number;
}

export interface AgentResult {
  success: boolean;
  result?: string;
  error?: string;
}

/**
 * Run a specific agent with a prompt
 */
export async function runAgent(request: AgentRequest): Promise<AgentResult> {
  const selectedAgent = agentDefinitions[request.agentType];

  if (!selectedAgent) {
    return {
      success: false,
      error: `Unknown agent type: ${request.agentType}`
    };
  }

  try {
    let result = "";

    for await (const message of query({
      prompt: request.prompt,
      options: {
        agents: agentDefinitions,
        mcpServers: {
          "database-tools": databaseServer,
          "prisma-tools": prismaServer,
        },
        allowedTools: selectedAgent.tools,
        maxTurns: request.maxTurns || 10,
        settingSources: ["project"],
        systemPrompt: selectedAgent.prompt,
        model: selectedAgent.model,
      }
    })) {
      if (message.type === "result" && message.subtype === "success") {
        result = message.result;
      }

      if (message.type === "assistant") {
        console.log("Assistant:", message.message.content);
      }
    }

    return {
      success: true,
      result
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
}

/**
 * Specific agent helper functions
 */

export async function getMemberStats(memberId: string): Promise<AgentResult> {
  return runAgent({
    agentType: "databaseManager",
    prompt: `Get comprehensive statistics for member ID ${memberId} including their payment status, participation history, and any relevant notes.`,
    maxTurns: 5
  });
}

export async function analyzePrismaSchema(): Promise<AgentResult> {
  return runAgent({
    agentType: "databaseManager",
    prompt: `Analyze the current Prisma schema and provide insights on:
- Model count and relationships
- Index optimization opportunities
- Potential performance improvements
- Schema validation issues`,
    maxTurns: 5
  });
}

export async function createAPIRoute(routeDetails: {
  path: string;
  method: string;
  description: string;
}): Promise<AgentResult> {
  return runAgent({
    agentType: "apiDeveloper",
    prompt: `Create a Next.js 14 API route at path ${routeDetails.path} with method ${routeDetails.method}.
Description: ${routeDetails.description}

Include:
- Proper authentication and authorization
- Input validation
- Error handling
- Dutch language error messages
- TypeScript types`,
    maxTurns: 8
  });
}

export async function createUIComponent(componentDetails: {
  name: string;
  description: string;
  accessibility: boolean;
}): Promise<AgentResult> {
  return runAgent({
    agentType: "uiBuilder",
    prompt: `Create a React component named ${componentDetails.name}.
Description: ${componentDetails.description}

Requirements:
- TypeScript
- Tailwind CSS styling
- Minimum 18px font size
- 48x48px minimum touch targets
${componentDetails.accessibility ? "- WCAG AA compliant\n- Keyboard navigable\n- Screen reader friendly" : ""}
- Dutch language labels`,
    maxTurns: 8
  });
}

export async function deployToKubernetes(deploymentConfig: {
  version: string;
  environment: "staging" | "production";
}): Promise<AgentResult> {
  return runAgent({
    agentType: "deploymentSpecialist",
    prompt: `Deploy cycling club application version ${deploymentConfig.version} to ${deploymentConfig.environment}.

Tasks:
- Build Docker image
- Push to registry
- Apply Kubernetes manifests
- Verify health checks
- Monitor deployment status`,
    maxTurns: 10
  });
}

export async function runAccessibilityAudit(): Promise<AgentResult> {
  return runAgent({
    agentType: "testingSpecialist",
    prompt: `Perform a comprehensive accessibility audit of the cycling club application.

Check:
- Keyboard navigation on all pages
- Screen reader compatibility
- Color contrast ratios (WCAG AA)
- Touch target sizes
- Form label associations
- Focus indicators

Generate report with findings and recommendations.`,
    maxTurns: 10
  });
}

// Export types and configurations
export { agentDefinitions } from "./lib/agent-config";
export { databaseServer } from "./lib/mcp-servers/database-server";
export { prismaServer } from "./lib/mcp-servers/prisma-server";
