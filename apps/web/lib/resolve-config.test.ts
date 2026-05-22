import { DEFAULT_CONFIG, type ModuleId } from "@veloz-stack/types";
import { describe, expect, it } from "vitest";
import { resolveConfig } from "./resolve-config";

describe("resolveConfig", () => {
  it("switches backend to next but keeps runtime when frontend becomes next", () => {
    const cfg = {
      ...DEFAULT_CONFIG,
      frontend: "tanstack-start" as const,
      backend: "hono" as const,
    };
    const { newCfg, changes } = resolveConfig(cfg, { key: "frontend", value: "next" });
    expect(newCfg.frontend).toBe("next");
    expect(newCfg.backend).toBe("next");
    expect(newCfg.runtime).toBe("bun");
    expect(changes[0]?.key).toBe("frontend");
    expect(changes[0]?.from).toBe("tanstack-start");
    expect(changes[0]?.to).toBe("next");
    expect(changes.some((c) => c.key === "backend" && c.to === "next")).toBe(true);
    expect(changes.some((c) => c.key === "runtime")).toBe(false);
  });

  it("switches express to route handlers when frontend becomes next", () => {
    const cfg = {
      ...DEFAULT_CONFIG,
      frontend: "tanstack-start" as const,
      backend: "express" as const,
      runtime: "node" as const,
      api: "rest" as const,
      db: "mongodb" as const,
      orm: "mongoose" as const,
    };
    const { newCfg, changes } = resolveConfig(cfg, { key: "frontend", value: "next" });
    expect(newCfg.backend).toBe("next");
    expect(changes[0]?.key).toBe("frontend");
    expect(changes[0]?.from).toBe("tanstack-start");
    expect(changes[0]?.to).toBe("next");
    const backendChange = changes.find((c) => c.key === "backend" && c.to === "next");
    expect(backendChange?.from).toBe("express");
  });

  it("allows bun runtime with next frontend and backend", () => {
    const cfg = {
      ...DEFAULT_CONFIG,
      frontend: "next" as const,
      backend: "next" as const,
      runtime: "node" as const,
    };
    const { newCfg, changes } = resolveConfig(cfg, { key: "runtime", value: "bun" });
    expect(newCfg.runtime).toBe("bun");
    expect(changes[0]?.key).toBe("runtime");
    expect(changes.filter((c) => c.key === "runtime")).toHaveLength(1);
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
    expect(changes[0]?.key).toBe("frontend");
    expect(changes[0]?.from).toBe("next");
    expect(changes[0]?.to).toBe("tanstack-start");
    expect(changes.some((c) => c.key === "backend" && c.to === "hono")).toBe(true);
    expect(changes.some((c) => c.key === "runtime" && c.to === "bun")).toBe(true);
  });

  it("uses the proposed stack (not the old config) for dropped-module reasons", () => {
    const cfg = {
      ...DEFAULT_CONFIG,
      frontend: "next" as const,
      backend: "next" as const,
      modules: ["next-intl"] satisfies ModuleId[],
    };
    const { newCfg, changes } = resolveConfig(cfg, {
      key: "frontend",
      value: "tanstack-start",
    });
    expect(newCfg.modules).toEqual([]);
    const drop = changes.find((c) => c.key === "modules" && c.from === "next-intl");
    expect(drop?.to).toBeNull();
    expect(drop?.reason).toBe("next-intl funciona só com frontend Next.js");
  });
});
