import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { Logo } from "@/components/logo";

const CURRENT_YEAR = new Date().getFullYear();

/** @internal Scaffold pipeline step. */
export function SiteHeader() {
  return (
    <header className="h-[var(--site-header-height)] border-b border-border flex items-center justify-between px-6">
      <Logo />
      <nav className="flex items-center gap-5 text-xs text-muted-foreground">
        <a
          href="https://github.com/onveloz/veloz-stack"
          className="hover:text-foreground"
        >
          GitHub
        </a>
        <Link href="/showcase" className="hover:text-foreground">
          Showcase
        </Link>
        <a
          href="https://github.com/onveloz/veloz-stack/tree/main/docs"
          className="hover:text-foreground"
        >
          Docs
        </a>
        <Link
          href="/new"
          className="inline-flex items-center gap-1 text-foreground hover:text-brand"
        >
          Montar stack <ArrowRight className="w-3 h-3" />
        </Link>
      </nav>
    </header>
  );
}

/** @internal Scaffold pipeline step. */
export function SiteFooter() {
  return (
    <footer className="border-t border-border">
      <div className="max-w-5xl mx-auto px-6 py-8 flex items-center justify-between text-xs text-muted-foreground">
        <Logo />
        <span>© {CURRENT_YEAR} Veloz — feito no Brasil</span>
      </div>
    </footer>
  );
}
