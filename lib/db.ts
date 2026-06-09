import { PrismaClient } from "@prisma/client";
import path from "path";
import fs from "fs";

let dbPath: string;

if (process.env.VERCEL) {
  // On Vercel, the file system is read-only. We copy the SQLite database to the writable /tmp folder.
  const tempDbPath = "/tmp/dev.db";
  const bundledDbPath = path.resolve(process.cwd(), "prisma/dev.db");

  try {
    if (!fs.existsSync(tempDbPath)) {
      console.log(`[Vercel DB Init] Copying database from ${bundledDbPath} to ${tempDbPath}`);
      if (fs.existsSync(bundledDbPath)) {
        fs.copyFileSync(bundledDbPath, tempDbPath);
        fs.chmodSync(tempDbPath, 0o666);
        console.log("[Vercel DB Init] Database successfully copied and prepared.");
      } else {
        console.warn(`[Vercel DB Init] Bundled database not found at ${bundledDbPath}. A fresh file will be initialized.`);
      }
    }
  } catch (err) {
    console.error("[Vercel DB Init] Error copying database file:", err);
  }
  dbPath = tempDbPath;
} else {
  // Local environment uses the standard project path
  dbPath = path.resolve(process.cwd(), "prisma/dev.db");
}

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
