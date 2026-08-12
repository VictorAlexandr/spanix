# Changelog

All notable changes to spanix are recorded here.

Versions follow [semantic versioning](https://semver.org). While the major
number is `0`, the public API may change without a major bump.

## [Unreleased]

### Added
- Copyright and `SPDX-License-Identifier` headers on every source file.

### Planned for 0.1.0
- `~/.spanix/runs.db` — runs survive the process that produced them.
- `spanix runs` — the run table, in the terminal.
- `spanix serve` — the panel on `localhost`.

## [0.0.2] — 2026-08-11

### Fixed
- `LICENSE` shipped in `0.0.1` was a 764-byte placeholder instead of the full
  Apache-2.0 text. A published version is immutable, so the fix is this
  release. Nothing about the license changed — only the file was incomplete.

## [0.0.1] — 2026-08-11

First release. The accounting core, nothing else.

### Added
- `watch(stream, run=None, on_end=None)` — wraps an async agent stream,
  accounts for it, and yields every message untouched.
- `Run` — cost, input/output/cache tokens, turns, message count and a tally of
  tool calls by name.
- `last_run()` and `runs()` — read the counters back.
- `Run.summary()` — the whole thing as one printable block.

### Notes
- Zero dependencies. The agent SDK is never imported; fields are read by name
  with fallbacks, so a second runtime is only another list of names.
- Cost and turn count arrive as run totals, not deltas, and are folded with
  `max()`. Summing them would multiply the bill by the message count.
- Nothing is written to disk and nothing is sent anywhere. Counters live in an
  in-memory ring of the last 64 runs and are lost when the process exits.
- Only metadata and tool names are kept. Prompts, tool arguments and results
  are never recorded.

[Unreleased]: https://github.com/VictorAlexandr/spanix/compare/v0.0.2...HEAD
[0.0.2]: https://github.com/VictorAlexandr/spanix/releases/tag/v0.0.2
[0.0.1]: https://github.com/VictorAlexandr/spanix/releases/tag/v0.0.1
