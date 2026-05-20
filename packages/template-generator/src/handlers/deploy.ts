import type { ProjectConfig } from "@veloz-stack/types";
import { render } from "../processor";
import { EMBEDDED_TEMPLATES } from "../templates.generated";
import { processTemplatesFromPrefix } from "../template-utils";
import type { VirtualFs } from "../vfs";

function writeDockerfile(vfs: VirtualFs, config: ProjectConfig): void {
  if (config.backend === "next") {
    const src = EMBEDDED_TEMPLATES.get("deploy/veloz/Dockerfile.next.hbs");
    if (src) vfs.write("Dockerfile", render(src, config));
    return;
  }
  const src = EMBEDDED_TEMPLATES.get("deploy/veloz/Dockerfile");
  if (src) vfs.write("Dockerfile", src);
}

export function processDeploy(vfs: VirtualFs, config: ProjectConfig): void {
  switch (config.deploy) {
    case "veloz": {
      processTemplatesFromPrefix(vfs, "deploy/veloz/", "", config);
      writeDockerfile(vfs, config);
      vfs.write("veloz.json", velozJson(config));
      break;
    }
    case "fly":
      processTemplatesFromPrefix(vfs, "deploy/fly/", "", config);
      processTemplatesFromPrefix(vfs, "deploy/veloz/", "", config);
      writeDockerfile(vfs, config);
      break;
    case "render":
      processTemplatesFromPrefix(vfs, "deploy/render/", "", config);
      processTemplatesFromPrefix(vfs, "deploy/veloz/", "", config);
      writeDockerfile(vfs, config);
      break;
    case "docker":
      processTemplatesFromPrefix(vfs, "deploy/docker/", "", config);
      processTemplatesFromPrefix(vfs, "deploy/veloz/", "", config);
      writeDockerfile(vfs, config);
      break;
    case "vercel":
      vfs.write(
        "vercel.json",
        JSON.stringify(
          {
            $schema: "https://openapi.vercel.sh/vercel.json",
            buildCommand: `${config.pm} run build`,
            installCommand: `${config.pm} install`,
          },
          null,
          2,
        ) + "\n",
      );
      break;
    case "cloudflare":
      processTemplatesFromPrefix(vfs, "deploy/cloudflare/", "", config);
      break;
    case "none":
    default:
      break;
  }
}

/**
 * Emit a veloz.json aligned with the official schema:
 *   https://onveloz.com/schemas/veloz-config.schema.json
 *
 * Notes:
 *   - `services` is an object keyed by a service path, NOT an array.
 *   - `type` is lowercase ('web' | 'static' | 'worker' | 'database').
 *   - `build.method` is the discriminator ('dockerfile' | 'nixpacks' |
 *     'turborepo' | 'nx' | 'moon').
 *   - `project.id` + `service.id` are populated by `veloz init` / `veloz
 *     link`. We leave them out so the CLI picks them up on first link.
 */
function velozJson(config: ProjectConfig): string {
  const hasTurborepo = config.addons.includes("turborepo");
  const services: Record<string, unknown> = {};

  // Server — separate process when backend is Hono (or future express/fastify/elysia)
  if (config.backend !== "none" && config.backend !== "next") {
    services["apps/server"] = {
      name: "server",
      type: "web",
      root: "apps/server",
      build: hasTurborepo
        ? {
            method: "turborepo",
            command: `${config.pm} run build`,
            appName: `@${config.projectName}/server`,
          }
        : {
            method: "dockerfile",
            dockerfile: "../../Dockerfile",
          },
      runtime: {
        port: 3000,
        command: runtimeCommand(config),
      },
      healthCheck: { path: "/health" },
    };
  }

  // Web — when a server-rendered frontend is picked. Expo doesn't deploy
  // to Veloz; `none` obviously skips; static Astro could use `static` type
  // but we ship with SSR adapter so it's a web service.
  const webService = webServiceShape(config);
  if (webService) {
    if (config.backend === "next") {
      webService.healthCheck = { path: "/api/health" };
    }
    services["apps/web"] = webService;
  }

  const doc = {
    $schema: "https://onveloz.com/schemas/veloz-config.schema.json",
    version: "1.0" as const,
    project: {
      name: config.projectName,
    },
    services,
  };

  return JSON.stringify(doc, null, 2) + "\n";
}

function runtimeCommand(config: ProjectConfig): string {
  if (config.runtime === "bun") return "bun run src/index.ts";
  if (config.runtime === "node") return "node --experimental-strip-types src/index.ts";
  // workers runs via `wrangler dev` — Veloz doesn't host Workers so this
  // path is mostly dead code, but emit something sensible.
  return "echo 'Workers: use wrangler deploy'";
}

function webServiceShape(
  config: ProjectConfig,
): Record<string, unknown> | null {
  if (config.frontend === "none") return null;

  const hasTurborepo = config.addons.includes("turborepo");
  const build = hasTurborepo
    ? {
        method: "turborepo" as const,
        command: `${config.pm} run build`,
        appName: `@${config.projectName}/web`,
      }
    : {
        method: "nixpacks" as const,
      };

  const runtime: Record<string, unknown> = { port: 3001 };
  if (config.frontend === "next") {
    runtime.command = `${config.pm} --filter @${config.projectName}/web exec next start`;
  } else if (config.frontend === "nuxt") {
    runtime.command = `${config.pm} --filter @${config.projectName}/web exec nuxt preview`;
  } else {
    // tanstack-start, svelte-kit, astro all wire their own `start` script
    runtime.command = `${config.pm} --filter @${config.projectName}/web start`;
  }

  return {
    name: "web",
    type: "web",
    root: "apps/web",
    build,
    runtime,
  };
}
