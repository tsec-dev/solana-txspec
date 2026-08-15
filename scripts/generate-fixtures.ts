import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

import {
  ComputeBudgetProgram,
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionInstruction,
  TransactionMessage,
  VersionedTransaction,
  type TransactionInstruction as Web3Instruction,
} from "@solana/web3.js";

import type { Fixture } from "../src/types.js";

const outputDirectory = resolve("fixtures/v0.1");
const blockhash = "11111111111111111111111111111111";
const memoProgram = new PublicKey("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr");
const tokenProgram = new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA");
const token2022Program = new PublicKey("TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb");

function key(seed: number): PublicKey {
  return new PublicKey(Uint8Array.from({ length: 32 }, (_, index) => (seed + index) % 256));
}

const payer = key(1);
const recipient = key(41);
const tokenAccount = key(81);
const delegate = key(121);
const owner = key(161);
const replacementAuthority = key(201);

function approveInstruction(
  account: PublicKey,
  approvedDelegate: PublicKey,
  accountOwner: PublicKey,
  amount: bigint,
  programId = tokenProgram,
): TransactionInstruction {
  const data = Buffer.alloc(9);
  data[0] = 4;
  data.writeBigUInt64LE(amount, 1);
  return new TransactionInstruction({
    programId,
    keys: [
      { pubkey: account, isSigner: false, isWritable: true },
      { pubkey: approvedDelegate, isSigner: false, isWritable: false },
      { pubkey: accountOwner, isSigner: true, isWritable: false },
    ],
    data,
  });
}

function setAccountOwnerInstruction(
  account: PublicKey,
  currentOwner: PublicKey,
  newOwner: PublicKey,
): TransactionInstruction {
  const data = Buffer.concat([Buffer.from([6, 2, 1]), newOwner.toBuffer()]);
  return new TransactionInstruction({
    programId: tokenProgram,
    keys: [
      { pubkey: account, isSigner: false, isWritable: true },
      { pubkey: currentOwner, isSigner: true, isWritable: false },
    ],
    data,
  });
}

function closeAccountInstruction(
  account: PublicKey,
  destination: PublicKey,
  accountOwner: PublicKey,
): TransactionInstruction {
  return new TransactionInstruction({
    programId: tokenProgram,
    keys: [
      { pubkey: account, isSigner: false, isWritable: true },
      { pubkey: destination, isSigner: false, isWritable: true },
      { pubkey: accountOwner, isSigner: true, isWritable: false },
    ],
    data: Buffer.from([9]),
  });
}

function legacy(...instructions: Web3Instruction[]): string {
  const transaction = new Transaction({ feePayer: payer, recentBlockhash: blockhash });
  transaction.add(...instructions);
  return Buffer.from(
    transaction.serialize({ requireAllSignatures: false, verifySignatures: false }),
  ).toString("base64");
}

function v0(...instructions: Web3Instruction[]): string {
  const message = new TransactionMessage({
    payerKey: payer,
    recentBlockhash: blockhash,
    instructions,
  }).compileToV0Message();
  return Buffer.from(new VersionedTransaction(message).serialize()).toString("base64");
}

const safety = {
  unsigned: true,
  broadcastAllowed: false,
  disposableAddresses: true,
} as const;

const tokenReference = "https://solana.com/docs/tokens/basics/set-authority";
const transactionReference = "https://solana.com/docs/core/transactions";

const fixtures: Fixture[] = [
  {
    specVersion: "0.1",
    id: "legacy-sol-transfer",
    title: "Legacy SOL transfer",
    description: "A plain legacy transaction transferring 0.25 SOL between disposable addresses.",
    cluster: "localnet",
    format: "legacy",
    transactionBase64: legacy(
      SystemProgram.transfer({ fromPubkey: payer, toPubkey: recipient, lamports: 250_000_000 }),
    ),
    expectedFindings: [{ code: "SOL_TRANSFER", instructionIndex: 0 }],
    safety,
    references: [transactionReference],
  },
  {
    specVersion: "0.1",
    id: "legacy-token-delegate-approval",
    title: "Legacy SPL Token delegate approval",
    description: "Grants a delegate permission to spend 100,000,000 raw token units.",
    cluster: "localnet",
    format: "legacy",
    transactionBase64: legacy(
      approveInstruction(tokenAccount, delegate, owner, 100_000_000n),
    ),
    expectedFindings: [{ code: "TOKEN_DELEGATE_APPROVAL", instructionIndex: 0 }],
    safety,
    references: [tokenReference],
  },
  {
    specVersion: "0.1",
    id: "legacy-token-authority-change",
    title: "Legacy SPL Token authority change",
    description: "Changes a disposable token account owner to another disposable address.",
    cluster: "localnet",
    format: "legacy",
    transactionBase64: legacy(
      setAccountOwnerInstruction(tokenAccount, owner, replacementAuthority),
    ),
    expectedFindings: [{ code: "TOKEN_AUTHORITY_CHANGE", instructionIndex: 0 }],
    safety,
    references: [tokenReference],
  },
  {
    specVersion: "0.1",
    id: "legacy-token-account-close",
    title: "Legacy SPL Token account close",
    description: "Closes a disposable token account and redirects its rent balance.",
    cluster: "localnet",
    format: "legacy",
    transactionBase64: legacy(closeAccountInstruction(tokenAccount, recipient, owner)),
    expectedFindings: [{ code: "TOKEN_ACCOUNT_CLOSE", instructionIndex: 0 }],
    safety,
    references: [tokenReference],
  },
  {
    specVersion: "0.1",
    id: "v0-token-2022-delegate-approval",
    title: "Versioned Token-2022 delegate approval",
    description: "A v0 transaction granting a delegate permission through the Token-2022 program.",
    cluster: "localnet",
    format: "v0",
    transactionBase64: v0(
      approveInstruction(tokenAccount, delegate, owner, 50_000_000n, token2022Program),
    ),
    expectedFindings: [{ code: "TOKEN_DELEGATE_APPROVAL", instructionIndex: 0 }],
    safety,
    references: [tokenReference],
  },
  {
    specVersion: "0.1",
    id: "v0-risky-instruction-late",
    title: "Versioned bundle with a late risky instruction",
    description: "A compute-budget and memo prelude followed by a delegate approval at the end.",
    cluster: "localnet",
    format: "v0",
    transactionBase64: v0(
      ComputeBudgetProgram.setComputeUnitLimit({ units: 200_000 }),
      new TransactionInstruction({
        programId: memoProgram,
        keys: [],
        data: Buffer.from("Routine wallet request", "utf8"),
      }),
      approveInstruction(tokenAccount, delegate, owner, 9_999_999n),
    ),
    expectedFindings: [
      { code: "TOKEN_DELEGATE_APPROVAL", instructionIndex: 2 },
      { code: "RISKY_INSTRUCTION_LATE_IN_BUNDLE", instructionIndex: 2 },
    ],
    safety,
    references: [transactionReference, tokenReference],
  },
];

await mkdir(outputDirectory, { recursive: true });
await Promise.all(
  fixtures.map((fixture) =>
    writeFile(
      resolve(outputDirectory, `${fixture.id}.json`),
      `${JSON.stringify(fixture, null, 2)}\n`,
      "utf8",
    ),
  ),
);

console.log(`Generated ${fixtures.length} fixtures in ${outputDirectory}`);
