import { PrismaClient } from "@prisma/client";

/** @internal Scaffold export. */
export const db = new PrismaClient();
/** @internal Generated-app type. */
export type Db = typeof db;

