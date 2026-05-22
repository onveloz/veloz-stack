import type { ProjectConfig } from "@veloz-stack/types";
import { version } from "../deps";
import { processTemplatesFromPrefix } from "../template-utils";
import type { VirtualFs } from "../vfs";

const API_SMOKE_TEST = `import { expect, test } from "vitest";
import { appRouter } from "./routers";

test("API router is defined", () => {
  expect(appRouter).toBeDefined();
  expect(typeof appRouter).toBe("object");
  expect(appRouter.healthCheck).toBeDefined();
});
`;

/**
 * Unit (Vitest) + browser (Playwright) testing scaffold for every project.
 * Vitest runs from the repo root; Playwright is added when a web frontend exists.
 */
export function processTesting(vfs: VirtualFs, config: ProjectConfig): void {
  processTemplatesFromPrefix(vfs, "testing/", "", config);

  if (config.frontend === "none") {
    vfs.remove("playwright.config.ts");
    vfs.remove("e2e/smoke.spec.ts");
  }

  if (config.api !== "none" && vfs.exists("packages/api/package.json")) {
    vfs.write("packages/api/src/smoke.test.ts", API_SMOKE_TEST);
    vfs.updateJson<Record<string, any>>("packages/api/package.json", (pkg) => {
      pkg.scripts = { ...(pkg.scripts ?? {}), test: "vitest run" };
      pkg.devDependencies = {
        ...(pkg.devDependencies ?? {}),
        vitest: version("vitest"),
      };
      return pkg;
    });
  }

  vfs.updateJson<Record<string, any>>("package.json", (pkg) => {
    pkg.devDependencies = {
      ...(pkg.devDependencies ?? {}),
      vitest: version("vitest"),
      ...(config.frontend !== "none" ? { "@playwright/test": version("@playwright/test") } : {}),
    };
    return pkg;
  });
}
