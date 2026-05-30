import { DEFAULT_CONFIG } from "@veloz-stack/types";
import { describe, expect, it } from "vitest";
import { buildCommand } from "./build-command";
import type { ProjectConfig } from "@/lib/veloz-stack-types";

const base: ProjectConfig = { ...DEFAULT_CONFIG };

describe("buildCommand", () => {
  it("sanitizes project names the same way as the CLI", () => {
    const cmd = buildCommand({
      ...base,
      projectName: "_Foo.Bar!",
    });
    expect(cmd).toContain("foo-bar");
    expect(cmd).not.toContain("Foo.Bar");
  });
});
