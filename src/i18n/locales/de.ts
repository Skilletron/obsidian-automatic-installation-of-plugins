import type { LocaleMessages } from "../index";

export const de: LocaleMessages = {
	// Commands
	"cmd.export": "Plugin-Setup als JSON exportieren",
	"cmd.preview": "Vorschau des Plugin-Setup-Imports",
	"cmd.import": "Plugin-Setup aus JSON importieren",
	"cmd.apply": "Einstellungen aus JSON anwenden",
	"cmd.exportPack": "Teilbares Setup-Paket exportieren",
	"cmd.importPack": "Setup-Paket über einen Link importieren",
	"cmd.checkUpdates": "Nach Plugin-Updates suchen",
	"cmd.undo": "Letzten Import, Export oder letzte Einstellungsänderung rückgängig machen",

	// Shared
	"common.unknownError": "Unbekannter Fehler",
	"common.close": "Schließen",
	"common.cancel": "Abbrechen",
	"common.busy":
		"Ein anderer Import, Export oder eine Einstellungsaktualisierung läuft bereits.",
	"common.startupFailed":
		"Installation beim Start fehlgeschlagen. Details findest du in der Konsole.",
	"common.and": " und ",
	"device.desktop": "Desktop",
	"device.mobile": "Mobilgerät",
	"progress.step": "{current} von {total} · {detail}",
	"net.rateLimit":
		"GitHub-Ratenlimit erreicht oder Zugriff verweigert. Warte ein paar Minuten und versuche es erneut.",

	// Import
	"import.title": "Plugin-Setup wird importiert",
	"import.finished": "Import abgeschlossen",
	"import.finishedProblems": "Import mit Problemen abgeschlossen",
	"import.failed": "Import fehlgeschlagen",
	"import.createdEmpty":
		"Leere Datei {file} erstellt. Füge Plugin-IDs hinzu und importiere erneut.",
	"import.cannotCreate":
		"{file} kann nicht erstellt werden. Prüfe die Dateiberechtigungen.",
	"import.empty": "{file} ist leer. Füge Plugin-IDs hinzu und importiere erneut.",
	"import.invalidJson": "Ungültiges JSON in {file}: {error}.",
	"import.noPlugins": "Keine Plugins zu installieren.",
	"import.notForMobile":
		"Keines der Plugins in der Liste ist für dieses Mobilgerät vorgesehen.",
	"import.notForDesktop":
		"Keines der Plugins in der Liste ist für dieses Desktop-Gerät vorgesehen.",
	"import.installing": "{label} wird installiert",
	"import.turningOn": "{id} wird aktiviert",
	"import.couldNotEnable": "Konnte nicht aktiviert werden: {ids}.",
	"import.autoEnableOff":
		"Automatisches Aktivieren ist aus, daher bleiben neue Plugins deaktiviert.",
	"import.skippedDesktopOnly": {
		one: "{count} reines Desktop-Plugin auf diesem Gerät übersprungen.",
		other: "{count} reine Desktop-Plugins auf diesem Gerät übersprungen.",
	},
	"import.otherDevices": {
		one: "{count} Plugin ist nur für andere Geräte vorgesehen.",
		other: "{count} Plugins sind nur für andere Geräte vorgesehen.",
	},
	"import.keptOff": "{count} wie in der Liste festgelegt deaktiviert gelassen.",
	"import.changed": {
		one: "{count} Plugin installiert oder aktualisiert",
		other: "{count} Plugins installiert oder aktualisiert",
	},
	"import.upToDate": "Alles war bereits aktuell",
	"import.summary": "{summary} ({ok} von {total} OK).",
	"import.error": "{error}. Details findest du in der Konsole.",

	// Vault setup (theme, snippets, hotkeys, core plugins)
	"vaultSetup.invalid": "{file} ist ungültig und wurde übersprungen.",
	"vaultSetup.applying":
		"Theme, Snippets, Tastenkürzel und Kern-Plugins werden angewendet",
	"vaultSetup.snippetsWritten": {
		one: "{count} CSS-Snippet hinzugefügt oder aktualisiert.",
		other: "{count} CSS-Snippets hinzugefügt oder aktualisiert.",
	},
	"vaultSetup.hotkeysSet": {
		one: "Tastenkürzel für {count} Befehl festgelegt.",
		other: "Tastenkürzel für {count} Befehle festgelegt.",
	},
	"vaultSetup.corePlugins": "Kern-Plugins: aktiviert {on}, deaktiviert {off}.",
	"vaultSetup.themeDefault": "Zum Standard-Theme gewechselt",
	"vaultSetup.themeInstalled": "Theme {name} {version} installiert",
	"vaultSetup.themeSwitched": "Zu Theme {name} gewechselt",
	"vaultSetup.noHotkeyManager": "Die Tastenkürzel-Verwaltung von Obsidian ist nicht verfügbar.",
	"vaultSetup.noCoreManager":
		"Die Verwaltung der Kern-Plugins von Obsidian ist nicht verfügbar.",
	"vaultSetup.noThemeManager": "Die Theme-Verwaltung von Obsidian ist nicht verfügbar.",
	"vaultSetup.snippetFailed": "Snippet „{name}“ konnte nicht geschrieben werden.",
	"vaultSetup.themeFailed": "Theme „{name}“ konnte nicht installiert werden.",
	"vaultSetup.defaultThemeLabel": "das Standard-Theme",
	"vaultSetup.describeThemeSame": "Theme: {label} wird bereits verwendet",
	"vaultSetup.describeThemeSwitch": "Theme: würde zu {label} wechseln",
	"vaultSetup.describeSnippets":
		"Snippets: {total} ({added} neu, {changed} geändert, {unchanged} unverändert)",
	"vaultSetup.describeHotkeys":
		"Tastenkürzel: {total} Befehle ({changed} würden sich ändern)",
	"vaultSetup.describeCore": "Kern-Plugins: würde {on} aktivieren, {off} deaktivieren",
	"vaultSetup.describeCoreSame": "Kern-Plugins: bereits wie in der Liste",

	// Export
	"export.finished": "Export abgeschlossen",
	"export.failed": "Export fehlgeschlagen",
	"export.saved": {
		one: "{count} Plugin ({pinned} fixiert, {withSettings} mit Einstellungen) in {listFile} und {settingsFile} gespeichert.",
		other: "{count} Plugins ({pinned} fixiert, {withSettings} mit Einstellungen) in {listFile} und {settingsFile} gespeichert.",
	},
	"export.kept": {
		one: " {count} Eintrag für Plugins behalten, die auf diesem Gerät nicht installiert sind.",
		other: " {count} Einträge für Plugins behalten, die auf diesem Gerät nicht installiert sind.",
	},
	"export.redacted": {
		one: " {count} geheimen Wert ausgelassen (Tokens, Passwörter).",
		other: " {count} geheime Werte ausgelassen (Tokens, Passwörter).",
	},
	"export.snippets": { one: "{count} CSS-Snippet", other: "{count} CSS-Snippets" },
	"export.hotkeys": {
		one: "{count} eigenes Tastenkürzel",
		other: "{count} eigene Tastenkürzel",
	},
	"export.vaultSetup":
		" Außerdem wurden {theme}, {snippets}, {hotkeys} und deine Kern-Plugins in {file} gespeichert.",
	"export.writeFailed": "die Setup-JSON-Dateien konnten nicht geschrieben werden",

	// Setup packs
	"pack.name": "Setup von {vault}",
	"pack.savedTitle": "Setup-Paket gespeichert",
	"pack.savedSecrets": {
		one: " {count} geheimen Wert ausgelassen.",
		other: " {count} geheime Werte ausgelassen.",
	},
	"pack.savedBody": {
		one: "{file} in deinem Tresor enthält {count} Plugin.{secrets} Teile die Datei (zum Beispiel als GitHub-Gist), dann können andere „Setup-Paket über einen Link importieren“ verwenden.",
		other: "{file} in deinem Tresor enthält {count} Plugins.{secrets} Teile die Datei (zum Beispiel als GitHub-Gist), dann können andere „Setup-Paket über einen Link importieren“ verwenden.",
	},
	"pack.notSavedTitle": "Setup-Paket nicht gespeichert",
	"pack.writeFailed": "{file} konnte nicht geschrieben werden",
	"pack.loadFailedTitle": "Setup-Paket konnte nicht geladen werden",
	"pack.httpsOnly": "es können nur https-Links geladen werden",
	"pack.notFound": "{path} wurde in diesem Tresor nicht gefunden",
	"pack.notPackTitle": "Kein Setup-Paket",
	"pack.notPackBody":
		"Die Datei ist kein Setup-Paket, das mit „Teilbares Setup-Paket exportieren“ erstellt wurde.",
	"pack.notAddedTitle": "Setup-Paket nicht hinzugefügt",
	"pack.linkTitle": "Setup-Paket importieren",
	"pack.linkDesc":
		"Füge einen Weblink zu einem Setup-Paket ein (ein GitHub-Gist oder eine Datei auf GitHub geht auch) oder den Pfad einer Paketdatei in diesem Tresor. Installiert wird erst, wenn du im nächsten Schritt bestätigst.",
	"pack.linkName": "Link oder Pfad",
	"pack.linkPlaceholder": "Link oder Pfad im Tresor",
	"pack.load": "Laden",
	"pack.defaultName": "Setup-Paket",
	"pack.from": "Quelle: {source}",
	"pack.warning":
		"Community-Plugins können deine Notizen lesen und ändern. Fahre nur fort, wenn du der Person vertraust, die dieses Paket erstellt hat.",
	"pack.pluginCount": {
		one: "{count} Plugin ({withSettings} mit Einstellungen)",
		other: "{count} Plugins ({withSettings} mit Einstellungen)",
	},
	"pack.devicesOnly": " (nur {devices})",
	"pack.staysOff": " (bleibt deaktiviert)",
	"pack.hasSettings": " · Einstellungen",
	"pack.explain":
		"Das Paket wird zu deiner eigenen Plugin-Liste und deinen Einstellungsdateien hinzugefügt (bei Überschneidungen hat das Paket Vorrang), danach läuft der Import. „Letzte Änderung rückgängig machen“ stellt die Dateien wieder her.",
	"pack.confirm": "Zu meinem Setup hinzufügen und importieren",

	// Updates
	"updates.checking": "Suche nach Plugin-Updates",
	"updates.checkFinished": "Update-Suche abgeschlossen",
	"updates.found": {
		one: "Für {count} Plugin ist ein Update verfügbar.",
		other: "Für {count} Plugins sind Updates verfügbar.",
	},
	"updates.none": "Alle Community-Plugins sind aktuell.",
	"updates.checkFailed": "Update-Suche fehlgeschlagen",
	"updates.updating": "Plugins werden aktualisiert",
	"updates.step": "{id} wird auf {version} aktualisiert",
	"updates.updated": {
		one: "{done} von {count} Plugin aktualisiert.",
		other: "{done} von {count} Plugins aktualisiert.",
	},
	"updates.pinsMoved": {
		one: "{count} Fixierung in {file} angepasst.",
		other: "{count} Fixierungen in {file} angepasst.",
	},
	"updates.finished": "Update abgeschlossen",
	"updates.finishedProblems": "Update mit Problemen abgeschlossen",
	"updates.failed": "Update fehlgeschlagen",
	"updates.modalTitle": "Plugin-Updates",
	"updates.update": "Aktualisieren",
	"updates.updateAll": "Alle aktualisieren ({count})",
	"updates.installed": "Installiert: {version}",
	"updates.needsApp": "{version} erfordert Obsidian {minApp}",
	"updates.pinToo":
		"die Fixierung in deiner Plugin-Liste ({version}) wird ebenfalls aktualisiert",

	// Undo
	"undo.nothingTitle": "Nichts rückgängig zu machen",
	"undo.nothingBody":
		"Es gibt keinen früheren Import, Export und kein früheres „Einstellungen anwenden“, das rückgängig gemacht werden könnte.",
	"undo.incompleteTitle": "Rückgängigmachen unvollständig",
	"undo.incompleteBody":
		"{restored} von {total} Dateien wiederhergestellt. Die Sicherung bleibt erhalten; Details findest du in der Konsole.",
	"undo.doneTitle": "Rückgängig gemacht: {reason}",
	"undo.doneBody": {
		one: "Stand vom {date}: {count} Datei wiederhergestellt.{reload}",
		other: "Stand vom {date}: {count} Dateien wiederhergestellt.{reload}",
	},
	"undo.reload": " Plugins werden neu geladen, wenn du die Einstellungen schließt.",
	"undo.failed": "Rückgängigmachen fehlgeschlagen",
	"reason.import": "Import",
	"reason.export": "Export",
	"reason.apply": "Einstellungen anwenden",
	"reason.update": "Plugins aktualisieren",
	"reason.pack": "Setup-Paket importieren",
	"reason.settings": "Einstellungsänderung",

	// Apply settings
	"apply.title": "Plugin-Einstellungen werden angewendet",
	"apply.none": "Es wurden keine Einstellungen geschrieben.",
	"apply.done": "Einstellungen angewendet",
	"apply.plugins": { one: "{count} Plugin", other: "{count} Plugins" },
	"apply.deferred": {
		one: "{plugins} aktualisiert. {count} laufendes Plugin wird neu geladen, wenn du die Einstellungen schließt.",
		other: "{plugins} aktualisiert. {count} laufende Plugins werden neu geladen, wenn du die Einstellungen schließt.",
	},
	"apply.restarted": "{plugins} aktualisiert ({restarted} neu geladen).",
	"apply.updated": "{plugins} aktualisiert.",
	"apply.failed": "Anwenden der Einstellungen fehlgeschlagen",
	"apply.fsError": "Kein Zugriff auf das Dateisystem: {error}",
	"apply.noSettingsFile":
		"Keine Datei {file} gefunden, Einstellungen werden nicht angewendet.",
	"apply.cannotWrite":
		"Einstellungen für Plugin {id} können nicht geschrieben werden. Prüfe die Dateiberechtigungen.",
	"apply.writeFailed":
		"data.json für Plugin {id} konnte nicht geschrieben werden: {error}",

	// Installing a plugin (shown in the import summary)
	"install.invalidId": "Ungültige Plugin-ID angegeben.",
	"install.invalidIdNamed": "Ungültige Plugin-ID: „{id}“.",
	"install.noApi":
		"Die installPlugin-API von Obsidian ist nicht verfügbar. Aktualisiere Obsidian und versuche es erneut.",
	"install.notInRegistry":
		"Plugin „{id}“ wurde im Verzeichnis der Obsidian-Community-Plugins nicht gefunden.",
	"install.badRepoInfo":
		"Plugin „{id}“ hat ungültige Repository-Angaben im Verzeichnis.",
	"install.badRepoFormat":
		"Plugin „{id}“ hat ein ungültiges Repository-Format: {repo}",
	"install.noPinnedManifest":
		"Manifest für „{id}“ {version} konnte nicht abgerufen werden. GitHub begrenzt möglicherweise die Anfragen.",
	"install.noRelease": "Kein passendes Release für Plugin „{id}“ gefunden.",
	"install.badManifest": "Ungültige manifest.json für „{id}“.",
	"install.failed": "Plugin „{id}“ konnte nicht installiert werden: {error}",
	"enable.noApi":
		"Kein Zugriff auf die Plugin-API. Plugins müssen manuell aktiviert werden.",

	// Files and the plugin list
	"file.readFailed": "Datei konnte nicht gelesen werden: {error}",
	"file.writeFailed": "Datei konnte nicht geschrieben werden: {error}",
	"file.empty":
		"{file} ist leer. Bitte füge Inhalt hinzu, sonst wird die Datei neu erstellt.",
	"file.invalidJson":
		"Ungültiges JSON in {file}: {error}. Bitte prüfe das Dateiformat.",
	"list.notArray":
		"{file} muss ein Array aus Plugin-IDs oder { id, version }-Objekten enthalten.",
	"list.skipped": {
		one: "{count} ungültigen Eintrag in {file} übersprungen. Siehe Konsole.",
		other: "{count} ungültige Einträge in {file} übersprungen. Siehe Konsole.",
	},

	// Import preview
	"preview.title": "Importvorschau",
	"preview.failed": "Vorschau fehlgeschlagen: {error}",
	"preview.listNotFound": "Vorschau: {file} nicht gefunden.",
	"preview.listInvalidJson": "Vorschau: ungültiges JSON in {file}.",
	"preview.otherDevice": "Nur für {devices} vorgesehen; auf diesem Gerät übersprungen",
	"preview.notOnDevice": "Auf diesem Gerät nicht angewendet",
	"preview.installPinned": "Würde @{version} installieren",
	"preview.installLatest": "Würde installieren (neueste stabile Version)",
	"preview.leftOff": ", bleibt deaktiviert",
	"preview.alreadyPinned": "Bereits auf fixierter Version {version}",
	"preview.wouldChange": "Würde {from} → {to} ändern",
	"preview.unknownVersion": "unbekannt",
	"preview.installedSkip": "Bereits installiert @{version} (nicht fixiert, übersprungen)",
	"preview.installedSkipNoVersion": "Bereits installiert (nicht fixiert, übersprungen)",
	"preview.settingsMissing": "{file} fehlt",
	"preview.noEntry": "Kein Einstellungseintrag",
	"preview.blocked":
		"Einstellungen vorhanden, aber „Einstellungen bei der Installation anwenden“ ist aus und das Plugin fehlt",
	"preview.afterInstall": "Würde Einstellungen nach der Installation anwenden",
	"preview.afterRepin": "Würde Einstellungen nach dem Versionswechsel anwenden",
	"preview.viaApply":
		"Würde mit „Einstellungen anwenden“ oder beim Synchronisieren beim Start angewendet",
	"preview.changes": { one: " ({count} Änderung)", other: " ({count} Änderungen)" },
	"preview.matches": " (stimmt bereits überein)",
	"preview.showChanges": {
		one: "{count} Einstellungsänderung anzeigen",
		other: "{count} Einstellungsänderungen anzeigen",
	},
	"preview.fileNotFound": "{file} wurde nicht gefunden.",
	"preview.empty": "Keine Plugins in der Liste.",
	"preview.vaultSetupInvalid": "{file} ist ungültig",
	"preview.vaultSetupInvalidJson": "{file} ist kein gültiges JSON",
	"preview.badgeInstall": "Installieren",
	"preview.badgeRepin": "Neu fixieren",
	"preview.badgeOkPinned": "Fixiert OK",
	"preview.badgeOtherDevice": "Anderes Gerät",
	"preview.badgeSkip": "Überspringen",
	"preview.badgeSettings": "Einstellungen",
	"preview.badgeNoSettings": "Keine Einstellungen",
	"preview.badgeBlocked": "Einstellungen blockiert",
	"preview.badgeNoFile": "Keine Einstellungsdatei",
	"preview.badgeNotHere": "Nicht hier",
	"preview.statOtherDevices": "Andere Geräte",

	// Settings tab
	"settings.warningName": "Sicherheitshinweis",
	"settings.warningPrefix": "Sicherheitshinweis: ",
	"settings.warningDesc":
		"Hiermit können Community-Plugins heruntergeladen und installiert werden. Verwende es nur mit vertrauenswürdigen Tresoren und prüfe deine Plugin-Liste, bevor du die automatische Installation aktivierst.",
	"settings.actionsName": "Export / Import",
	"settings.actionsDesc": "Plugin-Liste und Einstellungsdateien in {dir} verwalten.",
	"settings.previewName": "Importvorschau",
	"settings.previewDesc":
		"Zeigt, welche Plugins installiert, übersprungen oder aktualisiert würden und welche Einstellungen sich ändern würden – ohne deinen Tresor zu verändern.",
	"settings.previewButton": "Vorschau",
	"settings.exportName": "Plugin-Setup exportieren",
	"settings.exportDesc":
		"Speichert deine installierten Community-Plugins und ihre Einstellungen in den JSON-Dateien in {dir}.",
	"settings.exportButton": "Exportieren",
	"settings.importName": "Plugin-Setup importieren",
	"settings.importDesc":
		"Installiert Plugins aus der Listendatei. Aktivieren und Anwenden der Einstellungen richten sich nach den Optionen unten.",
	"settings.importButton": "Importieren",
	"settings.shareName": "Setup teilen",
	"settings.shareDesc":
		"Speichert alles, was du installiert hast, als setup-pack.json in deinem Tresor – ohne Geheimnisse –, um es mit anderen zu teilen.",
	"settings.shareButton": "Paket exportieren",
	"settings.importPackName": "Setup-Paket importieren",
	"settings.importPackDesc":
		"Füge das Setup-Paket einer anderen Person über einen Link zu deinem hinzu. Du siehst den Inhalt, bevor etwas installiert wird.",
	"settings.importPackButton": "Über Link importieren",
	"settings.importPackShortButton": "Paket importieren",
	"settings.updatesName": "Nach Updates suchen",
	"settings.updatesDesc":
		"Zeigt, für welche installierten Community-Plugins neuere Versionen verfügbar sind, und aktualisiert sie. Fixierungen in deiner Plugin-Liste werden mit angepasst.",
	"settings.updatesButton": "Prüfen",
	"settings.updatesLongButton": "Nach Updates suchen",
	"settings.undoName": "Letzte Änderung rückgängig machen",
	"settings.undoDesc":
		"Stellt die Einstellungs- und Setup-Dateien so wieder her, wie sie vor dem letzten Import, der letzten Einstellungsaktualisierung oder dem letzten Export waren. Installierte Plugins bleiben installiert.",
	"settings.undoButton": "Rückgängig",
	"settings.applyName": "Einstellungen anwenden",
	"settings.applyDesc":
		"Aktualisiert installierte Plugins aus der Einstellungsdatei, ohne sie neu zu installieren.",
	"settings.applyButton": "Anwenden",
	"settings.autoInstallName": "Plugins beim Start automatisch installieren",
	"settings.autoInstallDesc":
		"Beim Start von Obsidian alle Plugins aus deiner Liste installieren, die noch nicht installiert sind.",
	"settings.autoEnableName": "Plugins nach der Installation automatisch aktivieren",
	"settings.autoEnableDesc": "Plugins nach der Installation aktivieren.",
	"settings.applyOnInstallName": "Einstellungen bei der Installation anwenden",
	"settings.applyOnInstallDesc":
		"Nach der Installation eines Plugins seine Einstellungen aus deiner Einstellungsdatei anwenden.",
	"settings.mergeName": "Einstellungen zusammenführen statt ersetzen",
	"settings.mergeDesc":
		"Passende Einstellungen aktualisieren und den Rest behalten. Wenn deaktiviert, werden die gespeicherten Einstellungen des Plugins vollständig ersetzt.",
	"settings.syncOnStartupName": "Einstellungen bei jedem Start synchronisieren",
	"settings.syncOnStartupDesc":
		"Bei jedem Start von Obsidian deine Einstellungsdatei auf installierte Plugins anwenden.",
	"settings.mobileName": "Automatische Aktionen auf Mobilgeräten ausführen",
	"settings.mobileDesc":
		"Automatische Installation und Synchronisieren der Einstellungen beim Start auch auf Smartphones und Tablets ausführen. Standardmäßig deaktiviert, damit ein synchronisiertes Desktop-Setup keine Downloads über mobile Daten startet.",
	"settings.redactName": "Geheimnisse beim Export auslassen",
	"settings.redactDesc":
		"Tokens, Passwörter und API-Schlüssel in der exportierten Einstellungsdatei durch einen Platzhalter ersetzen. Beim Import überschreibt der Platzhalter nie einen echten Wert.",
	"settings.extraSecretsName": "Zusätzliche geheime Einstellungsnamen",
	"settings.extraSecretsDesc":
		"Kommagetrennte Namen von Einstellungen, die ebenfalls ausgelassen werden, zum Beispiel: licenseCode, endpoint",
	"settings.extraSecretsPlaceholder": "Lizenzcode, Endpunkt",
	"settings.syncVaultSetupName": "Theme, Snippets, Tastenkürzel und Kern-Plugins synchronisieren",
	"settings.syncVaultSetupDesc":
		"Der Export speichert dein Community-Theme, deine CSS-Snippets, eigenen Tastenkürzel und welche Kern-Plugins aktiv sind in vault-setup.json. Der Import wendet sie auf dem anderen Gerät an.",
	"settings.logLevelName": "Protokollierungsstufe",
	"settings.logLevelDesc":
		"Wie viele Details in der Konsole angezeigt werden, wenn etwas schiefgeht. Belasse die Einstellung auf „Fehler“, außer du suchst nach einem Problem.",
	"settings.logDebug": "Debug (meiste Details)",
	"settings.logInfo": "Info",
	"settings.logWarn": "Warnung",
	"settings.logError": "Fehler (empfohlen)",
	"settings.logNone": "Keine",
};
