import { readFile, readdir } from "node:fs/promises";
import { extname, resolve } from "node:path";

import { fixtureSchema } from "./schema.js";
import { analyzeTransaction } from "./analyze.js";
import type { Fixture, FixtureValidation } from "./types.js";

function hasNonzeroSignature(transactionBase64: string): boolean {
  const bytes = Buffer.from(transactionBase64, "base64");
  let signatureCount = 0;
  let shift = 0;
  let offset = 0;

  while (offset < bytes.length) {
    const current = bytes[offset];
    if (current === undefined) throw new Error("Missing transaction signature count");
    signatureCount |= (current & 0x7f) << shift;
    offset += 1;
    if ((current & 0x80) === 0) break;
    shift += 7;
    if (shift > 21) throw new Error("Invalid transaction signature count");
  }

  const signatureBytes = signatureCount * 64;
  if (offset + signatureBytes > bytes.length) {
    throw new Error("Truncated transaction signature array");
  }
  return bytes.subarray(offset, offset + signatureBytes).some((byte) => byte !== 0);
}

export async function loadFixture(path: string): Promise<Fixture> {
  const raw = await readFile(path, "utf8");
  return fixtureSchema.parse(JSON.parse(raw)) as Fixture;
}

export async function findFixtureFiles(path: string): Promise<string[]> {
  const absolute = resolve(path);
  const entries = await readdir(absolute, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map(async (entry) => {
      const child = resolve(absolute, entry.name);
      if (entry.isDirectory()) return findFixtureFiles(child);
      if (entry.isFile() && extname(entry.name) === ".json") return [child];
      return [];
    }),
  );
  return nested.flat().sort();
}

export function validateFixture(fixture: Fixture): FixtureValidation {
  const analysis = analyzeTransaction(fixture.transactionBase64, fixture.format);
  const errors: string[] = [];

  if (hasNonzeroSignature(fixture.transactionBase64)) {
    errors.push("transaction contains a nonzero signature");
  }

  for (const expected of fixture.expectedFindings) {
    const matched = analysis.findings.some(
      (finding) =>
        finding.code === expected.code &&
        (expected.instructionIndex === undefined ||
          finding.instructionIndex === expected.instructionIndex),
    );
    if (!matched) {
      const location =
        expected.instructionIndex === undefined
          ? ""
          : ` at instruction ${expected.instructionIndex}`;
      errors.push(`missing ${expected.code}${location}`);
    }
  }

  const expectedCodes = new Set(fixture.expectedFindings.map((item) => item.code));
  for (const finding of analysis.findings) {
    if (!expectedCodes.has(finding.code)) {
      errors.push(
        `unexpected ${finding.code} at instruction ${finding.instructionIndex}`,
      );
    }
  }

  return { fixture, analysis, errors };
}
