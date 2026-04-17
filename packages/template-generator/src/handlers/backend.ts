import type { ProjectConfig } from "@veloz-stack/types";
import { version } from "../deps";
import { processTemplatesFromPrefix } from "../template-utils";
import type { VirtualFs } from "../vfs";

export function processBackend(vfs: VirtualFs, config: ProjectConfig): void {
  if (config.backend === "none") return;

  // Only Hono in Wave 2a. Rest of the backends come in Wave 2b.
  if (config.backend !== "hono") return;

  const isBun = config.runtime === "bun";
  const prefix = isBun ? "backend/hono-bun/" : "backend/hono-node/";
  processTemplatesFromPrefix(vfs, prefix, "apps/server/", config);

  vfs.write(
    "apps/server/package.json",
    JSON.stringify(
      {
        name: `@${config.projectName}/server`,
        private: true,
        type: "module",
        scripts: {
          dev: isBun ? "bun run --watch src/index.ts" : "tsx watch src/index.ts",
          start: isBun ? "bun run src/index.ts" : "node --experimental-strip-types src/index.ts",
          "check-types": "tsc --noEmit",
        },
        dependencies: {
          hono: version("hono"),
          ...(isBun ? {} : { "@hono/node-server": version("@hono/node-server") }),
          ...(config.api === "orpc"
            ? { "@orpc/server": version("@orpc/server") }
            : {}),
          ...(config.api !== "none"
            ? { [`@${config.projectName}/api`]: "workspace:*" }
            : {}),
          ...(config.auth === "better-auth"
            ? { [`@${config.projectName}/auth`]: "workspace:*" }
            : {}),
        },
        devDependencies: {
          typescript: version("typescript"),
          "@types/node": version("@types/node"),
          ...(isBun ? {} : { tsx: version("tsx") }),
        },
      },
      null,
      2,
    ) + "\n",
  );
}
