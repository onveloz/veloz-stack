import { Suspense } from "react";
import { StackBuilderClient } from "./stack-builder-client";
import { StackBuilderSkeleton } from "./stack-builder-skeleton";

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
