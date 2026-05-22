"use client";

import {
  parseAsArrayOf,
  parseAsBoolean,
  parseAsString,
  parseAsStringEnum,
  useQueryStates,
} from "nuqs";
import type { ProjectConfig } from "@veloz-stack/types";
import {
  AddonId,
  ApiId,
  AuthId,
  BackendId,
  DEFAULT_CONFIG,
  DbHostingId,
  DbId,
  DeployId,
  DesktopId,
  FrontendId,
  MODULE_IDS,
  MobileId,
  OrmId,
  PackageManagerId,
  PresetId,
  RuntimeId,
  UiId,
  ExampleId,
} from "@veloz-stack/types";

const enumVals = (schema: { options: readonly string[] }) => {
  const opts = [...schema.options];
  if (opts.length < 1) throw new Error("empty enum option list");
  return opts as [string, ...string[]];
};

export function useStackConfig() {
  const [state, setState] = useQueryStates(
    {
      name: parseAsString.withDefault(DEFAULT_CONFIG.projectName),
      preset: parseAsStringEnum(enumVals(PresetId)).withDefault(DEFAULT_CONFIG.preset),
      /** Last named preset applied; kept when user customizes (`preset=custom`). */
      basePreset: parseAsStringEnum(enumVals(PresetId)).withDefault(DEFAULT_CONFIG.preset),
      frontend: parseAsStringEnum(enumVals(FrontendId)).withDefault(DEFAULT_CONFIG.frontend),
      mobile: parseAsStringEnum(enumVals(MobileId)).withDefault(DEFAULT_CONFIG.mobile),
      desktop: parseAsStringEnum(enumVals(DesktopId)).withDefault(DEFAULT_CONFIG.desktop),
      backend: parseAsStringEnum(enumVals(BackendId)).withDefault(DEFAULT_CONFIG.backend),
      runtime: parseAsStringEnum(enumVals(RuntimeId)).withDefault(DEFAULT_CONFIG.runtime),
      api: parseAsStringEnum(enumVals(ApiId)).withDefault(DEFAULT_CONFIG.api),
      db: parseAsStringEnum(enumVals(DbId)).withDefault(DEFAULT_CONFIG.db),
      orm: parseAsStringEnum(enumVals(OrmId)).withDefault(DEFAULT_CONFIG.orm),
      dbHosting: parseAsStringEnum(enumVals(DbHostingId)).withDefault(DEFAULT_CONFIG.dbHosting),
      auth: parseAsStringEnum(enumVals(AuthId)).withDefault(DEFAULT_CONFIG.auth),
      deploy: parseAsStringEnum(enumVals(DeployId)).withDefault(DEFAULT_CONFIG.deploy),
      pm: parseAsStringEnum(enumVals(PackageManagerId)).withDefault(DEFAULT_CONFIG.pm),
      ui: parseAsStringEnum(enumVals(UiId)).withDefault(DEFAULT_CONFIG.ui),
      modules: parseAsArrayOf(parseAsStringEnum(enumVals({ options: MODULE_IDS }))).withDefault(
        DEFAULT_CONFIG.modules,
      ),
      examples: parseAsArrayOf(parseAsStringEnum(enumVals(ExampleId))).withDefault(
        DEFAULT_CONFIG.examples,
      ),
      addons: parseAsArrayOf(parseAsStringEnum(enumVals(AddonId))).withDefault(
        DEFAULT_CONFIG.addons,
      ),
      oxlintStrict: parseAsBoolean.withDefault(DEFAULT_CONFIG.oxlintStrict),
      lefthookCi: parseAsBoolean.withDefault(DEFAULT_CONFIG.lefthookCi),
      lefthookAdvanced: parseAsBoolean.withDefault(DEFAULT_CONFIG.lefthookAdvanced),
      git: parseAsBoolean.withDefault(DEFAULT_CONFIG.git),
      install: parseAsBoolean.withDefault(DEFAULT_CONFIG.install),
    },
    { history: "replace", urlKeys: {} },
  );

  const config: ProjectConfig = {
    projectName: state.name as ProjectConfig["projectName"],
    preset: state.preset as ProjectConfig["preset"],
    frontend: state.frontend as ProjectConfig["frontend"],
    mobile: state.mobile as ProjectConfig["mobile"],
    desktop: state.desktop as ProjectConfig["desktop"],
    backend: state.backend as ProjectConfig["backend"],
    runtime: state.runtime as ProjectConfig["runtime"],
    api: state.api as ProjectConfig["api"],
    db: state.db as ProjectConfig["db"],
    orm: state.orm as ProjectConfig["orm"],
    dbHosting: state.dbHosting as ProjectConfig["dbHosting"],
    auth: state.auth as ProjectConfig["auth"],
    deploy: state.deploy as ProjectConfig["deploy"],
    pm: state.pm as ProjectConfig["pm"],
    ui: state.ui as ProjectConfig["ui"],
    modules: state.modules as ProjectConfig["modules"],
    examples: state.examples as ProjectConfig["examples"],
    addons: state.addons as ProjectConfig["addons"],
    oxlintStrict: state.oxlintStrict,
    lefthookCi: state.lefthookCi,
    lefthookAdvanced: state.lefthookAdvanced,
    git: state.git,
    install: state.install,
  };

  return { config, basePreset: state.basePreset, setState };
}

export type StackSetter = ReturnType<typeof useStackConfig>["setState"];
