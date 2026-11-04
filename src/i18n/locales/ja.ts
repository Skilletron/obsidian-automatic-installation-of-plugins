import type { LocaleMessages } from "../index";

export const ja: LocaleMessages = {
	// Commands
	"cmd.export": "プラグイン構成をJSONにエクスポート",
	"cmd.preview": "プラグイン構成のインポートをプレビュー",
	"cmd.import": "JSONからプラグイン構成をインポート",
	"cmd.apply": "JSONから設定を適用",
	"cmd.exportPack": "共有用セットアップパックをエクスポート",
	"cmd.importPack": "リンクからセットアップパックをインポート",
	"cmd.checkUpdates": "プラグインのアップデートを確認",
	"cmd.undo": "直前のインポート・エクスポート・設定変更を元に戻す",

	// Shared
	"common.unknownError": "不明なエラー",
	"common.close": "閉じる",
	"common.cancel": "キャンセル",
	"common.busy": "別のインポート、エクスポート、または設定の更新がすでに実行中です。",
	"common.startupFailed": "起動時のインストールに失敗しました。詳細はコンソールを確認してください。",
	"common.and": "と",
	"device.desktop": "デスクトップ",
	"device.mobile": "モバイル",
	"progress.step": "{current}/{total} · {detail}",
	"net.rateLimit":
		"GitHubのレート制限に達したか、アクセスが拒否されました。数分待ってから再試行してください。",

	// Import
	"import.title": "プラグイン構成をインポート中",
	"import.finished": "インポートが完了しました",
	"import.finishedProblems": "インポートは完了しましたが、問題がありました",
	"import.failed": "インポートに失敗しました",
	"import.createdEmpty":
		"空の{file}を作成しました。プラグインIDを追加してから、もう一度インポートしてください。",
	"import.cannotCreate": "{file}を作成できません。ファイルの権限を確認してください。",
	"import.empty": "{file}が空です。プラグインIDを追加してから、もう一度インポートしてください。",
	"import.invalidJson": "{file}のJSONが無効です: {error}。",
	"import.noPlugins": "インストールするプラグインがありません。",
	"import.notForMobile": "リストにこのモバイルデバイス向けのプラグインがありません。",
	"import.notForDesktop": "リストにこのデスクトップデバイス向けのプラグインがありません。",
	"import.installing": "{label}をインストール中",
	"import.turningOn": "{id}を有効化中",
	"import.couldNotEnable": "有効化できませんでした: {ids}。",
	"import.autoEnableOff": "自動有効化がオフのため、新しいプラグインは無効のままです。",
	"import.skippedDesktopOnly": {
		other: "このデバイスではデスクトップ専用のプラグイン{count}個をスキップしました。",
	},
	"import.otherDevices": {
		other: "{count}個のプラグインは他のデバイス専用として登録されています。",
	},
	"import.keptOff": "リストの指定どおり、{count}個を無効のままにしました。",
	"import.changed": {
		other: "{count}個のプラグインをインストールまたは更新しました",
	},
	"import.upToDate": "すべて最新の状態でした",
	"import.summary": "{summary}（{total}件中{ok}件成功）。",
	"import.error": "{error}。詳細はコンソールを確認してください。",

	// Vault setup (theme, snippets, hotkeys, core plugins)
	"vaultSetup.invalid": "{file}が無効なため、スキップしました。",
	"vaultSetup.applying": "テーマ、スニペット、ホットキー、コアプラグインを適用中",
	"vaultSetup.snippetsWritten": {
		other: "{count}個のCSSスニペットを追加または更新しました。",
	},
	"vaultSetup.hotkeysSet": {
		other: "{count}個のコマンドにホットキーを設定しました。",
	},
	"vaultSetup.corePlugins": "コアプラグイン: 有効化 {on}、無効化 {off}。",
	"vaultSetup.themeDefault": "デフォルトのテーマに切り替えました",
	"vaultSetup.themeInstalled": "テーマ{name} {version}をインストールしました",
	"vaultSetup.themeSwitched": "テーマ{name}に切り替えました",
	"vaultSetup.noHotkeyManager": "Obsidianのホットキーマネージャーを利用できません。",
	"vaultSetup.noCoreManager": "Obsidianのコアプラグインマネージャーを利用できません。",
	"vaultSetup.noThemeManager": "Obsidianのテーママネージャーを利用できません。",
	"vaultSetup.snippetFailed": "スニペット「{name}」を書き込めませんでした。",
	"vaultSetup.themeFailed": "テーマ「{name}」をインストールできませんでした。",
	"vaultSetup.defaultThemeLabel": "デフォルトのテーマ",
	"vaultSetup.describeThemeSame": "テーマ: すでに{label}を使用中",
	"vaultSetup.describeThemeSwitch": "テーマ: {label}に切り替え予定",
	"vaultSetup.describeSnippets":
		"スニペット: {total}個（新規 {added}、変更 {changed}、変更なし {unchanged}）",
	"vaultSetup.describeHotkeys": "ホットキー: {total}個のコマンド（{changed}個が変更予定）",
	"vaultSetup.describeCore": "コアプラグイン: 有効化予定 {on}、無効化予定 {off}",
	"vaultSetup.describeCoreSame": "コアプラグイン: すでにリストどおり",

	// Export
	"export.finished": "エクスポートが完了しました",
	"export.failed": "エクスポートに失敗しました",
	"export.saved": {
		other: "{count}個のプラグイン（バージョン固定 {pinned}、設定あり {withSettings}）を{listFile}と{settingsFile}に保存しました。",
	},
	"export.kept": {
		other: "このデバイスにインストールされていないプラグインのエントリ{count}件を残しました。",
	},
	"export.redacted": {
		other: "秘密の値{count}件（トークン、パスワード）を除外しました。",
	},
	"export.snippets": { other: "{count}個のCSSスニペット" },
	"export.hotkeys": {
		other: "{count}個のカスタムホットキー",
	},
	"export.vaultSetup":
		"{theme}、{snippets}、{hotkeys}、コアプラグインの状態も{file}に保存しました。",
	"export.writeFailed": "構成のJSONファイルを書き込めませんでした",

	// Setup packs
	"pack.name": "{vault}のセットアップ",
	"pack.savedTitle": "セットアップパックを保存しました",
	"pack.savedSecrets": {
		other: "秘密の値{count}件を除外しました。",
	},
	"pack.savedBody": {
		other: "保管庫内の{file}には{count}個のプラグインが含まれています。{secrets}このファイルを共有すると（例: GitHub gistとして）、他の人は「リンクからセットアップパックをインポート」で利用できます。",
	},
	"pack.notSavedTitle": "セットアップパックを保存できませんでした",
	"pack.writeFailed": "{file}を書き込めませんでした",
	"pack.loadFailedTitle": "セットアップパックを読み込めませんでした",
	"pack.httpsOnly": "読み込めるのはhttpsリンクのみです",
	"pack.notFound": "{path}がこの保管庫に見つかりません",
	"pack.notPackTitle": "セットアップパックではありません",
	"pack.notPackBody":
		"このファイルは「共有用セットアップパックをエクスポート」で作成されたセットアップパックではありません。",
	"pack.notAddedTitle": "セットアップパックは追加されませんでした",
	"pack.linkTitle": "セットアップパックをインポート",
	"pack.linkDesc":
		"セットアップパックへのWebリンク（GitHub gistやGitHub上のファイルも可）、またはこの保管庫内のパックファイルのパスを貼り付けてください。次の画面で確定するまで、何もインストールされません。",
	"pack.linkName": "リンクまたはパス",
	"pack.linkPlaceholder": "リンクまたは保管庫内のパス",
	"pack.load": "読み込む",
	"pack.defaultName": "セットアップパック",
	"pack.from": "取得元: {source}",
	"pack.warning":
		"コミュニティプラグインはノートを読み取り、変更できます。このパックの作成者を信頼できる場合にのみ続行してください。",
	"pack.pluginCount": {
		other: "{count}個のプラグイン（設定あり {withSettings}）",
	},
	"pack.devicesOnly": "（{devices}のみ）",
	"pack.staysOff": "（無効のまま）",
	"pack.hasSettings": " · 設定",
	"pack.explain":
		"パックはあなたのプラグインリストと設定ファイルに追加され（両方に項目がある場合はパックが優先されます）、その後インポートが実行されます。「直前の変更を元に戻す」でファイルを元に戻せます。",
	"pack.confirm": "自分の構成に追加してインポート",

	// Updates
	"updates.checking": "プラグインのアップデートを確認中",
	"updates.checkFinished": "アップデートの確認が完了しました",
	"updates.found": {
		other: "{count}個のプラグインにアップデートがあります。",
	},
	"updates.none": "すべてのコミュニティプラグインは最新です。",
	"updates.checkFailed": "アップデートの確認に失敗しました",
	"updates.updating": "プラグインを更新中",
	"updates.step": "{id}を{version}に更新中",
	"updates.updated": {
		other: "{count}個中{done}個のプラグインを更新しました。",
	},
	"updates.pinsMoved": {
		other: "{file}内の固定バージョン{count}件を更新しました。",
	},
	"updates.finished": "更新が完了しました",
	"updates.finishedProblems": "更新は完了しましたが、問題がありました",
	"updates.failed": "更新に失敗しました",
	"updates.modalTitle": "プラグインのアップデート",
	"updates.update": "更新",
	"updates.updateAll": "すべて更新（{count}）",
	"updates.installed": "インストール済み: {version}",
	"updates.needsApp": "{version}にはObsidian {minApp}が必要です",
	"updates.pinToo": "プラグインリスト内の固定バージョン（{version}）も更新されます",

	// Undo
	"undo.nothingTitle": "元に戻す操作はありません",
	"undo.nothingBody": "元に戻せる「インポート」「設定を適用」「エクスポート」はありません。",
	"undo.incompleteTitle": "元に戻す操作が完了しませんでした",
	"undo.incompleteBody":
		"{total}個中{restored}個のファイルを復元しました。バックアップは保持されています。詳細はコンソールを確認してください。",
	"undo.doneTitle": "{reason}を元に戻しました",
	"undo.doneBody": {
		other: "{date}の状態から{count}個のファイルを復元しました。{reload}",
	},
	"undo.reload": "設定を閉じると、プラグインが再読み込みされます。",
	"undo.failed": "元に戻せませんでした",
	"reason.import": "インポート",
	"reason.export": "エクスポート",
	"reason.apply": "設定の適用",
	"reason.update": "プラグインの更新",
	"reason.pack": "セットアップパックのインポート",
	"reason.settings": "設定の変更",

	// Apply settings
	"apply.title": "プラグイン設定を適用中",
	"apply.none": "設定は書き込まれませんでした。",
	"apply.done": "設定を適用しました",
	"apply.plugins": { other: "{count}個のプラグイン" },
	"apply.deferred": {
		other: "{plugins}を更新しました。実行中の{count}個のプラグインは、設定を閉じると再読み込みされます。",
	},
	"apply.restarted": "{plugins}を更新しました（{restarted}個を再読み込み）。",
	"apply.updated": "{plugins}を更新しました。",
	"apply.failed": "設定の適用に失敗しました",
	"apply.fsError": "ファイルシステムにアクセスできません: {error}",
	"apply.noSettingsFile": "{file}が見つからないため、設定の適用をスキップします。",
	"apply.cannotWrite":
		"プラグイン{id}の設定を書き込めません。ファイルの権限を確認してください。",
	"apply.writeFailed": "プラグイン{id}のdata.jsonの書き込みに失敗しました: {error}",

	// Installing a plugin (shown in the import summary)
	"install.invalidId": "無効なプラグインIDが指定されました。",
	"install.invalidIdNamed": "無効なプラグインID: 「{id}」。",
	"install.noApi":
		"ObsidianのinstallPlugin APIを利用できません。Obsidianを更新してから再試行してください。",
	"install.notInRegistry":
		"プラグイン「{id}」がObsidianのコミュニティプラグイン一覧に見つかりません。",
	"install.badRepoInfo":
		"プラグイン「{id}」の一覧上のリポジトリ情報が無効です。",
	"install.badRepoFormat": "プラグイン「{id}」のリポジトリ形式が無効です: {repo}",
	"install.noPinnedManifest":
		"「{id}」{version}のマニフェストを取得できませんでした。GitHubがリクエストを制限している可能性があります。",
	"install.noRelease": "プラグイン「{id}」に適したリリースが見つかりません。",
	"install.badManifest": "「{id}」のmanifest.jsonが無効です。",
	"install.failed": "プラグイン「{id}」のインストールに失敗しました: {error}",
	"enable.noApi":
		"プラグインAPIにアクセスできません。プラグインを手動で有効化する必要があります。",

	// Files and the plugin list
	"file.readFailed": "ファイルの読み込みに失敗しました: {error}",
	"file.writeFailed": "ファイルの書き込みに失敗しました: {error}",
	"file.empty": "{file}が空です。内容を追加してください。追加しない場合、ファイルは再作成されます。",
	"file.invalidJson": "{file}のJSONが無効です: {error}。ファイルの形式を確認してください。",
	"list.notArray":
		"{file}には、プラグインIDまたは{ id, version }オブジェクトの配列が必要です。",
	"list.skipped": {
		other: "{file}内の無効なエントリ{count}件をスキップしました。コンソールを確認してください。",
	},

	// Import preview
	"preview.title": "インポートのプレビュー",
	"preview.failed": "プレビューに失敗しました: {error}",
	"preview.listNotFound": "プレビュー: {file}が見つかりません。",
	"preview.listInvalidJson": "プレビュー: {file}のJSONが無効です。",
	"preview.otherDevice": "{devices}専用のため、このデバイスではスキップ",
	"preview.notOnDevice": "このデバイスには適用されません",
	"preview.installPinned": "@{version}をインストール予定",
	"preview.installLatest": "インストール予定（最新の安定版）",
	"preview.leftOff": "、無効のまま",
	"preview.alreadyPinned": "すでに固定バージョン{version}です",
	"preview.wouldChange": "{from} → {to}に変更予定",
	"preview.unknownVersion": "不明",
	"preview.installedSkip": "インストール済み @{version}（固定なし、スキップ）",
	"preview.installedSkipNoVersion": "インストール済み（固定なし、スキップ）",
	"preview.settingsMissing": "{file}がありません",
	"preview.noEntry": "設定のエントリなし",
	"preview.blocked": "設定はありますが、「インストール時に設定を適用」がオフで、プラグインもありません",
	"preview.afterInstall": "インストール後に設定を適用予定",
	"preview.afterRepin": "バージョン変更後に設定を適用予定",
	"preview.viaApply": "「設定を適用」または起動時の同期で適用予定",
	"preview.changes": { other: "（{count}件の変更）" },
	"preview.matches": "（すでに一致）",
	"preview.showChanges": {
		other: "{count}件の設定変更を表示",
	},
	"preview.fileNotFound": "{file}が見つかりませんでした。",
	"preview.empty": "リストにプラグインがありません。",
	"preview.vaultSetupInvalid": "{file}が無効です",
	"preview.vaultSetupInvalidJson": "{file}は有効なJSONではありません",
	"preview.badgeInstall": "インストール",
	"preview.badgeRepin": "再固定",
	"preview.badgeOkPinned": "固定済み",
	"preview.badgeOtherDevice": "他のデバイス",
	"preview.badgeSkip": "スキップ",
	"preview.badgeSettings": "設定",
	"preview.badgeNoSettings": "設定なし",
	"preview.badgeBlocked": "設定ブロック",
	"preview.badgeNoFile": "設定ファイルなし",
	"preview.badgeNotHere": "対象外",
	"preview.statOtherDevices": "他のデバイス",

	// Settings tab
	"settings.warningName": "セキュリティ警告",
	"settings.warningPrefix": "セキュリティ警告: ",
	"settings.warningDesc":
		"この機能はコミュニティプラグインをダウンロードしてインストールできます。信頼できる保管庫でのみ使用し、自動インストールを有効にする前にプラグインリストを確認してください。",
	"settings.previewName": "インポートをプレビュー",
	"settings.previewDesc":
		"保管庫を変更せずに、どのプラグインがインストール、スキップ、更新されるか、どの設定が変わるかを確認します。",
	"settings.previewButton": "プレビュー",
	"settings.exportName": "プラグイン構成をエクスポート",
	"settings.exportDesc":
		"インストール済みのコミュニティプラグインとその設定を、{dir}内のJSONファイルに保存します。",
	"settings.exportButton": "エクスポート",
	"settings.importName": "プラグイン構成をインポート",
	"settings.importDesc":
		"リストファイルからプラグインをインストールします。有効化と設定の適用は、以下のオプションに従います。",
	"settings.importButton": "インポート",
	"settings.shareName": "構成を共有",
	"settings.shareDesc":
		"インストール済みのものをすべて、秘密の値を除いてsetup-pack.jsonとして保管庫に保存し、他の人と共有できるようにします。",
	"settings.shareButton": "パックをエクスポート",
	"settings.importPackName": "セットアップパックをインポート",
	"settings.importPackDesc":
		"他の人のセットアップパックをリンクから自分の構成に追加します。インストールする前に内容を確認できます。",
	"settings.importPackButton": "リンクからインポート",
	"settings.updatesName": "アップデートを確認",
	"settings.updatesDesc":
		"インストール済みのコミュニティプラグインに新しいバージョンがあるか確認し、更新します。プラグインリスト内の固定バージョンも合わせて更新されます。",
	"settings.updatesButton": "確認",
	"settings.undoName": "直前の変更を元に戻す",
	"settings.undoDesc":
		"設定ファイルと構成ファイルを、直前のインポート、設定の更新、エクスポートの前の状態に戻します。インストール済みのプラグインはそのまま残ります。",
	"settings.undoButton": "元に戻す",
	"settings.applyName": "設定を適用",
	"settings.applyDesc":
		"インストール済みのプラグインを再インストールせずに、設定ファイルから更新します。",
	"settings.applyButton": "適用",
	"settings.autoInstallName": "起動時にプラグインを自動インストール",
	"settings.autoInstallDesc":
		"Obsidianの起動時に、リスト内でまだインストールされていないプラグインをインストールします。",
	"settings.autoEnableName": "インストール後にプラグインを自動で有効化",
	"settings.autoEnableDesc": "インストール後にプラグインを有効化します。",
	"settings.applyOnInstallName": "インストール時に設定を適用",
	"settings.applyOnInstallDesc":
		"プラグインのインストール後、設定ファイルからその設定を適用します。",
	"settings.mergeName": "設定を置き換えずにマージ",
	"settings.mergeDesc":
		"一致する設定を更新し、それ以外は保持します。オフの場合、プラグインの保存済み設定は完全に置き換えられます。",
	"settings.syncOnStartupName": "起動のたびに設定を同期",
	"settings.syncOnStartupDesc":
		"Obsidianの起動のたびに、設定ファイルをインストール済みのプラグインに適用します。",
	"settings.mobileName": "モバイルでも自動処理を実行",
	"settings.mobileDesc":
		"起動時の自動インストールと設定の同期を、スマートフォンやタブレットでも実行します。デフォルトはオフのため、同期されたデスクトップの構成によってモバイルデータ通信でダウンロードが始まることはありません。",
	"settings.redactName": "エクスポート時に秘密の値を除外",
	"settings.redactDesc":
		"エクスポートした設定ファイル内のトークン、パスワード、APIキーをプレースホルダーに置き換えます。インポート時に、プレースホルダーで実際の値が上書きされることはありません。",
	"settings.extraSecretsName": "追加で除外する設定名",
	"settings.extraSecretsDesc":
		"同様に除外する設定名をカンマ区切りで指定します。例: licenseCode, endpoint",
	"settings.extraSecretsPlaceholder": "licenseCode, endpoint",
	"settings.syncVaultSetupName": "テーマ、スニペット、ホットキー、コアプラグインを同期",
	"settings.syncVaultSetupDesc":
		"エクスポート時に、コミュニティテーマ、CSSスニペット、カスタムホットキー、有効なコアプラグインをvault-setup.jsonに保存します。インポート時に、それらを別のデバイスに適用します。",
	"settings.logLevelName": "ログレベル",
	"settings.logLevelDesc":
		"問題が発生したときにコンソールに表示する情報の詳しさです。トラブルシューティング中でなければ「エラー」のままにしてください。",
	"settings.logDebug": "デバッグ（最も詳細）",
	"settings.logInfo": "情報",
	"settings.logWarn": "警告",
	"settings.logError": "エラー（推奨）",
	"settings.logNone": "なし",
};
