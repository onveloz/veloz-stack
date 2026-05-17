import { NodeSDK } from "@opentelemetry/sdk-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";

let sdk: NodeSDK | undefined;
let shutdownHandlersRegistered = false;

/**
 * Inicia export de traces OTLP (HTTP). Configure OTEL_EXPORTER_OTLP_ENDPOINT e OTEL_SERVICE_NAME.
 * Seguro chamar mais de uma vez — só inicializa na primeira chamada.
 */
export function initTelemetry(): void {
  if (sdk) return;
  try {
    sdk = new NodeSDK({
      traceExporter: new OTLPTraceExporter(),
    });
    sdk.start();
  } catch (err) {
    console.error("[telemetry]", err);
  }
}

/**
 * Encerra o SDK com flush de spans pendentes. Idempotente.
 */
export async function shutdownTelemetry(): Promise<void> {
  if (!sdk) return;
  const active = sdk;
  sdk = undefined;
  try {
    await active.shutdown();
  } catch (err) {
    console.error("[telemetry] shutdown error:", err);
  }
}

/**
 * Registra SIGTERM/SIGINT para flush de traces antes do exit do processo.
 */
export function registerTelemetryShutdownHandlers(): void {
  if (shutdownHandlersRegistered) return;
  shutdownHandlersRegistered = true;

  const onSignal = (signal: NodeJS.Signals) => {
    void shutdownTelemetry().finally(() => {
      process.exit(signal === "SIGINT" ? 130 : 0);
    });
  };

  process.once("SIGTERM", () => onSignal("SIGTERM"));
  process.once("SIGINT", () => onSignal("SIGINT"));
}
