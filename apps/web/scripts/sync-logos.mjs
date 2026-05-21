#!/usr/bin/env node
/**
 * Fetches https://api.svgl.app once, picks the logo for each option id
 * (see LOGO_MAP), downloads the dark-variant SVG, and saves it into
 * apps/web/public/logos/<id>.svg. Missing ids are logged; the component
 * falls back to a letter badge at runtime.
 */
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, "..", "public", "logos");

/** id → fuzzy title candidates (tried in order). Use exact svgl `title` when known. */
const LOGO_MAP = {
  // frontend
  "tanstack-start": ["TanStack"],
  next: ["Next.js"],
  nuxt: ["Nuxt"],
  "svelte-kit": ["SvelteKit", "Svelte"],
  astro: ["Astro"],
  "native-expo": ["Expo"],

  // backend
  hono: ["Hono"],
  express: ["Express.js"],
  fastify: ["Fastify"],
  elysia: ["ElysiaJS", "Elysia"],

  // runtime
  bun: ["Bun"],
  node: ["Node.js"],
  workers: ["Cloudflare Workers", "Cloudflare"],

  // api
  orpc: ["oRPC", "ORPC"],
  trpc: ["tRPC", "TRPC"],

  // db
  postgres: ["PostgreSQL"],
  mysql: ["MySQL"],
  sqlite: ["SQLite"],
  mongodb: ["MongoDB"],

  // orm
  drizzle: ["Drizzle ORM", "Drizzle"],
  prisma: ["Prisma"],
  mongoose: ["Mongoose"],

  // dbHosting
  neon: ["Neon"],
  supabase: ["Supabase"],
  planetscale: ["PlanetScale"],
  turso: ["Turso"],
  "mongodb-atlas": ["MongoDB"],
  docker: ["Docker"],

  // auth
  "better-auth": ["Better Auth"],
  clerk: ["Clerk"],

  // deploy
  vercel: ["Vercel"],
  cloudflare: ["Cloudflare"],
  fly: ["Fly.io", "Fly"],
  render: ["Render"],

  // pm
  pnpm: ["pnpm"],
  npm: ["npm"],

  // ui
  shadcn: ["shadcn/ui", "shadcn"],

  // desktop
  tauri: ["Tauri"],

  // addons
  turborepo: ["Turborepo", "Turbo"],
  biome: ["Biome"],
  husky: ["Husky"],
  lefthook: ["Lefthook"],

  // modules — tech brands that exist on svgl
  claude: ["Claude AI", "Claude", "Anthropic"],
  stripe: ["Stripe"],
  "stripe-br": ["Stripe"],
  twilio: ["Twilio"],
  posthog: ["PostHog"],
  sentry: ["Sentry"],
  resend: ["Resend"],
  "upstash-redis": ["Upstash", "Redis"],
  s3: ["AWS", "Amazon Web Services"],
  "cloudflare-r2": ["Cloudflare"],
  "mercadopago": ["Mercado Pago"],
  pino: ["Pino"],
  opentelemetry: ["OpenTelemetry"],
  "next-intl": ["next-intl"],
};

function pickRoute(entry) {
  const r = entry.route;
  if (typeof r === "string") return r;
  if (r && typeof r === "object") return r.dark ?? r.light;
  return null;
}

function findByCandidates(catalog, candidates) {
  for (const c of candidates) {
    const exact = catalog.find((e) => e.title.toLowerCase() === c.toLowerCase());
    if (exact) return exact;
  }
  for (const c of candidates) {
    const needle = c.toLowerCase();
    const partial = catalog.find((e) => {
      const t = e.title.toLowerCase();
      if (t === needle) return true;
      if (t.startsWith(needle + " ") || t.startsWith(needle + "/") || t.startsWith(needle + "."))
        return true;
      // endsWith only for multi-word needles (avoids "Photoshop Express" for "Express")
      if (needle.includes(" ") && t.endsWith(" " + needle)) return true;
      return false;
    });
    if (partial) return partial;
  }
  return null;
}

async function main() {
  console.log("Fetching svgl catalog…");
  const res = await fetch("https://api.svgl.app");
  if (!res.ok) throw new Error(`svgl.app responded ${res.status}`);
  const catalog = await res.json();
  console.log(`  got ${catalog.length} logos`);

  await mkdir(OUT_DIR, { recursive: true });

  const matched = [];
  const missing = [];

  for (const [id, candidates] of Object.entries(LOGO_MAP)) {
    const entry = findByCandidates(catalog, candidates);
    if (!entry) {
      missing.push(id);
      continue;
    }
    const url = pickRoute(entry);
    if (!url) {
      missing.push(id);
      continue;
    }
    const svgRes = await fetch(url);
    if (!svgRes.ok) {
      console.warn(`  ${id}: ${url} → ${svgRes.status}`);
      missing.push(id);
      continue;
    }
    const svg = await svgRes.text();
    await writeFile(join(OUT_DIR, `${id}.svg`), svg, "utf8");
    matched.push({ id, title: entry.title });
  }

  console.log(`\nMatched ${matched.length}:`);
  for (const m of matched) console.log(`  ✓ ${m.id.padEnd(20)} → ${m.title}`);
  if (missing.length > 0) {
    console.log(`\nMissing ${missing.length} (will use letter-badge fallback):`);
    for (const id of missing) console.log(`  · ${id}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
