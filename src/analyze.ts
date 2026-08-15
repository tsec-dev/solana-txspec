import {
  PublicKey,
  SystemInstruction,
  SystemProgram,
  Transaction,
  TransactionMessage,
  VersionedTransaction,
  type TransactionInstruction,
} from "@solana/web3.js";

import type { AnalysisResult, Finding, TransactionFormat } from "./types.js";

const TOKEN_PROGRAM_ID = new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA");
const TOKEN_2022_PROGRAM_ID = new PublicKey("TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb");

const highRiskCodes = new Set([
  "TOKEN_DELEGATE_APPROVAL",
  "TOKEN_AUTHORITY_CHANGE",
  "TOKEN_ACCOUNT_CLOSE",
]);

const knownPassivePrograms = new Set([
  "ComputeBudget111111111111111111111111111111",
  "MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr",
  "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL",
]);

const authorityTypes = [
  "MintTokens",
  "FreezeAccount",
  "AccountOwner",
  "CloseAccount",
] as const;

function keyAt(instruction: TransactionInstruction, index: number): string | null {
  return instruction.keys[index]?.pubkey.toBase58() ?? null;
}

function analyzeSystemInstruction(
  instruction: TransactionInstruction,
  instructionIndex: number,
): Finding[] {
  try {
    const type = SystemInstruction.decodeInstructionType(instruction);
    if (type !== "Transfer") {
      return [
        {
          code: "UNKNOWN_SYSTEM_INSTRUCTION",
          severity: "medium",
          instructionIndex,
          summary: `System Program instruction ${type} is not decoded by TxSpec yet.`,
        },
      ];
    }

    const transfer = SystemInstruction.decodeTransfer(instruction);
    return [
      {
        code: "SOL_TRANSFER",
        severity: "high",
        instructionIndex,
        summary: `Transfers ${transfer.lamports.toString()} lamports.`,
        details: {
          from: transfer.fromPubkey.toBase58(),
          to: transfer.toPubkey.toBase58(),
          lamports: transfer.lamports.toString(),
        },
      },
    ];
  } catch {
    return [
      {
        code: "UNKNOWN_SYSTEM_INSTRUCTION",
        severity: "medium",
        instructionIndex,
        summary: "Malformed or unsupported System Program instruction.",
      },
    ];
  }
}

function readAmount(data: Buffer, offset = 1): string | null {
  if (data.length < offset + 8) return null;
  return data.readBigUInt64LE(offset).toString();
}

function analyzeTokenInstruction(
  instruction: TransactionInstruction,
  instructionIndex: number,
): Finding[] {
  const data = Buffer.from(instruction.data);
  const discriminator = data[0];
  const program = instruction.programId.equals(TOKEN_2022_PROGRAM_ID)
    ? "Token-2022"
    : "SPL Token";

  if (discriminator === 3 || discriminator === 12) {
    return [
      {
        code: "TOKEN_TRANSFER",
        severity: "high",
        instructionIndex,
        summary: `${program} instruction transfers tokens.`,
        details: {
          source: keyAt(instruction, 0),
          destination: keyAt(instruction, 1),
          authority: keyAt(instruction, discriminator === 12 ? 3 : 2),
          rawAmount: readAmount(data),
        },
      },
    ];
  }

  if (discriminator === 4 || discriminator === 13) {
    return [
      {
        code: "TOKEN_DELEGATE_APPROVAL",
        severity: "critical",
        instructionIndex,
        summary: `${program} instruction grants a delegate permission to spend tokens.`,
        details: {
          source: keyAt(instruction, 0),
          delegate: keyAt(instruction, 1),
          owner: keyAt(instruction, discriminator === 13 ? 3 : 2),
          rawAmount: readAmount(data),
        },
      },
    ];
  }

  if (discriminator === 6) {
    const authorityType = data[1];
    const hasNewAuthority = data.length >= 3 && data[2] === 1;
    const newAuthority =
      hasNewAuthority && data.length >= 35
        ? new PublicKey(data.subarray(3, 35)).toBase58()
        : null;
    return [
      {
        code: "TOKEN_AUTHORITY_CHANGE",
        severity: "critical",
        instructionIndex,
        summary: `${program} instruction changes or revokes an authority.`,
        details: {
          account: keyAt(instruction, 0),
          currentAuthority: keyAt(instruction, 1),
          authorityType: authorityTypes[authorityType ?? -1] ?? `Unknown(${authorityType ?? "missing"})`,
          newAuthority,
        },
      },
    ];
  }

  if (discriminator === 9) {
    return [
      {
        code: "TOKEN_ACCOUNT_CLOSE",
        severity: "high",
        instructionIndex,
        summary: `${program} instruction closes a token account and sends its rent balance away.`,
        details: {
          account: keyAt(instruction, 0),
          destination: keyAt(instruction, 1),
          owner: keyAt(instruction, 2),
        },
      },
    ];
  }

  return [
    {
      code: "UNKNOWN_TOKEN_INSTRUCTION",
      severity: "medium",
      instructionIndex,
      summary: `${program} discriminator ${discriminator ?? "missing"} is not decoded by TxSpec yet.`,
    },
  ];
}

function decompile(transactionBase64: string, format: TransactionFormat): TransactionInstruction[] {
  const serialized = Buffer.from(transactionBase64, "base64");
  if (format === "legacy") {
    return Transaction.from(serialized).instructions;
  }

  const transaction = VersionedTransaction.deserialize(serialized);
  return TransactionMessage.decompile(transaction.message).instructions;
}

export function analyzeTransaction(
  transactionBase64: string,
  format: TransactionFormat,
): AnalysisResult {
  const instructions = decompile(transactionBase64, format);
  const findings: Finding[] = [];

  instructions.forEach((instruction, instructionIndex) => {
    if (instruction.programId.equals(SystemProgram.programId)) {
      findings.push(...analyzeSystemInstruction(instruction, instructionIndex));
      return;
    }

    if (
      instruction.programId.equals(TOKEN_PROGRAM_ID) ||
      instruction.programId.equals(TOKEN_2022_PROGRAM_ID)
    ) {
      findings.push(...analyzeTokenInstruction(instruction, instructionIndex));
      return;
    }

    if (!knownPassivePrograms.has(instruction.programId.toBase58())) {
      findings.push({
        code: "UNKNOWN_PROGRAM",
        severity: "medium",
        instructionIndex,
        summary: `Instruction invokes unrecognized program ${instruction.programId.toBase58()}.`,
        details: { programId: instruction.programId.toBase58() },
      });
    }
  });

  const lastInstructionIndex = instructions.length - 1;
  if (
    instructions.length >= 3 &&
    findings.some(
      (finding) =>
        finding.instructionIndex === lastInstructionIndex && highRiskCodes.has(finding.code),
    )
  ) {
    findings.push({
      code: "RISKY_INSTRUCTION_LATE_IN_BUNDLE",
      severity: "high",
      instructionIndex: lastInstructionIndex,
      summary: "A high-risk token instruction appears at the end of a multi-instruction transaction.",
    });
  }

  return { format, instructionCount: instructions.length, findings };
}
