import type { LocaleMessages } from "../index";

export const zhTW: LocaleMessages = {
	// Commands
	"cmd.export": "將外掛配置匯出為 JSON",
	"cmd.preview": "預覽外掛配置匯入",
	"cmd.import": "從 JSON 匯入外掛配置",
	"cmd.apply": "從 JSON 套用設定",
	"cmd.exportPack": "匯出可分享的配置包",
	"cmd.importPack": "從連結匯入配置包",
	"cmd.checkUpdates": "檢查外掛更新",
	"cmd.undo": "復原上次匯入、匯出或設定變更",

	// Shared
	"common.unknownError": "未知錯誤",
	"common.close": "關閉",
	"common.cancel": "取消",
	"common.busy": "另一個匯入、匯出或設定更新作業正在進行中。",
	"common.startupFailed": "啟動時安裝失敗。詳細資訊請查看主控台。",
	"common.and": "和",
	"device.desktop": "桌面版",
	"device.mobile": "行動版",
	"progress.step": "{current}/{total} · {detail}",
	"net.rateLimit":
		"已達到 GitHub 速率限制或存取遭拒。請稍候幾分鐘後再試一次。",

	// Import
	"import.title": "正在匯入外掛配置",
	"import.finished": "匯入完成",
	"import.finishedProblems": "匯入完成，但發生問題",
	"import.failed": "匯入失敗",
	"import.createdEmpty":
		"已建立空白的 {file}。請在其中加入外掛 ID 後再次匯入。",
	"import.cannotCreate": "無法建立 {file}。請檢查檔案權限。",
	"import.empty": "{file} 是空的。請在其中加入外掛 ID 後再次匯入。",
	"import.invalidJson": "{file} 中的 JSON 無效：{error}。",
	"import.noPlugins": "沒有要安裝的外掛。",
	"import.notForMobile": "清單中沒有適用於此行動裝置的外掛。",
	"import.notForDesktop": "清單中沒有適用於此桌面裝置的外掛。",
	"import.installing": "正在安裝 {label}",
	"import.turningOn": "正在啟用 {id}",
	"import.couldNotEnable": "無法啟用：{ids}。",
	"import.autoEnableOff": "自動啟用已關閉，因此新外掛會維持停用。",
	"import.skippedDesktopOnly": {
		other: "已在此裝置上略過 {count} 個僅限桌面版的外掛。",
	},
	"import.otherDevices": {
		other: "{count} 個外掛僅適用於其他裝置。",
	},
	"import.keptOff": "已依清單設定將 {count} 個外掛維持停用。",
	"import.changed": {
		other: "已安裝或更新 {count} 個外掛",
	},
	"import.upToDate": "所有項目皆已是最新",
	"import.summary": "{summary}（{ok}/{total} 成功）。",
	"import.error": "{error}。詳細資訊請查看主控台。",

	// Vault setup (theme, snippets, hotkeys, core plugins)
	"vaultSetup.invalid": "{file} 無效，已略過。",
	"vaultSetup.applying": "正在套用主題、片段、快捷鍵和核心外掛",
	"vaultSetup.snippetsWritten": {
		other: "已新增或更新 {count} 個 CSS 片段。",
	},
	"vaultSetup.hotkeysSet": {
		other: "已為 {count} 個命令設定快捷鍵。",
	},
	"vaultSetup.corePlugins": "核心外掛：已啟用 {on}，已停用 {off}。",
	"vaultSetup.themeDefault": "已切換至預設主題",
	"vaultSetup.themeInstalled": "已安裝主題 {name} {version}",
	"vaultSetup.themeSwitched": "已切換至主題 {name}",
	"vaultSetup.noHotkeyManager": "無法使用 Obsidian 的快捷鍵管理器。",
	"vaultSetup.noCoreManager": "無法使用 Obsidian 的核心外掛管理器。",
	"vaultSetup.noThemeManager": "無法使用 Obsidian 的主題管理器。",
	"vaultSetup.snippetFailed": "無法寫入片段「{name}」。",
	"vaultSetup.themeFailed": "無法安裝主題「{name}」。",
	"vaultSetup.defaultThemeLabel": "預設主題",
	"vaultSetup.describeThemeSame": "主題：已在使用 {label}",
	"vaultSetup.describeThemeSwitch": "主題：將切換至 {label}",
	"vaultSetup.describeSnippets":
		"片段：{total} 個（新增 {added}，變更 {changed}，未變更 {unchanged}）",
	"vaultSetup.describeHotkeys": "快捷鍵：{total} 個命令（{changed} 個將變更）",
	"vaultSetup.describeCore": "核心外掛：將啟用 {on}，停用 {off}",
	"vaultSetup.describeCoreSame": "核心外掛：已與清單一致",

	// Export
	"export.finished": "匯出完成",
	"export.failed": "匯出失敗",
	"export.saved": {
		other: "已將 {count} 個外掛（{pinned} 個固定版本，{withSettings} 個含設定）儲存至 {listFile} 和 {settingsFile}。",
	},
	"export.kept": {
		other: "保留了 {count} 個未安裝在此裝置上的外掛項目。",
	},
	"export.redacted": {
		other: "已略去 {count} 個機密值（權杖、密碼）。",
	},
	"export.snippets": { other: "{count} 個 CSS 片段" },
	"export.hotkeys": {
		other: "{count} 個自訂快捷鍵",
	},
	"export.vaultSetup":
		"同時已將 {theme}、{snippets}、{hotkeys} 和核心外掛狀態儲存至 {file}。",
	"export.writeFailed": "無法寫入配置 JSON 檔案",

	// Setup packs
	"pack.name": "{vault} 的配置",
	"pack.savedTitle": "配置包已儲存",
	"pack.savedSecrets": {
		other: "已略去 {count} 個機密值。",
	},
	"pack.savedBody": {
		other: "儲存庫中的 {file} 包含 {count} 個外掛。{secrets}分享此檔案（例如作為 GitHub gist）後，其他人即可透過「從連結匯入配置包」使用。",
	},
	"pack.notSavedTitle": "配置包未儲存",
	"pack.writeFailed": "無法寫入 {file}",
	"pack.loadFailedTitle": "無法載入配置包",
	"pack.httpsOnly": "只能載入 https 連結",
	"pack.notFound": "在此儲存庫中找不到 {path}",
	"pack.notPackTitle": "不是配置包",
	"pack.notPackBody":
		"此檔案不是透過「匯出可分享的配置包」建立的配置包。",
	"pack.notAddedTitle": "配置包未加入",
	"pack.linkTitle": "匯入配置包",
	"pack.linkDesc":
		"貼上配置包的網頁連結（也支援 GitHub gist 或 GitHub 上的檔案），或此儲存庫中配置包檔案的路徑。在下一個畫面確認之前，不會安裝任何項目。",
	"pack.linkName": "連結或路徑",
	"pack.linkPlaceholder": "連結或儲存庫路徑",
	"pack.load": "載入",
	"pack.defaultName": "配置包",
	"pack.from": "來源：{source}",
	"pack.warning":
		"社群外掛可以讀取和變更你的筆記。請僅在你信任此配置包的製作者時繼續。",
	"pack.pluginCount": {
		other: "{count} 個外掛（{withSettings} 個含設定）",
	},
	"pack.devicesOnly": "（僅限{devices}）",
	"pack.staysOff": "（維持停用）",
	"pack.hasSettings": " · 設定",
	"pack.explain":
		"配置包會合併到你自己的外掛清單和設定檔中（兩者都有的項目以配置包為準），然後執行匯入。「復原上次變更」可將檔案還原。",
	"pack.confirm": "加入我的配置並匯入",

	// Updates
	"updates.checking": "正在檢查外掛更新",
	"updates.checkFinished": "更新檢查完成",
	"updates.found": {
		other: "{count} 個外掛有可用更新。",
	},
	"updates.none": "所有社群外掛皆已是最新版本。",
	"updates.checkFailed": "更新檢查失敗",
	"updates.updating": "正在更新外掛",
	"updates.step": "正在將 {id} 更新至 {version}",
	"updates.updated": {
		other: "已更新 {done}/{count} 個外掛。",
	},
	"updates.pinsMoved": {
		other: "已更新 {file} 中的 {count} 個固定版本。",
	},
	"updates.finished": "更新完成",
	"updates.finishedProblems": "更新完成，但發生問題",
	"updates.failed": "更新失敗",
	"updates.modalTitle": "外掛更新",
	"updates.update": "更新",
	"updates.updateAll": "全部更新（{count}）",
	"updates.installed": "已安裝 {version}",
	"updates.needsApp": "{version} 需要 Obsidian {minApp}",
	"updates.pinToo": "外掛清單中的固定版本（{version}）也會一併更新",

	// Undo
	"undo.nothingTitle": "沒有可復原的操作",
	"undo.nothingBody": "沒有可復原的「匯入」、「套用設定」或「匯出」操作。",
	"undo.incompleteTitle": "復原未完成",
	"undo.incompleteBody":
		"已還原 {restored}/{total} 個檔案。備份已保留；詳細資訊請查看主控台。",
	"undo.doneTitle": "已復原{reason}",
	"undo.doneBody": {
		other: "已還原 {date} 時的 {count} 個檔案。{reload}",
	},
	"undo.reload": "關閉設定後，外掛將重新載入。",
	"undo.failed": "復原失敗",
	"reason.import": "匯入",
	"reason.export": "匯出",
	"reason.apply": "套用設定",
	"reason.update": "更新外掛",
	"reason.pack": "匯入配置包",
	"reason.settings": "設定變更",

	// Apply settings
	"apply.title": "正在套用外掛設定",
	"apply.none": "未寫入任何設定。",
	"apply.done": "設定已套用",
	"apply.plugins": { other: "{count} 個外掛" },
	"apply.deferred": {
		other: "已更新 {plugins}。{count} 個執行中的外掛將在關閉設定後重新載入。",
	},
	"apply.restarted": "已更新 {plugins}（已重新載入 {restarted} 個）。",
	"apply.updated": "已更新 {plugins}。",
	"apply.failed": "套用設定失敗",
	"apply.fsError": "無法存取檔案系統：{error}",
	"apply.noSettingsFile": "找不到 {file} 檔案，略過套用設定。",
	"apply.cannotWrite":
		"無法寫入外掛 {id} 的設定。請檢查檔案權限。",
	"apply.writeFailed": "寫入外掛 {id} 的 data.json 失敗：{error}",

	// Installing a plugin (shown in the import summary)
	"install.invalidId": "提供的外掛 ID 無效。",
	"install.invalidIdNamed": "無效的外掛 ID：「{id}」。",
	"install.noApi":
		"無法使用 Obsidian installPlugin API。請更新 Obsidian 後再試一次。",
	"install.notInRegistry":
		"在 Obsidian 社群外掛清單中找不到外掛「{id}」。",
	"install.badRepoInfo":
		"外掛「{id}」在清單中的存放庫資訊無效。",
	"install.badRepoFormat": "外掛「{id}」的存放庫格式無效：{repo}",
	"install.noPinnedManifest":
		"無法取得「{id}」{version} 的資訊清單。GitHub 可能正在限制請求。",
	"install.noRelease": "找不到外掛「{id}」的合適發行版本。",
	"install.badManifest": "「{id}」的 manifest.json 無效。",
	"install.failed": "安裝外掛「{id}」失敗：{error}",
	"enable.noApi":
		"無法存取外掛 API。需要手動啟用外掛。",

	// Files and the plugin list
	"file.readFailed": "讀取檔案失敗：{error}",
	"file.writeFailed": "寫入檔案失敗：{error}",
	"file.empty": "{file} 是空的。請加入內容，否則此檔案將會重新建立。",
	"file.invalidJson": "{file} 中的 JSON 無效：{error}。請檢查檔案格式。",
	"list.notArray":
		"{file} 必須包含由外掛 ID 或 { id, version } 物件組成的陣列。",
	"list.skipped": {
		other: "已略過 {file} 中的 {count} 個無效項目。請查看主控台。",
	},

	// Import preview
	"preview.title": "匯入預覽",
	"preview.failed": "預覽失敗：{error}",
	"preview.listNotFound": "預覽：找不到 {file}。",
	"preview.listInvalidJson": "預覽：{file} 中的 JSON 無效。",
	"preview.otherDevice": "僅適用於{devices}；在此裝置上略過",
	"preview.notOnDevice": "不適用於此裝置",
	"preview.installPinned": "將安裝 @{version}",
	"preview.installLatest": "將安裝（最新穩定版）",
	"preview.leftOff": "，維持停用",
	"preview.alreadyPinned": "已是固定版本 {version}",
	"preview.wouldChange": "將變更 {from} → {to}",
	"preview.unknownVersion": "未知",
	"preview.installedSkip": "已安裝 @{version}（未固定，略過）",
	"preview.installedSkipNoVersion": "已安裝（未固定，略過）",
	"preview.settingsMissing": "缺少 {file}",
	"preview.noEntry": "無設定項目",
	"preview.blocked": "有設定，但「安裝時套用設定」已關閉且外掛未安裝",
	"preview.afterInstall": "將在安裝後套用設定",
	"preview.afterRepin": "將在版本變更後套用設定",
	"preview.viaApply": "將透過「套用設定」或啟動時同步來套用",
	"preview.changes": { other: "（{count} 項變更）" },
	"preview.matches": "（已一致）",
	"preview.showChanges": {
		other: "顯示 {count} 項設定變更",
	},
	"preview.fileNotFound": "找不到 {file}。",
	"preview.empty": "清單中沒有外掛。",
	"preview.vaultSetupInvalid": "{file} 無效",
	"preview.vaultSetupInvalidJson": "{file} 不是有效的 JSON",
	"preview.badgeInstall": "安裝",
	"preview.badgeRepin": "重新固定",
	"preview.badgeOkPinned": "已固定",
	"preview.badgeOtherDevice": "其他裝置",
	"preview.badgeSkip": "略過",
	"preview.badgeSettings": "設定",
	"preview.badgeNoSettings": "無設定",
	"preview.badgeBlocked": "設定遭封鎖",
	"preview.badgeNoFile": "無設定檔",
	"preview.badgeNotHere": "不適用",
	"preview.statOtherDevices": "其他裝置",

	// Settings tab
	"settings.warningName": "安全性警告",
	"settings.warningPrefix": "安全性警告：",
	"settings.warningDesc":
		"此功能可以下載並安裝社群外掛。請僅在受信任的儲存庫中使用，並在啟用自動安裝前檢查你的外掛清單。",
	"settings.actionsName": "匯出 / 匯入",
	"settings.actionsDesc": "管理 {dir} 中的外掛清單和設定檔。",
	"settings.previewName": "預覽匯入",
	"settings.previewDesc":
		"查看哪些外掛將被安裝、略過或更新，以及哪些設定將會變更，不會更動你的儲存庫。",
	"settings.previewButton": "預覽",
	"settings.exportName": "匯出外掛配置",
	"settings.exportDesc":
		"將已安裝的社群外掛及其設定儲存至 {dir} 中的 JSON 檔案。",
	"settings.exportButton": "匯出",
	"settings.importName": "匯入外掛配置",
	"settings.importDesc":
		"從清單檔案安裝外掛。是否啟用及套用設定取決於下方選項。",
	"settings.importButton": "匯入",
	"settings.shareName": "分享你的配置",
	"settings.shareDesc":
		"將你安裝的所有項目儲存為儲存庫中的 setup-pack.json（不含機密值），以便分享給他人。",
	"settings.shareButton": "匯出配置包",
	"settings.importPackName": "匯入配置包",
	"settings.importPackDesc":
		"透過連結將他人的配置包加入你的配置。在安裝任何項目之前，你都可以查看其中包含的內容。",
	"settings.importPackButton": "從連結匯入",
	"settings.importPackShortButton": "匯入配置包",
	"settings.updatesName": "檢查更新",
	"settings.updatesDesc":
		"查看哪些已安裝的社群外掛有新版本，並進行更新。外掛清單中的固定版本會隨之更新。",
	"settings.updatesButton": "檢查",
	"settings.updatesLongButton": "檢查更新",
	"settings.undoName": "復原上次變更",
	"settings.undoDesc":
		"將設定檔和配置檔還原至上次匯入、設定更新或匯出之前的狀態。已安裝的外掛會保留。",
	"settings.undoButton": "復原",
	"settings.applyName": "套用設定",
	"settings.applyDesc":
		"依據設定檔更新已安裝的外掛，無需重新安裝。",
	"settings.applyButton": "套用",
	"settings.autoInstallName": "啟動時自動安裝外掛",
	"settings.autoInstallDesc":
		"Obsidian 啟動時，安裝清單中尚未安裝的外掛。",
	"settings.autoEnableName": "安裝後自動啟用外掛",
	"settings.autoEnableDesc": "在外掛安裝後將其啟用。",
	"settings.applyOnInstallName": "安裝時套用設定",
	"settings.applyOnInstallDesc":
		"安裝外掛後，從設定檔套用其設定。",
	"settings.mergeName": "合併設定而非取代",
	"settings.mergeDesc":
		"更新相符的設定並保留其餘設定。關閉時，外掛已儲存的設定將被完全取代。",
	"settings.syncOnStartupName": "每次啟動時同步設定",
	"settings.syncOnStartupDesc":
		"每次 Obsidian 啟動時，將設定檔套用至已安裝的外掛。",
	"settings.mobileName": "在行動裝置上執行自動操作",
	"settings.mobileDesc":
		"允許啟動時的自動安裝和設定同步在手機和平板上執行。預設為關閉，以免同步過來的桌面版配置在使用行動數據時開始下載。",
	"settings.redactName": "匯出時略去機密值",
	"settings.redactDesc":
		"在匯出的設定檔中，將權杖、密碼和 API 金鑰替換為預留位置。匯入時絕不會用預留位置覆寫真實的值。",
	"settings.extraSecretsName": "其他機密設定名稱",
	"settings.extraSecretsDesc":
		"同樣要略去的設定名稱，以逗號分隔，例如：licenseCode, endpoint",
	"settings.extraSecretsPlaceholder": "licenseCode, endpoint",
	"settings.syncVaultSetupName": "同步主題、片段、快捷鍵和核心外掛",
	"settings.syncVaultSetupDesc":
		"匯出時將你的社群主題、CSS 片段、自訂快捷鍵以及已啟用的核心外掛儲存至 vault-setup.json。匯入時在另一台裝置上套用。",
	"settings.logLevelName": "記錄層級",
	"settings.logLevelDesc":
		"發生問題時在主控台中顯示的詳細程度。除非正在排解問題，否則請維持「錯誤」。",
	"settings.logDebug": "偵錯（最詳細）",
	"settings.logInfo": "資訊",
	"settings.logWarn": "警告",
	"settings.logError": "錯誤（建議）",
	"settings.logNone": "無",
};
