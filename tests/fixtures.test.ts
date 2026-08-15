import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import { findFixtureFiles, loadFixture, validateFixture } from "../src/fixtures.js";

describe("committed fixture corpus", () => {
  it("contains at least six fixtures and every expectation matches", async () => {
    const files = await findFixtureFiles(resolve("fixtures/v0.1"));
    expect(files.length).toBeGreaterThanOrEqual(6);

    for (const file of files) {
      const fixture = await loadFixture(file);
      expect(validateFixture(fixture).errors, fixture.id).toEqual([]);
    }
  });

  it("rejects a transaction containing signature bytes", async () => {
    const fixture = await loadFixture(
      resolve("fixtures/v0.1/legacy-sol-transfer.json"),
    );
    const bytes = Buffer.from(fixture.transactionBase64, "base64");
    bytes[1] = 1;

    const result = validateFixture({
      ...fixture,
      transactionBase64: bytes.toString("base64"),
    });
    expect(result.errors).toContain("transaction contains a nonzero signature");
  });
});
