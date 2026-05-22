import type { ProjectConfig } from "@veloz-stack/types";
import { version } from "../deps";
import { packageManagerSpecifier } from "../package-manager-pins.generated";
import { processTemplatesFromPrefix } from "../template-utils";
import type { VirtualFs } from "../vfs";

export function processBase(vfs: VirtualFs, config: ProjectConfig): void {
  // Static + Handlebars files: tsconfig, .gitignore, README.md.hbs, .env.example.hbs
  processTemplatesFromPrefix(vfs, "base/", "", config);

  // Root package.json is programmatic — too many moving parts for a template.
  vfs.updateJson<Record<string, unknown>>(
    "package.json",
    (p) => ({
      ...p,
      name: config.projectName,
      private: true,
      type: "module",
      workspaces: ["apps/*", "packages/*"],
      scripts: p.scripts ?? {},
      devDependencies: {
        ...(p.devDependencies ?? {}),
        typescript: version("typescript"),
        "@types/node": version("@types/node"),
      },
      packageManager: packageManagerSpecifier(config.pm),
    }),
    {},
  );
}
