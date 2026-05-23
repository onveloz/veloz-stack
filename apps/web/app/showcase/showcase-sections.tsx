import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import { Logo } from "@/components/logo";
import { SHOWCASE_SUBMIT_URL } from "@/lib/showcase";

const CURRENT_YEAR = new Date().getFullYear();

export function ShowcaseHeader() {
  return (
    <header className="h-11 border-b border-border flex items-center justify-between px-6">
      <Logo />
      <nav className="flex items-center gap-5 text-xs text-muted-foreground">
        <Link
          href="/"
          className="inline-flex items-center gap-1 hover:text-foreground"
        >
          <ArrowLeft className="w-3 h-3" /> Início
        </Link>
        <Link href="/new" className="hover:text-foreground">
          Montar stack
        </Link>
        <a
          href="https://github.com/onveloz/veloz-stack"
          className="hover:text-foreground"
        >
          GitHub
        </a>
      </nav>
    </header>
  );
}

export function ShowcaseIntro() {
  return (
    <>
      <p className="text-[11px] uppercase tracking-wider text-brand font-medium mb-3">
        Comunidade
      </p>
      <h1 className="font-heading text-4xl md:text-5xl font-bold tracking-tight mb-4">
        Projetos com Veloz Stack
      </h1>
      <p className="text-muted-foreground max-w-2xl mb-10 leading-relaxed">
        Apps públicos gerados com{" "}
        <code className="text-foreground font-mono text-sm">
          create-veloz-stack
        </code>
        . Cada projeto inclui{" "}
        <code className="font-mono text-sm">veloz-stack.jsonc</code> na raiz — o
        manifesto do stack escolhido (como o{" "}
        <code className="font-mono text-sm">bts.jsonc</code> no Better-T-Stack).
      </p>
    </>
  );
}

export function ShowcaseSubmitSection() {
  return (
    <section className="mt-14 border border-border border-dashed p-6 text-center">
      <h3 className="font-heading text-lg font-semibold mb-2">
        Quer aparecer aqui?
      </h3>
      <p className="text-sm text-muted-foreground mb-4 max-w-lg mx-auto">
        Abra uma issue com o link do repo (público), demo ao vivo e tags do
        stack. Mantenha{" "}
        <code className="font-mono text-xs">veloz-stack.jsonc</code> commitado —
        ajuda a comunidade a achar projetos no GitHub.
      </p>
      <a
        href={SHOWCASE_SUBMIT_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center justify-center h-9 px-4 bg-brand text-brand-foreground text-sm font-medium hover:bg-brand-hover transition-colors"
      >
        Enviar projeto
      </a>
    </section>
  );
}

export function ShowcaseFooter() {
  return (
    <footer className="border-t border-border">
      <div className="max-w-5xl mx-auto px-6 py-8 flex items-center justify-between text-xs text-muted-foreground">
        <Logo />
        <span>© {CURRENT_YEAR} Veloz — feito no Brasil</span>
      </div>
    </footer>
  );
}
