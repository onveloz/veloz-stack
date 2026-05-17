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

const enumVals = <T extends readonly [string, ...string[]]>(e: { options: T }) =>
  e.options as unknown as T;

export function useStackConfig() {
  const [state, setState] = useQueryStates(
    {
      name: parseAsString.withDefault(DEFAULT_CONFIG.projectName),
      preset: parseAsStringEnum(enumVals(PresetId)).withDefault(DEFAULT_CONFIG.preset),
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
      modules: parseAsArrayOf(parseAsStringEnum([...MODULE_IDS])).withDefault(
        DEFAULT_CONFIG.modules,
      ),
      examples: parseAsArrayOf(parseAsStringEnum(enumVals(ExampleId))).withDefault(
        DEFAULT_CONFIG.examples,
      ),
      addons: parseAsArrayOf(parseAsStringEnum(enumVals(AddonId))).withDefault(
        DEFAULT_CONFIG.addons,
      ),
      oxlintStrict: parseAsBoolean.withDefault(DEFAULT_CONFIG.oxlintStrict),
      git: parseAsBoolean.withDefault(DEFAULT_CONFIG.git),
      install: parseAsBoolean.withDefault(DEFAULT_CONFIG.install),
    },
    { history: "replace", urlKeys: {} },
  );

  const config: ProjectConfig = {
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
    git: state.git,
    install: state.install,
  };

  return { config, setState };
}

export type StackSetter = ReturnType<typeof useStackConfig>["setState"];
