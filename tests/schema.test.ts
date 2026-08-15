import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import { fixtureSchema } from "../src/schema.js";

async function example(): Promise<Record<string, unknown>> {
  return JSON.parse(
    await readFile(resolve("fixtures/v0.1/legacy-sol-transfer.json"), "utf8"),
  ) as Record<string, unknown>;
}

describe("fixture schema safety rails", () => {
  it("rejects mainnet fixtures", async () => {
    const fixture = await example();
    expect(() => fixtureSchema.parse({ ...fixture, cluster: "mainnet-beta" })).toThrow();
  });

  it("rejects broadcast permission", async () => {
    const fixture = await example();
    expect(() =>
      fixtureSchema.parse({
        ...fixture,
        safety: { ...(fixture.safety as object), broadcastAllowed: true },
      }),
    ).toThrow();
  });

  it("rejects malformed base64", async () => {
    const fixture = await example();
    expect(() =>
      fixtureSchema.parse({ ...fixture, transactionBase64: "not base64!" }),
    ).toThrow();
  });
});
