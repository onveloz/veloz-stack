"use client";

import { useState } from "react";

/** Ids we know have no real brand (concept modules). Skip image fetch. */
const CONCEPTS = new Set<string>([
  "cpf-cnpj",
  "lgpd-consent",
  "pt-br-i18n",
  "better-auth-social",
  "oxlint",
]);

/** Logo filename differs from option id (sync-logos / public assets). */
const LOGO_ALIASES: Record<string, string> = {
  expo: "native-expo",
};

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

/** Vendor or concept logo for stack-builder option chips; falls back to initials when no asset exists. */
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
        className={`inline-flex items-center justify-center text-brand font-heading font-bold shrink-0 ${
          className ?? ""
        }`}
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

  const fileId = LOGO_ALIASES[id] ?? id;
  const ext = PNG_IDS.has(fileId) ? "png" : "svg";
  const src = `/logos/${fileId}.${ext}`;

  return (
    <img
      src={src}
      alt={label}
      className={`shrink-0 block ${className ?? ""}`}
      style={{ height, width: "auto" }}
      onError={() => {
        setErrored(true);
      }}
    />
  );
}
