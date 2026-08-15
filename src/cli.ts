#!/usr/bin/env node

import { resolve } from "node:path";

import { analyzeTransaction } from "./analyze.js";
import { findFixtureFiles, loadFixture, validateFixture } from "./fixtures.js";
import type { TransactionFormat } from "./types.js";

function usage(): never {
  console.error(`Usage:
  txspec validate [fixture-directory]
  txspec inspect <fixture.json>
  txspec analyze <legacy|v0> <transaction-base64>`);
  process.exit(2);
}

async function validateCommand(directory = "fixtures"): Promise<void> {
  const files = await findFixtureFiles(directory);
  if (files.length === 0) throw new Error(`No JSON fixtures found in ${directory}`);

  let failures = 0;
  for (const file of files) {
    try {
      const fixture = await loadFixture(file);
      const result = validateFixture(fixture);
      if (result.errors.length === 0) {
        console.log(`PASS ${fixture.id}`);
      } else {
        failures += 1;
        console.error(`FAIL ${fixture.id}: ${result.errors.join("; ")}`);
      }
    } catch (error) {
      failures += 1;
      console.error(
        `FAIL ${file}: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  console.log(`${files.length - failures}/${files.length} fixtures valid`);
  if (failures > 0) process.exitCode = 1;
}

async function main(): Promise<void> {
  const [command, ...args] = process.argv.slice(2);
  if (command === "validate") {
    await validateCommand(args[0]);
    return;
  }

  if (command === "inspect") {
    if (!args[0]) usage();
    const fixture = await loadFixture(resolve(args[0]));
    console.log(JSON.stringify(validateFixture(fixture), null, 2));
    return;
  }

  if (command === "analyze") {
    const [format, transactionBase64] = args;
    if ((format !== "legacy" && format !== "v0") || !transactionBase64) usage();
    console.log(
      JSON.stringify(
        analyzeTransaction(transactionBase64, format as TransactionFormat),
        null,
        2,
      ),
    );
    return;
  }

  usage();
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
