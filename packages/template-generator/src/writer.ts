import { mkdir, writeFile } from "node:fs/promises";
import { dirname, isAbsolute, relative, resolve } from "node:path";
import type { VirtualFs } from "./vfs";

const WRITE_CONCURRENCY = 16;

function assertPathInsideRoot(rootDir: string, absPath: string): void {
  const rel = relative(rootDir, absPath);
  if (rel === "" || (!rel.startsWith("..") && !isAbsolute(rel))) {
    return;
  }
  throw new Error(
    `Refusing to write outside scaffold root: ${relative(rootDir, absPath)}`,
  );
}

/** Writes every entry in the VFS to `rootDir`, creating parents as needed. */
export async function writeTree(
  vfs: VirtualFs,
  rootDir: string,
): Promise<number> {
  const entries = [...vfs.entries()];
  const root = resolve(rootDir);

  const batches: [string, string][][] = [];
  for (let i = 0; i < entries.length; i += WRITE_CONCURRENCY) {
    batches.push(entries.slice(i, i + WRITE_CONCURRENCY));
  }

  await Promise.all(
    batches.map((batch) =>
      Promise.all(
        batch.map(async ([path, content]) => {
          const abs = resolve(root, path);
          assertPathInsideRoot(root, abs);
          await mkdir(dirname(abs), { recursive: true });
          await writeFile(abs, content, "utf8");
        }),
      ),
    ),
  );
  return entries.length;
}
