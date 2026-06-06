import { PrismaClient } from "@prisma/client";
import path from "path";

// Resolve the absolute path to prisma/dev.db relative to the project root
const dbPath = path.resolve(process.cwd(), "prisma/dev.db");

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    datasources: {
      db: {
        url: `file:${dbPath}`,
      },
    },
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
