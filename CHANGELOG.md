# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Fixed
- Network requests no longer reject on HTTP 4xx/5xx before the plugin can handle them: a missing release tag now falls back to the `v`-prefixed tag, and GitHub rate limits show the rate-limit hint
- Plugins that fail to enable are no longer marked as enabled or counted as enabled
- Import enables only plugins it installed or changed in that run, not every plugin in the list (failed installs and plugins you turned off stay off)
- Apply settings unloads running plugins before writing `data.json` and loads them afterwards, so a plugin cannot overwrite the new settings with its in-memory ones on unload
- Settings are applied to plugins whose folder name differs from their manifest id
- Import and Apply settings can no longer run at the same time
- `normalizeVersion` strips a leading `v` only before a digit
- Settings merge ignores `__proto__` keys
- Apply settings detects an open Settings window in newer Obsidian, where Settings opens in a separate window, and no longer mistakes the mobile drawer settings button for an open Settings window

### Added
- Mobile support: the plugin is no longer desktop-only (`isDesktopOnly: false`); Import, Preview, Export and Apply settings work in Obsidian for Android (tested on 1.5.8 and 1.15.0)
- **Run automatic actions on mobile** setting (off by default): auto-install and settings sync on startup do not run on phones and tablets unless it is on, so a synced desktop setup does not start downloads on mobile
- Import skips desktop-only plugins on mobile with a notice instead of failing
- Export on mobile keeps list and settings entries for plugins not installed on that device
- Unit tests (vitest) and a CI workflow that runs lint, tests, and build on pushes and pull requests
- End-to-end tests in a real Obsidian (wdio-obsidian-service) on the minimum supported version and the latest one: import, re-import, version change, apply settings, export (`npm run test:e2e`, also run in CI)

### Changed
- Release workflow runs tests and uses Node 22
- Updated esbuild to 0.27 and `@types/node` to 22

## [1.2.0] - 2026-08-15

### Added
- Export current vault plugin list (with versions) and settings to JSON
- Preview import (dry-run) before changing the vault
- Optional version pins in `community-plugins-list.json` (`{ "id", "version" }`)
- Merge plugin settings into existing `data.json` (toggle; on for new installs)

### Fixed
- Obsidian 1.13 settings search skipped `display()`, so toggles with `control.key` did not save; auto-enable stayed off and Import never turned plugins on
- Enable plugins via `loadManifest` + `enablePluginAndSave` / `saveConfig` so Community plugins toggles update without a reload

### Changed
- Safer review defaults: auto-install, auto-enable, and settings sync remain off by default
- Cache the community plugins registry for a single import run
- Clearer Notices for GitHub rate limits (HTTP 403/429)
- Use `normalizePath()` and reject unsafe plugin IDs / path segments
- After applying settings, reload enabled plugins so changes take effect immediately
- Remove duplicate Command palette entry for import
- Desktop adapter error message no longer mentions “base path”

## [1.1.9] - 2026-08-08

### Fixed
- Follow HTTP redirects when fetching GitHub release `manifest.json` (fixes HTTP 302 install failures)

## [1.1.8] - 2026-08-08

### Changed
- Install community plugins via Obsidian's `installPlugin` API (no ZIP / JSZip)
- Removes false-positive automated review flags for self-update and dynamic `<script>` from JSZip

## [1.1.7] - 2026-08-08

### Fixed
- Automated review: unsafe `any`, `window.setTimeout` / `window.clearTimeout`
- Replace `builtin-modules` with `node:module`

## [1.1.6] - 2026-08-08

### Changed
- Renamed display name to **Community Install Manager** (Obsidian does not allow "Plugin" in plugin names)
- Shortened manifest description for the community directory
- Settings UI: sentence case, no emoji, removed redundant heading, warning styles moved to `styles.css`
- Default logging level is now `error`
- README: clearer network-use disclosure for the community registry and GitHub releases

## [1.0.8] - 2024-01-XX

### Added
- Automatic plugin enabling after installation
- UI auto-refresh after plugin installation and enabling
- Progress indicators during plugin installation
- Manual installation command via Command Palette
- File size validation for downloaded plugins (max 100 MB)
- Network timeouts for better error handling
- Improved error messages and logging

### Changed
- Refactored codebase into modular structure:
  - `FileManager` - file system operations
  - `NetworkManager` - network requests with size validation
  - `SettingsManager` - plugin settings synchronization
  - `PluginInstaller` - plugin installation logic
  - `PluginEnabler` - plugin enabling logic
- Improved plugin ID matching (handles variations like `obsidian-plugin` vs `plugin`)
- Enhanced error handling throughout the codebase
- Better progress tracking during installation

### Fixed
- Fixed issue where plugins weren't appearing in list after installation
- Fixed plugin enabling to work with all plugins, not just the first one
- Improved manifest reloading to ensure plugins are recognized

## [1.0.0] - Initial Release

### Added
- Automatic installation of community plugins from JSON configuration
- Settings synchronization from JSON configuration
- Support for `community-plugins-list.json` and `community-plugins-settings.json`
- Configurable settings for auto-install, auto-enable, and settings loading

[1.0.8]: https://github.com/Skilletron/obsidian-automatic-installation-of-plugins/compare/v1.0.0...v1.0.8
[1.0.0]: https://github.com/Skilletron/obsidian-automatic-installation-of-plugins/releases/tag/v1.0.0

