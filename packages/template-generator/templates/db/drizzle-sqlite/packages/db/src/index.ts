import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";

const url = process.env.DATABASE_URL ?? "file:./local.db";
const authToken = process.env.DATABASE_AUTH_TOKEN;

/** @internal Scaffold export. */
export const client = createClient({ url, authToken });
/** @internal Scaffold export. */
export const db = drizzle(client, { schema });

/** @internal Generated-app type. */
export type Db = typeof db;
/** @internal Scaffold export. */
export { schema };


