import type { LocaleMessages } from "../index";

export const fr: LocaleMessages = {
	// Commands
	"cmd.export": "Exporter la configuration des plugins en JSON",
	"cmd.preview": "Prévisualiser l’import de la configuration des plugins",
	"cmd.import": "Importer la configuration des plugins depuis JSON",
	"cmd.apply": "Appliquer les paramètres depuis JSON",
	"cmd.exportPack": "Exporter un pack de configuration partageable",
	"cmd.importPack": "Importer un pack de configuration depuis un lien",
	"cmd.checkUpdates": "Rechercher des mises à jour des plugins",
	"cmd.undo": "Annuler le dernier import, export ou changement de paramètres",

	// Shared
	"common.unknownError": "Erreur inconnue",
	"common.close": "Fermer",
	"common.cancel": "Annuler",
	"common.busy":
		"Un autre import, export ou une mise à jour des paramètres est déjà en cours.",
	"common.startupFailed":
		"Échec de l’installation au démarrage. Voir la console pour plus de détails.",
	"common.and": " et ",
	"device.desktop": "ordinateur",
	"device.mobile": "mobile",
	"progress.step": "{current} sur {total} · {detail}",
	"net.rateLimit":
		"Limite de requêtes GitHub atteinte ou accès refusé. Patientez quelques minutes et réessayez.",

	// Import
	"import.title": "Import de la configuration des plugins",
	"import.finished": "Import terminé",
	"import.finishedProblems": "Import terminé avec des problèmes",
	"import.failed": "Échec de l’import",
	"import.createdEmpty":
		"Fichier {file} vide créé. Ajoutez-y des identifiants de plugins et relancez l’import.",
	"import.cannotCreate":
		"Impossible de créer {file}. Vérifiez les autorisations du fichier.",
	"import.empty":
		"{file} est vide. Ajoutez-y des identifiants de plugins et relancez l’import.",
	"import.invalidJson": "JSON non valide dans {file} : {error}.",
	"import.noPlugins": "Aucun plugin à installer.",
	"import.notForMobile": "Aucun plugin de la liste n’est destiné à cet appareil mobile.",
	"import.notForDesktop": "Aucun plugin de la liste n’est destiné à cet ordinateur.",
	"import.installing": "Installation de {label}",
	"import.turningOn": "Activation de {id}",
	"import.couldNotEnable": "Impossible d’activer : {ids}.",
	"import.autoEnableOff":
		"L’activation automatique est désactivée, les nouveaux plugins restent donc désactivés.",
	"import.skippedDesktopOnly": {
		one: "{count} plugin réservé à l’ordinateur ignoré sur cet appareil.",
		many: "{count} plugins réservés à l’ordinateur ignorés sur cet appareil.",
		other: "{count} plugins réservés à l’ordinateur ignorés sur cet appareil.",
	},
	"import.otherDevices": {
		one: "{count} plugin est prévu uniquement pour d’autres appareils.",
		many: "{count} plugins sont prévus uniquement pour d’autres appareils.",
		other: "{count} plugins sont prévus uniquement pour d’autres appareils.",
	},
	"import.keptOff": "Plugins laissés désactivés comme indiqué dans la liste : {count}.",
	"import.changed": {
		one: "{count} plugin installé ou mis à jour",
		many: "{count} plugins installés ou mis à jour",
		other: "{count} plugins installés ou mis à jour",
	},
	"import.upToDate": "Tout était déjà à jour",
	"import.summary": "{summary} ({ok} sur {total} OK).",
	"import.error": "{error}. Voir la console pour plus de détails.",

	// Vault setup (theme, snippets, hotkeys, core plugins)
	"vaultSetup.invalid": "{file} n’est pas valide, il a donc été ignoré.",
	"vaultSetup.applying":
		"Application des paramètres d’Obsidian, du thème, des extraits, des raccourcis clavier et des plugins principaux",
	"vaultSetup.snippetsWritten": {
		one: "{count} extrait CSS ajouté ou mis à jour.",
		many: "{count} extraits CSS ajoutés ou mis à jour.",
		other: "{count} extraits CSS ajoutés ou mis à jour.",
	},
	"vaultSetup.hotkeysSet": {
		one: "Raccourcis clavier définis pour {count} commande.",
		many: "Raccourcis clavier définis pour {count} commandes.",
		other: "Raccourcis clavier définis pour {count} commandes.",
	},
	"vaultSetup.corePlugins": "Plugins principaux : activés {on}, désactivés {off}.",
	"vaultSetup.themeDefault": "Passage au thème par défaut",
	"vaultSetup.themeInstalled": "Thème {name} {version} installé",
	"vaultSetup.themeSwitched": "Passage au thème {name}",
	"vaultSetup.noHotkeyManager":
		"Le gestionnaire de raccourcis clavier d’Obsidian n’est pas disponible.",
	"vaultSetup.noCoreManager":
		"Le gestionnaire de plugins principaux d’Obsidian n’est pas disponible.",
	"vaultSetup.noThemeManager": "Le gestionnaire de thèmes d’Obsidian n’est pas disponible.",
	"vaultSetup.snippetFailed": "Impossible d’écrire l’extrait « {name} ».",
	"vaultSetup.themeFailed": "Impossible d’installer le thème « {name} ».",
	"vaultSetup.defaultThemeLabel": "le thème par défaut",
	"vaultSetup.describeThemeSame": "Thème : {label} déjà utilisé",
	"vaultSetup.describeThemeSwitch": "Thème : passerait à {label}",
	"vaultSetup.describeSnippets":
		"Extraits : {total} ({added} nouveaux, {changed} modifiés, {unchanged} inchangés)",
	"vaultSetup.describeHotkeys":
		"Raccourcis clavier : {total} commandes ({changed} seraient modifiées)",
	"vaultSetup.describeCore": "Plugins principaux : activerait {on}, désactiverait {off}",
	"vaultSetup.describeCoreSame": "Plugins principaux : déjà conformes à la liste",
	"vaultSetup.appSettingsSet":
		"Paramètres d’Obsidian modifiés : {count}. Certains ne s’appliquent qu’après la réouverture d’Obsidian.",
	"vaultSetup.coreSettingsSet": "Paramètres de plugins principaux modifiés : {count}.",
	"vaultSetup.bookmarksAdded": "Signets ajoutés : {count}.",
	"vaultSetup.noConfigManager": "Le gestionnaire de paramètres d’Obsidian n’est pas disponible.",
	"vaultSetup.coreSettingsFailed":
		"Impossible d’écrire les paramètres du plugin principal « {id} ».",
	"vaultSetup.bookmarksFailed": "Impossible d’écrire les signets.",
	"vaultSetup.describeApp":
		"Paramètres d’Obsidian : {total} listés ({changed} seraient modifiés)",
	"vaultSetup.describeCoreSettings":
		"Paramètres de plugins principaux : {total} plugins ({changed} seraient modifiés)",
	"vaultSetup.describeBookmarks":
		"Signets : {total} listés ({added} seraient ajoutés)",

	// Export
	"export.finished": "Export terminé",
	"export.failed": "Échec de l’export",
	"export.saved": {
		one: "{count} plugin ({pinned} épinglé, {withSettings} avec paramètres) enregistré dans {listFile} et {settingsFile}.",
		many: "{count} plugins ({pinned} épinglés, {withSettings} avec paramètres) enregistrés dans {listFile} et {settingsFile}.",
		other: "{count} plugins ({pinned} épinglés, {withSettings} avec paramètres) enregistrés dans {listFile} et {settingsFile}.",
	},
	"export.kept": {
		one: " {count} entrée conservée pour des plugins non installés sur cet appareil.",
		many: " {count} entrées conservées pour des plugins non installés sur cet appareil.",
		other: " {count} entrées conservées pour des plugins non installés sur cet appareil.",
	},
	"export.redacted": {
		one: " {count} valeur secrète omise (jetons, mots de passe).",
		many: " {count} valeurs secrètes omises (jetons, mots de passe).",
		other: " {count} valeurs secrètes omises (jetons, mots de passe).",
	},
	"export.snippets": {
		one: "{count} extrait CSS",
		many: "{count} extraits CSS",
		other: "{count} extraits CSS",
	},
	"export.hotkeys": {
		one: "{count} raccourci clavier personnalisé",
		many: "{count} raccourcis clavier personnalisés",
		other: "{count} raccourcis clavier personnalisés",
	},
	"export.vaultSetup":
		" Également enregistrés dans {file} : {theme}, {snippets}, {hotkeys}, vos plugins principaux, les paramètres d’Obsidian et les signets.",
	"export.writeFailed": "impossible d’écrire les fichiers JSON de configuration",

	// Setup packs
	"pack.name": "Configuration de {vault}",
	"pack.savedTitle": "Pack de configuration enregistré",
	"pack.savedSecrets": {
		one: " {count} valeur secrète omise.",
		many: " {count} valeurs secrètes omises.",
		other: " {count} valeurs secrètes omises.",
	},
	"pack.savedBody": {
		one: "{file} dans votre coffre contient {count} plugin.{secrets} Partagez-le (par exemple sous forme de gist GitHub) et d’autres pourront utiliser « Importer un pack de configuration depuis un lien ».",
		many: "{file} dans votre coffre contient {count} plugins.{secrets} Partagez-le (par exemple sous forme de gist GitHub) et d’autres pourront utiliser « Importer un pack de configuration depuis un lien ».",
		other: "{file} dans votre coffre contient {count} plugins.{secrets} Partagez-le (par exemple sous forme de gist GitHub) et d’autres pourront utiliser « Importer un pack de configuration depuis un lien ».",
	},
	"pack.notSavedTitle": "Pack de configuration non enregistré",
	"pack.writeFailed": "impossible d’écrire {file}",
	"pack.loadFailedTitle": "Impossible de charger le pack de configuration",
	"pack.httpsOnly": "seuls les liens https peuvent être chargés",
	"pack.notFound": "{path} est introuvable dans ce coffre",
	"pack.notPackTitle": "Ce n’est pas un pack de configuration",
	"pack.notPackBody":
		"Le fichier n’est pas un pack de configuration créé avec « Exporter un pack de configuration partageable ».",
	"pack.notAddedTitle": "Pack de configuration non ajouté",
	"pack.linkTitle": "Importer un pack de configuration",
	"pack.linkDesc":
		"Collez un lien web vers un pack de configuration (un gist GitHub ou un fichier sur GitHub fonctionne aussi), ou le chemin d’un fichier de pack dans ce coffre. Rien n’est installé avant votre confirmation à l’écran suivant.",
	"pack.linkName": "Lien ou chemin",
	"pack.linkPlaceholder": "Lien ou chemin dans le coffre",
	"pack.load": "Charger",
	"pack.defaultName": "Pack de configuration",
	"pack.from": "Source : {source}",
	"pack.warning":
		"Les plugins communautaires peuvent lire et modifier vos notes. Ne continuez que si vous faites confiance à l’auteur de ce pack.",
	"pack.pluginCount": {
		one: "{count} plugin ({withSettings} avec paramètres)",
		many: "{count} plugins ({withSettings} avec paramètres)",
		other: "{count} plugins ({withSettings} avec paramètres)",
	},
	"pack.devicesOnly": " ({devices} uniquement)",
	"pack.staysOff": " (reste désactivé)",
	"pack.hasSettings": " · paramètres",
	"pack.explain":
		"Le pack est ajouté à votre propre liste de plugins et à vos fichiers de paramètres (il l’emporte en cas de conflit), puis l’import est lancé. « Annuler la dernière modification » restaure les fichiers.",
	"pack.confirm": "Ajouter à ma configuration et importer",
	"pack.pickTitle": "Choisir les plugins du pack",
	"pack.pickDesc":
		"Désactivez ce que vous ne voulez pas partager. Les paramètres des autres plugins sont inclus, sans les secrets.",
	"pack.pickAll": "Tout sélectionner",
	"pack.pickNone": "Tout désélectionner",
	"pack.pickOff": "désactivé",
	"pack.pickSave": "Enregistrer le pack ({count})",
	"pack.pickEmpty": "Aucun plugin communautaire n’est installé.",

	// Updates
	"updates.checking": "Recherche de mises à jour des plugins",
	"updates.checkFinished": "Recherche de mises à jour terminée",
	"updates.found": {
		one: "{count} plugin a une mise à jour.",
		many: "{count} plugins ont des mises à jour.",
		other: "{count} plugins ont des mises à jour.",
	},
	"updates.none": "Tous les plugins communautaires sont à jour.",
	"updates.checkFailed": "Échec de la recherche de mises à jour",
	"updates.updating": "Mise à jour des plugins",
	"updates.step": "Mise à jour de {id} vers {version}",
	"updates.updated": {
		one: "Mis à jour : {done} sur {count} plugin.",
		many: "Mis à jour : {done} sur {count} plugins.",
		other: "Mis à jour : {done} sur {count} plugins.",
	},
	"updates.pinsMoved": {
		one: "{count} épinglage déplacé dans {file}.",
		many: "{count} épinglages déplacés dans {file}.",
		other: "{count} épinglages déplacés dans {file}.",
	},
	"updates.finished": "Mise à jour terminée",
	"updates.finishedProblems": "Mise à jour terminée avec des problèmes",
	"updates.failed": "Échec de la mise à jour",
	"updates.modalTitle": "Mises à jour des plugins",
	"updates.update": "Mettre à jour",
	"updates.updateAll": "Tout mettre à jour ({count})",
	"updates.installed": "Version installée : {version}",
	"updates.needsApp": "{version} nécessite Obsidian {minApp}",
	"updates.pinToo":
		"l’épinglage dans votre liste de plugins ({version}) sera aussi mis à jour",

	// Undo
	"undo.nothingTitle": "Rien à annuler",
	"undo.nothingBody":
		"Aucun import, export ou « Appliquer les paramètres » précédent à annuler.",
	"undo.incompleteTitle": "Annulation incomplète",
	"undo.incompleteBody":
		"Fichiers restaurés : {restored} sur {total}. La sauvegarde est conservée ; voir la console pour plus de détails.",
	"undo.doneTitle": "Annulé : {reason}",
	"undo.doneBody": {
		one: "Sauvegarde du {date} : {count} fichier restauré.{reload}",
		many: "Sauvegarde du {date} : {count} fichiers restaurés.{reload}",
		other: "Sauvegarde du {date} : {count} fichiers restaurés.{reload}",
	},
	"undo.reload": " Les plugins seront rechargés à la fermeture des Paramètres.",
	"undo.failed": "Échec de l’annulation",
	"reason.import": "import",
	"reason.export": "export",
	"reason.apply": "application des paramètres",
	"reason.update": "mise à jour des plugins",
	"reason.pack": "import d’un pack de configuration",
	"reason.settings": "changement de paramètres",

	// Apply settings
	"apply.title": "Application des paramètres des plugins",
	"apply.none": "Aucun paramètre n’a été écrit.",
	"apply.done": "Paramètres appliqués",
	"apply.plugins": {
		one: "{count} plugin",
		many: "{count} plugins",
		other: "{count} plugins",
	},
	"apply.deferred": {
		one: "{plugins} mis à jour. {count} plugin actif sera rechargé à la fermeture des Paramètres.",
		many: "{plugins} mis à jour. {count} plugins actifs seront rechargés à la fermeture des Paramètres.",
		other: "{plugins} mis à jour. {count} plugins actifs seront rechargés à la fermeture des Paramètres.",
	},
	"apply.restarted": "{plugins} mis à jour (rechargés : {restarted}).",
	"apply.updated": "{plugins} mis à jour.",
	"apply.failed": "Échec de l’application des paramètres",
	"apply.fsError": "Impossible d’accéder au système de fichiers : {error}",
	"apply.noSettingsFile":
		"Aucun fichier {file} trouvé, les paramètres ne sont pas appliqués.",
	"apply.cannotWrite":
		"Impossible d’écrire les paramètres du plugin {id}. Vérifiez les autorisations du fichier.",
	"apply.writeFailed": "Échec de l’écriture de data.json pour le plugin {id} : {error}",

	// Installing a plugin (shown in the import summary)
	"install.invalidId": "Identifiant de plugin fourni non valide.",
	"install.invalidIdNamed": "Identifiant de plugin non valide : « {id} ».",
	"install.noApi":
		"L’API installPlugin d’Obsidian n’est pas disponible. Mettez Obsidian à jour et réessayez.",
	"install.notInRegistry":
		"Plugin « {id} » introuvable dans le registre des plugins communautaires d’Obsidian.",
	"install.badRepoInfo":
		"Le plugin « {id} » a des informations de dépôt non valides dans le registre.",
	"install.badRepoFormat": "Le plugin « {id} » a un format de dépôt non valide : {repo}",
	"install.noPinnedManifest":
		"Impossible de récupérer le manifeste de « {id} » {version}. GitHub limite peut-être les requêtes.",
	"install.noRelease": "Aucune version adaptée trouvée pour le plugin « {id} ».",
	"install.badManifest": "manifest.json non valide pour « {id} ».",
	"install.failed": "Échec de l’installation du plugin « {id} » : {error}",
	"enable.noApi":
		"Impossible d’accéder à l’API des plugins. Les plugins devront être activés manuellement.",

	// Files and the plugin list
	"file.readFailed": "Échec de la lecture du fichier : {error}",
	"file.writeFailed": "Échec de l’écriture du fichier : {error}",
	"file.empty": "{file} est vide. Ajoutez du contenu, sinon le fichier sera recréé.",
	"file.invalidJson":
		"JSON non valide dans {file} : {error}. Vérifiez le format du fichier.",
	"list.notArray":
		"{file} doit contenir un tableau d’identifiants de plugins ou d’objets { id, version }.",
	"list.skipped": {
		one: "{count} entrée non valide ignorée dans {file}. Voir la console.",
		many: "{count} entrées non valides ignorées dans {file}. Voir la console.",
		other: "{count} entrées non valides ignorées dans {file}. Voir la console.",
	},

	// Import preview
	"preview.title": "Aperçu de l’import",
	"preview.failed": "Échec de l’aperçu : {error}",
	"preview.listNotFound": "Aperçu : {file} introuvable.",
	"preview.listInvalidJson": "Aperçu : JSON non valide dans {file}.",
	"preview.otherDevice": "Prévu pour {devices} uniquement ; ignoré sur cet appareil",
	"preview.notOnDevice": "Non appliqué sur cet appareil",
	"preview.installPinned": "Installerait @{version}",
	"preview.installLatest": "Installerait (dernière version stable)",
	"preview.leftOff": ", laissé désactivé",
	"preview.alreadyPinned": "Déjà à la version épinglée {version}",
	"preview.wouldChange": "Changerait {from} → {to}",
	"preview.unknownVersion": "inconnue",
	"preview.installedSkip": "Déjà installé @{version} (non épinglé, ignoré)",
	"preview.installedSkipNoVersion": "Déjà installé (non épinglé, ignoré)",
	"preview.settingsMissing": "{file} manquant",
	"preview.noEntry": "Aucune entrée de paramètres",
	"preview.blocked":
		"Des paramètres existent, mais « Appliquer les paramètres à l’installation » est désactivé et le plugin est absent",
	"preview.afterInstall": "Appliquerait les paramètres après l’installation",
	"preview.afterRepin": "Appliquerait les paramètres après le changement de version",
	"preview.viaApply":
		"S’appliquerait avec « Appliquer les paramètres » ou la synchronisation au démarrage",
	"preview.changes": {
		one: " ({count} modification)",
		many: " ({count} modifications)",
		other: " ({count} modifications)",
	},
	"preview.matches": " (déjà identique)",
	"preview.showChanges": {
		one: "Afficher {count} modification de paramètre",
		many: "Afficher {count} modifications de paramètres",
		other: "Afficher {count} modifications de paramètres",
	},
	"preview.fileNotFound": "{file} est introuvable.",
	"preview.empty": "Aucun plugin dans la liste.",
	"preview.vaultSetupInvalid": "{file} n’est pas valide",
	"preview.vaultSetupInvalidJson": "{file} n’est pas un JSON valide",
	"preview.badgeInstall": "Installer",
	"preview.badgeRepin": "Réépingler",
	"preview.badgeOkPinned": "Épinglé OK",
	"preview.badgeOtherDevice": "Autre appareil",
	"preview.badgeSkip": "Ignorer",
	"preview.badgeSettings": "Paramètres",
	"preview.badgeNoSettings": "Sans paramètres",
	"preview.badgeBlocked": "Paramètres bloqués",
	"preview.badgeNoFile": "Aucun fichier de paramètres",
	"preview.badgeNotHere": "Pas ici",
	"preview.statOtherDevices": "Autres appareils",

	// Settings tab
	"settings.warningName": "Avertissement de sécurité",
	"settings.warningPrefix": "Avertissement de sécurité : ",
	"settings.warningDesc":
		"Ce plugin peut télécharger et installer des plugins communautaires. Ne l’utilisez qu’avec des coffres de confiance, et vérifiez votre liste de plugins avant d’activer l’installation automatique.",
	"settings.previewName": "Aperçu de l’import",
	"settings.previewDesc":
		"Voir quels plugins seraient installés, ignorés ou mis à jour, et quels paramètres changeraient, sans modifier votre coffre.",
	"settings.previewButton": "Aperçu",
	"settings.exportName": "Exporter la configuration des plugins",
	"settings.exportDesc":
		"Enregistrer vos plugins communautaires installés et leurs paramètres dans les fichiers JSON de {dir}.",
	"settings.exportButton": "Exporter",
	"settings.importName": "Importer la configuration des plugins",
	"settings.importDesc":
		"Installer les plugins du fichier de liste. L’activation et l’application des paramètres suivent les options ci-dessous.",
	"settings.importButton": "Importer",
	"settings.shareName": "Partager votre configuration",
	"settings.shareDesc":
		"Choisir des plugins installés et les enregistrer dans setup-pack.json dans votre coffre, sans les secrets, pour les partager avec d’autres.",
	"settings.shareButton": "Exporter le pack",
	"settings.importPackName": "Importer un pack de configuration",
	"settings.importPackDesc":
		"Ajouter le pack de configuration de quelqu’un d’autre au vôtre depuis un lien. Vous voyez son contenu avant toute installation.",
	"settings.importPackButton": "Importer depuis un lien",
	"settings.updatesName": "Rechercher des mises à jour",
	"settings.updatesDesc":
		"Voir quels plugins communautaires installés ont des versions plus récentes, et les mettre à jour. Les épinglages de votre liste de plugins suivent.",
	"settings.updatesButton": "Vérifier",
	"settings.undoName": "Annuler la dernière modification",
	"settings.undoDesc":
		"Remettre les fichiers de paramètres et de configuration dans leur état d’avant le dernier import, la dernière mise à jour des paramètres ou le dernier export. Les plugins installés restent installés.",
	"settings.undoButton": "Annuler",
	"settings.applyName": "Appliquer les paramètres",
	"settings.applyDesc":
		"Mettre à jour les plugins installés à partir du fichier de paramètres, sans les réinstaller.",
	"settings.applyButton": "Appliquer",
	"settings.autoInstallName": "Installer automatiquement les plugins au démarrage",
	"settings.autoInstallDesc":
		"Au démarrage d’Obsidian, installer les plugins de votre liste qui ne sont pas encore installés.",
	"settings.autoEnableName": "Activer automatiquement les plugins après l’installation",
	"settings.autoEnableDesc": "Activer les plugins une fois installés.",
	"settings.applyOnInstallName": "Appliquer les paramètres à l’installation",
	"settings.applyOnInstallDesc":
		"Après l’installation d’un plugin, appliquer ses paramètres depuis votre fichier de paramètres.",
	"settings.mergeName": "Fusionner les paramètres au lieu de les remplacer",
	"settings.mergeDesc":
		"Mettre à jour les paramètres correspondants et conserver le reste. Si désactivé, les paramètres enregistrés du plugin sont entièrement remplacés.",
	"settings.syncOnStartupName": "Synchroniser les paramètres à chaque démarrage",
	"settings.syncOnStartupDesc":
		"À chaque démarrage d’Obsidian, appliquer votre fichier de paramètres aux plugins installés.",
	"settings.mobileName": "Exécuter les actions automatiques sur mobile",
	"settings.mobileDesc":
		"Autoriser l’installation automatique et la synchronisation des paramètres au démarrage sur téléphones et tablettes. Désactivé par défaut, pour qu’une configuration d’ordinateur synchronisée ne lance pas de téléchargements sur les données mobiles.",
	"settings.redactName": "Omettre les secrets à l’export",
	"settings.redactDesc":
		"Remplacer les jetons, mots de passe et clés d’API par un espace réservé dans le fichier de paramètres exporté. L’import n’écrase jamais une vraie valeur par cet espace réservé.",
	"settings.extraSecretsName": "Noms de paramètres secrets supplémentaires",
	"settings.extraSecretsDesc":
		"Noms de paramètres à omettre également, séparés par des virgules, par exemple : licenseCode, endpoint",
	"settings.extraSecretsPlaceholder": "licenseCode, endpoint",
	"settings.syncVaultSetupName":
		"Synchroniser les paramètres d’Obsidian, le thème, les extraits, les raccourcis clavier et les plugins principaux",
	"settings.syncVaultSetupDesc":
		"L’export enregistre dans vault-setup.json vos paramètres d’Obsidian, votre thème communautaire, vos extraits CSS, vos raccourcis clavier personnalisés, les plugins principaux avec leurs paramètres et vos signets. L’import les applique sur l’autre appareil.",
	"settings.logLevelName": "Niveau de journalisation",
	"settings.logLevelDesc":
		"Quantité de détails affichés dans la console en cas de problème. Laissez sur « Erreur », sauf pour un dépannage.",
	"settings.logDebug": "Débogage (le plus détaillé)",
	"settings.logInfo": "Info",
	"settings.logWarn": "Avertissement",
	"settings.logError": "Erreur (recommandé)",
	"settings.logNone": "Aucun",
};
