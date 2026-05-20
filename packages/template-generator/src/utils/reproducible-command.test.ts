import { describe, expect, it } from "vitest";
import { DEFAULT_CONFIG } from "@veloz-stack/types";
import { buildReproducibleCommand } from "./reproducible-command";

describe("buildReproducibleCommand", () => {
  it("includes project name and non-default flags", () => {
    const cmd = buildReproducibleCommand({
      ...DEFAULT_CONFIG,
      projectName: "pix-shop",
      frontend: "next",
      preset: "custom",
    });
    expect(cmd).toContain("pix-shop");
    expect(cmd).toContain("--frontend next");
    expect(cmd).toContain("--yes");
  });
});
