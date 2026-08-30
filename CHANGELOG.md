# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

- **Added**
  - (placeholder)

- **Changed**
  - Restored exact-main npm publication on a GitHub-hosted runner through
    short-lived OIDC, with an enforced Node/npm runtime and no long-lived
    write-token fallback.
  - Moved public package CI to GitHub-hosted capacity so internal and external
    branches cannot queue on or execute against company-managed runners.
  - (placeholder)

- **Fixed**
  - (placeholder)

- **Security**
  - Pinned patched transitive npm dependencies to clear the current audit baseline.
  - (placeholder)

## [0.1.3] - 2026-06-22

- **Added**
  - (placeholder)

- **Changed**
  - (placeholder)

- **Fixed**
  - (placeholder)

- **Security**
  - (placeholder)

## [0.1.2] - 2026-06-21

### Added

- Initial @plasius/game-audio-spatial package scaffold from the Plasius package template.
- Package boundary ADR and baseline validation scripts.
- Feature flag contract for `game.audio.sfx-occlusion.enabled`.


[0.1.2]: https://github.com/Plasius-LTD/game-audio-spatial/releases/tag/v0.1.2
[0.1.3]: https://github.com/Plasius-LTD/game-audio-spatial/releases/tag/v0.1.3
