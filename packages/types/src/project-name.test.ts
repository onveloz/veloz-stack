import { describe, expect, it } from "vitest";
import {
  projectNameValidationError,
  sanitizeProjectName,
} from "./project-name";

describe("sanitizeProjectName", () => {
  it("lowercases while keeping allowed separators", () => {
    expect(sanitizeProjectName("My_App")).toBe("my_app");
  });

  it("strips leading underscores and trailing hyphens", () => {
    expect(sanitizeProjectName("_Foo.Bar!")).toBe("foo-bar");
  });

  it("falls back when input is only symbols", () => {
    expect(sanitizeProjectName("@@@")).toBe("my-veloz-stack");
  });
});

describe("projectNameValidationError", () => {
  it("accepts valid slugs", () => {
    expect(projectNameValidationError("my-app")).toBeNull();
  });

  it("rejects names starting with underscore", () => {
    expect(projectNameValidationError("_bad")).not.toBeNull();
  });

  it("accepts sanitized output from messy input", () => {
    const name = sanitizeProjectName("_Foo.Bar!");
    expect(projectNameValidationError(name)).toBeNull();
  });
});
