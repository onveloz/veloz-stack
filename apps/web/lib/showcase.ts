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

const parsed = z.array(ShowcaseProjectSchema).safeParse(showcaseData);
if (!parsed.success) {
  console.error("Invalid showcase data:", parsed.error.flatten());
  throw new Error("Failed to parse showcase data");
}

export const SHOWCASE_PROJECTS = parsed.data;

export const SHOWCASE_SUBMIT_URL =
  "https://github.com/onveloz/veloz-stack/issues/new?template=showcase.yml";
