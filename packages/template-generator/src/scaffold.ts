import type { ProjectConfig } from "@veloz-stack/types";
import { generate } from "./index";
import { writeTree } from "./writer";

export { writeTree };

/**
 * Node-only entry. Generates the VFS, materialises it to disk.
 * The CLI consumes this; the web picker uses the browser-safe `generate`
 * from the package root.
 */
/** Node-only: builds the virtual file tree and writes it to `targetDir`. */
export async function scaffold(
  config: ProjectConfig,
  targetDir: string,
  options?: Parameters<typeof generate>[1],
): Promise<{ fileCount: number }> {
  const vfs = generate(config, options);
  const fileCount = await writeTree(vfs, targetDir);
  return { fileCount };
}
