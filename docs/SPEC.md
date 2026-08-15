# SafeSign fixture specification v0.1

Each fixture is a strict JSON object. Unknown fields are rejected so typos cannot silently alter the meaning of a test.

| Field | Meaning |
| --- | --- |
| `specVersion` | Literal `0.1`. |
| `id` | Stable kebab-case identifier. |
| `title` / `description` | Human-readable intent. |
| `cluster` | `localnet` or `devnet`; mainnet is forbidden. |
| `format` | `legacy` or `v0`. |
| `transactionBase64` | Canonical padded base64 containing the full unsigned transaction. |
| `expectedFindings` | Finding codes, optionally pinned to instruction indexes. |
| `safety` | Literal flags: unsigned, not broadcastable, disposable addresses. |
| `references` | Primary documentation URLs supporting the fixture semantics. |

## Validation semantics

A fixture passes when its signature array contains only zero bytes, every expected finding is emitted, and the analyzer emits no additional finding code absent from the fixture. This makes additions to the analyzer visible rather than silently changing corpus behavior.

Finding codes in v0.1:

- `SOL_TRANSFER`
- `TOKEN_TRANSFER`
- `TOKEN_DELEGATE_APPROVAL`
- `TOKEN_AUTHORITY_CHANGE`
- `TOKEN_ACCOUNT_CLOSE`
- `UNKNOWN_SYSTEM_INSTRUCTION`
- `UNKNOWN_TOKEN_INSTRUCTION`
- `UNKNOWN_PROGRAM`
- `RISKY_INSTRUCTION_LATE_IN_BUNDLE`

Amounts are raw integers. The v0.1 analyzer does not fetch RPC state, token decimals, prices, or labels. That keeps results deterministic and prevents a passing test from depending on a third-party service.

## Reproducibility

Run `npm run fixtures:generate` and then `git diff --exit-code fixtures/`. The generator uses fixed disposable public keys and a fixed recent blockhash. It contains no secret key material and does not contact an RPC node.
