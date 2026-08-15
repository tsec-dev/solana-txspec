# Solana SafeSign

Solana SafeSign is an open, reproducible test corpus for transaction explanations. It gives wallet teams harmless unsigned transactions with machine-readable expected findings, so they can test whether risky effects are shown clearly before a user signs.

The first release is deliberately small: six deterministic legacy and v0 fixtures covering SOL transfers, delegate approvals, authority changes, account closure, Token-2022, and a risky instruction placed late in a bundle.

## Why this exists

Wallet safety behavior is difficult to compare when every team maintains private examples and subjective screenshots. SafeSign separates the transaction corpus from any wallet UI. A wallet, simulator, explorer, or security tool can consume the same fixtures and assert its own presentation behavior against a stable set of expected effects.

SafeSign is not a wallet ranking, an audit, or a guarantee that a transaction is safe.

## Quick start

Requirements: Node.js 22 or newer.

```bash
npm install
npm run check
npm run build
```

Inspect one fixture:

```bash
npx tsx src/cli.ts inspect fixtures/v0.1/v0-risky-instruction-late.json
```

Analyze an unsigned serialized transaction:

```bash
npx tsx src/cli.ts analyze legacy '<base64-transaction>'
```

## Fixture contract

Every JSON fixture contains:

- an unsigned serialized Solana transaction;
- its legacy or v0 message format;
- expected semantic finding codes and instruction positions;
- explicit safety flags forbidding broadcast;
- only deterministic disposable addresses;
- links to relevant Solana documentation.

The schema intentionally rejects mainnet fixtures and anything marked as broadcastable. See [docs/SPEC.md](docs/SPEC.md) for the full v0.1 contract.

## Safety

Never paste a seed phrase or private key into this project. The committed transactions are unsigned, use disposable public keys, and are intended for static analysis or isolated localnet testing. Do not broadcast them. See [SECURITY.md](SECURITY.md).

## Project status

This is an experimental grant-ready proof of concept, not production security infrastructure. The proposed route to a useful public good is documented in [docs/ROADMAP.md](docs/ROADMAP.md).

The grant proposal's measurable commitments are published separately:

- [Goals, milestones, completion evidence, and budget](docs/GRANT_MILESTONES.md)
- [Primary KPI, success threshold, and reporting plan](docs/GRANT_KPI.md)

Contributions are welcome under the MIT license.
