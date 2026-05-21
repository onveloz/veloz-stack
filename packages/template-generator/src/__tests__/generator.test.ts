import { describe, expect, it } from "vitest";
import {
  DEFAULT_CONFIG,
  applyImplicitStackRules,
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

  it("writes veloz-stack.jsonc when cliVersion is provided", () => {
    const vfs = generate(cfg({ projectName: "demo-app" }), { cliVersion: "0.0.1" });
    expect(vfs.exists("veloz-stack.jsonc")).toBe(true);
    const raw = vfs.read("veloz-stack.jsonc")!;
    expect(raw).toContain("reproducibleCommand");
    expect(raw).toContain("demo-app");
    expect(raw).toContain("https://www.veloz-stack.com/schemas/veloz-stack.schema.json");
  });

  it("omits veloz-stack.jsonc in browser preview (no cliVersion)", () => {
    const files = paths(cfg({}));
    expect(files).not.toContain("veloz-stack.jsonc");
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

  it("--mobile expo produces an Expo project under apps/mobile (independent of web frontend)", () => {
    const files = paths(cfg({ frontend: "tanstack-start", mobile: "expo" }));
    expect(files).toContain("apps/mobile/app.json");
    expect(files).toContain("apps/mobile/app/_layout.tsx");
    expect(files).toContain("apps/mobile/app/index.tsx");
    expect(files).toContain("apps/mobile/src/lib/orpc.ts");
    // web frontend still emits — web + mobile coexist
    expect(files.some((p) => p.startsWith("apps/web/"))).toBe(true);
  });

  it("--mobile expo --frontend none emits only mobile (no web)", () => {
    const files = paths(cfg({ frontend: "none", mobile: "expo" }));
    expect(files).toContain("apps/mobile/app.json");
    expect(files.some((p) => p.startsWith("apps/web/"))).toBe(false);
  });

  it("--desktop tauri emits the Tauri shell + Cargo.toml", () => {
    const files = paths(cfg({ desktop: "tauri" }));
    expect(files).toContain("apps/desktop/src-tauri/Cargo.toml");
    expect(files).toContain("apps/desktop/src-tauri/src/main.rs");
    expect(files).toContain("apps/desktop/src-tauri/tauri.conf.json");
    expect(files).toContain("apps/desktop/package.json");
  });

  it("--desktop tauri + tanstack-start emits the /desktop IPC route", () => {
    const vfs = generate(cfg({ desktop: "tauri", frontend: "tanstack-start" }));
    expect(vfs.read("apps/web/src/routes/desktop.tsx")).toContain("invoke");
    const pkg = JSON.parse(vfs.read("apps/web/package.json")!);
    expect(pkg.dependencies["@tauri-apps/api"]).toBeDefined();
  });

  it("validateConfig rejects --desktop tauri --frontend none (Tauri wraps web)", () => {
    const errors = validateConfig(cfg({ desktop: "tauri", frontend: "none" }));
    expect(errors.some((e) => e.includes("Tauri precisa de um frontend web"))).toBe(true);
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

describe("enriched homes", () => {
  it("nuxt home interpolates projectName + STACK + brand colour + módulos pills", () => {
    const vfs = generate(cfg({ frontend: "nuxt", projectName: "minha-loja" }));
    const home = vfs.read("apps/web/app.vue")!;
    expect(home).toContain("minha-loja");
    expect(home).toContain("#ff4d00");
    expect(home).toMatch(/Próximos passos/);
    expect(home).toMatch(/MODULES/);
    expect(home).toMatch(/quick-links/);
  });

  it("svelte-kit home renders Veloz showcase blocks (não só o stub antigo)", () => {
    const vfs = generate(cfg({ frontend: "svelte-kit", projectName: "tchau-mundo" }));
    const home = vfs.read("apps/web/src/routes/+page.svelte")!;
    expect(home).toContain("tchau-mundo");
    expect(home).toContain("#ff4d00");
    expect(home).toMatch(/Próximos passos/);
    expect(home).toMatch(/{#each STACK/);
    expect(home).toMatch(/dot-grid/);
  });

  it("astro index.astro lists STACK + módulos + Veloz quick links", () => {
    const vfs = generate(cfg({ frontend: "astro", projectName: "ola" }));
    const home = vfs.read("apps/web/src/pages/index.astro")!;
    expect(home).toContain("ola");
    expect(home).toContain("#ff4d00");
    expect(home).toMatch(/STACK\.map/);
    expect(home).toMatch(/Próximos passos/);
    expect(home).toMatch(/onveloz\.com\/docs/);
  });

  it("expo mobile home shows projectName + brand + status pill + módulos chips", () => {
    const vfs = generate(cfg({ mobile: "expo", projectName: "app-nativo" }));
    const home = vfs.read("apps/mobile/app/index.tsx")!;
    expect(home).toContain("app-nativo");
    expect(home).toContain("#FF4D00");
    expect(home).toMatch(/STACK\.map/);
    expect(home).toMatch(/MÓDULOS ATIVOS/);
    expect(home).toMatch(/onveloz\.com\/docs/);
  });
});

describe("ui axis", () => {
  it("default ui=shadcn overlays components.json + ui/ folder for tanstack-start", () => {
    const files = paths(cfg({ ui: "shadcn", frontend: "tanstack-start" }));
    expect(files).toContain("apps/web/components.json");
    expect(files).toContain("apps/web/src/components/ui/button.tsx");
    expect(files).toContain("apps/web/src/components/ui/card.tsx");
    expect(files).toContain("apps/web/src/components/ui/dialog.tsx");
    expect(files).toContain("apps/web/src/lib/utils.ts");
  });

  it("ui=shadcn adds Radix + tw-animate-css deps to apps/web/package.json", () => {
    const vfs = generate(cfg({ ui: "shadcn", frontend: "tanstack-start" }));
    const pkg = JSON.parse(vfs.read("apps/web/package.json")!);
    expect(pkg.dependencies["@radix-ui/react-dialog"]).toBeTruthy();
    expect(pkg.dependencies["@radix-ui/react-slot"]).toBeTruthy();
    expect(pkg.dependencies["class-variance-authority"]).toBeTruthy();
    expect(pkg.dependencies["tw-animate-css"]).toBeTruthy();
  });

  it("ui=shadcn with frontend=next places components under app/ layout", () => {
    const files = paths(cfg({ ui: "shadcn", frontend: "next" }));
    expect(files).toContain("apps/web/components.json");
    expect(files).toContain("apps/web/components/ui/button.tsx");
    expect(files).toContain("apps/web/lib/utils.ts");
  });

  it("ui=tailwind keeps the stock home — no shadcn overlay", () => {
    const files = paths(cfg({ ui: "tailwind", frontend: "tanstack-start" }));
    expect(files).not.toContain("apps/web/components.json");
    expect(files).not.toContain("apps/web/src/components/ui/button.tsx");
  });

  it("ui=none strips Tailwind from apps/web/package.json + vite.config", () => {
    const vfs = generate(cfg({ ui: "none", frontend: "tanstack-start" }));
    const pkg = JSON.parse(vfs.read("apps/web/package.json")!);
    expect(pkg.dependencies?.tailwindcss).toBeUndefined();
    expect(pkg.dependencies?.["@tailwindcss/vite"]).toBeUndefined();
    const vite = vfs.read("apps/web/vite.config.ts")!;
    expect(vite).not.toContain("@tailwindcss/vite");
  });

  it("validateConfig rejects ui=shadcn with non-React frontend (nuxt)", () => {
    const errors = validateConfig(cfg({ ui: "shadcn", frontend: "nuxt" }));
    expect(errors.some((e) => e.includes("shadcn é React-only"))).toBe(true);
  });

  it("validateConfig rejects ui=shadcn with frontend=none", () => {
    const errors = validateConfig(cfg({ ui: "shadcn", frontend: "none" }));
    expect(errors.some((e) => e.includes("shadcn precisa de um frontend React"))).toBe(true);
  });
});

describe("deploy targets", () => {
  it("veloz emits veloz.json + Dockerfile", () => {
    const files = paths(cfg({ deploy: "veloz" }));
    expect(files).toContain("veloz.json");
    expect(files).toContain("Dockerfile");
  });

  it("veloz.json matches the official veloz-config.schema shape", () => {
    const vfs = generate(cfg({ deploy: "veloz" }));
    const doc = JSON.parse(vfs.read("veloz.json")!);
    expect(doc.$schema).toBe("https://onveloz.com/schemas/veloz-config.schema.json");
    expect(doc.version).toBe("1.0");
    expect(doc.project.name).toBe("test-app");
    // services is an OBJECT keyed by path, not an array
    expect(Array.isArray(doc.services)).toBe(false);
    expect(doc.services["apps/server"].type).toBe("web");
    expect(doc.services["apps/server"].build.method).toBe("turborepo");
    // web service emitted when frontend is set
    expect(doc.services["apps/web"]).toBeDefined();
    expect(doc.services["apps/web"].runtime.port).toBe(3001);
  });

  it("veloz.json drops apps/web when frontend is none", () => {
    const vfs = generate(cfg({ deploy: "veloz", frontend: "none" }));
    const doc = JSON.parse(vfs.read("veloz.json")!);
    expect(doc.services["apps/web"]).toBeUndefined();
    expect(doc.services["apps/server"]).toBeDefined();
  });

  it("veloz.json uses dockerfile build method when turborepo addon is off", () => {
    const vfs = generate(cfg({ deploy: "veloz", addons: [] }));
    const doc = JSON.parse(vfs.read("veloz.json")!);
    expect(doc.services["apps/server"].build.method).toBe("dockerfile");
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

  it("tanstack home omits conditional lucide imports when steps are disabled", () => {
    const flyHome = generate(cfg({ deploy: "fly" })).read("apps/web/src/routes/index.tsx")!;
    expect(flyHome).not.toMatch(/^\s*Rocket,/m);
    expect(flyHome).not.toContain("Deploy no Veloz");

    const noDbHome = generate(
      cfg({ db: "none", orm: "none", dbHosting: "none", auth: "none" }),
    ).read("apps/web/src/routes/index.tsx")!;
    expect(noDbHome).not.toMatch(/^\s*Database,/m);
    expect(noDbHome).not.toContain("Aplique o schema");

    const velozHome = generate(cfg({ deploy: "veloz" })).read("apps/web/src/routes/index.tsx")!;
    expect(velozHome).toMatch(/^\s*Rocket,/m);
    expect(velozHome).toMatch(/^\s*Database,/m);
  });

  it("lefthook addon adds lefthook.yml + prepare script", () => {
    const vfs = generate(cfg({ addons: ["lefthook", "biome"], pm: "pnpm" }));
    const hook = vfs.read("lefthook.yml")!;
    expect(hook).toContain("pre-commit:");
    expect(hook).toContain("pnpm exec biome check --write --no-errors-on-unmatched");
    expect(hook).not.toContain("pre-push:");
    const pkg = JSON.parse(vfs.read("package.json")!);
    expect(pkg.scripts.prepare).toBe("lefthook install");
    expect(pkg.devDependencies.lefthook).toBeDefined();
    expect(pkg.devDependencies.husky).toBeUndefined();
    expect(vfs.read(".github/workflows/ci.yml")).toBeUndefined();
  });

  it("lefthookCi adds pre-push hooks and GitHub Actions workflow", () => {
    const vfs = generate(
      cfg({ addons: ["lefthook", "biome"], lefthookCi: true, pm: "pnpm" }),
    );
    const hook = vfs.read("lefthook.yml")!;
    expect(hook).toContain("pre-push:");
    expect(hook).toContain("pnpm run check-types");
    expect(hook).toContain("pnpm run lint");
    expect(hook).toContain("pnpm run build");
    const ci = vfs.read(".github/workflows/ci.yml")!;
    expect(ci).toContain("name: ci");
    expect(ci).toContain("pnpm run check-types");
    expect(ci).toContain("pnpm run lint");
    expect(ci).toContain("pnpm run build");
  });

  it("lefthookCi without lefthook addon is rejected", () => {
    const errs = validateConfig(cfg({ lefthookCi: true, addons: ["biome"] }));
    expect(errs.some((e) => e.includes("lefthookCi"))).toBe(true);
  });

  it("lefthookAdvanced adds strict hooks, commitlint, and advanced CI", () => {
    const vfs = generate(
      cfg({
        addons: ["lefthook", "biome", "turborepo"],
        lefthookAdvanced: true,
        pm: "pnpm",
      }),
    );
    const hook = vfs.read("lefthook.yml")!;
    expect(hook).toContain("biome ci");
    expect(hook).toContain("commit-msg:");
    expect(hook).toContain("commitlint");
    expect(hook).toContain("pre-push:");
    expect(hook).toContain("piped: true");
    expect(hook).toContain("lint:ci");
    expect(hook).toContain("pnpm run test");
    expect(vfs.read("commitlint.config.cjs")).toContain("config-conventional");
    const ci = vfs.read(".github/workflows/ci.yml")!;
    expect(ci).toContain("commitlint");
    expect(ci).toContain("Biome CI");
    const pkg = JSON.parse(vfs.read("package.json")!);
    expect(pkg.scripts["lint:ci"]).toBe("biome ci .");
    expect(pkg.scripts.test).toContain("turbo run test");
    expect(pkg.devDependencies["@commitlint/cli"]).toBeDefined();
  });

  it("rejects lefthookCi and lefthookAdvanced together", () => {
    const errs = validateConfig(
      cfg({ addons: ["lefthook"], lefthookCi: true, lefthookAdvanced: true }),
    );
    expect(errs.some((e) => e.includes("básico ou avançado"))).toBe(true);
  });

  it("tanstack home omits conditional lucide imports when steps are disabled", () => {
    const flyHome = generate(cfg({ deploy: "fly" })).read("apps/web/src/routes/index.tsx")!;
    expect(flyHome).not.toMatch(/^\s*Rocket,/m);
    expect(flyHome).not.toContain("Deploy no Veloz");

    const noDbHome = generate(
      cfg({ db: "none", orm: "none", dbHosting: "none", auth: "none" }),
    ).read("apps/web/src/routes/index.tsx")!;
    expect(noDbHome).not.toMatch(/^\s*Database,/m);
    expect(noDbHome).not.toContain("Aplique o schema");

    const velozHome = generate(cfg({ deploy: "veloz" })).read("apps/web/src/routes/index.tsx")!;
    expect(velozHome).toMatch(/^\s*Rocket,/m);
    expect(velozHome).toMatch(/^\s*Database,/m);
  });

  it("both addons: turbo scripts + biome commands coexist", () => {
    const vfs = generate(cfg({ addons: ["turborepo", "biome"] }));
    const pkg = JSON.parse(vfs.read("package.json")!);
    expect(pkg.scripts.dev).toBe("turbo run dev");
    expect(pkg.scripts.format).toBe("biome format --write .");
    expect(pkg.devDependencies.turbo).toBeDefined();
    expect(pkg.devDependencies["@biomejs/biome"]).toBeDefined();
  });

  it("oxlint addon emits .oxlintrc.json + oxlint/oxfmt scripts (mutually exclusive with biome)", () => {
    const vfs = generate(cfg({ addons: ["turborepo", "oxlint"] }));
    expect(vfs.read(".oxlintrc.json")).toContain("no-debugger");
    const pkg = JSON.parse(vfs.read("package.json")!);
    expect(pkg.scripts.lint).toBe("oxlint .");
    expect(pkg.scripts.format).toBe("oxfmt .");
    expect(pkg.devDependencies.oxlint).toBeDefined();
    expect(pkg.devDependencies["@biomejs/biome"]).toBeUndefined();
  });

  it("oxlintStrict surfaces error severity in .oxlintrc.json", () => {
    const strict = generate(cfg({ addons: ["oxlint"], oxlintStrict: true }));
    const loose = generate(cfg({ addons: ["oxlint"], oxlintStrict: false }));
    expect(strict.read(".oxlintrc.json")).toContain("error");
    expect(loose.read(".oxlintrc.json")).toContain("warn");
  });

  it("husky + oxlint uses oxlint and oxfmt in lint-staged", () => {
    const vfs = generate(cfg({ addons: ["husky", "oxlint"] }));
    const pkg = JSON.parse(vfs.read("package.json")!);
    expect(pkg["lint-staged"]).toMatchObject({
      "*.{js,jsx,ts,tsx}": ["oxlint --fix"],
    });
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

describe("applyImplicitStackRules", () => {
  it("sets backend next when only frontend next is implied (CLI default hono)", () => {
    const resolved = applyImplicitStackRules(
      cfg({ frontend: "next", backend: "hono" }),
      { frontend: true },
    );
    expect(resolved.backend).toBe("next");
    expect(validateConfig(resolved)).toEqual([]);
  });

  it("keeps hono split when backend was passed explicitly", () => {
    const split = cfg({ frontend: "next", backend: "hono" });
    const resolved = applyImplicitStackRules(split, {
      frontend: true,
      backend: true,
    });
    expect(resolved.backend).toBe("hono");
    expect(validateConfig(resolved)).toEqual([]);
    expect(paths(resolved)).toContain("apps/server/src/index.ts");
  });

  it("reverts backend next when leaving next frontend without explicit backend", () => {
    const resolved = applyImplicitStackRules(
      cfg({ frontend: "tanstack-start", backend: "next", runtime: "node" }),
      { frontend: true },
    );
    expect(resolved.backend).toBe("hono");
    expect(resolved.runtime).toBe("bun");
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

  it("rejects backend next without frontend next", () => {
    const errs = validateConfig(cfg({ backend: "next", frontend: "tanstack-start" }));
    expect(errs.some((e) => e.includes("Backend Next só funciona com frontend Next"))).toBe(
      true,
    );
  });

  it("rejects backend next with runtime workers", () => {
    const errs = validateConfig(
      cfg({ backend: "next", frontend: "next", runtime: "workers", deploy: "cloudflare" }),
    );
    expect(
      errs.some((e) =>
        e.includes("Route Handlers do Next.js não rodam em Cloudflare Workers"),
      ),
    ).toBe(true);
  });

  it("accepts the default config", () => {
    expect(validateConfig(cfg({}))).toEqual([]);
  });

  it("rejects biome + oxlint addons together", () => {
    const errs = validateConfig(cfg({ addons: ["turborepo", "biome", "oxlint"] }));
    expect(errs.some((e) => e.includes("Biome e oxlint"))).toBe(true);
  });

  it("rejects oxlintStrict without oxlint addon", () => {
    const errs = validateConfig(cfg({ addons: ["turborepo", "biome"], oxlintStrict: true }));
    expect(errs.some((e) => e.includes("oxlint strict"))).toBe(true);
  });

  it("rejects husky and lefthook together", () => {
    const errs = validateConfig(cfg({ addons: ["husky", "lefthook", "biome"] }));
    expect(errs.some((e) => e.includes("Husky e Lefthook"))).toBe(true);
  });
});

describe("backend next", () => {
  it("next+next emits rpc/auth/health routes and no apps/server", () => {
    const files = paths(cfg({ frontend: "next", backend: "next" }));

    expect(files).toContain("apps/web/app/api/rpc/[...path]/route.ts");
    expect(files).toContain("apps/web/app/api/auth/[...all]/route.ts");
    expect(files).toContain("apps/web/app/api/health/route.ts");
    expect(files).not.toContain("apps/server/src/index.ts");
  });

  it("next+next orpc client uses same-origin /api/rpc", () => {
    const vfs = generate(cfg({ frontend: "next", backend: "next" }));
    const orpc = vfs.read("apps/web/lib/orpc.ts")!;
    expect(orpc).toContain("window.location.origin");
    expect(orpc).toContain("/api/rpc");
    expect(orpc).not.toContain("NEXT_PUBLIC_SERVER_URL");
  });

  it("next+hono split still emits apps/server (regression)", () => {
    const files = paths(cfg({ frontend: "next", backend: "hono" }));
    expect(files).toContain("apps/server/src/index.ts");
    expect(files).not.toContain("apps/web/app/api/rpc/[...path]/route.ts");
  });

  it("next+hono orpc client uses NEXT_PUBLIC_SERVER_URL", () => {
    const vfs = generate(cfg({ frontend: "next", backend: "hono" }));
    const orpc = vfs.read("apps/web/lib/orpc.ts")!;
    expect(orpc).toContain("NEXT_PUBLIC_SERVER_URL");
    expect(orpc).toContain("/rpc");
  });

  it("context.ts uses headers-based createContext (no Hono)", () => {
    const vfs = generate(cfg({ frontend: "next", backend: "next" }));
    const ctx = vfs.read("packages/api/src/context.ts")!;
    expect(ctx).toContain("headers: Headers");
    expect(ctx).not.toContain("HonoContext");
    expect(ctx).not.toContain("hono");
  });

  it("hono server still calls createContext with headers", () => {
    const vfs = generate(cfg({ backend: "hono" }));
    const server = vfs.read("apps/server/src/index.ts")!;
    expect(server).toContain("createContext({ headers: c.req.raw.headers })");
  });

  it("backend next auth uses nextCookies plugin", () => {
    const vfs = generate(cfg({ frontend: "next", backend: "next" }));
    const auth = vfs.read("packages/auth/src/index.ts")!;
    expect(auth).toContain("nextCookies");
    expect(auth).toContain('sameSite: "lax"');
  });

  it("backend next auth client uses same-origin baseURL", () => {
    const vfs = generate(cfg({ frontend: "next", backend: "next", auth: "better-auth" }));
    const client = vfs.read("apps/web/lib/auth-client.ts")!;
    expect(client).toContain("window.location.origin");
    expect(client).not.toContain("VITE_SERVER_URL");
  });

  it("veloz.json omits apps/server and sets web healthCheck when backend next", () => {
    const vfs = generate(cfg({ deploy: "veloz", frontend: "next", backend: "next" }));
    const doc = JSON.parse(vfs.read("veloz.json")!);
    expect(doc.services["apps/server"]).toBeUndefined();
    expect(doc.services["apps/web"].healthCheck.path).toBe("/api/health");
  });

  it("Dockerfile targets apps/web when backend next", () => {
    const vfs = generate(cfg({ deploy: "veloz", frontend: "next", backend: "next" }));
    const docker = vfs.read("Dockerfile")!;
    expect(docker).toContain("apps/web");
    expect(docker).toContain("/api/health");
    expect(docker).not.toContain("apps/server");
  });

  it("abacatepay module wires into apps/web when backend next", () => {
    const vfs = generate(
      cfg({ frontend: "next", backend: "next", modules: ["abacatepay"] }),
    );
    const web = JSON.parse(vfs.read("apps/web/package.json")!);
    expect(web.dependencies["@test-app/abacatepay"]).toBe("workspace:*");
    expect(vfs.read("apps/server/package.json")).toBeUndefined();
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

  it("pino module emits packages/logging and wires workspace dep into apps/server", () => {
    const vfs = generate(cfg({ modules: ["pino"] }));
    expect(vfs.read("packages/logging/src/index.ts")).toContain("pinoMiddleware");
    const pkg = JSON.parse(vfs.read("apps/server/package.json")!);
    expect(pkg.dependencies["@test-app/logging"]).toBe("workspace:*");
  });

  it("opentelemetry module emits packages/observability + initTelemetry", () => {
    const vfs = generate(cfg({ modules: ["opentelemetry"] }));
    const obs = vfs.read("packages/observability/src/index.ts")!;
    expect(obs).toContain("initTelemetry");
    expect(obs).toContain("shutdownTelemetry");
    expect(obs).toContain("registerTelemetryShutdownHandlers");
    const pkg = JSON.parse(vfs.read("apps/server/package.json")!);
    expect(pkg.dependencies["@test-app/observability"]).toBe("workspace:*");
  });

  it("next-intl module uses [locale] routes + middleware and drops root app/page.tsx", () => {
    const vfs = generate(cfg({ frontend: "next", modules: ["next-intl"] }));
    expect(vfs.read("apps/web/app/page.tsx")).toBeUndefined();
    expect(vfs.read("apps/web/app/[locale]/page.tsx")).toContain("useTranslations");
    expect(vfs.read("apps/web/middleware.ts")).toContain("next-intl/middleware");
    expect(vfs.read("apps/web/i18n/request.ts")).toContain("getRequestConfig");
    expect(vfs.read("apps/web/i18n/routing.ts")).toContain("defineRouting");
    const pkg = JSON.parse(vfs.read("apps/web/package.json")!);
    expect(pkg.dependencies["next-intl"]).toBeDefined();
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
