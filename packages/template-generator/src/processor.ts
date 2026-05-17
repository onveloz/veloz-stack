import Handlebars from "handlebars";
import type { ProjectConfig } from "@veloz-stack/types";
import { EMBEDDED_TEMPLATES } from "./templates.generated";

const hb = Handlebars.create();

/** `*.partial.hbs` files are registered here; basename (without suffix) is the partial name. */
function registerEmbeddedPartials(): void {
  for (const [relPath, src] of EMBEDDED_TEMPLATES) {
    if (!relPath.endsWith(".partial.hbs")) continue;
    const slash = relPath.lastIndexOf("/");
    const base = slash >= 0 ? relPath.slice(slash + 1) : relPath;
    const name = base.replace(/\.partial\.hbs$/, "");
    hb.registerPartial(name, src);
  }
}
registerEmbeddedPartials();

hb.registerHelper("eq", (a: unknown, b: unknown) => a === b);
hb.registerHelper("ne", (a: unknown, b: unknown) => a !== b);
hb.registerHelper("and", (...args: unknown[]) => args.slice(0, -1).every(Boolean));
hb.registerHelper("or", (...args: unknown[]) => args.slice(0, -1).some(Boolean));
hb.registerHelper("includes", (arr: unknown[] | undefined, v: unknown) =>
  Array.isArray(arr) ? arr.includes(v) : false,
);
hb.registerHelper("json", (v: unknown) => JSON.stringify(v));

export function render(template: string, config: ProjectConfig): string {
  const compiled = hb.compile(template, { noEscape: true });
  return compiled(config);
}
