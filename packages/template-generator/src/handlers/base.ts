import type { ProjectConfig } from "@veloz-stack/types";
import { version } from "../deps";
import { asPackageJson } from "../package-json";
import { packageManagerSpecifier } from "../package-manager-pins.generated";
import { processTemplatesFromPrefix } from "../template-utils";
import type { VirtualFs } from "../vfs";

/** @internal Scaffold pipeline step. */
export function processBase(vfs: VirtualFs, config: ProjectConfig): void {
  // Static + Handlebars files: tsconfig, .gitignore, README.md.hbs, .env.example.hbs
  processTemplatesFromPrefix({
    vfs,
    sourcePrefix: "base/",
    destPrefix: "",
    config,
  });

  // Root package.json is programmatic — too many moving parts for a template.
  vfs.updateJson(
    "package.json",
    (raw) => {
      const pkg = asPackageJson(raw);
      pkg.name = config.projectName;
      pkg.private = true;
      pkg.type = "module";
      pkg.workspaces = ["apps/*", "packages/*"];
      pkg.scripts ??= {};
      pkg.devDependencies = {
        ...pkg.devDependencies,
        typescript: version("typescript"),
        "@types/node": version("@types/node"),
      };
      pkg.packageManager = packageManagerSpecifier(config.pm);
      return pkg;
    },
    {},
  );
}
