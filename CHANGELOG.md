# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.2.0] - 2026-08-15

### Added
- Export current vault plugin list (with versions) and settings to JSON
- Preview import (dry-run) before changing the vault
- Optional version pins in `community-plugins-list.json` (`{ "id", "version" }`)
- Merge plugin settings into existing `data.json` (toggle; on for new installs)

### Changed
- Safer review defaults: auto-install, auto-enable, and settings sync remain off by default
- Cache the community plugins registry for a single import run
- Clearer Notices for GitHub rate limits (HTTP 403/429)
- Use `normalizePath()` and reject unsafe plugin IDs / path segments
- After applying settings, notify that plugins need a reload for in-memory settings
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

