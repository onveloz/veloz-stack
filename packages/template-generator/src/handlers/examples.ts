import type { ProjectConfig } from "@veloz-stack/types";
import { processTemplatesFromPrefix } from "../template-utils";
import type { VirtualFs } from "../vfs";

/**
 * Examples are optional opinionated starters that compose across the
 * stack: server router + DB schema + frontend route. Each example folder
 * is split by ORM / frontend so we only emit the pieces that match the
 * current config.
 *
 * Wave 2c ships the `todo` example for Drizzle only.
 */
export function processExamples(vfs: VirtualFs, config: ProjectConfig): void {
  if (config.examples.length === 0) return;

  if (config.examples.includes("todo")) emitTodo(vfs, config);
}

function emitTodo(vfs: VirtualFs, config: ProjectConfig): void {
  if (config.api !== "orpc") return; // router is oRPC-shaped
  // Wave 2c: Drizzle only. The common router imports `eq` + `schema` from
  // `@proj/db` — those are Drizzle-specific. Prisma variant lands in 2d.
  if (config.orm !== "drizzle" || config.db === "none") return;

  processTemplatesFromPrefix(vfs, "examples/todo/common/", "", config);
  processTemplatesFromPrefix(vfs, "examples/todo/drizzle/", "", config);
}
