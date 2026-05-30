import { z } from "zod";

function fileBaseName(raw: string): string {
  const slash = Math.max(raw.lastIndexOf("/"), raw.lastIndexOf("\\"));
  return slash >= 0 ? raw.slice(slash + 1) : raw;
}

/** Default folder name when input sanitizes to empty. */
export const PROJECT_NAME_FALLBACK = "my-veloz-stack";

/** Canonical project folder / npm scope segment (matches {@link ProjectConfig}). */
export const ProjectNameSchema = z
  .string()
  .min(1)
  .regex(/^[a-z0-9][a-z0-9-_]*$/, {
    message:
      "Use lowercase letters, digits, hyphen, or underscore; name must start with a letter or digit",
  });

/**
 * Normalize user input into a lowercase npm-safe project slug.
 * Strips leading/trailing separators and disallowed characters.
 */
export function sanitizeProjectName(
  raw: string,
  fallback = PROJECT_NAME_FALLBACK,
): string {
  const trimmed = raw.trim();
  const base = fileBaseName(trimmed) || fallback;
  const name = base
    .replaceAll(/[^a-z0-9-_]/gi, "-")
    .replaceAll(/^[-_]+/g, "")
    .replaceAll(/[-_]+$/g, "")
    .toLowerCase();
  return name || fallback;
}

/** Returns a validation message when `name` is not a valid {@link ProjectNameSchema} value. */
export function projectNameValidationError(name: string): string | null {
  const result = ProjectNameSchema.safeParse(name);
  if (result.success) {
    return null;
  }
  return (
    result.error.issues[0]?.message ??
    "Invalid project name (lowercase letters, digits, hyphen, underscore)"
  );
}
