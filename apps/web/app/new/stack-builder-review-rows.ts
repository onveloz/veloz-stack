import type { ProjectConfig } from "@veloz-stack/types";

import {
  labelsApi,
  labelsAuth,
  labelsBackend,
  labelsDbHost,
  labelsDeploy,
  labelsFrontend,
  titleCase,
} from "./stack-builder-labels";

export function buildReviewRows(config: ProjectConfig) {
  return [
    {
      key: "frontend",
      label: "Frontend",
      value: labelsFrontend(config.frontend),
    },
    { key: "backend", label: "Backend", value: labelsBackend(config.backend) },
    { key: "runtime", label: "Runtime", value: titleCase(config.runtime) },
    { key: "api", label: "API", value: labelsApi(config.api) },
    {
      key: "db",
      label: "Banco",
      value:
        config.db === "none"
          ? titleCase(config.db)
          : `${titleCase(config.db)}${config.dbHosting !== "none" ? ` · ${labelsDbHost(config.dbHosting)}` : ""}`,
    },
    { key: "auth", label: "Auth", value: labelsAuth(config.auth) },
    { key: "deploy", label: "Deploy", value: labelsDeploy(config.deploy) },
    {
      key: "modules",
      label: "Módulos",
      value: `${config.modules.length} ativos`,
    },
    {
      key: "addons",
      label: "Ferramentas",
      value: config.addons.join(", ") || "—",
    },
  ];
}
