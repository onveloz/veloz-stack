import { execFileSync } from "node:child_process";
import { mkdtempSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { ProjectConfig } from "./stack-types.js";
import { initGitRepo, installDependencies } from "./post-scaffold.js";

vi.mock("node:child_process", () => ({
  execFileSync: vi.fn(),
}));

const execMock = vi.mocked(execFileSync);

const baseConfig = {
  projectName: "demo",
  frontend: "tanstack-start",
  mobile: "none",
  desktop: "none",
  backend: "hono",
  runtime: "bun",
  api: "orpc",
  db: "postgres",
  orm: "drizzle",
  dbHosting: "veloz",
  auth: "better-auth",
  deploy: "veloz",
  pm: "bun",
  ui: "shadcn",
  examples: [],
  modules: [],
  addons: [],
  oxlintStrict: false,
  lefthookCi: false,
  lefthookAdvanced: false,
  git: true,
  install: true,
  preset: "veloz-br",
} satisfies ProjectConfig;

afterEach(() => {
  execMock.mockReset();
});

describe("initGitRepo", () => {
  it("runs git init", () => {
    const dir = mkdtempSync(join(tmpdir(), "veloz-git-"));
    initGitRepo(dir);
    expect(execMock).toHaveBeenCalledWith(
      "git",
      ["init"],
      expect.objectContaining({ cwd: dir }),
    );
  });

  it("does not throw when git init fails", () => {
    execMock.mockImplementation(() => {
      throw new Error("git missing");
    });
    expect(() => {
      initGitRepo("/tmp/x");
    }).not.toThrow();
  });
});

describe("installDependencies", () => {
  it("no-ops when config.install is false", () => {
    const dir = mkdtempSync(join(tmpdir(), "veloz-install-skip-"));
    installDependencies(dir, { ...baseConfig, install: false });
    expect(execMock).not.toHaveBeenCalled();
  });

  it("runs bun install when pm is bun", () => {
    const dir = mkdtempSync(join(tmpdir(), "veloz-install-"));
    writeFileSync(join(dir, ".env.example"), "FOO=1\n");
    execMock.mockImplementation(() => Buffer.from(""));
    installDependencies(dir, baseConfig);
    expect(execMock).toHaveBeenCalledWith(
      "bun",
      ["install"],
      expect.objectContaining({ cwd: dir, stdio: "inherit" }),
    );
  });

  it("warns but does not throw when install fails", () => {
    const dir = mkdtempSync(join(tmpdir(), "veloz-install-fail-"));
    execMock.mockImplementation((_cmd, args) => {
      if (Array.isArray(args) && args[0] === "install") {
        throw new Error("network");
      }
      return Buffer.from("");
    });
    expect(() => {
      installDependencies(dir, baseConfig);
    }).not.toThrow();
  });
});
