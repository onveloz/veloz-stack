import { Suspense } from "react";
import { StackBuilder } from "./stack-builder";

export const metadata = {
  title: "Build your stack — Veloz Stack",
};

export default function NewPage() {
  return (
    <Suspense fallback={null}>
      <StackBuilder />
    </Suspense>
  );
}
