import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import type { VirtualFs } from "./vfs.js";

/** Writes every entry in the VFS to `rootDir`, creating parents as needed. */
export async function writeTree(vfs: VirtualFs, rootDir: string): Promise<number> {
  let count = 0;
  for (const [path, content] of vfs.entries()) {
    const abs = join(rootDir, path);
    await mkdir(dirname(abs), { recursive: true });
    await writeFile(abs, content, "utf8");
    count++;
  }
  return count;
}
