import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** shadcn/ui primitive copied into generated apps. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

