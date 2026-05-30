"use client";

import dynamic from "next/dynamic";
import { StackBuilderSkeleton } from "./stack-builder-skeleton";

const StackBuilder = dynamic(
  () => import("./stack-builder").then((m) => m.StackBuilder),
  {
    ssr: false,
    loading: () => <StackBuilderSkeleton />,
  },
);

/** @internal Scaffold pipeline step. */
export function StackBuilderClient() {
  return <StackBuilder />;
}
