# Grant success metric

## Primary KPI

The primary KPI is the **number of unique Solana transaction-safety scenarios that pass the complete SafeSign validation process**.

The current baseline is 6 scenarios. The grant target is at least **25 public scenarios across 10 or more safety categories** by December 15, 2026.

A scenario counts toward the KPI only when it passes every required gate:

1. Its unsigned transaction can be reproduced deterministically.
2. Its metadata passes the strict SafeSign fixture schema.
3. Its serialized signature array contains no nonzero signature bytes.
4. The analyzer produces every expected finding without undocumented extra findings.
5. Its automated tests pass in public GitHub Actions CI.

## Success threshold

The project will be considered successful when:

- At least 25 qualifying scenarios are public and passing CI.
- The scenarios cover at least 10 distinct safety categories.
- At least 10 representative scenarios have been manually evaluated against three Solana wallets using the non-broadcasting harness and published methodology.
- The CLI and developer library have been published as a versioned npm package.

The project will not have met its stated KPI if fewer than 25 scenarios pass the complete validation process or if the three-wallet evaluation is not completed by the deadline.

## Supporting indicators

These indicators will be tracked, but they are not required to count a fixture toward the primary KPI:

- npm downloads and unique package versions
- GitHub stars, forks, issues, and external pull requests
- Feedback or integration attempts from wallet, explorer, or security-tool developers
- References to SafeSign fixtures in another project's tests or documentation

## Proof and reporting

Progress and completion can be verified through:

- Versioned fixture files and tagged GitHub releases
- Public GitHub Actions results
- npm release records
- Wallet-evaluation methodology and reports
- The final grant completion report

The KPI deliberately emphasizes reproducible, inspectable artifacts rather than vanity metrics that are difficult for a new public-good project to control.
