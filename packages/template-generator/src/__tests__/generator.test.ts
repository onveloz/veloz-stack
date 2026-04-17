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

  it("--frontend nuxt produces a Nuxt project", () => {
    const files = paths(cfg({ frontend: "nuxt" }));
    expect(files).toContain("apps/web/nuxt.config.ts");
    expect(files).toContain("apps/web/app.vue");
    expect(files).toContain("apps/web/composables/useOrpc.ts");
    expect(files).not.toContain("apps/web/next.config.mjs");
  });

  it("--frontend svelte-kit produces a SvelteKit project", () => {
    const files = paths(cfg({ frontend: "svelte-kit" }));
    expect(files).toContain("apps/web/svelte.config.js");
    expect(files).toContain("apps/web/src/routes/+page.svelte");
    expect(files).toContain("apps/web/src/routes/+layout.svelte");
    expect(files).toContain("apps/web/src/lib/orpc.ts");
  });

  it("--frontend astro produces an Astro project with SSR adapter", () => {
    const files = paths(cfg({ frontend: "astro" }));
    expect(files).toContain("apps/web/astro.config.mjs");
    expect(files).toContain("apps/web/src/pages/index.astro");
    expect(files).toContain("apps/web/src/layouts/Layout.astro");
    expect(files).not.toContain("apps/web/vite.config.ts");
    expect(files).not.toContain("apps/web/next.config.mjs");
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
    // Claude module ships its own @proj/claude SDK package; nothing else.
    expect(files.some((p) => p.startsWith("packages/"))).toBe(true);
    expect(files).toContain("packages/claude/src/index.ts");
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

  it("cloudflare emits wrangler.toml + workers hono entry", () => {
    const vfs = generate(cfg({ deploy: "cloudflare", runtime: "workers" }));
    expect(vfs.read("wrangler.toml")).toContain("compatibility_date");
    expect(vfs.read("wrangler.toml")).toContain("nodejs_compat");
    expect(vfs.read("apps/server/src/index.ts")).toContain("export default app");
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
  it("abacatepay module emits SKILL.md, typed SDK wrapper, webhook helper, and env vars", () => {
    const vfs = generate(cfg({ modules: ["abacatepay"] }));
    expect(vfs.read(".claude/skills/abacatepay/SKILL.md")).toContain("AbacatePay");
    expect(vfs.read("packages/abacatepay/src/index.ts")).toContain("createPixCharge");
    expect(vfs.read("packages/abacatepay/src/webhook.ts")).toContain(
      "verifyAbacatePayWebhook",
    );
    expect(vfs.read(".env.example")).toContain("ABACATE_KEY");
  });

  it("claude module emits CLAUDE.md + AGENTS.md", () => {
    const vfs = generate(cfg({ modules: ["claude"] }));
    expect(vfs.read("CLAUDE.md")).toContain("Guia do Claude");
    expect(vfs.read("AGENTS.md")).toContain("Guia pra agentes");
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

describe("addons", () => {
  it("turborepo addon emits turbo.json and scripts → `turbo run …`", () => {
    const vfs = generate(cfg({ addons: ["turborepo"] }));
    expect(vfs.read("turbo.json")).toContain("turbo.build/schema.json");
    const pkg = JSON.parse(vfs.read("package.json")!);
    expect(pkg.scripts.dev).toBe("turbo run dev");
    expect(pkg.devDependencies.turbo).toBeDefined();
  });

  it("biome addon emits biome.json + format/lint scripts", () => {
    const vfs = generate(cfg({ addons: ["biome"] }));
    expect(vfs.read("biome.json")).toContain("biomejs.dev/schemas");
    const pkg = JSON.parse(vfs.read("package.json")!);
    expect(pkg.scripts.format).toBe("biome format --write .");
    expect(pkg.scripts.lint).toBe("biome lint .");
    expect(pkg.devDependencies["@biomejs/biome"]).toBeDefined();
  });

  it("no turborepo → scripts use package-manager filter, not turbo", () => {
    const vfs = generate(cfg({ addons: [], pm: "pnpm" }));
    const pkg = JSON.parse(vfs.read("package.json")!);
    expect(pkg.scripts.dev).toBe("pnpm -r --parallel dev");
    expect(pkg.devDependencies.turbo).toBeUndefined();
  });

  it("husky addon adds pre-commit hook + prepare script + lint-staged", () => {
    const vfs = generate(cfg({ addons: ["husky", "biome"] }));
    expect(vfs.read(".husky/pre-commit")).toContain("lint-staged");
    const pkg = JSON.parse(vfs.read("package.json")!);
    expect(pkg.scripts.prepare).toBe("husky");
    expect(pkg.devDependencies.husky).toBeDefined();
    expect(pkg.devDependencies["lint-staged"]).toBeDefined();
    expect(pkg["lint-staged"]).toEqual({
      "*.{js,jsx,ts,tsx,json,md}": ["biome check --write --no-errors-on-unmatched"],
    });
  });

  it("both addons: turbo scripts + biome commands coexist", () => {
    const vfs = generate(cfg({ addons: ["turborepo", "biome"] }));
    const pkg = JSON.parse(vfs.read("package.json")!);
    expect(pkg.scripts.dev).toBe("turbo run dev");
    expect(pkg.scripts.format).toBe("biome format --write .");
    expect(pkg.devDependencies.turbo).toBeDefined();
    expect(pkg.devDependencies["@biomejs/biome"]).toBeDefined();
  });
});

describe("examples: pix-checkout", () => {
  it("emits a checkout router when abacatepay module is picked", () => {
    const vfs = generate(
      cfg({ examples: ["pix-checkout"], modules: ["abacatepay"] }),
    );
    expect(vfs.read("packages/api/src/routers/checkout.ts")).toContain("createPixCharge");
    expect(vfs.read("packages/api/src/routers/index.ts")).toContain("checkoutRouter");
    expect(vfs.read("packages/api/src/routers/index.ts")).toContain(
      "checkout: checkoutRouter",
    );
  });

  it("silently skips when abacatepay module is not picked", () => {
    const vfs = generate(cfg({ examples: ["pix-checkout"], modules: [] }));
    expect(vfs.read("packages/api/src/routers/checkout.ts")).toBeUndefined();
    expect(vfs.read("packages/api/src/routers/index.ts")).not.toContain("checkoutRouter");
  });
});

describe("examples: todo", () => {
  it("picking todo emits router + schema + wires into index", () => {
    const vfs = generate(cfg({ examples: ["todo"] }));
    expect(vfs.read("packages/api/src/routers/todo.ts")).toContain("todoRouter");
    expect(vfs.read("packages/db/src/schema/todo.ts")).toContain("pgTable");
    expect(vfs.read("packages/api/src/routers/index.ts")).toContain("todoRouter");
    expect(vfs.read("packages/api/src/routers/index.ts")).toContain("todo: todoRouter");
    expect(vfs.read("packages/db/src/schema/index.ts")).toContain('export * from "./todo"');
  });

  it("no todo example → router + schema don't include it", () => {
    const vfs = generate(cfg({ examples: [] }));
    expect(vfs.read("packages/api/src/routers/todo.ts")).toBeUndefined();
    expect(vfs.read("packages/api/src/routers/index.ts")).not.toContain("todoRouter");
    expect(vfs.read("packages/db/src/schema/index.ts")).not.toContain("./todo");
  });

  it("todo with better-auth uses protectedProcedure", () => {
    const vfs = generate(cfg({ examples: ["todo"] }));
    expect(vfs.read("packages/api/src/routers/todo.ts")).toContain("protectedProcedure");
  });

  it("todo with no auth falls back to publicProcedure", () => {
    const vfs = generate(cfg({ examples: ["todo"], auth: "none" }));
    const src = vfs.read("packages/api/src/routers/todo.ts")!;
    expect(src).toContain("publicProcedure");
    expect(src).not.toContain("protectedProcedure");
  });
});

describe("Prisma", () => {
  it("--orm prisma emits schema.prisma + PrismaClient export instead of Drizzle files", () => {
    const vfs = generate(cfg({ orm: "prisma" }));
    expect(vfs.read("packages/db/prisma/schema.prisma")).toContain("generator client");
    expect(vfs.read("packages/db/prisma/schema.prisma")).toContain("postgresql");
    expect(vfs.read("packages/db/src/index.ts")).toContain("PrismaClient");
    // Drizzle artefacts must NOT ship
    expect(vfs.read("packages/db/drizzle.config.ts")).toBeUndefined();
    expect(vfs.read("packages/db/src/schema/auth.ts")).toBeUndefined();
  });

  it("--orm prisma + better-auth drops auth.prisma into packages/db/prisma", () => {
    const vfs = generate(cfg({ orm: "prisma" }));
    const auth = vfs.read("packages/db/prisma/auth.prisma");
    expect(auth).toContain("model User");
    expect(auth).toContain("model Session");
  });

  it("--orm prisma auth package uses prismaAdapter, not drizzleAdapter", () => {
    const vfs = generate(cfg({ orm: "prisma" }));
    const authSrc = vfs.read("packages/auth/src/index.ts")!;
    expect(authSrc).toContain("prismaAdapter");
    expect(authSrc).not.toContain("drizzleAdapter");
    expect(authSrc).toContain('provider: "postgresql"');
  });

  it("--orm drizzle auth package uses drizzleAdapter", () => {
    const vfs = generate(cfg({ orm: "drizzle" }));
    const authSrc = vfs.read("packages/auth/src/index.ts")!;
    expect(authSrc).toContain("drizzleAdapter");
    expect(authSrc).not.toContain("prismaAdapter");
    expect(authSrc).toContain('provider: "pg"');
  });

  it("prisma package.json ships postinstall: prisma generate", () => {
    const vfs = generate(cfg({ orm: "prisma" }));
    const pkg = JSON.parse(vfs.read("packages/db/package.json")!);
    expect(pkg.scripts.postinstall).toBe("prisma generate");
    expect(pkg.dependencies["@prisma/client"]).toBeDefined();
  });
});

describe("validateConfig", () => {
  it("rejects better-auth + db:none", () => {
    const errs = validateConfig(cfg({ db: "none", orm: "none", dbHosting: "none" }));
    expect(errs.some((e) => e.includes("Better Auth precisa de um banco"))).toBe(true);
  });

  it("rejects workers runtime + non-hono backend", () => {
    const errs = validateConfig(cfg({ runtime: "workers", backend: "express" }));
    expect(errs.length).toBeGreaterThan(0);
  });

  it("accepts the default config", () => {
    expect(validateConfig(cfg({}))).toEqual([]);
  });
});

describe("module workspace wiring", () => {
  it("abacatepay module wires @proj/abacatepay into apps/server", () => {
    const vfs = generate(cfg({ modules: ["abacatepay"] }));
    const pkg = JSON.parse(vfs.read("apps/server/package.json")!);
    expect(pkg.dependencies["@test-app/abacatepay"]).toBe("workspace:*");
  });

  it("ararahq-sms + ararahq-wa wire @proj/ararahq exactly once", () => {
    const both = generate(cfg({ modules: ["ararahq-sms", "ararahq-wa"] }));
    const pkg = JSON.parse(both.read("apps/server/package.json")!);
    expect(pkg.dependencies["@test-app/ararahq"]).toBe("workspace:*");
  });

  it("resend wires @proj/email into apps/server", () => {
    const vfs = generate(cfg({ modules: ["resend"] }));
    const pkg = JSON.parse(vfs.read("apps/server/package.json")!);
    expect(pkg.dependencies["@test-app/email"]).toBe("workspace:*");
  });

  it("asaas module ships fetch-based client + shared-token webhook verifier", () => {
    const vfs = generate(cfg({ modules: ["asaas"] }));
    expect(vfs.read("packages/asaas/src/index.ts")).toContain("createPayment");
    expect(vfs.read("packages/asaas/src/webhook.ts")).toContain("verifyAsaasWebhook");
    const pkg = JSON.parse(vfs.read("apps/server/package.json")!);
    expect(pkg.dependencies["@test-app/asaas"]).toBe("workspace:*");
  });

  it("stripe-br module ships typed client + webhook constructor", () => {
    const vfs = generate(cfg({ modules: ["stripe-br"] }));
    expect(vfs.read("packages/stripe/src/index.ts")).toContain("createBrPaymentIntent");
    expect(vfs.read("packages/stripe/src/webhook.ts")).toContain("constructEvent");
    const pkg = JSON.parse(vfs.read("apps/server/package.json")!);
    expect(pkg.dependencies["@test-app/stripe"]).toBe("workspace:*");
  });

  it("mercadopago module ships a typed client + HMAC webhook verifier", () => {
    const vfs = generate(cfg({ modules: ["mercadopago"] }));
    expect(vfs.read("packages/mercadopago/src/index.ts")).toContain("createPixPayment");
    expect(vfs.read("packages/mercadopago/src/webhook.ts")).toContain(
      "verifyMercadoPagoWebhook",
    );
    const pkg = JSON.parse(vfs.read("apps/server/package.json")!);
    expect(pkg.dependencies["@test-app/mercadopago"]).toBe("workspace:*");
  });

  it("pagarme module ships fetch-based v5 client + Basic-auth webhook verifier", () => {
    const vfs = generate(cfg({ modules: ["pagarme"] }));
    expect(vfs.read("packages/pagarme/src/index.ts")).toContain("createPixOrder");
    expect(vfs.read("packages/pagarme/src/webhook.ts")).toContain("verifyPagarmeWebhook");
    const pkg = JSON.parse(vfs.read("apps/server/package.json")!);
    expect(pkg.dependencies["@test-app/pagarme"]).toBe("workspace:*");
  });

  it("posthog module ships @proj/analytics with shutdownPosthog helper", () => {
    const vfs = generate(cfg({ modules: ["posthog"] }));
    expect(vfs.read("packages/analytics/src/index.ts")).toContain("shutdownPosthog");
    const pkg = JSON.parse(vfs.read("apps/server/package.json")!);
    expect(pkg.dependencies["@test-app/analytics"]).toBe("workspace:*");
  });

  it("sentry module ships @proj/errors with initSentry helper", () => {
    const vfs = generate(cfg({ modules: ["sentry"] }));
    expect(vfs.read("packages/errors/src/index.ts")).toContain("initSentry");
    const pkg = JSON.parse(vfs.read("apps/server/package.json")!);
    expect(pkg.dependencies["@test-app/errors"]).toBe("workspace:*");
  });

  it("pt-br-i18n wires @proj/i18n into apps/web, not apps/server", () => {
    const vfs = generate(cfg({ modules: ["pt-br-i18n"] }));
    const web = JSON.parse(vfs.read("apps/web/package.json")!);
    const server = JSON.parse(vfs.read("apps/server/package.json")!);
    expect(web.dependencies["@test-app/i18n"]).toBe("workspace:*");
    expect(server.dependencies["@test-app/i18n"]).toBeUndefined();
  });

  it("no modules → no added workspace deps on apps/server beyond api + auth", () => {
    const vfs = generate(cfg({ modules: [] }));
    const pkg = JSON.parse(vfs.read("apps/server/package.json")!);
    const extras = Object.keys(pkg.dependencies).filter(
      (k) => k.startsWith("@test-app/") && !["@test-app/api", "@test-app/auth"].includes(k),
    );
    expect(extras).toEqual([]);
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
