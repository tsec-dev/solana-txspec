# Security policy

TxSpec is experimental test infrastructure. It does not determine whether a transaction is safe and must not be treated as an audit or signing recommendation.

## Safe use

- Never enter, store, or commit seed phrases or private keys.
- Do not broadcast committed fixtures.
- Use static analysis or an isolated local validator with disposable accounts.
- Do not change a fixture to mainnet or mark it broadcastable.

## Reporting a problem

For parser bugs that do not expose an active exploit, open a GitHub issue with a minimal unsigned transaction. Do not include secrets, identifying wallet data, or funded addresses. If a report concerns an actively exploitable wallet vulnerability, disclose it privately to the affected wallet team before publishing a fixture.
