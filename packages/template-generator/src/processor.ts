import Handlebars from "handlebars";
import type { ProjectConfig } from "@veloz-stack/types";

const hb = Handlebars.create();

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
