// English, the source for every other language. Keys are grouped by where
// the text shows up. {name} is filled in at runtime; a { one, other } object
// picks the plural form by {count}.
export const en = {
	// Commands
	"cmd.export": "Export plugin setup to JSON",
	"cmd.preview": "Preview plugin setup import",
	"cmd.import": "Import plugin setup from JSON",
	"cmd.apply": "Apply settings from JSON",
	"cmd.exportPack": "Export shareable setup pack",
	"cmd.importPack": "Import setup pack from a link",
	"cmd.checkUpdates": "Check for plugin updates",
	"cmd.undo": "Undo last import, export or settings change",

	// Shared
	"common.unknownError": "Unknown error",
	"common.close": "Close",
	"common.cancel": "Cancel",
	"common.busy": "Another import, export or settings update is already running.",
	"common.startupFailed": "Startup install failed. See console for details.",
	"common.and": " and ",
	"device.desktop": "desktop",
	"device.mobile": "mobile",
	"progress.step": "{current} of {total} · {detail}",
	"net.rateLimit":
		"GitHub rate limit or access denied. Wait a few minutes and try again.",

	// Import
	"import.title": "Importing plugin setup",
	"import.finished": "Import finished",
	"import.finishedProblems": "Import finished with problems",
	"import.failed": "Import failed",
	"import.createdEmpty":
		"Created an empty {file}. Add plugin IDs to it and import again.",
	"import.cannotCreate": "Cannot create {file}. Check file permissions.",
	"import.empty": "{file} is empty. Add plugin IDs to it and import again.",
	"import.invalidJson": "Invalid JSON in {file}: {error}.",
	"import.noPlugins": "No plugins to install.",
	"import.notForMobile": "No plugins in the list are meant for this mobile device.",
	"import.notForDesktop":
		"No plugins in the list are meant for this desktop device.",
	"import.installing": "Installing {label}",
	"import.turningOn": "Turning on {id}",
	"import.couldNotEnable": "Could not turn on: {ids}.",
	"import.autoEnableOff": "Auto-enable is off, so new plugins stay off.",
	"import.skippedDesktopOnly": {
		one: "Skipped {count} desktop-only plugin on this device.",
		other: "Skipped {count} desktop-only plugins on this device.",
	},
	"import.otherDevices": {
		one: "{count} plugin is listed for other devices only.",
		other: "{count} plugins are listed for other devices only.",
	},
	"import.keptOff": "Left {count} turned off as set in the list.",
	"import.changed": {
		one: "Installed or updated {count} plugin",
		other: "Installed or updated {count} plugins",
	},
	"import.upToDate": "Everything was already up to date",
	"import.summary": "{summary} ({ok} of {total} OK).",
	"import.error": "{error}. See console for details.",

	// Vault setup (theme, snippets, hotkeys, core plugins)
	"vaultSetup.invalid": "{file} is not valid, so it was skipped.",
	"vaultSetup.applying": "Applying theme, snippets, hotkeys and core plugins",
	"vaultSetup.snippetsWritten": {
		one: "Added or updated {count} CSS snippet.",
		other: "Added or updated {count} CSS snippets.",
	},
	"vaultSetup.hotkeysSet": {
		one: "Set hotkeys for {count} command.",
		other: "Set hotkeys for {count} commands.",
	},
	"vaultSetup.corePlugins": "Core plugins: turned on {on}, turned off {off}.",
	"vaultSetup.themeDefault": "Switched to the default theme",
	"vaultSetup.themeInstalled": "Installed theme {name} {version}",
	"vaultSetup.themeSwitched": "Switched to theme {name}",
	"vaultSetup.noHotkeyManager": "Obsidian's hotkey manager is not available.",
	"vaultSetup.noCoreManager": "Obsidian's core plugin manager is not available.",
	"vaultSetup.noThemeManager": "Obsidian's theme manager is not available.",
	"vaultSetup.snippetFailed": 'Could not write snippet "{name}".',
	"vaultSetup.themeFailed": 'Could not install theme "{name}".',
	"vaultSetup.defaultThemeLabel": "the default theme",
	"vaultSetup.describeThemeSame": "Theme: already using {label}",
	"vaultSetup.describeThemeSwitch": "Theme: would switch to {label}",
	"vaultSetup.describeSnippets":
		"Snippets: {total} ({added} new, {changed} changed, {unchanged} unchanged)",
	"vaultSetup.describeHotkeys": "Hotkeys: {total} commands ({changed} would change)",
	"vaultSetup.describeCore": "Core plugins: would turn on {on}, turn off {off}",
	"vaultSetup.describeCoreSame": "Core plugins: already as listed",

	// Export
	"export.finished": "Export finished",
	"export.failed": "Export failed",
	"export.saved": {
		one: "Saved {count} plugin ({pinned} pinned, {withSettings} with settings) to {listFile} and {settingsFile}.",
		other: "Saved {count} plugins ({pinned} pinned, {withSettings} with settings) to {listFile} and {settingsFile}.",
	},
	"export.kept": {
		one: " Kept {count} entry for plugins not installed on this device.",
		other: " Kept {count} entries for plugins not installed on this device.",
	},
	"export.redacted": {
		one: " Left out {count} secret value (tokens, passwords).",
		other: " Left out {count} secret values (tokens, passwords).",
	},
	"export.snippets": { one: "{count} CSS snippet", other: "{count} CSS snippets" },
	"export.hotkeys": {
		one: "{count} custom hotkey",
		other: "{count} custom hotkeys",
	},
	"export.vaultSetup":
		" Also saved {theme}, {snippets}, {hotkeys} and your core plugins to {file}.",
	"export.writeFailed": "could not write the setup JSON files",

	// Setup packs
	"pack.name": "{vault} setup",
	"pack.savedTitle": "Setup pack saved",
	"pack.savedSecrets": {
		one: " Left out {count} secret value.",
		other: " Left out {count} secret values.",
	},
	"pack.savedBody": {
		one: "{file} in your vault has {count} plugin.{secrets} Share it (for example as a GitHub gist) and others can use Import setup pack from a link.",
		other: "{file} in your vault has {count} plugins.{secrets} Share it (for example as a GitHub gist) and others can use Import setup pack from a link.",
	},
	"pack.notSavedTitle": "Setup pack not saved",
	"pack.writeFailed": "could not write {file}",
	"pack.loadFailedTitle": "Could not load the setup pack",
	"pack.httpsOnly": "only https links can be loaded",
	"pack.notFound": "{path} was not found in this vault",
	"pack.notPackTitle": "Not a setup pack",
	"pack.notPackBody":
		"The file is not a setup pack made with Export shareable setup pack.",
	"pack.notAddedTitle": "Setup pack not added",
	"pack.linkTitle": "Import a setup pack",
	"pack.linkDesc":
		"Paste a web link to a setup pack (a GitHub gist or a file on GitHub works too), or the path of a pack file in this vault. Nothing is installed until you confirm on the next screen.",
	"pack.linkName": "Link or path",
	"pack.linkPlaceholder": "Link or vault path",
	"pack.load": "Load",
	"pack.defaultName": "Setup pack",
	"pack.from": "From: {source}",
	"pack.warning":
		"Community plugins can read and change your notes. Only continue if you trust whoever made this pack.",
	"pack.pluginCount": {
		one: "{count} plugin ({withSettings} with settings)",
		other: "{count} plugins ({withSettings} with settings)",
	},
	"pack.devicesOnly": " ({devices} only)",
	"pack.staysOff": " (stays off)",
	"pack.hasSettings": " · settings",
	"pack.explain":
		"The pack is added to your own plugin list and settings files (it wins where both have something), then the import runs. Undo last change puts the files back.",
	"pack.confirm": "Add to my setup and import",

	// Updates
	"updates.checking": "Checking for plugin updates",
	"updates.checkFinished": "Update check finished",
	"updates.found": {
		one: "{count} plugin has an update.",
		other: "{count} plugins have updates.",
	},
	"updates.none": "All community plugins are up to date.",
	"updates.checkFailed": "Update check failed",
	"updates.updating": "Updating plugins",
	"updates.step": "Updating {id} to {version}",
	"updates.updated": {
		one: "Updated {done} of {count} plugin.",
		other: "Updated {done} of {count} plugins.",
	},
	"updates.pinsMoved": {
		one: "Moved {count} pin in {file}.",
		other: "Moved {count} pins in {file}.",
	},
	"updates.finished": "Update finished",
	"updates.finishedProblems": "Update finished with problems",
	"updates.failed": "Update failed",
	"updates.modalTitle": "Plugin updates",
	"updates.update": "Update",
	"updates.updateAll": "Update all ({count})",
	"updates.installed": "Installed {version}",
	"updates.needsApp": "{version} needs Obsidian {minApp}",
	"updates.pinToo": "the pin in your plugin list ({version}) will be updated too",

	// Undo
	"undo.nothingTitle": "Nothing to undo",
	"undo.nothingBody": "No earlier Import, Apply settings or Export to undo.",
	"undo.incompleteTitle": "Undo incomplete",
	"undo.incompleteBody":
		"Restored {restored} of {total} files. The backup is kept; see console for details.",
	"undo.doneTitle": "Undid {reason}",
	"undo.doneBody": {
		one: "From {date}: restored {count} file.{reload}",
		other: "From {date}: restored {count} files.{reload}",
	},
	"undo.reload": " Plugins will reload when you close Settings.",
	"undo.failed": "Undo failed",
	"reason.import": "import",
	"reason.export": "export",
	"reason.apply": "apply settings",
	"reason.update": "update plugins",
	"reason.pack": "import setup pack",
	"reason.settings": "settings change",

	// Apply settings
	"apply.title": "Applying plugin settings",
	"apply.none": "No settings were written.",
	"apply.done": "Settings applied",
	"apply.plugins": { one: "{count} plugin", other: "{count} plugins" },
	"apply.deferred": {
		one: "Updated {plugins}. {count} running plugin will reload when you close Settings.",
		other: "Updated {plugins}. {count} running plugins will reload when you close Settings.",
	},
	"apply.restarted": "Updated {plugins} ({restarted} reloaded).",
	"apply.updated": "Updated {plugins}.",
	"apply.failed": "Applying settings failed",
	"apply.fsError": "Cannot access file system: {error}",
	"apply.noSettingsFile": "No {file} file found, skipping applying settings.",
	"apply.cannotWrite":
		"Cannot write settings for plugin {id}. Check file permissions.",
	"apply.writeFailed": "Failed to write data.json for plugin {id}: {error}",

	// Installing a plugin (shown in the import summary)
	"install.invalidId": "Invalid plugin ID provided.",
	"install.invalidIdNamed": 'Invalid plugin ID: "{id}".',
	"install.noApi":
		"Obsidian installPlugin API is unavailable. Update Obsidian and try again.",
	"install.notInRegistry":
		'Plugin "{id}" not found in Obsidian Community Plugins registry.',
	"install.badRepoInfo":
		'Plugin "{id}" has invalid repository information in registry.',
	"install.badRepoFormat": 'Plugin "{id}" has invalid repository format: {repo}',
	"install.noPinnedManifest":
		'Could not fetch manifest for "{id}" {version}. GitHub may be rate-limiting requests.',
	"install.noRelease": 'No suitable release found for plugin "{id}".',
	"install.badManifest": 'Invalid manifest.json for "{id}".',
	"install.failed": 'Failed to install plugin "{id}": {error}',
	"enable.noApi":
		"Cannot access plugins API. Plugins will need to be enabled manually.",

	// Files and the plugin list
	"file.readFailed": "Failed to read file: {error}",
	"file.writeFailed": "Failed to write file: {error}",
	"file.empty": "{file} is empty. Please add content or the file will be recreated.",
	"file.invalidJson": "Invalid JSON in {file}: {error}. Please check the file format.",
	"list.notArray":
		"{file} must contain an array of plugin IDs or { id, version } objects.",
	"list.skipped": {
		one: "Skipped {count} invalid entry in {file}. See console.",
		other: "Skipped {count} invalid entries in {file}. See console.",
	},

	// Import preview
	"preview.title": "Import preview",
	"preview.failed": "Preview failed: {error}",
	"preview.listNotFound": "Preview: {file} not found.",
	"preview.listInvalidJson": "Preview: invalid JSON in {file}.",
	"preview.otherDevice": "Listed for {devices} only; skipped on this device",
	"preview.notOnDevice": "Not applied on this device",
	"preview.installPinned": "Would install @{version}",
	"preview.installLatest": "Would install (latest stable)",
	"preview.leftOff": ", left turned off",
	"preview.alreadyPinned": "Already at pinned {version}",
	"preview.wouldChange": "Would change {from} → {to}",
	"preview.unknownVersion": "unknown",
	"preview.installedSkip": "Already installed @{version} (unpinned, skip)",
	"preview.installedSkipNoVersion": "Already installed (unpinned, skip)",
	"preview.settingsMissing": "{file} missing",
	"preview.noEntry": "No settings entry",
	"preview.blocked": "Settings exist, but Apply settings on installation is off and plugin missing",
	"preview.afterInstall": "Would apply settings after install",
	"preview.afterRepin": "Would apply settings after the version change",
	"preview.viaApply": "Would apply with Apply settings or sync on startup",
	"preview.changes": { one: " ({count} change)", other: " ({count} changes)" },
	"preview.matches": " (already matches)",
	"preview.showChanges": {
		one: "Show {count} setting change",
		other: "Show {count} setting changes",
	},
	"preview.fileNotFound": "{file} was not found.",
	"preview.empty": "No plugins in the list.",
	"preview.vaultSetupInvalid": "{file} is not valid",
	"preview.vaultSetupInvalidJson": "{file} is not valid JSON",
	"preview.badgeInstall": "Install",
	"preview.badgeRepin": "Re-pin",
	"preview.badgeOkPinned": "Pinned OK",
	"preview.badgeOtherDevice": "Other device",
	"preview.badgeSkip": "Skip",
	"preview.badgeSettings": "Settings",
	"preview.badgeNoSettings": "No settings",
	"preview.badgeBlocked": "Settings blocked",
	"preview.badgeNoFile": "No settings file",
	"preview.badgeNotHere": "Not here",
	"preview.statOtherDevices": "Other devices",

	// Settings tab
	"settings.warningName": "Security warning",
	"settings.warningPrefix": "Security warning: ",
	"settings.warningDesc":
		"This can download and install community plugins. Only use it with trusted vaults, and review your plugin list before enabling auto-install.",
	"settings.previewName": "Preview import",
	"settings.previewDesc":
		"See which plugins would be installed, skipped, or updated, and which settings would change — without changing your vault.",
	"settings.previewButton": "Preview",
	"settings.exportName": "Export plugin setup",
	"settings.exportDesc":
		"Save your installed community plugins and their settings into the JSON files in {dir}.",
	"settings.exportButton": "Export",
	"settings.importName": "Import plugin setup",
	"settings.importDesc":
		"Install plugins from the list file. Enabling and applying settings follow the options below.",
	"settings.importButton": "Import",
	"settings.shareName": "Share your setup",
	"settings.shareDesc":
		"Save everything you have installed as setup-pack.json in your vault, with secrets left out, to share with others.",
	"settings.shareButton": "Export pack",
	"settings.importPackName": "Import a setup pack",
	"settings.importPackDesc":
		"Add someone else's setup pack to yours from a link. You see what it contains before anything is installed.",
	"settings.importPackButton": "Import from link",
	"settings.updatesName": "Check for updates",
	"settings.updatesDesc":
		"See which installed community plugins have newer versions, and update them. Pins in your plugin list move along.",
	"settings.updatesButton": "Check",
	"settings.undoName": "Undo last change",
	"settings.undoDesc":
		"Put back the settings and setup files as they were before the last import, settings update or export. Installed plugins stay installed.",
	"settings.undoButton": "Undo",
	"settings.applyName": "Apply settings",
	"settings.applyDesc":
		"Update installed plugins from the settings file without reinstalling them.",
	"settings.applyButton": "Apply",
	"settings.autoInstallName": "Auto-install plugins on startup",
	"settings.autoInstallDesc":
		"When Obsidian starts, install any plugins from your list that are not installed yet.",
	"settings.autoEnableName": "Auto-enable plugins after installation",
	"settings.autoEnableDesc": "Turn plugins on after they are installed.",
	"settings.applyOnInstallName": "Apply settings on installation",
	"settings.applyOnInstallDesc":
		"After installing a plugin, apply its settings from your settings file.",
	"settings.mergeName": "Merge settings instead of replace",
	"settings.mergeDesc":
		"Update matching settings and keep the rest. When off, the plugin’s saved settings are replaced entirely.",
	"settings.syncOnStartupName": "Sync settings on every startup",
	"settings.syncOnStartupDesc":
		"Each time Obsidian starts, apply your settings file to installed plugins.",
	"settings.mobileName": "Run automatic actions on mobile",
	"settings.mobileDesc":
		"Let auto-install and settings sync on startup run on phones and tablets. Off by default, so a synced desktop setup does not start downloads on mobile data.",
	"settings.redactName": "Leave out secrets on export",
	"settings.redactDesc":
		"Replace tokens, passwords and API keys with a placeholder in the exported settings file. Import never writes the placeholder over a real value.",
	"settings.extraSecretsName": "Extra secret setting names",
	"settings.extraSecretsDesc":
		"Comma-separated setting names to leave out as well, for example: licenseCode, endpoint",
	"settings.extraSecretsPlaceholder": "License code, endpoint",
	"settings.syncVaultSetupName": "Sync theme, snippets, hotkeys and core plugins",
	"settings.syncVaultSetupDesc":
		"Export saves your community theme, CSS snippets, custom hotkeys and which core plugins are on to vault-setup.json. Import applies them on the other device.",
	"settings.logLevelName": "Logging level",
	"settings.logLevelDesc":
		"How much detail to show in the console if something goes wrong. Leave on error unless you are troubleshooting.",
	"settings.logDebug": "Debug (most detail)",
	"settings.logInfo": "Info",
	"settings.logWarn": "Warn",
	"settings.logError": "Error (recommended)",
	"settings.logNone": "None",
} as const;
