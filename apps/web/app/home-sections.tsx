import { ArrowRight, Sparkles, Terminal, Zap } from "lucide-react";
import Link from "next/link";

import { CopyButton } from "@/components/copy-button";
import { HeroShader } from "@/components/hero-shader";

/** @internal Scaffold export. */
export const INSTALL_CMD = "bun create veloz-stack@latest";

/** @internal Scaffold export. */
export const STACK_CHIPS: { label: string; tone?: "brand" }[] = [
  { label: "Bun" },
  { label: "Hono" },
  { label: "oRPC", tone: "brand" },
  { label: "TanStack Start" },
  { label: "Better Auth" },
  { label: "Drizzle" },
  { label: "Postgres" },
];

/** @internal Scaffold export. */
export const FEATURES = [
  {
    icon: Zap,
    title: "Opinado pro Brasil",
    body: "PIX via AbacatePay, SMS via Ararahq, banner LGPD, formatadores pt-BR, busca CEP — tudo a um clique.",
  },
  {
    icon: Terminal,
    title: "Pronto pro Claude",
    body: "Cada SaaS integrado entrega uma skill do Claude Code. O agente já entende seu stack na hora que você roda o scaffold.",
  },
  {
    icon: Sparkles,
    title: "100% deployável no Veloz",
    body: "veloz.json, Dockerfile, rota de health — tudo gerado. Ou escolha Vercel, Cloudflare, Fly, Render, Docker.",
  },
];

/** @internal Scaffold pipeline step. */
export function HomeHeroBadge() {
  return (
    <div className="inline-flex items-center gap-1.5 text-[11px] font-medium border border-border-strong px-2 py-1 mb-8">
      <span className="w-1.5 h-1.5 bg-brand rounded-full" />
      <span className="text-muted-foreground">
        v0.1 · Stack TypeScript pensado pro Brasil
      </span>
    </div>
  );
}

/** @internal Scaffold pipeline step. */
export function HomeHeroCopy() {
  return (
    <>
      <h1 className="font-heading text-5xl md:text-7xl font-bold tracking-tight text-balance mb-6">
        O stack que sobe
        <br />
        <span className="text-brand">na velocidade do Brasil.</span>
      </h1>
      <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto mb-10 text-balance">
        Scaffolder full-stack TypeScript opinado. Escolha seus blocos, receba um
        monorepo pronto pra produção com PIX, LGPD, auth por SMS, skills do
        Claude, e deploy no Veloz num comando.
      </p>
    </>
  );
}

/** @internal Scaffold pipeline step. */
export function HomeHeroActions() {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-6">
      <Link
        href="/new"
        className="inline-flex items-center justify-center gap-2 h-10 px-4 bg-brand text-brand-foreground text-sm font-medium hover:bg-brand-hover active:scale-[0.98] transition-[colors,transform] brand-glow"
      >
        Montar meu stack <ArrowRight className="w-4 h-4" />
      </Link>
      <div className="flex items-center gap-0 border border-border-strong bg-secondary pl-3 pr-1 h-10">
        <code className="font-mono text-sm text-foreground">{INSTALL_CMD}</code>
        <div className="ml-3">
          <CopyButton value={INSTALL_CMD} />
        </div>
      </div>
    </div>
  );
}

/** @internal Scaffold pipeline step. */
export function HomeHeroChips() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2 pt-6">
      {STACK_CHIPS.map((chip) => (
        <span
          key={chip.label}
          className={`text-[11px] font-medium px-2 py-1 border ${
            chip.tone === "brand"
              ? "border-brand/40 bg-brand-subtle text-brand"
              : "border-border-strong bg-secondary text-muted-foreground"
          }`}
        >
          {chip.label}
        </span>
      ))}
    </div>
  );
}

/** @internal Scaffold pipeline step. */
export function HomeHero() {
  return (
    <section className="relative border-b border-border overflow-hidden">
      <HeroShader />
      <div className="relative max-w-5xl mx-auto px-6 py-24 text-center">
        <HomeHeroBadge />
        <HomeHeroCopy />
        <HomeHeroActions />
        <HomeHeroChips />
      </div>
    </section>
  );
}

/** @internal Scaffold pipeline step. */
export function HomeFeatures() {
  return (
    <section className="border-b border-border">
      <div className="max-w-5xl mx-auto px-6 py-16 grid md:grid-cols-3 gap-px bg-border">
        {FEATURES.map((feature) => (
          <div key={feature.title} className="bg-background p-6">
            <div className="w-8 h-8 border border-border-strong bg-secondary inline-flex items-center justify-center mb-4">
              <feature.icon className="w-4 h-4 text-brand" />
            </div>
            <h3 className="font-heading text-lg font-semibold mb-2">
              {feature.title}
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {feature.body}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

/** @internal Scaffold pipeline step. */
export function HomeCta() {
  return (
    <section>
      <div className="max-w-5xl mx-auto px-6 py-20 text-center">
        <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">
          Monte seus blocos. Pule o boilerplate.
        </h2>
        <p className="text-sm text-muted-foreground mb-8 max-w-xl mx-auto">
          Cada módulo chega com código, env vars, handlers de webhook e uma
          skill do Claude — o agente já sabe a integração no instante do
          scaffold.
        </p>
        <Link
          href="/new"
          className="inline-flex items-center justify-center gap-2 h-10 px-4 bg-brand text-brand-foreground text-sm font-medium hover:bg-brand-hover active:scale-[0.98] transition-[colors,transform]"
        >
          Abrir o montador de stack <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </section>
  );
}
