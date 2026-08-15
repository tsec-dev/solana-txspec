import { z } from "zod";

import { findingCodes } from "./types.js";

const base64Pattern = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/;

const expectedFindingSchema = z
  .object({
    code: z.enum(findingCodes),
    instructionIndex: z.number().int().nonnegative().optional(),
  })
  .strict();

export const fixtureSchema = z
  .object({
    specVersion: z.literal("0.1"),
    id: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    title: z.string().min(1).max(100),
    description: z.string().min(1).max(500),
    cluster: z.enum(["localnet", "devnet"]),
    format: z.enum(["legacy", "v0"]),
    transactionBase64: z
      .string()
      .min(1)
      .refine((value) => value.length % 4 === 0 && base64Pattern.test(value), {
        message: "must be canonical padded base64",
      }),
    expectedFindings: z.array(expectedFindingSchema).min(1),
    safety: z
      .object({
        unsigned: z.literal(true),
        broadcastAllowed: z.literal(false),
        disposableAddresses: z.literal(true),
      })
      .strict(),
    references: z.array(z.string().url()).min(1),
  })
  .strict();
