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
  ApiId,
  AuthId,
  BackendId,
  DEFAULT_CONFIG,
  DbHostingId,
  DbId,
  DeployId,
  FrontendId,
  MODULE_IDS,
  OrmId,
  PackageManagerId,
  PresetId,
  RuntimeId,
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
      backend: parseAsStringEnum(enumVals(BackendId)).withDefault(DEFAULT_CONFIG.backend),
      runtime: parseAsStringEnum(enumVals(RuntimeId)).withDefault(DEFAULT_CONFIG.runtime),
      api: parseAsStringEnum(enumVals(ApiId)).withDefault(DEFAULT_CONFIG.api),
      db: parseAsStringEnum(enumVals(DbId)).withDefault(DEFAULT_CONFIG.db),
      orm: parseAsStringEnum(enumVals(OrmId)).withDefault(DEFAULT_CONFIG.orm),
      dbHosting: parseAsStringEnum(enumVals(DbHostingId)).withDefault(DEFAULT_CONFIG.dbHosting),
      auth: parseAsStringEnum(enumVals(AuthId)).withDefault(DEFAULT_CONFIG.auth),
      deploy: parseAsStringEnum(enumVals(DeployId)).withDefault(DEFAULT_CONFIG.deploy),
      pm: parseAsStringEnum(enumVals(PackageManagerId)).withDefault(DEFAULT_CONFIG.pm),
      modules: parseAsArrayOf(parseAsStringEnum([...MODULE_IDS])).withDefault(
        DEFAULT_CONFIG.modules,
      ),
      examples: parseAsArrayOf(parseAsStringEnum(enumVals(ExampleId))).withDefault(
        DEFAULT_CONFIG.examples,
      ),
      git: parseAsBoolean.withDefault(DEFAULT_CONFIG.git),
      install: parseAsBoolean.withDefault(DEFAULT_CONFIG.install),
    },
    { history: "replace", urlKeys: {} },
  );

  const config: ProjectConfig = {
    projectName: state.name,
    preset: state.preset,
    frontend: state.frontend,
    backend: state.backend,
    runtime: state.runtime,
    api: state.api,
    db: state.db,
    orm: state.orm,
    dbHosting: state.dbHosting,
    auth: state.auth,
    deploy: state.deploy,
    pm: state.pm,
    modules: state.modules,
    examples: state.examples,
    git: state.git,
    install: state.install,
  };

  return { config, setState };
}

export type StackSetter = ReturnType<typeof useStackConfig>["setState"];
