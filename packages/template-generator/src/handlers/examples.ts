import type { ProjectConfig } from "@veloz-stack/types";
import { processTemplatesFromPrefix } from "../template-utils";
import type { VirtualFs } from "../vfs";

/**
 * Examples are optional opinionated starters that compose across the
 * stack: server router + DB schema + frontend route. Each example folder
 * is split by ORM / frontend so we only emit the pieces that match the
 * current config.
 */
export function processExamples(vfs: VirtualFs, config: ProjectConfig): void {
  if (config.examples.length === 0) return;

  if (config.examples.includes("todo")) emitTodo(vfs, config);
  if (config.examples.includes("pix-checkout")) emitPixCheckout(vfs, config);
}

function emitTodo(vfs: VirtualFs, config: ProjectConfig): void {
  if (config.api !== "orpc") return; // router is oRPC-shaped
  // Wave 2c: Drizzle only. The common router imports `eq` + `schema` from
  // `@proj/db` — those are Drizzle-specific. Prisma variant lands in 2d.
  if (config.orm !== "drizzle" || config.db === "none") return;

  if (config.db !== "postgres" && config.db !== "sqlite") {
    console.warn(
      `[veloz-stack] todo example skipped: unsupported db "${config.db}" (expected postgres or sqlite)`,
    );
    return;
  }

  processTemplatesFromPrefix(vfs, "examples/todo/common/", "", config);
  if (config.db === "postgres") {
    processTemplatesFromPrefix(vfs, "examples/todo/drizzle-pg/", "", config);
  }
  if (config.db === "sqlite") {
    processTemplatesFromPrefix(vfs, "examples/todo/drizzle-sqlite/", "", config);
  }
}

function emitPixCheckout(vfs: VirtualFs, config: ProjectConfig): void {
  if (config.api !== "orpc") return;
  // Silently skip if AbacatePay module isn't picked — the router imports
  // from @proj/abacatepay which wouldn't exist. The picker UI should warn.
  if (!config.modules.includes("abacatepay")) return;
  processTemplatesFromPrefix(vfs, "examples/pix-checkout/common/", "", config);

  if (config.frontend === "tanstack-start") {
    processTemplatesFromPrefix(vfs, "examples/pix-checkout/frontend-tanstack/", "", config);
  }
}
