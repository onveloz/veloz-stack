import { describe, expect, it } from "vitest";
import {
  DEFAULT_CONFIG,
  validateConfig,
  type ProjectConfig,
} from "@veloz-stack/types";
import { generate } from "../index";

function cfg(overrides: Partial<ProjectConfig>): ProjectConfig {
  return { ...DEFAULT_CONFIG, ...overrides, projectName: overrides.projectName ?? "test-app" };
}

function paths(c: ProjectConfig): string[] {
  return [...generate(c).entries()].map(([p]) => p).sort();
}

describe("generate()", () => {
  it("default stack produces the canonical monorepo layout", () => {
    const files = paths(cfg({}));

    expect(files).toContain("package.json");
    expect(files).toContain("tsconfig.json");
    expect(files).toContain(".gitignore");
    expect(files).toContain("README.md");
  });

  it("pnpm produces pnpm-workspace.yaml; bun does not", () => {
    const pnpmFiles = paths(cfg({ pm: "pnpm" }));
    const bunFiles = paths(cfg({ pm: "bun" }));

    expect(pnpmFiles).toContain("pnpm-workspace.yaml");
    expect(bunFiles).not.toContain("pnpm-workspace.yaml");
  });

  it("default stack includes server + web + api + auth + db packages", () => {
    const files = paths(cfg({}));

    expect(files).toContain("apps/server/src/index.ts");
    expect(files).toContain("apps/web/src/router.tsx");
    expect(files).toContain("packages/api/src/index.ts");
    expect(files).toContain("packages/auth/src/index.ts");
    expect(files).toContain("packages/db/src/index.ts");
    expect(files).toContain("packages/db/src/schema/auth.ts");
  });

  it("--frontend next produces App Router layout, not TanStack Start", () => {
    const files = paths(cfg({ frontend: "next" }));

    expect(files).toContain("apps/web/app/layout.tsx");
    expect(files).toContain("apps/web/app/page.tsx");
    expect(files).toContain("apps/web/app/providers.tsx");
    expect(files).toContain("apps/web/next.config.mjs");
    expect(files).not.toContain("apps/web/vite.config.ts");
    expect(files).not.toContain("apps/web/src/router.tsx");
  });

  it("--frontend none drops the web app entirely", () => {
    const files = paths(cfg({ frontend: "none" }));

    expect(files.some((p) => p.startsWith("apps/web/"))).toBe(false);
    expect(files).toContain("apps/server/src/index.ts");
  });

  it("--auth none drops the auth package AND the Drizzle auth schema", () => {
    const files = paths(cfg({ auth: "none" }));

    expect(files.some((p) => p.startsWith("packages/auth/"))).toBe(false);
    expect(files).not.toContain("packages/db/src/schema/auth.ts");
    expect(files).toContain("packages/db/src/schema/index.ts");
  });

  it("--db none --auth none drops the db package", () => {
    // Note: `db: none` with `auth: better-auth` is invalid (Better Auth's
    // drizzleAdapter needs the db package). Covered by validateConfig.
    const files = paths(
      cfg({ db: "none", orm: "none", dbHosting: "none", auth: "none" }),
    );
    expect(files.some((p) => p.startsWith("packages/db/"))).toBe(false);
  });

  it("bare project (everything 'none') still emits base + CLAUDE.md when claude module is kept", () => {
    const files = paths(
      cfg({
        frontend: "none",
        backend: "none",
        api: "none",
        db: "none",
        orm: "none",
        dbHosting: "none",
        auth: "none",
        deploy: "none",
        modules: ["claude"],
      }),
    );

    expect(files).toContain("package.json");
    expect(files).toContain("tsconfig.json");
    expect(files).toContain("CLAUDE.md");
    expect(files.some((p) => p.startsWith("apps/"))).toBe(false);
    expect(files.some((p) => p.startsWith("packages/"))).toBe(false);
  });
});

describe("deploy targets", () => {
  it("veloz emits veloz.json + Dockerfile", () => {
    const files = paths(cfg({ deploy: "veloz" }));
    expect(files).toContain("veloz.json");
    expect(files).toContain("Dockerfile");
  });

  it("fly emits fly.toml + Dockerfile", () => {
    const files = paths(cfg({ deploy: "fly" }));
    expect(files).toContain("fly.toml");
    expect(files).toContain("Dockerfile");
    expect(files).not.toContain("veloz.json");
  });

  it("vercel emits vercel.json without Dockerfile", () => {
    const files = paths(cfg({ deploy: "vercel" }));
    expect(files).toContain("vercel.json");
    expect(files).not.toContain("Dockerfile");
  });

  it("docker emits docker-compose.yml + Dockerfile", () => {
    const files = paths(cfg({ deploy: "docker" }));
    expect(files).toContain("docker-compose.yml");
    expect(files).toContain("Dockerfile");
  });

  it("render emits render.yaml + Dockerfile", () => {
    const files = paths(cfg({ deploy: "render" }));
    expect(files).toContain("render.yaml");
    expect(files).toContain("Dockerfile");
  });

  it("none emits no deploy artefacts", () => {
    const files = paths(cfg({ deploy: "none" }));
    expect(files).not.toContain("veloz.json");
    expect(files).not.toContain("fly.toml");
    expect(files).not.toContain("Dockerfile");
    expect(files).not.toContain("vercel.json");
  });
});

describe("modules", () => {
  it("abacatepay module emits SKILL.md and env vars", () => {
    const vfs = generate(cfg({ modules: ["abacatepay"] }));
    expect(vfs.read(".claude/skills/abacatepay/SKILL.md")).toContain("AbacatePay");
    expect(vfs.read(".env.example")).toContain("ABACATE_KEY");
  });

  it("claude module emits CLAUDE.md + AGENTS.md", () => {
    const vfs = generate(cfg({ modules: ["claude"] }));
    expect(vfs.read("CLAUDE.md")).toContain("Claude guide");
    expect(vfs.read("AGENTS.md")).toContain("Agent guide");
  });

  it("cpf-cnpj module emits typed SDK wrapper", () => {
    const vfs = generate(cfg({ modules: ["cpf-cnpj"] }));
    expect(vfs.read("packages/br-identity/src/cpf-cnpj.ts")).toContain("isValidCpf");
  });

  it("ararahq-sms and ararahq-wa share a single skill folder", () => {
    const both = generate(cfg({ modules: ["ararahq-sms", "ararahq-wa"] }));
    const onlySms = generate(cfg({ modules: ["ararahq-sms"] }));

    expect(both.read(".claude/skills/ararahq/SKILL.md")).toBeDefined();
    // File count should be identical — no double-copy.
    expect(both.size()).toBe(onlySms.size());
  });
});

describe("validateConfig", () => {
  it("rejects better-auth + db:none", () => {
    const errs = validateConfig(cfg({ db: "none", orm: "none", dbHosting: "none" }));
    expect(errs.some((e) => e.includes("Better Auth needs a database"))).toBe(true);
  });

  it("rejects workers runtime + non-hono backend", () => {
    const errs = validateConfig(cfg({ runtime: "workers", backend: "express" }));
    expect(errs.length).toBeGreaterThan(0);
  });

  it("accepts the default config", () => {
    expect(validateConfig(cfg({}))).toEqual([]);
  });
});

describe("package.json mutations", () => {
  it("apps/server gets workspace deps on api + auth when enabled", () => {
    const vfs = generate(cfg({}));
    const pkg = JSON.parse(vfs.read("apps/server/package.json")!);
    expect(pkg.dependencies["@test-app/api"]).toBe("workspace:*");
    expect(pkg.dependencies["@test-app/auth"]).toBe("workspace:*");
    expect(pkg.dependencies["@orpc/server"]).toBeDefined();
  });

  it("apps/server drops auth dep when auth is none", () => {
    const vfs = generate(cfg({ auth: "none" }));
    const pkg = JSON.parse(vfs.read("apps/server/package.json")!);
    expect(pkg.dependencies["@test-app/auth"]).toBeUndefined();
    expect(pkg.dependencies["@test-app/api"]).toBe("workspace:*");
  });
});
