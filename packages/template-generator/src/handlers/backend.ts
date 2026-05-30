import type { ProjectConfig } from "@veloz-stack/types";
import { version } from "../deps";
import { processTemplatesFromPrefix } from "../template-utils";
import type { VirtualFs } from "../vfs";

const HONO_PREFIX: Record<ProjectConfig["runtime"], string> = {
  workers: "backend/hono-workers/",
  bun: "backend/hono-bun/",
  node: "backend/hono-node/",
};

function honoScripts(runtime: ProjectConfig["runtime"]): {
  dev: string;
  start: string;
} {
  if (runtime === "workers") {
    return { dev: "wrangler dev", start: "wrangler deploy" };
  }
  if (runtime === "bun") {
    return {
      dev: "bun run --watch src/index.ts",
      start: "bun run src/index.ts",
    };
  }
  return {
    dev: "tsx watch src/index.ts",
    start: "node --experimental-strip-types src/index.ts",
  };
}

function honoDependencies(
  config: ProjectConfig,
  runtime: ProjectConfig["runtime"],
): Record<string, string> {
  const isBun = runtime === "bun";
  const isWorkers = runtime === "workers";
  return {
    hono: version("hono"),
    ...(!isBun && !isWorkers
      ? { "@hono/node-server": version("@hono/node-server") }
      : {}),
    ...(config.api === "orpc"
      ? { "@orpc/server": version("@orpc/server") }
      : {}),
    ...(config.api !== "none"
      ? { [`@${config.projectName}/api`]: "workspace:*" }
      : {}),
    ...(config.auth === "better-auth"
      ? { [`@${config.projectName}/auth`]: "workspace:*" }
      : {}),
  };
}

function honoDevDependencies(
  runtime: ProjectConfig["runtime"],
): Record<string, string> {
  const isBun = runtime === "bun";
  const isWorkers = runtime === "workers";
  return {
    typescript: version("typescript"),
    ...(isBun
      ? { "@types/bun": version("@types/bun") }
      : isWorkers
        ? {}
        : { "@types/node": version("@types/node") }),
    ...(!isBun && !isWorkers ? { tsx: version("tsx") } : {}),
    ...(isWorkers
      ? {
          wrangler: version("wrangler"),
          "@cloudflare/workers-types": version("@cloudflare/workers-types"),
        }
      : {}),
  };
}

function writeHonoServerPackage(
  vfs: VirtualFs,
  config: ProjectConfig,
  runtime: ProjectConfig["runtime"],
): void {
  const scripts = honoScripts(runtime);
  vfs.write(
    "apps/server/package.json",
    `${JSON.stringify(
      {
        name: `@${config.projectName}/server`,
        private: true,
        type: "module",
        scripts: {
          dev: scripts.dev,
          start: scripts.start,
          "check-types": "tsc --noEmit",
        },
        dependencies: honoDependencies(config, runtime),
        devDependencies: honoDevDependencies(runtime),
      },
      null,
      2,
    )}\n`,
  );
}

function processHonoBackend(vfs: VirtualFs, config: ProjectConfig): void {
  const { runtime } = config;
  processTemplatesFromPrefix({
    vfs,
    sourcePrefix: HONO_PREFIX[runtime],
    destPrefix: "apps/server/",
    config,
  });
  writeHonoServerPackage(vfs, config, runtime);
}

/** @internal Scaffold pipeline step. */
export function processBackend(vfs: VirtualFs, config: ProjectConfig): void {
  if (config.backend === "none") {
    return;
  }

  if (config.backend === "next") {
    processTemplatesFromPrefix({
      vfs,
      sourcePrefix: "backend/next/",
      destPrefix: "apps/web/",
      config,
    });
    return;
  }

  if (config.backend === "hono") {
    processHonoBackend(vfs, config);
  }
}
