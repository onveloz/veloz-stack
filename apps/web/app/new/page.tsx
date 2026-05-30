import { Suspense } from "react";
import { StackBuilderClient } from "./stack-builder-client";
import { StackBuilderSkeleton } from "./stack-builder-skeleton";

/** @internal Scaffold export. */
export const metadata = {
  title: "Build your stack — Veloz Stack",
};

export default function NewPage() {
  return (
    <Suspense fallback={<StackBuilderSkeleton />}>
      <StackBuilderClient />
    </Suspense>
  );
}
