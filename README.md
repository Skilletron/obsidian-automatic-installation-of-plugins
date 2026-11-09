# Community Install Manager

Install, enable, and configure Obsidian community plugins from JSON files in your vault, along with your theme, CSS snippets, hotkeys and Obsidian's own settings. Useful for syncing the same setup across devices or sharing a ready-made configuration.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Works on desktop and mobile. Tested automatically in desktop Obsidian and in Obsidian for Android; iOS is not covered by the automated tests.

## What it does

The plugin reads these files in your vault’s `.obsidian` folder:

- `community-plugins-list.json` — which community plugins to install (optionally with pinned versions)
- `community-plugins-settings.json` — settings to apply to those plugins
- `vault-setup.json` — your Obsidian settings, theme, CSS snippets, custom hotkeys, core plugins with their settings, and bookmarks (optional)

You can **export** your current vault setup into those files, **preview** what an import would do, then **import** on another machine.

Typical uses:

- Keep the same plugins on several computers and your phone or tablet
- Share a team vault starter setup
- Bootstrap a new vault from a known list
- Reinstall community plugins after `git clone` when `.obsidian/plugins/` is gitignored (keep a list JSON in the repo, then Import)

## Security warning

This plugin can download and install other community plugins.

- Only use it with vaults, JSON files and setup packs you trust
- Review `community-plugins-list.json` before turning on auto-install
- Installed plugins can access your notes (and more on desktop)
- Unpinned plugins install the latest suitable release, which may include breaking changes
- Use at your own risk; the author is not responsible for plugins installed on your behalf

## Features

- Install plugins from the Obsidian Community Plugins registry (via Obsidian’s own installer)
- Optional version pins so setups stay reproducible, and per-device or turned-off entries
- Export, import and preview of your plugin list and settings, with the exact setting changes shown before anything is written
- Theme, CSS snippets, hotkeys, core plugins, Obsidian's own settings and bookmarks through `vault-setup.json`
- Shareable setup packs: pick the plugins to share, send a link, and the other side sees everything in it before anything changes
- Update check for installed plugins that keeps their settings and moves their pins
- Secrets (tokens, passwords, API keys) left out of exports
- Undo for the last 10 imports, exports and settings changes
- Works on phones and tablets, with automatic actions off there unless you allow them
- Optional auto-install on startup and settings sync on startup (**off** by default)
- Auto-enable after install and apply settings on install (**on** by default for new installs)
- Merge plugin settings into existing ones (on by default for new installs)

## Languages

The plugin follows Obsidian's language: English, Russian, Ukrainian, German, French, Spanish, Italian, Portuguese (Brazil), Polish, Turkish, Japanese, Korean, Chinese (Simplified) and Chinese (Traditional). Anything not translated falls back to English. Translations live in `src/i18n/locales/`; to add a language, copy `en.ts`, translate the texts and register it in `index.ts`. The tests check that every language has every text, the same `{placeholders}` and the plural forms its language needs.

## Network use

| Remote service | Purpose |
|---|---|
| Community plugins registry on GitHub | Look up plugin IDs and repositories |
| GitHub release assets (`releases/download/...`) and `raw.githubusercontent.com` | Resolve pinned/latest manifests and check for updates |
| Obsidian’s built-in installer | Download and install plugin files and themes (same path as Community plugins) |
| Community themes registry on GitHub | Find the theme named in `vault-setup.json` |
| The link you give to **Import setup pack from a link** | Download that setup pack (GitHub gist and file pages are turned into their raw file) |

No telemetry. Network use happens only when you import, check for updates or load a setup pack (or when auto-install is enabled). The installer avoids calling `api.github.com` so anonymous rate limits are less likely.

## Installation

1. In Obsidian: **Settings → Community plugins → Browse** → search **Community Install Manager** → Install → Enable  
   Or download the latest [GitHub release](https://github.com/Skilletron/obsidian-automatic-installation-of-plugins/releases) (`main.js`, `manifest.json`, `styles.css`) into `.obsidian/plugins/automatic-installation-of-plugins/`
2. Settings → Community plugins → turn Restricted mode off (if needed)
3. Enable **Community Install Manager**

## Configuration files

```
.vault/
└── .obsidian/
    ├── community-plugins-list.json
    ├── community-plugins-settings.json
    └── vault-setup.json   (optional)
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

**Per device and on/off** (optional fields):

```json
[
  { "id": "obsidian-git", "devices": "desktop" },
  { "id": "calendar", "devices": ["desktop", "mobile"] },
  { "id": "dataview", "enabled": false }
]
```

- `devices`: `"desktop"`, `"mobile"` or both. Import skips the plugin on other kinds of device, and Preview shows it as "Other device". Without it, the plugin is for every device.
- `enabled: false`: Import installs the plugin but leaves it turned off. Plugins that are already installed keep their on/off state either way.

Export fills these in for you: `enabled: false` for plugins that are turned off, and `devices: ["desktop"]` for desktop-only plugins. If you set `devices` or add your own fields (a `note`, for example), Export keeps them. Older versions of the plugin ignore these fields.

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

### Theme, snippets, hotkeys, core plugins, Obsidian settings and bookmarks — `vault-setup.json`

```json
{
  "theme": { "name": "Minimal", "version": "9.1.3" },
  "snippets": {
    "my-tweaks": { "enabled": true, "css": "body { --line-width: 44rem; }" }
  },
  "hotkeys": {
    "editor:toggle-bold": [{ "modifiers": ["Mod", "Shift"], "key": "B" }]
  },
  "corePlugins": { "daily-notes": true, "graph": false },
  "appSettings": { "vimMode": true, "attachmentFolderPath": "files" },
  "coreSettings": { "daily-notes": { "folder": "Daily" }, "graph": { "showTags": true } },
  "bookmarks": [{ "type": "file", "ctime": 1760000000000, "path": "Home.md" }]
}
```

- `theme`: a community theme by its name in the theme browser, optionally pinned to a version. Import installs it if needed and switches to it. `"name": ""` switches back to the default theme. Leave `theme` out to keep whatever theme each device has.
- `snippets`: CSS snippets by file name (without `.css`). Import writes new and changed ones; snippets it creates follow `enabled`, snippets that already exist keep their on/off state.

- `hotkeys`: custom hotkeys by command id, in the same format as Obsidian's `hotkeys.json` (`Mod` is Ctrl on Windows and Linux, Cmd on macOS). Import sets them for the listed commands; other commands keep their hotkeys. An empty list removes a command's default hotkey.
- `corePlugins`: core plugins by id, `true` for on and `false` for off. Import turns them on or off to match. Core plugins that this Obsidian version or device doesn't have are skipped.
- `appSettings`: Obsidian's own settings, as in `app.json` and `appearance.json` (editor, files and links, fonts, light or dark mode and so on). Import sets the listed ones and leaves the rest alone. Export only writes settings you have changed from the default, so a setting at its default won't overwrite a different value on the other device. Some of them only take effect after you reopen Obsidian.
- `coreSettings`: settings of core plugins by id (daily notes, templates, graph and others), merged over what each one has. Sync, Publish and Workspaces are never included: they belong to an account or to one vault.
- `bookmarks`: bookmarks as in `bookmarks.json`. Import adds the missing ones and never removes any, so a bookmark deleted on one device stays on the others.

Every part is optional. Export writes them for you when **Sync Obsidian settings, theme, snippets, hotkeys and core plugins** is on, leaving out secrets like it does for plugin settings. Undo puts back snippet files, Obsidian settings, core plugin settings and bookmarks, but it doesn't switch the theme back or undo hotkeys and which core plugins are on.

## Quick start

1. On a vault that already has the plugins you want: Command Palette → **Export plugin setup to JSON**
2. Copy the JSON files from `.obsidian` (or the whole vault config) to another device
3. There: **Preview plugin setup import**, review the report, then **Import plugin setup from JSON**
4. Turn on only the automatic options you need in Settings

## Commands

| Command | Action |
|---|---|
| Preview plugin setup import | Shows what would be installed, skipped or re-pinned, and exactly which settings would change for each plugin (old → new, with secrets masked) — without changing anything |
| Export plugin setup to JSON | Writes the current community plugins and their settings into the list and settings files, and the rest of your setup into `vault-setup.json` when syncing it is on |
| Import plugin setup from JSON | Installs from the list (and enables / applies settings if those options are on), then applies `vault-setup.json` when syncing it is on |
| Apply settings from JSON | Applies settings from the settings file without reinstalling plugins. Running plugins are unloaded while their `data.json` is written, then loaded again (after you close Settings, if it is open) |
| Export shareable setup pack | Lets you pick which installed plugins to share and saves them as `setup-pack.json` in your vault, with secrets always left out |
| Import setup pack from a link | Loads a setup pack from a link or a vault path, shows what it contains, and adds it to your setup only after you confirm |
| Check for plugin updates | Lists installed community plugins that have newer versions and updates the ones you pick |
| Undo last import, export or settings change | Puts the files the last Import, Apply settings or Export changed back the way they were |

## Settings

| Setting | Default (new install) | Description |
|---|---|---|
| Preview, Export, Import, Apply settings, Check for updates, Export pack, Import pack, Undo | — | One setting with a button for each action above |
| Auto-install plugins on startup | Off | When Obsidian starts, install any missing plugins from the list |
| Auto-enable plugins after installation | On | Turn plugins on after they are installed via Import |
| Apply settings on installation | On | After each install, apply that plugin’s settings from the settings file |
| Merge settings instead of replace | On | Combine settings with what the plugin already has; when off, replace entirely |
| Sync settings on every startup | Off | Re-apply the settings file every time Obsidian starts |
| Run automatic actions on mobile | Off | Let auto-install and sync on startup run on phones and tablets too |
| Leave out secrets on export | On (off if you used the plugin before 1.2.3) | Replace tokens, passwords and API keys with a placeholder in the exported settings |
| Extra secret setting names | — | More setting names to leave out, comma-separated |
| Sync Obsidian settings, theme, snippets, hotkeys and core plugins | On (off if you used the plugin before 1.2.3) | Export and import them, and bookmarks, through `vault-setup.json` |
| Logging level | Error | How much detail to write to the console if something goes wrong |

Auto-install and sync-on-startup stay off so a fresh vault does not download plugins until you opt in. Review the list file before enabling auto-install.

### Sharing your setup

**Export shareable setup pack** first shows your installed plugins, all turned on: turn off the ones you don't want to share. It then writes `setup-pack.json` to your vault: the plugins you kept (with versions), their settings, and, when syncing it is on, your Obsidian settings, theme, snippets, hotkeys and core plugins with their settings. Bookmarks never go in, since they name your notes. Plugins you turned off leave no trace: neither their settings nor their hotkeys go in. Secrets are always left out of it, whatever the export setting says. Put it somewhere public, such as a GitHub gist, and share the link.

**Import setup pack from a link** takes that link (an https link; GitHub gist and file pages work too) or the path of a pack file in your vault. It shows the pack's name, where it came from, every plugin in it and what would change in your theme, snippets, hotkeys, core plugins and Obsidian settings. Nothing happens until you click **Add to my setup and import**. Then the pack is added to your own files (it wins where both have something) and Import runs. Undo last change puts your files back.

You can also share a link that opens the same confirmation in Obsidian:

```
obsidian://install-setup-pack?url=https%3A%2F%2Fgist.github.com%2Fyou%2Fabc123
```

### Updates

**Check for plugin updates** looks up the newest version of each installed community plugin the same way Obsidian does, and shows the ones that can be updated. If the newest version needs a newer Obsidian, it offers the newest one that runs on yours and says so. Updating keeps the plugin's settings, restarts it if it was running, and moves its pin in `community-plugins-list.json` to the new version, so the next Import doesn't take you back.

### Secrets and undo

Plugin settings often hold API keys and tokens, and the settings file tends to end up in git or a shared folder. With **Leave out secrets on export** on, Export writes `<secret removed on export>` instead of any text value whose setting name looks like a secret (token, password, API key, webhook and similar), and tells you how many it left out. Add your own names under **Extra secret setting names**. Import and Apply settings never write that placeholder into a plugin: the plugin keeps the value it already has.

Before Import, Apply settings or Export overwrites anything, the plugin saves a copy of those files. **Undo last change** (a button in settings and a command) puts them back and reloads the affected plugins. You can undo several times in a row; the last 10 changes are kept in `.obsidian/community-install-manager-backups`. Undo restores settings and setup files only. Plugins that Import installed stay installed.

### On phones and tablets

If you sync your `.obsidian` folder (Obsidian Sync, iCloud, git), these settings reach your phone too. To avoid surprise downloads on mobile data:

- Auto-install and sync on startup do not run on mobile until you turn on **Run automatic actions on mobile** there. The commands and buttons work as usual.
- Import skips desktop-only plugins on mobile and says so in a notice.
- Export on mobile keeps list and settings entries for plugins that are not installed on that device, so exporting from a phone does not drop your desktop-only plugins.

## Finding plugin IDs

Use the ID from the plugin’s Community plugins page or its `manifest.json` (for example `dataview`, `templater-obsidian`, `obsidian-git`).

## Troubleshooting

**Nothing installs**

- Check that `community-plugins-list.json` exists and the IDs are correct
- Use **Preview** to see planned actions
- Confirm network access to GitHub
- Open the console (Ctrl/Cmd+Shift+I) if import fails
- On mobile, keep Obsidian open until the import finishes; it downloads every plugin

**Plugins stay disabled**

- Confirm **Auto-enable plugins after installation** is on (check `data.json` if the toggle looks wrong in Obsidian 1.13 settings search)
- Import only turns on plugins it installed or changed in that run; plugins that were already installed keep their on/off state
- Or enable them under Community plugins
- After Import, the Community plugins tab should refresh; if toggles look stale, close and reopen Settings

**Settings look wrong**

- Confirm IDs in `community-plugins-settings.json` match the installed plugins
- With **Merge** on, only listed keys are updated; with it off, the whole settings file for that plugin is replaced
- Turn on **Apply settings on installation** and/or **Sync settings on every startup**, or run **Apply settings from JSON**

## Development

```bash
npm test             # unit tests
npm run test:e2e     # Obsidian desktop (minimum and latest version, plus mobile UI emulation)
npm run test:android # Obsidian for Android in an Android Virtual Device named obsidian_test
```

The end-to-end tests download Obsidian into `.obsidian-cache` and install real plugins from GitHub. Android tests need the Android SDK (`ANDROID_HOME`) and Java 17.

## Links

- Author: [Konstantin Volobuev](https://github.com/Skilletron)
- Repository: [obsidian-automatic-installation-of-plugins](https://github.com/Skilletron/obsidian-automatic-installation-of-plugins)
- Issues: [GitHub Issues](https://github.com/Skilletron/obsidian-automatic-installation-of-plugins/issues)

## License

MIT. See [LICENSE](LICENSE).
