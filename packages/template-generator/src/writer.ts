import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import type { VirtualFs } from "./vfs";

/** Writes every entry in the VFS to `rootDir`, creating parents as needed. */
export async function writeTree(
  vfs: VirtualFs,
  rootDir: string,
): Promise<number> {
  const entries = [...vfs.entries()];
  await Promise.all(
    entries.map(async ([path, content]) => {
      const abs = join(rootDir, path);
      await mkdir(dirname(abs), { recursive: true });
      await writeFile(abs, content, "utf8");
    }),
  );
  return entries.length;
}
