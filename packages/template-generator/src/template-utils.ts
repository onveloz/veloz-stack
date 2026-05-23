import type { ProjectConfig } from "@veloz-stack/types";
import { render } from "./processor";
import { EMBEDDED_TEMPLATES } from "./templates.generated";
import type { VirtualFs } from "./vfs";

/** @internal Generated-app type. */
export interface ProcessTemplatesArgs {
  vfs: VirtualFs;
  sourcePrefix: string;
  destPrefix: string;
  config: ProjectConfig;
}

/**
 * Copy every file matching `sourcePrefix` from the embedded template map
 * into `destPrefix` in the VFS. `.hbs` files are compiled via Handlebars
 * against `config`; everything else is copied verbatim.
 *
 * Matches BTS's `processTemplatesFromPrefix` pattern.
 */
export function processTemplatesFromPrefix({
  vfs,
  sourcePrefix,
  destPrefix,
  config,
}: ProcessTemplatesArgs): number {
  let count = 0;
  for (const [srcPath, content] of EMBEDDED_TEMPLATES) {
    if (!srcPath.startsWith(sourcePrefix)) {
      continue;
    }
    const rel = srcPath.slice(sourcePrefix.length);
    if (rel.endsWith(".partial.hbs")) {
      continue;
    }
    const isTemplate = rel.endsWith(".hbs");
    const outPath = destPrefix + (isTemplate ? rel.slice(0, -4) : rel);
    const body = isTemplate ? render(content, config) : content;
    vfs.write(outPath, body);
    count++;
  }
  return count;
}
