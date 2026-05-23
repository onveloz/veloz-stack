import type { ProjectConfig, VelozStackConfigFile } from "./project-config";
import {
  VELOZ_STACK_CONFIG_FILENAME,
  VELOZ_STACK_CONFIG_SCHEMA_URL,
} from "@veloz-stack/types";
import { buildReproducibleCommand } from "./utils/reproducible-command";
import type { VirtualFs } from "./vfs";

function toVelozStackConfig(
  config: ProjectConfig,
  cliVersion: string,
): VelozStackConfigFile {
  return {
    $schema: VELOZ_STACK_CONFIG_SCHEMA_URL,
    version: cliVersion,
    createdAt: new Date().toISOString(),
    reproducibleCommand: buildReproducibleCommand(config),
    preset: config.preset,
    frontend: config.frontend,
    mobile: config.mobile,
    desktop: config.desktop,
    backend: config.backend,
    runtime: config.runtime,
    api: config.api,
    db: config.db,
    orm: config.orm,
    dbHosting: config.dbHosting,
    auth: config.auth,
    deploy: config.deploy,
    pm: config.pm,
    ui: config.ui,
    examples: config.examples,
    modules: config.modules,
    addons: config.addons,
    oxlintStrict: config.oxlintStrict,
    lefthookCi: config.lefthookCi,
    lefthookAdvanced: config.lefthookAdvanced,
  };
}

const FILE_HEADER = `// Veloz Stack — stack manifest (safe to delete for day-to-day dev)
// Docs: https://www.veloz-stack.com/docs
// Builder: https://www.veloz-stack.com/new
// Showcase: https://www.veloz-stack.com/showcase
`;

/** @internal Scaffold pipeline step. */
export function writeVelozStackConfigToVfs(
  vfs: VirtualFs,
  config: ProjectConfig,
  cliVersion: string,
): void {
  const body = toVelozStackConfig(config, cliVersion);
  const json = JSON.stringify(body, null, 2);
  vfs.write(VELOZ_STACK_CONFIG_FILENAME, `${FILE_HEADER + json}\n`);
}
