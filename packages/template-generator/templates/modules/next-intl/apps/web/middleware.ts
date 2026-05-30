import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

/** @internal Scaffold export. */
export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};

