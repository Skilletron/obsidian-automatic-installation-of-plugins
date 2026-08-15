# Community Install Manager

Install, enable, and configure Obsidian community plugins from JSON files in your vault. Useful for syncing the same plugin setup across devices or sharing a ready-made configuration.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**Desktop only.**

## What it does

The plugin reads two files in your vault’s `.obsidian` folder:

- `community-plugins-list.json` — which community plugins to install (optionally with pinned versions)
- `community-plugins-settings.json` — settings to apply to those plugins

You can **export** your current vault setup into those files, **preview** what an import would do, then **import** on another machine.

Typical uses:

- Keep the same plugins on several computers
- Share a team vault starter setup
- Bootstrap a new vault from a known list

## Security warning

This plugin can download and install other community plugins.

- Only use it with vaults and JSON files you trust
- Review `community-plugins-list.json` before turning on auto-install
- Installed plugins can access your notes (and more on desktop)
- Unpinned plugins install the latest suitable release, which may include breaking changes
- Use at your own risk; the author is not responsible for plugins installed on your behalf

## Features

- Install plugins from the Obsidian Community Plugins registry (via Obsidian’s own installer)
- Optional version pins so setups stay reproducible
- Export / import / preview of your plugin list and settings
- Optional auto-install, auto-enable, and settings sync (all **off** by default)
- Merge plugin settings into existing ones (on by default for new installs)

## Network use

| Remote service | Purpose |
|---|---|
| Community plugins registry on GitHub | Look up plugin IDs and repositories |
| GitHub Releases API and release assets | Resolve versions and manifests |
| Obsidian’s built-in installer | Download and install plugin files (same path as Community plugins) |

No telemetry. Network use happens only when you import/install (or when auto-install is enabled).

## Installation

1. Install from Community plugins when available, **or** download the latest [GitHub release](https://github.com/Skilletron/obsidian-automatic-installation-of-plugins/releases) (`main.js`, `manifest.json`, `styles.css`) into `.obsidian/plugins/automatic-installation-of-plugins/`
2. Settings → Community plugins → turn Restricted mode off
3. Enable **Community Install Manager**

## Configuration files

```
.vault/
└── .obsidian/
    ├── community-plugins-list.json
    └── community-plugins-settings.json
```

### Plugin list — `community-plugins-list.json`

**Simple list** (install latest if missing; leave alone if already installed):

```json
[
  "calendar",
  "dataview",
  "templater-obsidian",
  "obsidian-git"
]
```

**Pinned versions** (install or change to that version):

```json
[
  { "id": "calendar", "version": "1.5.10" },
  { "id": "dataview", "version": "0.5.68" },
  "obsidian-git"
]
```

You can mix plain IDs and `{ "id", "version" }` objects. Export writes pinned objects from your currently installed versions.

### Plugin settings — `community-plugins-settings.json`

Maps plugin IDs to settings objects applied to each plugin:

```json
{
  "templater-obsidian": {
    "templates_folder": "Templates",
    "command_timeout": 5
  },
  "obsidian-git": {
    "pullInterval": 60
  }
}
```

## Quick start

1. On a vault that already has the plugins you want: Command Palette → **Export plugin setup to JSON**
2. Copy the two JSON files (or the whole vault config) to another device
3. There: **Preview plugin setup import**, review the report, then **Import plugin setup from JSON**
4. Turn on only the automatic options you need in Settings

## Commands

| Command | Action |
|---|---|
| Preview plugin setup import | Shows what would be installed, skipped, re-pinned, or updated in settings — without changing anything |
| Export plugin setup to JSON | Writes the current community plugins and their settings into the two JSON files |
| Import plugin setup from JSON | Installs from the list (and enables / applies settings if those options are on) |
| Apply settings from JSON | Applies settings from the settings file without reinstalling plugins |

## Settings

Automatic options are **off** by default so nothing runs until you choose it.

| Setting | Description |
|---|---|
| Preview / Export / Import / Apply | Buttons for the actions above |
| Auto-install plugins on startup | When Obsidian starts, install any missing plugins from the list |
| Auto-enable plugins after installation | Turn installed plugins on after import |
| Apply settings on installation | After each install, apply that plugin’s settings from the settings file |
| Merge settings instead of replace | Combine settings with what the plugin already has, instead of replacing them entirely |
| Sync settings on every startup | Re-apply the settings file every time Obsidian starts |
| Logging level | How much detail to write to the console if something goes wrong (default: Error) |

## Finding plugin IDs

Use the ID from the plugin’s Community plugins page or its `manifest.json` (for example `dataview`, `templater-obsidian`, `obsidian-git`).

## Troubleshooting

**Nothing installs**

- Check that `community-plugins-list.json` exists and the IDs are correct
- Use **Preview** to see planned actions
- Confirm network access to GitHub
- Open the console (Ctrl/Cmd+Shift+I) if import fails

**Plugins stay disabled**

- Turn on **Auto-enable plugins after installation**, or enable them under Community plugins
- Reload Obsidian if the list looks stale

**Settings look wrong**

- Confirm IDs in `community-plugins-settings.json` match the installed plugins
- With **Merge** on, only listed keys are updated; with it off, the whole settings file for that plugin is replaced
- Turn on **Apply settings on installation** and/or **Sync settings on every startup**, or run **Apply settings from JSON**

## Links

- Author: [Konstantin Volobuev](https://github.com/Skilletron)
- Repository: [obsidian-automatic-installation-of-plugins](https://github.com/Skilletron/obsidian-automatic-installation-of-plugins)
- Issues: [GitHub Issues](https://github.com/Skilletron/obsidian-automatic-installation-of-plugins/issues)

## License

MIT. See [LICENSE](LICENSE).
