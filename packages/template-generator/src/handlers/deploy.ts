import type { ProjectConfig } from "@veloz-stack/types";
import { processTemplatesFromPrefix } from "../template-utils";
import type { VirtualFs } from "../vfs";

export function processDeploy(vfs: VirtualFs, config: ProjectConfig): void {
  switch (config.deploy) {
    case "veloz": {
      processTemplatesFromPrefix(vfs, "deploy/veloz/", "", config);
      vfs.write("veloz.json", velozJson(config));
      break;
    }
    case "fly":
      processTemplatesFromPrefix(vfs, "deploy/fly/", "", config);
      processTemplatesFromPrefix(vfs, "deploy/veloz/", "", config); // shares Dockerfile
      break;
    case "render":
      processTemplatesFromPrefix(vfs, "deploy/render/", "", config);
      processTemplatesFromPrefix(vfs, "deploy/veloz/", "", config);
      break;
    case "docker":
      processTemplatesFromPrefix(vfs, "deploy/docker/", "", config);
      processTemplatesFromPrefix(vfs, "deploy/veloz/", "", config);
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

function velozJson(config: ProjectConfig): string {
  return (
    JSON.stringify(
      {
        $schema: "https://onveloz.com/schemas/veloz.schema.json",
        name: config.projectName,
        services: [
          {
            name: "server",
            type: "WEB",
            rootDirectory: "apps/server",
            build: { type: "docker", dockerfile: "../../Dockerfile" },
            healthCheck: { path: "/health" },
            envFromSecrets: deployEnv(config),
          },
        ],
      },
      null,
      2,
    ) + "\n"
  );
}

function deployEnv(config: ProjectConfig): string[] {
  const keys: string[] = [];
  if (config.db !== "none") keys.push("DATABASE_URL");
  if (config.auth === "better-auth") {
    keys.push("BETTER_AUTH_SECRET");
    keys.push("BETTER_AUTH_URL");
  }
  if (config.modules.includes("abacatepay")) keys.push("ABACATE_KEY");
  if (config.modules.includes("ararahq-sms") || config.modules.includes("ararahq-wa")) {
    keys.push("ARARA_KEY");
  }
  if (config.modules.includes("claude")) keys.push("ANTHROPIC_API_KEY");
  return keys;
}
