import type { ProjectConfig } from "@veloz-stack/types";
import { generate, type GenerateOptions } from "./index";
import { writeTree } from "./writer";

export { writeTree };

/**
 * Node-only entry. Generates the VFS, materialises it to disk.
 * The CLI consumes this; the web picker uses the browser-safe `generate`
 * from the package root.
 */
export async function scaffold(
  config: ProjectConfig,
  targetDir: string,
  options?: GenerateOptions,
): Promise<{ fileCount: number }> {
  const vfs = generate(config, options);
  const fileCount = await writeTree(vfs, targetDir);
  return { fileCount };
}
