"use client";

import { ProjectConfig, PresetId } from "@veloz-stack/types";
import { useQueryStates } from "nuqs";

import { stackConfigParsers } from "./use-stack-config-parsers";

export function useStackConfig() {
  const [state, setState] = useQueryStates(stackConfigParsers, {
    history: "replace",
    urlKeys: {},
  });

  const config = ProjectConfig.parse({
    projectName: state.name,
    preset: state.preset,
    frontend: state.frontend,
    mobile: state.mobile,
    desktop: state.desktop,
    backend: state.backend,
    runtime: state.runtime,
    api: state.api,
    db: state.db,
    orm: state.orm,
    dbHosting: state.dbHosting,
    auth: state.auth,
    deploy: state.deploy,
    pm: state.pm,
    ui: state.ui,
    modules: state.modules,
    examples: state.examples,
    addons: state.addons,
    oxlintStrict: state.oxlintStrict,
    lefthookCi: state.lefthookCi,
    lefthookAdvanced: state.lefthookAdvanced,
    git: state.git,
    install: state.install,
  });

  return {
    config,
    basePreset: PresetId.parse(state.basePreset),
    setState,
  };
}

export type StackSetter = ReturnType<typeof useStackConfig>["setState"];
