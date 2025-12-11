/**
 * Prisma Schema Analysis MCP Server
 *
 * Provides tools for analyzing and validating Prisma schema files.
 */

import {
  createSdkMcpServer,
  tool
} from "@anthropic-ai/claude-agent-sdk";
import { z } from "zod";
import fs from "fs/promises";
import path from "path";

export const prismaServer = createSdkMcpServer({
  name: "prisma-tools",
  version: "1.0.0",
  description: "Prisma schema analysis and validation tools",

  tools: [
    tool(
      "get_schema",
      "Retrieve the full Prisma schema content",
      {},
      async () => {
        try {
          const schemaPath = path.join(process.cwd(), "prisma", "schema.prisma");
          const schema = await fs.readFile(schemaPath, "utf-8");

          return {
            content: [{
              type: "text",
              text: schema
            }]
          };
        } catch (error) {
          return {
            content: [{
              type: "text",
              text: `Error retrieving schema: ${error instanceof Error ? error.message : 'Unknown error'}`
            }],
            isError: true
          };
        }
      }
    ),

    tool(
      "analyze_schema",
      "Analyze Prisma schema for models, relationships, and indexes",
      {},
      async () => {
        try {
          const schemaPath = path.join(process.cwd(), "prisma", "schema.prisma");
          const schema = await fs.readFile(schemaPath, "utf-8");

          // Count models
          const models = schema.match(/^model\s+\w+\s*\{/gm) || [];
          const modelNames = models.map(m => m.match(/model\s+(\w+)/)?.[1]).filter(Boolean);

          // Count relationships
          const relationships = schema.match(/@relation/g) || [];

          // Count indexes
          const indexes = schema.match(/@@index/g) || [];

          // Check for datasource and generator
          const hasDataSource = schema.includes("datasource");
          const hasGenerator = schema.includes("generator");

          const analysis = {
            modelCount: models.length,
            models: modelNames,
            relationshipCount: relationships.length,
            indexCount: indexes.length,
            hasDataSource,
            hasGenerator,
            valid: hasDataSource && hasGenerator && models.length > 0,
          };

          return {
            content: [{
              type: "text",
              text: JSON.stringify(analysis, null, 2)
            }]
          };
        } catch (error) {
          return {
            content: [{
              type: "text",
              text: `Error analyzing schema: ${error instanceof Error ? error.message : 'Unknown error'}`
            }],
            isError: true
          };
        }
      }
    ),

    tool(
      "validate_schema",
      "Validate Prisma schema syntax and structure",
      {},
      async () => {
        try {
          const schemaPath = path.join(process.cwd(), "prisma", "schema.prisma");
          const schema = await fs.readFile(schemaPath, "utf-8");

          const issues: string[] = [];

          // Basic validations
          if (!schema.includes("datasource")) {
            issues.push("Missing datasource block");
          }

          if (!schema.includes("generator")) {
            issues.push("Missing generator block");
          }

          const models = schema.match(/^model\s+\w+\s*\{/gm) || [];
          if (models.length === 0) {
            issues.push("No models defined");
          }

          const validation = {
            valid: issues.length === 0,
            issues,
            modelCount: models.length,
          };

          return {
            content: [{
              type: "text",
              text: JSON.stringify(validation, null, 2)
            }]
          };
        } catch (error) {
          return {
            content: [{
              type: "text",
              text: `Error validating schema: ${error instanceof Error ? error.message : 'Unknown error'}`
            }],
            isError: true
          };
        }
      }
    ),
  ]
});

export default prismaServer;
