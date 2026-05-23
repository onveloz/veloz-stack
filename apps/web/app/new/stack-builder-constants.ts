export type StepId = "platform" | "data" | "brazil" | "tools" | "review";
export type BuilderMode = "quick" | "full";

export const STEPS: { id: StepId; label: string; short: string }[] = [
  { id: "platform", label: "Plataforma", short: "App & API" },
  { id: "data", label: "Dados & deploy", short: "DB · auth" },
  { id: "brazil", label: "Integrações", short: "Módulos" },
  { id: "tools", label: "Ferramentas", short: "DX · exemplos" },
  { id: "review", label: "Revisar", short: "Comando" },
];

export const QUICK_STEPS: StepId[] = ["platform", "brazil", "tools", "review"];

export const MODULE_FILTERS = [
  { id: "all", label: "Todos" },
  { id: "payments", label: "PIX" },
  { id: "messaging", label: "SMS" },
  { id: "identity", label: "CEP/CPF" },
  { id: "compliance", label: "LGPD/NFe" },
  { id: "i18n", label: "i18n" },
  { id: "analytics", label: "Analytics" },
  { id: "security", label: "Segurança" },
] as const;
