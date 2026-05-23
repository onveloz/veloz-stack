import { isJsonObject } from "./package-json";

/**
 * Plain path → string map. Lightweight stand-in for memfs. Every handler
 * writes here; the final `writeTree` step materialises it to disk.
 */
export class VirtualFs {
  readonly files = new Map<string, string>();

  write(path: string, content: string): void {
    this.files.set(normalise(path), content);
  }

  exists(path: string): boolean {
    return this.files.has(normalise(path));
  }

  /** Remove a path from the VFS (e.g. superseded by a module merge). */
  remove(path: string): void {
    this.files.delete(normalise(path));
  }

  read(path: string): string | undefined {
    return this.files.get(normalise(path));
  }

  /** Merge JSON: reads → parses → mutates via fn → writes back. Creates the file if missing. */
  updateJson(
    path: string,
    fn: (data: Record<string, unknown>) => Record<string, unknown>,
    initial: Record<string, unknown> = {},
  ): void {
    const existing = this.read(path);
    const parsed: unknown =
      existing !== undefined ? JSON.parse(existing) : initial;
    if (!isJsonObject(parsed)) {
      throw new Error(`Expected JSON object at ${path}`);
    }
    const next = fn(parsed);
    if (!isJsonObject(next)) {
      throw new Error(`updateJson callback must return an object for ${path}`);
    }
    this.write(path, `${JSON.stringify(next, null, 2)}\n`);
  }

  entries(): IterableIterator<[string, string]> {
    return this.files.entries();
  }

  size(): number {
    return this.files.size;
  }
}

function normalise(p: string): string {
  return p.replace(/^\.?\//, "").replaceAll(/\/+/g, "/");
}
