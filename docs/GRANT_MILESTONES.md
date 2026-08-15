# Grant goals and milestones

This plan covers the work proposed for a 10,000 USDG grant. It builds on the six-fixture proof of concept already available in this repository; the requested funding is for the additional deliverables below.

## Milestone 1 — Specification and initial corpus

**Target:** September 30, 2026

**Funding allocation:** 2,000 USDG

Finalize the SafeSign v0.2 fixture specification and expand the corpus from 6 to at least 15 reviewed scenarios. Coverage will include SOL and token transfers, delegate approvals, authority changes, account closures, Token-2022, unknown programs, and risky instructions placed inside multi-instruction transactions.

**Completion evidence:**

- Tagged GitHub release
- At least 15 published fixtures
- Updated fixture specification
- Automated tests and passing CI

## Milestone 2 — Complete corpus and developer tooling

**Target:** October 31, 2026

**Funding allocation:** 3,000 USDG

Expand the corpus to at least 25 carefully reviewed legacy and v0 scenarios across at least 10 safety categories. Improve the deterministic analyzer and publish a versioned CLI and npm package that wallet, explorer, and security-tool developers can use in their own testing.

**Completion evidence:**

- Public npm package and API documentation
- Tagged GitHub release
- At least 25 validated fixtures
- Automated tests and passing CI

## Milestone 3 — Non-broadcasting wallet test harness

**Target:** November 30, 2026

**Funding allocation:** 3,000 USDG

Build an open-source local harness for manually evaluating transaction previews. The harness will use disposable devnet accounts, request wallet review and signing, discard signed transaction data, and never submit signed transactions for confirmation. It will include prominent safety controls and a reproducible testing checklist.

The harness will not claim to inspect a closed-source wallet's interface automatically. Wallet warnings will be assessed through the documented manual protocol or by participating wallet maintainers using their own internal tests.

**Completion evidence:**

- Public harness source code
- Automated safety tests
- Setup and testing documentation
- Recorded demonstration

## Milestone 4 — Wallet evaluations and final report

**Target:** December 15, 2026

**Funding allocation:** 2,000 USDG

Use the harness and testing checklist to evaluate at least 10 representative scenarios across three Solana wallets. Publish the methodology, aggregate results, integration guidance, and final project report. Any potentially security-sensitive findings will be disclosed privately to affected teams before publication.

**Completion evidence:**

- Three documented wallet evaluations
- Published methodology and final report
- Integration guide
- Final tagged release

## End-of-project outcomes

By the project deadline, SafeSign will provide:

- At least 25 reviewed safety fixtures across 10 or more categories
- A deterministic analyzer, CLI, npm package, and CI workflow
- A non-broadcasting manual wallet-test harness
- Evaluations covering at least 10 scenarios and three wallets
- Public specifications, integration documentation, and a final report

All core fixtures, specifications, tooling, and results will remain openly available under the repository's MIT license.
