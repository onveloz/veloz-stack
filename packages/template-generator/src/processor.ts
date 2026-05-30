import type { ProjectConfig } from "@veloz-stack/types";
import Handlebars from "handlebars";
import { DEPENDENCY_VERSIONS } from "./deps";
import { EMBEDDED_TEMPLATES } from "./templates.generated";

const hb = Handlebars.create();

/** `*.partial.hbs` files are registered here; basename (without suffix) is the partial name. */
function registerEmbeddedPartials(): void {
  for (const [relPath, src] of EMBEDDED_TEMPLATES) {
    if (!relPath.endsWith(".partial.hbs")) {
      continue;
    }
    const slash = relPath.lastIndexOf("/");
    const base = slash !== -1 ? relPath.slice(slash + 1) : relPath;
    const name = base.replace(/\.partial\.hbs$/, "");
    hb.registerPartial(name, src);
  }
}
registerEmbeddedPartials();

hb.registerHelper("eq", (a: unknown, b: unknown) => a === b);
hb.registerHelper("ne", (a: unknown, b: unknown) => a !== b);
hb.registerHelper("and", (...args: unknown[]) =>
  args.slice(0, -1).every(Boolean),
);
hb.registerHelper("or", (...args: unknown[]) =>
  args.slice(0, -1).some(Boolean),
);
hb.registerHelper("includes", (arr: unknown[] | undefined, v: unknown) =>
  Array.isArray(arr) ? arr.includes(v) : false,
);
hb.registerHelper("json", (v: unknown) => JSON.stringify(v));
hb.registerHelper("pmRun", (script: unknown, pm: unknown) => {
  const cmd = String(script);
  const p = String(pm);
  if (p === "pnpm") {
    return `pnpm run ${cmd}`;
  }
  if (p === "bun") {
    return `bun run ${cmd}`;
  }
  return `npm run ${cmd}`;
});
hb.registerHelper("pmExec", (command: unknown, pm: unknown) => {
  const cmd = String(command);
  const p = String(pm);
  if (p === "pnpm") {
    return `pnpm exec ${cmd}`;
  }
  if (p === "bun") {
    return `bunx ${cmd}`;
  }
  return `npx ${cmd}`;
});
function isDependencyName(
  key: string,
): key is keyof typeof DEPENDENCY_VERSIONS {
  return Object.hasOwn(DEPENDENCY_VERSIONS, key);
}

hb.registerHelper("version", (name: unknown) => {
  const key = String(name);
  if (!isDependencyName(key)) {
    throw new Error(
      `Dependency "${key}" not in central version map. Add it to versions.yaml.`,
    );
  }
  return DEPENDENCY_VERSIONS[key];
});
hb.registerHelper("serverUrl", (backend: unknown) =>
  backend === "next" ? "http://localhost:3001" : "http://localhost:3000",
);

/** @internal Scaffold pipeline step. */
export function render(template: string, config: ProjectConfig): string {
  const compiled = hb.compile(template, { noEscape: true });
  return compiled(config);
}
