import type { LocaleMessages } from "../index";

// Ukrainian. Terms follow Obsidian's Ukrainian UI: сторонні плагіни,
// основні плагіни, гарячі клавіші, фрагменти CSS, тема, сховище.
export const uk: LocaleMessages = {
	// Commands
	"cmd.export": "Експортувати конфігурацію плагінів у JSON",
	"cmd.preview": "Попередній перегляд імпорту конфігурації плагінів",
	"cmd.import": "Імпортувати конфігурацію плагінів із JSON",
	"cmd.apply": "Застосувати налаштування з JSON",
	"cmd.exportPack": "Експортувати пакет конфігурації для поширення",
	"cmd.importPack": "Імпортувати пакет конфігурації за посиланням",
	"cmd.checkUpdates": "Перевірити оновлення плагінів",
	"cmd.undo": "Скасувати останній імпорт, експорт або зміну налаштувань",

	// Shared
	"common.unknownError": "Невідома помилка",
	"common.close": "Закрити",
	"common.cancel": "Скасувати",
	"common.busy": "Уже виконується інший імпорт, експорт або оновлення налаштувань.",
	"common.startupFailed":
		"Не вдалося встановити плагіни під час запуску. Подробиці в консолі.",
	"common.and": " і ",
	"device.desktop": "комп’ютер",
	"device.mobile": "мобільний пристрій",
	"progress.step": "{current} з {total} · {detail}",
	"net.rateLimit":
		"Перевищено ліміт запитів GitHub або доступ заборонено. Зачекайте кілька хвилин і спробуйте знову.",

	// Import
	"import.title": "Імпорт конфігурації плагінів",
	"import.finished": "Імпорт завершено",
	"import.finishedProblems": "Імпорт завершено з проблемами",
	"import.failed": "Помилка імпорту",
	"import.createdEmpty":
		"Створено порожній файл {file}. Додайте до нього ID плагінів і повторіть імпорт.",
	"import.cannotCreate": "Не вдалося створити {file}. Перевірте права доступу до файлів.",
	"import.empty": "Файл {file} порожній. Додайте до нього ID плагінів і повторіть імпорт.",
	"import.invalidJson": "Некоректний JSON у {file}: {error}.",
	"import.noPlugins": "Немає плагінів для встановлення.",
	"import.notForMobile": "У списку немає плагінів для цього мобільного пристрою.",
	"import.notForDesktop": "У списку немає плагінів для цього комп’ютера.",
	"import.installing": "Встановлення {label}",
	"import.turningOn": "Увімкнення {id}",
	"import.couldNotEnable": "Не вдалося увімкнути: {ids}.",
	"import.autoEnableOff":
		"Автоматичне ввімкнення вимкнено, тому нові плагіни залишаються вимкненими.",
	"import.skippedDesktopOnly": {
		one: "На цьому пристрої пропущено {count} плагін, призначений лише для комп’ютера.",
		few: "На цьому пристрої пропущено {count} плагіни, призначені лише для комп’ютера.",
		many: "На цьому пристрої пропущено {count} плагінів, призначених лише для комп’ютера.",
		other: "На цьому пристрої пропущено {count} плагіна, призначеного лише для комп’ютера.",
	},
	"import.otherDevices": {
		one: "{count} плагін указано лише для інших пристроїв.",
		few: "{count} плагіни вказано лише для інших пристроїв.",
		many: "{count} плагінів указано лише для інших пристроїв.",
		other: "{count} плагіна вказано лише для інших пристроїв.",
	},
	"import.keptOff": "Залишено вимкненими, як указано у списку: {count}.",
	"import.changed": {
		one: "Встановлено або оновлено {count} плагін",
		few: "Встановлено або оновлено {count} плагіни",
		many: "Встановлено або оновлено {count} плагінів",
		other: "Встановлено або оновлено {count} плагіна",
	},
	"import.upToDate": "Усе вже було актуальним",
	"import.summary": "{summary} (успішно {ok} з {total}).",
	"import.error": "{error}. Подробиці в консолі.",

	// Vault setup (theme, snippets, hotkeys, core plugins)
	"vaultSetup.invalid": "Файл {file} некоректний, тому його пропущено.",
	"vaultSetup.applying": "Застосування теми, фрагментів CSS, гарячих клавіш і основних плагінів",
	"vaultSetup.snippetsWritten": {
		one: "Додано або оновлено {count} фрагмент CSS.",
		few: "Додано або оновлено {count} фрагменти CSS.",
		many: "Додано або оновлено {count} фрагментів CSS.",
		other: "Додано або оновлено {count} фрагмента CSS.",
	},
	"vaultSetup.hotkeysSet": {
		one: "Призначено гарячі клавіші для {count} команди.",
		few: "Призначено гарячі клавіші для {count} команд.",
		many: "Призначено гарячі клавіші для {count} команд.",
		other: "Призначено гарячі клавіші для {count} команди.",
	},
	"vaultSetup.corePlugins": "Основні плагіни: увімкнено {on}, вимкнено {off}.",
	"vaultSetup.themeDefault": "Перемкнено на стандартну тему",
	"vaultSetup.themeInstalled": "Встановлено тему {name} {version}",
	"vaultSetup.themeSwitched": "Перемкнено на тему {name}",
	"vaultSetup.noHotkeyManager": "Менеджер гарячих клавіш Obsidian недоступний.",
	"vaultSetup.noCoreManager": "Менеджер основних плагінів Obsidian недоступний.",
	"vaultSetup.noThemeManager": "Менеджер тем Obsidian недоступний.",
	"vaultSetup.snippetFailed": "Не вдалося записати фрагмент «{name}».",
	"vaultSetup.themeFailed": "Не вдалося встановити тему «{name}».",
	"vaultSetup.defaultThemeLabel": "стандартна тема",
	"vaultSetup.describeThemeSame": "Тема: без змін ({label})",
	"vaultSetup.describeThemeSwitch": "Тему буде змінено: {label}",
	"vaultSetup.describeSnippets":
		"Фрагменти CSS: {total} (нових: {added}, змінених: {changed}, без змін: {unchanged})",
	"vaultSetup.describeHotkeys": "Гарячі клавіші: команд {total} (зміниться: {changed})",
	"vaultSetup.describeCore": "Основні плагіни: буде увімкнено {on}, вимкнено {off}",
	"vaultSetup.describeCoreSame": "Основні плагіни: уже як у списку",

	// Export
	"export.finished": "Експорт завершено",
	"export.failed": "Помилка експорту",
	"export.saved": {
		one: "Збережено {count} плагін (закріплених версій: {pinned}, з налаштуваннями: {withSettings}) у {listFile} і {settingsFile}.",
		few: "Збережено {count} плагіни (закріплених версій: {pinned}, з налаштуваннями: {withSettings}) у {listFile} і {settingsFile}.",
		many: "Збережено {count} плагінів (закріплених версій: {pinned}, з налаштуваннями: {withSettings}) у {listFile} і {settingsFile}.",
		other: "Збережено {count} плагіна (закріплених версій: {pinned}, з налаштуваннями: {withSettings}) у {listFile} і {settingsFile}.",
	},
	"export.kept": {
		one: " Збережено {count} запис для плагінів, не встановлених на цьому пристрої.",
		few: " Збережено {count} записи для плагінів, не встановлених на цьому пристрої.",
		many: " Збережено {count} записів для плагінів, не встановлених на цьому пристрої.",
		other: " Збережено {count} запису для плагінів, не встановлених на цьому пристрої.",
	},
	"export.redacted": {
		one: " Пропущено {count} секретне значення (токени, паролі).",
		few: " Пропущено {count} секретні значення (токени, паролі).",
		many: " Пропущено {count} секретних значень (токени, паролі).",
		other: " Пропущено {count} секретного значення (токени, паролі).",
	},
	"export.snippets": {
		one: "{count} фрагмент CSS",
		few: "{count} фрагменти CSS",
		many: "{count} фрагментів CSS",
		other: "{count} фрагмента CSS",
	},
	"export.hotkeys": {
		one: "{count} власну гарячу клавішу",
		few: "{count} власні гарячі клавіші",
		many: "{count} власних гарячих клавіш",
		other: "{count} власної гарячої клавіші",
	},
	"export.vaultSetup":
		" У {file} також збережено: {theme}, {snippets}, {hotkeys} і ваші основні плагіни.",
	"export.writeFailed": "не вдалося записати JSON-файли конфігурації",

	// Setup packs
	"pack.name": "Конфігурація {vault}",
	"pack.savedTitle": "Пакет конфігурації збережено",
	"pack.savedSecrets": {
		one: " Пропущено {count} секретне значення.",
		few: " Пропущено {count} секретні значення.",
		many: " Пропущено {count} секретних значень.",
		other: " Пропущено {count} секретного значення.",
	},
	"pack.savedBody": {
		one: "Файл {file} у вашому сховищі містить {count} плагін.{secrets} Поділіться ним (наприклад, як GitHub gist), і інші зможуть скористатися командою «Імпортувати пакет конфігурації за посиланням».",
		few: "Файл {file} у вашому сховищі містить {count} плагіни.{secrets} Поділіться ним (наприклад, як GitHub gist), і інші зможуть скористатися командою «Імпортувати пакет конфігурації за посиланням».",
		many: "Файл {file} у вашому сховищі містить {count} плагінів.{secrets} Поділіться ним (наприклад, як GitHub gist), і інші зможуть скористатися командою «Імпортувати пакет конфігурації за посиланням».",
		other: "Файл {file} у вашому сховищі містить {count} плагіна.{secrets} Поділіться ним (наприклад, як GitHub gist), і інші зможуть скористатися командою «Імпортувати пакет конфігурації за посиланням».",
	},
	"pack.notSavedTitle": "Пакет конфігурації не збережено",
	"pack.writeFailed": "не вдалося записати {file}",
	"pack.loadFailedTitle": "Не вдалося завантажити пакет конфігурації",
	"pack.httpsOnly": "можна завантажувати лише посилання https",
	"pack.notFound": "{path} не знайдено в цьому сховищі",
	"pack.notPackTitle": "Це не пакет конфігурації",
	"pack.notPackBody":
		"Цей файл не є пакетом конфігурації, створеним командою «Експортувати пакет конфігурації для поширення».",
	"pack.notAddedTitle": "Пакет конфігурації не додано",
	"pack.linkTitle": "Імпорт пакета конфігурації",
	"pack.linkDesc":
		"Вставте посилання на пакет конфігурації (підійде й GitHub gist або файл на GitHub) чи шлях до файлу пакета в цьому сховищі. Нічого не буде встановлено, доки ви не підтвердите на наступному екрані.",
	"pack.linkName": "Посилання або шлях",
	"pack.linkPlaceholder": "Посилання або шлях у сховищі",
	"pack.load": "Завантажити",
	"pack.defaultName": "Пакет конфігурації",
	"pack.from": "Джерело: {source}",
	"pack.warning":
		"Сторонні плагіни можуть читати й змінювати ваші нотатки. Продовжуйте, лише якщо довіряєте автору цього пакета.",
	"pack.pluginCount": {
		one: "{count} плагін (з налаштуваннями: {withSettings})",
		few: "{count} плагіни (з налаштуваннями: {withSettings})",
		many: "{count} плагінів (з налаштуваннями: {withSettings})",
		other: "{count} плагіна (з налаштуваннями: {withSettings})",
	},
	"pack.devicesOnly": " (лише {devices})",
	"pack.staysOff": " (залишиться вимкненим)",
	"pack.hasSettings": " · налаштування",
	"pack.explain":
		"Пакет буде додано до вашого списку плагінів і файлів налаштувань (якщо значення є в обох, перевагу має пакет), після чого запуститься імпорт. «Скасувати останню зміну» поверне файли до попереднього стану.",
	"pack.confirm": "Додати до моєї конфігурації та імпортувати",
	"pack.pickTitle": "Які плагіни додати до пакета",
	"pack.pickDesc":
		"Вимкніть те, чим не хочете ділитися. Налаштування решти плагінів потраплять до пакета без секретних даних.",
	"pack.pickAll": "Вибрати всі",
	"pack.pickNone": "Зняти всі",
	"pack.pickOff": "вимкнено",
	"pack.pickSave": "Зберегти пакет ({count})",
	"pack.pickEmpty": "Плагіни спільноти не встановлено.",

	// Updates
	"updates.checking": "Перевірка оновлень плагінів",
	"updates.checkFinished": "Перевірку оновлень завершено",
	"updates.found": {
		one: "Є оновлення для {count} плагіна.",
		few: "Є оновлення для {count} плагінів.",
		many: "Є оновлення для {count} плагінів.",
		other: "Є оновлення для {count} плагіна.",
	},
	"updates.none": "Усі сторонні плагіни актуальні.",
	"updates.checkFailed": "Помилка перевірки оновлень",
	"updates.updating": "Оновлення плагінів",
	"updates.step": "Оновлення {id} до {version}",
	"updates.updated": {
		one: "Оновлено {done} з {count} плагіна.",
		few: "Оновлено {done} з {count} плагінів.",
		many: "Оновлено {done} з {count} плагінів.",
		other: "Оновлено {done} з {count} плагіна.",
	},
	"updates.pinsMoved": {
		one: "Оновлено {count} закріплену версію у {file}.",
		few: "Оновлено {count} закріплені версії у {file}.",
		many: "Оновлено {count} закріплених версій у {file}.",
		other: "Оновлено {count} закріпленої версії у {file}.",
	},
	"updates.finished": "Оновлення завершено",
	"updates.finishedProblems": "Оновлення завершено з проблемами",
	"updates.failed": "Помилка оновлення",
	"updates.modalTitle": "Оновлення плагінів",
	"updates.update": "Оновити",
	"updates.updateAll": "Оновити все ({count})",
	"updates.installed": "Встановлено {version}",
	"updates.needsApp": "{version} потребує Obsidian {minApp}",
	"updates.pinToo":
		"закріплену версію у вашому списку плагінів ({version}) також буде оновлено",

	// Undo
	"undo.nothingTitle": "Нічого скасовувати",
	"undo.nothingBody":
		"Немає попередніх дій «Імпортувати», «Застосувати налаштування» чи «Експортувати», які можна скасувати.",
	"undo.incompleteTitle": "Скасування не завершено",
	"undo.incompleteBody":
		"Відновлено файлів: {restored} з {total}. Резервну копію збережено; подробиці в консолі.",
	"undo.doneTitle": "Скасовано: {reason}",
	"undo.doneBody": {
		one: "Резервна копія від {date}: відновлено {count} файл.{reload}",
		few: "Резервна копія від {date}: відновлено {count} файли.{reload}",
		many: "Резервна копія від {date}: відновлено {count} файлів.{reload}",
		other: "Резервна копія від {date}: відновлено {count} файлу.{reload}",
	},
	"undo.reload": " Плагіни перезавантажаться, коли ви закриєте налаштування.",
	"undo.failed": "Помилка скасування",
	"reason.import": "імпорт",
	"reason.export": "експорт",
	"reason.apply": "застосування налаштувань",
	"reason.update": "оновлення плагінів",
	"reason.pack": "імпорт пакета конфігурації",
	"reason.settings": "зміна налаштувань",

	// Apply settings
	"apply.title": "Застосування налаштувань плагінів",
	"apply.none": "Жодних налаштувань не записано.",
	"apply.done": "Налаштування застосовано",
	"apply.plugins": {
		one: "{count} плагін",
		few: "{count} плагіни",
		many: "{count} плагінів",
		other: "{count} плагіна",
	},
	"apply.deferred": {
		one: "Оновлено {plugins}. {count} запущений плагін перезавантажиться, коли ви закриєте налаштування.",
		few: "Оновлено {plugins}. {count} запущені плагіни перезавантажаться, коли ви закриєте налаштування.",
		many: "Оновлено {plugins}. {count} запущених плагінів перезавантажаться, коли ви закриєте налаштування.",
		other: "Оновлено {plugins}. {count} запущеного плагіна перезавантажаться, коли ви закриєте налаштування.",
	},
	"apply.restarted": "Оновлено {plugins} (перезавантажено: {restarted}).",
	"apply.updated": "Оновлено {plugins}.",
	"apply.failed": "Не вдалося застосувати налаштування",
	"apply.fsError": "Немає доступу до файлової системи: {error}",
	"apply.noSettingsFile": "Файл {file} не знайдено, застосування налаштувань пропущено.",
	"apply.cannotWrite":
		"Не вдалося записати налаштування плагіна {id}. Перевірте права доступу до файлів.",
	"apply.writeFailed": "Не вдалося записати data.json для плагіна {id}: {error}",

	// Installing a plugin (shown in the import summary)
	"install.invalidId": "Указано некоректний ID плагіна.",
	"install.invalidIdNamed": "Некоректний ID плагіна: «{id}».",
	"install.noApi":
		"API installPlugin в Obsidian недоступний. Оновіть Obsidian і спробуйте знову.",
	"install.notInRegistry":
		"Плагін «{id}» не знайдено в реєстрі сторонніх плагінів Obsidian.",
	"install.badRepoInfo": "Плагін «{id}» має некоректні дані репозиторію в реєстрі.",
	"install.badRepoFormat": "Плагін «{id}» має некоректний формат репозиторію: {repo}",
	"install.noPinnedManifest":
		"Не вдалося отримати маніфест для «{id}» {version}. Можливо, GitHub обмежує кількість запитів.",
	"install.noRelease": "Не знайдено відповідного випуску для плагіна «{id}».",
	"install.badManifest": "Некоректний manifest.json для «{id}».",
	"install.failed": "Не вдалося встановити плагін «{id}»: {error}",
	"enable.noApi":
		"Немає доступу до API плагінів. Плагіни доведеться ввімкнути вручну.",

	// Files and the plugin list
	"file.readFailed": "Не вдалося прочитати файл: {error}",
	"file.writeFailed": "Не вдалося записати файл: {error}",
	"file.empty": "Файл {file} порожній. Додайте вміст, інакше файл буде створено заново.",
	"file.invalidJson": "Некоректний JSON у {file}: {error}. Перевірте формат файлу.",
	"list.notArray":
		"{file} має містити масив ID плагінів або об’єктів { id, version }.",
	"list.skipped": {
		one: "Пропущено {count} некоректний запис у {file}. Подробиці в консолі.",
		few: "Пропущено {count} некоректні записи у {file}. Подробиці в консолі.",
		many: "Пропущено {count} некоректних записів у {file}. Подробиці в консолі.",
		other: "Пропущено {count} некоректного запису у {file}. Подробиці в консолі.",
	},

	// Import preview
	"preview.title": "Попередній перегляд імпорту",
	"preview.failed": "Помилка попереднього перегляду: {error}",
	"preview.listNotFound": "Попередній перегляд: {file} не знайдено.",
	"preview.listInvalidJson": "Попередній перегляд: некоректний JSON у {file}.",
	"preview.otherDevice": "Лише для: {devices}; на цьому пристрої пропущено",
	"preview.notOnDevice": "Не застосовується на цьому пристрої",
	"preview.installPinned": "Буде встановлено @{version}",
	"preview.installLatest": "Буде встановлено (остання стабільна)",
	"preview.leftOff": ", залишиться вимкненим",
	"preview.alreadyPinned": "Уже встановлено закріплену версію {version}",
	"preview.wouldChange": "Буде змінено {from} → {to}",
	"preview.unknownVersion": "невідома",
	"preview.installedSkip": "Уже встановлено @{version} (не закріплено, пропуск)",
	"preview.installedSkipNoVersion": "Уже встановлено (не закріплено, пропуск)",
	"preview.settingsMissing": "{file} відсутній",
	"preview.noEntry": "Немає запису налаштувань",
	"preview.blocked":
		"Налаштування є, але «Застосовувати налаштування під час встановлення» вимкнено, а плагіна немає",
	"preview.afterInstall": "Налаштування буде застосовано після встановлення",
	"preview.afterRepin": "Налаштування буде застосовано після зміни версії",
	"preview.viaApply":
		"Буде застосовано через «Застосувати налаштування» або синхронізацію під час запуску",
	"preview.changes": {
		one: " ({count} зміна)",
		few: " ({count} зміни)",
		many: " ({count} змін)",
		other: " ({count} зміни)",
	},
	"preview.matches": " (уже збігається)",
	"preview.showChanges": {
		one: "Показати {count} зміну налаштувань",
		few: "Показати {count} зміни налаштувань",
		many: "Показати {count} змін налаштувань",
		other: "Показати {count} зміни налаштувань",
	},
	"preview.fileNotFound": "{file} не знайдено.",
	"preview.empty": "У списку немає плагінів.",
	"preview.vaultSetupInvalid": "{file} некоректний",
	"preview.vaultSetupInvalidJson": "{file} не є коректним JSON",
	"preview.badgeInstall": "Встановлення",
	"preview.badgeRepin": "Зміна версії",
	"preview.badgeOkPinned": "Закріплено",
	"preview.badgeOtherDevice": "Інший пристрій",
	"preview.badgeSkip": "Пропуск",
	"preview.badgeSettings": "Налаштування",
	"preview.badgeNoSettings": "Без налаштувань",
	"preview.badgeBlocked": "Налаштування заблоковано",
	"preview.badgeNoFile": "Немає файлу налаштувань",
	"preview.badgeNotHere": "Не тут",
	"preview.statOtherDevices": "Інші пристрої",

	// Settings tab
	"settings.warningName": "Попередження безпеки",
	"settings.warningPrefix": "Попередження безпеки: ",
	"settings.warningDesc":
		"Цей плагін може завантажувати й встановлювати сторонні плагіни. Використовуйте його лише з надійними сховищами та перегляньте свій список плагінів, перш ніж вмикати автоматичне встановлення.",
	"settings.previewName": "Попередній перегляд імпорту",
	"settings.previewDesc":
		"Подивіться, які плагіни буде встановлено, пропущено чи оновлено і які налаштування зміняться, — без жодних змін у вашому сховищі.",
	"settings.previewButton": "Переглянути",
	"settings.exportName": "Експорт конфігурації плагінів",
	"settings.exportDesc":
		"Зберегти встановлені сторонні плагіни та їхні налаштування в JSON-файли в {dir}.",
	"settings.exportButton": "Експортувати",
	"settings.importName": "Імпорт конфігурації плагінів",
	"settings.importDesc":
		"Встановити плагіни з файлу списку. Увімкнення та застосування налаштувань залежать від параметрів нижче.",
	"settings.importButton": "Імпортувати",
	"settings.shareName": "Поділитися конфігурацією",
	"settings.shareDesc":
		"Вибрати встановлені плагіни та зберегти їх у файл setup-pack.json у вашому сховищі без секретних даних, щоб поділитися з іншими.",
	"settings.shareButton": "Експортувати пакет",
	"settings.importPackName": "Імпорт пакета конфігурації",
	"settings.importPackDesc":
		"Додати чужий пакет конфігурації до своєї за посиланням. Ви побачите його вміст, перш ніж щось буде встановлено.",
	"settings.importPackButton": "Імпортувати за посиланням",
	"settings.updatesName": "Перевірка оновлень",
	"settings.updatesDesc":
		"Подивитися, для яких встановлених сторонніх плагінів є новіші версії, й оновити їх. Закріплені версії у вашому списку плагінів оновляться теж.",
	"settings.updatesButton": "Перевірити",
	"settings.undoName": "Скасувати останню зміну",
	"settings.undoDesc":
		"Повернути налаштування й файли конфігурації до стану перед останнім імпортом, оновленням налаштувань або експортом. Встановлені плагіни залишаться встановленими.",
	"settings.undoButton": "Скасувати",
	"settings.applyName": "Застосувати налаштування",
	"settings.applyDesc":
		"Оновити встановлені плагіни з файлу налаштувань без перевстановлення.",
	"settings.applyButton": "Застосувати",
	"settings.autoInstallName": "Автоматично встановлювати плагіни під час запуску",
	"settings.autoInstallDesc":
		"Під час запуску Obsidian встановлювати плагіни зі списку, які ще не встановлено.",
	"settings.autoEnableName": "Автоматично вмикати плагіни після встановлення",
	"settings.autoEnableDesc": "Вмикати плагіни після їх встановлення.",
	"settings.applyOnInstallName": "Застосовувати налаштування під час встановлення",
	"settings.applyOnInstallDesc":
		"Після встановлення плагіна застосовувати його налаштування з вашого файлу налаштувань.",
	"settings.mergeName": "Об’єднувати налаштування замість заміни",
	"settings.mergeDesc":
		"Оновлювати відповідні налаштування, а решту залишати. Якщо вимкнено, збережені налаштування плагіна замінюються повністю.",
	"settings.syncOnStartupName": "Синхронізувати налаштування під час кожного запуску",
	"settings.syncOnStartupDesc":
		"Під час кожного запуску Obsidian застосовувати ваш файл налаштувань до встановлених плагінів.",
	"settings.mobileName": "Виконувати автоматичні дії на мобільних пристроях",
	"settings.mobileDesc":
		"Дозволити автоматичне встановлення та синхронізацію налаштувань під час запуску на телефонах і планшетах. Типово вимкнено, щоб синхронізована з комп’ютера конфігурація не починала завантаження через мобільний інтернет.",
	"settings.redactName": "Пропускати секрети під час експорту",
	"settings.redactDesc":
		"Замінювати токени, паролі та ключі API заповнювачем в експортованому файлі налаштувань. Імпорт ніколи не записує заповнювач замість справжнього значення.",
	"settings.extraSecretsName": "Додаткові назви секретних налаштувань",
	"settings.extraSecretsDesc":
		"Назви налаштувань через кому, які теж слід пропускати, наприклад: licenseCode, endpoint",
	"settings.extraSecretsPlaceholder": "licenseCode, endpoint",
	"settings.syncVaultSetupName":
		"Синхронізувати тему, фрагменти CSS, гарячі клавіші та основні плагіни",
	"settings.syncVaultSetupDesc":
		"Експорт зберігає вашу сторонню тему, фрагменти CSS, власні гарячі клавіші та перелік увімкнених основних плагінів у vault-setup.json. Імпорт застосовує їх на іншому пристрої.",
	"settings.logLevelName": "Рівень журналювання",
	"settings.logLevelDesc":
		"Скільки подробиць показувати в консолі, якщо щось піде не так. Залиште «Помилки», якщо не шукаєте причину проблеми.",
	"settings.logDebug": "Налагодження (найбільше подробиць)",
	"settings.logInfo": "Інформація",
	"settings.logWarn": "Попередження",
	"settings.logError": "Помилки (рекомендовано)",
	"settings.logNone": "Нічого",
};
