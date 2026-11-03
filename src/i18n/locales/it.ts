import type { LocaleMessages } from "../index";

export const it: LocaleMessages = {
	// Commands
	"cmd.export": "Esporta la configurazione dei plugin in JSON",
	"cmd.preview": "Anteprima dell’importazione della configurazione dei plugin",
	"cmd.import": "Importa la configurazione dei plugin da JSON",
	"cmd.apply": "Applica le impostazioni da JSON",
	"cmd.exportPack": "Esporta un pacchetto di configurazione condivisibile",
	"cmd.importPack": "Importa un pacchetto di configurazione da un link",
	"cmd.checkUpdates": "Controlla gli aggiornamenti dei plugin",
	"cmd.undo": "Annulla l’ultima importazione, esportazione o modifica delle impostazioni",

	// Shared
	"common.unknownError": "Errore sconosciuto",
	"common.close": "Chiudi",
	"common.cancel": "Annulla",
	"common.busy":
		"È già in corso un’altra importazione, esportazione o aggiornamento delle impostazioni.",
	"common.startupFailed":
		"Installazione all’avvio non riuscita. Vedi la console per i dettagli.",
	"common.and": " e ",
	"device.desktop": "desktop",
	"device.mobile": "mobile",
	"progress.step": "{current} di {total} · {detail}",
	"net.rateLimit":
		"Limite di richieste GitHub raggiunto o accesso negato. Attendi qualche minuto e riprova.",

	// Import
	"import.title": "Importazione della configurazione dei plugin",
	"import.finished": "Importazione completata",
	"import.finishedProblems": "Importazione completata con problemi",
	"import.failed": "Importazione non riuscita",
	"import.createdEmpty":
		"Creato un file {file} vuoto. Aggiungi gli ID dei plugin e importa di nuovo.",
	"import.cannotCreate": "Impossibile creare {file}. Controlla i permessi del file.",
	"import.empty": "{file} è vuoto. Aggiungi gli ID dei plugin e importa di nuovo.",
	"import.invalidJson": "JSON non valido in {file}: {error}.",
	"import.noPlugins": "Nessun plugin da installare.",
	"import.notForMobile":
		"Nessun plugin dell’elenco è destinato a questo dispositivo mobile.",
	"import.notForDesktop": "Nessun plugin dell’elenco è destinato a questo computer desktop.",
	"import.installing": "Installazione di {label}",
	"import.turningOn": "Attivazione di {id}",
	"import.couldNotEnable": "Impossibile attivare: {ids}.",
	"import.autoEnableOff":
		"L’attivazione automatica è disattivata, quindi i nuovi plugin restano disattivati.",
	"import.skippedDesktopOnly": {
		one: "Saltato {count} plugin solo desktop su questo dispositivo.",
		many: "Saltati {count} plugin solo desktop su questo dispositivo.",
		other: "Saltati {count} plugin solo desktop su questo dispositivo.",
	},
	"import.otherDevices": {
		one: "{count} plugin è previsto solo per altri dispositivi.",
		many: "{count} plugin sono previsti solo per altri dispositivi.",
		other: "{count} plugin sono previsti solo per altri dispositivi.",
	},
	"import.keptOff": "Plugin lasciati disattivati come indicato nell’elenco: {count}.",
	"import.changed": {
		one: "{count} plugin installato o aggiornato",
		many: "{count} plugin installati o aggiornati",
		other: "{count} plugin installati o aggiornati",
	},
	"import.upToDate": "Era già tutto aggiornato",
	"import.summary": "{summary} ({ok} di {total} OK).",
	"import.error": "{error}. Vedi la console per i dettagli.",

	// Vault setup (theme, snippets, hotkeys, core plugins)
	"vaultSetup.invalid": "{file} non è valido ed è stato saltato.",
	"vaultSetup.applying":
		"Applicazione di tema, snippet, tasti di scelta rapida e plugin principali",
	"vaultSetup.snippetsWritten": {
		one: "Aggiunto o aggiornato {count} snippet CSS.",
		many: "Aggiunti o aggiornati {count} snippet CSS.",
		other: "Aggiunti o aggiornati {count} snippet CSS.",
	},
	"vaultSetup.hotkeysSet": {
		one: "Tasti di scelta rapida impostati per {count} comando.",
		many: "Tasti di scelta rapida impostati per {count} comandi.",
		other: "Tasti di scelta rapida impostati per {count} comandi.",
	},
	"vaultSetup.corePlugins": "Plugin principali: attivati {on}, disattivati {off}.",
	"vaultSetup.themeDefault": "Passato al tema predefinito",
	"vaultSetup.themeInstalled": "Tema {name} {version} installato",
	"vaultSetup.themeSwitched": "Passato al tema {name}",
	"vaultSetup.noHotkeyManager":
		"Il gestore dei tasti di scelta rapida di Obsidian non è disponibile.",
	"vaultSetup.noCoreManager":
		"Il gestore dei plugin principali di Obsidian non è disponibile.",
	"vaultSetup.noThemeManager": "Il gestore dei temi di Obsidian non è disponibile.",
	"vaultSetup.snippetFailed": "Impossibile scrivere lo snippet “{name}”.",
	"vaultSetup.themeFailed": "Impossibile installare il tema “{name}”.",
	"vaultSetup.defaultThemeLabel": "il tema predefinito",
	"vaultSetup.describeThemeSame": "Tema: già in uso {label}",
	"vaultSetup.describeThemeSwitch": "Tema: passerebbe a {label}",
	"vaultSetup.describeSnippets":
		"Snippet: {total} ({added} nuovi, {changed} modificati, {unchanged} invariati)",
	"vaultSetup.describeHotkeys":
		"Tasti di scelta rapida: {total} comandi ({changed} cambierebbero)",
	"vaultSetup.describeCore": "Plugin principali: attiverebbe {on}, disattiverebbe {off}",
	"vaultSetup.describeCoreSame": "Plugin principali: già come nell’elenco",

	// Export
	"export.finished": "Esportazione completata",
	"export.failed": "Esportazione non riuscita",
	"export.saved": {
		one: "Salvato {count} plugin ({pinned} con versione fissata, {withSettings} con impostazioni) in {listFile} e {settingsFile}.",
		many: "Salvati {count} plugin ({pinned} con versione fissata, {withSettings} con impostazioni) in {listFile} e {settingsFile}.",
		other: "Salvati {count} plugin ({pinned} con versione fissata, {withSettings} con impostazioni) in {listFile} e {settingsFile}.",
	},
	"export.kept": {
		one: " Mantenuta {count} voce per plugin non installati su questo dispositivo.",
		many: " Mantenute {count} voci per plugin non installati su questo dispositivo.",
		other: " Mantenute {count} voci per plugin non installati su questo dispositivo.",
	},
	"export.redacted": {
		one: " Escluso {count} valore segreto (token, password).",
		many: " Esclusi {count} valori segreti (token, password).",
		other: " Esclusi {count} valori segreti (token, password).",
	},
	"export.snippets": {
		one: "{count} snippet CSS",
		many: "{count} snippet CSS",
		other: "{count} snippet CSS",
	},
	"export.hotkeys": {
		one: "{count} tasto di scelta rapida personalizzato",
		many: "{count} tasti di scelta rapida personalizzati",
		other: "{count} tasti di scelta rapida personalizzati",
	},
	"export.vaultSetup":
		" Salvati anche {theme}, {snippets}, {hotkeys} e i tuoi plugin principali in {file}.",
	"export.writeFailed": "impossibile scrivere i file JSON della configurazione",

	// Setup packs
	"pack.name": "Configurazione di {vault}",
	"pack.savedTitle": "Pacchetto di configurazione salvato",
	"pack.savedSecrets": {
		one: " Escluso {count} valore segreto.",
		many: " Esclusi {count} valori segreti.",
		other: " Esclusi {count} valori segreti.",
	},
	"pack.savedBody": {
		one: "{file} nel tuo vault contiene {count} plugin.{secrets} Condividilo (ad esempio come gist di GitHub) e altri potranno usare “Importa un pacchetto di configurazione da un link”.",
		many: "{file} nel tuo vault contiene {count} plugin.{secrets} Condividilo (ad esempio come gist di GitHub) e altri potranno usare “Importa un pacchetto di configurazione da un link”.",
		other: "{file} nel tuo vault contiene {count} plugin.{secrets} Condividilo (ad esempio come gist di GitHub) e altri potranno usare “Importa un pacchetto di configurazione da un link”.",
	},
	"pack.notSavedTitle": "Pacchetto di configurazione non salvato",
	"pack.writeFailed": "impossibile scrivere {file}",
	"pack.loadFailedTitle": "Impossibile caricare il pacchetto di configurazione",
	"pack.httpsOnly": "si possono caricare solo link https",
	"pack.notFound": "{path} non è stato trovato in questo vault",
	"pack.notPackTitle": "Non è un pacchetto di configurazione",
	"pack.notPackBody":
		"Il file non è un pacchetto di configurazione creato con “Esporta un pacchetto di configurazione condivisibile”.",
	"pack.notAddedTitle": "Pacchetto di configurazione non aggiunto",
	"pack.linkTitle": "Importa un pacchetto di configurazione",
	"pack.linkDesc":
		"Incolla un link web a un pacchetto di configurazione (va bene anche un gist di GitHub o un file su GitHub), oppure il percorso di un file pacchetto in questo vault. Non viene installato nulla finché non confermi nella schermata successiva.",
	"pack.linkName": "Link o percorso",
	"pack.linkPlaceholder": "Link o percorso nel vault",
	"pack.load": "Carica",
	"pack.defaultName": "Pacchetto di configurazione",
	"pack.from": "Origine: {source}",
	"pack.warning":
		"I plugin della community possono leggere e modificare le tue note. Continua solo se ti fidi di chi ha creato questo pacchetto.",
	"pack.pluginCount": {
		one: "{count} plugin ({withSettings} con impostazioni)",
		many: "{count} plugin ({withSettings} con impostazioni)",
		other: "{count} plugin ({withSettings} con impostazioni)",
	},
	"pack.devicesOnly": " (solo {devices})",
	"pack.staysOff": " (resta disattivato)",
	"pack.hasSettings": " · impostazioni",
	"pack.explain":
		"Il pacchetto viene aggiunto al tuo elenco di plugin e ai tuoi file di impostazioni (in caso di sovrapposizione prevale il pacchetto), poi viene eseguita l’importazione. “Annulla l’ultima modifica” ripristina i file.",
	"pack.confirm": "Aggiungi alla mia configurazione e importa",

	// Updates
	"updates.checking": "Controllo degli aggiornamenti dei plugin",
	"updates.checkFinished": "Controllo degli aggiornamenti completato",
	"updates.found": {
		one: "{count} plugin ha un aggiornamento.",
		many: "{count} plugin hanno aggiornamenti.",
		other: "{count} plugin hanno aggiornamenti.",
	},
	"updates.none": "Tutti i plugin della community sono aggiornati.",
	"updates.checkFailed": "Controllo degli aggiornamenti non riuscito",
	"updates.updating": "Aggiornamento dei plugin",
	"updates.step": "Aggiornamento di {id} alla versione {version}",
	"updates.updated": {
		one: "Plugin aggiornati: {done} su {count}.",
		many: "Plugin aggiornati: {done} su {count}.",
		other: "Plugin aggiornati: {done} su {count}.",
	},
	"updates.pinsMoved": {
		one: "Aggiornata {count} versione fissata in {file}.",
		many: "Aggiornate {count} versioni fissate in {file}.",
		other: "Aggiornate {count} versioni fissate in {file}.",
	},
	"updates.finished": "Aggiornamento completato",
	"updates.finishedProblems": "Aggiornamento completato con problemi",
	"updates.failed": "Aggiornamento non riuscito",
	"updates.modalTitle": "Aggiornamenti dei plugin",
	"updates.update": "Aggiorna",
	"updates.updateAll": "Aggiorna tutti ({count})",
	"updates.installed": "Installata: {version}",
	"updates.needsApp": "{version} richiede Obsidian {minApp}",
	"updates.pinToo":
		"verrà aggiornata anche la versione fissata nel tuo elenco di plugin ({version})",

	// Undo
	"undo.nothingTitle": "Niente da annullare",
	"undo.nothingBody":
		"Nessuna importazione, esportazione o “Applica impostazioni” precedente da annullare.",
	"undo.incompleteTitle": "Annullamento incompleto",
	"undo.incompleteBody":
		"Ripristinati {restored} file su {total}. Il backup viene conservato; vedi la console per i dettagli.",
	"undo.doneTitle": "Annullato: {reason}",
	"undo.doneBody": {
		one: "Backup del {date}: ripristinato {count} file.{reload}",
		many: "Backup del {date}: ripristinati {count} file.{reload}",
		other: "Backup del {date}: ripristinati {count} file.{reload}",
	},
	"undo.reload": " I plugin verranno ricaricati alla chiusura delle Impostazioni.",
	"undo.failed": "Annullamento non riuscito",
	"reason.import": "importazione",
	"reason.export": "esportazione",
	"reason.apply": "applicazione delle impostazioni",
	"reason.update": "aggiornamento dei plugin",
	"reason.pack": "importazione del pacchetto di configurazione",
	"reason.settings": "modifica delle impostazioni",

	// Apply settings
	"apply.title": "Applicazione delle impostazioni dei plugin",
	"apply.none": "Nessuna impostazione è stata scritta.",
	"apply.done": "Impostazioni applicate",
	"apply.plugins": {
		one: "{count} plugin",
		many: "{count} plugin",
		other: "{count} plugin",
	},
	"apply.deferred": {
		one: "Aggiornamento completato per {plugins}. {count} plugin in esecuzione verrà ricaricato alla chiusura delle Impostazioni.",
		many: "Aggiornamento completato per {plugins}. {count} plugin in esecuzione verranno ricaricati alla chiusura delle Impostazioni.",
		other: "Aggiornamento completato per {plugins}. {count} plugin in esecuzione verranno ricaricati alla chiusura delle Impostazioni.",
	},
	"apply.restarted": "Aggiornamento completato per {plugins} (ricaricati: {restarted}).",
	"apply.updated": "Aggiornamento completato per {plugins}.",
	"apply.failed": "Applicazione delle impostazioni non riuscita",
	"apply.fsError": "Impossibile accedere al file system: {error}",
	"apply.noSettingsFile":
		"Nessun file {file} trovato, le impostazioni non vengono applicate.",
	"apply.cannotWrite":
		"Impossibile scrivere le impostazioni del plugin {id}. Controlla i permessi del file.",
	"apply.writeFailed": "Impossibile scrivere data.json per il plugin {id}: {error}",

	// Installing a plugin (shown in the import summary)
	"install.invalidId": "ID del plugin non valido.",
	"install.invalidIdNamed": "ID del plugin non valido: “{id}”.",
	"install.noApi":
		"L’API installPlugin di Obsidian non è disponibile. Aggiorna Obsidian e riprova.",
	"install.notInRegistry":
		"Plugin “{id}” non trovato nel registro dei plugin della community di Obsidian.",
	"install.badRepoInfo":
		"Il plugin “{id}” ha informazioni sul repository non valide nel registro.",
	"install.badRepoFormat":
		"Il plugin “{id}” ha un formato di repository non valido: {repo}",
	"install.noPinnedManifest":
		"Impossibile recuperare il manifest di “{id}” {version}. GitHub potrebbe limitare le richieste.",
	"install.noRelease": "Nessuna release adatta trovata per il plugin “{id}”.",
	"install.badManifest": "manifest.json non valido per “{id}”.",
	"install.failed": "Installazione del plugin “{id}” non riuscita: {error}",
	"enable.noApi":
		"Impossibile accedere all’API dei plugin. I plugin dovranno essere attivati manualmente.",

	// Files and the plugin list
	"file.readFailed": "Impossibile leggere il file: {error}",
	"file.writeFailed": "Impossibile scrivere il file: {error}",
	"file.empty":
		"{file} è vuoto. Aggiungi del contenuto, altrimenti il file verrà ricreato.",
	"file.invalidJson":
		"JSON non valido in {file}: {error}. Controlla il formato del file.",
	"list.notArray":
		"{file} deve contenere un array di ID di plugin o di oggetti { id, version }.",
	"list.skipped": {
		one: "Saltata {count} voce non valida in {file}. Vedi la console.",
		many: "Saltate {count} voci non valide in {file}. Vedi la console.",
		other: "Saltate {count} voci non valide in {file}. Vedi la console.",
	},

	// Import preview
	"preview.title": "Anteprima importazione",
	"preview.failed": "Anteprima non riuscita: {error}",
	"preview.listNotFound": "Anteprima: {file} non trovato.",
	"preview.listInvalidJson": "Anteprima: JSON non valido in {file}.",
	"preview.otherDevice": "Previsto solo per {devices}; saltato su questo dispositivo",
	"preview.notOnDevice": "Non applicato su questo dispositivo",
	"preview.installPinned": "Installerebbe @{version}",
	"preview.installLatest": "Installerebbe (ultima versione stabile)",
	"preview.leftOff": ", lasciato disattivato",
	"preview.alreadyPinned": "Già alla versione fissata {version}",
	"preview.wouldChange": "Cambierebbe {from} → {to}",
	"preview.unknownVersion": "sconosciuta",
	"preview.installedSkip": "Già installato @{version} (non fissato, saltato)",
	"preview.installedSkipNoVersion": "Già installato (non fissato, saltato)",
	"preview.settingsMissing": "{file} mancante",
	"preview.noEntry": "Nessuna voce di impostazioni",
	"preview.blocked":
		"Le impostazioni esistono, ma “Applica le impostazioni all’installazione” è disattivato e il plugin manca",
	"preview.afterInstall": "Applicherebbe le impostazioni dopo l’installazione",
	"preview.afterRepin": "Applicherebbe le impostazioni dopo il cambio di versione",
	"preview.viaApply":
		"Verrebbero applicate con “Applica impostazioni” o con la sincronizzazione all’avvio",
	"preview.changes": {
		one: " ({count} modifica)",
		many: " ({count} modifiche)",
		other: " ({count} modifiche)",
	},
	"preview.matches": " (già corrispondente)",
	"preview.showChanges": {
		one: "Mostra {count} modifica alle impostazioni",
		many: "Mostra {count} modifiche alle impostazioni",
		other: "Mostra {count} modifiche alle impostazioni",
	},
	"preview.fileNotFound": "{file} non è stato trovato.",
	"preview.empty": "Nessun plugin nell’elenco.",
	"preview.vaultSetupInvalid": "{file} non è valido",
	"preview.vaultSetupInvalidJson": "{file} non è un JSON valido",
	"preview.badgeInstall": "Installa",
	"preview.badgeRepin": "Cambia versione",
	"preview.badgeOkPinned": "Versione fissata OK",
	"preview.badgeOtherDevice": "Altro dispositivo",
	"preview.badgeSkip": "Salta",
	"preview.badgeSettings": "Impostazioni",
	"preview.badgeNoSettings": "Nessuna impostazione",
	"preview.badgeBlocked": "Impostazioni bloccate",
	"preview.badgeNoFile": "Nessun file di impostazioni",
	"preview.badgeNotHere": "Non qui",
	"preview.statOtherDevices": "Altri dispositivi",

	// Settings tab
	"settings.warningName": "Avviso di sicurezza",
	"settings.warningPrefix": "Avviso di sicurezza: ",
	"settings.warningDesc":
		"Questo plugin può scaricare e installare plugin della community. Usalo solo con vault attendibili e controlla l’elenco dei plugin prima di attivare l’installazione automatica.",
	"settings.actionsName": "Esporta / Importa",
	"settings.actionsDesc":
		"Gestisci l’elenco dei plugin e i file di impostazioni in {dir}.",
	"settings.previewName": "Anteprima importazione",
	"settings.previewDesc":
		"Mostra quali plugin verrebbero installati, saltati o aggiornati e quali impostazioni cambierebbero, senza modificare il vault.",
	"settings.previewButton": "Anteprima",
	"settings.exportName": "Esporta la configurazione dei plugin",
	"settings.exportDesc":
		"Salva i plugin della community installati e le loro impostazioni nei file JSON in {dir}.",
	"settings.exportButton": "Esporta",
	"settings.importName": "Importa la configurazione dei plugin",
	"settings.importDesc":
		"Installa i plugin dal file elenco. L’attivazione e l’applicazione delle impostazioni seguono le opzioni qui sotto.",
	"settings.importButton": "Importa",
	"settings.shareName": "Condividi la tua configurazione",
	"settings.shareDesc":
		"Salva tutto ciò che hai installato come setup-pack.json nel tuo vault, senza i dati segreti, per condividerlo con altri.",
	"settings.shareButton": "Esporta pacchetto",
	"settings.importPackName": "Importa un pacchetto di configurazione",
	"settings.importPackDesc":
		"Aggiungi alla tua configurazione il pacchetto di qualcun altro tramite un link. Vedi cosa contiene prima che venga installato qualcosa.",
	"settings.importPackButton": "Importa da link",
	"settings.importPackShortButton": "Importa pacchetto",
	"settings.updatesName": "Controlla aggiornamenti",
	"settings.updatesDesc":
		"Mostra quali plugin della community installati hanno versioni più recenti e li aggiorna. Le versioni fissate nel tuo elenco di plugin vengono aggiornate di conseguenza.",
	"settings.updatesButton": "Controlla",
	"settings.updatesLongButton": "Controlla aggiornamenti",
	"settings.undoName": "Annulla l’ultima modifica",
	"settings.undoDesc":
		"Ripristina i file di impostazioni e di configurazione com’erano prima dell’ultima importazione, aggiornamento delle impostazioni o esportazione. I plugin installati restano installati.",
	"settings.undoButton": "Annulla",
	"settings.applyName": "Applica impostazioni",
	"settings.applyDesc":
		"Aggiorna i plugin installati dal file di impostazioni senza reinstallarli.",
	"settings.applyButton": "Applica",
	"settings.autoInstallName": "Installa automaticamente i plugin all’avvio",
	"settings.autoInstallDesc":
		"All’avvio di Obsidian, installa i plugin del tuo elenco che non sono ancora installati.",
	"settings.autoEnableName": "Attiva automaticamente i plugin dopo l’installazione",
	"settings.autoEnableDesc": "Attiva i plugin dopo averli installati.",
	"settings.applyOnInstallName": "Applica le impostazioni all’installazione",
	"settings.applyOnInstallDesc":
		"Dopo aver installato un plugin, applica le sue impostazioni dal tuo file di impostazioni.",
	"settings.mergeName": "Unisci le impostazioni invece di sostituirle",
	"settings.mergeDesc":
		"Aggiorna le impostazioni corrispondenti e mantieni le altre. Se disattivato, le impostazioni salvate del plugin vengono sostituite completamente.",
	"settings.syncOnStartupName": "Sincronizza le impostazioni a ogni avvio",
	"settings.syncOnStartupDesc":
		"A ogni avvio di Obsidian, applica il tuo file di impostazioni ai plugin installati.",
	"settings.mobileName": "Esegui le azioni automatiche su mobile",
	"settings.mobileDesc":
		"Consenti l’installazione automatica e la sincronizzazione delle impostazioni all’avvio su smartphone e tablet. Disattivato per impostazione predefinita, così una configurazione desktop sincronizzata non avvia download sulla rete dati mobile.",
	"settings.redactName": "Escludi i dati segreti dall’esportazione",
	"settings.redactDesc":
		"Sostituisci token, password e chiavi API con un segnaposto nel file di impostazioni esportato. L’importazione non sovrascrive mai un valore reale con il segnaposto.",
	"settings.extraSecretsName": "Nomi aggiuntivi di impostazioni segrete",
	"settings.extraSecretsDesc":
		"Nomi di impostazioni separati da virgole da escludere anch’essi, ad esempio: licenseCode, endpoint",
	"settings.extraSecretsPlaceholder": "Codice di licenza, endpoint",
	"settings.syncVaultSetupName":
		"Sincronizza tema, snippet, tasti di scelta rapida e plugin principali",
	"settings.syncVaultSetupDesc":
		"L’esportazione salva in vault-setup.json il tema della community, gli snippet CSS, i tasti di scelta rapida personalizzati e quali plugin principali sono attivi. L’importazione li applica sull’altro dispositivo.",
	"settings.logLevelName": "Livello di log",
	"settings.logLevelDesc":
		"Quanti dettagli mostrare nella console in caso di problemi. Lascia su “Errore” a meno che tu non stia risolvendo un problema.",
	"settings.logDebug": "Debug (massimo dettaglio)",
	"settings.logInfo": "Info",
	"settings.logWarn": "Avviso",
	"settings.logError": "Errore (consigliato)",
	"settings.logNone": "Nessuno",
};
