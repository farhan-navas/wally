import { PrismaClient } from "@prisma/client";
import { Pinecone } from "@pinecone-database/pinecone";

import { env } from "~/envServer";

const createPrismaClient = () =>
  new PrismaClient({
    log:
      env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

// Function to create a Pinecone Client
const createPineconeClient = () =>
  new Pinecone({
    apiKey: env.PINECONE_API_KEY,
  });

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createPrismaClient> | undefined;
  pinecone: Pinecone | undefined;
};

// Prisma Client Singleton
export const db = globalForPrisma.prisma ?? createPrismaClient();
if (env.NODE_ENV !== "production") globalForPrisma.prisma = db;

// Pinecone Client Singleton
export const pinecone = globalForPrisma.pinecone ?? createPineconeClient();
if (env.NODE_ENV !== "production") globalForPrisma.pinecone = pinecone;
