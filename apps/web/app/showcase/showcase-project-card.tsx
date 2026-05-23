import { ExternalLink } from "lucide-react";

import type { ShowcaseProject } from "@/lib/showcase";

import { ShowcaseGitHubIcon } from "./showcase-github-icon";

export function ShowcaseProjectCard({ project }: { project: ShowcaseProject }) {
  return (
    <article className="border border-border bg-secondary/20 p-5 flex flex-col gap-3">
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
              <ShowcaseGitHubIcon className="w-4 h-4" />
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
  );
}
