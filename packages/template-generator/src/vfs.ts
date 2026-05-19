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
  updateJson<T>(path: string, fn: (data: T) => T, initial?: T): void {
    const existing = this.read(path);
    let data: T = existing ? (JSON.parse(existing) as T) : (initial ?? ({} as T));
    data = fn(data);
    this.write(path, JSON.stringify(data, null, 2) + "\n");
  }

  entries(): IterableIterator<[string, string]> {
    return this.files.entries();
  }

  size(): number {
    return this.files.size;
  }
}

function normalise(p: string): string {
  return p.replace(/^\.?\//, "").replace(/\/+/g, "/");
}
