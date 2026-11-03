import type { LocaleMessages } from "../index";

// Polish. Terms follow Obsidian's Polish UI: wtyczki społeczności,
// wtyczki główne, skróty klawiszowe, fragmenty CSS, motyw, sejf.
export const pl: LocaleMessages = {
	// Commands
	"cmd.export": "Eksportuj konfigurację wtyczek do JSON",
	"cmd.preview": "Podgląd importu konfiguracji wtyczek",
	"cmd.import": "Importuj konfigurację wtyczek z JSON",
	"cmd.apply": "Zastosuj ustawienia z JSON",
	"cmd.exportPack": "Eksportuj pakiet konfiguracji do udostępnienia",
	"cmd.importPack": "Importuj pakiet konfiguracji z linku",
	"cmd.checkUpdates": "Sprawdź aktualizacje wtyczek",
	"cmd.undo": "Cofnij ostatni import, eksport lub zmianę ustawień",

	// Shared
	"common.unknownError": "Nieznany błąd",
	"common.close": "Zamknij",
	"common.cancel": "Anuluj",
	"common.busy": "Trwa już inny import, eksport lub aktualizacja ustawień.",
	"common.startupFailed":
		"Instalacja przy uruchomieniu nie powiodła się. Szczegóły w konsoli.",
	"common.and": " i ",
	"device.desktop": "komputer",
	"device.mobile": "urządzenie mobilne",
	"progress.step": "{current} z {total} · {detail}",
	"net.rateLimit":
		"Przekroczono limit zapytań GitHub lub odmówiono dostępu. Odczekaj kilka minut i spróbuj ponownie.",

	// Import
	"import.title": "Importowanie konfiguracji wtyczek",
	"import.finished": "Import zakończony",
	"import.finishedProblems": "Import zakończony z problemami",
	"import.failed": "Import nie powiódł się",
	"import.createdEmpty":
		"Utworzono pusty plik {file}. Dodaj do niego ID wtyczek i zaimportuj ponownie.",
	"import.cannotCreate": "Nie można utworzyć {file}. Sprawdź uprawnienia do plików.",
	"import.empty": "Plik {file} jest pusty. Dodaj do niego ID wtyczek i zaimportuj ponownie.",
	"import.invalidJson": "Nieprawidłowy JSON w {file}: {error}.",
	"import.noPlugins": "Brak wtyczek do zainstalowania.",
	"import.notForMobile":
		"Na liście nie ma wtyczek przeznaczonych dla tego urządzenia mobilnego.",
	"import.notForDesktop": "Na liście nie ma wtyczek przeznaczonych dla tego komputera.",
	"import.installing": "Instalowanie {label}",
	"import.turningOn": "Włączanie {id}",
	"import.couldNotEnable": "Nie udało się włączyć: {ids}.",
	"import.autoEnableOff":
		"Automatyczne włączanie jest wyłączone, więc nowe wtyczki pozostają wyłączone.",
	"import.skippedDesktopOnly": {
		one: "Na tym urządzeniu pominięto {count} wtyczkę przeznaczoną tylko dla komputera.",
		few: "Na tym urządzeniu pominięto {count} wtyczki przeznaczone tylko dla komputera.",
		many: "Na tym urządzeniu pominięto {count} wtyczek przeznaczonych tylko dla komputera.",
		other: "Na tym urządzeniu pominięto {count} wtyczki przeznaczonej tylko dla komputera.",
	},
	"import.otherDevices": {
		one: "{count} wtyczka jest przeznaczona tylko dla innych urządzeń.",
		few: "{count} wtyczki są przeznaczone tylko dla innych urządzeń.",
		many: "{count} wtyczek jest przeznaczonych tylko dla innych urządzeń.",
		other: "{count} wtyczki jest przeznaczone tylko dla innych urządzeń.",
	},
	"import.keptOff": "Pozostawiono wyłączone zgodnie z listą: {count}.",
	"import.changed": {
		one: "Zainstalowano lub zaktualizowano {count} wtyczkę",
		few: "Zainstalowano lub zaktualizowano {count} wtyczki",
		many: "Zainstalowano lub zaktualizowano {count} wtyczek",
		other: "Zainstalowano lub zaktualizowano {count} wtyczki",
	},
	"import.upToDate": "Wszystko było już aktualne",
	"import.summary": "{summary} (OK: {ok} z {total}).",
	"import.error": "{error}. Szczegóły w konsoli.",

	// Vault setup (theme, snippets, hotkeys, core plugins)
	"vaultSetup.invalid": "Plik {file} jest nieprawidłowy, więc został pominięty.",
	"vaultSetup.applying":
		"Stosowanie motywu, fragmentów CSS, skrótów klawiszowych i wtyczek głównych",
	"vaultSetup.snippetsWritten": {
		one: "Dodano lub zaktualizowano {count} fragment CSS.",
		few: "Dodano lub zaktualizowano {count} fragmenty CSS.",
		many: "Dodano lub zaktualizowano {count} fragmentów CSS.",
		other: "Dodano lub zaktualizowano {count} fragmentu CSS.",
	},
	"vaultSetup.hotkeysSet": {
		one: "Ustawiono skróty klawiszowe dla {count} polecenia.",
		few: "Ustawiono skróty klawiszowe dla {count} poleceń.",
		many: "Ustawiono skróty klawiszowe dla {count} poleceń.",
		other: "Ustawiono skróty klawiszowe dla {count} polecenia.",
	},
	"vaultSetup.corePlugins": "Wtyczki główne: włączono {on}, wyłączono {off}.",
	"vaultSetup.themeDefault": "Przełączono na motyw domyślny",
	"vaultSetup.themeInstalled": "Zainstalowano motyw {name} {version}",
	"vaultSetup.themeSwitched": "Przełączono na motyw {name}",
	"vaultSetup.noHotkeyManager": "Menedżer skrótów klawiszowych Obsidian jest niedostępny.",
	"vaultSetup.noCoreManager": "Menedżer wtyczek głównych Obsidian jest niedostępny.",
	"vaultSetup.noThemeManager": "Menedżer motywów Obsidian jest niedostępny.",
	"vaultSetup.snippetFailed": "Nie udało się zapisać fragmentu „{name}”.",
	"vaultSetup.themeFailed": "Nie udało się zainstalować motywu „{name}”.",
	"vaultSetup.defaultThemeLabel": "motyw domyślny",
	"vaultSetup.describeThemeSame": "Motyw: bez zmian ({label})",
	"vaultSetup.describeThemeSwitch": "Motyw zostanie zmieniony na: {label}",
	"vaultSetup.describeSnippets":
		"Fragmenty CSS: {total} (nowe: {added}, zmienione: {changed}, bez zmian: {unchanged})",
	"vaultSetup.describeHotkeys":
		"Skróty klawiszowe: liczba poleceń {total} (do zmiany: {changed})",
	"vaultSetup.describeCore": "Wtyczki główne: do włączenia {on}, do wyłączenia {off}",
	"vaultSetup.describeCoreSame": "Wtyczki główne: już zgodne z listą",

	// Export
	"export.finished": "Eksport zakończony",
	"export.failed": "Eksport nie powiódł się",
	"export.saved": {
		one: "Zapisano {count} wtyczkę (przypięte: {pinned}, z ustawieniami: {withSettings}) w {listFile} i {settingsFile}.",
		few: "Zapisano {count} wtyczki (przypięte: {pinned}, z ustawieniami: {withSettings}) w {listFile} i {settingsFile}.",
		many: "Zapisano {count} wtyczek (przypięte: {pinned}, z ustawieniami: {withSettings}) w {listFile} i {settingsFile}.",
		other: "Zapisano {count} wtyczki (przypięte: {pinned}, z ustawieniami: {withSettings}) w {listFile} i {settingsFile}.",
	},
	"export.kept": {
		one: " Zachowano {count} wpis dla wtyczek niezainstalowanych na tym urządzeniu.",
		few: " Zachowano {count} wpisy dla wtyczek niezainstalowanych na tym urządzeniu.",
		many: " Zachowano {count} wpisów dla wtyczek niezainstalowanych na tym urządzeniu.",
		other: " Zachowano {count} wpisu dla wtyczek niezainstalowanych na tym urządzeniu.",
	},
	"export.redacted": {
		one: " Pominięto {count} tajną wartość (tokeny, hasła).",
		few: " Pominięto {count} tajne wartości (tokeny, hasła).",
		many: " Pominięto {count} tajnych wartości (tokeny, hasła).",
		other: " Pominięto {count} tajnej wartości (tokeny, hasła).",
	},
	"export.snippets": {
		one: "{count} fragment CSS",
		few: "{count} fragmenty CSS",
		many: "{count} fragmentów CSS",
		other: "{count} fragmentu CSS",
	},
	"export.hotkeys": {
		one: "{count} własny skrót klawiszowy",
		few: "{count} własne skróty klawiszowe",
		many: "{count} własnych skrótów klawiszowych",
		other: "{count} własnego skrótu klawiszowego",
	},
	"export.vaultSetup":
		" W {file} zapisano też: {theme}, {snippets}, {hotkeys} oraz wtyczki główne.",
	"export.writeFailed": "nie udało się zapisać plików JSON z konfiguracją",

	// Setup packs
	"pack.name": "Konfiguracja {vault}",
	"pack.savedTitle": "Zapisano pakiet konfiguracji",
	"pack.savedSecrets": {
		one: " Pominięto {count} tajną wartość.",
		few: " Pominięto {count} tajne wartości.",
		many: " Pominięto {count} tajnych wartości.",
		other: " Pominięto {count} tajnej wartości.",
	},
	"pack.savedBody": {
		one: "Plik {file} w twoim sejfie zawiera {count} wtyczkę.{secrets} Udostępnij go (na przykład jako GitHub gist), a inni będą mogli użyć polecenia „Importuj pakiet konfiguracji z linku”.",
		few: "Plik {file} w twoim sejfie zawiera {count} wtyczki.{secrets} Udostępnij go (na przykład jako GitHub gist), a inni będą mogli użyć polecenia „Importuj pakiet konfiguracji z linku”.",
		many: "Plik {file} w twoim sejfie zawiera {count} wtyczek.{secrets} Udostępnij go (na przykład jako GitHub gist), a inni będą mogli użyć polecenia „Importuj pakiet konfiguracji z linku”.",
		other: "Plik {file} w twoim sejfie zawiera {count} wtyczki.{secrets} Udostępnij go (na przykład jako GitHub gist), a inni będą mogli użyć polecenia „Importuj pakiet konfiguracji z linku”.",
	},
	"pack.notSavedTitle": "Nie zapisano pakietu konfiguracji",
	"pack.writeFailed": "nie udało się zapisać {file}",
	"pack.loadFailedTitle": "Nie udało się wczytać pakietu konfiguracji",
	"pack.httpsOnly": "można wczytywać tylko linki https",
	"pack.notFound": "nie znaleziono {path} w tym sejfie",
	"pack.notPackTitle": "To nie jest pakiet konfiguracji",
	"pack.notPackBody":
		"Ten plik nie jest pakietem konfiguracji utworzonym poleceniem „Eksportuj pakiet konfiguracji do udostępnienia”.",
	"pack.notAddedTitle": "Nie dodano pakietu konfiguracji",
	"pack.linkTitle": "Importuj pakiet konfiguracji",
	"pack.linkDesc":
		"Wklej link do pakietu konfiguracji (działa też GitHub gist lub plik w serwisie GitHub) albo ścieżkę do pliku pakietu w tym sejfie. Nic nie zostanie zainstalowane, dopóki nie potwierdzisz na następnym ekranie.",
	"pack.linkName": "Link lub ścieżka",
	"pack.linkPlaceholder": "Link lub ścieżka w sejfie",
	"pack.load": "Wczytaj",
	"pack.defaultName": "Pakiet konfiguracji",
	"pack.from": "Źródło: {source}",
	"pack.warning":
		"Wtyczki społeczności mogą odczytywać i zmieniać twoje notatki. Kontynuuj tylko wtedy, gdy ufasz autorowi tego pakietu.",
	"pack.pluginCount": {
		one: "{count} wtyczka (z ustawieniami: {withSettings})",
		few: "{count} wtyczki (z ustawieniami: {withSettings})",
		many: "{count} wtyczek (z ustawieniami: {withSettings})",
		other: "{count} wtyczki (z ustawieniami: {withSettings})",
	},
	"pack.devicesOnly": " (tylko {devices})",
	"pack.staysOff": " (pozostanie wyłączona)",
	"pack.hasSettings": " · ustawienia",
	"pack.explain":
		"Pakiet zostanie dodany do twojej listy wtyczek i plików ustawień (gdy oba zawierają tę samą pozycję, wygrywa pakiet), a następnie uruchomi się import. „Cofnij ostatnią zmianę” przywróci poprzednie pliki.",
	"pack.confirm": "Dodaj do mojej konfiguracji i importuj",

	// Updates
	"updates.checking": "Sprawdzanie aktualizacji wtyczek",
	"updates.checkFinished": "Sprawdzanie aktualizacji zakończone",
	"updates.found": {
		one: "{count} wtyczka ma aktualizację.",
		few: "{count} wtyczki mają aktualizacje.",
		many: "{count} wtyczek ma aktualizacje.",
		other: "{count} wtyczki ma aktualizacje.",
	},
	"updates.none": "Wszystkie wtyczki społeczności są aktualne.",
	"updates.checkFailed": "Sprawdzanie aktualizacji nie powiodło się",
	"updates.updating": "Aktualizowanie wtyczek",
	"updates.step": "Aktualizowanie {id} do {version}",
	"updates.updated": {
		one: "Zaktualizowano {done} z {count} wtyczki.",
		few: "Zaktualizowano {done} z {count} wtyczek.",
		many: "Zaktualizowano {done} z {count} wtyczek.",
		other: "Zaktualizowano {done} z {count} wtyczki.",
	},
	"updates.pinsMoved": {
		one: "Zaktualizowano {count} przypiętą wersję w {file}.",
		few: "Zaktualizowano {count} przypięte wersje w {file}.",
		many: "Zaktualizowano {count} przypiętych wersji w {file}.",
		other: "Zaktualizowano {count} przypiętej wersji w {file}.",
	},
	"updates.finished": "Aktualizacja zakończona",
	"updates.finishedProblems": "Aktualizacja zakończona z problemami",
	"updates.failed": "Aktualizacja nie powiodła się",
	"updates.modalTitle": "Aktualizacje wtyczek",
	"updates.update": "Aktualizuj",
	"updates.updateAll": "Aktualizuj wszystkie ({count})",
	"updates.installed": "Zainstalowana: {version}",
	"updates.needsApp": "{version} wymaga Obsidian {minApp}",
	"updates.pinToo":
		"przypięta wersja na twojej liście wtyczek ({version}) też zostanie zaktualizowana",

	// Undo
	"undo.nothingTitle": "Nic do cofnięcia",
	"undo.nothingBody":
		"Brak wcześniejszej operacji „Importuj”, „Zastosuj ustawienia” ani „Eksportuj” do cofnięcia.",
	"undo.incompleteTitle": "Cofanie niepełne",
	"undo.incompleteBody":
		"Przywrócono plików: {restored} z {total}. Kopia zapasowa została zachowana; szczegóły w konsoli.",
	"undo.doneTitle": "Cofnięto: {reason}",
	"undo.doneBody": {
		one: "Kopia z {date}: przywrócono {count} plik.{reload}",
		few: "Kopia z {date}: przywrócono {count} pliki.{reload}",
		many: "Kopia z {date}: przywrócono {count} plików.{reload}",
		other: "Kopia z {date}: przywrócono {count} pliku.{reload}",
	},
	"undo.reload": " Wtyczki zostaną przeładowane po zamknięciu ustawień.",
	"undo.failed": "Cofanie nie powiodło się",
	"reason.import": "import",
	"reason.export": "eksport",
	"reason.apply": "zastosowanie ustawień",
	"reason.update": "aktualizacja wtyczek",
	"reason.pack": "import pakietu konfiguracji",
	"reason.settings": "zmiana ustawień",

	// Apply settings
	"apply.title": "Stosowanie ustawień wtyczek",
	"apply.none": "Nie zapisano żadnych ustawień.",
	"apply.done": "Zastosowano ustawienia",
	"apply.plugins": {
		one: "{count} wtyczkę",
		few: "{count} wtyczki",
		many: "{count} wtyczek",
		other: "{count} wtyczki",
	},
	"apply.deferred": {
		one: "Zaktualizowano {plugins}. {count} uruchomiona wtyczka zostanie przeładowana po zamknięciu ustawień.",
		few: "Zaktualizowano {plugins}. {count} uruchomione wtyczki zostaną przeładowane po zamknięciu ustawień.",
		many: "Zaktualizowano {plugins}. {count} uruchomionych wtyczek zostanie przeładowanych po zamknięciu ustawień.",
		other: "Zaktualizowano {plugins}. {count} uruchomionej wtyczki zostanie przeładowane po zamknięciu ustawień.",
	},
	"apply.restarted": "Zaktualizowano {plugins} (przeładowano: {restarted}).",
	"apply.updated": "Zaktualizowano {plugins}.",
	"apply.failed": "Stosowanie ustawień nie powiodło się",
	"apply.fsError": "Brak dostępu do systemu plików: {error}",
	"apply.noSettingsFile": "Nie znaleziono pliku {file}, stosowanie ustawień pominięte.",
	"apply.cannotWrite":
		"Nie można zapisać ustawień wtyczki {id}. Sprawdź uprawnienia do plików.",
	"apply.writeFailed": "Nie udało się zapisać data.json dla wtyczki {id}: {error}",

	// Installing a plugin (shown in the import summary)
	"install.invalidId": "Podano nieprawidłowe ID wtyczki.",
	"install.invalidIdNamed": "Nieprawidłowe ID wtyczki: „{id}”.",
	"install.noApi":
		"API installPlugin w Obsidian jest niedostępne. Zaktualizuj Obsidian i spróbuj ponownie.",
	"install.notInRegistry":
		"Nie znaleziono wtyczki „{id}” w rejestrze wtyczek społeczności Obsidian.",
	"install.badRepoInfo": "Wtyczka „{id}” ma nieprawidłowe dane repozytorium w rejestrze.",
	"install.badRepoFormat": "Wtyczka „{id}” ma nieprawidłowy format repozytorium: {repo}",
	"install.noPinnedManifest":
		"Nie udało się pobrać manifestu dla „{id}” {version}. GitHub może ograniczać liczbę zapytań.",
	"install.noRelease": "Nie znaleziono odpowiedniego wydania wtyczki „{id}”.",
	"install.badManifest": "Nieprawidłowy manifest.json dla „{id}”.",
	"install.failed": "Nie udało się zainstalować wtyczki „{id}”: {error}",
	"enable.noApi": "Brak dostępu do API wtyczek. Wtyczki trzeba będzie włączyć ręcznie.",

	// Files and the plugin list
	"file.readFailed": "Nie udało się odczytać pliku: {error}",
	"file.writeFailed": "Nie udało się zapisać pliku: {error}",
	"file.empty":
		"Plik {file} jest pusty. Dodaj zawartość, w przeciwnym razie plik zostanie utworzony ponownie.",
	"file.invalidJson": "Nieprawidłowy JSON w {file}: {error}. Sprawdź format pliku.",
	"list.notArray":
		"{file} musi zawierać tablicę ID wtyczek lub obiektów { id, version }.",
	"list.skipped": {
		one: "Pominięto {count} nieprawidłowy wpis w {file}. Szczegóły w konsoli.",
		few: "Pominięto {count} nieprawidłowe wpisy w {file}. Szczegóły w konsoli.",
		many: "Pominięto {count} nieprawidłowych wpisów w {file}. Szczegóły w konsoli.",
		other: "Pominięto {count} nieprawidłowego wpisu w {file}. Szczegóły w konsoli.",
	},

	// Import preview
	"preview.title": "Podgląd importu",
	"preview.failed": "Podgląd nie powiódł się: {error}",
	"preview.listNotFound": "Podgląd: nie znaleziono {file}.",
	"preview.listInvalidJson": "Podgląd: nieprawidłowy JSON w {file}.",
	"preview.otherDevice": "Tylko dla: {devices}; pominięto na tym urządzeniu",
	"preview.notOnDevice": "Nie dotyczy tego urządzenia",
	"preview.installPinned": "Zostanie zainstalowana @{version}",
	"preview.installLatest": "Zostanie zainstalowana (najnowsza stabilna)",
	"preview.leftOff": ", pozostanie wyłączona",
	"preview.alreadyPinned": "Już w przypiętej wersji {version}",
	"preview.wouldChange": "Zostanie zmieniona {from} → {to}",
	"preview.unknownVersion": "nieznana",
	"preview.installedSkip": "Już zainstalowana @{version} (nieprzypięta, pominięta)",
	"preview.installedSkipNoVersion": "Już zainstalowana (nieprzypięta, pominięta)",
	"preview.settingsMissing": "Brak {file}",
	"preview.noEntry": "Brak wpisu ustawień",
	"preview.blocked":
		"Ustawienia istnieją, ale opcja „Stosuj ustawienia podczas instalacji” jest wyłączona, a wtyczki brak",
	"preview.afterInstall": "Ustawienia zostaną zastosowane po instalacji",
	"preview.afterRepin": "Ustawienia zostaną zastosowane po zmianie wersji",
	"preview.viaApply":
		"Zostaną zastosowane przez „Zastosuj ustawienia” lub synchronizację przy uruchomieniu",
	"preview.changes": {
		one: " ({count} zmiana)",
		few: " ({count} zmiany)",
		many: " ({count} zmian)",
		other: " ({count} zmiany)",
	},
	"preview.matches": " (już zgodne)",
	"preview.showChanges": {
		one: "Pokaż {count} zmianę ustawień",
		few: "Pokaż {count} zmiany ustawień",
		many: "Pokaż {count} zmian ustawień",
		other: "Pokaż {count} zmiany ustawień",
	},
	"preview.fileNotFound": "Nie znaleziono {file}.",
	"preview.empty": "Brak wtyczek na liście.",
	"preview.vaultSetupInvalid": "{file} jest nieprawidłowy",
	"preview.vaultSetupInvalidJson": "{file} nie jest prawidłowym plikiem JSON",
	"preview.badgeInstall": "Instalacja",
	"preview.badgeRepin": "Zmiana wersji",
	"preview.badgeOkPinned": "Przypięta OK",
	"preview.badgeOtherDevice": "Inne urządzenie",
	"preview.badgeSkip": "Pominięta",
	"preview.badgeSettings": "Ustawienia",
	"preview.badgeNoSettings": "Bez ustawień",
	"preview.badgeBlocked": "Ustawienia zablokowane",
	"preview.badgeNoFile": "Brak pliku ustawień",
	"preview.badgeNotHere": "Nie tutaj",
	"preview.statOtherDevices": "Inne urządzenia",

	// Settings tab
	"settings.warningName": "Ostrzeżenie dotyczące bezpieczeństwa",
	"settings.warningPrefix": "Ostrzeżenie dotyczące bezpieczeństwa: ",
	"settings.warningDesc":
		"Ta wtyczka może pobierać i instalować wtyczki społeczności. Używaj jej tylko w zaufanych sejfach i przejrzyj listę wtyczek, zanim włączysz automatyczną instalację.",
	"settings.actionsName": "Eksport / import",
	"settings.actionsDesc": "Zarządzaj listą wtyczek i plikami ustawień w {dir}.",
	"settings.previewName": "Podgląd importu",
	"settings.previewDesc":
		"Zobacz, które wtyczki zostaną zainstalowane, pominięte lub zaktualizowane i które ustawienia się zmienią — bez zmieniania sejfu.",
	"settings.previewButton": "Podgląd",
	"settings.exportName": "Eksport konfiguracji wtyczek",
	"settings.exportDesc":
		"Zapisz zainstalowane wtyczki społeczności i ich ustawienia w plikach JSON w {dir}.",
	"settings.exportButton": "Eksportuj",
	"settings.importName": "Import konfiguracji wtyczek",
	"settings.importDesc":
		"Zainstaluj wtyczki z pliku listy. Włączanie wtyczek i stosowanie ustawień zależy od opcji poniżej.",
	"settings.importButton": "Importuj",
	"settings.shareName": "Udostępnij swoją konfigurację",
	"settings.shareDesc":
		"Zapisz wszystko, co masz zainstalowane, jako setup-pack.json w swoim sejfie, bez tajnych danych, aby udostępnić to innym.",
	"settings.shareButton": "Eksportuj pakiet",
	"settings.importPackName": "Importuj pakiet konfiguracji",
	"settings.importPackDesc":
		"Dodaj cudzy pakiet konfiguracji do swojej z linku. Zobaczysz jego zawartość, zanim cokolwiek zostanie zainstalowane.",
	"settings.importPackButton": "Importuj z linku",
	"settings.importPackShortButton": "Importuj pakiet",
	"settings.updatesName": "Sprawdź aktualizacje",
	"settings.updatesDesc":
		"Zobacz, które zainstalowane wtyczki społeczności mają nowsze wersje, i zaktualizuj je. Przypięte wersje na liście wtyczek też zostaną zaktualizowane.",
	"settings.updatesButton": "Sprawdź",
	"settings.updatesLongButton": "Sprawdź aktualizacje",
	"settings.undoName": "Cofnij ostatnią zmianę",
	"settings.undoDesc":
		"Przywróć ustawienia i pliki konfiguracji do stanu sprzed ostatniego importu, aktualizacji ustawień lub eksportu. Zainstalowane wtyczki pozostaną zainstalowane.",
	"settings.undoButton": "Cofnij",
	"settings.applyName": "Zastosuj ustawienia",
	"settings.applyDesc":
		"Zaktualizuj zainstalowane wtyczki na podstawie pliku ustawień bez ponownej instalacji.",
	"settings.applyButton": "Zastosuj",
	"settings.autoInstallName": "Automatycznie instaluj wtyczki przy uruchomieniu",
	"settings.autoInstallDesc":
		"Po uruchomieniu Obsidian instaluj wtyczki z listy, które nie są jeszcze zainstalowane.",
	"settings.autoEnableName": "Automatycznie włączaj wtyczki po instalacji",
	"settings.autoEnableDesc": "Włączaj wtyczki po ich zainstalowaniu.",
	"settings.applyOnInstallName": "Stosuj ustawienia podczas instalacji",
	"settings.applyOnInstallDesc":
		"Po zainstalowaniu wtyczki zastosuj jej ustawienia z pliku ustawień.",
	"settings.mergeName": "Scalaj ustawienia zamiast je zastępować",
	"settings.mergeDesc":
		"Aktualizuj pasujące ustawienia, a resztę zachowaj. Gdy wyłączone, zapisane ustawienia wtyczki są całkowicie zastępowane.",
	"settings.syncOnStartupName": "Synchronizuj ustawienia przy każdym uruchomieniu",
	"settings.syncOnStartupDesc":
		"Przy każdym uruchomieniu Obsidian stosuj plik ustawień do zainstalowanych wtyczek.",
	"settings.mobileName": "Uruchamiaj automatyczne działania na urządzeniach mobilnych",
	"settings.mobileDesc":
		"Pozwól, aby automatyczna instalacja i synchronizacja ustawień przy uruchomieniu działały na telefonach i tabletach. Domyślnie wyłączone, aby konfiguracja zsynchronizowana z komputera nie rozpoczynała pobierania przez dane mobilne.",
	"settings.redactName": "Pomijaj tajne dane przy eksporcie",
	"settings.redactDesc":
		"Zastępuj tokeny, hasła i klucze API symbolem zastępczym w eksportowanym pliku ustawień. Import nigdy nie nadpisuje prawdziwej wartości symbolem zastępczym.",
	"settings.extraSecretsName": "Dodatkowe nazwy tajnych ustawień",
	"settings.extraSecretsDesc":
		"Nazwy ustawień oddzielone przecinkami, które również mają być pomijane, na przykład: licenseCode, endpoint",
	"settings.extraSecretsPlaceholder": "licenseCode, endpoint",
	"settings.syncVaultSetupName":
		"Synchronizuj motyw, fragmenty CSS, skróty klawiszowe i wtyczki główne",
	"settings.syncVaultSetupDesc":
		"Eksport zapisuje motyw społeczności, fragmenty CSS, własne skróty klawiszowe i listę włączonych wtyczek głównych w vault-setup.json. Import stosuje je na drugim urządzeniu.",
	"settings.logLevelName": "Poziom logowania",
	"settings.logLevelDesc":
		"Ile szczegółów pokazywać w konsoli, gdy coś pójdzie nie tak. Zostaw „Błędy”, chyba że szukasz przyczyny problemu.",
	"settings.logDebug": "Debugowanie (najwięcej szczegółów)",
	"settings.logInfo": "Informacje",
	"settings.logWarn": "Ostrzeżenia",
	"settings.logError": "Błędy (zalecane)",
	"settings.logNone": "Brak",
};
