import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import { loadFixture, validateFixture } from "../src/fixtures.js";

describe("transaction analyzer", () => {
  it("detects a risky instruction hidden at the end of a v0 bundle", async () => {
    const fixture = await loadFixture(
      resolve("fixtures/v0.1/v0-risky-instruction-late.json"),
    );
    const result = validateFixture(fixture);
    expect(result.analysis.instructionCount).toBe(3);
    expect(result.analysis.findings.map((finding) => finding.code)).toEqual([
      "TOKEN_DELEGATE_APPROVAL",
      "RISKY_INSTRUCTION_LATE_IN_BUNDLE",
    ]);
  });
});
