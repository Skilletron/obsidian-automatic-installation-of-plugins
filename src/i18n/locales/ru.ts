import type { LocaleMessages } from "../index";

export const ru: LocaleMessages = {
	// Commands
	"cmd.export": "Экспортировать набор плагинов в JSON",
	"cmd.preview": "Предпросмотр импорта плагинов",
	"cmd.import": "Импортировать плагины из JSON",
	"cmd.apply": "Применить настройки из JSON",
	"cmd.exportPack": "Экспортировать набор для обмена",
	"cmd.importPack": "Импортировать набор по ссылке",
	"cmd.checkUpdates": "Проверить обновления плагинов",
	"cmd.undo": "Отменить последний импорт, экспорт или изменение настроек",

	// Shared
	"common.unknownError": "Неизвестная ошибка",
	"common.close": "Закрыть",
	"common.cancel": "Отмена",
	"common.busy": "Уже идёт другой импорт, экспорт или обновление настроек.",
	"common.startupFailed":
		"Не удалось выполнить установку при запуске. Подробности в консоли.",
	"common.and": " и ",
	"device.desktop": "компьютера",
	"device.mobile": "телефона",
	"progress.step": "{current} из {total} · {detail}",
	"net.rateLimit":
		"GitHub ограничил запросы или отказал в доступе. Подождите несколько минут и попробуйте снова.",

	// Import
	"import.title": "Импорт плагинов",
	"import.finished": "Импорт завершён",
	"import.finishedProblems": "Импорт завершён с ошибками",
	"import.failed": "Импорт не удался",
	"import.createdEmpty":
		"Создан пустой {file}. Добавьте в него ID плагинов и запустите импорт снова.",
	"import.cannotCreate": "Не удалось создать {file}. Проверьте права доступа.",
	"import.empty": "{file} пуст. Добавьте в него ID плагинов и запустите импорт снова.",
	"import.invalidJson": "Некорректный JSON в {file}: {error}.",
	"import.noPlugins": "Нет плагинов для установки.",
	"import.notForMobile": "В списке нет плагинов для этого телефона.",
	"import.notForDesktop": "В списке нет плагинов для этого компьютера.",
	"import.installing": "Установка {label}",
	"import.turningOn": "Включение {id}",
	"import.couldNotEnable": "Не удалось включить: {ids}.",
	"import.autoEnableOff":
		"Автовключение выключено, поэтому новые плагины остались выключенными.",
	"import.skippedDesktopOnly": {
		one: "Пропущен {count} плагин только для компьютера.",
		few: "Пропущено {count} плагина только для компьютера.",
		many: "Пропущено {count} плагинов только для компьютера.",
		other: "Пропущено {count} плагина только для компьютера.",
	},
	"import.otherDevices": {
		one: "{count} плагин в списке предназначен только для других устройств.",
		few: "{count} плагина в списке предназначены только для других устройств.",
		many: "{count} плагинов в списке предназначены только для других устройств.",
		other: "{count} плагина в списке предназначены только для других устройств.",
	},
	"import.keptOff": "Оставлено выключенными, как указано в списке: {count}.",
	"import.changed": {
		one: "Установлен или обновлён {count} плагин",
		few: "Установлено или обновлено {count} плагина",
		many: "Установлено или обновлено {count} плагинов",
		other: "Установлено или обновлено {count} плагина",
	},
	"import.upToDate": "Всё уже было актуально",
	"import.summary": "{summary} (успешно {ok} из {total}).",
	"import.error": "{error}. Подробности в консоли.",

	// Vault setup
	"vaultSetup.invalid": "{file} некорректен, поэтому пропущен.",
	"vaultSetup.applying":
		"Применение темы, CSS-фрагментов, сочетаний клавиш и встроенных плагинов",
	"vaultSetup.snippetsWritten": {
		one: "Добавлен или обновлён {count} CSS-фрагмент.",
		few: "Добавлено или обновлено {count} CSS-фрагмента.",
		many: "Добавлено или обновлено {count} CSS-фрагментов.",
		other: "Добавлено или обновлено {count} CSS-фрагмента.",
	},
	"vaultSetup.hotkeysSet": {
		one: "Назначены сочетания клавиш для {count} команды.",
		few: "Назначены сочетания клавиш для {count} команд.",
		many: "Назначены сочетания клавиш для {count} команд.",
		other: "Назначены сочетания клавиш для {count} команды.",
	},
	"vaultSetup.corePlugins":
		"Встроенные плагины: включено {on}, выключено {off}.",
	"vaultSetup.themeDefault": "Включена тема по умолчанию",
	"vaultSetup.themeInstalled": "Установлена тема {name} {version}",
	"vaultSetup.themeSwitched": "Включена тема {name}",
	"vaultSetup.noHotkeyManager": "Менеджер сочетаний клавиш Obsidian недоступен.",
	"vaultSetup.noCoreManager": "Менеджер встроенных плагинов Obsidian недоступен.",
	"vaultSetup.noThemeManager": "Менеджер тем Obsidian недоступен.",
	"vaultSetup.snippetFailed": "Не удалось записать CSS-фрагмент «{name}».",
	"vaultSetup.themeFailed": "Не удалось установить тему «{name}».",
	"vaultSetup.defaultThemeLabel": "тему по умолчанию",
	"vaultSetup.describeThemeSame": "Тема: уже используется {label}",
	"vaultSetup.describeThemeSwitch": "Тема: будет включена {label}",
	"vaultSetup.describeSnippets":
		"CSS-фрагменты: {total} (новых {added}, изменённых {changed}, без изменений {unchanged})",
	"vaultSetup.describeHotkeys":
		"Сочетания клавиш: команд {total} (изменится {changed})",
	"vaultSetup.describeCore":
		"Встроенные плагины: будет включено {on}, выключено {off}",
	"vaultSetup.describeCoreSame": "Встроенные плагины: уже как в списке",

	// Export
	"export.finished": "Экспорт завершён",
	"export.failed": "Экспорт не удался",
	"export.saved": {
		one: "Сохранён {count} плагин (закреплено версий: {pinned}, с настройками: {withSettings}) в {listFile} и {settingsFile}.",
		few: "Сохранено {count} плагина (закреплено версий: {pinned}, с настройками: {withSettings}) в {listFile} и {settingsFile}.",
		many: "Сохранено {count} плагинов (закреплено версий: {pinned}, с настройками: {withSettings}) в {listFile} и {settingsFile}.",
		other: "Сохранено {count} плагина (закреплено версий: {pinned}, с настройками: {withSettings}) в {listFile} и {settingsFile}.",
	},
	"export.kept": {
		one: " Сохранена {count} запись для плагинов, не установленных на этом устройстве.",
		few: " Сохранено {count} записи для плагинов, не установленных на этом устройстве.",
		many: " Сохранено {count} записей для плагинов, не установленных на этом устройстве.",
		other: " Сохранено {count} записи для плагинов, не установленных на этом устройстве.",
	},
	"export.redacted": {
		one: " Убрано {count} секретное значение (токены, пароли).",
		few: " Убрано {count} секретных значения (токены, пароли).",
		many: " Убрано {count} секретных значений (токены, пароли).",
		other: " Убрано {count} секретного значения (токены, пароли).",
	},
	"export.snippets": {
		one: "{count} CSS-фрагмент",
		few: "{count} CSS-фрагмента",
		many: "{count} CSS-фрагментов",
		other: "{count} CSS-фрагмента",
	},
	"export.hotkeys": {
		one: "{count} сочетание клавиш",
		few: "{count} сочетания клавиш",
		many: "{count} сочетаний клавиш",
		other: "{count} сочетания клавиш",
	},
	"export.vaultSetup":
		" Также сохранены {theme}, {snippets}, {hotkeys} и встроенные плагины в {file}.",
	"export.writeFailed": "не удалось записать JSON-файлы набора",

	// Setup packs
	"pack.name": "Набор {vault}",
	"pack.savedTitle": "Набор сохранён",
	"pack.savedSecrets": {
		one: " Убрано {count} секретное значение.",
		few: " Убрано {count} секретных значения.",
		many: " Убрано {count} секретных значений.",
		other: " Убрано {count} секретного значения.",
	},
	"pack.savedBody": {
		one: "В {file} в вашем хранилище {count} плагин.{secrets} Поделитесь им (например, через GitHub gist), и другие смогут воспользоваться командой «Импортировать набор по ссылке».",
		few: "В {file} в вашем хранилище {count} плагина.{secrets} Поделитесь им (например, через GitHub gist), и другие смогут воспользоваться командой «Импортировать набор по ссылке».",
		many: "В {file} в вашем хранилище {count} плагинов.{secrets} Поделитесь им (например, через GitHub gist), и другие смогут воспользоваться командой «Импортировать набор по ссылке».",
		other: "В {file} в вашем хранилище {count} плагина.{secrets} Поделитесь им (например, через GitHub gist), и другие смогут воспользоваться командой «Импортировать набор по ссылке».",
	},
	"pack.notSavedTitle": "Набор не сохранён",
	"pack.writeFailed": "не удалось записать {file}",
	"pack.loadFailedTitle": "Не удалось загрузить набор",
	"pack.httpsOnly": "можно загружать только ссылки https",
	"pack.notFound": "{path} не найден в этом хранилище",
	"pack.notPackTitle": "Это не набор",
	"pack.notPackBody":
		"Файл не является набором, созданным командой «Экспортировать набор для обмена».",
	"pack.notAddedTitle": "Набор не добавлен",
	"pack.linkTitle": "Импорт набора",
	"pack.linkDesc":
		"Вставьте ссылку на набор (подойдёт и GitHub gist, и файл на GitHub) или путь к файлу набора в этом хранилище. Ничего не будет установлено, пока вы не подтвердите на следующем экране.",
	"pack.linkName": "Ссылка или путь",
	"pack.linkPlaceholder": "Ссылка или путь в хранилище",
	"pack.load": "Загрузить",
	"pack.defaultName": "Набор",
	"pack.from": "Источник: {source}",
	"pack.warning":
		"Сторонние плагины могут читать и изменять ваши заметки. Продолжайте, только если доверяете автору этого набора.",
	"pack.pluginCount": {
		one: "{count} плагин (с настройками: {withSettings})",
		few: "{count} плагина (с настройками: {withSettings})",
		many: "{count} плагинов (с настройками: {withSettings})",
		other: "{count} плагина (с настройками: {withSettings})",
	},
	"pack.devicesOnly": " (только для {devices})",
	"pack.staysOff": " (останется выключенным)",
	"pack.hasSettings": " · настройки",
	"pack.explain":
		"Набор добавится к вашему собственному списку плагинов и файлу настроек (при совпадении побеждает набор), затем запустится импорт. «Отменить последнее изменение» вернёт файлы как было.",
	"pack.confirm": "Добавить к моему набору и импортировать",

	// Updates
	"updates.checking": "Проверка обновлений плагинов",
	"updates.checkFinished": "Проверка обновлений завершена",
	"updates.found": {
		one: "Обновление доступно для {count} плагина.",
		few: "Обновления доступны для {count} плагинов.",
		many: "Обновления доступны для {count} плагинов.",
		other: "Обновления доступны для {count} плагина.",
	},
	"updates.none": "Все сторонние плагины в актуальном состоянии.",
	"updates.checkFailed": "Не удалось проверить обновления",
	"updates.updating": "Обновление плагинов",
	"updates.step": "Обновление {id} до {version}",
	"updates.updated": {
		one: "Обновлено {done} из {count} плагина.",
		few: "Обновлено {done} из {count} плагинов.",
		many: "Обновлено {done} из {count} плагинов.",
		other: "Обновлено {done} из {count} плагина.",
	},
	"updates.pinsMoved": {
		one: "Перенесена {count} закреплённая версия в {file}.",
		few: "Перенесено {count} закреплённые версии в {file}.",
		many: "Перенесено {count} закреплённых версий в {file}.",
		other: "Перенесено {count} закреплённой версии в {file}.",
	},
	"updates.finished": "Обновление завершено",
	"updates.finishedProblems": "Обновление завершено с ошибками",
	"updates.failed": "Обновление не удалось",
	"updates.modalTitle": "Обновления плагинов",
	"updates.update": "Обновить",
	"updates.updateAll": "Обновить все ({count})",
	"updates.installed": "Установлена {version}",
	"updates.needsApp": "Для {version} нужен Obsidian {minApp}",
	"updates.pinToo": "закреплённая версия в вашем списке ({version}) тоже обновится",

	// Undo
	"undo.nothingTitle": "Нечего отменять",
	"undo.nothingBody": "Нет предыдущего импорта, применения настроек или экспорта.",
	"undo.incompleteTitle": "Отмена выполнена не полностью",
	"undo.incompleteBody":
		"Восстановлено файлов: {restored} из {total}. Резервная копия сохранена; подробности в консоли.",
	"undo.doneTitle": "Отменено: {reason}",
	"undo.doneBody": {
		one: "От {date}: восстановлен {count} файл.{reload}",
		few: "От {date}: восстановлено {count} файла.{reload}",
		many: "От {date}: восстановлено {count} файлов.{reload}",
		other: "От {date}: восстановлено {count} файла.{reload}",
	},
	"undo.reload": " Плагины перезапустятся, когда вы закроете настройки.",
	"undo.failed": "Отмена не удалась",
	"reason.import": "импорт",
	"reason.export": "экспорт",
	"reason.apply": "применение настроек",
	"reason.update": "обновление плагинов",
	"reason.pack": "импорт набора",
	"reason.settings": "изменение настроек",

	// Apply settings
	"apply.title": "Применение настроек плагинов",
	"apply.none": "Настройки не были записаны.",
	"apply.done": "Настройки применены",
	"apply.plugins": {
		one: "{count} плагин",
		few: "{count} плагина",
		many: "{count} плагинов",
		other: "{count} плагина",
	},
	"apply.deferred": {
		one: "Обновлено: {plugins}. {count} запущенный плагин перезапустится, когда вы закроете настройки.",
		few: "Обновлено: {plugins}. {count} запущенных плагина перезапустятся, когда вы закроете настройки.",
		many: "Обновлено: {plugins}. {count} запущенных плагинов перезапустятся, когда вы закроете настройки.",
		other: "Обновлено: {plugins}. {count} запущенного плагина перезапустятся, когда вы закроете настройки.",
	},
	"apply.restarted": "Обновлено: {plugins} (перезапущено {restarted}).",
	"apply.updated": "Обновлено: {plugins}.",
	"apply.failed": "Не удалось применить настройки",
	"apply.fsError": "Нет доступа к файловой системе: {error}",
	"apply.noSettingsFile": "Файл {file} не найден, настройки не применены.",
	"apply.cannotWrite":
		"Не удалось записать настройки плагина {id}. Проверьте права доступа.",
	"apply.writeFailed": "Не удалось записать data.json плагина {id}: {error}",

	// Installing a plugin
	"install.invalidId": "Указан некорректный ID плагина.",
	"install.invalidIdNamed": "Некорректный ID плагина: «{id}».",
	"install.noApi":
		"API установки плагинов Obsidian недоступен. Обновите Obsidian и попробуйте снова.",
	"install.notInRegistry":
		"Плагин «{id}» не найден в каталоге сторонних плагинов Obsidian.",
	"install.badRepoInfo":
		"У плагина «{id}» некорректные данные репозитория в каталоге.",
	"install.badRepoFormat":
		"У плагина «{id}» некорректный формат репозитория: {repo}",
	"install.noPinnedManifest":
		"Не удалось получить манифест «{id}» {version}. Возможно, GitHub ограничивает запросы.",
	"install.noRelease": "Не найден подходящий релиз плагина «{id}».",
	"install.badManifest": "Некорректный manifest.json у «{id}».",
	"install.failed": "Не удалось установить плагин «{id}»: {error}",
	"enable.noApi":
		"Нет доступа к API плагинов. Плагины придётся включить вручную.",

	// Files and the plugin list
	"file.readFailed": "Не удалось прочитать файл: {error}",
	"file.writeFailed": "Не удалось записать файл: {error}",
	"file.empty": "{file} пуст. Добавьте содержимое, иначе файл будет создан заново.",
	"file.invalidJson": "Некорректный JSON в {file}: {error}. Проверьте формат файла.",
	"list.notArray":
		"{file} должен содержать массив ID плагинов или объектов { id, version }.",
	"list.skipped": {
		one: "Пропущена {count} некорректная запись в {file}. Подробности в консоли.",
		few: "Пропущено {count} некорректные записи в {file}. Подробности в консоли.",
		many: "Пропущено {count} некорректных записей в {file}. Подробности в консоли.",
		other: "Пропущено {count} некорректной записи в {file}. Подробности в консоли.",
	},

	// Import preview
	"preview.title": "Предпросмотр импорта",
	"preview.failed": "Предпросмотр не удался: {error}",
	"preview.listNotFound": "Предпросмотр: {file} не найден.",
	"preview.listInvalidJson": "Предпросмотр: некорректный JSON в {file}.",
	"preview.otherDevice": "Только для {devices}; на этом устройстве пропускается",
	"preview.notOnDevice": "На этом устройстве не применяется",
	"preview.installPinned": "Будет установлен @{version}",
	"preview.installLatest": "Будет установлен (последний стабильный)",
	"preview.leftOff": ", останется выключенным",
	"preview.alreadyPinned": "Уже закреплённая версия {version}",
	"preview.wouldChange": "Версия изменится {from} → {to}",
	"preview.unknownVersion": "неизвестно",
	"preview.installedSkip": "Уже установлен @{version} (версия не закреплена, пропуск)",
	"preview.installedSkipNoVersion": "Уже установлен (версия не закреплена, пропуск)",
	"preview.settingsMissing": "{file} отсутствует",
	"preview.noEntry": "Нет записи настроек",
	"preview.blocked":
		"Настройки есть, но «Применять настройки при установке» выключено, а плагин не установлен",
	"preview.afterInstall": "Настройки будут применены после установки",
	"preview.afterRepin": "Настройки будут применены после смены версии",
	"preview.viaApply":
		"Настройки применит «Применить настройки» или синхронизация при запуске",
	"preview.changes": {
		one: " ({count} изменение)",
		few: " ({count} изменения)",
		many: " ({count} изменений)",
		other: " ({count} изменения)",
	},
	"preview.matches": " (уже совпадает)",
	"preview.showChanges": {
		one: "Показать {count} изменение настроек",
		few: "Показать {count} изменения настроек",
		many: "Показать {count} изменений настроек",
		other: "Показать {count} изменения настроек",
	},
	"preview.fileNotFound": "{file} не найден.",
	"preview.empty": "В списке нет плагинов.",
	"preview.vaultSetupInvalid": "{file} некорректен",
	"preview.vaultSetupInvalidJson": "{file} содержит некорректный JSON",
	"preview.badgeInstall": "Установка",
	"preview.badgeRepin": "Смена версии",
	"preview.badgeOkPinned": "Версия совпадает",
	"preview.badgeOtherDevice": "Другое устройство",
	"preview.badgeSkip": "Пропуск",
	"preview.badgeSettings": "Настройки",
	"preview.badgeNoSettings": "Без настроек",
	"preview.badgeBlocked": "Настройки заблокированы",
	"preview.badgeNoFile": "Нет файла настроек",
	"preview.badgeNotHere": "Не здесь",
	"preview.statOtherDevices": "Другие устройства",

	// Settings tab
	"settings.warningName": "Предупреждение о безопасности",
	"settings.warningPrefix": "Предупреждение о безопасности: ",
	"settings.warningDesc":
		"Плагин может скачивать и устанавливать сторонние плагины. Используйте его только с хранилищами, которым доверяете, и проверьте список плагинов, прежде чем включать автоустановку.",
	"settings.previewName": "Предпросмотр импорта",
	"settings.previewDesc":
		"Посмотрите, какие плагины будут установлены, пропущены или обновлены и какие настройки изменятся, — без изменений в хранилище.",
	"settings.previewButton": "Предпросмотр",
	"settings.exportName": "Экспорт набора плагинов",
	"settings.exportDesc":
		"Сохранить установленные сторонние плагины и их настройки в JSON-файлы в {dir}.",
	"settings.exportButton": "Экспорт",
	"settings.importName": "Импорт набора плагинов",
	"settings.importDesc":
		"Установить плагины из файла списка. Включение и применение настроек зависят от параметров ниже.",
	"settings.importButton": "Импорт",
	"settings.shareName": "Поделиться набором",
	"settings.shareDesc":
		"Сохранить всё установленное как setup-pack.json в хранилище, без секретов, чтобы поделиться с другими.",
	"settings.shareButton": "Экспорт набора",
	"settings.importPackName": "Импорт чужого набора",
	"settings.importPackDesc":
		"Добавить к своему набору чужой по ссылке. Вы увидите его содержимое до установки.",
	"settings.importPackButton": "Импорт по ссылке",
	"settings.updatesName": "Проверка обновлений",
	"settings.updatesDesc":
		"Посмотреть, у каких установленных сторонних плагинов есть новые версии, и обновить их. Закреплённые версии в списке обновятся тоже.",
	"settings.updatesButton": "Проверить",
	"settings.undoName": "Отменить последнее изменение",
	"settings.undoDesc":
		"Вернуть файлы настроек и наборов к состоянию до последнего импорта, применения настроек или экспорта. Установленные плагины останутся.",
	"settings.undoButton": "Отменить",
	"settings.applyName": "Применить настройки",
	"settings.applyDesc":
		"Обновить настройки установленных плагинов из файла настроек без переустановки.",
	"settings.applyButton": "Применить",
	"settings.autoInstallName": "Автоустановка плагинов при запуске",
	"settings.autoInstallDesc":
		"При запуске Obsidian устанавливать плагины из списка, которые ещё не установлены.",
	"settings.autoEnableName": "Автовключение плагинов после установки",
	"settings.autoEnableDesc": "Включать плагины после установки.",
	"settings.applyOnInstallName": "Применять настройки при установке",
	"settings.applyOnInstallDesc":
		"После установки плагина применять его настройки из файла настроек.",
	"settings.mergeName": "Объединять настройки вместо замены",
	"settings.mergeDesc":
		"Обновлять совпадающие настройки и сохранять остальные. Если выключено, сохранённые настройки плагина заменяются целиком.",
	"settings.syncOnStartupName": "Синхронизировать настройки при каждом запуске",
	"settings.syncOnStartupDesc":
		"При каждом запуске Obsidian применять файл настроек к установленным плагинам.",
	"settings.mobileName": "Автоматические действия на телефоне",
	"settings.mobileDesc":
		"Разрешить автоустановку и синхронизацию настроек при запуске на телефонах и планшетах. По умолчанию выключено, чтобы синхронизированная настройка компьютера не запускала загрузки по мобильному интернету.",
	"settings.redactName": "Убирать секреты при экспорте",
	"settings.redactDesc":
		"Заменять токены, пароли и API-ключи заглушкой в экспортированном файле настроек. Импорт никогда не записывает заглушку поверх настоящего значения.",
	"settings.extraSecretsName": "Дополнительные секретные настройки",
	"settings.extraSecretsDesc":
		"Названия настроек через запятую, которые тоже нужно убирать, например: licenseCode, endpoint",
	"settings.extraSecretsPlaceholder": "License code, endpoint",
	"settings.syncVaultSetupName":
		"Синхронизировать тему, CSS-фрагменты, сочетания клавиш и встроенные плагины",
	"settings.syncVaultSetupDesc":
		"Экспорт сохраняет вашу тему, CSS-фрагменты, свои сочетания клавиш и включённые встроенные плагины в vault-setup.json. Импорт применяет их на другом устройстве.",
	"settings.logLevelName": "Уровень журнала",
	"settings.logLevelDesc":
		"Сколько подробностей выводить в консоль, если что-то пошло не так. Оставьте «Ошибки», если не ищете проблему.",
	"settings.logDebug": "Отладка (больше всего подробностей)",
	"settings.logInfo": "Информация",
	"settings.logWarn": "Предупреждения",
	"settings.logError": "Ошибки (рекомендуется)",
	"settings.logNone": "Ничего",
};
