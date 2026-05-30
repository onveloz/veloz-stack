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
  const entries = [...vfs.entries()] as [string, string][];
  const root = resolve(rootDir);

  async function writeBatch(batch: [string, string][]): Promise<void> {
    await Promise.all(
      batch.map(async ([path, content]) => {
        const abs = resolve(root, path);
        assertPathInsideRoot(root, abs);
        await mkdir(dirname(abs), { recursive: true });
        await writeFile(abs, content, "utf8");
      }),
    );
  }

  async function writeFromOffset(offset: number): Promise<void> {
    if (offset >= entries.length) {
      return;
    }
    const batch = entries.slice(offset, offset + WRITE_CONCURRENCY);
    await writeBatch(batch);
    await writeFromOffset(offset + WRITE_CONCURRENCY);
  }

  await writeFromOffset(0);
  return entries.length;
}
