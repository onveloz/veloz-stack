import { describe, expect, it } from "vitest";
import { DEFAULT_CONFIG } from "@veloz-stack/types";
import { resolveConfig } from "./resolve-config";

describe("resolveConfig", () => {
  it("switches backend to next and runtime to node when frontend becomes next", () => {
    const cfg = { ...DEFAULT_CONFIG, frontend: "tanstack-start" as const, backend: "hono" as const };
    const { newCfg, changes } = resolveConfig(cfg, { key: "frontend", value: "next" });
    expect(newCfg.frontend).toBe("next");
    expect(newCfg.backend).toBe("next");
    expect(newCfg.runtime).toBe("node");
    expect(changes.some((c) => c.key === "backend" && c.to === "next")).toBe(true);
    expect(changes.some((c) => c.key === "runtime" && c.to === "node")).toBe(true);
  });

  it("reverts backend and runtime when leaving next frontend", () => {
    const cfg = {
      ...DEFAULT_CONFIG,
      frontend: "next" as const,
      backend: "next" as const,
      runtime: "node" as const,
    };
    const { newCfg, changes } = resolveConfig(cfg, {
      key: "frontend",
      value: "tanstack-start",
    });
    expect(newCfg.frontend).toBe("tanstack-start");
    expect(newCfg.backend).toBe("hono");
    expect(newCfg.runtime).toBe("bun");
    expect(changes.some((c) => c.key === "backend" && c.to === "hono")).toBe(true);
    expect(changes.some((c) => c.key === "runtime" && c.to === "bun")).toBe(true);
  });
});
