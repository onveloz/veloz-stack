import { SHOWCASE_PROJECTS } from "@/lib/showcase";

import {
  ShowcaseFooter,
  ShowcaseHeader,
  ShowcaseIntro,
  ShowcaseSubmitSection,
} from "./showcase-sections";
import { ShowcaseProjectCard } from "./showcase-project-card";

/** @internal Scaffold export. */
export const metadata = {
  title: "Showcase — Veloz Stack",
  description:
    "Projetos da comunidade construídos com create-veloz-stack. Envie o seu via GitHub.",
};

export default function ShowcasePage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <ShowcaseHeader />

      <main className="max-w-5xl mx-auto px-6 py-16">
        <ShowcaseIntro />

        <div className="grid gap-4 sm:grid-cols-2">
          {SHOWCASE_PROJECTS.map((project) => (
            <ShowcaseProjectCard
              key={project.sourceUrl ?? project.title}
              project={project}
            />
          ))}
        </div>

        <ShowcaseSubmitSection />
      </main>

      <ShowcaseFooter />
    </div>
  );
}
