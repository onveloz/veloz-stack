import type { MiddlewareHandler } from "hono";
import pino, { type Logger } from "pino";

let root: Logger | null = null;

/** Structured logger for the Hono server (JSON em produção; pino-pretty só em NODE_ENV≠production). */
export function getLogger(): Logger {
  if (!root) {
    const level = process.env.LOG_LEVEL ?? "info";
    const isDev = process.env.NODE_ENV !== "production";
    root = pino({
      level,
      ...(isDev
        ? { transport: { target: "pino-pretty", options: { colorize: true } } }
        : {}),
    });
  }
  return root;
}

/** @internal Scaffold export. */
export const pinoMiddleware: MiddlewareHandler = async (c, next) => {
  const log = getLogger();
  const start = Date.now();
  try {
    await next();
    log.info({
      method: c.req.method,
      path: c.req.path,
      status: c.res.status,
      ms: Date.now() - start,
    });
  } catch (err) {
    log.error({
      err,
      method: c.req.method,
      path: c.req.path,
      ms: Date.now() - start,
    });
    throw err;
  }
};

