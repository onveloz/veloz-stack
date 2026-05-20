import { z } from "zod";
import showcaseData from "@/data/showcase.json";

const ShowcaseProjectSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  liveUrl: z.string().url().optional(),
  sourceUrl: z.string().url().optional(),
  imageUrl: z.string().url().optional(),
  tags: z.array(z.string()),
});

export type ShowcaseProject = z.infer<typeof ShowcaseProjectSchema>;

export const SHOWCASE_PROJECTS = z.array(ShowcaseProjectSchema).parse(showcaseData);

export const SHOWCASE_SUBMIT_URL =
  "https://github.com/onveloz/veloz-stack/issues/new?template=showcase.yml";
