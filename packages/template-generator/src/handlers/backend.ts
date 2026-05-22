import type { ProjectConfig } from "@veloz-stack/types";
import { version } from "../deps";
import { processTemplatesFromPrefix } from "../template-utils";
import type { VirtualFs } from "../vfs";

export function processBackend(vfs: VirtualFs, config: ProjectConfig): void {
  if (config.backend === "none") return;

  if (config.backend === "next") {
    processTemplatesFromPrefix(vfs, "backend/next/", "apps/web/", config);
    return;
  }

  if (config.backend !== "hono") return;

  const runtime = config.runtime;
  const prefix =
    runtime === "workers"
      ? "backend/hono-workers/"
      : runtime === "bun"
        ? "backend/hono-bun/"
        : "backend/hono-node/";
  processTemplatesFromPrefix(vfs, prefix, "apps/server/", config);

  const isBun = runtime === "bun";
  const isWorkers = runtime === "workers";

  vfs.write(
    "apps/server/package.json",
    `${JSON.stringify(
      {
        name: `@${config.projectName}/server`,
        private: true,
        type: "module",
        scripts: {
          dev: isWorkers
            ? "wrangler dev"
            : isBun
              ? "bun run --watch src/index.ts"
              : "tsx watch src/index.ts",
          start: isWorkers
            ? "wrangler deploy"
            : isBun
              ? "bun run src/index.ts"
              : "node --experimental-strip-types src/index.ts",
          "check-types": "tsc --noEmit",
        },
        dependencies: {
          hono: version("hono"),
          ...(isBun || isWorkers ? {} : { "@hono/node-server": version("@hono/node-server") }),
          ...(config.api === "orpc" ? { "@orpc/server": version("@orpc/server") } : {}),
          ...(config.api !== "none" ? { [`@${config.projectName}/api`]: "workspace:*" } : {}),
          ...(config.auth === "better-auth"
            ? { [`@${config.projectName}/auth`]: "workspace:*" }
            : {}),
        },
        devDependencies: {
          typescript: version("typescript"),
          ...(isBun
            ? { "@types/bun": version("@types/bun") }
            : { "@types/node": version("@types/node") }),
          ...(!isBun && !isWorkers ? { tsx: version("tsx") } : {}),
          ...(isWorkers
            ? {
                wrangler: version("wrangler"),
                "@cloudflare/workers-types": version("@cloudflare/workers-types"),
              }
            : {}),
        },
      },
      null,
      2,
    )}\n`,
  );
}
