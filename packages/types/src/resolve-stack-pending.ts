import type { ProjectConfig } from "./index";
import type { ConfigChange } from "./resolve-stack-types";
import {
  assignStackAxisFromString,
  findResolver,
  getStackAxisValue,
  isStackKey,
  RESOLVERS,
} from "./resolve-stack-axis";

interface AdjustSupportingFieldContext {
  proposed: ProjectConfig;
  pending: { key: keyof ProjectConfig; value: string };
  resolver: (typeof RESOLVERS)[number];
  block: string;
  changes: ConfigChange[];
}

function tryAdjustSupportingField(ctx: AdjustSupportingFieldContext): boolean {
  for (const candidateResolver of RESOLVERS) {
    if (candidateResolver.key === ctx.pending.key) {
      continue;
    }
    if (tryCandidateResolver(ctx, candidateResolver)) {
      return true;
    }
  }
  return false;
}

function tryCandidateResolver(
  ctx: AdjustSupportingFieldContext,
  candidateResolver: (typeof RESOLVERS)[number],
): boolean {
  for (const candidate of candidateResolver.options) {
    const current = getStackAxisValue(ctx.proposed, candidateResolver.key);
    if (candidate === current) {
      continue;
    }
    if (candidateResolver.check(ctx.proposed, candidate)) {
      continue;
    }
    const trial = { ...ctx.proposed, [candidateResolver.key]: candidate };
    if (ctx.resolver.check(trial, ctx.pending.value)) {
      continue;
    }
    ctx.changes.push({
      key: candidateResolver.key,
      from: current,
      to: candidate,
      reason: ctx.block,
    });
    assignStackAxisFromString(ctx.proposed, candidateResolver.key, candidate);
    return true;
  }
  return false;
}

export function satisfyPendingChoice(
  proposed: ProjectConfig,
  pending: { key: keyof ProjectConfig; value: string },
  changes: ConfigChange[],
): void {
  if (!isStackKey(pending.key)) {
    return;
  }
  const resolver = findResolver(pending.key);
  if (!resolver) {
    return;
  }

  for (let pass = 0; pass < 8; pass++) {
    const block = resolver.check(proposed, pending.value);
    if (!block) {
      return;
    }
    const fixed = tryAdjustSupportingField({
      proposed,
      pending,
      resolver,
      block,
      changes,
    });
    if (!fixed) {
      return;
    }
  }
}

export function findReason(
  cfg: ProjectConfig,
  key: keyof ProjectConfig,
  value: string,
): string | null {
  if (!isStackKey(key)) {
    return null;
  }
  const resolver = findResolver(key);
  if (!resolver) {
    return null;
  }
  return resolver.check(cfg, value);
}
