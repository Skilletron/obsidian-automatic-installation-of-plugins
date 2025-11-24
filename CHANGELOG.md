# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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

