import { ArrowLeft, ExternalLink } from "lucide-react";
import Link from "next/link";
import type { SVGProps } from "react";

import { Logo } from "@/components/logo";
import { SHOWCASE_PROJECTS, SHOWCASE_SUBMIT_URL } from "@/lib/showcase";

function GitHubIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 98 96" aria-hidden {...props}>
      <path
        fill="currentColor"
        d="M48.854 0C21.839 0 0 22 0 49.217c0 21.756 13.993 40.172 33.405 46.69 2.427.49 3.316-1.059 3.316-2.362 0-1.141-.08-5.052-.08-9.127-13.59 2.934-16.42-5.867-16.42-5.867-2.184-5.704-5.42-7.17-5.42-7.17-4.448-3.015.324-3.015.324-3.015 4.934.326 7.523 5.052 7.523 5.052 4.367 7.496 11.404 5.378 14.235 4.074.404-3.178 1.699-5.378 3.074-6.6-10.839-1.141-22.243-5.378-22.243-24.283 0-5.378 1.94-9.778 5.014-13.2-.485-1.222-2.184-6.275.486-13.038 0 0 4.125-1.304 13.426 5.052a46.97 46.97 0 0 1 12.214-1.73c4.125 0 8.33.571 12.213 1.73 9.302-6.356 13.427-5.052 13.427-5.052 2.67 6.763.97 11.816.485 13.038 3.155 3.422 5.015 7.822 5.015 13.2 0 18.905-11.404 23.06-22.324 24.283 1.78 1.548 3.316 4.481 3.316 9.126 0 6.6-.08 11.897-.08 13.526 0 1.304.89 2.853 3.316 2.364 19.412-6.52 33.405-24.935 33.405-46.691C97.707 22 75.788 0 48.854 0z"
      />
    </svg>
  );
}

export const metadata = {
  title: "Showcase — Veloz Stack",
  description: "Projetos da comunidade construídos com create-veloz-stack. Envie o seu via GitHub.",
};

export default function ShowcasePage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="h-11 border-b border-border flex items-center justify-between px-6">
        <Logo />
        <nav className="flex items-center gap-5 text-xs text-muted-foreground">
          <Link href="/" className="inline-flex items-center gap-1 hover:text-foreground">
            <ArrowLeft className="w-3 h-3" /> Início
          </Link>
          <Link href="/new" className="hover:text-foreground">
            Montar stack
          </Link>
          <a href="https://github.com/onveloz/veloz-stack" className="hover:text-foreground">
            GitHub
          </a>
        </nav>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-16">
        <p className="text-[11px] uppercase tracking-wider text-brand font-medium mb-3">
          Comunidade
        </p>
        <h1 className="font-heading text-4xl md:text-5xl font-bold tracking-tight mb-4">
          Projetos com Veloz Stack
        </h1>
        <p className="text-muted-foreground max-w-2xl mb-10 leading-relaxed">
          Apps públicos gerados com{" "}
          <code className="text-foreground font-mono text-sm">create-veloz-stack</code>. Cada
          projeto inclui <code className="font-mono text-sm">veloz-stack.jsonc</code> na raiz — o
          manifesto do stack escolhido (como o <code className="font-mono text-sm">bts.jsonc</code>{" "}
          no Better-T-Stack).
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          {SHOWCASE_PROJECTS.map((project) => (
            <article
              key={project.sourceUrl ?? project.title}
              className="border border-border bg-secondary/20 p-5 flex flex-col gap-3"
            >
              <div className="flex items-start justify-between gap-3">
                <h2 className="font-heading text-lg font-semibold">{project.title}</h2>
                <div className="flex items-center gap-2 shrink-0">
                  {project.sourceUrl ? (
                    <a
                      href={project.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-foreground"
                      aria-label="Código no GitHub"
                    >
                      <GitHubIcon className="w-4 h-4" />
                    </a>
                  ) : null}
                  {project.liveUrl ? (
                    <a
                      href={project.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-brand"
                      aria-label="Abrir site"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  ) : null}
                </div>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed flex-1">
                {project.description}
              </p>
              {project.tags.length > 0 ? (
                <ul className="flex flex-wrap gap-1.5">
                  {project.tags.map((tag) => (
                    <li
                      key={tag}
                      className="text-[10px] font-medium px-2 py-0.5 border border-border-strong bg-background text-muted-foreground"
                    >
                      {tag}
                    </li>
                  ))}
                </ul>
              ) : null}
            </article>
          ))}
        </div>

        <section className="mt-14 border border-border border-dashed p-6 text-center">
          <h3 className="font-heading text-lg font-semibold mb-2">Quer aparecer aqui?</h3>
          <p className="text-sm text-muted-foreground mb-4 max-w-lg mx-auto">
            Abra uma issue com o link do repo (público), demo ao vivo e tags do stack. Mantenha{" "}
            <code className="font-mono text-xs">veloz-stack.jsonc</code> commitado — ajuda a
            comunidade a achar projetos no GitHub.
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
      </main>

      <footer className="border-t border-border">
        <div className="max-w-5xl mx-auto px-6 py-8 flex items-center justify-between text-xs text-muted-foreground">
          <Logo />
          <span>© {new Date().getFullYear()} Veloz — feito no Brasil</span>
        </div>
      </footer>
    </div>
  );
}
