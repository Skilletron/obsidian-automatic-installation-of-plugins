# obsidian-automatic-installation-of-plugins

This Obsidian plugin automatically installs and configures community plugins based on the `community-plugins-list.json` file on vault startup.

## 🔧 Features

- ✅ Automatically installs missing community plugins defined in `community-plugins-list.json`
- ✅ Loads and enables installed plugins at startup
- ✅ Applies predefined plugin settings from `community-plugins-settings.json`
- ✅ Writes default plugin settings to `community-plugins-settings.json` on install if not already present
- ✅ Reads plugin settings from `data.json` on plugin startup
- ✅ Merges user-defined settings into plugin's local `data.json` only if available in `community-plugins-settings.json`
- ✅ Creates `community-plugins-settings.json` if it does not exist

## 📁 File structure

This plugin relies on two configuration files in your vault root:

```
.vault/
├── .obsidian/
│   ├── plugins/
│   ├── community-plugins-list.json
│   └── community-plugins-settings.json
```

- **`community-plugins-list.json`** — array of plugin IDs to install and enable
- **`community-plugins-settings.json`** — an object where each key is a plugin ID and value is the plugin settings

## 🧠 Use cases

- Share a vault with a predefined set of plugins and settings
- Set up a reproducible development or writing environment
- Quickly sync your plugin setup across multiple machines

## 🗂️ Example

### community-plugins-list.json

```json
[
  "advanced-tables",
  "templater-obsidian",
  "obsidian-linter"
]
```

### community-plugins-settings.json

```json
{
  "templater-obsidian": {
    "templates_folder": "Templates",
    "trigger_on_file_open": true
  },
  "obsidian-linter": {
    "auto_format_on_save": true
  }
}
```

## 🚀 Installation

Clone or copy this plugin into your `.obsidian/plugins/obsidian-automatic-installation-of-plugins` folder, then enable it in the Obsidian settings.
