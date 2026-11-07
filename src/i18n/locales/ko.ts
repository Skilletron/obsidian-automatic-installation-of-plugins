import type { LocaleMessages } from "../index";

export const ko: LocaleMessages = {
	// Commands
	"cmd.export": "플러그인 구성을 JSON으로 내보내기",
	"cmd.preview": "플러그인 구성 가져오기 미리보기",
	"cmd.import": "JSON에서 플러그인 구성 가져오기",
	"cmd.apply": "JSON에서 설정 적용",
	"cmd.exportPack": "공유용 구성 팩 내보내기",
	"cmd.importPack": "링크에서 구성 팩 가져오기",
	"cmd.checkUpdates": "플러그인 업데이트 확인",
	"cmd.undo": "마지막 가져오기, 내보내기 또는 설정 변경 실행 취소",

	// Shared
	"common.unknownError": "알 수 없는 오류",
	"common.close": "닫기",
	"common.cancel": "취소",
	"common.busy": "다른 가져오기, 내보내기 또는 설정 업데이트가 이미 실행 중입니다.",
	"common.startupFailed": "시작 시 설치에 실패했습니다. 자세한 내용은 콘솔을 확인하세요.",
	"common.and": " 및 ",
	"device.desktop": "데스크톱",
	"device.mobile": "모바일",
	"progress.step": "{current}/{total} · {detail}",
	"net.rateLimit":
		"GitHub 요청 한도에 도달했거나 접근이 거부되었습니다. 몇 분 후에 다시 시도하세요.",

	// Import
	"import.title": "플러그인 구성 가져오는 중",
	"import.finished": "가져오기 완료",
	"import.finishedProblems": "가져오기가 완료되었지만 문제가 있습니다",
	"import.failed": "가져오기 실패",
	"import.createdEmpty":
		"빈 {file} 파일을 만들었습니다. 플러그인 ID를 추가한 후 다시 가져오세요.",
	"import.cannotCreate": "{file} 파일을 만들 수 없습니다. 파일 권한을 확인하세요.",
	"import.empty": "{file} 파일이 비어 있습니다. 플러그인 ID를 추가한 후 다시 가져오세요.",
	"import.invalidJson": "{file}의 JSON이 올바르지 않습니다: {error}.",
	"import.noPlugins": "설치할 플러그인이 없습니다.",
	"import.notForMobile": "목록에 이 모바일 기기용 플러그인이 없습니다.",
	"import.notForDesktop": "목록에 이 데스크톱 기기용 플러그인이 없습니다.",
	"import.installing": "{label} 설치 중",
	"import.turningOn": "{id} 켜는 중",
	"import.couldNotEnable": "켜지 못한 플러그인: {ids}.",
	"import.autoEnableOff": "자동 활성화가 꺼져 있어 새 플러그인은 꺼진 상태로 유지됩니다.",
	"import.skippedDesktopOnly": {
		other: "이 기기에서 데스크톱 전용 플러그인 {count}개를 건너뛰었습니다.",
	},
	"import.otherDevices": {
		other: "플러그인 {count}개는 다른 기기 전용으로 지정되어 있습니다.",
	},
	"import.keptOff": "목록 설정에 따라 {count}개를 꺼진 상태로 두었습니다.",
	"import.changed": {
		other: "플러그인 {count}개를 설치하거나 업데이트했습니다",
	},
	"import.upToDate": "모두 이미 최신 상태입니다",
	"import.summary": "{summary} ({total}개 중 {ok}개 성공).",
	"import.error": "{error}. 자세한 내용은 콘솔을 확인하세요.",

	// Vault setup (theme, snippets, hotkeys, core plugins)
	"vaultSetup.invalid": "{file} 파일이 올바르지 않아 건너뛰었습니다.",
	"vaultSetup.applying": "테마, 스니펫, 단축키, 코어 플러그인 적용 중",
	"vaultSetup.snippetsWritten": {
		other: "CSS 스니펫 {count}개를 추가하거나 업데이트했습니다.",
	},
	"vaultSetup.hotkeysSet": {
		other: "명령 {count}개에 단축키를 설정했습니다.",
	},
	"vaultSetup.corePlugins": "코어 플러그인: {on} 켬, {off} 끔.",
	"vaultSetup.themeDefault": "기본 테마로 전환했습니다",
	"vaultSetup.themeInstalled": "{name} {version} 테마를 설치했습니다",
	"vaultSetup.themeSwitched": "{name} 테마로 전환했습니다",
	"vaultSetup.noHotkeyManager": "Obsidian의 단축키 관리자를 사용할 수 없습니다.",
	"vaultSetup.noCoreManager": "Obsidian의 코어 플러그인 관리자를 사용할 수 없습니다.",
	"vaultSetup.noThemeManager": "Obsidian의 테마 관리자를 사용할 수 없습니다.",
	"vaultSetup.snippetFailed": "스니펫 ‘{name}’을(를) 저장할 수 없습니다.",
	"vaultSetup.themeFailed": "테마 ‘{name}’을(를) 설치할 수 없습니다.",
	"vaultSetup.defaultThemeLabel": "기본 테마",
	"vaultSetup.describeThemeSame": "테마: 이미 {label} 사용 중",
	"vaultSetup.describeThemeSwitch": "테마: {label}(으)로 전환 예정",
	"vaultSetup.describeSnippets":
		"스니펫: {total}개 (새로 추가 {added}, 변경 {changed}, 변경 없음 {unchanged})",
	"vaultSetup.describeHotkeys": "단축키: 명령 {total}개 ({changed}개 변경 예정)",
	"vaultSetup.describeCore": "코어 플러그인: {on} 켬 예정, {off} 끔 예정",
	"vaultSetup.describeCoreSame": "코어 플러그인: 이미 목록과 같음",

	// Export
	"export.finished": "내보내기 완료",
	"export.failed": "내보내기 실패",
	"export.saved": {
		other: "플러그인 {count}개(고정 {pinned}개, 설정 포함 {withSettings}개)를 {listFile} 및 {settingsFile}에 저장했습니다.",
	},
	"export.kept": {
		other: " 이 기기에 설치되지 않은 플러그인 항목 {count}개를 유지했습니다.",
	},
	"export.redacted": {
		other: " 비밀 값 {count}개(토큰, 비밀번호)를 제외했습니다.",
	},
	"export.snippets": { other: "CSS 스니펫 {count}개" },
	"export.hotkeys": {
		other: "사용자 지정 단축키 {count}개",
	},
	"export.vaultSetup":
		" {theme}, {snippets}, {hotkeys} 및 코어 플러그인도 {file}에 저장했습니다.",
	"export.writeFailed": "구성 JSON 파일을 쓸 수 없습니다",

	// Setup packs
	"pack.name": "{vault} 구성",
	"pack.savedTitle": "구성 팩 저장됨",
	"pack.savedSecrets": {
		other: " 비밀 값 {count}개를 제외했습니다.",
	},
	"pack.savedBody": {
		other: "보관소의 {file}에 플러그인 {count}개가 들어 있습니다.{secrets} 이 파일을 공유하면(예: GitHub gist) 다른 사람이 ‘링크에서 구성 팩 가져오기’로 사용할 수 있습니다.",
	},
	"pack.notSavedTitle": "구성 팩을 저장하지 못함",
	"pack.writeFailed": "{file}을(를) 쓸 수 없습니다",
	"pack.loadFailedTitle": "구성 팩을 불러올 수 없습니다",
	"pack.httpsOnly": "https 링크만 불러올 수 있습니다",
	"pack.notFound": "이 보관소에서 {path}을(를) 찾을 수 없습니다",
	"pack.notPackTitle": "구성 팩이 아님",
	"pack.notPackBody":
		"이 파일은 ‘공유용 구성 팩 내보내기’로 만든 구성 팩이 아닙니다.",
	"pack.notAddedTitle": "구성 팩이 추가되지 않음",
	"pack.linkTitle": "구성 팩 가져오기",
	"pack.linkDesc":
		"구성 팩의 웹 링크(GitHub gist나 GitHub의 파일도 가능) 또는 이 보관소에 있는 팩 파일의 경로를 붙여넣으세요. 다음 화면에서 확인하기 전까지는 아무것도 설치되지 않습니다.",
	"pack.linkName": "링크 또는 경로",
	"pack.linkPlaceholder": "링크 또는 보관소 경로",
	"pack.load": "불러오기",
	"pack.defaultName": "구성 팩",
	"pack.from": "출처: {source}",
	"pack.warning":
		"커뮤니티 플러그인은 노트를 읽고 변경할 수 있습니다. 이 팩을 만든 사람을 신뢰하는 경우에만 계속하세요.",
	"pack.pluginCount": {
		other: "플러그인 {count}개 (설정 포함 {withSettings}개)",
	},
	"pack.devicesOnly": " ({devices} 전용)",
	"pack.staysOff": " (꺼진 상태 유지)",
	"pack.hasSettings": " · 설정",
	"pack.explain":
		"팩은 내 플러그인 목록과 설정 파일에 추가되며(양쪽에 같은 항목이 있으면 팩이 우선), 그다음 가져오기가 실행됩니다. ‘마지막 변경 실행 취소’로 파일을 되돌릴 수 있습니다.",
	"pack.confirm": "내 구성에 추가하고 가져오기",
	"pack.pickTitle": "팩에 넣을 플러그인 선택",
	"pack.pickDesc":
		"공유하지 않을 항목은 끄세요. 나머지 플러그인의 설정은 비밀 값을 제외하고 팩에 포함됩니다.",
	"pack.pickAll": "모두 선택",
	"pack.pickNone": "모두 해제",
	"pack.pickOff": "꺼짐",
	"pack.pickSave": "팩 저장 ({count})",
	"pack.pickEmpty": "설치된 커뮤니티 플러그인이 없습니다.",

	// Updates
	"updates.checking": "플러그인 업데이트 확인 중",
	"updates.checkFinished": "업데이트 확인 완료",
	"updates.found": {
		other: "플러그인 {count}개에 업데이트가 있습니다.",
	},
	"updates.none": "모든 커뮤니티 플러그인이 최신 상태입니다.",
	"updates.checkFailed": "업데이트 확인 실패",
	"updates.updating": "플러그인 업데이트 중",
	"updates.step": "{id}을(를) {version}(으)로 업데이트 중",
	"updates.updated": {
		other: "플러그인 {count}개 중 {done}개를 업데이트했습니다.",
	},
	"updates.pinsMoved": {
		other: "{file}의 고정 버전 {count}개를 변경했습니다.",
	},
	"updates.finished": "업데이트 완료",
	"updates.finishedProblems": "업데이트가 완료되었지만 문제가 있습니다",
	"updates.failed": "업데이트 실패",
	"updates.modalTitle": "플러그인 업데이트",
	"updates.update": "업데이트",
	"updates.updateAll": "모두 업데이트 ({count})",
	"updates.installed": "설치됨: {version}",
	"updates.needsApp": "{version}에는 Obsidian {minApp}이(가) 필요합니다",
	"updates.pinToo": "플러그인 목록의 고정 버전({version})도 함께 업데이트됩니다",

	// Undo
	"undo.nothingTitle": "실행 취소할 항목 없음",
	"undo.nothingBody": "실행 취소할 이전 가져오기, 설정 적용 또는 내보내기가 없습니다.",
	"undo.incompleteTitle": "실행 취소가 완료되지 않음",
	"undo.incompleteBody":
		"파일 {total}개 중 {restored}개를 복원했습니다. 백업은 유지됩니다. 자세한 내용은 콘솔을 확인하세요.",
	"undo.doneTitle": "{reason} 실행 취소됨",
	"undo.doneBody": {
		other: "{date} 시점의 파일 {count}개를 복원했습니다.{reload}",
	},
	"undo.reload": " 설정을 닫으면 플러그인이 다시 로드됩니다.",
	"undo.failed": "실행 취소 실패",
	"reason.import": "가져오기",
	"reason.export": "내보내기",
	"reason.apply": "설정 적용",
	"reason.update": "플러그인 업데이트",
	"reason.pack": "구성 팩 가져오기",
	"reason.settings": "설정 변경",

	// Apply settings
	"apply.title": "플러그인 설정 적용 중",
	"apply.none": "기록된 설정이 없습니다.",
	"apply.done": "설정 적용됨",
	"apply.plugins": { other: "플러그인 {count}개" },
	"apply.deferred": {
		other: "{plugins}을(를) 업데이트했습니다. 실행 중인 플러그인 {count}개는 설정을 닫으면 다시 로드됩니다.",
	},
	"apply.restarted": "{plugins}을(를) 업데이트했습니다({restarted}개 다시 로드됨).",
	"apply.updated": "{plugins}을(를) 업데이트했습니다.",
	"apply.failed": "설정 적용 실패",
	"apply.fsError": "파일 시스템에 접근할 수 없습니다: {error}",
	"apply.noSettingsFile": "{file} 파일이 없어 설정 적용을 건너뜁니다.",
	"apply.cannotWrite":
		"플러그인 {id}의 설정을 쓸 수 없습니다. 파일 권한을 확인하세요.",
	"apply.writeFailed": "플러그인 {id}의 data.json을 쓰지 못했습니다: {error}",

	// Installing a plugin (shown in the import summary)
	"install.invalidId": "잘못된 플러그인 ID입니다.",
	"install.invalidIdNamed": "잘못된 플러그인 ID: ‘{id}’.",
	"install.noApi":
		"Obsidian installPlugin API를 사용할 수 없습니다. Obsidian을 업데이트한 후 다시 시도하세요.",
	"install.notInRegistry":
		"Obsidian 커뮤니티 플러그인 목록에서 플러그인 ‘{id}’을(를) 찾을 수 없습니다.",
	"install.badRepoInfo":
		"목록에 있는 플러그인 ‘{id}’의 저장소 정보가 올바르지 않습니다.",
	"install.badRepoFormat": "플러그인 ‘{id}’의 저장소 형식이 올바르지 않습니다: {repo}",
	"install.noPinnedManifest":
		"‘{id}’ {version}의 매니페스트를 가져올 수 없습니다. GitHub에서 요청을 제한하고 있을 수 있습니다.",
	"install.noRelease": "플러그인 ‘{id}’에 맞는 릴리스를 찾을 수 없습니다.",
	"install.badManifest": "‘{id}’의 manifest.json이 올바르지 않습니다.",
	"install.failed": "플러그인 ‘{id}’ 설치 실패: {error}",
	"enable.noApi":
		"플러그인 API에 접근할 수 없습니다. 플러그인을 직접 활성화해야 합니다.",

	// Files and the plugin list
	"file.readFailed": "파일을 읽지 못했습니다: {error}",
	"file.writeFailed": "파일을 쓰지 못했습니다: {error}",
	"file.empty": "{file} 파일이 비어 있습니다. 내용을 추가하지 않으면 파일이 다시 생성됩니다.",
	"file.invalidJson": "{file}의 JSON이 올바르지 않습니다: {error}. 파일 형식을 확인하세요.",
	"list.notArray":
		"{file}에는 플러그인 ID 또는 { id, version } 객체의 배열이 있어야 합니다.",
	"list.skipped": {
		other: "{file}에서 잘못된 항목 {count}개를 건너뛰었습니다. 콘솔을 확인하세요.",
	},

	// Import preview
	"preview.title": "가져오기 미리보기",
	"preview.failed": "미리보기 실패: {error}",
	"preview.listNotFound": "미리보기: {file}을(를) 찾을 수 없습니다.",
	"preview.listInvalidJson": "미리보기: {file}의 JSON이 올바르지 않습니다.",
	"preview.otherDevice": "{devices} 전용으로 지정됨, 이 기기에서는 건너뜀",
	"preview.notOnDevice": "이 기기에는 적용되지 않음",
	"preview.installPinned": "@{version} 설치 예정",
	"preview.installLatest": "설치 예정 (최신 안정 버전)",
	"preview.leftOff": ", 꺼진 상태 유지",
	"preview.alreadyPinned": "이미 고정 버전 {version}",
	"preview.wouldChange": "{from} → {to}(으)로 변경 예정",
	"preview.unknownVersion": "알 수 없음",
	"preview.installedSkip": "이미 설치됨 @{version} (고정 안 됨, 건너뜀)",
	"preview.installedSkipNoVersion": "이미 설치됨 (고정 안 됨, 건너뜀)",
	"preview.settingsMissing": "{file} 없음",
	"preview.noEntry": "설정 항목 없음",
	"preview.blocked": "설정이 있지만 ‘설치 시 설정 적용’이 꺼져 있고 플러그인이 없음",
	"preview.afterInstall": "설치 후 설정 적용 예정",
	"preview.afterRepin": "버전 변경 후 설정 적용 예정",
	"preview.viaApply": "‘설정 적용’ 또는 시작 시 동기화로 적용 예정",
	"preview.changes": { other: " ({count}개 변경)" },
	"preview.matches": " (이미 일치)",
	"preview.showChanges": {
		other: "설정 변경 {count}개 보기",
	},
	"preview.fileNotFound": "{file}을(를) 찾을 수 없습니다.",
	"preview.empty": "목록에 플러그인이 없습니다.",
	"preview.vaultSetupInvalid": "{file}이(가) 올바르지 않음",
	"preview.vaultSetupInvalidJson": "{file}이(가) 올바른 JSON이 아님",
	"preview.badgeInstall": "설치",
	"preview.badgeRepin": "다시 고정",
	"preview.badgeOkPinned": "고정됨",
	"preview.badgeOtherDevice": "다른 기기",
	"preview.badgeSkip": "건너뜀",
	"preview.badgeSettings": "설정",
	"preview.badgeNoSettings": "설정 없음",
	"preview.badgeBlocked": "설정 차단됨",
	"preview.badgeNoFile": "설정 파일 없음",
	"preview.badgeNotHere": "해당 없음",
	"preview.statOtherDevices": "다른 기기",

	// Settings tab
	"settings.warningName": "보안 경고",
	"settings.warningPrefix": "보안 경고: ",
	"settings.warningDesc":
		"이 기능은 커뮤니티 플러그인을 다운로드하고 설치할 수 있습니다. 신뢰할 수 있는 보관소에서만 사용하고, 자동 설치를 켜기 전에 플러그인 목록을 검토하세요.",
	"settings.previewName": "가져오기 미리보기",
	"settings.previewDesc":
		"보관소를 변경하지 않고, 어떤 플러그인이 설치되거나 건너뛰어지거나 업데이트되는지, 어떤 설정이 바뀌는지 확인합니다.",
	"settings.previewButton": "미리보기",
	"settings.exportName": "플러그인 구성 내보내기",
	"settings.exportDesc":
		"설치된 커뮤니티 플러그인과 그 설정을 {dir}의 JSON 파일에 저장합니다.",
	"settings.exportButton": "내보내기",
	"settings.importName": "플러그인 구성 가져오기",
	"settings.importDesc":
		"목록 파일에서 플러그인을 설치합니다. 활성화 및 설정 적용은 아래 옵션을 따릅니다.",
	"settings.importButton": "가져오기",
	"settings.shareName": "내 구성 공유",
	"settings.shareDesc":
		"설치한 플러그인을 골라 비밀 값을 제외하고 보관소에 setup-pack.json으로 저장하여 다른 사람과 공유할 수 있게 합니다.",
	"settings.shareButton": "팩 내보내기",
	"settings.importPackName": "구성 팩 가져오기",
	"settings.importPackDesc":
		"다른 사람의 구성 팩을 링크에서 내 구성에 추가합니다. 설치하기 전에 어떤 내용이 들어 있는지 확인할 수 있습니다.",
	"settings.importPackButton": "링크에서 가져오기",
	"settings.updatesName": "업데이트 확인",
	"settings.updatesDesc":
		"설치된 커뮤니티 플러그인 중 새 버전이 있는 플러그인을 확인하고 업데이트합니다. 플러그인 목록의 고정 버전도 함께 바뀝니다.",
	"settings.updatesButton": "확인",
	"settings.undoName": "마지막 변경 실행 취소",
	"settings.undoDesc":
		"설정 파일과 구성 파일을 마지막 가져오기, 설정 업데이트 또는 내보내기 이전 상태로 되돌립니다. 설치된 플러그인은 그대로 유지됩니다.",
	"settings.undoButton": "실행 취소",
	"settings.applyName": "설정 적용",
	"settings.applyDesc":
		"설치된 플러그인을 다시 설치하지 않고 설정 파일의 내용으로 업데이트합니다.",
	"settings.applyButton": "적용",
	"settings.autoInstallName": "시작 시 플러그인 자동 설치",
	"settings.autoInstallDesc":
		"Obsidian이 시작될 때 목록에 있지만 아직 설치되지 않은 플러그인을 설치합니다.",
	"settings.autoEnableName": "설치 후 플러그인 자동 활성화",
	"settings.autoEnableDesc": "플러그인을 설치한 후 켭니다.",
	"settings.applyOnInstallName": "설치 시 설정 적용",
	"settings.applyOnInstallDesc":
		"플러그인을 설치한 후 설정 파일에서 해당 플러그인의 설정을 적용합니다.",
	"settings.mergeName": "설정을 교체하지 않고 병합",
	"settings.mergeDesc":
		"일치하는 설정은 업데이트하고 나머지는 유지합니다. 끄면 플러그인에 저장된 설정이 완전히 교체됩니다.",
	"settings.syncOnStartupName": "시작할 때마다 설정 동기화",
	"settings.syncOnStartupDesc":
		"Obsidian이 시작될 때마다 설치된 플러그인에 설정 파일을 적용합니다.",
	"settings.mobileName": "모바일에서도 자동 작업 실행",
	"settings.mobileDesc":
		"시작 시 자동 설치와 설정 동기화를 휴대폰과 태블릿에서도 실행합니다. 기본값은 꺼짐이므로, 동기화된 데스크톱 구성 때문에 모바일 데이터로 다운로드가 시작되지 않습니다.",
	"settings.redactName": "내보낼 때 비밀 값 제외",
	"settings.redactDesc":
		"내보낸 설정 파일에서 토큰, 비밀번호, API 키를 자리 표시자로 바꿉니다. 가져올 때 자리 표시자가 실제 값을 덮어쓰지 않습니다.",
	"settings.extraSecretsName": "추가로 제외할 설정 이름",
	"settings.extraSecretsDesc":
		"함께 제외할 설정 이름을 쉼표로 구분하여 입력합니다. 예: licenseCode, endpoint",
	"settings.extraSecretsPlaceholder": "licenseCode, endpoint",
	"settings.syncVaultSetupName": "테마, 스니펫, 단축키, 코어 플러그인 동기화",
	"settings.syncVaultSetupDesc":
		"내보내기 시 커뮤니티 테마, CSS 스니펫, 사용자 지정 단축키, 켜져 있는 코어 플러그인을 vault-setup.json에 저장합니다. 가져오기 시 다른 기기에 적용합니다.",
	"settings.logLevelName": "로그 수준",
	"settings.logLevelDesc":
		"문제가 생겼을 때 콘솔에 표시할 세부 정보의 양입니다. 문제를 해결하는 중이 아니라면 ‘오류’로 두세요.",
	"settings.logDebug": "디버그 (가장 자세함)",
	"settings.logInfo": "정보",
	"settings.logWarn": "경고",
	"settings.logError": "오류 (권장)",
	"settings.logNone": "없음",
};
