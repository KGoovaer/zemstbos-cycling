/**
 * Database MCP Server
 *
 * Provides database tools for Claude agents to interact with the cycling club database.
 * Uses Prisma Client for type-safe database operations.
 */

import {
  createSdkMcpServer,
  tool
} from "@anthropic-ai/claude-agent-sdk";
import { z } from "zod";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  log: ['query', 'error', 'warn'],
});

export const databaseServer = createSdkMcpServer({
  name: "database-tools",
  version: "1.0.0",
  description: "Database operations for cycling club management",

  tools: [
    // ===== MEMBER OPERATIONS =====

    tool(
      "get_member",
      "Retrieve a cycling club member by ID or email",
      {
        memberId: z.string().uuid().optional().describe("Member UUID"),
        email: z.string().email().optional().describe("Member email address")
      },
      async (args) => {
        try {
          if (!args.memberId && !args.email) {
            return {
              content: [{
                type: "text",
                text: "Error: Either memberId or email is required"
              }],
              isError: true
            };
          }

          const member = await prisma.user.findFirst({
            where: args.memberId
              ? { id: args.memberId }
              : { email: args.email },
          });

          if (!member) {
            return {
              content: [{
                type: "text",
                text: "Member not found"
              }]
            };
          }

          // Don't expose password hash
          const { passwordHash, ...safeUser } = member;

          return {
            content: [{
              type: "text",
              text: JSON.stringify(safeUser, null, 2)
            }]
          };
        } catch (error) {
          return {
            content: [{
              type: "text",
              text: `Error retrieving member: ${error instanceof Error ? error.message : 'Unknown error'}`
            }],
            isError: true
          };
        }
      }
    ),

    tool(
      "list_members",
      "List cycling club members with filters and pagination",
      {
        limit: z.number().min(1).max(100).optional().default(50).describe("Max results"),
        offset: z.number().min(0).optional().default(0).describe("Pagination offset"),
        isActive: z.boolean().optional().describe("Filter by active status"),
        paymentStatus: z.enum(["paid", "unpaid", "exempt"]).optional().describe("Filter by payment status"),
        role: z.enum(["member", "admin"]).optional().describe("Filter by role")
      },
      async (args) => {
        try {
          const where: any = {};
          if (args.isActive !== undefined) where.isActive = args.isActive;
          if (args.paymentStatus) where.paymentStatus = args.paymentStatus;
          if (args.role) where.role = args.role;

          const members = await prisma.user.findMany({
            where,
            take: args.limit,
            skip: args.offset,
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              phone: true,
              role: true,
              paymentStatus: true,
              paymentYear: true,
              isActive: true,
              createdAt: true,
            },
            orderBy: { lastName: 'asc' }
          });

          const total = await prisma.user.count({ where });

          return {
            content: [{
              type: "text",
              text: JSON.stringify({
                members,
                total,
                limit: args.limit,
                offset: args.offset
              }, null, 2)
            }]
          };
        } catch (error) {
          return {
            content: [{
              type: "text",
              text: `Error listing members: ${error instanceof Error ? error.message : 'Unknown error'}`
            }],
            isError: true
          };
        }
      }
    ),

    tool(
      "update_payment_status",
      "Update a member's payment status and year",
      {
        memberId: z.string().uuid().describe("Member UUID"),
        paymentStatus: z.enum(["paid", "unpaid", "exempt"]).describe("Payment status"),
        paymentYear: z.number().min(2020).max(2100).optional().describe("Payment year")
      },
      async (args) => {
        try {
          const updateData: any = {
            paymentStatus: args.paymentStatus,
            updatedAt: new Date(),
          };

          if (args.paymentYear) {
            updateData.paymentYear = args.paymentYear;
          }

          const updated = await prisma.user.update({
            where: { id: args.memberId },
            data: updateData,
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              paymentStatus: true,
              paymentYear: true,
            }
          });

          return {
            content: [{
              type: "text",
              text: `Payment status updated successfully:\n${JSON.stringify(updated, null, 2)}`
            }]
          };
        } catch (error) {
          return {
            content: [{
              type: "text",
              text: `Error updating payment status: ${error instanceof Error ? error.message : 'Unknown error'}`
            }],
            isError: true
          };
        }
      }
    ),

    // ===== ROUTE OPERATIONS =====

    tool(
      "get_route",
      "Retrieve a cycling route by ID",
      {
        routeId: z.string().uuid().describe("Route UUID")
      },
      async (args) => {
        try {
          const route = await prisma.route.findUnique({
            where: { id: args.routeId }
          });

          if (!route) {
            return {
              content: [{
                type: "text",
                text: "Route not found"
              }]
            };
          }

          return {
            content: [{
              type: "text",
              text: JSON.stringify(route, null, 2)
            }]
          };
        } catch (error) {
          return {
            content: [{
              type: "text",
              text: `Error retrieving route: ${error instanceof Error ? error.message : 'Unknown error'}`
            }],
            isError: true
          };
        }
      }
    ),

    tool(
      "list_routes",
      "List cycling routes with filters",
      {
        limit: z.number().min(1).max(100).optional().default(50),
        difficulty: z.enum(["easy", "medium", "hard"]).optional(),
        region: z.string().optional(),
        minDistance: z.number().optional(),
        maxDistance: z.number().optional()
      },
      async (args) => {
        try {
          const where: any = {};
          if (args.difficulty) where.difficulty = args.difficulty;
          if (args.region) where.region = args.region;
          if (args.minDistance || args.maxDistance) {
            where.distanceKm = {};
            if (args.minDistance) where.distanceKm.gte = args.minDistance;
            if (args.maxDistance) where.distanceKm.lte = args.maxDistance;
          }

          const routes = await prisma.route.findMany({
            where,
            take: args.limit,
            select: {
              id: true,
              name: true,
              description: true,
              distanceKm: true,
              elevationM: true,
              difficulty: true,
              region: true,
              timesRidden: true,
              lastRidden: true,
              startLocation: true,
            },
            orderBy: { name: 'asc' }
          });

          return {
            content: [{
              type: "text",
              text: JSON.stringify({ routes, count: routes.length }, null, 2)
            }]
          };
        } catch (error) {
          return {
            content: [{
              type: "text",
              text: `Error listing routes: ${error instanceof Error ? error.message : 'Unknown error'}`
            }],
            isError: true
          };
        }
      }
    ),

    // ===== SCHEDULED RIDE OPERATIONS =====

    tool(
      "get_next_ride",
      "Get the next upcoming scheduled ride",
      {},
      async () => {
        try {
          const now = new Date();
          now.setHours(0, 0, 0, 0);

          const nextRide = await prisma.scheduledRide.findFirst({
            where: {
              rideDate: { gte: now },
              status: 'scheduled'
            },
            include: {
              route: {
                select: {
                  name: true,
                  distanceKm: true,
                  elevationM: true,
                  difficulty: true,
                  startLocation: true,
                }
              }
            },
            orderBy: { rideDate: 'asc' }
          });

          if (!nextRide) {
            return {
              content: [{
                type: "text",
                text: "No upcoming rides scheduled"
              }]
            };
          }

          return {
            content: [{
              type: "text",
              text: JSON.stringify(nextRide, null, 2)
            }]
          };
        } catch (error) {
          return {
            content: [{
              type: "text",
              text: `Error getting next ride: ${error instanceof Error ? error.message : 'Unknown error'}`
            }],
            isError: true
          };
        }
      }
    ),

    tool(
      "list_scheduled_rides",
      "List scheduled rides for a season",
      {
        seasonYear: z.number().optional().describe("Filter by season year"),
        limit: z.number().min(1).max(100).optional().default(50)
      },
      async (args) => {
        try {
          const where: any = {};

          if (args.seasonYear) {
            const season = await prisma.season.findFirst({
              where: { year: args.seasonYear }
            });
            if (season) {
              where.seasonId = season.id;
            }
          }

          const rides = await prisma.scheduledRide.findMany({
            where,
            include: {
              route: {
                select: {
                  name: true,
                  distanceKm: true,
                  elevationM: true,
                  difficulty: true,
                }
              },
              season: {
                select: {
                  year: true
                }
              }
            },
            orderBy: { rideDate: 'asc' },
            take: args.limit
          });

          return {
            content: [{
              type: "text",
              text: JSON.stringify({ rides, count: rides.length }, null, 2)
            }]
          };
        } catch (error) {
          return {
            content: [{
              type: "text",
              text: `Error listing rides: ${error instanceof Error ? error.message : 'Unknown error'}`
            }],
            isError: true
          };
        }
      }
    ),

    // ===== ANALYTICS OPERATIONS =====

    tool(
      "get_member_statistics",
      "Get statistics about members (count, payment status, etc.)",
      {},
      async () => {
        try {
          const total = await prisma.user.count();
          const active = await prisma.user.count({ where: { isActive: true } });
          const paid = await prisma.user.count({ where: { paymentStatus: 'paid' } });
          const unpaid = await prisma.user.count({ where: { paymentStatus: 'unpaid' } });
          const exempt = await prisma.user.count({ where: { paymentStatus: 'exempt' } });
          const admins = await prisma.user.count({ where: { role: 'admin' } });

          const stats = {
            total,
            active,
            inactive: total - active,
            payment: {
              paid,
              unpaid,
              exempt
            },
            roles: {
              admins,
              members: total - admins
            }
          };

          return {
            content: [{
              type: "text",
              text: JSON.stringify(stats, null, 2)
            }]
          };
        } catch (error) {
          return {
            content: [{
              type: "text",
              text: `Error getting statistics: ${error instanceof Error ? error.message : 'Unknown error'}`
            }],
            isError: true
          };
        }
      }
    ),

    tool(
      "get_route_statistics",
      "Get statistics about routes (count, average distance, etc.)",
      {},
      async () => {
        try {
          const total = await prisma.route.count();

          const routes = await prisma.route.findMany({
            select: {
              distanceKm: true,
              elevationM: true,
              difficulty: true,
              timesRidden: true,
            }
          });

          const avgDistance = routes.reduce((sum, r) => sum + Number(r.distanceKm), 0) / routes.length;
          const avgElevation = routes.reduce((sum, r) => sum + (r.elevationM || 0), 0) / routes.length;

          const byDifficulty = {
            easy: routes.filter(r => r.difficulty === 'easy').length,
            medium: routes.filter(r => r.difficulty === 'medium').length,
            hard: routes.filter(r => r.difficulty === 'hard').length,
          };

          const stats = {
            total,
            averageDistance: Math.round(avgDistance * 10) / 10,
            averageElevation: Math.round(avgElevation),
            byDifficulty,
            totalRides: routes.reduce((sum, r) => sum + r.timesRidden, 0),
          };

          return {
            content: [{
              type: "text",
              text: JSON.stringify(stats, null, 2)
            }]
          };
        } catch (error) {
          return {
            content: [{
              type: "text",
              text: `Error getting statistics: ${error instanceof Error ? error.message : 'Unknown error'}`
            }],
            isError: true
          };
        }
      }
    ),
  ]
});

export default databaseServer;
