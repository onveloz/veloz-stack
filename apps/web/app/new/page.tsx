import dynamic from "next/dynamic";
import { Suspense } from "react";
import { StackBuilderSkeleton } from "./stack-builder-skeleton";

const StackBuilder = dynamic(
  () => import("./stack-builder").then((m) => m.StackBuilder),
  { ssr: false, loading: () => <StackBuilderSkeleton /> },
);

export const metadata = {
  title: "Build your stack — Veloz Stack",
};

export default function NewPage() {
  return (
    <Suspense fallback={<StackBuilderSkeleton />}>
      <StackBuilder />
    </Suspense>
  );
}
