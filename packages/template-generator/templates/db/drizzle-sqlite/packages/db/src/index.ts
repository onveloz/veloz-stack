import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";

const url = process.env.DATABASE_URL ?? "file:./local.db";
const authToken = process.env.DATABASE_AUTH_TOKEN;

export const client = createClient({ url, authToken });
export const db = drizzle(client, { schema });

export type Db = typeof db;
export { schema };
