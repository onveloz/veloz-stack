import {
  AddonId,
  ApiId,
  AuthId,
  BackendId,
  DbHostingId,
  DbId,
  DEFAULT_CONFIG,
  DeployId,
  DesktopId,
  ExampleId,
  FrontendId,
  MobileId,
  ModuleId,
  OrmId,
  PackageManagerId,
  PresetId,
  RuntimeId,
  UiId,
} from "@veloz-stack/types";
import {
  parseAsArrayOf,
  parseAsBoolean,
  parseAsString,
  parseAsStringEnum,
} from "nuqs";

function enumOptions(schema: {
  options: readonly string[];
}): [string, ...string[]] {
  const [first, ...rest] = schema.options;
  if (first === undefined) {
    throw new Error("Enum schema must have at least one option");
  }
  return [first, ...rest];
}

export const stackConfigParsers = {
  name: parseAsString.withDefault(DEFAULT_CONFIG.projectName),
  preset: parseAsStringEnum(enumOptions(PresetId)).withDefault(
    DEFAULT_CONFIG.preset,
  ),
  basePreset: parseAsStringEnum(enumOptions(PresetId)).withDefault(
    DEFAULT_CONFIG.preset,
  ),
  frontend: parseAsStringEnum(enumOptions(FrontendId)).withDefault(
    DEFAULT_CONFIG.frontend,
  ),
  mobile: parseAsStringEnum(enumOptions(MobileId)).withDefault(
    DEFAULT_CONFIG.mobile,
  ),
  desktop: parseAsStringEnum(enumOptions(DesktopId)).withDefault(
    DEFAULT_CONFIG.desktop,
  ),
  backend: parseAsStringEnum(enumOptions(BackendId)).withDefault(
    DEFAULT_CONFIG.backend,
  ),
  runtime: parseAsStringEnum(enumOptions(RuntimeId)).withDefault(
    DEFAULT_CONFIG.runtime,
  ),
  api: parseAsStringEnum(enumOptions(ApiId)).withDefault(DEFAULT_CONFIG.api),
  db: parseAsStringEnum(enumOptions(DbId)).withDefault(DEFAULT_CONFIG.db),
  orm: parseAsStringEnum(enumOptions(OrmId)).withDefault(DEFAULT_CONFIG.orm),
  dbHosting: parseAsStringEnum(enumOptions(DbHostingId)).withDefault(
    DEFAULT_CONFIG.dbHosting,
  ),
  auth: parseAsStringEnum(enumOptions(AuthId)).withDefault(DEFAULT_CONFIG.auth),
  deploy: parseAsStringEnum(enumOptions(DeployId)).withDefault(
    DEFAULT_CONFIG.deploy,
  ),
  pm: parseAsStringEnum(enumOptions(PackageManagerId)).withDefault(
    DEFAULT_CONFIG.pm,
  ),
  ui: parseAsStringEnum(enumOptions(UiId)).withDefault(DEFAULT_CONFIG.ui),
  modules: parseAsArrayOf(parseAsStringEnum(enumOptions(ModuleId))).withDefault(
    DEFAULT_CONFIG.modules,
  ),
  examples: parseAsArrayOf(
    parseAsStringEnum(enumOptions(ExampleId)),
  ).withDefault(DEFAULT_CONFIG.examples),
  addons: parseAsArrayOf(parseAsStringEnum(enumOptions(AddonId))).withDefault(
    DEFAULT_CONFIG.addons,
  ),
  oxlintStrict: parseAsBoolean.withDefault(DEFAULT_CONFIG.oxlintStrict),
  lefthookCi: parseAsBoolean.withDefault(DEFAULT_CONFIG.lefthookCi),
  lefthookAdvanced: parseAsBoolean.withDefault(DEFAULT_CONFIG.lefthookAdvanced),
  git: parseAsBoolean.withDefault(DEFAULT_CONFIG.git),
  install: parseAsBoolean.withDefault(DEFAULT_CONFIG.install),
};
