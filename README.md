# Community Install Manager

Install, enable, and configure Obsidian community plugins from simple JSON files. Useful for syncing vault setups across devices or sharing a predefined configuration.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Overview

**Community Install Manager** reads plugin IDs and optional settings from JSON files in your vault's `.obsidian` folder, then installs missing community plugins, enables them, and applies configuration.

Typical uses:

- Sync plugin setups across multiple devices
- Share vault configurations with a team
- Bootstrap a new vault with a known set of plugins

## Network use

This plugin makes network requests when installing plugins:

| Remote service | Purpose |
|---|---|
| `https://raw.githubusercontent.com/obsidianmd/obsidian-releases/master/community-plugins.json` | Look up community plugin IDs and their GitHub repositories |
| `https://api.github.com/repos/.../releases/latest` (and GitHub release asset URLs) | Download `main.js`, `manifest.json`, and optional `styles.css` for each listed plugin |

No telemetry is sent. Downloads happen only for plugin IDs you put in `community-plugins-list.json` (and only when auto-install or the install command runs).

## Security warning

**Important:** this plugin can download and install other community plugins into your vault.

- Only use it in vaults where you trust the source of `community-plugins-list.json`
- Review that file before enabling auto-install
- Installed plugins may access your vault data and, on desktop, the file system
- The latest release of each listed plugin is installed, which may include breaking changes
- Use at your own risk; the author is not responsible for plugins installed on your behalf

## Features

- Install missing plugins from the Obsidian Community Plugins registry
- Optionally enable plugins after installation
- Apply settings from a JSON file after install and/or on startup
- Refresh the Obsidian UI after install/enable
- Manual install command from the Command Palette

## Installation

### Manual installation

1. Download the latest release from the [GitHub repository](https://github.com/Skilletron/obsidian-automatic-installation-of-plugins)
2. Extract the archive to your vault's `.obsidian/plugins/` folder
3. Rename the extracted folder to `automatic-installation-of-plugins`
4. Open Obsidian Settings → Community plugins
5. Turn **Safe mode** off
6. Enable **Community Install Manager**

## Configuration files

Place these files in your vault's `.obsidian` folder:

```
.vault/
├── .obsidian/
│   ├── plugins/
│   ├── community-plugins-list.json
│   └── community-plugins-settings.json
```

### `community-plugins-list.json`

Array of plugin IDs to install and enable:

```json
[
  "advanced-tables",
  "templater-obsidian",
  "obsidian-linter",
  "obsidian-git"
]
```

### `community-plugins-settings.json`

Object mapping plugin IDs to settings written into each plugin's `data.json`:

```json
{
  "templater-obsidian": {
    "templates_folder": "Templates",
    "trigger_on_file_open": true,
    "command_timeout": 5
  },
  "obsidian-linter": {
    "auto_format_on_save": true,
    "lint_on_load": false
  },
  "obsidian-git": {
    "pullInterval": 60,
    "autoPullInterval": 0
  }
}
```

## Example workflow

1. Create `community-plugins-list.json` with the plugin IDs you want.
2. Optionally create `community-plugins-settings.json` with per-plugin settings.
3. Enable **Community Install Manager** (and the auto-install / auto-enable options you want).
4. Restart Obsidian, or run **Install plugins from list** from the Command Palette.

## Settings

| Setting | Description |
|---|---|
| Auto-install plugins on startup | Install missing plugins from `community-plugins-list.json` on startup |
| Auto-enable plugins after installation | Enable plugins after install and refresh the plugin list |
| Apply settings on installation | Write settings from `community-plugins-settings.json` after each install |
| Sync settings on every startup | Re-apply settings from that file on each startup |
| Logging level | Console verbosity (default: Error) |

## How it works

1. On startup (if enabled), the plugin reads `community-plugins-list.json` from `.obsidian`.
2. Missing plugins are resolved via the community registry, then downloaded from their GitHub releases.
3. If auto-enable is on, installed plugins are enabled and the UI is refreshed.
4. If settings sync is on, values from `community-plugins-settings.json` are written to each plugin's `data.json`.

## Finding plugin IDs

1. Open the [Obsidian Community Plugins](https://obsidian.md/plugins) site
2. Open the plugin page; the ID is usually in the URL or the plugin's `manifest.json`

Examples: `obsidian-git`, `templater-obsidian`, `obsidian-linter`, `calendar`, `dataview`

## Troubleshooting

### Plugins not installing

- Confirm `community-plugins-list.json` exists and contains valid IDs
- IDs are case-sensitive
- Check the developer console (Ctrl/Cmd+Shift+I) for errors
- Confirm you have network access to GitHub

### Plugins not enabling

- Confirm **Auto-enable plugins after installation** is on
- Check the console during enable
- Try **Reload** under Settings → Community plugins

### Settings not applying

- Confirm `community-plugins-settings.json` is valid JSON
- IDs in that file must match installed plugin IDs
- Confirm **Apply settings on installation** or **Sync settings on every startup** is on

## Desktop only

This plugin uses Node.js APIs (`fs`, `path`, `https`) and is desktop-only (`isDesktopOnly: true`).

## Links

- Author: [Konstantin Volobuev](https://github.com/Skilletron)
- Repository: [obsidian-automatic-installation-of-plugins](https://github.com/Skilletron/obsidian-automatic-installation-of-plugins)
- Issues: [GitHub Issues](https://github.com/Skilletron/obsidian-automatic-installation-of-plugins/issues)

## License

MIT. See [LICENSE](LICENSE).
