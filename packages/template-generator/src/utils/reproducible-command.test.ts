import { applyImplicitStackRules, DEFAULT_CONFIG } from "@veloz-stack/types";
import { describe, expect, it } from "vitest";
import { buildReproducibleCommand } from "./reproducible-command";

describe("buildReproducibleCommand", () => {
  it("includes backend next after implicit stack rules (frontend next only)", () => {
    const coerced = applyImplicitStackRules(
      { ...DEFAULT_CONFIG, projectName: "native-next", frontend: "next" },
      { backend: false },
    );
    const cmd = buildReproducibleCommand(coerced);
    expect(cmd).toContain("--frontend next");
    expect(cmd).toContain("--backend next");
  });

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

  it("omits flags that match defaults", () => {
    const cmd = buildReproducibleCommand({
      ...DEFAULT_CONFIG,
      projectName: "plain",
    });
    expect(cmd).not.toContain("--preset");
    expect(cmd).not.toContain("--frontend");
    expect(cmd).not.toContain("--backend");
  });

  it("emits boolean addon flags when enabled", () => {
    const cmd = buildReproducibleCommand({
      ...DEFAULT_CONFIG,
      projectName: "flags",
      oxlintStrict: true,
      lefthookCi: true,
      lefthookAdvanced: true,
      addons: ["turborepo", "oxlint", "lefthook"],
    });
    expect(cmd).toContain("--oxlint-strict");
    expect(cmd).toContain("--lefthook-ci");
    expect(cmd).toContain("--lefthook-advanced");
  });

  it("joins list flags for modules, examples, and addons", () => {
    const cmd = buildReproducibleCommand({
      ...DEFAULT_CONFIG,
      projectName: "lists",
      modules: ["claude", "abacatepay"],
      examples: ["todo", "pix-checkout"],
      addons: ["biome", "husky"],
    });
    expect(cmd).toContain("--modules claude,abacatepay");
    expect(cmd).toContain("--examples todo,pix-checkout");
    expect(cmd).toContain("--addons biome,husky");
  });

  it("uses the selected package manager in the create prefix", () => {
    expect(
      buildReproducibleCommand({
        ...DEFAULT_CONFIG,
        projectName: "b",
        pm: "bun",
      }),
    ).toMatch(/^bun create veloz-stack@latest/);
    expect(
      buildReproducibleCommand({
        ...DEFAULT_CONFIG,
        projectName: "p",
        pm: "pnpm",
      }),
    ).toMatch(/^pnpm create veloz-stack@latest/);
    expect(
      buildReproducibleCommand({
        ...DEFAULT_CONFIG,
        projectName: "n",
        pm: "npm",
      }),
    ).toMatch(/^npm create veloz-stack@latest/);
  });

  it("skips empty list flags", () => {
    const cmd = buildReproducibleCommand({
      ...DEFAULT_CONFIG,
      projectName: "empty-lists",
      modules: [],
      examples: [],
      addons: [],
    });
    expect(cmd).not.toContain("--modules");
    expect(cmd).not.toContain("--examples");
    expect(cmd).not.toContain("--addons");
  });

  it("escapes shell metacharacters in project name", () => {
    const cmd = buildReproducibleCommand({
      ...DEFAULT_CONFIG,
      projectName: 'test project$(`rm -rf /`)"\\',
    });
    expect(cmd).toContain('"test project\\$(\\`rm -rf /\\`)\\"\\\\"');
  });
});
