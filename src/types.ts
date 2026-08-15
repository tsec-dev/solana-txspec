export const findingCodes = [
  "SOL_TRANSFER",
  "TOKEN_TRANSFER",
  "TOKEN_DELEGATE_APPROVAL",
  "TOKEN_AUTHORITY_CHANGE",
  "TOKEN_ACCOUNT_CLOSE",
  "UNKNOWN_SYSTEM_INSTRUCTION",
  "UNKNOWN_TOKEN_INSTRUCTION",
  "UNKNOWN_PROGRAM",
  "RISKY_INSTRUCTION_LATE_IN_BUNDLE",
] as const;

export type FindingCode = (typeof findingCodes)[number];
export type Severity = "info" | "low" | "medium" | "high" | "critical";
export type TransactionFormat = "legacy" | "v0";
export type SafeCluster = "localnet" | "devnet";

export interface Finding {
  code: FindingCode;
  severity: Severity;
  instructionIndex: number;
  summary: string;
  details?: Record<string, string | number | boolean | null>;
}

export interface AnalysisResult {
  format: TransactionFormat;
  instructionCount: number;
  findings: Finding[];
}

export interface ExpectedFinding {
  code: FindingCode;
  instructionIndex?: number;
}

export interface Fixture {
  specVersion: "0.1";
  id: string;
  title: string;
  description: string;
  cluster: SafeCluster;
  format: TransactionFormat;
  transactionBase64: string;
  expectedFindings: ExpectedFinding[];
  safety: {
    unsigned: true;
    broadcastAllowed: false;
    disposableAddresses: true;
  };
  references: string[];
}

export interface FixtureValidation {
  fixture: Fixture;
  analysis: AnalysisResult;
  errors: string[];
}
