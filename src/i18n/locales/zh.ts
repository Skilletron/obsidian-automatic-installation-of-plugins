import type { LocaleMessages } from "../index";

export const zh: LocaleMessages = {
	// Commands
	"cmd.export": "将插件配置导出为 JSON",
	"cmd.preview": "预览插件配置导入",
	"cmd.import": "从 JSON 导入插件配置",
	"cmd.apply": "从 JSON 应用设置",
	"cmd.exportPack": "导出可分享的配置包",
	"cmd.importPack": "从链接导入配置包",
	"cmd.checkUpdates": "检查插件更新",
	"cmd.undo": "撤销上次导入、导出或设置更改",

	// Shared
	"common.unknownError": "未知错误",
	"common.close": "关闭",
	"common.cancel": "取消",
	"common.busy": "另一个导入、导出或设置更新操作正在进行中。",
	"common.startupFailed": "启动时安装失败。详情请查看控制台。",
	"common.and": "和",
	"device.desktop": "桌面端",
	"device.mobile": "移动端",
	"progress.step": "{current}/{total} · {detail}",
	"net.rateLimit":
		"已达到 GitHub 速率限制或访问被拒绝。请等待几分钟后重试。",

	// Import
	"import.title": "正在导入插件配置",
	"import.finished": "导入完成",
	"import.finishedProblems": "导入完成，但存在问题",
	"import.failed": "导入失败",
	"import.createdEmpty":
		"已创建空的 {file}。请在其中添加插件 ID 后再次导入。",
	"import.cannotCreate": "无法创建 {file}。请检查文件权限。",
	"import.empty": "{file} 为空。请在其中添加插件 ID 后再次导入。",
	"import.invalidJson": "{file} 中的 JSON 无效：{error}。",
	"import.noPlugins": "没有需要安装的插件。",
	"import.notForMobile": "列表中没有适用于此移动设备的插件。",
	"import.notForDesktop": "列表中没有适用于此桌面设备的插件。",
	"import.installing": "正在安装 {label}",
	"import.turningOn": "正在启用 {id}",
	"import.couldNotEnable": "无法启用：{ids}。",
	"import.autoEnableOff": "自动启用已关闭，因此新插件保持禁用状态。",
	"import.skippedDesktopOnly": {
		other: "已在此设备上跳过 {count} 个仅限桌面端的插件。",
	},
	"import.otherDevices": {
		other: "{count} 个插件仅适用于其他设备。",
	},
	"import.keptOff": "已按列表设定将 {count} 个插件保持为禁用状态。",
	"import.changed": {
		other: "已安装或更新 {count} 个插件",
	},
	"import.upToDate": "所有内容均已是最新",
	"import.summary": "{summary}（{ok}/{total} 成功）。",
	"import.error": "{error}。详情请查看控制台。",

	// Vault setup (theme, snippets, hotkeys, core plugins)
	"vaultSetup.invalid": "{file} 无效，已跳过。",
	"vaultSetup.applying": "正在应用主题、代码片段、快捷键和核心插件",
	"vaultSetup.snippetsWritten": {
		other: "已添加或更新 {count} 个 CSS 代码片段。",
	},
	"vaultSetup.hotkeysSet": {
		other: "已为 {count} 个命令设置快捷键。",
	},
	"vaultSetup.corePlugins": "核心插件：已启用 {on}，已禁用 {off}。",
	"vaultSetup.themeDefault": "已切换到默认主题",
	"vaultSetup.themeInstalled": "已安装主题 {name} {version}",
	"vaultSetup.themeSwitched": "已切换到主题 {name}",
	"vaultSetup.noHotkeyManager": "Obsidian 的快捷键管理器不可用。",
	"vaultSetup.noCoreManager": "Obsidian 的核心插件管理器不可用。",
	"vaultSetup.noThemeManager": "Obsidian 的主题管理器不可用。",
	"vaultSetup.snippetFailed": "无法写入代码片段“{name}”。",
	"vaultSetup.themeFailed": "无法安装主题“{name}”。",
	"vaultSetup.defaultThemeLabel": "默认主题",
	"vaultSetup.describeThemeSame": "主题：已在使用 {label}",
	"vaultSetup.describeThemeSwitch": "主题：将切换到 {label}",
	"vaultSetup.describeSnippets":
		"代码片段：{total} 个（新增 {added}，更改 {changed}，未更改 {unchanged}）",
	"vaultSetup.describeHotkeys": "快捷键：{total} 个命令（{changed} 个将更改）",
	"vaultSetup.describeCore": "核心插件：将启用 {on}，禁用 {off}",
	"vaultSetup.describeCoreSame": "核心插件：已与列表一致",

	// Export
	"export.finished": "导出完成",
	"export.failed": "导出失败",
	"export.saved": {
		other: "已将 {count} 个插件（{pinned} 个固定版本，{withSettings} 个含设置）保存到 {listFile} 和 {settingsFile}。",
	},
	"export.kept": {
		other: "保留了 {count} 个未在此设备上安装的插件条目。",
	},
	"export.redacted": {
		other: "已省略 {count} 个机密值（令牌、密码）。",
	},
	"export.snippets": { other: "{count} 个 CSS 代码片段" },
	"export.hotkeys": {
		other: "{count} 个自定义快捷键",
	},
	"export.vaultSetup":
		"同时已将 {theme}、{snippets}、{hotkeys} 和核心插件状态保存到 {file}。",
	"export.writeFailed": "无法写入配置 JSON 文件",

	// Setup packs
	"pack.name": "{vault} 的配置",
	"pack.savedTitle": "配置包已保存",
	"pack.savedSecrets": {
		other: "已省略 {count} 个机密值。",
	},
	"pack.savedBody": {
		other: "仓库中的 {file} 包含 {count} 个插件。{secrets}分享该文件（例如作为 GitHub gist）后，其他人即可通过“从链接导入配置包”使用它。",
	},
	"pack.notSavedTitle": "配置包未保存",
	"pack.writeFailed": "无法写入 {file}",
	"pack.loadFailedTitle": "无法加载配置包",
	"pack.httpsOnly": "只能加载 https 链接",
	"pack.notFound": "在此仓库中未找到 {path}",
	"pack.notPackTitle": "不是配置包",
	"pack.notPackBody":
		"该文件不是通过“导出可分享的配置包”创建的配置包。",
	"pack.notAddedTitle": "配置包未添加",
	"pack.linkTitle": "导入配置包",
	"pack.linkDesc":
		"粘贴配置包的网页链接（也支持 GitHub gist 或 GitHub 上的文件），或此仓库中配置包文件的路径。在下一个界面确认之前，不会安装任何内容。",
	"pack.linkName": "链接或路径",
	"pack.linkPlaceholder": "链接或仓库路径",
	"pack.load": "加载",
	"pack.defaultName": "配置包",
	"pack.from": "来源：{source}",
	"pack.warning":
		"第三方插件可以读取和更改你的笔记。仅在你信任此配置包的制作者时才继续。",
	"pack.pluginCount": {
		other: "{count} 个插件（{withSettings} 个含设置）",
	},
	"pack.devicesOnly": "（仅限{devices}）",
	"pack.staysOff": "（保持禁用）",
	"pack.hasSettings": " · 设置",
	"pack.explain":
		"配置包会合并到你自己的插件列表和设置文件中（两者都有的内容以配置包为准），然后执行导入。“撤销上次更改”可将文件恢复原样。",
	"pack.confirm": "添加到我的配置并导入",

	// Updates
	"updates.checking": "正在检查插件更新",
	"updates.checkFinished": "更新检查完成",
	"updates.found": {
		other: "{count} 个插件有更新。",
	},
	"updates.none": "所有第三方插件均已是最新版本。",
	"updates.checkFailed": "更新检查失败",
	"updates.updating": "正在更新插件",
	"updates.step": "正在将 {id} 更新到 {version}",
	"updates.updated": {
		other: "已更新 {done}/{count} 个插件。",
	},
	"updates.pinsMoved": {
		other: "已更新 {file} 中的 {count} 个固定版本。",
	},
	"updates.finished": "更新完成",
	"updates.finishedProblems": "更新完成，但存在问题",
	"updates.failed": "更新失败",
	"updates.modalTitle": "插件更新",
	"updates.update": "更新",
	"updates.updateAll": "全部更新（{count}）",
	"updates.installed": "已安装 {version}",
	"updates.needsApp": "{version} 需要 Obsidian {minApp}",
	"updates.pinToo": "插件列表中的固定版本（{version}）也会一并更新",

	// Undo
	"undo.nothingTitle": "没有可撤销的操作",
	"undo.nothingBody": "没有可撤销的“导入”“应用设置”或“导出”操作。",
	"undo.incompleteTitle": "撤销未完成",
	"undo.incompleteBody":
		"已恢复 {restored}/{total} 个文件。备份已保留；详情请查看控制台。",
	"undo.doneTitle": "已撤销{reason}",
	"undo.doneBody": {
		other: "已恢复 {date} 时的 {count} 个文件。{reload}",
	},
	"undo.reload": "关闭设置后，插件将重新加载。",
	"undo.failed": "撤销失败",
	"reason.import": "导入",
	"reason.export": "导出",
	"reason.apply": "应用设置",
	"reason.update": "更新插件",
	"reason.pack": "导入配置包",
	"reason.settings": "设置更改",

	// Apply settings
	"apply.title": "正在应用插件设置",
	"apply.none": "未写入任何设置。",
	"apply.done": "设置已应用",
	"apply.plugins": { other: "{count} 个插件" },
	"apply.deferred": {
		other: "已更新 {plugins}。{count} 个正在运行的插件将在关闭设置后重新加载。",
	},
	"apply.restarted": "已更新 {plugins}（已重新加载 {restarted} 个）。",
	"apply.updated": "已更新 {plugins}。",
	"apply.failed": "应用设置失败",
	"apply.fsError": "无法访问文件系统：{error}",
	"apply.noSettingsFile": "未找到 {file} 文件，跳过应用设置。",
	"apply.cannotWrite":
		"无法写入插件 {id} 的设置。请检查文件权限。",
	"apply.writeFailed": "写入插件 {id} 的 data.json 失败：{error}",

	// Installing a plugin (shown in the import summary)
	"install.invalidId": "提供的插件 ID 无效。",
	"install.invalidIdNamed": "无效的插件 ID：“{id}”。",
	"install.noApi":
		"Obsidian installPlugin API 不可用。请更新 Obsidian 后重试。",
	"install.notInRegistry":
		"在 Obsidian 第三方插件列表中未找到插件“{id}”。",
	"install.badRepoInfo":
		"插件“{id}”在列表中的代码仓库信息无效。",
	"install.badRepoFormat": "插件“{id}”的代码仓库格式无效：{repo}",
	"install.noPinnedManifest":
		"无法获取“{id}” {version} 的清单文件。GitHub 可能正在限制请求。",
	"install.noRelease": "未找到插件“{id}”的合适发布版本。",
	"install.badManifest": "“{id}”的 manifest.json 无效。",
	"install.failed": "安装插件“{id}”失败：{error}",
	"enable.noApi":
		"无法访问插件 API。需要手动启用插件。",

	// Files and the plugin list
	"file.readFailed": "读取文件失败：{error}",
	"file.writeFailed": "写入文件失败：{error}",
	"file.empty": "{file} 为空。请添加内容，否则该文件将被重新创建。",
	"file.invalidJson": "{file} 中的 JSON 无效：{error}。请检查文件格式。",
	"list.notArray":
		"{file} 必须包含由插件 ID 或 { id, version } 对象组成的数组。",
	"list.skipped": {
		other: "已跳过 {file} 中的 {count} 个无效条目。请查看控制台。",
	},

	// Import preview
	"preview.title": "导入预览",
	"preview.failed": "预览失败：{error}",
	"preview.listNotFound": "预览：未找到 {file}。",
	"preview.listInvalidJson": "预览：{file} 中的 JSON 无效。",
	"preview.otherDevice": "仅适用于{devices}；在此设备上跳过",
	"preview.notOnDevice": "不适用于此设备",
	"preview.installPinned": "将安装 @{version}",
	"preview.installLatest": "将安装（最新稳定版）",
	"preview.leftOff": "，保持禁用",
	"preview.alreadyPinned": "已是固定版本 {version}",
	"preview.wouldChange": "将更改 {from} → {to}",
	"preview.unknownVersion": "未知",
	"preview.installedSkip": "已安装 @{version}（未固定，跳过）",
	"preview.installedSkipNoVersion": "已安装（未固定，跳过）",
	"preview.settingsMissing": "缺少 {file}",
	"preview.noEntry": "无设置条目",
	"preview.blocked": "存在设置，但“安装时应用设置”已关闭且插件未安装",
	"preview.afterInstall": "将在安装后应用设置",
	"preview.afterRepin": "将在版本更改后应用设置",
	"preview.viaApply": "将通过“应用设置”或启动时同步来应用",
	"preview.changes": { other: "（{count} 处更改）" },
	"preview.matches": "（已一致）",
	"preview.showChanges": {
		other: "显示 {count} 处设置更改",
	},
	"preview.fileNotFound": "未找到 {file}。",
	"preview.empty": "列表中没有插件。",
	"preview.vaultSetupInvalid": "{file} 无效",
	"preview.vaultSetupInvalidJson": "{file} 不是有效的 JSON",
	"preview.badgeInstall": "安装",
	"preview.badgeRepin": "重新固定",
	"preview.badgeOkPinned": "已固定",
	"preview.badgeOtherDevice": "其他设备",
	"preview.badgeSkip": "跳过",
	"preview.badgeSettings": "设置",
	"preview.badgeNoSettings": "无设置",
	"preview.badgeBlocked": "设置被阻止",
	"preview.badgeNoFile": "无设置文件",
	"preview.badgeNotHere": "不适用",
	"preview.statOtherDevices": "其他设备",

	// Settings tab
	"settings.warningName": "安全警告",
	"settings.warningPrefix": "安全警告：",
	"settings.warningDesc":
		"此功能可以下载并安装第三方插件。请仅在受信任的仓库中使用，并在启用自动安装前检查你的插件列表。",
	"settings.actionsName": "导出 / 导入",
	"settings.actionsDesc": "管理 {dir} 中的插件列表和设置文件。",
	"settings.previewName": "预览导入",
	"settings.previewDesc":
		"查看哪些插件将被安装、跳过或更新，以及哪些设置将发生变化，不会更改你的仓库。",
	"settings.previewButton": "预览",
	"settings.exportName": "导出插件配置",
	"settings.exportDesc":
		"将已安装的第三方插件及其设置保存到 {dir} 中的 JSON 文件。",
	"settings.exportButton": "导出",
	"settings.importName": "导入插件配置",
	"settings.importDesc":
		"从列表文件安装插件。是否启用和应用设置取决于下方选项。",
	"settings.importButton": "导入",
	"settings.shareName": "分享你的配置",
	"settings.shareDesc":
		"将你安装的所有内容保存为仓库中的 setup-pack.json（不含机密值），以便分享给他人。",
	"settings.shareButton": "导出配置包",
	"settings.importPackName": "导入配置包",
	"settings.importPackDesc":
		"通过链接将他人的配置包添加到你的配置中。在安装任何内容之前，你都可以查看其中包含的内容。",
	"settings.importPackButton": "从链接导入",
	"settings.importPackShortButton": "导入配置包",
	"settings.updatesName": "检查更新",
	"settings.updatesDesc":
		"查看哪些已安装的第三方插件有新版本，并进行更新。插件列表中的固定版本会随之更新。",
	"settings.updatesButton": "检查",
	"settings.updatesLongButton": "检查更新",
	"settings.undoName": "撤销上次更改",
	"settings.undoDesc":
		"将设置文件和配置文件恢复到上次导入、设置更新或导出之前的状态。已安装的插件会保留。",
	"settings.undoButton": "撤销",
	"settings.applyName": "应用设置",
	"settings.applyDesc":
		"根据设置文件更新已安装的插件，无需重新安装。",
	"settings.applyButton": "应用",
	"settings.autoInstallName": "启动时自动安装插件",
	"settings.autoInstallDesc":
		"Obsidian 启动时，安装列表中尚未安装的插件。",
	"settings.autoEnableName": "安装后自动启用插件",
	"settings.autoEnableDesc": "在插件安装后将其启用。",
	"settings.applyOnInstallName": "安装时应用设置",
	"settings.applyOnInstallDesc":
		"安装插件后，从设置文件中应用其设置。",
	"settings.mergeName": "合并设置而非替换",
	"settings.mergeDesc":
		"更新匹配的设置并保留其余设置。关闭时，插件已保存的设置将被完全替换。",
	"settings.syncOnStartupName": "每次启动时同步设置",
	"settings.syncOnStartupDesc":
		"每次 Obsidian 启动时，将设置文件应用到已安装的插件。",
	"settings.mobileName": "在移动端运行自动操作",
	"settings.mobileDesc":
		"允许启动时的自动安装和设置同步在手机和平板上运行。默认关闭，以免同步过来的桌面端配置在使用移动数据时开始下载。",
	"settings.redactName": "导出时省略机密值",
	"settings.redactDesc":
		"在导出的设置文件中，将令牌、密码和 API 密钥替换为占位符。导入时绝不会用占位符覆盖真实值。",
	"settings.extraSecretsName": "额外的机密设置名称",
	"settings.extraSecretsDesc":
		"同样需要省略的设置名称，以逗号分隔，例如：licenseCode, endpoint",
	"settings.extraSecretsPlaceholder": "licenseCode, endpoint",
	"settings.syncVaultSetupName": "同步主题、代码片段、快捷键和核心插件",
	"settings.syncVaultSetupDesc":
		"导出时将你的第三方主题、CSS 代码片段、自定义快捷键以及已启用的核心插件保存到 vault-setup.json。导入时在另一台设备上应用它们。",
	"settings.logLevelName": "日志级别",
	"settings.logLevelDesc":
		"出现问题时在控制台中显示的详细程度。除非正在排查问题，否则请保持为“错误”。",
	"settings.logDebug": "调试（最详细）",
	"settings.logInfo": "信息",
	"settings.logWarn": "警告",
	"settings.logError": "错误（推荐）",
	"settings.logNone": "无",
};
