# Contributing

Small, reviewable fixture additions are welcome.

1. Open an issue describing the transaction behavior and why a wallet should explain it.
2. Use only deterministic disposable public keys and unsigned localnet/devnet transactions.
3. Add a primary documentation reference and an explicit expected finding.
4. Run `npm run fixtures:generate`, `npm run check`, and `npm run build`.
5. Never submit private keys, seed phrases, funded addresses, or active exploit payloads.

New finding codes require a specification update and focused analyzer tests. Security-sensitive discoveries should follow [SECURITY.md](SECURITY.md), not arrive as a surprise public pull request.
