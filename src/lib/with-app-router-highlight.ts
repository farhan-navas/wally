import "server-only";

import { H } from "@highlight-run/next/server";
console.log("Highlight H in lib:", H);
import type { NextRequest } from "next/server";
// import { wrapAppRouterHandler } from "@highlight-run/next/client";

export function withAppRouterHighlight<
  Handler extends (req: NextRequest, ...args: unknown[]) => Promise<Response>,
>(handler: Handler) {
  return (req: NextRequest, ...args: unknown[]) => {
    return H.runWithHeaders("app-router-span", {}, () => handler(req, ...args));
  };
}

// export const withAppRouterHighlight = wrapAppRouterHandler;
