import showcaseData from "@/data/showcase.json";

export type ShowcaseProject = {
  title: string;
  description: string;
  liveUrl?: string;
  sourceUrl?: string;
  imageUrl?: string;
  tags: string[];
};

export const SHOWCASE_PROJECTS = showcaseData as ShowcaseProject[];

export const SHOWCASE_SUBMIT_URL =
  "https://github.com/onveloz/veloz-stack/issues/new?template=showcase.yml";
