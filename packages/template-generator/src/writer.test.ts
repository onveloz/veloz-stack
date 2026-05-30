import { mkdtemp, readFile, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { describe, expect, it } from "vitest";
import { VirtualFs } from "./vfs";
import { writeTree } from "./writer";

describe("writeTree", () => {
  it("writes files under the target root", async () => {
    const root = await mkdtemp(join(tmpdir(), "veloz-writer-"));
    try {
      const vfs = new VirtualFs();
      vfs.write("apps/web/package.json", '{"name":"web"}\n');
      const count = await writeTree(vfs, root);
      expect(count).toBe(1);
      const body = await readFile(join(root, "apps/web/package.json"), "utf8");
      expect(body).toContain('"name":"web"');
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  it("refuses path traversal outside the scaffold root", async () => {
    const root = await mkdtemp(join(tmpdir(), "veloz-writer-"));
    try {
      const vfs = new VirtualFs();
      vfs.write("../escape.txt", "nope");
      await expect(writeTree(vfs, root)).rejects.toThrow(
        /outside scaffold root/,
      );
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });
});
