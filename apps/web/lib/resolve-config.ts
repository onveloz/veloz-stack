import {
  formatConfigChangeKey,
  isStackConfigValid,
  repairStackConfigCore,
  resolveEnableModule,
  resolveStackChange,
} from "@veloz-stack/types/resolve-stack";

import type { ConfigChange } from "@/lib/veloz-stack-types";
import {
  addonFlagsAfterGitHook,
  addonFlagsAfterLinter,
  getGitHookChoice,
  getLinterChoice,
  patchAddonsForGitHook,
  patchAddonsForLinter,
} from "@/lib/stack-addons";

/** @internal Generated-app type. */
export type { ConfigChange };

/** @deprecated Use `resolveStackChange` from `@veloz-stack/types/resolve-stack`. */
export const resolveConfig = resolveStackChange;

/** @deprecated Use `formatConfigChangeKey` from `@veloz-stack/types/resolve-stack`. */
export const formatKey = formatConfigChangeKey;

/** @deprecated Use `isStackConfigValid` from `@veloz-stack/types/resolve-stack`. */
export const isValid = isStackConfigValid;

/** @internal Scaffold pipeline step. */
export function repairStackConfig(
  config: Parameters<typeof repairStackConfigCore>[0],
) {
  const repaired = repairStackConfigCore(config);
  const gitHook = getGitHookChoice(repaired.addons);
  const linter = getLinterChoice(repaired.addons);
  return {
    ...repaired,
    addons: patchAddonsForLinter(
      patchAddonsForGitHook(repaired.addons, gitHook),
      linter,
    ),
    ...addonFlagsAfterGitHook(gitHook),
    ...addonFlagsAfterLinter(linter),
  };
}

export { isStackConfigValid, resolveEnableModule, resolveStackChange };
