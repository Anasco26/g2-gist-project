import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import config from "../config";

if (!config.databaseUrl) {
  throw new Error("DATABASE_URL must be set before initializing Prisma");
}

const adapter = new PrismaPg({ connectionString: config.databaseUrl });
const prisma = new PrismaClient({ adapter });

export default prisma;
