"use client";

import { useState } from "react";

/** Ids we know have no real brand (concept modules). Skip image fetch. */
const CONCEPTS = new Set<string>([
  "cpf-cnpj",
  "lgpd-consent",
  "pt-br-i18n",
  "better-auth-social",
  "pino",
  "opentelemetry",
  "next-intl",
  "oxlint",
]);

/** Ids whose logo file is a PNG, not SVG. Keeps us from the silent 404 roundtrip. */
const PNG_IDS = new Set<string>([
  "abacatepay",
  "ararahq-sms",
  "ararahq-wa",
  "himetrica",
  "brasilapi",
  "viacep",
  "orpc",
]);

export function BrandLogo({
  id,
  label,
  height = 32,
  className,
}: {
  id: string;
  label: string;
  height?: number;
  className?: string;
}) {
  const [errored, setErrored] = useState(false);

  if (CONCEPTS.has(id) || errored) {
    return (
      <span
        aria-hidden
        className={
          "inline-flex items-center justify-center text-brand font-heading font-bold shrink-0 " +
          (className ?? "")
        }
        style={{
          height,
          minWidth: height,
          fontSize: height * 0.6,
          lineHeight: 1,
        }}
      >
        {label[0]?.toUpperCase() ?? "?"}
      </span>
    );
  }

  const ext = PNG_IDS.has(id) ? "png" : "svg";
  const src = `/logos/${id}.${ext}`;

  return (
    <img
      src={src}
      alt={label}
      className={"shrink-0 block " + (className ?? "")}
      style={{ height, width: "auto" }}
      onError={() => setErrored(true)}
    />
  );
}
