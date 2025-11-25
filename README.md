# Automatic Plugin Manager

> Automatically install, enable, and configure Obsidian community plugins from simple JSON configuration files. Perfect for syncing plugin setups across devices or sharing vault configurations.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## ✨ Overview

**Automatic Plugin Manager** is a powerful Obsidian plugin that automates the installation, enabling, and configuration of community plugins. Simply define your desired plugins in a JSON file, and the plugin handles the rest—downloading, installing, enabling, and applying settings automatically.

Perfect for:
- 🔄 **Syncing plugin setups** across multiple devices
- 👥 **Sharing vault configurations** with team members
- 🚀 **Quick environment setup** for new vaults
- 📦 **Reproducible plugin configurations** for development workflows

## 🔧 Features

- ✅ **Automatic Installation** - Installs missing plugins from the Obsidian Community Plugins registry
- ✅ **Auto-Enable Plugins** - Automatically enables installed plugins after installation (configurable)
- ✅ **Smart Plugin Detection** - Refreshes plugin list to ensure newly installed plugins are recognized
- ✅ **Settings Synchronization** - Applies predefined plugin settings from configuration files
- ✅ **UI Auto-Refresh** - Automatically updates the Obsidian UI to show newly installed plugins
- ✅ **Error Handling** - Comprehensive error handling with detailed logging
- ✅ **Flexible Configuration** - Simple JSON-based configuration system

## ⚠️ Security Warning

**IMPORTANT**: This plugin automatically downloads and installs plugins from the Obsidian Community Plugins registry. Please be aware of the following security considerations:

- **Only use with trusted vaults**: Only install this plugin in vaults where you trust the source of the `community-plugins-list.json` file
- **Review plugin lists**: Always review the `community-plugins-list.json` file before enabling this plugin
- **Plugin permissions**: Installed plugins may have access to your vault data and file system
- **Automatic updates**: This plugin installs the latest version of each plugin, which may include breaking changes
- **Use at your own risk**: The plugin author is not responsible for any issues caused by automatically installed plugins

**Recommendation**: Review the `community-plugins-list.json` file in your vault's `.obsidian` folder before enabling this plugin.

## 🚀 Installation

### Manual Installation

1. Download the latest release from the [GitHub repository](https://github.com/Skilletron/obsidian-automatic-installation-of-plugins)
2. Extract the archive to your vault's `.obsidian/plugins/` folder
3. Rename the extracted folder to `automatic-installation-of-plugins`
4. Open Obsidian Settings
5. Go to **Community plugins**
6. Make sure **Safe mode** is **off**
7. Find "Automatic Plugin Manager" in the installed plugins list
8. Click the toggle to **Enable** the plugin

## 📁 Configuration Files

This plugin uses two simple JSON configuration files located in your vault's `.obsidian` folder:

```
.vault/
├── .obsidian/
│   ├── plugins/
│   ├── community-plugins-list.json      ← Plugin IDs to install
│   └── community-plugins-settings.json ← Plugin settings
```

### `community-plugins-list.json`

A simple array of plugin IDs to install and enable:

```json
[
  "advanced-tables",
  "templater-obsidian",
  "obsidian-linter",
  "obsidian-git"
]
```

### `community-plugins-settings.json`

An object mapping plugin IDs to their configuration settings:

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

## 🧠 Use Cases

### Sync Plugins Across Devices

1. Set up your plugins on one device
2. Export your `community-plugins-list.json` and `community-plugins-settings.json`
3. Copy these files to other devices
4. Enable the plugin on each device—your plugin setup will be automatically synchronized

### Share Vault Configurations

Create a vault template with predefined plugins and settings. Anyone who opens the vault will automatically get the same plugin configuration.

### Quick Environment Setup

Set up a new vault with your favorite plugins in seconds by copying your configuration files.

### Development Workflows

Maintain consistent plugin configurations across development environments.

## 🗂️ Example Workflow

1. **Create your plugin list**:
   ```json
   [
     "obsidian-git",
     "templater-obsidian",
     "obsidian-linter"
   ]
   ```

2. **Configure plugin settings** (optional):
   ```json
   {
     "obsidian-git": {
       "pullInterval": 60
     },
     "templater-obsidian": {
       "templates_folder": "Templates"
     }
   }
   ```

3. **Enable the plugin** in Obsidian settings

4. **Restart Obsidian** - The plugin will automatically:
   - Install missing plugins
   - Enable installed plugins
   - Apply configured settings
   - Refresh the UI

## ⚙️ Settings

The plugin provides the following settings (accessible via **Settings → Community plugins → Automatic Plugin Manager**):

| Setting | Description |
|---------|-------------|
| **Auto install plugins on startup** | If enabled, plugins from `community-plugins-list.json` will be automatically installed on Obsidian startup |
| **Auto enable plugins after installation** | If enabled, all installed plugins will be automatically enabled after installation. The plugin list will be refreshed first |
| **Load plugin settings on install** | If enabled, plugin configuration will be loaded from `community-plugins-settings.json` after installation |
| **Load plugin settings on startup** | If enabled, plugin configuration will be loaded from `community-plugins-settings.json` into installed plugins' `data.json` on each startup |

## 📝 How It Works

1. **On Obsidian startup**, the plugin checks for `community-plugins-list.json` in your vault's `.obsidian` folder
2. **If the file exists** and contains plugin IDs, the plugin attempts to install any missing plugins from the Obsidian Community Plugins registry
3. **After installation**, if enabled, the plugin:
   - Refreshes the plugin list to ensure newly installed plugins are recognized
   - Automatically enables all installed plugins
   - Updates the Obsidian UI to show the changes
4. **Settings application**: If `community-plugins-settings.json` exists and contains settings for installed plugins, those settings are applied to each plugin's `data.json` file
5. **On each startup**, if enabled, the plugin can re-apply settings from `community-plugins-settings.json` to already installed plugins

## 🔍 Finding Plugin IDs

To find the ID of a plugin you want to install:

1. Go to the [Obsidian Community Plugins](https://obsidian.md/plugins) website
2. Search for the plugin you want
3. The plugin ID is usually visible in the URL or plugin page
4. Alternatively, check the plugin's GitHub repository - the ID is often in the repository name

Common plugin IDs:
- `obsidian-git` - Git plugin
- `templater-obsidian` - Templater
- `obsidian-linter` - Linter
- `calendar` - Calendar
- `dataview` - Dataview

## 🐛 Troubleshooting

### Plugins not installing

- Check that `community-plugins-list.json` exists and contains valid plugin IDs
- Verify plugin IDs are correct (they're case-sensitive)
- Check the console (Ctrl/Cmd + Shift + I) for error messages
- Ensure you have an internet connection

### Plugins not enabling

- Check the "Auto enable plugins after installation" setting is enabled
- Check the console for any errors during the enable process
- Try manually reloading plugins (Settings → Community plugins → Reload)

### Settings not applying

- Verify `community-plugins-settings.json` exists and is valid JSON
- Check that plugin IDs in the settings file match the installed plugin IDs
- Ensure the "Load plugin settings on install" or "Load plugin settings on startup" setting is enabled

## 🔗 Links

- **Author**: [Konstantin Volobuev](https://github.com/Skilletron)
- **GitHub Repository**: [obsidian-automatic-installation-of-plugins](https://github.com/Skilletron/obsidian-automatic-installation-of-plugins)
- **Report Issues**: [GitHub Issues](https://github.com/Skilletron/obsidian-automatic-installation-of-plugins/issues)

## 📄 License

This plugin is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

Thanks to the Obsidian community for creating amazing plugins and to all contributors who help improve this plugin.

---

**Made with ❤️ for the Obsidian community**
